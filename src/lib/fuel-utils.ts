/**
 * @fileoverview Centralized fuel type utilities for emissions data.
 *
 * Provides shared constants and functions for working with fuel types,
 * renewable/non-renewable categorization, and generation mix calculations.
 *
 * @module lib/fuel-utils
 */

import type { FuelType } from '@/types/emissions'

/**
 * Centralized list of renewable fuel types.
 * Used across the application for consistent renewable energy calculations.
 */
export const RENEWABLE_FUELS: readonly FuelType[] = [
  'hydro',
  'wind',
  'solar',
  'geothermal',
  'biomass',
] as const

/**
 * Check if a fuel type is renewable.
 *
 * @param fuel - The fuel type to check
 * @returns True if the fuel is renewable, false otherwise
 */
export function isRenewableFuelType(fuel: FuelType): boolean {
  return RENEWABLE_FUELS.includes(fuel)
}

/**
 * Result of categorizing fuel types into renewable and non-renewable.
 */
export interface CategorizedFuels {
  /** Renewable fuel entries with percentages */
  renewable: Array<{ fuel: string; percentage: number }>
  /** Non-renewable fuel entries with percentages */
  nonRenewable: Array<{ fuel: string; percentage: number }>
  /** Total percentage of renewable generation */
  renewableTotal: number
  /** Total percentage of non-renewable generation */
  nonRenewableTotal: number
}

/**
 * Categorize generation mix into renewable and non-renewable fuels.
 *
 * Takes a generation mix array and splits it into renewable and non-renewable
 * categories based on the RENEWABLE_FUELS constant.
 *
 * @param generationMix - Array of fuel types with their generation percentages
 * @returns Categorized fuels with totals
 *
 * @example
 * ```typescript
 * const mix = [
 *   { fuel: 'solar', percentage: 20 },
 *   { fuel: 'coal', percentage: 50 },
 *   { fuel: 'wind', percentage: 30 }
 * ]
 * const result = categorizeFuelTypes(mix)
 * // result.renewableTotal === 50
 * // result.nonRenewableTotal === 50
 * ```
 */
export function categorizeFuelTypes(
  generationMix: Array<{ fuel: FuelType; percentage: number }>
): CategorizedFuels {
  const renewable: Array<{ fuel: string; percentage: number }> = []
  const nonRenewable: Array<{ fuel: string; percentage: number }> = []
  let renewableTotal = 0
  let nonRenewableTotal = 0

  for (const item of generationMix) {
    if (isRenewableFuelType(item.fuel)) {
      renewable.push(item)
      renewableTotal += item.percentage
    } else {
      nonRenewable.push(item)
      nonRenewableTotal += item.percentage
    }
  }

  return {
    renewable,
    nonRenewable,
    renewableTotal,
    nonRenewableTotal,
  }
}
