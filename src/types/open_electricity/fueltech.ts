import type { FuelType } from '../emissions'

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

export type KnownOpenElectricityFueltech = typeof OPEN_ELECTRICITY_KNOWN_FUELTECHS[number]

export type OpenElectricityFueltechId = KnownOpenElectricityFueltech | (string & {})

export type OpenElectricityFueltechGroup =
  | 'renewable'
  | 'fossil_fuel'
  | 'storage'
  | 'demand_response'
  | 'interconnector'
  | 'other'
  | (string & {})

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

export const OPEN_ELECTRICITY_RENEWABLE_FUELTECHS: readonly KnownOpenElectricityFueltech[] = [
  'bioenergy_biogas',
  'bioenergy_biomass',
  'hydro',
  'solar_rooftop',
  'solar_utility',
  'wind',
] as const

export const OPEN_ELECTRICITY_STORAGE_FUELTECHS: readonly KnownOpenElectricityFueltech[] = [
  'battery_charging',
  'battery_discharging',
  'pumps',
] as const

