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

export type OpenElectricityDataValue = string | number | boolean | Date | null | undefined

export interface OpenElectricityDataRow
  extends Record<string, OpenElectricityDataValue> {
  interval: Date | string
  trading_interval?: Date | string
  network?: OpenElectricityNetworkCode | (string & {})
  network_region?: NemRegionCode | (string & {})
  region?: string
  fueltech?: OpenElectricityFueltechId
  fueltech_group?: OpenElectricityFueltechGroup
  power?: number | null
  energy?: number | null
  emissions?: number | null
  demand?: number | null
  market_value?: number | null
}

export interface OpenElectricityNetworkFueltechRow
  extends OpenElectricityDataRow {
  interval: string
  network: OpenElectricityNetworkCode | (string & {})
  network_region: NemRegionCode | (string & {})
  fueltech: OpenElectricityFueltechId
}

export interface OpenElectricityDataTable<
  Row extends OpenElectricityDataRow = OpenElectricityDataRow,
> {
  interval?: OpenElectricityInterval
  rows?: readonly Row[]

  getRows(): Row[]
  getLatestTimestamp(): number
  filter(predicate: (row: Row) => boolean): OpenElectricityDataTable<Row>
  groupBy(
    columns: readonly string[],
    aggregation: OpenElectricityAggregationMethod,
  ): OpenElectricityDataTable<Row>
  sortBy(
    columns: readonly (keyof Row & string)[],
    ascending?: boolean,
  ): OpenElectricityDataTable<Row>
}
