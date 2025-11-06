# Hooks & Client State Strategy

## Hook Inventory
| Hook | Responsibility | Notes |
| --- | --- | --- |
| `useDashboardData` | Wraps the dashboard query, exposes helpers for manual/auto refresh, surfaces status metadata. | Consumes Query Client, returns typed data + `refetch`, `isFetching`, `lastUpdated`, `expiresAt`, `source`. |
| `useCountryBreakdown` | Derives NZ vs AU slices (or AU region subsets) from the shared snapshot. | Memoize heavy computations (totals, renewable splits) to avoid chart rerenders. |
| `useAutoRefresh` | Manages optional polling interval linked to browser visibility. | Uses `useEffect` with `setInterval`, cleans up on unmount, respects cache TTL in interval selection. |
| `useLiveClock` | Emits the current time and relative "Last updated" text for the header. | Reuses `Intl.DateTimeFormat`, updates every second only while dashboard visible. |

## Implementation Notes
- Organize hooks under `src/hooks/` and re-export from `src/hooks/index.ts` for ergonomic imports.
- Keep hooks pure and testable: accept dependencies (e.g. `queryKey`) as args rather than importing singletons.
- Leverage TanStack's `useSuspenseQuery` to keep `useDashboardData` concise while automatically syncing with SSR loader data.
- `useDashboardData` should surface cache metadata (`fetchedAt`, `expiresAt`, `stale`, `source`) provided by the backend so UI copy can reflect the 120-second refresh cadence.
- Prepare chart-ready datasets inline inside the dashboard components for now; promote that logic into a hook later if it grows complex.

## Error & Loading Semantics
- Expose `status`, `isFetching`, `expiresAt`, and `staleAt` from `useDashboardData` so UI components can render Shadcn `alert` or `badge` indicators that mirror backend cache freshness.
- Provide a stable `fallbackData` option for hooks so skeletons do not flicker when toggling between routes.

## Future Enhancements
- Introduce a dedicated `useGenerationMixSeries` hook if chart config grows beyond simple memoized helpers.
- Add a lightweight preference store only when the product requires persisted user choices (e.g. unit toggles, alternate chart styles).
