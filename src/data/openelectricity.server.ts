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

/**
 * Loads the latest Australian emissions snapshot from OpenElectricity.
 *
 * Workflow:
 * 1. Gets singleton SDK client (requires OPEN_ELECTRICITY_API_KEY env var)
 * 2. Calculates the last complete 5-minute interval for NEM timezone
 * 3. Requests 5-minute NEM network data grouped by region and fueltech
 * 4. Extracts latest timestamp interval
 * 5. Transforms rows into normalized snapshot via aggregation pipeline
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

  // Request last 3 days of data to ensure we capture the latest available data
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - 3)

  const dateEnd = endDate.toISOString()
  const dateStart = startDate.toISOString()

  // Fetch power, energy, and emissions from network data
  const { datatable } = await client.getNetworkData('NEM', ['power', 'energy', 'emissions'], {
    interval: '5m',
    dateStart,
    dateEnd,
    primaryGrouping: 'network_region',
    secondaryGrouping: ['fueltech'],
  })

  // Try to fetch demand separately from market data (different endpoint)
  let demandData: any = null
  try {
    const { datatable: demandTable } = await client.getMarket('NEM', ['demand'], {
      interval: '5m',
      dateStart,
      dateEnd,
      primaryGrouping: 'network_region',
    })
    demandData = demandTable
  } catch (error) {
    // Demand data not available - will use generation as proxy
  }

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

  // Merge demand data into rows if available
  if (demandData) {
    const demandRows = demandData.getRows()
    const demandByRegionTime = new Map<string, number>()

    // Build lookup map of demand by region and timestamp
    for (const demandRow of demandRows) {
      const region = demandRow.region || demandRow.network_region
      const time = new Date(demandRow.interval).getTime()
      const key = `${region}_${time}`
      demandByRegionTime.set(key, demandRow.demand as number)
    }

    // Add demand to generation rows
    for (const row of rows) {
      const region = row.region || row.network_region
      const time = new Date(row.interval).getTime()
      const key = `${region}_${time}`
      const demand = demandByRegionTime.get(key)
      if (demand !== undefined) {
        (row as any).demand = demand
      }
    }
  }

  // Convert to normalized snapshot
  return buildSnapshotFromRows(rows, latestTimestampMs)
}