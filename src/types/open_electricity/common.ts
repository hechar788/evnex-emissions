export type OpenElectricityNetworkCode = 'NEM' | 'WEM' | 'AU'

export type OpenElectricityInterval = '5m' | '30m' | '1h' | '1d'

export type OpenElectricityMetric =
  | 'power'
  | 'energy'
  | 'emissions'
  | 'market_value'
  | 'demand'

export type OpenElectricityPrimaryGrouping = 'network' | 'network_region'

export type OpenElectricitySecondaryGrouping = 'fueltech' | 'fueltech_group'

export type OpenElectricityGrouping =
  | OpenElectricityPrimaryGrouping
  | OpenElectricitySecondaryGrouping

export type OpenElectricityAggregationMethod = 'sum' | 'mean'

export interface OpenElectricityNetworkTimeSeriesParams {
  interval?: OpenElectricityInterval
  dateStart?: string
  dateEnd?: string
  primaryGrouping?: OpenElectricityPrimaryGrouping
  secondaryGrouping?: OpenElectricitySecondaryGrouping
}
