/**
 * @fileoverview NEM (National Electricity Market) region type definitions.
 *
 * Defines types and mappings for Australian NEM regions used in the
 * OpenElectricity data model. Maps between OpenElectricity region codes
 * (NSW1, QLD1, etc.) and application-friendly identifiers (NSW, QLD, etc.).
 *
 * @module types/open_electricity/regions
 */

/**
 * Friendly NEM region identifiers.
 *
 * Used throughout the application for regional data indexing.
 * Corresponds to Australian states/territories in the NEM.
 */
export type NemRegion = 'QLD' | 'NSW' | 'VIC' | 'SA' | 'TAS'

/**
 * OpenElectricity NEM region codes.
 *
 * These are the actual codes returned by the OpenElectricity API.
 * Suffixed with '1' to indicate the primary interconnected region.
 */
export type NemRegionCode = 'QLD1' | 'NSW1' | 'VIC1' | 'SA1' | 'TAS1'

/**
 * Array of all NEM region codes.
 * Useful for iteration and validation.
 */
export const NEM_REGION_CODES: readonly NemRegionCode[] = [
  'QLD1',
  'NSW1',
  'VIC1',
  'SA1',
  'TAS1',
] as const

/**
 * Maps OpenElectricity region codes to friendly region identifiers.
 *
 * Used to normalize OpenElectricity data into application format.
 *
 * @example
 * ```ts
 * const friendlyRegion = NEM_REGION_KEY_BY_CODE['NSW1']  // 'NSW'
 * ```
 */
export const NEM_REGION_KEY_BY_CODE: Record<NemRegionCode, NemRegion> = {
  QLD1: 'QLD',
  NSW1: 'NSW',
  VIC1: 'VIC',
  SA1: 'SA',
  TAS1: 'TAS',
}
