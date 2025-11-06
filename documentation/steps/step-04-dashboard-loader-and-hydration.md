# Step 04 – Dashboard Loader & Hydration

## Dependencies
- Relies on Step 03 server functions and API endpoints to supply data.
- Requires established query provider wiring; ensure root layout changes are coordinated with upcoming hook work (Step 05).

## Completion Criteria
- Navigating to `/dashboard` renders SSR content using the server-loaded snapshot and hydrates into React Query without duplicate fetches.
- Nested views access the loader data through context, maintaining a single source of truth for dashboard state.

## Focus
Deliver the dashboard page through TanStack Start with SSR data loading and React Query hydration so the client starts with a populated cache.

## Key Tasks

### 4.1 Create Dashboard File Route
- Add `src/routes/dashboard.tsx` (or equivalent) using `createFileRoute('/dashboard')` with a loader that calls `getDashboardSnapshot` and seeds `context.queryClient.setQueryData(['dashboard', 'current'], snapshot)`.

### 4.2 Return Snapshot for SSR
- Ensure the loader returns the snapshot for immediate SSR rendering and leverages route context so nested routes can reuse the same data.

### 4.3 Configure Query Providers
- Configure React Query providers in the root app shell to enable `useSuspenseQuery` and hydration from server-provided state.

### 4.4 Update Nested Routes
- Update nested routes (e.g., `/dashboard/au`, `/dashboard/nz`) to consume parent data through route context instead of issuing redundant fetches.

### 4.5 Define Query Metadata
- Define query keys, loader typings, and metadata surfaces (`fetchedAt`, `expiresAt`, `stale`, `source`) so components can show freshness indicators aligned with the backend cache.
