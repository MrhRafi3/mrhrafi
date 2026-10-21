import dotenv from 'dotenv';
import ContextDev from 'context.dev';

dotenv.config();

export interface ScrapeFormats {
  markdown?: boolean;
  html?: boolean;
  screenshot?: boolean;
  images?: boolean;
  bytes?: boolean;
  parse?: boolean;
  highlights?: boolean;
  json?: boolean;
  product?: boolean;
}

export interface ScrapeSharedParams {
  mainContentOnly?: boolean;
  theme?: 'light' | 'dark';
  waitFor?: string | number;
  browserActions?: Array<Record<string, unknown>>;
  headers?: Record<string, string>;
}

export interface ScrapeRequestOptions {
  url: string;
  formats?: ScrapeFormats;
  sharedParams?: ScrapeSharedParams;
  maxAgeMs?: number;
}

export interface ScrapeOutput<T = unknown> {
  requested: boolean;
  success: boolean | null;
  data: T | null;
  error_code?: string;
  message?: string;
}

export interface PageMetadata {
  title?: string;
  description?: string;
  language?: string;
  canonical?: string;
  og?: Record<string, unknown>;
  author?: string;
}

export interface ScrapeResponse {
  url: string;
  markdown?: ScrapeOutput<string>;
  html?: ScrapeOutput<string>;
  screenshot?: ScrapeOutput<string>;
  images?: ScrapeOutput<unknown[]>;
  metadata?: PageMetadata;
  cache_metadata?: {
    status: 'hit' | 'miss';
    age_ms: number;
  };
  request_id?: string;
  key_metadata?: {
    credits_consumed?: number;
  };
}

export interface BrandSummary {
  name: string;
  domain: string;
  description?: string;
  country?: string;
  primary_language?: string;
  icon?: string;
  logo?: string;
}

export interface BrandSearchResponse {
  brands: BrandSummary[];
  request_id?: string;
  key_metadata?: {
    credits_consumed?: number;
  };
}

export interface StyleguideResponse {
  domain?: string;
  styleguide?: {
    colors?: Record<string, unknown>;
    typography?: Record<string, unknown>;
    spacing?: Record<string, unknown>;
    shadows?: Record<string, unknown>;
  };
  request_id?: string;
}

export interface AgentFeedbackPayload {
  category: 'bug' | 'docs_mismatch' | 'friction' | 'feature_gap' | 'quality_degradation' | 'other';
  note: string;
  request_id?: string;
  url?: string;
}

export interface ContextDevErrorDetails {
  status: number;
  message: string;
  errorCode?: string;
  requestId?: string;
  url: string;
}

export class ContextDevApiError extends Error {
  public readonly status: number;
  public readonly errorCode?: string;
  public readonly requestId?: string;
  public readonly endpoint: string;

  constructor(details: ContextDevErrorDetails) {
    super(`Context.dev API error [${details.status}${details.errorCode ? ` - ${details.errorCode}` : ''}] at ${details.url}: ${details.message}`);
    this.name = 'ContextDevApiError';
    this.status = details.status;
    this.errorCode = details.errorCode;
    this.requestId = details.requestId;
    this.endpoint = details.url;
  }
}

export class ContextDevService {
  private apiKey: string;
  private baseURL: string;
  private sdkClient: ContextDev;

  constructor(apiKey?: string, baseURL = 'https://api.context.dev/v1') {
    const resolvedKey = apiKey || process.env.CONTEXT_DEV_API_KEY;
    if (!resolvedKey) {
      throw new Error(
        'CONTEXT_DEV_API_KEY is not set. Please configure CONTEXT_DEV_API_KEY in your environment or .env file.'
      );
    }
    this.apiKey = resolvedKey;
    this.baseURL = baseURL.replace(/\/+$/, '');
    this.sdkClient = new ContextDev({ apiKey: this.apiKey, baseURL: this.baseURL });
  }

  /**
   * Internal resilient HTTP dispatcher honoring rate limits (429 Retry-After)
   * and transient network/server faults (408/5xx backoff).
   * Validation / client errors (400, 401, 402, 403, 404, 422) are never retried.
   */
  private async requestWithRetry<T>(
    endpointPath: string,
    options: {
      method: 'GET' | 'POST';
      body?: unknown;
      queryParams?: Record<string, string | number | boolean | undefined>;
    },
    maxRetries = 3
  ): Promise<T> {
    const url = new URL(`${this.baseURL}${endpointPath}`);
    if (options.queryParams) {
      for (const [key, val] of Object.entries(options.queryParams)) {
        if (val !== undefined && val !== null) {
          url.searchParams.append(key, String(val));
        }
      }
    }

    let attempt = 0;
    while (attempt <= maxRetries) {
      let response: Response;
      try {
        response = await fetch(url.toString(), {
          method: options.method,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });
      } catch (networkErr: unknown) {
        attempt++;
        if (attempt > maxRetries) {
          throw networkErr;
        }
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      if (response.ok) {
        return (await response.json()) as T;
      }

      // Handle 429 Rate Limiting
      if (response.status === 429) {
        const retryAfterHeader = response.headers.get('retry-after');
        let delayMs = 2000;
        if (retryAfterHeader) {
          const parsedSeconds = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsedSeconds) && parsedSeconds > 0) {
            delayMs = Math.min(parsedSeconds * 1000, 15000);
          }
        }
        attempt++;
        if (attempt > maxRetries) {
          const errBody = await response.text();
          throw new ContextDevApiError({
            status: 429,
            message: `Rate limit exceeded. Exceeded ${maxRetries} retries: ${errBody}`,
            requestId: response.headers.get('x-request-id') ?? undefined,
            url: url.pathname,
          });
        }
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        continue;
      }

      // Handle 408 Request Timeout & 5xx Transient Server Errors
      if (response.status === 408 || (response.status >= 500 && response.status <= 599)) {
        attempt++;
        if (attempt > maxRetries) {
          const errBody = await response.text();
          throw new ContextDevApiError({
            status: response.status,
            message: `Server returned ${response.status} and max retries were exhausted: ${errBody}`,
            requestId: response.headers.get('x-request-id') ?? undefined,
            url: url.pathname,
          });
        }
        const backoffMs = Math.min(500 * Math.pow(2, attempt - 1), 5000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      // Client errors (400, 401, 402, 403, 404, 422) - NEVER retry
      let parsedError: { message?: string; error_code?: string; request_id?: string } = {};
      try {
        parsedError = (await response.json()) as { message?: string; error_code?: string; request_id?: string };
      } catch {
        parsedError = { message: await response.text() };
      }

      throw new ContextDevApiError({
        status: response.status,
        message: parsedError.message || `HTTP ${response.status} error`,
        errorCode: parsedError.error_code,
        requestId: parsedError.request_id || response.headers.get('x-request-id') || undefined,
        url: url.pathname,
      });
    }

    throw new Error(`Unexpected failure after ${maxRetries} retries.`);
  }

  /**
   * Scrape a URL for markdown, metadata, screenshots, or structured contents.
   * Documentation: https://docs.context.dev/api-reference/web-scraping/scrape
   */
  public async scrape(params: ScrapeRequestOptions): Promise<ScrapeResponse> {
    const payload: Record<string, unknown> = {
      url: params.url,
      formats: params.formats || { markdown: true },
    };

    if (params.sharedParams) {
      payload.sharedParams = params.sharedParams;
    }
    if (params.maxAgeMs !== undefined) {
      payload.maxAgeMs = params.maxAgeMs;
    }

    return this.requestWithRetry<ScrapeResponse>('/web/scrape', {
      method: 'POST',
      body: payload,
    });
  }

  /**
   * Search brands by company name or domain prefix.
   * Documentation: https://docs.context.dev/api-reference/brand-intelligence/search
   */
  public async searchBrands(query: string, options?: { country?: string; maxAgeMs?: number }): Promise<BrandSearchResponse> {
    const queryParams: Record<string, string | number | undefined> = {
      query,
    };
    if (options?.country) {
      queryParams.country = options.country;
    }
    if (options?.maxAgeMs !== undefined) {
      queryParams.maxAgeMs = options.maxAgeMs;
    }

    return this.requestWithRetry<BrandSearchResponse>('/brand/search', {
      method: 'GET',
      queryParams,
    });
  }

  /**
   * Extract website styleguide (colors, typography, fonts).
   * Documentation: https://docs.context.dev/api-reference/brand-intelligence/styleguide
   */
  public async extractStyleguide(
    domain: string,
    options?: { colorScheme?: 'light' | 'dark'; maxAgeMs?: number }
  ): Promise<StyleguideResponse> {
    // Uses SDK where available with fallback to REST
    try {
      const sdkResult = await this.sdkClient.web.extractStyleguide({
        domain,
        colorScheme: options?.colorScheme === 'dark' ? 'dark' : 'light',
      });
      return sdkResult as unknown as StyleguideResponse;
    } catch {
      // Fallback to REST GET /web/styleguide
      return this.requestWithRetry<StyleguideResponse>('/web/styleguide', {
        method: 'GET',
        queryParams: {
          domain,
          colorScheme: options?.colorScheme || 'light',
          maxAgeMs: options?.maxAgeMs,
        },
      });
    }
  }

  /**
   * Submit agent feedback when an API call or documentation differs from behavior.
   * Documentation: https://docs.context.dev/optimization/agent-feedback
   * Costs 0 credits.
   */
  public async submitFeedback(feedback: AgentFeedbackPayload): Promise<{ feedback_id: string; already_submitted?: boolean }> {
    return this.requestWithRetry<{ feedback_id: string; already_submitted?: boolean }>('/feedback', {
      method: 'POST',
      body: feedback,
    });
  }
}

// Export lazy/default instance
let defaultServiceInstance: ContextDevService | null = null;
export function getContextDevService(): ContextDevService {
  if (!defaultServiceInstance) {
    defaultServiceInstance = new ContextDevService();
  }
  return defaultServiceInstance;
}
