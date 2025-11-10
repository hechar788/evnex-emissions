/**
 * @fileoverview Dashboard pending/loading state component.
 *
 * Displayed during navigation while the dashboard loader is fetching data.
 * Shows skeleton placeholders for the header and main content cards.
 *
 * @module components/dashboard/DashboardPending
 */

/**
 * Dashboard pending component.
 *
 * Shows loading skeleton during route navigation and data fetching.
 */
export function DashboardPending() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-700" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-slate-800" />
          ))}
        </div>
      </div>
    </div>
  )
}
