/**
 * @fileoverview Common OpenElectricity SDK type definitions.
 *
 * Defines shared types for OpenElectricity API parameters and options.
 * Used when configuring SDK requests for network time-series data.
 *
 * @module types/open_electricity/common
 */

/**
 * Supported electricity network codes.
 * - NEM: National Electricity Market (Eastern/Southern Australia)
 * - WEM: Wholesale Electricity Market (Western Australia)
 * - AU: All Australian markets combined
 */
export type OpenElectricityNetworkCode = 'NEM' | 'WEM' | 'AU'

/**
 * Time interval granularity for data aggregation.
 * - 5m: 5-minute intervals (highest resolution)
 * - 30m: 30-minute intervals
 * - 1h: Hourly intervals
 * - 1d: Daily intervals
 */
export type OpenElectricityInterval = '5m' | '30m' | '1h' | '1d'

/**
 * Available metrics from OpenElectricity API.
 * - power: Generation power in MW
 * - energy: Energy generated in MWh
 * - emissions: CO2 emissions in tonnes
 * - market_value: Market value in dollars
 * - demand: Electricity demand in MW
 */
export type OpenElectricityMetric =
  | 'power'
  | 'energy'
  | 'emissions'
  | 'market_value'
  | 'demand'

/**
 * Primary data grouping options.
 * - network: Group by entire network
 * - network_region: Group by NEM region (QLD, NSW, etc.)
 */
export type OpenElectricityPrimaryGrouping = 'network' | 'network_region'

/**
 * Secondary data grouping options.
 * - fueltech: Group by specific fuel technology
 * - fueltech_group: Group by fuel technology category
 */
export type OpenElectricitySecondaryGrouping = 'fueltech' | 'fueltech_group'

/**
 * All available grouping options.
 */
export type OpenElectricityGrouping =
  | OpenElectricityPrimaryGrouping
  | OpenElectricitySecondaryGrouping

/**
 * Aggregation methods for grouped data.
 * - sum: Sum values across group
 * - mean: Average values across group
 */
export type OpenElectricityAggregationMethod = 'sum' | 'mean'

/**
 * Parameters for network time-series data requests.
 */
export interface OpenElectricityNetworkTimeSeriesParams {
  /** Time interval granularity */
  interval?: OpenElectricityInterval
  /** Start date (ISO string in network local time) */
  dateStart?: string
  /** End date (ISO string in network local time) */
  dateEnd?: string
  /** Primary grouping dimension */
  primaryGrouping?: OpenElectricityPrimaryGrouping
  /** Secondary grouping dimension */
  secondaryGrouping?: OpenElectricitySecondaryGrouping
}
