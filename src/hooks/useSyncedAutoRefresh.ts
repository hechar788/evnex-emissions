/**
 * @fileoverview Synced auto-refresh hook for multiple data sources.
 *
 * Manages automatic polling for multiple data sources with synchronized
 * enable/disable state. When auto-refresh is enabled, all data sources
 * refresh together. When disabled, all stop.
 *
 * @module hooks/useSyncedAutoRefresh
 */

import { useAutoRefresh } from './useAutoRefresh'

/**
 * Configuration for a single data source to auto-refresh.
 */
export interface RefreshSource {
  /** Function to call to refresh this data source */
  refetch: () => void | Promise<unknown>
  /** Whether this data source is currently fetching */
  isFetching: boolean
}

/**
 * Options for synced auto-refresh.
 */
export interface UseSyncedAutoRefreshOptions {
  /** Auto-refresh interval in milliseconds (default: 5 minutes) */
  intervalMs?: number
  /** Whether the intervals should run (default: true) */
  enabled?: boolean
}

/**
 * Hook for managing synchronized auto-refresh across multiple data sources.
 *
 * This hook creates individual auto-refresh instances for each data source
 * but keeps them synchronized - toggling auto-refresh on/off affects all
 * sources simultaneously.
 *
 * Useful when you have multiple data sources (e.g., AU and NZ emissions)
 * and want a single toggle that controls auto-refresh for both.
 *
 * @param sources - Array of data sources to auto-refresh
 * @param options - Auto-refresh configuration
 * @returns Synced auto-refresh state and controls
 *
 * @example
 * ```typescript
 * function Dashboard() {
 *   const { data: auData, refetch: auRefetch, isFetching: auFetching } = useAuData()
 *   const { data: nzData, refetch: nzRefetch, isFetching: nzFetching } = useNzData()
 *
 *   const { isEnabled, toggle } = useSyncedAutoRefresh(
 *     [
 *       { refetch: auRefetch, isFetching: auFetching },
 *       { refetch: nzRefetch, isFetching: nzFetching },
 *     ],
 *     { intervalMs: 5 * 60 * 1000 }
 *   )
 *
 *   return (
 *     <Button onClick={toggle}>
 *       {isEnabled ? 'Disable' : 'Enable'} Auto Refresh
 *     </Button>
 *   )
 * }
 * ```
 */
export function useSyncedAutoRefresh(
  sources: RefreshSource[],
  options: UseSyncedAutoRefreshOptions = {}
) {
  const { intervalMs = 5 * 60 * 1000, enabled = true } = options

  // Create individual auto-refresh instances for each source
  const refreshInstances = sources.map((source) =>
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useAutoRefresh({
      refetch: source.refetch,
      isFetching: source.isFetching,
      intervalMs,
      enabled,
    })
  )

  // Combine state: auto-refresh is enabled if ANY instance is enabled
  const isEnabled = refreshInstances.some((instance) => instance.isEnabled)

  // Synchronized toggle: enable/disable all instances together
  const toggle = () => {
    const shouldEnable = !isEnabled

    for (const instance of refreshInstances) {
      if (shouldEnable) {
        instance.enable()
      } else {
        instance.disable()
      }
    }
  }

  // Individual enable/disable controls (also synchronized)
  const enable = () => {
    for (const instance of refreshInstances) {
      instance.enable()
    }
  }

  const disable = () => {
    for (const instance of refreshInstances) {
      instance.disable()
    }
  }

  return {
    /** Whether auto-refresh is currently enabled for any source */
    isEnabled,
    /** Toggle auto-refresh on/off for all sources */
    toggle,
    /** Enable auto-refresh for all sources */
    enable,
    /** Disable auto-refresh for all sources */
    disable,
  }
}
