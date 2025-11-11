/**
 * @fileoverview Date and time utility functions for OpenElectricity API.
 *
 * Handles timezone conversions and formatting for the OpenElectricity API,
 * which expects timezone-naive ISO strings in AEST/AEDT (Australian Eastern time).
 *
 * @module data/openelectricity/date-utils
 */

import type { OpenElectricityNetworkFueltechRow } from '@/types/open_electricity/datatable'

/**
 * AEST offset in milliseconds (UTC+10).
 * Note: AEDT is UTC+11, but we use +10 as default.
 */
const AEST_OFFSET_MS = 10 * 60 * 60 * 1000

/**
 * Formats a Date object as a timezone-naive ISO string for the OpenElectricity API.
 *
 * The API expects dates in AEST/AEDT local time format without timezone indicators.
 * This function extracts UTC components from the date to create the string.
 *
 * @param date - Date object to format (should already be converted to AEST)
 * @returns ISO 8601 string without timezone (e.g., "2024-01-15T10:30:00")
 *
 * @example
 * ```ts
 * const aestDate = new Date(Date.now() + AEST_OFFSET_MS)
 * const formatted = formatTimezonNaiveISO(aestDate)
 * // Returns: "2024-01-15T10:30:00"
 * ```
 */
export const formatTimezoneNaiveISO = (date: Date): string => {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const day = String(date.getUTCDate()).padStart(2, '0')
  const hours = String(date.getUTCHours()).padStart(2, '0')
  const minutes = String(date.getUTCMinutes()).padStart(2, '0')
  const seconds = String(date.getUTCSeconds()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`
}

/**
 * Date range for querying the OpenElectricity API.
 */
export interface DateRange {
  /** Start date in timezone-naive AEST format */
  dateStart: string
  /** End date in timezone-naive AEST format */
  dateEnd: string
  /** Current UTC time for debugging */
  currentUTC: string
  /** Current UTC timestamp in milliseconds */
  currentUTCTime: number
}

/**
 * Generates a date range for the last 24 hours in AEST timezone format.
 *
 * The OpenElectricity API expects timezone-naive ISO strings in AEST/AEDT.
 * This function converts current UTC time to AEST (+10 hours) and formats
 * the range for the API request.
 *
 * @returns Date range object with formatted start/end dates in AEST
 *
 * @example
 * ```ts
 * const range = getLast24HoursDateRange()
 * // Use in API request:
 * await client.getNetworkData('NEM', metrics, {
 *   dateStart: range.dateStart,
 *   dateEnd: range.dateEnd
 * })
 * ```
 */
export const getLast24HoursDateRange = (): DateRange => {
  const now = new Date()
  const endDate = new Date(now)
  const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000) // 24 hours ago

  // Convert to AEST (UTC+10) - add 10 hours to get AEST time
  const endDateAEST = new Date(endDate.getTime() + AEST_OFFSET_MS)
  const startDateAEST = new Date(startDate.getTime() + AEST_OFFSET_MS)

  return {
    dateStart: formatTimezoneNaiveISO(startDateAEST),
    dateEnd: formatTimezoneNaiveISO(endDateAEST),
    currentUTC: now.toISOString(),
    currentUTCTime: Date.now(),
  }
}

/**
 * Result of extracting the latest timestamp from data rows.
 */
export interface LatestTimestampResult {
  /** Timestamp in milliseconds since epoch */
  timestampMs: number
  /** Original interval string from the row */
  intervalString: string
  /** ISO 8601 formatted timestamp */
  timestampISO: string
  /** Age of the data in minutes */
  ageMinutes: number
}

/**
 * Extracts the latest timestamp from OpenElectricity data rows.
 *
 * Iterates through all rows to find the most recent interval timestamp.
 * JavaScript parses timezone-naive timestamps as UTC, which we use as-is.
 *
 * @param rows - Array of data rows from OpenElectricity API
 * @returns Latest timestamp details, or null if no valid timestamps found
 *
 * @example
 * ```ts
 * const rows = datatable.getRows()
 * const latest = findLatestTimestamp(rows)
 * if (latest) {
 *   console.log(`Latest data from ${latest.ageMinutes} minutes ago`)
 * }
 * ```
 */
export const findLatestTimestamp = (
  rows: OpenElectricityNetworkFueltechRow[]
): LatestTimestampResult | null => {
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

  if (latestTimestampMs === 0) {
    return null
  }

  return {
    timestampMs: latestTimestampMs,
    intervalString: latestIntervalString,
    timestampISO: new Date(latestTimestampMs).toISOString(),
    ageMinutes: Math.round((Date.now() - latestTimestampMs) / 1000 / 60),
  }
}

/**
 * Extracts the latest timestamp from rows or datatable with fallback logic and logging.
 *
 * Attempts to find the latest timestamp from the data rows first. If no valid
 * timestamps are found in rows, falls back to using the datatable's getLatestTimestamp()
 * method. Logs the result for debugging purposes.
 *
 * @param rows - Array of data rows from OpenElectricity API
 * @param datatable - DataTable object with getLatestTimestamp() method
 * @returns Timestamp in milliseconds since epoch
 *
 * @example
 * ```ts
 * const rows = datatable.getRows()
 * const timestampMs = extractLatestTimestampWithFallback(rows, datatable)
 * const snapshot = buildSnapshotFromRows(rows, [], timestampMs)
 * ```
 */
export const extractLatestTimestampWithFallback = (
  rows: OpenElectricityNetworkFueltechRow[],
  datatable: any
): number => {
  const latestTimestamp = findLatestTimestamp(rows)

  if (latestTimestamp) {
    console.log('[AU Data Fetch] Latest data timestamp:', latestTimestamp)
    return latestTimestamp.timestampMs
  }

  // Fallback to datatable method if no rows found
  const apiLatestTimestampValue = datatable.getLatestTimestamp()
  const latestTimestampMs =
    typeof apiLatestTimestampValue === 'number'
      ? apiLatestTimestampValue
      : new Date(apiLatestTimestampValue).getTime()

  console.log('[AU Data Fetch] Using fallback timestamp:', latestTimestampMs)
  return latestTimestampMs
}
