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
import type { OpenElectricityNetworkFueltechRow } from '@/types/open_electricity/datatable'

import { buildSnapshotFromRows } from './openelectricity/aggregation'
import { getOpenElectricityClient } from './openelectricity/client'
import { getLast24HoursDateRange, extractLatestTimestampWithFallback } from './openelectricity/date-utils'
import { mergeDemandIntoRows } from './openelectricity/demand-merger'

/**
 * Loads the latest Australian emissions snapshot from OpenElectricity.
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
 * @example
 * ```ts
 * // Typically called from REST API route:
 * const snapshot = await loadAuSnapshot()
 * return Response.json(snapshot)
 * ```
 */
export const loadAuSnapshot = async (): Promise<CountryEmissionsSnapshot> => {
  const client = getOpenElectricityClient()

  // Get date range for the last 24 hours in AEST format (API requirement)
  const { dateStart, dateEnd } = getLast24HoursDateRange()

  // Fetch power, energy, and emissions from network data (grouped by region and fueltech)
  const { datatable } = await client.getNetworkData('NEM', ['power', 'energy', 'emissions'], {
    interval: '5m',
    dateStart,
    dateEnd,
    primaryGrouping: 'network_region',
    secondaryGrouping: ['fueltech'],
  })

  if (!datatable) {
    throw new Error(
      'OpenElectricity response did not include a datatable. ' +
      'Check API key validity and network connectivity.'
    )
  }

  // Fetch demand data separately using getMarket (demand is per-region, not per-fueltech)
  let demandData: any = null
  try {
    const { datatable: demandTable } = await (client as any).getMarket('NEM', ['demand'], {
      interval: '5m',
      dateStart,
      dateEnd,
      primaryGrouping: 'network_region',
    })
    demandData = demandTable
  } catch (error) {
    // Demand data not available - will use generation as proxy
  }

  // Extract rows and determine latest timestamp (with fallback)
  const rows = datatable.getRows() as OpenElectricityNetworkFueltechRow[]
  const latestTimestampMs = extractLatestTimestampWithFallback(rows, datatable)

  // Merge demand data into rows if available
  mergeDemandIntoRows(rows, demandData)

  // Convert to normalized snapshot
  return buildSnapshotFromRows(rows, [], latestTimestampMs)
}