/**
 * @fileoverview Refresh controls component for dashboard.
 *
 * Provides manual refresh button, auto-refresh toggle, and timestamp displays.
 *
 * @module components/dashboard/RefreshControls
 */

import { CalendarSync, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ClientOnly } from '@/components/ClientOnly'
import { formatRelativeTime, formatDataTimestamp } from '@/lib/time-utils'

interface RefreshControlsProps {
  /** Handler for manual refresh */
  onRefresh: () => void
  /** Whether data is currently being fetched */
  isFetching: boolean
  /** Whether auto-refresh is enabled */
  isAutoRefreshEnabled: boolean
  /** Handler for toggling auto-refresh */
  onToggleAutoRefresh: () => void
  /** Timestamp of last fetch (ms) */
  lastFetched: number
  /** ISO timestamp string of when the data is from */
  dataTimestamp: string | null
  /** ISO timestamp string of when the Australian data is from (for compare tab) */
  auDataTimestamp: string | null
  /** ISO timestamp string of when the New Zealand data is from (for compare tab) */
  nzDataTimestamp: string | null
}

/**
 * Refresh controls component.
 *
 * Displays:
 * - Manual refresh button with loading spinner
 * - Auto-refresh toggle button with indicator
 * - Last fetched/updated timestamps (client-only)
 */
export function RefreshControls({
  onRefresh,
  isFetching,
  isAutoRefreshEnabled,
  onToggleAutoRefresh,
  lastFetched,
  dataTimestamp,
  auDataTimestamp,
  nzDataTimestamp,
}: RefreshControlsProps) {
  return (
    <div className="flex flex-col gap-2 md:items-end md:flex-shrink-0">
      <div className="flex gap-2">
        <Button
          onClick={onRefresh}
          disabled={isFetching}
          variant="outline"
          className="flex-1 cursor-pointer gap-2 sm:w-auto sm:flex-none"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        <Button
          onClick={onToggleAutoRefresh}
          variant={isAutoRefreshEnabled ? 'default' : 'outline'}
          className="flex-1 cursor-pointer gap-2 relative sm:w-auto sm:flex-none"
        >
          <CalendarSync className="h-4 w-4" />
          Auto Refresh
          {isAutoRefreshEnabled && (
            <span className="ml-1 h-2 w-2 rounded-full bg-white" />
          )}
        </Button>
      </div>
      <ClientOnly
        fallback={
          <div className="flex flex-col text-xs text-muted-foreground md:items-end">
            <div>Last Fetched: --</div>
            {auDataTimestamp !== null && nzDataTimestamp !== null ? (
              <>
                <div>Australian Data: --</div>
                <div>New Zealand Data: --</div>
              </>
            ) : (
              <div>Data from: --</div>
            )}
          </div>
        }
      >
        <div className="flex flex-col text-xs text-muted-foreground md:items-end">
          <div>Last Fetched: {formatRelativeTime(lastFetched)}</div>
          {auDataTimestamp !== null && nzDataTimestamp !== null ? (
            <>
              <div>Australian Data: {formatDataTimestamp(auDataTimestamp)}</div>
              <div>New Zealand Data: {formatDataTimestamp(nzDataTimestamp)}</div>
            </>
          ) : (
            <div>Data from: {formatDataTimestamp(dataTimestamp)}</div>
          )}
        </div>
      </ClientOnly>
    </div>
  )
}
