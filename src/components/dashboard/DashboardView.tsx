/**
 * @fileoverview Main dashboard view component.
 *
 * Renders emissions dashboard with:
 * - Country tabs (Australia / New Zealand)
 * - Carbon intensity metrics
 * - Generation mix visualization
 * - Demand statistics
 * - Regional/National breakdowns
 * - Manual refresh controls
 *
 * @module components/dashboard/DashboardView
 */

import { useEffect, useState } from 'react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent } from '@/components/ui/tabs'
import { useAuData, useDataTimestamps, useNzData, useSyncedAutoRefresh } from '@/hooks'
import { CompareView } from '@/components/compare'

import { DashboardHeader } from './header/DashboardHeader'
import { GenerationMix } from './GenerationMix'
import { QuickStats } from './QuickStats'
import { RegionalBreakdown } from './regional_data/RegionalBreakdown'
import {
  CountryDashboardLoadingSkeleton,
  CompareViewLoadingSkeleton,
  QuickStatsLoadingSkeleton,
  GenerationMixLoadingSkeleton,
} from './skeleton/LoadingSkeleton'

/**
 * Dashboard view component.
 *
 * Fetches and displays emissions data for Australia and New Zealand.
 * Provides tabbed interface for country selection and comparison view.
 */
export function DashboardView() {
  // Query hooks automatically use hydrated cache from SSR loader
  const { data: auData, refetch: auRefetch, isFetching: auFetching, error: auError, isError: auIsError, dataUpdatedAt: auDataUpdatedAt } = useAuData()
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
