/**
 * @fileoverview Data aggregation logic for OpenElectricity rows.
 *
 * Processes raw OpenElectricity network data rows and accumulates metrics
 * by region and fuel type. Handles power, energy, emissions, and demand data.
 *
 * @module data/openelectricity/aggregators
 */

import type { FuelType } from '@/types/emissions'
import type { OpenElectricityNetworkFueltechRow } from '@/types/open_electricity/datatable'
import type { NemRegion } from '@/types/open_electricity/regions'
import { isRenewableFuel, mapFueltechToFuelType } from '@/types/open_electricity/fueltech'
import { clamp, toFiniteNumber } from '@/lib/number-utils'

import { mapRegionCode } from './region-mapping'

/**
 * Accumulator for a single NEM region's metrics.
 * Stores raw totals before snapshot transformation.
 */
export interface RegionAccumulator {
  /** Regional demand in megawatts (null if no demand data available) */
  demandMW: number | null
  /** Total energy generated in MWh */
  totalEnergy: number
  /** Total emissions in tonnes CO2 */
  totalEmissions: number
  /** Total power generation in MW */
  totalPower: number
  /** Power from renewable sources in MW */
  renewablePower: number
  /** Power generation by fuel type in MW */
  generationTotals: Map<FuelType, number>
}

/**
 * Aggregated data for all NEM regions and country-level totals.
 * Intermediate structure before snapshot building.
 */
export interface AggregatedData {
  /** Regional accumulators by NEM region */
  regions: Map<NemRegion, RegionAccumulator>
  /** Total country demand in MW */
  countryDemand: number
  /** Total country energy in MWh */
  countryEnergy: number
  /** Total country emissions in tonnes CO2 */
  countryEmissions: number
  /** Total country renewable power in MW */
  countryRenewablePower: number
  /** Total country power generation in MW */
  countryPower: number
  /** Country-level generation by fuel type in MW */
  countryGenerationTotals: Map<FuelType, number>
}

/**
 * Aggregates OpenElectricity rows into regional and country-level accumulators.
 *
 * Processes each row to:
 * 1. Map region codes and fuel types
 * 2. Accumulate power, energy, emissions, and demand by region
 * 3. Sum country-level totals
 * 4. Track renewable power separately for share calculations
 *
 * Rows with unknown region codes are silently skipped.
 *
 * @param rows - OpenElectricity network data rows to aggregate
 * @returns Aggregated regional and country data ready for snapshot building
 */
export const aggregateRows = (rows: OpenElectricityNetworkFueltechRow[]): AggregatedData => {
  const regions = new Map<NemRegion, RegionAccumulator>()
  const countryGenerationTotals = new Map<FuelType, number>()

  let countryDemand = 0
  let countryEnergy = 0
  let countryEmissions = 0
  let countryRenewablePower = 0
  let countryPower = 0

  for (const row of rows) {
    const regionKey = mapRegionCode(row.network_region as string | undefined)
    if (!regionKey) continue

    const fuel = mapFueltechToFuelType(row.fueltech ?? null)
    const power = clamp(toFiniteNumber(row.power))
    const energy = toFiniteNumber(row.energy)
    const emissions = toFiniteNumber(row.emissions)
    const demand = clamp(toFiniteNumber(row.demand))

    const region =
      regions.get(regionKey) ??
      (() => {
        const accumulator: RegionAccumulator = {
          demandMW: null,
          totalEnergy: 0,
          totalEmissions: 0,
          totalPower: 0,
          renewablePower: 0,
          generationTotals: new Map<FuelType, number>(),
        }
        regions.set(regionKey, accumulator)
        return accumulator
      })()

    if (demand > 0) {
      region.demandMW = demand
      countryDemand += demand
    }

    countryEnergy += energy
    countryEmissions += emissions
    countryPower += power

    region.totalEnergy += energy
    region.totalEmissions += emissions
    region.totalPower += power
    region.generationTotals.set(fuel, (region.generationTotals.get(fuel) ?? 0) + power)

    if (isRenewableFuel(fuel)) {
      region.renewablePower += power
      countryRenewablePower += power
    }

    countryGenerationTotals.set(fuel, (countryGenerationTotals.get(fuel) ?? 0) + power)
  }

  return {
    regions,
    countryDemand,
    countryEnergy,
    countryEmissions,
    countryRenewablePower,
    countryPower,
    countryGenerationTotals,
  }
}
