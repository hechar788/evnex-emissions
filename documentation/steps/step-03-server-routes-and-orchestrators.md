# Step 03 – Server Routes & Orchestrators

## Dependencies
- Requires Step 02 cache and fetchers plus Step 01 schemas.
- Needs clarity on NZ data access strategy (client-side fetch vs server aggregator) to decide whether the orchestrator pulls NZ data or delegates to the frontend.

## Completion Criteria
- Hitting `/api/emissions/au` returns a cached AU snapshot within the documented TTL window, including freshness metadata.
- `getDashboardSnapshot` (or equivalent server function) can be imported by frontend routes and returns a consolidated payload ready for SSR.

## Focus
Expose normalized emissions data through first-party server APIs that reuse the cache layer and power both loaders and external consumers.

## Key Tasks

### 3.1 Build Dashboard Orchestrator
- Create `src/data/dashboard.server.ts` (or equivalent) exporting `getDashboardSnapshot = createServerFn('GET', ...)` that aggregates the cached AU snapshot with live NZ data, returning the shared schema.

### 3.2 Implement AU API Route
- Implement `/api/emissions/au` under `src/routes/api/emissions.au.ts` with a `GET` handler that pulls from the cache-backed SDK fetcher, accepts an optional `region` query parameter, and serializes cache metadata alongside data.

### 3.3 Propagate Error Handling
- Ensure that when OpenElectricity fails, server routes return the most recent cached payload marked `stale: true` and include an `errors` array describing the issue.

### 3.4 Operational Endpoints (Optional)
- Optionally scaffold a `/api/emissions.health.ts` endpoint or manual cache refresh handler for future operational tooling, leaving TODO notes if deferred.

### 3.5 Reuse Logic in Loaders
- Ensure loaders and server functions share logic instead of duplicating fetch calls—reuse the dashboard orchestrator inside TanStack Start loaders.
