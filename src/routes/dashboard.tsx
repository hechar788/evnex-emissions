/**
 * @fileoverview Dashboard route with SSR loader and React Query hydration.
 *
 * - Fetches AU emissions data from REST API during SSR
 * - Seeds React Query cache for client-side hydration
 * - Provides loader data through route context
 *
 * @module routes/dashboard
 */

import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'

import {
  CompareView,
  DashboardHeader,
  GenerationMix,
  QuickStats,
  RegionalBreakdown,
} from '@/components/dashboard'
import {
  CountryDashboardLoadingSkeleton,
  CompareViewLoadingSkeleton,
  QuickStatsLoadingSkeleton,
  GenerationMixLoadingSkeleton,
} from '@/components/dashboard/skeleton/LoadingSkeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { auQueryKeys, useAuData, useDataTimestamps, useNzData, useSyncedAutoRefresh } from '@/hooks'
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

  // Track when data actually changes (not just when fetched)
  const { lastUpdated: auLastUpdated } = useDataTimestamps(auData)
  const { lastUpdated: nzLastUpdated } = useDataTimestamps(nzData)

  // Force re-render every second to update relative time display
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

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

  // Synced auto-refresh for both AU and NZ data sources
  const { isEnabled: isAutoRefreshEnabled, toggle: toggleAutoRefresh } = useSyncedAutoRefresh(
    [
      { refetch: auRefetch, isFetching: auFetching },
      { refetch: nzRefetch, isFetching: nzFetching },
    ],
    { intervalMs: 5 * 60 * 1000 } // 5 minutes
  )

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
        {/* Dashboard Header */}
        <DashboardHeader
          activeCountry={activeCountry}
          onRefresh={handleRefresh}
          isFetching={isAnyFetching}
          isAutoRefreshEnabled={isAutoRefreshEnabled}
          onToggleAutoRefresh={toggleAutoRefresh}
          lastFetched={lastFetched}
          lastUpdated={lastUpdated}
          auError={auError}
          auIsError={auIsError}
          auRefetch={auRefetch}
          nzError={nzError}
          nzIsError={nzIsError}
          nzRefetch={nzRefetch}
        />

        {/* Scrollable Content */}
        <div className="w-full py-8">
          <div className="mx-auto w-full max-w-7xl px-4">
            <TabsContent value="australia" className="space-y-6 w-full">
            {auFetching ? (
              <CountryDashboardLoadingSkeleton />
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
                <QuickStatsLoadingSkeleton />
                <GenerationMixLoadingSkeleton />
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
              <CompareViewLoadingSkeleton />
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
