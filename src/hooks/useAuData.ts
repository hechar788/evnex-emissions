/**
 * @fileoverview Australian emissions data access hook.
 *
 * Wraps React Query access to AU emissions data with typed interface.
 * Provides loading states, refetch controls, and metadata exposure.
 *
 * @module hooks/useAuData
 */

import { useSuspenseQuery } from '@tanstack/react-query'

import { createQueryKeyFactory, emissionsQueryDefaults, fetchJson } from '@/lib/query-utils'
import type { CountryEmissionsSnapshot } from '@/types/emissions'

/**
 * Query key factory for Australian data.
 */
export const auQueryKeys = createQueryKeyFactory('au')

/**
 * Fetches AU emissions snapshot from REST API.
 */
const fetchAuSnapshot = async (): Promise<CountryEmissionsSnapshot> => {
  return fetchJson<CountryEmissionsSnapshot>('/api/emissions/au', 'Failed to fetch AU emissions')
}

/**
 * Hook for accessing AU emissions data.
 *
 * Uses suspense query seeded by route loader. Provides:
 * - Typed snapshot data
 * - Loading/refetching states
 * - Manual refetch trigger
 * - Metadata (fetchedAt, source, stale)
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
    queryKey: auQueryKeys.current(),
    queryFn: fetchAuSnapshot,
    ...emissionsQueryDefaults,
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
