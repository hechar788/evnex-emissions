/**
 * @fileoverview Dashboard route with SSR loader and React Query hydration.
 *
 * - Fetches AU emissions data from REST API during SSR
 * - Seeds React Query cache for client-side hydration
 * - Provides loader data through route context
 *
 * @module routes/dashboard
 */

import { CalendarSync, RefreshCw } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'

import { CompareView, GenerationMix, QuickStats, RegionalBreakdown } from '@/components/dashboard'
import { ClientOnly } from '@/components/ClientOnly'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { auQueryKeys, useAuData, useAutoRefresh, useNzData } from '@/hooks'
import type { CountryEmissionsSnapshot } from '@/types/emissions'

/**
 * Dashboard route with SSR loader.
 *
 * Loader workflow:
 * 1. Fetches AU snapshot from /api/emissions/au during SSR
 * 2. Seeds React Query cache with the snapshot
 * 3. Returns snapshot for immediate SSR rendering
 * 4. Client hydrates from cache, avoiding duplicate fetch
 *
 * NZ data is fetched client-side (requirement from planning docs).
 */
export const Route = createFileRoute('/dashboard')({
  loader: async ({ context }) => {
    const queryClient = context.queryClient

    // Fetch AU emissions from REST API
    const response = await fetch('http://localhost:3000/api/emissions/au')
    if (!response.ok) {
      throw new Error(`Failed to fetch AU emissions: ${response.statusText}`)
    }

    const auSnapshot: CountryEmissionsSnapshot = await response.json()

    // Seed React Query cache for client hydration
    queryClient.setQueryData(auQueryKeys.current(), auSnapshot)

    return { auSnapshot }
  },

  component: DashboardView,

  // Pending component shows loading state during navigation
  pendingComponent: () => (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-700" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg bg-slate-800" />
          ))}
        </div>
      </div>
    </div>
  ),

  // Error component for failed loads
  errorComponent: ({ error }) => (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-lg border border-red-500 bg-red-950/20 p-6">
        <h2 className="mb-2 text-xl font-semibold text-red-400">Failed to load dashboard</h2>
        <p className="text-red-300">{error.message}</p>
      </div>
    </div>
  ),
})

/**
 * Dashboard view component.
 *
 * Renders emissions dashboard with:
 * - Country tabs (Australia / New Zealand)
 * - Carbon intensity metrics
 * - Generation mix visualization
 * - Demand statistics
 * - Regional/National breakdowns
 * - Manual refresh controls
 */
function DashboardView() {
  // Get loader data to ensure hydration uses exact same data as SSR
  const { auSnapshot } = Route.useLoaderData()
  const { data: auData, refetch: auRefetch, isFetching: auFetching, error: auError, isError: auIsError, dataUpdatedAt: auDataUpdatedAt } = useAuData(auSnapshot)
  const { data: nzData, refetch: nzRefetch, isFetching: nzFetching, error: nzError, isError: nzIsError, dataUpdatedAt: nzDataUpdatedAt } = useNzData()
  const [activeCountry, setActiveCountry] = useState<'australia' | 'new-zealand' | 'compare'>('australia')

  // Track last updated timestamps (when data actually changes)
  const [auLastUpdated, setAuLastUpdated] = useState<number | null>(null)
  const [nzLastUpdated, setNzLastUpdated] = useState<number | null>(null)
  
  // Track previous data timestamps to detect changes
  const auPrevTimestampRef = useRef<string | null>(null)
  const nzPrevTimestampRef = useRef<string | null>(null)

  // Force re-render every second to update relative time display
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Track when AU data actually changes (not just when fetched)
  useEffect(() => {
    if (auData) {
      const currentTimestamp = auData.carbonIntensity.lastUpdated || auData.timestamp
      if (auPrevTimestampRef.current !== currentTimestamp) {
        // Data actually changed - always use the data's timestamp (don't lie to the user)
        if (auPrevTimestampRef.current === null) {
          // First load - use the data's timestamp
          const dataTimestamp = new Date(currentTimestamp).getTime()
          setAuLastUpdated(dataTimestamp)
        } else {
          // Subsequent change - use current time to show when we detected the change
          setAuLastUpdated(Date.now())
        }
        auPrevTimestampRef.current = currentTimestamp
      }
    }
  }, [auData])

  // Track when NZ data actually changes (not just when fetched)
  useEffect(() => {
    if (nzData) {
      const currentTimestamp = nzData.carbonIntensity.lastUpdated || nzData.timestamp
      if (nzPrevTimestampRef.current !== currentTimestamp) {
        // Data actually changed - always use the data's timestamp (don't lie to the user)
        if (nzPrevTimestampRef.current === null) {
          // First load - use the data's timestamp
          const dataTimestamp = new Date(currentTimestamp).getTime()
          setNzLastUpdated(dataTimestamp)
        } else {
          // Subsequent change - use current time to show when we detected the change
          setNzLastUpdated(Date.now())
        }
        nzPrevTimestampRef.current = currentTimestamp
      }
    }
  }, [nzData])

  const isAustralia = activeCountry === 'australia'
  const currentFetching = isAustralia ? auFetching : nzFetching

  // Handle refresh based on active tab
  const handleRefresh = () => {
    if (activeCountry === 'compare') {
      // Refresh both when on compare tab
      auRefetch()
      nzRefetch()
    } else if (activeCountry === 'australia') {
      auRefetch()
    } else {
      nzRefetch()
    }
  }

  // Show fetching state if either is fetching (for compare tab)
  const isAnyFetching = activeCountry === 'compare' ? (auFetching || nzFetching) : currentFetching

  // Auto-refresh hooks - always enabled when auto-refresh is on (refreshes all tabs)
  // The enabled prop is always true so intervals run regardless of active tab
  // The hook's internal state tracks user's toggle preference
  const auAutoRefresh = useAutoRefresh({
    refetch: auRefetch,
    isFetching: auFetching,
    intervalMs: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled - auto-refresh works for all tabs
  })

  const nzAutoRefresh = useAutoRefresh({
    refetch: nzRefetch,
    isFetching: nzFetching,
    intervalMs: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled - auto-refresh works for all tabs
  })

  // Combined auto-refresh state for UI
  // Auto-refresh is considered enabled if either (or both) are enabled
  const isAutoRefreshEnabled = auAutoRefresh.isEnabled || nzAutoRefresh.isEnabled

  const toggleAutoRefresh = () => {
    // When toggling auto-refresh, always toggle both AU and NZ
    // This ensures auto-refresh works for all tabs when enabled
    const shouldEnable = !isAutoRefreshEnabled
    
    if (shouldEnable) {
      // Enabling - turn on both
      auAutoRefresh.enable()
      nzAutoRefresh.enable()
    } else {
      // Disabling - turn off both
      auAutoRefresh.disable()
      nzAutoRefresh.disable()
    }
  }

  // Helper to format timestamp as relative time
  const formatTimestamp = (timestamp: number | null): string => {
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

  // Determine which timestamps to show based on active country
  const lastFetched = activeCountry === 'compare'
    ? Math.max(auDataUpdatedAt || 0, nzDataUpdatedAt || 0)
    : activeCountry === 'australia'
    ? auDataUpdatedAt || 0
    : nzDataUpdatedAt || 0

  const lastUpdated = activeCountry === 'compare'
    ? Math.max(auLastUpdated || 0, nzLastUpdated || 0)
    : activeCountry === 'australia'
    ? auLastUpdated || 0
    : nzLastUpdated || 0

  return (
    <Tabs 
      value={activeCountry} 
      onValueChange={(v) => setActiveCountry(v as any)} 
      className="w-full"
    >
      <div className="min-h-screen bg-background">
        {/* Sticky Header */}
        <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto max-w-7xl px-4 py-4">
            {/* Title and Refresh Button */}
            <div className="mb-4 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex-1 md:max-w-2xl">
                <h1 className="text-2xl font-bold md:text-4xl">Emissions Dashboard</h1>
                <p className="mt-2 text-sm text-muted-foreground md:text-base">
                  Real-time electricity carbon intensity and generation mix
                </p>
              </div>
              <div className="flex flex-col gap-2 md:items-end md:flex-shrink-0">
                <div className="flex gap-2">
                  <Button
                    onClick={handleRefresh}
                    disabled={isAnyFetching}
                    variant="outline"
                    className="flex-1 cursor-pointer gap-2 sm:w-auto sm:flex-none"
                  >
                    <RefreshCw className={`h-4 w-4 ${isAnyFetching ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                  <Button
                    onClick={toggleAutoRefresh}
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
                      <div>Last Updated: --</div>
                    </div>
                  }
                >
                  <div className="flex flex-col text-xs text-muted-foreground md:items-end">
                    <div>Last Fetched: {formatTimestamp(lastFetched)}</div>
                    <div>Last Updated: {formatTimestamp(lastUpdated)}</div>
                  </div>
                </ClientOnly>
              </div>
            </div>

            {/* Error alerts */}
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
            <ClientOnly fallback={
              <div className="grid w-full max-w-2xl grid-cols-3 gap-1 rounded-lg bg-muted p-1">
                <div className="h-9 rounded-md bg-background" />
                <div className="h-9 rounded-md" />
                <div className="h-9 rounded-md" />
              </div>
            }>
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

        {/* Scrollable Content */}
        <div className="w-full py-8">
          <div className="mx-auto w-full max-w-7xl px-4">
            <TabsContent value="australia" className="space-y-6 w-full">
            {auFetching ? (
              <>
                {/* Loading skeletons */}
                <div className="grid gap-4 md:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-6">
                      <Skeleton className="mb-2 h-4 w-24" />
                      <Skeleton className="h-8 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <Skeleton className="mb-4 h-6 w-48" />
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <Skeleton className="mb-4 h-6 w-48" />
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-8 w-24" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Quick statistics */}
                <QuickStats data={auData} />

                {/* Generation mix */}
                <GenerationMix generationMix={auData.generationMix} country="AU" />

                {/* Regional breakdown */}
                <RegionalBreakdown country="AU" auRegions={auData.regions} />
              </>
            )}
            </TabsContent>
          </div>

          <div className="mx-auto w-full max-w-7xl px-4">
            <TabsContent value="new-zealand" className="space-y-6 w-full">
            {nzFetching ? (
              <>
                {/* Loading skeletons */}
                <div className="grid gap-4 md:grid-cols-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-6">
                      <Skeleton className="mb-2 h-4 w-24" />
                      <Skeleton className="h-8 w-32 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <Skeleton className="mb-4 h-6 w-48" />
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-32" />
                        </div>
                        <Skeleton className="h-2 w-full" />
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : nzData ? (
              <>
                {/* Quick statistics */}
                <QuickStats data={nzData} />

                {/* Generation mix */}
                <GenerationMix generationMix={nzData.generationMix} country="NZ" />
              </>
            ) : (
              <Alert>
                <AlertDescription>Loading New Zealand data...</AlertDescription>
              </Alert>
            )}
            </TabsContent>
          </div>

          <div className="mx-auto w-full max-w-7xl px-4">
            <TabsContent value="compare" className="space-y-6 w-full">
            {(auFetching || nzFetching) ? (
              <>
                {/* Loading skeletons for compare view */}
                <div className="grid gap-4 md:grid-cols-2">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-lg border border-border bg-card p-6">
                      <Skeleton className="mb-2 h-4 w-32" />
                      <Skeleton className="h-8 w-24 mb-2" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-border bg-card p-6">
                  <Skeleton className="mb-4 h-6 w-48" />
                  <Skeleton className="h-64 w-full" />
                </div>
              </>
            ) : nzData ? (
              <CompareView auData={auData} nzData={nzData} />
            ) : (
              <Alert>
                <AlertDescription>Loading New Zealand data...</AlertDescription>
              </Alert>
            )}
            </TabsContent>
          </div>
        </div>
      </div>
    </Tabs>
  )
}
