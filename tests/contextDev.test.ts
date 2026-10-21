import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { ContextDevService, ContextDevApiError } from '../src/services/contextDev.js';

describe('ContextDevService (Mocked - 0 Live API Credits Used)', () => {
  const originalFetch = globalThis.fetch;
  const mockApiKey = 'ctxt_secret_test_mock_key_12345';

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('throws error if API key is missing', () => {
    const originalEnv = process.env.CONTEXT_DEV_API_KEY;
    delete process.env.CONTEXT_DEV_API_KEY;

    try {
      assert.throws(() => new ContextDevService(''), {
        message: /CONTEXT_DEV_API_KEY is not set/,
      });
    } finally {
      process.env.CONTEXT_DEV_API_KEY = originalEnv;
    }
  });

  test('successfully executes scrape request and maps response', async () => {
    const mockResponsePayload = {
      url: 'https://example.com',
      markdown: {
        requested: true,
        success: true,
        data: '# Example Domain\n\nThis is an example test.',
      },
      metadata: {
        title: 'Example Domain',
        description: 'Mocked domain description',
      },
      request_id: 'test-req-scrape-1',
    };

    globalThis.fetch = async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = url.toString();
      assert.ok(urlStr.includes('/web/scrape'), `Expected /web/scrape, got ${urlStr}`);
      assert.equal(init?.method, 'POST');

      const headers = init?.headers as Record<string, string>;
      assert.equal(headers['Authorization'], `Bearer ${mockApiKey}`);

      const body = JSON.parse(init?.body as string);
      assert.equal(body.url, 'https://example.com');
      assert.equal(body.formats.markdown, true);

      return new Response(JSON.stringify(mockResponsePayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const service = new ContextDevService(mockApiKey);
    const result = await service.scrape({
      url: 'https://example.com',
      formats: { markdown: true },
    });

    assert.equal(result.url, 'https://example.com');
    assert.equal(result.metadata?.title, 'Example Domain');
    assert.equal(result.markdown?.success, true);
    assert.equal(result.markdown?.data, '# Example Domain\n\nThis is an example test.');
    assert.equal(result.request_id, 'test-req-scrape-1');
  });

  test('successfully executes brand search request and maps response', async () => {
    const mockBrandPayload = {
      brands: [
        {
          name: 'GitHub',
          domain: 'github.com',
          description: 'Development platform',
        },
      ],
      request_id: 'test-req-brand-1',
    };

    globalThis.fetch = async (url: string | URL | Request, init?: RequestInit) => {
      const urlStr = url.toString();
      assert.ok(urlStr.includes('/brand/search?query=github'), `Expected /brand/search with query, got ${urlStr}`);
      assert.equal(init?.method, 'GET');

      return new Response(JSON.stringify(mockBrandPayload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const service = new ContextDevService(mockApiKey);
    const result = await service.searchBrands('github');

    assert.equal(result.brands.length, 1);
    assert.equal(result.brands[0].name, 'GitHub');
    assert.equal(result.brands[0].domain, 'github.com');
    assert.equal(result.request_id, 'test-req-brand-1');
  });

  test('honors Retry-After on HTTP 429 and retries successfully', async () => {
    let callCount = 0;

    globalThis.fetch = async () => {
      callCount++;
      if (callCount === 1) {
        return new Response(JSON.stringify({ error_code: 'RATE_LIMITED', message: 'Rate limit reached' }), {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '1', // 1 second
          },
        });
      }

      return new Response(
        JSON.stringify({
          url: 'https://example.com',
          markdown: { requested: true, success: true, data: '# Ok' },
          request_id: 'req-429-success',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    const service = new ContextDevService(mockApiKey);
    const result = await service.scrape({ url: 'https://example.com' });

    assert.equal(callCount, 2);
    assert.equal(result.request_id, 'req-429-success');
  });

  test('retries transient 503 error with backoff and succeeds', async () => {
    let callCount = 0;

    globalThis.fetch = async () => {
      callCount++;
      if (callCount === 1) {
        return new Response('Service Unavailable', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' },
        });
      }

      return new Response(
        JSON.stringify({
          brands: [{ name: 'Stripe', domain: 'stripe.com' }],
          request_id: 'req-503-success',
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    const service = new ContextDevService(mockApiKey);
    const result = await service.searchBrands('stripe');

    assert.equal(callCount, 2);
    assert.equal(result.brands[0].name, 'Stripe');
  });

  test('never retries 400 validation error and immediately throws ContextDevApiError', async () => {
    let callCount = 0;

    globalThis.fetch = async () => {
      callCount++;
      return new Response(
        JSON.stringify({
          error_code: 'INVALID_URL',
          message: 'Malformed target URL provided',
          request_id: 'req-bad-input',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    };

    const service = new ContextDevService(mockApiKey);
    await assert.rejects(
      async () => {
        await service.scrape({ url: 'bad-url' });
      },
      (err: Error) => {
        assert.ok(err instanceof ContextDevApiError);
        assert.equal(err.status, 400);
        assert.equal(err.errorCode, 'INVALID_URL');
        assert.equal(err.requestId, 'req-bad-input');
        return true;
      }
    );

    // Assert it was NOT retried
    assert.equal(callCount, 1);
  });
});
