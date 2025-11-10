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

  // Request only the last 2 hours of data to ensure we get the latest available 5-minute window
  // This is more efficient than fetching 3 days and ensures we get fresh data
  const endDate = new Date()
  const startDate = new Date(endDate)
  startDate.setHours(startDate.getHours() - 2)

  const dateEnd = endDate.toISOString()
  const dateStart = startDate.toISOString()

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

  // Extract timestamp and rows
  const rows = datatable.getRows() as OpenElectricityNetworkFueltechRow[]
  
  // Find the actual latest timestamp from the rows themselves
  // This is more reliable than getLatestTimestamp() which might return cached values
  // For OpenElectricityNetworkFueltechRow, interval is always a string
  let latestTimestampMs = 0
  for (const row of rows) {
    if (row.interval) {
      // interval is always a string for network fueltech rows
      const rowTimestamp = new Date(row.interval as string).getTime()
      if (rowTimestamp > latestTimestampMs) {
        latestTimestampMs = rowTimestamp
      }
    }
  }
  
  // Fallback to getLatestTimestamp() if no rows found
  if (latestTimestampMs === 0) {
    const apiLatestTimestampValue = datatable.getLatestTimestamp()
    latestTimestampMs =
      typeof apiLatestTimestampValue === 'number'
        ? apiLatestTimestampValue
        : new Date(apiLatestTimestampValue).getTime()
  }
  
  // OpenElectricity data typically has a 5-15 minute delay, so data up to 20 minutes old is normal

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

    // Merge demand into main rows
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
  return buildSnapshotFromRows(rows, [], latestTimestampMs)
}