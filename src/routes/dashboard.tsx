/**
 * @fileoverview Dashboard route with SSR loader and React Query hydration.
 *
 * - Fetches AU emissions data from REST API during SSR
 * - Seeds React Query cache for client-side hydration
 * - Router SSR integration automatically dehydrates QueryClient state
 *
 * @module routes/dashboard
 */

import { createFileRoute } from '@tanstack/react-router'

import { DashboardView, DashboardPending, DashboardError } from '@/components/dashboard'
import { createQueryKey } from '@/lib/query-utils'
import type { CountryEmissionsSnapshot } from '@/types/emissions'

/**
 * Dashboard route with SSR loader.
 *
 * Loader workflow:
 * 1. Fetches AU snapshot from /api/emissions/au during SSR
 * 2. Seeds React Query cache with the snapshot
 * 3. Router SSR integration automatically dehydrates QueryClient state
 * 4. Client hydrates from dehydrated state, avoiding duplicate fetch
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
    queryClient.setQueryData(createQueryKey('au'), auSnapshot)
  },

  component: DashboardView,
  pendingComponent: DashboardPending,
  errorComponent: DashboardError,
})
