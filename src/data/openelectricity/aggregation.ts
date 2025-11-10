/**
 * @fileoverview High-level aggregation orchestrator.
 *
 * Coordinates the transformation of OpenElectricity DataTable rows
 * into complete country emissions snapshots by filtering, aggregating,
 * and building structured snapshot objects.
 *
 * @module data/openelectricity/aggregation
 */

import type { CountryEmissionsSnapshot } from '@/types/emissions'
import type { OpenElectricityDataRow, OpenElectricityNetworkFueltechRow } from '@/types/open_electricity/datatable'
import { clamp, toFiniteNumber } from '@/lib/number-utils'

import { aggregateRows } from './aggregators'
import { buildCountrySnapshot } from './snapshot-builder'
import { mapRegionCode } from './region-mapping'

/**
 * Transforms OpenElectricity DataTable rows into a complete country emissions snapshot.
 *
 * Pipeline:
 * 1. Filters rows to only include the latest timestamp interval
 * 2. Aggregates filtered rows by region and fuel type
 * 3. Merges demand data from separate query
 * 4. Builds structured snapshot objects with calculated metrics
 *
 * @param rows - All rows from OpenElectricity DataTable (power, energy, emissions)
 * @param demandRows - All rows from demand-only query (per-region, no fueltech grouping)
 * @param latestTimestampMs - Latest interval timestamp in milliseconds
 * @returns Complete CountryEmissionsSnapshot for Australia with regional breakdowns
 *
 * @example
 * ```ts
 * const { datatable } = await client.getNetworkData('NEM', metrics, {...})
 * const { datatable: demandDatatable } = await client.getNetworkData('NEM', ['demand'], {...})
 * const latestMs = datatable.getLatestTimestamp()
 * const rows = datatable.getRows()
 * const demandRows = demandDatatable.getRows()
 * const snapshot = buildSnapshotFromRows(rows, demandRows, latestMs)
 * // snapshot contains country + regional data
 * ```
 */
export const buildSnapshotFromRows = (
  rows: OpenElectricityNetworkFueltechRow[],
  demandRows: OpenElectricityDataRow[],
  latestTimestampMs: number,
): CountryEmissionsSnapshot => {
  const timestampIso = new Date(latestTimestampMs).toISOString()

  // Filter to latest interval only
  const latestRows = rows.filter(row => {
    const intervalValue = new Date(row.interval ?? 0).getTime()
    return intervalValue === latestTimestampMs
  })

  // Filter demand rows to latest interval
  // Handle both string and Date interval formats, and allow some tolerance for timestamp matching
  const latestDemandRows = demandRows.filter(row => {
    if (!row.interval) return false
    const intervalValue = typeof row.interval === 'string' 
      ? new Date(row.interval).getTime()
      : row.interval instanceof Date
      ? row.interval.getTime()
      : typeof row.interval === 'number'
      ? row.interval
      : 0
    
    // Allow 1 minute tolerance for timestamp matching (in case of rounding differences)
    return Math.abs(intervalValue - latestTimestampMs) < 60 * 1000
  })

  // Aggregate power, energy, emissions data
  const aggregated = aggregateRows(latestRows)

  // Merge demand data into aggregated regions
  for (const demandRow of latestDemandRows) {
    const regionCode = (demandRow.network_region || demandRow.region) as string | undefined
    const regionKey = mapRegionCode(regionCode)
    if (!regionKey) {
      continue
    }

    const region = aggregated.regions.get(regionKey)
    if (!region) {
      continue
    }

    const demand = clamp(toFiniteNumber(demandRow.demand))
    if (demand > 0) {
      if (region.demandMW === null) {
        region.demandMW = demand
        aggregated.countryDemand += demand
      } else {
        // If demand already set, use the larger value (in case of duplicates)
        if (demand > region.demandMW) {
          aggregated.countryDemand = aggregated.countryDemand - region.demandMW + demand
          region.demandMW = demand
        }
      }
    }
  }

  return buildCountrySnapshot(aggregated, timestampIso)
}
