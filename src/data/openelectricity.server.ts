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
 * 2. Requests 5-minute NEM network data grouped by region and fueltech
 * 3. Extracts latest timestamp interval
 * 4. Transforms rows into normalized snapshot via aggregation pipeline
 *
 * Timestamp Handling:
 * The OpenElectricity API returns timezone-naive timestamps (e.g., "2024-01-15T10:30:00").
 * JavaScript's Date parser interprets these as UTC, and we use them as-is.
 * All timestamps are displayed in UTC throughout the application.
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

  // Request the last 24 hours of data to ensure we get the latest available data
  // The API expects timezone-naive ISO strings in AEST/AEDT (network local time)
  // Convert UTC to AEST by adding 10 hours (AEST = UTC+10, AEDT = UTC+11, but we'll use +10 as default)
  const now = new Date()
  const endDate = new Date(now)
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago
  
  // Convert to AEST (UTC+10) - add 10 hours to get AEST time
  const aestOffsetMs = 10 * 60 * 60 * 1000
  const endDateAEST = new Date(endDate.getTime() + aestOffsetMs)
  const startDateAEST = new Date(startDate.getTime() + aestOffsetMs)
  
  // Format as timezone-naive ISO string (API expects AEST time)
  const formatTime = (date: Date): string => {
    const year = date.getUTCFullYear()
    const month = String(date.getUTCMonth() + 1).padStart(2, '0')
    const day = String(date.getUTCDate()).padStart(2, '0')
    const hours = String(date.getUTCHours()).padStart(2, '0')
    const minutes = String(date.getUTCMinutes()).padStart(2, '0')
    const seconds = String(date.getUTCSeconds()).padStart(2, '0')
    return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
  }
  
  const dateEnd = formatTime(endDateAEST)
  const dateStart = formatTime(startDateAEST)

  // Log the date range being requested for debugging
  console.log('[AU Data Fetch] Requesting data range:', {
    dateStart,
    dateEnd,
    currentUTC: new Date().toISOString(),
    currentUTCTime: Date.now(),
  })

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

  // Note: We're using timestamps as-is (parsed as UTC by JavaScript)
  // No timezone corrections needed - displaying in UTC

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

  // Find the latest timestamp from the rows themselves
  // JavaScript parses timezone-naive timestamps as UTC - we'll use them as-is
  let latestTimestampMs = 0
  let latestIntervalString = ''
  for (const row of rows) {
    if (row.interval) {
      const intervalMs = new Date(row.interval as string).getTime()
      if (intervalMs > latestTimestampMs) {
        latestTimestampMs = intervalMs
        latestIntervalString = row.interval as string
      }
    }
  }
  
  // Log the latest timestamp found
  console.log('[AU Data Fetch] Latest data timestamp:', {
    intervalString: latestIntervalString,
    timestampMs: latestTimestampMs,
    timestampISO: new Date(latestTimestampMs).toISOString(),
    ageMinutes: Math.round((Date.now() - latestTimestampMs) / 1000 / 60),
  })
  
  // Fallback to datatable method if no rows found
  if (latestTimestampMs === 0) {
    const apiLatestTimestampValue = datatable.getLatestTimestamp()
    latestTimestampMs =
      typeof apiLatestTimestampValue === 'number'
        ? apiLatestTimestampValue
        : new Date(apiLatestTimestampValue).getTime()
  }

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
  // Use timestamps as-is (parsed as UTC by JavaScript)
  return buildSnapshotFromRows(rows, [], latestTimestampMs)
}