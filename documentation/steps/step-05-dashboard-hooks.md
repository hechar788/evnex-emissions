# Step 05 – Dashboard Hooks

## Dependencies
- Builds on Step 04 query setup and Step 01 schemas for consistent typing.
- Requires knowledge of cache metadata fields introduced in Step 02.

## Completion Criteria
- Components can import hooks to access dashboard data and refresh controls without duplicating query logic.
- Hook behaviour (manual refresh, auto-refresh, derived breakdowns) aligns with backend caching semantics and avoids redundant network activity.

## Focus
Encapsulate dashboard data access, derived calculations, and refresh mechanics within reusable hooks to simplify component logic.

## Key Tasks

### 5.1 Implement `useDashboardData`
- Wrap `useSuspenseQuery` for the `['dashboard', 'current']` key, surface `data`, `refetch`, `isFetching`, and cache metadata (`fetchedAt`, `expiresAt`, `stale`, `source`), and mirror loader-provided initial data.

### 5.2 Add Derived Data Hooks
- Create `useCountryBreakdown` to derive AU vs NZ (and AU regional) slices, memoizing expensive computations to prevent unnecessary chart rerenders.

### 5.3 Create Auto-Refresh Hook
- Implement `useAutoRefresh` that accepts a query or query key, schedules invalidation aligned with the backend TTL (≥120 seconds), pauses when the document is hidden, and exposes controls to toggle the interval.

### 5.4 Provide Time Metadata Hooks
- Build `useLiveClock` or similar utility to supply formatted timestamps for "Last updated" messaging while respecting browser performance (update while visible only).

### 5.5 Consolidate Hook Exports
- Re-export hooks via `src/hooks/index.ts` and document expected return shapes for component authors.
