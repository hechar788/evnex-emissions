/**
 * @fileoverview Utility for merging demand data into network fueltech rows.
 *
 * Demand data is fetched separately from the main power/energy/emissions data
 * because it's per-region (not per-fueltech). This module handles merging
 * the demand values back into the main dataset.
 *
 * @module data/openelectricity/demand-merger
 */

import type { OpenElectricityNetworkFueltechRow } from '@/types/open_electricity/datatable'

/**
 * Merges demand data into network fueltech rows by matching region and timestamp.
 *
 * Creates a lookup map of demand values keyed by region and timestamp, then
 * enriches the main data rows with matching demand values. This is necessary
 * because demand data comes from a separate API query (per-region, not per-fueltech).
 *
 * @param rows - Main data rows (power, energy, emissions by region and fueltech)
 * @param demandData - DataTable object containing demand rows from getMarket query
 *
 * @example
 * ```ts
 * const { datatable } = await client.getNetworkData('NEM', ['power', 'energy', 'emissions'], {...})
 * const { datatable: demandTable } = await client.getMarket('NEM', ['demand'], {...})
 * const rows = datatable.getRows()
 *
 * mergeDemandIntoRows(rows, demandTable)
 * // rows now have demand property populated
 * ```
 */
export const mergeDemandIntoRows = (
  rows: OpenElectricityNetworkFueltechRow[],
  demandData: any
): void => {
  if (!demandData) {
    return
  }

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