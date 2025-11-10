/**
 * @fileoverview New Zealand emissions data hook.
 *
 * Fetches NZ emissions data client-side from Transpower/EM6 APIs.
 * Per README requirements, NZ data is fetched directly from the frontend.
 *
 * @module hooks/useNzData
 */

import { useQuery } from '@tanstack/react-query'

import {
  createQueryKeyFactory,
  emissionsQueryDefaults,
  fetchJsonWithTimeout,
} from '@/lib/query-utils'
import type { CountryEmissionsSnapshot, FuelType } from '@/types/emissions'

/**
 * Query key factory for NZ data.
 */
export const nzQueryKeys = createQueryKeyFactory('nz')

/**
 * Fetches NZ carbon intensity from EM6 API.
 */
const fetchNzCarbonIntensity = async () => {
  return fetchJsonWithTimeout(
    'https://api.em6.co.nz/ords/em6/data_api/current_carbon_intensity',
    'Failed to fetch NZ carbon intensity'
  )
}

/**
 * Fetches NZ generation data from EM6 API.
 */
const fetchNzGeneration = async () => {
  return fetchJsonWithTimeout(
    'https://api.em6.co.nz/ords/em6/data_api/free/price',
    'Failed to fetch NZ generation'
  )
}

/**
 * Transforms EM6 API data into normalized CountryEmissionsSnapshot.
 */
const transformNzData = async (): Promise<CountryEmissionsSnapshot> => {
  // Fetch both endpoints in parallel
  const [carbonData, generationData] = await Promise.all([
    fetchNzCarbonIntensity(),
    fetchNzGeneration(),
  ])

  const now = new Date().toISOString()

  // Extract carbon intensity and renewable share from EM6 API response
  let carbonIntensity = 0
  let previousIntensity: number | null = null
  let change: number | null = null
  let renewableShare: number | null = null
  let timestamp = now

  // Parse the carbon intensity API response
  if (
    typeof carbonData === 'object' &&
    carbonData !== null &&
    'items' in carbonData &&
    Array.isArray((carbonData as any).items)
  ) {
    const items = (carbonData as any).items
    if (items.length > 0) {
      const latest = items[0]

      // Extract carbon intensity (gCO₂/kWh)
      if ('nz_carbon_gkwh' in latest) {
        carbonIntensity = Number(latest.nz_carbon_gkwh) || 0
      }

      // Extract previous intensity
      if ('nz_carbon_gkwh_prev' in latest) {
        previousIntensity = Number(latest.nz_carbon_gkwh_prev) || null
      }

      // Extract change
      if ('nz_carbon_change_gkwh' in latest) {
        change = Number(latest.nz_carbon_change_gkwh) || null
      }

      // Extract renewable percentage
      if ('nz_renewable' in latest) {
        renewableShare = Number(latest.nz_renewable) || null
      }

      // Use the API timestamp if available
      if ('timestamp' in latest) {
        timestamp = latest.timestamp
      }
    }
  }

  // Parse generation data to calculate total demand and generation mix
  let totalDemandMW: number | null = null
  const generationMix: Array<{ fuel: FuelType; megawatts: number; percentage: number }> = []

  if (
    typeof generationData === 'object' &&
    generationData !== null &&
    'items' in generationData &&
    Array.isArray((generationData as any).items)
  ) {
    const items = (generationData as any).items
    if (items.length > 0) {
      const latest = items[0]

      if ('generation_type' in latest && Array.isArray(latest.generation_type)) {
        // Map NZ fuel codes to normalized fuel types
        const fuelTypeMap: Record<string, FuelType> = {
          bat: 'battery',
          cg: 'coal', // Coal/gas (legacy)
          cog: 'cogeneration',
          gas: 'gas',
          geo: 'geothermal',
          hyd: 'hydro',
          liq: 'diesel',
          sol: 'solar',
          win: 'wind',
        }

        // First pass: calculate total MWh
        let totalMWh = 0
        const fuelData: Array<{ fuel: FuelType; mwh: number }> = []

        latest.generation_type.forEach((typeData: any) => {
          // Find the _mwh field for this fuel type
          const mwhKey = Object.keys(typeData).find((key) => key.endsWith('_mwh'))
          if (mwhKey && typeof typeData[mwhKey] === 'number') {
            const mwh = typeData[mwhKey]
            const fuelCode = mwhKey.replace('_mwh', '')
            const fuel: FuelType = fuelTypeMap[fuelCode] || 'other'

            totalMWh += mwh
            fuelData.push({ fuel, mwh })
          }
        })

        // Convert daily MWh total to average MW (divide by 24 hours)
        // Note: The /free/price endpoint returns daily aggregates, not trading period data
        totalDemandMW = totalMWh / 24

        // Second pass: calculate MW and percentages for generation mix
        fuelData.forEach(({ fuel, mwh }) => {
          const megawatts = mwh / 24 // Convert daily MWh to average MW
          const percentage = totalMWh > 0 ? (mwh / totalMWh) * 100 : 0

          // Only include fuel types with non-zero generation
          if (megawatts > 0) {
            generationMix.push({ fuel, megawatts, percentage })
          }
        })
      }
    }
  }

  // NZ data is always fresh when just fetched
  const stale = false

  return {
    country: 'NZ',
    timestamp,
    totalDemandMW,
    carbonIntensity: {
      current: carbonIntensity,
      previous: previousIntensity,
      change,
      unit: 'gCO2/kWh',
      renewableShare,
      lastUpdated: timestamp,
    },
    generationMix,
    metadata: {
      fetchedAt: now,
      expiresAt: null,
      stale,
      source: 'network',
    },
  }
}

/**
 * Hook for fetching New Zealand emissions data.
 *
 * Fetches data directly from Transpower/EM6 APIs on the client side.
 * Uses React Query for caching and automatic refetching.
 *
 * @returns Query result with NZ emissions data
 *
 * @example
 * ```tsx
 * function NzCard() {
 *   const { data, isLoading, error } = useNzData()
 *
 *   if (isLoading) return <Skeleton />
 *   if (error) return <Alert>Failed to load NZ data</Alert>
 *
 *   return <Card>{data.carbonIntensity.current} gCO₂/kWh</Card>
 * }
 * ```
 */
export function useNzData() {
  const query = useQuery({
    queryKey: nzQueryKeys.current(),
    queryFn: transformNzData,
    ...emissionsQueryDefaults,
  })

  return {
    /** NZ emissions snapshot */
    data: query.data,
    /** Whether a refetch is in progress */
    isFetching: query.isFetching,
    /** Whether query is loading (initial load) */
    isLoading: query.isLoading,
    /** Trigger manual refetch */
    refetch: query.refetch,
    /** Snapshot metadata */
    metadata: query.data?.metadata,
    /** Last successful fetch timestamp */
    dataUpdatedAt: query.dataUpdatedAt,
    /** Error state (if any) */
    error: query.error,
    /** Whether query is in error state */
    isError: query.isError,
  }
}
