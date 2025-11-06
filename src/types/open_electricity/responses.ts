import type {
  OpenElectricityInterval,
  OpenElectricityMetric,
  OpenElectricityNetworkCode,
  OpenElectricityNetworkTimeSeriesParams,
  OpenElectricityPrimaryGrouping,
  OpenElectricitySecondaryGrouping,
} from './common'
import type {
  OpenElectricityDataRow,
  OpenElectricityDataTable,
} from './datatable'

export interface OpenElectricityApiErrorBody {
  type: string
  title: string
  detail?: string
  status?: number
  instance?: string
  errors?: Record<string, unknown>
}

export interface OpenElectricityApiError extends Error {
  status?: number
  body?: OpenElectricityApiErrorBody
  cause?: unknown
}

export type OpenElectricityTimeSeriesResult<Row extends OpenElectricityDataRow = OpenElectricityDataRow> = Row & { interval: string }

export interface OpenElectricityNetworkTimeSeries<Row extends OpenElectricityDataRow = OpenElectricityDataRow> {
  network_code: OpenElectricityNetworkCode | (string & {})
  metric: OpenElectricityMetric | (string & {})
  unit: string
  interval: OpenElectricityInterval
  start: string
  end: string
  groupings: readonly (
    | OpenElectricityPrimaryGrouping
    | OpenElectricitySecondaryGrouping
  )[]
  results: readonly OpenElectricityTimeSeriesResult<Row>[]
  network_timezone_offset: string
}

export interface OpenElectricityApiResponse<T> {
  data: T
  status?: number
  message?: string
  meta?: Record<string, unknown>
}

export interface OpenElectricityClientConfig {
  apiKey?: string
  baseUrl?: string
}

export interface OpenElectricityTimeSeriesResponse<Row extends OpenElectricityDataRow = OpenElectricityDataRow> {
  response: OpenElectricityApiResponse<OpenElectricityNetworkTimeSeries<Row>[]>
  datatable?: OpenElectricityDataTable<Row>
}

export interface OpenElectricityClient {
  getNetworkData<Row extends OpenElectricityDataRow = OpenElectricityDataRow>(
    networkCode: OpenElectricityNetworkCode,
    metrics: readonly OpenElectricityMetric[],
    params?: OpenElectricityNetworkTimeSeriesParams,
  ): Promise<OpenElectricityTimeSeriesResponse<Row>>
}
