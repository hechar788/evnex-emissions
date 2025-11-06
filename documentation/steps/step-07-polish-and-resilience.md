# Step 07 – Polish & Resilience

## Dependencies
- Built on earlier steps that deliver data access, hooks, and UI structure.
- Requires logging hooks from Step 02 and UI components from Step 06.

## Completion Criteria
- Dashboard handles upstream failures by serving stale data with clear messaging and logs key events for later observability tooling.
- Refresh interactions, loading states, and degraded-mode indicators feel deliberate and user-friendly.

## Focus
Harden the experience with graceful degradation, user feedback, and operational visibility once core functionality is in place.

## Key Tasks

### 7.1 Enhance Pending/Error States
- Add pending and error UI states using TanStack Start `pendingComponent`/error boundaries plus Shadcn `Skeleton` and `Alert` components.

### 7.2 Surface Cache Metadata
- Show badges for stale data, countdown progress tied to cache expiry, and other freshness indicators powered by cache metadata.

### 7.3 Refine Refresh Lifecycle
- Disable buttons while fetching, show optimistic skeletons, and optionally trigger toasts on success/failure to polish manual refresh interactions.

### 7.4 Capture Metrics & Logs
- Capture lightweight metrics/logs for cache hits, misses, latency, and upstream failures; ensure structured logs suit the hosting environment.

### 7.5 Plan Operational Tooling
- Consider auxiliary endpoints or scripts (e.g., `/api/emissions.health`, cache refresh hooks) to support operations, leaving clear TODOs if deferred.
