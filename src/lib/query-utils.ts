/**
 * @fileoverview React Query utility functions and configurations.
 *
 * Shared query patterns, configurations, and helpers for emissions data fetching.
 *
 * @module lib/query-utils
 */

import type { UseQueryOptions } from '@tanstack/react-query'

/**
 * Default query configuration for emissions data.
 *
 * Standard options applied to all emissions queries:
 * - 5 minute stale time (matches OpenElectricity cadence)
 * - 10 minute garbage collection
 * - No refetch on window focus
 * - Limited retries
 */
export const emissionsQueryDefaults = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: false,
  retry: 2,
} satisfies Partial<UseQueryOptions>

/**
 * Creates a namespaced query key factory.
 *
 * Standard pattern for organizing query keys by feature/country.
 *
 * @param namespace - The namespace prefix (e.g., 'au', 'nz')
 * @returns Query key factory with all/current methods
 *
 * @example
 * ```ts
 * const auKeys = createQueryKeyFactory('au')
 * auKeys.all() // ['au']
 * auKeys.current() // ['au', 'current']
 * ```
 */
export function createQueryKeyFactory(namespace: string) {
  return {
    all: () => [namespace] as const,
    current: () => [namespace, 'current'] as const,
  }
}

/**
 * Generic fetch wrapper with error handling.
 *
 * Handles common fetch patterns: status checking, JSON parsing, error messages.
 *
 * @param url - URL to fetch
 * @param errorPrefix - Error message prefix for context
 * @returns Parsed JSON response
 * @throws Error with descriptive message on failure
 *
 * @example
 * ```ts
 * const data = await fetchJson('/api/emissions/au', 'Failed to fetch AU data')
 * ```
 */
export async function fetchJson<T = unknown>(url: string, errorPrefix: string): Promise<T> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`${errorPrefix}: ${response.statusText}`)
  }
  return response.json()
}

/**
 * Fetches JSON with timeout support.
 *
 * Adds timeout protection to prevent hanging requests.
 *
 * @param url - URL to fetch
 * @param errorPrefix - Error message prefix
 * @param timeoutMs - Timeout in milliseconds (default: 10s)
 * @returns Parsed JSON response
 * @throws Error on timeout or fetch failure
 */
export async function fetchJsonWithTimeout<T = unknown>(
  url: string,
  errorPrefix: string,
  timeoutMs = 10000
): Promise<T> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const response = await fetch(url, { signal: controller.signal })
    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`${errorPrefix}: ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`${errorPrefix}: Request timeout after ${timeoutMs}ms`)
    }
    throw error
  }
}
