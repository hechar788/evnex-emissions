/**
 * @fileoverview OpenElectricity fueltech type mappings.
 *
 * Maps OpenElectricity SDK fueltech codes to our application's shared FuelType enum.
 * Provides utilities for identifying renewable fuel types.
 *
 * @module types/open_electricity/fueltech
 */

import type { FuelType } from '../emissions'

/**
 * Known OpenElectricity fueltech identifiers.
 * Represents all fuel technology types recognized by the OpenElectricity platform.
 */
export const OPEN_ELECTRICITY_KNOWN_FUELTECHS = [
  'battery_charging',
  'battery_discharging',
  'bioenergy_biogas',
  'bioenergy_biomass',
  'coal_black',
  'coal_brown',
  'demand_response',
  'distillate',
  'gas_ccgt',
  'gas_ocgt',
  'gas_recip',
  'gas_steam',
  'gas_waste',
  'hydro',
  'imports',
  'pumps',
  'solar_rooftop',
  'solar_utility',
  'wind',
] as const

/**
 * Union type of all known OpenElectricity fueltech identifiers.
 */
export type KnownOpenElectricityFueltech = typeof OPEN_ELECTRICITY_KNOWN_FUELTECHS[number]

/**
 * OpenElectricity fueltech identifier type.
 * Accepts known fueltechs or any other string value.
 */
export type OpenElectricityFueltechId = KnownOpenElectricityFueltech | (string & {})

/**
 * Fueltech grouping categories used by OpenElectricity.
 */
export type OpenElectricityFueltechGroup =
  | 'renewable'
  | 'fossil_fuel'
  | 'storage'
  | 'demand_response'
  | 'interconnector'
  | 'other'
  | (string & {})

/**
 * Maps OpenElectricity fueltech codes to application FuelType enum.
 * Used to normalize OpenElectricity data into our shared emissions schema.
 */
export const OPEN_ELECTRICITY_FUELTECH_FUEL_TYPE_MAP: Record<KnownOpenElectricityFueltech, FuelType> = {
  battery_charging: 'battery',
  battery_discharging: 'battery',
  bioenergy_biogas: 'biomass',
  bioenergy_biomass: 'biomass',
  coal_black: 'coal',
  coal_brown: 'coal',
  demand_response: 'other',
  distillate: 'diesel',
  gas_ccgt: 'gas',
  gas_ocgt: 'gas',
  gas_recip: 'gas',
  gas_steam: 'gas',
  gas_waste: 'gas',
  hydro: 'hydro',
  imports: 'imports',
  pumps: 'hydro',
  solar_rooftop: 'solar',
  solar_utility: 'solar',
  wind: 'wind',
}

/**
 * List of renewable fueltechs recognized by OpenElectricity.
 * Used to calculate renewable energy share in generation mix.
 */
export const OPEN_ELECTRICITY_RENEWABLE_FUELTECHS: readonly KnownOpenElectricityFueltech[] = [
  'bioenergy_biogas',
  'bioenergy_biomass',
  'hydro',
  'solar_rooftop',
  'solar_utility',
  'wind',
] as const

/**
 * List of energy storage fueltechs.
 * Includes batteries and pumped hydro storage.
 */
export const OPEN_ELECTRICITY_STORAGE_FUELTECHS: readonly KnownOpenElectricityFueltech[] = [
  'battery_charging',
  'battery_discharging',
  'pumps',
] as const

/**
 * Maps OpenElectricity fueltech codes to application FuelType enum.
 *
 * Handles both known and unknown fueltech identifiers gracefully by
 * falling back to 'other' for unrecognized codes.
 *
 * @param fueltech - OpenElectricity fueltech identifier (may be null/undefined)
 * @returns Corresponding FuelType or 'other' for unknown/invalid inputs
 *
 * @example
 * ```ts
 * mapFueltechToFuelType('solar_rooftop')  // 'solar'
 * mapFueltechToFuelType('gas_ccgt')       // 'gas'
 * mapFueltechToFuelType('unknown_fuel')   // 'other'
 * mapFueltechToFuelType(null)             // 'other'
 * ```
 */
export const mapFueltechToFuelType = (fueltech: string | null | undefined): FuelType => {
  if (!fueltech) return 'other'

  const mapped = OPEN_ELECTRICITY_FUELTECH_FUEL_TYPE_MAP[fueltech as KnownOpenElectricityFueltech]
  return mapped ?? 'other'
}

/**
 * Determines if a fuel type is renewable.
 *
 * Used to calculate renewable energy share in generation snapshots.
 * Considers hydro, wind, solar, and biomass as renewable.
 *
 * @param fuel - FuelType to check
 * @returns true if fuel is renewable, false otherwise
 */
export const isRenewableFuel = (fuel: FuelType): boolean =>
  fuel === 'hydro' || fuel === 'wind' || fuel === 'solar' || fuel === 'biomass'

