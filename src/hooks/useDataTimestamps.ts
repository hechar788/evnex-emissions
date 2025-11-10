/**
 * @fileoverview Hook for tracking when data actually changes (not just when fetched).
 *
 * Monitors data timestamps and tracks when the data content changes rather than
 * just when the fetch completes. This provides accurate "last updated" times.
 *
 * @module hooks/useDataTimestamps
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Data with timestamp information.
 */
interface DataWithTimestamp {
  /** Carbon intensity metrics containing lastUpdated timestamp */
  carbonIntensity: {
    /** ISO 8601 timestamp of when the carbon intensity data was last updated */
    lastUpdated: string
  }
  /** Fallback ISO 8601 timestamp for the overall snapshot */
  timestamp: string
}

/**
 * Track when data actually changes versus when it's fetched.
 *
 * This hook monitors data timestamps and determines when the data content
 * actually changes. On the first load, it uses the data's own timestamp.
 * On subsequent changes, it uses the current time to show when the change
 * was detected.
 *
 * This prevents showing misleading "just now" timestamps when data was
 * actually updated hours ago.
 *
 * @param data - Data object with timestamp information, or undefined if not loaded
 * @returns Object containing the last updated timestamp in milliseconds
 *
 * @example
 * ```typescript
 * function Dashboard() {
 *   const { data } = useAuData()
 *   const { lastUpdated } = useDataTimestamps(data)
 *
 *   return <div>Last updated: {formatRelativeTime(lastUpdated)}</div>
 * }
 * ```
 */
export function useDataTimestamps(data: DataWithTimestamp | undefined) {
  const [lastUpdated, setLastUpdated] = useState<number | null>(null)
  const prevTimestampRef = useRef<string | null>(null)

  useEffect(() => {
    if (!data) return

    const currentTimestamp = data.carbonIntensity.lastUpdated || data.timestamp

    if (prevTimestampRef.current !== currentTimestamp) {
      // Data actually changed - update timestamp
      if (prevTimestampRef.current === null) {
        // First load - use the data's timestamp (when it was actually generated)
        const dataTimestamp = new Date(currentTimestamp).getTime()
        setLastUpdated(dataTimestamp)
      } else {
        // Subsequent change - use current time to show when we detected the change
        setLastUpdated(Date.now())
      }
      prevTimestampRef.current = currentTimestamp
    }
  }, [data])

  return { lastUpdated }
}
