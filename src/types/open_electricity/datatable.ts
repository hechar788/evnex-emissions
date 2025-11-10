/**
 * @fileoverview OpenElectricity DataTable type definitions.
 *
 * Defines types for OpenElectricity SDK DataTable structures and row formats.
 * The DataTable is the primary interface for working with time-series data
 * returned by the SDK.
 *
 * @module types/open_electricity/datatable
 */

import type {
  OpenElectricityAggregationMethod,
  OpenElectricityNetworkCode,
  OpenElectricityInterval,
} from './common'
import type {
  OpenElectricityFueltechGroup,
  OpenElectricityFueltechId,
} from './fueltech'
import type { NemRegionCode } from './regions'

/**
 * Possible data values in OpenElectricity rows.
 */
export type OpenElectricityDataValue = string | number | boolean | Date | null | undefined

/**
 * Base data row structure from OpenElectricity API.
 *
 * Contains common fields plus metric values. Can be extended
 * with additional dynamic fields returned by specific queries.
 */
export interface OpenElectricityDataRow
  extends Record<string, OpenElectricityDataValue> {
  /** Timestamp of this data interval */
  interval: Date | string
  /** Trading interval timestamp (may differ from data interval) */
  trading_interval?: Date | string
  /** Network code */
  network?: OpenElectricityNetworkCode | (string & {})
  /** NEM region code (when grouped by region) */
  network_region?: NemRegionCode | (string & {})
  /** Region identifier (generic) */
  region?: string
  /** Fuel technology identifier (when grouped by fueltech) */
  fueltech?: OpenElectricityFueltechId
  /** Fuel technology group (when grouped by fueltech_group) */
  fueltech_group?: OpenElectricityFueltechGroup
  /** Power generation in MW */
  power?: number | null
  /** Energy generated in MWh */
  energy?: number | null
  /** CO2 emissions in tonnes */
  emissions?: number | null
  /** Electricity demand in MW */
  demand?: number | null
  /** Market value in dollars */
  market_value?: number | null
}

/**
 * Specialized row type for network data grouped by region and fueltech.
 *
 * Used when fetching NEM data with primaryGrouping: 'network_region'
 * and secondaryGrouping: 'fueltech'. Guarantees presence of region
 * and fueltech fields.
 */
export interface OpenElectricityNetworkFueltechRow
  extends OpenElectricityDataRow {
  /** Interval timestamp (always string for network data) */
  interval: string
  /** Network code (guaranteed present) */
  network: OpenElectricityNetworkCode | (string & {})
  /** NEM region code (guaranteed present) */
  network_region: NemRegionCode | (string & {})
  /** Fuel technology identifier (guaranteed present) */
  fueltech: OpenElectricityFueltechId
}

/**
 * OpenElectricity DataTable interface.
 *
 * Provides methods for filtering, grouping, and transforming
 * time-series data returned by the SDK.
 *
 * @template Row - Type of rows contained in the table
 */
export interface OpenElectricityDataTable<
  Row extends OpenElectricityDataRow = OpenElectricityDataRow,
> {
  /** Interval granularity of the data */
  interval?: OpenElectricityInterval
  /** Readonly array of data rows */
  rows?: readonly Row[]

  /**
   * Gets all rows as a mutable array.
   */
  getRows(): Row[]

  /**
   * Gets the timestamp of the latest interval in the dataset.
   * @returns Timestamp in milliseconds
   */
  getLatestTimestamp(): number

  /**
   * Filters rows based on a predicate function.
   * @param predicate - Function that returns true for rows to keep
   * @returns New DataTable with filtered rows
   */
  filter(predicate: (row: Row) => boolean): OpenElectricityDataTable<Row>

  /**
   * Groups rows by specified columns and aggregates values.
   * @param columns - Column names to group by
   * @param aggregation - Aggregation method ('sum' or 'mean')
   * @returns New DataTable with grouped rows
   */
  groupBy(
    columns: readonly string[],
    aggregation: OpenElectricityAggregationMethod,
  ): OpenElectricityDataTable<Row>

  /**
   * Sorts rows by specified columns.
   * @param columns - Column names to sort by
   * @param ascending - Sort direction (default true)
   * @returns New DataTable with sorted rows
   */
  sortBy(
    columns: readonly (keyof Row & string)[],
    ascending?: boolean,
  ): OpenElectricityDataTable<Row>
}
