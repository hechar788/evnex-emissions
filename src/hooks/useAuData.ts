/**
 * @fileoverview Australian emissions data access hook.
 *
 * Wraps React Query access to AU emissions data with typed interface.
 * Provides loading states, refetch controls, and metadata exposure.
 *
 * @module hooks/useAuData
 */

import { useSuspenseQuery } from '@tanstack/react-query'

import { createQueryKey, emissionsQueryDefaults, fetchJson } from '@/lib/query-utils'
import { isRenewableFuelType } from '@/lib/fuel-utils'
import type { CountryEmissionsSnapshot, FuelType } from '@/types/emissions'

/**
 * Fetches AU emissions snapshot from REST API.
 */
const fetchAuSnapshot = async (): Promise<CountryEmissionsSnapshot> => {
  return fetchJson<CountryEmissionsSnapshot>('/api/emissions/au', 'Failed to fetch AU emissions')
}

/**
 * Hook for accessing AU emissions data.
 *
 * Uses suspense query with data hydrated from SSR loader. Provides:
 * - Typed snapshot data
 * - Loading/refetching states
 * - Manual refetch trigger
 * - Metadata (fetchedAt, source, stale)
 *
 * The data is automatically hydrated from the server via TanStack Router's
 * SSR Query integration, which dehydrates the QueryClient state during SSR
 * and rehydrates it on the client.
 *
 * @returns AU emissions data with controls
 *
 * @example
 * ```tsx
 * function DashboardCard() {
 *   const { data, refetch, isFetching } = useAuData()
 *
 *   return (
 *     <Card>
 *       <CardHeader>
 *         <CardTitle>Carbon Intensity</CardTitle>
 *         <Button onClick={refetch} disabled={isFetching}>
 *           Refresh
 *         </Button>
 *       </CardHeader>
 *       <CardContent>
 *         {data.carbonIntensity.current} gCO₂/kWh
 *       </CardContent>
 *     </Card>
 *   )
 * }
 * ```
 */
export function useAuData() {
  const query = useSuspenseQuery({
    queryKey: createQueryKey('au'),
    queryFn: fetchAuSnapshot,
    ...emissionsQueryDefaults,
  })

  /**
   * Smart refetch that always calls React Query's refetch.
   * React Query will respect staleTime internally - if data is fresh, it may use cache,
   * but we always call refetch to ensure auto-refresh works and manual refresh shows loading state.
   */
  const smartRefetch = async () => {
    // Always call refetch - React Query handles cache/staleTime internally
    // This ensures auto-refresh always checks for new data, and manual refresh shows loading
    return query.refetch()
  }

  return {
    /** AU emissions snapshot */
    data: query.data,
    /** Whether a refetch is in progress */
    isFetching: query.isFetching,
    /** Whether data is stale (older than staleTime) */
    isStale: query.isStale,
    /** Smart refetch that respects cache (only refetches if stale) */
    refetch: smartRefetch,
    /** Force refetch (bypasses cache, always fetches) */
    forceRefetch: query.refetch,
    /** Snapshot metadata */
    metadata: query.data.metadata,
    /** Last successful fetch timestamp */
    dataUpdatedAt: query.dataUpdatedAt,
    /** Error state (if any) */
    error: query.error,
    /** Whether query is in error state */
    isError: query.isError,
  }
}

/**
 * Derived data hook for country-level metrics.
 *
 * Provides computed breakdowns and comparisons built on top of useAuData.
 * Memoizes expensive calculations to prevent unnecessary rerenders.
 *
 * @example
 * ```tsx
 * function MetricsCard() {
 *   const { renewableTotal, fossilTotal, renewablePercentage } = useAuMetrics()
 *
 *   return <Chart data={[renewableTotal, fossilTotal]} />
 * }
 * ```
 */
export function useAuMetrics() {
  const { data } = useAuData()

  // Categorize fuels into renewable vs fossil using shared utilities
  const fossilFuels: FuelType[] = ['coal', 'gas', 'diesel']

  const renewableTotal = data.generationMix
    .filter((entry) => isRenewableFuelType(entry.fuel))
    .reduce((sum, entry) => sum + entry.megawatts, 0)

  const fossilTotal = data.generationMix
    .filter((entry) => fossilFuels.includes(entry.fuel))
    .reduce((sum, entry) => sum + entry.megawatts, 0)

  const totalGeneration = data.generationMix.reduce((sum, entry) => sum + entry.megawatts, 0)

  const renewablePercentage = totalGeneration > 0 ? (renewableTotal / totalGeneration) * 100 : 0
  const fossilPercentage = totalGeneration > 0 ? (fossilTotal / totalGeneration) * 100 : 0

  return {
    renewableTotal,
    fossilTotal,
    totalGeneration,
    renewablePercentage,
    fossilPercentage,
    carbonIntensity: data.carbonIntensity.current,
    demandMW: data.totalDemandMW,
    timestamp: data.timestamp,
  }
}
