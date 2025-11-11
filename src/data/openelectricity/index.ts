/**
 * OpenElectricity data layer barrel export.
 * Provides modular access to Australian emissions data processing.
 */

export { getOpenElectricityClient } from './client'
export { buildSnapshotFromRows } from './aggregation'
export { mapRegionCode } from './region-mapping'
export { aggregateRows } from './aggregators'
export { buildCountrySnapshot } from './snapshot-builder'
export {
  formatTimezoneNaiveISO,
  getLast24HoursDateRange,
  findLatestTimestamp,
  extractLatestTimestampWithFallback
} from './date-utils'
export { mergeDemandIntoRows } from './demand-merger'

export type { RegionAccumulator, AggregatedData } from './aggregators'
export type { DateRange, LatestTimestampResult } from './date-utils'
