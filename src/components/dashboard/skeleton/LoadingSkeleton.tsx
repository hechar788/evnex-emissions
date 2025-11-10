/**
 * @fileoverview Loading skeleton components for dashboard views.
 *
 * Provides reusable skeleton loaders for different dashboard sections,
 * showing placeholder content while data is being fetched.
 *
 * @module components/dashboard/LoadingSkeleton
 */

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Loading skeleton for quick stats cards (3 metric cards).
 *
 * Shows placeholder for carbon intensity, renewable percentage,
 * and total demand metrics.
 */
export function QuickStatsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="rounded-lg border border-border bg-card p-6">
          <Skeleton className="mb-2 h-4 w-24" />
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-4 w-20" />
        </div>
      ))}
    </div>
  )
}

/**
 * Loading skeleton for generation mix visualization.
 *
 * Shows placeholder for the fuel type breakdown chart with
 * multiple progress bars.
 */
export function GenerationMixLoadingSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Skeleton className="mb-4 h-6 w-48" />
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Loading skeleton for regional breakdown section.
 *
 * Shows placeholder for regional statistics in a grid layout.
 */
export function RegionalBreakdownLoadingSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <Skeleton className="mb-4 h-6 w-48" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Complete loading skeleton for country-specific dashboard view.
 *
 * Combines quick stats, generation mix, and regional breakdown skeletons
 * for a full country dashboard loading state.
 */
export function CountryDashboardLoadingSkeleton() {
  return (
    <>
      <QuickStatsLoadingSkeleton />
      <GenerationMixLoadingSkeleton />
      <RegionalBreakdownLoadingSkeleton />
    </>
  )
}

/**
 * Loading skeleton for compare view.
 *
 * Shows placeholder for side-by-side country comparison cards
 * and charts.
 */
export function CompareViewLoadingSkeleton() {
  return (
    <>
      {/* Comparison cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-6">
            <Skeleton className="mb-2 h-4 w-32" />
            <Skeleton className="h-8 w-24 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
        ))}
      </div>
      {/* Comparison chart */}
      <div className="rounded-lg border border-border bg-card p-6">
        <Skeleton className="mb-4 h-6 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    </>
  )
}
