/**
 * @fileoverview Dashboard error state component.
 *
 * Displayed when the dashboard loader fails to fetch data.
 * Shows an error message with details about the failure.
 *
 * @module components/dashboard/DashboardError
 */

interface DashboardErrorProps {
  /** Error object containing message and details */
  error: Error
}

/**
 * Dashboard error component.
 *
 * Shows error state when dashboard data fails to load.
 */
export function DashboardError({ error }: DashboardErrorProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg border border-red-500 bg-red-950/20 p-6">
        <h2 className="mb-2 text-xl font-semibold text-red-400">Failed to load dashboard</h2>
        <p className="text-red-300">{error.message}</p>
      </div>
    </div>
  )
}
