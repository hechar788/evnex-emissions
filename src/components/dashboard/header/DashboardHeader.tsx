/**
 * @fileoverview Dashboard header component.
 *
 * Provides sticky header with title, controls, error alerts, and navigation tabs.
 *
 * @module components/dashboard/DashboardHeader
 */

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { ClientOnly } from '@/components/ClientOnly'
import { TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RefreshControls } from './RefreshControls'

interface DashboardHeaderProps {
  /** Current active country tab */
  activeCountry: 'australia' | 'new-zealand' | 'compare'
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
  /** Australia data error */
  auError: Error | null
  /** Whether Australia data is in error state */
  auIsError: boolean
  /** Function to retry Australia data fetch */
  auRefetch: () => void
  /** New Zealand data error */
  nzError: Error | null
  /** Whether New Zealand data is in error state */
  nzIsError: boolean
  /** Function to retry New Zealand data fetch */
  nzRefetch: () => void
}

/**
 * Dashboard header component.
 *
 * Renders sticky header with:
 * - Dashboard title and description
 * - Refresh controls (manual + auto)
 * - Error alerts for AU/NZ data
 * - Country navigation tabs
 */
export function DashboardHeader({
  activeCountry,
  onRefresh,
  isFetching,
  isAutoRefreshEnabled,
  onToggleAutoRefresh,
  lastFetched,
  dataTimestamp,
  auDataTimestamp,
  nzDataTimestamp,
  auError,
  auIsError,
  auRefetch,
  nzError,
  nzIsError,
  nzRefetch,
}: DashboardHeaderProps) {
  return (
    <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4 py-4">
        {/* Title and Refresh Controls */}
        <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 md:max-w-2xl">
            <h1 className="text-2xl font-bold md:text-4xl">Emissions Dashboard</h1>
            <p className="mt-2 text-sm text-muted-foreground md:text-base">
              Real-time electricity carbon intensity and generation mix
            </p>
          </div>
          <RefreshControls
            activeCountry={activeCountry}
            onRefresh={onRefresh}
            isFetching={isFetching}
            isAutoRefreshEnabled={isAutoRefreshEnabled}
            onToggleAutoRefresh={onToggleAutoRefresh}
            lastFetched={lastFetched}
            dataTimestamp={dataTimestamp}
            auDataTimestamp={auDataTimestamp}
            nzDataTimestamp={nzDataTimestamp}
          />
        </div>

        {/* Error Alerts */}
        {auIsError && (
          <Alert className="mb-4 border-red-600 bg-red-950/20">
            <AlertDescription className="text-red-400">
              Failed to fetch Australia data: {auError instanceof Error ? auError.message : 'Unknown error'}
              <Button
                onClick={() => auRefetch()}
                variant="outline"
                size="sm"
                className="ml-2 mt-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}
        {nzIsError && (activeCountry === 'new-zealand' || activeCountry === 'compare') && (
          <Alert className="mb-4 border-red-600 bg-red-950/20">
            <AlertDescription className="text-red-400">
              Failed to fetch New Zealand data: {nzError instanceof Error ? nzError.message : 'Unknown error'}
              <Button
                onClick={() => nzRefetch()}
                variant="outline"
                size="sm"
                className="ml-2 mt-2"
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Country Tabs */}
        <ClientOnly
          fallback={
            <div className="grid w-full max-w-2xl grid-cols-3 gap-1 rounded-lg bg-muted p-1">
              <div className="h-9 rounded-md bg-background" />
              <div className="h-9 rounded-md" />
              <div className="h-9 rounded-md" />
            </div>
          }
        >
          <TabsList className="grid w-full max-w-2xl grid-cols-3">
            <TabsTrigger
              value="australia"
              className="cursor-pointer hover:bg-primary/[0.025] transition-all"
            >
              Australia
            </TabsTrigger>
            <TabsTrigger
              value="new-zealand"
              className="cursor-pointer hover:bg-primary/[0.025] transition-all"
            >
              New Zealand
            </TabsTrigger>
            <TabsTrigger
              value="compare"
              className="cursor-pointer hover:bg-primary/[0.025] transition-all"
            >
              Compare
            </TabsTrigger>
          </TabsList>
        </ClientOnly>
      </div>
    </div>
  )
}
