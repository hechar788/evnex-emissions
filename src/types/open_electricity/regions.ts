export type NemRegion = 'QLD' | 'NSW' | 'VIC' | 'SA' | 'TAS'
export type NemRegionCode = 'QLD1' | 'NSW1' | 'VIC1' | 'SA1' | 'TAS1'

export const NEM_REGION_CODES: readonly NemRegionCode[] = ['QLD1', 'NSW1', 'VIC1', 'SA1', 'TAS1'] as const

export const NEM_REGION_KEY_BY_CODE: Record<NemRegionCode, NemRegion> = {
  QLD1: 'QLD',
  NSW1: 'NSW',
  VIC1: 'VIC',
  SA1: 'SA',
  TAS1: 'TAS',
}
