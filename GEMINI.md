# Agent Guidelines & Context.dev Integration Standards

This project integrates **Context.dev** to power a dynamic **Portfolio Website**, enriching project case studies with live website/repo data and verifying client/partner brand intelligence.

## Environment Variables & Secrets
- `CONTEXT_DEV_API_KEY`: The master secret key for Context.dev API calls.
  - Stored exclusively in `.env` (and `.env.local`).
  - **CRITICAL**: The API key is a server-side secret. Never hardcode it, never log it, and never allow it to be exposed to client-side bundles or browser code.
  - Rotations and dashboard: https://www.context.dev/dashboard/api-keys

## Server-Side Wrapper Module
All Context.dev API calls are strictly routed through the singleton wrapper module:
- **Module File**: [`src/services/contextDev.ts`](file:///Users/rafi/Programing/new_web/src/services/contextDev.ts)
- **High-level Portfolio Service**: [`src/services/portfolioService.ts`](file:///Users/rafi/Programing/new_web/src/services/portfolioService.ts)

### Reliability & Error Handling Rules
1. **Rate Limiting (429)**: The wrapper honors the `Retry-After` HTTP header and waits before bounded retries.
2. **Transient Failures (408 / 5xx)**: Retries with exponential backoff and jitter (up to 3 retries).
3. **Client / Validation Errors (400, 401, 402, 403, 404, 422)**: Never retried; immediately throws `ContextDevApiError` with `errorCode` and `requestId`.
4. **Caching & Freshness**: Most endpoints serve cached results by default. Pass `maxAgeMs: 0` explicitly when real-time fresh data is strictly required.

## Selected Endpoints for Portfolio Website

| Endpoint | Method | Cost | Purpose in Portfolio Website | Documentation Link |
|---|---|---|---|---|
| **Scrape** | `POST /web/scrape` | From 1 credit | Scrapes project URLs / GitHub repos to dynamically populate project cards with real titles, descriptions, and Markdown summaries. | [Scrape Docs](https://docs.context.dev/api-reference/web-scraping/scrape) |
| **Search Brands** | `GET /brand/search` | 1 credit | Discovers and validates company profiles, official domains, and logos for clients, employers, and partner organizations. | [Search Brands Docs](https://docs.context.dev/api-reference/brand-intelligence/search) |
| **Styleguide** | `GET /web/styleguide` | 10 credits | Extracts website design systems (color palettes, typography, font links) for deep-dive case studies. | [Styleguide Docs](https://docs.context.dev/api-reference/brand-intelligence/styleguide) |
| **Agent Feedback** | `POST /feedback` | 0 credits | Submits feedback on API issues or documentation discrepancies with `request_id`. | [Agent Feedback Docs](https://docs.context.dev/optimization/agent-feedback) |

## Testing & Credit Management
- **Automated Tests**: Unit and integration tests (`npm test`) MUST be kept off the live API. Always use mocks (see [`tests/contextDev.test.ts`](file:///Users/rafi/Programing/new_web/tests/contextDev.test.ts)).
- **Live Verification**: Run targeted smoke tests using `npm run verify:live` ([`scripts/verifyLiveCall.ts`](file:///Users/rafi/Programing/new_web/scripts/verifyLiveCall.ts)). Never run live calls in a continuous polling loop.

## Reporting Inconsistencies
If a Context.dev response is wrong or differs from the docs, report it once with `POST https://api.context.dev/v1/feedback`. Include the affected `request_id` and never include secrets.
