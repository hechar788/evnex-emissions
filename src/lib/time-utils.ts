/**
 * @fileoverview Time and date formatting utilities.
 *
 * Provides functions for formatting timestamps and relative time displays.
 *
 * @module lib/time-utils
 */

/**
 * Format a timestamp as relative time (e.g., "5m ago", "2h ago").
 *
 * Converts a timestamp to a human-readable relative time string.
 * For times within 24 hours, shows relative format (Xs, Xm, Xh ago).
 * For older times, shows the time in HH:MM format.
 *
 * @param timestamp - Unix timestamp in milliseconds, or null
 * @returns Formatted relative time string, or "Never" if timestamp is null
 *
 * @example
 * ```typescript
 * // 30 seconds ago
 * formatRelativeTime(Date.now() - 30000) // "30s ago"
 *
 * // 5 minutes ago
 * formatRelativeTime(Date.now() - 5 * 60 * 1000) // "5m ago"
 *
 * // 2 hours ago
 * formatRelativeTime(Date.now() - 2 * 60 * 60 * 1000) // "2h ago"
 *
 * // Yesterday
 * formatRelativeTime(Date.now() - 25 * 60 * 60 * 1000) // "14:30" (time format)
 *
 * // No timestamp
 * formatRelativeTime(null) // "Never"
 * ```
 */
export function formatRelativeTime(timestamp: number | null): string {
  if (!timestamp) return 'Never'

  const now = Date.now()
  const diffMs = now - timestamp
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)

  if (diffSeconds < 60) {
    return `${diffSeconds}s ago`
  } else if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  } else if (diffHours < 24) {
    return `${diffHours}h ago`
  } else {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}
