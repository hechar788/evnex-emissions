/**
 * @fileoverview Dashboard route with SSR loader and React Query hydration.
 *
 * - Fetches AU emissions data from REST API during SSR
 * - Seeds React Query cache for client-side hydration
 * - Provides loader data through route context
 *
 * @module routes/dashboard
 */

import { RefreshCw } from 'lucide-react'
import { createFileRoute } from '@tanstack/react-router'

import { AusRegionalData, GenerationMix, QuickStats } from '@/components/dashboard'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { useDashboardData } from '@/hooks'
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
    queryClient.setQueryData(['dashboard', 'au', 'current'], auSnapshot)

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
 * - Carbon intensity metrics
 * - Generation mix visualization
 * - Demand statistics
 * - Regional breakdowns (AU only)
 * - Manual refresh controls
 */
function DashboardView() {
  const { data, refetch, isFetching, metadata } = useDashboardData()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">Emissions Dashboard</h1>
            <p className="mt-2 text-muted-foreground">
              Real-time Australian electricity carbon intensity and generation mix
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            disabled={isFetching}
            variant="outline"
            className="cursor-pointer gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stale data warning */}
        {metadata.stale && (
          <Alert className="mb-6 border-yellow-600 bg-yellow-950/20">
            <AlertDescription className="text-yellow-400">
              Data may be stale. Last fetched:{' '}
              {new Date(metadata.fetchedAt).toLocaleString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
              })}
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          {/* Quick statistics */}
          <QuickStats data={data} />

          {/* Generation mix */}
          <GenerationMix generationMix={data.generationMix} />

          {/* Regional breakdown */}
          {data.regions && <AusRegionalData regions={data.regions} />}
        </div>
      </div>
    </div>
  )
}
