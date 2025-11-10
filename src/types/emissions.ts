/**
 * @fileoverview Core emissions and energy data type definitions.
 *
 * Shared type definitions used across both Australian and New Zealand
 * emissions data processing. Defines the canonical snapshot structure
 * that all data sources normalize into.
 *
 * @module types/emissions
 */

import { NemRegion } from './open_electricity'

/**
 * ISO country codes for supported countries.
 */
export type CountryCode = 'NZ' | 'AU'

/**
 * Data source indicator for snapshots.
 * - 'network': Fresh data from upstream API
 * - 'cache': Served from application cache
 */
export type DataSource = 'network' | 'cache'

/**
 * Metadata describing snapshot freshness and provenance.
 */
export interface SnapshotMetadata {
  /** ISO timestamp when data was fetched */
  fetchedAt: string
  /** ISO timestamp when cached data expires (null if no caching) */
  expiresAt: string | null
  /** Whether data is stale/outdated */
  stale: boolean
  /** Where the data came from */
  source: DataSource
  /** Error messages if fetch failed but cache was returned */
  errors?: string[]
}

/**
 * Normalized fuel type categories.
 *
 * Unified across different data sources (OpenElectricity, Transpower).
 * Maps various upstream fuel codes into consistent categories.
 */
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

/**
 * Single fuel type entry in generation mix.
 */
export interface GenerationMixEntry {
  /** Fuel type category */
  fuel: FuelType
  /** Power generation in megawatts */
  megawatts: number
  /** Percentage of total generation (0-100) */
  percentage: number
}

/**
 * Array of generation mix entries showing breakdown by fuel type.
 */
export type GenerationMix = GenerationMixEntry[]

/**
 * Carbon intensity metrics with historical context.
 *
 * Tracks current intensity, trends, and rolling statistics.
 */
export interface CarbonIntensityMetrics {
  /** Current carbon intensity in gCO2/kWh */
  current: number
  /** Previous interval's intensity (null if unavailable) */
  previous: number | null
  /** Change from previous interval (null if unavailable) */
  change: number | null
  /** Always 'gCO2/kWh' - included for clarity */
  unit: 'gCO2/kWh'
  /** Percentage of generation from renewable sources (0-100, null if unknown) */
  renewableShare: number | null
  /** ISO timestamp of this measurement */
  lastUpdated: string
  /** Optional 24-hour rolling statistics */
  rolling24h?: {
    /** Minimum intensity in last 24h */
    min: number | null
    /** Maximum intensity in last 24h */
    max: number | null
  }
  /** Optional longer-term averages */
  averages?: {
    /** Monthly average intensity */
    monthly?: number | null
    /** Yearly average intensity */
    yearly?: number | null
    /** Percentile rank within year (0-100) */
    percentileOfYear?: number | null
  }
}

/**
 * Complete emissions snapshot for a country.
 *
 * Primary data structure returned by data fetchers and served via API.
 * Contains country-level aggregates plus optional regional breakdowns.
 */
export interface CountryEmissionsSnapshot {
  /** Country code */
  country: CountryCode
  /** ISO timestamp of snapshot interval */
  timestamp: string
  /** Total electricity demand in megawatts (null if unavailable) */
  totalDemandMW: number | null
  /** Carbon intensity metrics with trends */
  carbonIntensity: CarbonIntensityMetrics
  /** Generation mix breakdown by fuel type */
  generationMix: GenerationMix
  /** Snapshot metadata (freshness, source) */
  metadata: SnapshotMetadata
  /** Regional breakdowns (only for AU, indexed by NEM region) */
  regions?: Record<NemRegion, RegionEmissionsSnapshot>
}

/**
 * Emissions snapshot for a single region.
 *
 * Used for Australian NEM regional data (QLD, NSW, VIC, SA, TAS).
 * Structure mirrors country snapshot but at regional granularity.
 */
export interface RegionEmissionsSnapshot {
  /** NEM region identifier */
  region: NemRegion
  /** Regional demand in megawatts (null if unavailable) */
  demandMW: number | null
  /** Regional carbon intensity metrics */
  carbonIntensity: CarbonIntensityMetrics
  /** Regional generation mix */
  generationMix: GenerationMix
  /** Snapshot metadata */
  metadata: SnapshotMetadata
}

/**
 * Standard API error response payload.
 */
export interface ApiErrorPayload {
  /** Human-readable error message */
  message: string
  /** Optional error code for programmatic handling */
  code?: string
  /** Additional error context */
  details?: unknown
}
