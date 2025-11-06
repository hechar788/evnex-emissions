# Snapshot History & Persistence Plan

## Objectives
- Persist every fresh emissions snapshot so we can review trends and debug upstream anomalies.
- Keep the existing in-memory cache for fast repeat responses while avoiding redundant network calls.
- Apply the same persistence rules to Australian (backend) and New Zealand (frontend/loader) data paths.

## Architecture Overview
- Extend the cache helper (`src/data/cache.ts`) to accept a **history adapter** that records and serves stored snapshots.
- Introduce `src/data/history-store.ts` exporting an interface (`recordSnapshot`, `getLatest`, `listSnapshots`) and a default filesystem-backed implementation.
- Each snapshot record captures: `cacheKey`, `fetchedAt`, `expiresAt`, `hash`, `payload`, and metadata (`source`, `stale`, `errors`).
- Memory cache remains the first layer; history store is the second layer; network fetch is last resort.

```txt
Request → Cache (memory) hit? → yes → return
      ↓
   miss → History hit? → yes → return (source: 'history')
      ↓
   miss → Fetch upstream → persist to cache + history → return (source: 'network')
```

## Storage Strategy
- Default adapter writes newline-delimited JSON files under `data/history/<cacheKey>.ndjson` for easy appends and tailing.
- Each append runs through `JSON.stringify` + buffered writes to avoid partial records.
- Include a rolling prune task (e.g. keep last 24 hours or 500 entries per key) to bound disk usage.
- Allow swapping the adapter (e.g. to SQLite, Redis Streams, Cloud KV) by adhering to the interface.

## Integration Points
- `src/data/openelectricity.server.ts`
  - `getCachedAuSnapshot` first checks memory, then history before issuing a new OpenElectricity request.
  - `setCachedAuSnapshot` writes to both memory and history, tagging the record with `source: 'network'`.
  - Expose `listAuSnapshots` for diagnostics or analytics routes.
- `src/data/transpower.server.ts` (new)
  - Wrap NZ API calls so loaders use the same cache/history pathway.
  - Cache keys derived from request signature (URL + params) to support multiple endpoints.
- `src/data/dashboard.server.ts`
  - Fetch both AU and NZ via the cache-aware helpers so loaders hydrate React Query without extra upstream hits.
- React Query loaders/hooks (`frontend-data-fetching.md`, `hooks-strategy.md`)
  - Continue to use `getDashboardSnapshot`; refetches still trigger the server helper, which now short-circuits using history when possible.

## Deduplication Rules
- Before writing, compute a content hash (e.g. SHA-256) of the serialized payload plus `expiresAt`.
- If the latest history record shares the same hash, skip the append to prevent duplicate entries for unchanged data.
- When serving from history, mark `source: 'history'` and `stale = Date.now() > expiresAt` so the UI can differentiate.

## Observability
- Log history interactions (`history hit`, `history append`, `history prune`) alongside existing cache logs.
- Provide optional CLI (`scripts/history-inspect.ts`) to query recent entries for debugging.

## Testing Notes
- Unit test the history adapter using an in-memory fake to cover dedupe, append ordering, and pruning.
- Update cache helper tests to ensure it falls back to history when memory misses.
- Integration tests for `getDashboardSnapshot` should verify that repeated calls within TTL avoid network fetches even after a server restart (history-only scenario).

## Maintenance Considerations
- Ensure `data/history/` is git-ignored and documented in `README.md` for local setup.
- Add tooling to migrate or compact history files when schema changes (bump file prefix `v1_` to invalidate old entries).
- Monitor file growth; expose environment variables for history retention duration and storage directory.
