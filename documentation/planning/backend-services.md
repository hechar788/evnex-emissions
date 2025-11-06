# Backend Services & Data Layer Plan

## Goals
- Satisfy the README requirement that only **Australian** data flows through our backend by isolating server handlers for AU feeds.
- Keep New Zealand fetching client-side while still sharing schema/types so both countries render from a common contract.
- Deliver typed, normalized responses to the frontend with resilient fallback behaviour when the upstream service degrades.

## Module Layout
- `src/types/emissions.ts` – shared TypeScript types (and optional runtime guards) for `CountryEmissions`, `GenerationMix`, `RegionalBreakdown`, and error payloads used across AU/NZ.
- `src/data/openelectricity.server.ts` – server-only fetchers built around the official `OpenElectricityClient` TypeScript SDK. Instantiates the client with `OPEN_ELECTRICITY_API_KEY`, issues network + emissions queries, and converts the SDK response into the internal schema.
- `src/data/cache.ts` – 120-second AU snapshot cache (`getCachedAuSnapshot`, `setCachedAuSnapshot`) with pluggable adapters.
- `src/data/dashboard.server.ts` – orchestration helpers that aggregate AU server results (from the cache-backed fetcher) with NZ data fetched directly from Transpower before exposing `getDashboardSnapshot` to loaders.

## Server Functions & Route Handlers
- Use `createServerFn` from `@tanstack/react-start` for reusable RPC-style entry points (`export const getDashboardSnapshot = createServerFn('GET', async () => { ... })`).
- Expose REST-friendly endpoints for Australian data (per README requirement):
  - `src/routes/api/emissions.au.ts` – `GET` handler; accepts optional `region` query param to focus on a single NEM region. Responses always originate from OpenElectricity and are cached for 120 seconds.
- Optionally add `src/routes/api/emissions.health.ts` for uptime checks. NZ data can continue to be fetched directly from the frontend.
- Reuse the same server functions inside loaders to avoid duplicate fetch implementations.

## OpenElectricity SDK Integration
- Install the `openelectricity` npm package and encapsulate client creation inside `openelectricity.server.ts` (single shared instance per runtime).
- Use `client.getNetworkData('NEM', ['power', 'emissions'], { interval: '5m', primaryGrouping: 'network_region', secondaryGrouping: 'fueltech' })` (or equivalent) to retrieve regional AU data.
- Convert the SDK's `DataTable` output into normalized region summaries (QLD, NSW, VIC, SA, TAS) and aggregate renewable vs non-renewable metrics aligned with the shared schema.
- Handle SDK-specific errors (`OpenElectricityError`, `NoDataFound`) by logging structured details and falling back to cached snapshots when available.

## Normalization Pipeline
1. Fetch data via the OpenElectricity SDK inside `openelectricity.server.ts`.
2. Perform lightweight shape checks (if desired) and log validation issues before falling back to cached data when necessary.
3. Convert units to the shared schema (`gCO2/kWh`, `MW`, percentage shares) while mapping NEM region codes (`NSW1`, `QLD1`, etc.) to friendly identifiers.
4. Annotate with metadata: `source`, `fetchedAt`, `latencyMs`, `stale` flag.
5. Cache the normalized result for a fixed 120-second TTL using the shared cache helper (adjust the constant in code if requirements change).

## Resilience
- When an API request fails:
  - Return the most recent successful response if available and mark it `stale: true`.
  - Include `errors` array describing which upstream call failed to support UI messaging.
- Surface retry-after headers and `Cache-Control: public, max-age=120` to align with the backend cache window.

## Environment & Secrets
- Keep `OPEN_ELECTRICITY_API_KEY` in `.env` (no `VITE_` prefix) so it stays server-side; ensure `.gitignore` excludes env files.
- Within `openelectricity.server.ts`, read `process.env.OPEN_ELECTRICITY_API_KEY` once (throw if missing) before instantiating the `OpenElectricityClient`.

## Observability
- Log upstream latency and error counts with a simple `metrics` helper (console-based initially; pluggable for Datadog/OTEL).
- Consider pushing structured logs (`console.info(JSON.stringify({...}))`) so deployments on Vercel/Netlify capture them cleanly.
- Add a `scripts/check-upstreams.ts` script (optional) that can be scheduled to warm caches and alert if APIs are down.
