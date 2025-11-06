# Step 02 – Caching & OpenElectricity Fetchers

## Dependencies
- Builds on Step 01 schemas and documented upstream assumptions.
- Requires knowledge of OpenElectricity endpoints and expected response fields (documented alongside schema usage).

## Completion Criteria
- Calling the OpenElectricity helper (backed by the SDK) returns a normalized snapshot object with cache metadata and either `source: 'network'` or `source: 'cache'`.
- Cache functions enforce TTL logic and allow subsequent layers to differentiate fresh vs stale results.

## Focus
Provide a resilient server-side data access layer for Australian emissions by pairing cache helpers with the OpenElectricity TypeScript SDK.

## Key Tasks

### 2.1 Build In-Memory Cache
- Implement `src/data/cache.ts` with in-memory storage keyed by logical resource IDs (e.g., `au:summary`), storing `{ data, fetchedAt, expiresAt, stale, source }` metadata and exposing `getCachedAuSnapshot`, `setCachedAuSnapshot`, and `clearCache`.

### 2.2 Define Cache TTL Constant
- Declare a `const CACHE_TTL_SECONDS = 120` inside the cache module, use it to compute `expiresAt`, and note how to swap it out if different environments need a new window.

### 2.3 Integrate OpenElectricity SDK
- Instantiate the official `OpenElectricityClient` using `process.env.OPEN_ELECTRICITY_API_KEY`, call `getNetworkData` to retrieve NEM regional power/emissions, and reshape the SDK `DataTable` into the shared schema inside `src/data/openelectricity.server.ts`.

### 2.4 Handle Errors & Logging
- Log cache hits, misses, and stale hits; surface structured error details when upstream requests fail (including `OpenElectricityError`), and ensure fallbacks to cached snapshots when available.

### 2.5 Write-Through Cache Strategy
- Persist successful snapshots back to the cache and guarantee that stale data is served with appropriate metadata when fresh fetches fail.
