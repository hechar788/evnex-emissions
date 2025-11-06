import type { FuelType } from '../../emissions'

export type NzGenerationFuelCode = 'bat' | 'cg' | 'cog' | 'gas' | 'geo' | 'hyd' | 'liq' | 'sol' | 'win'

export const NZ_GENERATION_FUEL_CODES: readonly NzGenerationFuelCode[] = [
  'bat', 'cg', 'cog', 'gas', 'geo', 'hyd', 'liq', 'sol', 'win',
] as const

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
