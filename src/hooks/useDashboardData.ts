/**
 * @fileoverview Dashboard data access hook.
 *
 * Wraps React Query access to AU emissions data with typed interface.
 * Provides loading states, refetch controls, and metadata exposure.
 *
 * @module hooks/useDashboardData
 */

import { useSuspenseQuery } from '@tanstack/react-query'

import type { CountryEmissionsSnapshot } from '@/types/emissions'

/**
 * Query key factory for dashboard data.
 */
export const dashboardQueryKeys = {
  all: ['dashboard'] as const,
  au: () => [...dashboardQueryKeys.all, 'au'] as const,
  auCurrent: () => [...dashboardQueryKeys.au(), 'current'] as const,
}

/**
 * Fetches AU emissions snapshot from REST API.
 */
const fetchAuSnapshot = async (): Promise<CountryEmissionsSnapshot> => {
  const response = await fetch('/api/emissions/au')
  if (!response.ok) {
    throw new Error(`Failed to fetch AU emissions: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Hook for accessing AU emissions dashboard data.
 *
 * Uses suspense query seeded by route loader. Provides:
 * - Typed snapshot data
 * - Loading/refetching states
 * - Manual refetch trigger
 * - Metadata (fetchedAt, source, stale)
 *
 * @returns Dashboard data with controls
 *
 * @example
 * ```tsx
 * function DashboardCard() {
 *   const { data, refetch, isFetching } = useDashboardData()
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
export function useDashboardData() {
  const query = useSuspenseQuery({
    queryKey: dashboardQueryKeys.auCurrent(),
    queryFn: fetchAuSnapshot,
    staleTime: 5 * 60 * 1000, // 5 minutes - matches OpenElectricity cadence
    refetchOnWindowFocus: false,
  })

  return {
    /** AU emissions snapshot */
    data: query.data,
    /** Whether a refetch is in progress */
    isFetching: query.isFetching,
    /** Trigger manual refetch */
    refetch: query.refetch,
    /** Snapshot metadata */
    metadata: query.data.metadata,
    /** Last successful fetch timestamp */
    dataUpdatedAt: query.dataUpdatedAt,
  }
}

/**
 * Derived data hook for country-level metrics.
 *
 * Provides computed breakdowns and comparisons built on top of useDashboardData.
 * Memoizes expensive calculations to prevent unnecessary rerenders.
 *
 * @example
 * ```tsx
 * function MetricsCard() {
 *   const { renewableTotal, fossilTotal, renewablePercentage } = useCountryMetrics()
 *
 *   return <Chart data={[renewableTotal, fossilTotal]} />
 * }
 * ```
 */
export function useCountryMetrics() {
  const { data } = useDashboardData()

  // Categorize fuels into renewable vs fossil
  const renewableFuels = ['hydro', 'wind', 'solar', 'geothermal', 'biomass']
  const fossilFuels = ['coal', 'gas', 'diesel']

  const renewableTotal = data.generationMix
    .filter((entry) => renewableFuels.includes(entry.fuel))
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
