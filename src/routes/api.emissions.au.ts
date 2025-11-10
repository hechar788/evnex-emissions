/**
 * @fileoverview Australian emissions data API endpoint.
 *
 * REST endpoint serving normalized Australian emissions snapshots.
 * Fetches real-time data from OpenElectricity and returns country-level
 * metrics plus regional breakdowns for all NEM regions.
 *
 * @endpoint GET /api/emissions/au
 * @returns {CountryEmissionsSnapshot} AU emissions data with regional breakdowns
 */

import { createFileRoute } from '@tanstack/react-router'
import { json } from '@tanstack/react-start'

import { loadAuSnapshot } from '@/data/openelectricity.server'
import type { ApiErrorPayload } from '@/types/emissions'

/**
 * API route for Australian emissions data.
 *
 * GET handler fetches latest 5-minute interval data from OpenElectricity,
 * normalizes it into CountryEmissionsSnapshot format, and returns JSON.
 *
 * Response includes:
 * - Country-level aggregates (demand, carbon intensity, generation mix)
 * - Regional breakdowns (QLD, NSW, VIC, SA, TAS)
 * - Metadata (timestamp, source, freshness)
 *
 * @example
 * ```ts
 * // Client-side fetch
 * const response = await fetch('/api/emissions/au')
 * const snapshot: CountryEmissionsSnapshot = await response.json()
 * ```
 */
export const Route = createFileRoute('/api/emissions/au')({
  server: {
    handlers: {
      GET: async () => {
        try {
          const snapshot = await loadAuSnapshot()

          return json(snapshot, {
            headers: {
              'Cache-Control': 'public, max-age=300', // 5 minutes
              'Content-Type': 'application/json',
            },
          })
        } catch (error) {
          const errorPayload: ApiErrorPayload = {
            message: error instanceof Error ? error.message : 'Failed to fetch Australian emissions data',
            code: 'FETCH_ERROR',
            details: error instanceof Error ? { cause: error.cause } : undefined,
          }

          return json(errorPayload, {
            status: 500,
            headers: {
              'Content-Type': 'application/json',
            },
          })
        }
      },
    },
  },
})
