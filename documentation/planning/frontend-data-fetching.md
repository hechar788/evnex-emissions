# Frontend Data Fetching Plan

## Objectives
- Render the `/dashboard` experience with SSR-first data using TanStack Start file routes.
- Keep the client hydrated with the latest emissions snapshot while avoiding duplicate network work.
- Support both manual refresh and optional auto-refresh without losing SSR benefits.

## Route Topology
- Add a dedicated `src/routes/dashboard.tsx` file route that owns the comparison view.
- Defer detail drill-downs to nested routes (`/dashboard/nz`, `/dashboard/au/:state`) that can reuse the parent loader output.
- Co-locate UI-only demo routes under `src/routes/demo/*` to keep production routes lean.

### `/dashboard` Loader Contract
- Define a loader that calls a server-side orchestrator in `@data/dashboard.server` so the fetch happens on the edge/node runtime.
- The orchestrator should merge the cached AU snapshot (via `/api/emissions/au`) with a direct fetch to the NZ Transpower API so the browser still talks to the upstream service without introducing a second backend hop.
- Share the normalized payload with React Query via `context.queryClient` so it is cached on the client after hydration.

```ts
import { QueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { getDashboardSnapshot } from '../data/dashboard.server'

export const Route = createFileRoute('/dashboard')({
  loader: async ({ context }) => {
    const queryClient: QueryClient = context.queryClient
    const snapshot = await getDashboardSnapshot()

    queryClient.setQueryData(['dashboard', 'current'], snapshot)

    return snapshot
  },
  component: DashboardView,
})
```

### Nested Routes
- Example: `/dashboard/au` can call `Route.useRouteContext()` to access the parent snapshot instead of refetching.
- Use `createFileRoute('/dashboard/au')({ loader: ({ context }) => context.parentLoaderData })` when the nested view only needs data that already exists.

## Query & Hydration Strategy
- Install `@tanstack/react-query` (shared provider from `@tanstack/react-router-ssr-query`) in the root shell so `useSuspenseQuery` is available.
- Wrap `DashboardView` in `useSuspenseQuery({ queryKey: ['dashboard', 'current'], queryFn: getDashboardSnapshot })`; the loader sets initial data so the query starts hydrated and stays consistent.
- For nested charts (e.g. state-level time series) compose additional queries with derived keys (`['dashboard', 'au', state, 'history']`) and prefetch them via route loaders when necessary.

## Manual Refresh Lifecycle
- Place a Refresh button that calls `queryClient.invalidateQueries({ queryKey: ['dashboard', 'current'] })`.
- While the query refetches, show optimistic UI using Shadcn Skeletons for cards and the chart placeholder.
- Update the `lastUpdated` timestamp inside the cached data so all listening components will re-render together.
- Surface a note near the refresh control that AU data refreshes every 120 seconds (matches backend cache); show the cache expiry time so users understand when new data will appear.

## Optional Auto Refresh
- Pair the manual refresh with a hook (`useAutoRefresh`, see hooks plan) that triggers `refetch` on an interval when enabled.
- Default the auto-refresh interval to ≥120 seconds so it aligns with the backend cache TTL and avoids unnecessary upstream calls.
- Guard against overlapping fetches by reading `query.isFetching` and skipping if true.
- Stop the interval when the tab is hidden using the Page Visibility API to avoid wasted calls.

## Handling Errors & Loading States
- Use route-level `pendingComponent` with a stacked Skeleton layout to keep SSR friendly placeholders.
- Throw loader errors (e.g. upstream API failures) and render a boundary component that surfaces retry controls and Shadcn `alert` messaging.
- Record fetch outcome metadata (latency, last successful fetch) in the query result so the UI can surface degradations (e.g. banner when AU data is stale).

## SEO & Streaming Considerations
- Keep the loader synchronous (no streaming) so the primary dashboard HTML arrives fast with fresh data.
- Use TanStack Start's progressive enhancement to stream secondary widgets (e.g. historical charts) by splitting them into suspense boundaries fed by deferred loaders if latency is high.
