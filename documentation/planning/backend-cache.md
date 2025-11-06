# Backend Caching Strategy

## Example Scenarios
- Client A hits `/api/emissions/au` → backend calls OpenElectricity, caches the result with a 120-second TTL, and returns the live data. Client B hits the same endpoint 45 seconds later → backend serves the cached payload instantly (no new upstream call). Both clients see consistent data with the same `fetchedAt` timestamp.
- Client A hits `/api/emissions/au` → response is cached. 150 seconds later Client B hits the endpoint → cache entry is expired, so the backend fetches OpenElectricity again, refreshes the cache, and both clients receive the updated snapshot.
- Client A hits `/api/emissions/au` twice: first call seeds the cache, second call 20 seconds later returns the cached payload. If Client A waits 130 seconds before calling again, the cache is refreshed on that third request.

## Objectives
- Reduce repeated calls to OpenElectricity when multiple clients request `/api/emissions/au` within a short window.
- Provide graceful fallback behaviour (serve slightly stale data) when the upstream API is temporarily unavailable.
- Keep implementation simple so it works in traditional Node deployments and serverless environments.

## Cache Placement
- Implement a lightweight cache inside `src/data/cache.ts`.
- Expose helpers such as `getCachedAuSnapshot`, `setCachedAuSnapshot`, and `clearCache`.
- Store cache data in memory by default; allow switching to a persistent adapter (Redis, KV) via dependency injection later.

## Data Model
```ts
type CacheKey = 'au:summary'

interface CacheEntry<T> {
  data: T
  fetchedAt: number
  expiresAt: number
  stale: boolean
  source: 'cache' | 'network'
}
```

- Cache entries are keyed by the logical resource (`au:summary`, or `au:summary:${region}` if per-region caching is needed).
- Serialize metadata (`fetchedAt`, `expiresAt`, `stale`) so the API response can reveal freshness.

## TTL & Staleness
- Default TTL: 120 seconds (declare a constant in the cache module so the window can be tweaked in code).
- When serving from cache, mark `source: 'cache'` and set `stale = Date.now() > expiresAt`.
- On cache miss or stale entry, trigger a background refresh (stale-while-revalidate) if desired; otherwise refetch synchronously.

## Configuration
- Environment: `OPEN_ELECTRICITY_API_KEY` must be set for upstream calls.
- Consider persisting cache state in development (e.g., saving to `.cache.json`) if you want to inspect the payloads manually.

## Integration Points
1. `openelectricity.server.ts`
   - Attempt `getCachedAuSnapshot` before calling the upstream.
   - If cache hit and not stale, return cached data immediately.
   - If cache miss or stale, call OpenElectricity via the official SDK, then `setCachedAuSnapshot`.
   - On upstream failure, return the stale cache entry (if any) with `stale: true` and populate an `errors` array.
2. `api/emissions.au`
   - Use the cached result from `openelectricity.server.ts`; no additional logic needed in the route.
3. `dashboard.server.ts`
   - Reuse the same helper, ensuring loaders benefit from the cache when fetching AU data.

## Invalidations
- Manual invalidation endpoint (optional) like `POST /api/emissions.au/refresh` that clears the cache before refetching.
- Automatic invalidation when the shapshot structure changes (bump a version number in the cache key).

## Observability
- Log hits vs misses to understand effectiveness (`cache hit`, `cache miss`, `cache stale-hit`).
- Surface cache metadata in the API response so the frontend can display freshness indicators.

## Deployment Considerations
- **Serverless**: In-memory cache resets between cold starts; still useful for fast follow-up requests on warm instances.
- **Edge**: If deploying to edge runtimes, consider a small KV store (e.g., Cloudflare KV, Vercel KV) and swap the cache adapter accordingly.
- **Horizontal Scaling**: Shared caches (Redis/Memcached) become important when running multiple instances; design the cache helper to accept an adapter interface early.
