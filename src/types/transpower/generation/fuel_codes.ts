/**
 * @fileoverview New Zealand (Transpower) fuel code type definitions.
 *
 * Maps Transpower/EM6 fuel codes to application FuelType enum and provides
 * human-readable labels. Used for client-side NZ data normalization.
 *
 * @module types/transpower/generation/fuel_codes
 */

import type { FuelType } from '../../emissions'

/**
 * NZ generation fuel codes from Transpower/EM6 API.
 *
 * Abbreviations:
 * - bat: Battery
 * - cg: Coal
 * - cog: Cogeneration
 * - gas: Gas
 * - geo: Geothermal
 * - hyd: Hydro
 * - liq: Liquid fuels (diesel)
 * - sol: Solar
 * - win: Wind
 */
export type NzGenerationFuelCode = 'bat' | 'cg' | 'cog' | 'gas' | 'geo' | 'hyd' | 'liq' | 'sol' | 'win'

/**
 * Array of all NZ fuel codes.
 * Useful for iteration and validation.
 */
export const NZ_GENERATION_FUEL_CODES: readonly NzGenerationFuelCode[] = [
  'bat',
  'cg',
  'cog',
  'gas',
  'geo',
  'hyd',
  'liq',
  'sol',
  'win',
] as const

/**
 * Maps NZ fuel codes to application FuelType enum.
 *
 * Used to normalize Transpower data into shared emissions schema.
 *
 * @example
 * ```ts
 * const fuelType = NZ_FUEL_CODE_TO_FUEL_TYPE['hyd']  // 'hydro'
 * ```
 */
export const NZ_FUEL_CODE_TO_FUEL_TYPE: Record<NzGenerationFuelCode, FuelType> = {
  bat: 'battery',
  cg: 'coal',
  cog: 'cogeneration',
  gas: 'gas',
  geo: 'geothermal',
  hyd: 'hydro',
  liq: 'diesel',
  sol: 'solar',
  win: 'wind',
}

/**
 * Human-readable labels for NZ fuel codes.
 * Used for UI display.
 */
export const NZ_FUEL_CODE_LABELS: Record<NzGenerationFuelCode, string> = {
  bat: 'Battery',
  cg: 'Coal',
  cog: 'Cogeneration',
  gas: 'Gas',
  geo: 'Geothermal',
  hyd: 'Hydro',
  liq: 'Liquid Fuels',
  sol: 'Solar',
  win: 'Wind',
}
