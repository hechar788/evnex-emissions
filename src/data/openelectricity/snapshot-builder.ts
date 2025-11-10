/**
 * @fileoverview Snapshot building logic for emissions data.
 *
 * Transforms aggregated raw data into structured CountryEmissionsSnapshot
 * and RegionEmissionsSnapshot objects. Calculates carbon intensity,
 * renewable share, and generation mix percentages.
 *
 * @module data/openelectricity/snapshot-builder
 */

import type {
  CountryEmissionsSnapshot,
  RegionEmissionsSnapshot,
  SnapshotMetadata,
} from '@/types/emissions'
import type { NemRegion } from '@/types/open_electricity/regions'
import { clamp } from '@/lib/number-utils'

import type { AggregatedData, RegionAccumulator } from './aggregators'

/**
 * Builds snapshot metadata with timestamp and source information.
 *
 * @param timestampIso - ISO timestamp string for the snapshot
 * @returns SnapshotMetadata with network source and no caching
 * @internal
 */
const buildMetadata = (timestampIso: string): SnapshotMetadata => ({
  fetchedAt: timestampIso,
  expiresAt: null,
  stale: false,
  source: 'network',
})

/**
 * Builds a single region snapshot from accumulated data.
 *
 * Calculates:
 * - Carbon intensity (gCO2/kWh) from emissions and energy
 * - Renewable share percentage
 * - Generation mix with MW and percentage breakdown by fuel type
 *
 * @param regionKey - NEM region identifier
 * @param data - Accumulated regional metrics
 * @param timestampIso - ISO timestamp for the snapshot
 * @returns Structured regional emissions snapshot
 * @internal
 */
const buildRegionSnapshot = (
  regionKey: NemRegion,
  data: RegionAccumulator,
  timestampIso: string,
): RegionEmissionsSnapshot => {
  const generationMix = Array.from(data.generationTotals.entries()).map(([fuel, megawatts]) => ({
    fuel,
    megawatts: clamp(megawatts),
    percentage: data.totalPower === 0 ? 0 : Math.round((megawatts / data.totalPower) * 10000) / 100,
  }))

  const renewableShare =
    data.totalPower === 0 ? null : Math.round((data.renewablePower / data.totalPower) * 10000) / 100

  const carbonIntensity = data.totalEnergy === 0 ? 0 : (data.totalEmissions * 1000) / data.totalEnergy

  return {
    region: regionKey,
    demandMW: data.demandMW,
    carbonIntensity: {
      current: carbonIntensity,
      previous: null,
      change: null,
      unit: 'gCO2/kWh',
      renewableShare,
      lastUpdated: timestampIso,
    },
    generationMix,
    metadata: buildMetadata(timestampIso),
  }
}

/**
 * Builds country-level snapshot from aggregated data.
 *
 * Aggregates all regional data into a single country snapshot for Australia.
 * Calculates national-level metrics:
 * - Total demand across all regions
 * - National carbon intensity
 * - National renewable share
 * - Generation mix breakdown by fuel type
 *
 * Also includes individual region snapshots in the `regions` field.
 *
 * @param data - Aggregated country and regional data
 * @param timestampIso - ISO timestamp for the snapshot
 * @returns Complete country emissions snapshot with regional breakdowns
 *
 * @example
 * ```ts
 * const aggregated = aggregateRows(rows)
 * const snapshot = buildCountrySnapshot(aggregated, '2025-01-15T10:30:00Z')
 * // snapshot.country === 'AU'
 * // snapshot.regions.NSW contains NSW regional data
 * ```
 */
export const buildCountrySnapshot = (
  data: AggregatedData,
  timestampIso: string,
): CountryEmissionsSnapshot => {
  const generationMix = Array.from(data.countryGenerationTotals.entries()).map(([fuel, megawatts]) => ({
    fuel,
    megawatts: clamp(megawatts),
    percentage: data.countryPower === 0 ? 0 : Math.round((megawatts / data.countryPower) * 10000) / 100,
  }))

  const regions = Object.fromEntries(
    Array.from(data.regions.entries()).map(([regionKey, regionData]) => [
      regionKey,
      buildRegionSnapshot(regionKey, regionData, timestampIso),
    ]),
  ) as Record<NemRegion, RegionEmissionsSnapshot>

  return {
    country: 'AU',
    timestamp: timestampIso,
    totalDemandMW: data.countryDemand > 0 ? clamp(data.countryDemand) : null,
    carbonIntensity: {
      current: data.countryEnergy > 0 ? (data.countryEmissions * 1000) / data.countryEnergy : 0,
      previous: null,
      change: null,
      unit: 'gCO2/kWh',
      renewableShare:
        data.countryPower > 0
          ? Math.round((data.countryRenewablePower / data.countryPower) * 10000) / 100
          : null,
      lastUpdated: timestampIso,
    },
    generationMix,
    metadata: buildMetadata(timestampIso),
    regions: Object.keys(regions).length ? regions : undefined,
  }
}
