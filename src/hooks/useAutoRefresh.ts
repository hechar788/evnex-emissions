/**
 * @fileoverview Auto-refresh hook for emissions data.
 *
 * Manages automatic polling of emissions data with:
 * - Configurable interval (default: 5 minutes)
 * - Page Visibility API integration (pauses when tab is hidden)
 * - Overlap protection (skips if fetch is already in progress)
 * - Manual enable/disable toggle
 *
 * @module hooks/useAutoRefresh
 */

import { useEffect, useRef, useState } from 'react'

/**
 * Options for auto-refresh hook.
 */
interface UseAutoRefreshOptions {
  /** Refetch function to call on interval */
  refetch: () => void | Promise<unknown>
  /** Whether a fetch is currently in progress */
  isFetching: boolean
  /** Auto-refresh interval in milliseconds (default: 5 minutes) */
  intervalMs?: number
  /** Whether the interval should run (based on tab visibility, etc.) - does NOT control toggle state */
  enabled?: boolean
}

/**
 * Hook for managing automatic data refresh.
 *
 * Polls the provided refetch function at the specified interval.
 * Automatically pauses when the browser tab is hidden and resumes when visible.
 * Skips scheduled refreshes if a fetch is already in progress.
 *
 * @param options - Auto-refresh configuration
 * @returns Auto-refresh state and controls
 *
 * @example
 * ```tsx
 * function Dashboard() {
 *   const { data, refetch, isFetching } = useAuData()
 *   const { isEnabled, toggle } = useAutoRefresh({
 *     refetch,
 *     isFetching,
 *     intervalMs: 5 * 60 * 1000, // 5 minutes
 *   })
 *
 *   return (
 *     <Button onClick={toggle}>
 *       {isEnabled ? 'Disable' : 'Enable'} Auto Refresh
 *     </Button>
 *   )
 * }
 * ```
 */
export function useAutoRefresh({
  refetch,
  isFetching,
  intervalMs = 5 * 60 * 1000, // 5 minutes default
  enabled = true, // Controls whether interval runs, not the toggle state
}: UseAutoRefreshOptions) {
  // Toggle state is always false initially - user must explicitly enable it
  const [isEnabled, setIsEnabled] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isVisibleRef = useRef(true)
  const previousEnabledRef = useRef(false)

  // Toggle auto-refresh on/off
  const toggle = () => {
    setIsEnabled((prev) => !prev)
  }

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      isVisibleRef.current = !document.hidden
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  // Set up interval when enabled AND the enabled prop is true
  useEffect(() => {
    if (!isEnabled || !enabled) {
      // Clear interval if disabled or enabled prop is false
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      previousEnabledRef.current = isEnabled
      return
    }

    // If this is the first time being enabled, trigger immediate refresh
    const wasJustEnabled = !previousEnabledRef.current && isEnabled
    previousEnabledRef.current = isEnabled

    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Trigger immediate refresh if just enabled
    if (wasJustEnabled && isVisibleRef.current && !isFetching) {
      refetch()
    }

    // Set up new interval
    intervalRef.current = setInterval(() => {
      // Skip if tab is hidden
      if (!isVisibleRef.current) {
        return
      }

      // Skip if fetch is already in progress
      if (isFetching) {
        return
      }

      // Trigger refetch
      refetch()
    }, intervalMs)

    // Cleanup on unmount or when disabled
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [isEnabled, enabled, intervalMs, refetch, isFetching])

  return {
    /** Whether auto-refresh is currently enabled */
    isEnabled,
    /** Toggle auto-refresh on/off */
    toggle,
    /** Enable auto-refresh */
    enable: () => setIsEnabled(true),
    /** Disable auto-refresh */
    disable: () => setIsEnabled(false),
  }
}

