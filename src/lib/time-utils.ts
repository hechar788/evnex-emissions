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
    // Use UTC for consistency with the rest of the app
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'UTC'
    })
  }
}

/**
 * Format a timestamp as a readable date and time string in UTC.
 *
 * Always displays timestamps in UTC timezone with "UTC" suffix.
 *
 * @param timestamp - ISO 8601 timestamp string or Unix timestamp in milliseconds, or null
 * @returns Formatted date/time string in UTC, or "Unknown" if timestamp is null/invalid
 *
 * @example
 * ```typescript
 * // Today
 * formatDataTimestamp(new Date().toISOString()) // "Jan 11, 9:35 AM UTC"
 *
 * // Yesterday
 * formatDataTimestamp(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // "Jan 10, 14:30 UTC"
 *
 * // With milliseconds
 * formatDataTimestamp(Date.now()) // "Jan 11, 9:35 AM UTC"
 * ```
 */
export function formatDataTimestamp(timestamp: string | number | null): string {
  if (!timestamp) return 'Unknown'

  let date: Date
  if (typeof timestamp === 'string') {
    date = new Date(timestamp)
  } else {
    date = new Date(timestamp)
  }

  if (isNaN(date.getTime())) {
    return 'Unknown'
  }

  // Always show date and time in UTC
  const dateStr = date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'UTC'
  })
  const timeStr = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'UTC',
    hour12: true
  })
  return `${dateStr}, ${timeStr} UTC`
}

/**
 * Format a timestamp as a readable date and time string in New Zealand Time (NZT).
 *
 * Always displays timestamps in Pacific/Auckland timezone (NZT/NZDT).
 *
 * @param timestamp - ISO 8601 timestamp string or Unix timestamp in milliseconds, or null
 * @returns Formatted date/time string in NZT, or "Unknown" if timestamp is null/invalid
 *
 * @example
 * ```typescript
 * // Today
 * formatNzDataTimestamp(new Date().toISOString()) // "Jan 11, 9:35 AM NZT"
 *
 * // Yesterday
 * formatNzDataTimestamp(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // "Jan 10, 14:30 NZT"
 *
 * // With milliseconds
 * formatNzDataTimestamp(Date.now()) // "Jan 11, 9:35 AM NZT"
 * ```
 */
export function formatNzDataTimestamp(timestamp: string | number | null): string {
  if (!timestamp) return 'Unknown'

  let date: Date
  if (typeof timestamp === 'string') {
    date = new Date(timestamp)
  } else {
    date = new Date(timestamp)
  }

  if (isNaN(date.getTime())) {
    return 'Unknown'
  }

  // Always show date and time in New Zealand Time (Pacific/Auckland)
  const dateStr = date.toLocaleDateString('en-NZ', { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'Pacific/Auckland'
  })
  const timeStr = date.toLocaleTimeString('en-NZ', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Pacific/Auckland',
    hour12: true
  })
  
  // Determine if it's NZDT (daylight saving) or NZT (standard time)
  // Pacific/Auckland uses NZDT from last Sunday in September to first Sunday in April
  const tzName = Intl.DateTimeFormat('en-NZ', {
    timeZone: 'Pacific/Auckland',
    timeZoneName: 'short'
  }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || 'NZT'
  
  return `${dateStr}, ${timeStr} ${tzName}`
}

/**
 * Format a timestamp as a readable date and time string in Australian Eastern Time (AEST/AEDT).
 *
 * Always displays timestamps in Australia/Sydney timezone (AEST/AEDT).
 *
 * @param timestamp - ISO 8601 timestamp string or Unix timestamp in milliseconds, or null
 * @returns Formatted date/time string in AEST/AEDT, or "Unknown" if timestamp is null/invalid
 *
 * @example
 * ```typescript
 * // Today
 * formatAuDataTimestamp(new Date().toISOString()) // "Jan 11, 9:35 AM AEST"
 *
 * // Yesterday
 * formatAuDataTimestamp(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // "Jan 10, 14:30 AEST"
 *
 * // With milliseconds
 * formatAuDataTimestamp(Date.now()) // "Jan 11, 9:35 AM AEST"
 * ```
 */
export function formatAuDataTimestamp(timestamp: string | number | null): string {
  if (!timestamp) return 'Unknown'

  let date: Date
  if (typeof timestamp === 'string') {
    date = new Date(timestamp)
  } else {
    date = new Date(timestamp)
  }

  if (isNaN(date.getTime())) {
    return 'Unknown'
  }

  // Always show date and time in Australian Eastern Time (Australia/Sydney)
  const dateStr = date.toLocaleDateString('en-AU', { 
    month: 'short', 
    day: 'numeric',
    timeZone: 'Australia/Sydney'
  })
  const timeStr = date.toLocaleTimeString('en-AU', { 
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Australia/Sydney',
    hour12: true
  })
  
  // Determine if it's AEDT (daylight saving) or AEST (standard time)
  // Australia/Sydney uses AEDT from first Sunday in October to first Sunday in April
  const tzName = Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Sydney',
    timeZoneName: 'short'
  }).formatToParts(date).find(part => part.type === 'timeZoneName')?.value || 'AEST'
  
  return `${dateStr}, ${timeStr} ${tzName}`
}
