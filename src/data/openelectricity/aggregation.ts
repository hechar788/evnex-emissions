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
import type { OpenElectricityNetworkFueltechRow } from '@/types/open_electricity/datatable'

import { aggregateRows } from './aggregators'
import { buildCountrySnapshot } from './snapshot-builder'

/**
 * Transforms OpenElectricity DataTable rows into a complete country emissions snapshot.
 *
 * Pipeline:
 * 1. Filters rows to only include the latest timestamp interval
 * 2. Aggregates filtered rows by region and fuel type
 * 3. Builds structured snapshot objects with calculated metrics
 *
 * @param rows - All rows from OpenElectricity DataTable
 * @param latestTimestampMs - Latest interval timestamp in milliseconds
 * @returns Complete CountryEmissionsSnapshot for Australia with regional breakdowns
 *
 * @example
 * ```ts
 * const { datatable } = await client.getNetworkData('NEM', metrics, {...})
 * const latestMs = datatable.getLatestTimestamp()
 * const rows = datatable.getRows()
 * const snapshot = buildSnapshotFromRows(rows, latestMs)
 * // snapshot contains country + regional data
 * ```
 */
export const buildSnapshotFromRows = (
  rows: OpenElectricityNetworkFueltechRow[],
  latestTimestampMs: number,
): CountryEmissionsSnapshot => {
  const timestampIso = new Date(latestTimestampMs).toISOString()

  // Filter to latest interval only
  const latestRows = rows.filter(row => {
    const intervalValue = new Date(row.interval ?? 0).getTime()
    return intervalValue === latestTimestampMs
  })

  // Aggregate and build snapshot
  const aggregated = aggregateRows(latestRows)
  return buildCountrySnapshot(aggregated, timestampIso)
}
