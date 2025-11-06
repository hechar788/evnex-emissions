declare module 'openelectricity' {
  import type {
    OpenElectricityClientConfig,
    OpenElectricityTimeSeriesResponse,
    OpenElectricityDataRow,
    OpenElectricityMetric,
    OpenElectricityNetworkCode,
    OpenElectricityNetworkTimeSeriesParams,
  } from './open_electricity'

  export class OpenElectricityClient {
    constructor(config?: OpenElectricityClientConfig)
    getNetworkData<Row extends OpenElectricityDataRow = OpenElectricityDataRow>(
      network: OpenElectricityNetworkCode,
      metrics: readonly OpenElectricityMetric[],
      params?: OpenElectricityNetworkTimeSeriesParams,
    ): Promise<OpenElectricityTimeSeriesResponse<Row>>
  }

  export class OpenElectricityError extends Error {}
  export class NoDataFound extends Error {}
}
