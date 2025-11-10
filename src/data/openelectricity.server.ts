/**
 * @fileoverview Australian emissions data fetcher.
 *
 * Main entry point for loading Australian emissions data from OpenElectricity.
 * Fetches the latest 5-minute interval data from the NEM network and transforms
 * it into normalized CountryEmissionsSnapshot format.
 *
 * This module is the bridge between the OpenElectricity SDK and our REST API.
 * It's called by `/api/emissions/au` to serve frontend requests.
 *
 * @module data/openelectricity.server
 */

import type { CountryEmissionsSnapshot } from '@/types/emissions'
import type { OpenElectricityMetric } from '@/types/open_electricity'
import type { OpenElectricityNetworkFueltechRow } from '@/types/open_electricity/datatable'

import { buildSnapshotFromRows } from './openelectricity/aggregation'
import { getOpenElectricityClient } from './openelectricity/client'

/**
 * Metrics requested from OpenElectricity SDK.
 * These provide the data needed for carbon intensity and generation mix calculations.
 */
const SDK_METRICS: readonly OpenElectricityMetric[] = ['power', 'energy', 'emissions', 'demand']

/**
 * Fetches the latest Australian emissions snapshot from OpenElectricity.
 *
 * Workflow:
 * 1. Gets singleton SDK client (requires OPEN_ELECTRICITY_API_KEY env var)
 * 2. Requests 5-minute NEM network data grouped by region and fueltech
 * 3. Extracts latest timestamp interval
 * 4. Transforms rows into normalized snapshot via aggregation pipeline
 *
 * Data includes:
 * - Country-level metrics (total demand, carbon intensity, generation mix)
 * - Regional breakdowns for QLD, NSW, VIC, SA, TAS
 * - Renewable share calculations
 * - Metadata (timestamp, source, freshness)
 *
 * @throws {Error} When OPEN_ELECTRICITY_API_KEY is missing
 * @throws {Error} When SDK response doesn't include a datatable
 * @returns Normalized AU emissions snapshot with regional data
 *
 * @internal
 *
 * @example
 * ```ts
 * // Typically called from REST API route:
 * const snapshot = await loadAuSnapshot()
 * return Response.json(snapshot)
 * ```
 */
const fetchLatestSnapshot = async (): Promise<CountryEmissionsSnapshot> => {
  const client = getOpenElectricityClient()

  // Fetch latest 5-minute interval grouped by region and fuel
  const { datatable } = await client.getNetworkData('NEM', SDK_METRICS, {
    interval: '5m',
    primaryGrouping: 'network_region',
    secondaryGrouping: 'fueltech',
  })

  if (!datatable) {
    throw new Error(
      'OpenElectricity response did not include a datatable. ' +
      'Check API key validity and network connectivity.'
    )
  }

  // Extract timestamp and rows
  const latestTimestampValue = datatable.getLatestTimestamp()
  const latestTimestampMs =
    typeof latestTimestampValue === 'number'
      ? latestTimestampValue
      : new Date(latestTimestampValue).getTime()

  const rows = datatable.getRows() as OpenElectricityNetworkFueltechRow[]

  // Transform into normalized snapshot
  return buildSnapshotFromRows(rows, latestTimestampMs)
}

/**
 * Loads the latest Australian emissions snapshot.
 *
 * Public API used by REST routes to serve AU emissions data.
 * Fetches real-time data from OpenElectricity and normalizes it
 * into the application's shared emissions schema.
 *
 * @returns Promise resolving to AU emissions snapshot with regional breakdowns
 * @throws {Error} When API key is missing or SDK call fails
 *
 * @example
 * ```ts
 * // In API route handler:
 * export const GET = async () => {
 *   const snapshot = await loadAuSnapshot()
 *   return Response.json(snapshot)
 * }
 * ```
 */
export const loadAuSnapshot = fetchLatestSnapshot
