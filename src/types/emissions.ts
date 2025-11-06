// Shared emissions and energy data types used across the application.

import { NemRegion } from "./open_electricity"

export type CountryCode = 'NZ' | 'AU'

export type DataSource = 'network' | 'cache'

export interface SnapshotMetadata {
  fetchedAt: string
  expiresAt: string | null
  stale: boolean
  source: DataSource
  errors?: string[]
}

export type FuelType =
  | 'hydro'
  | 'wind'
  | 'solar'
  | 'gas'
  | 'coal'
  | 'geothermal'
  | 'battery'
  | 'cogeneration'
  | 'biomass'
  | 'diesel'
  | 'imports'
  | 'other'

export interface GenerationMixEntry {
  fuel: FuelType
  megawatts: number
  percentage: number
}

export type GenerationMix = GenerationMixEntry[]

export interface CarbonIntensityMetrics {
  current: number
  previous: number | null
  change: number | null
  unit: 'gCO2/kWh'
  renewableShare: number | null
  lastUpdated: string
  rolling24h?: {
    min: number | null
    max: number | null
  }
  averages?: {
    monthly?: number | null
    yearly?: number | null
    percentileOfYear?: number | null
  }
}

export interface CountryEmissionsSnapshot {
  country: CountryCode
  timestamp: string
  totalDemandMW: number | null
  carbonIntensity: CarbonIntensityMetrics
  generationMix: GenerationMix
  metadata: SnapshotMetadata
  regions?: Record<NemRegion, RegionEmissionsSnapshot>
}

export interface RegionEmissionsSnapshot {
  region: NemRegion
  demandMW: number | null
  carbonIntensity: CarbonIntensityMetrics
  generationMix: GenerationMix
  metadata: SnapshotMetadata
}

export interface ApiErrorPayload {
  message: string
  code?: string
  details?: unknown
}
