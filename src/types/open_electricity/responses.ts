/**
 * @fileoverview OpenElectricity API response type definitions.
 *
 * Defines types for OpenElectricity SDK responses, errors, and client configuration.
 * Used when interacting with the OpenElectricity API via the TypeScript SDK.
 *
 * @module types/open_electricity/responses
 */

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

/**
 * Error body structure from OpenElectricity API.
 * Follows RFC 7807 Problem Details format.
 */
export interface OpenElectricityApiErrorBody {
  /** Error type URI */
  type: string
  /** Human-readable error title */
  title: string
  /** Detailed error description */
  detail?: string
  /** HTTP status code */
  status?: number
  /** URI reference identifying the specific occurrence */
  instance?: string
  /** Additional error details */
  errors?: Record<string, unknown>
}

/**
 * Enhanced Error object for OpenElectricity API failures.
 */
export interface OpenElectricityApiError extends Error {
  /** HTTP status code */
  status?: number
  /** Parsed error response body */
  body?: OpenElectricityApiErrorBody
  /** Underlying error cause */
  cause?: unknown
}

/**
 * Single time-series result row.
 * Extends data row with guaranteed interval field.
 */
export type OpenElectricityTimeSeriesResult<Row extends OpenElectricityDataRow = OpenElectricityDataRow> = Row & { interval: string }

/**
 * Network time-series data structure.
 * Contains metadata and results for a single metric.
 */
export interface OpenElectricityNetworkTimeSeries<Row extends OpenElectricityDataRow = OpenElectricityDataRow> {
  /** Network code queried */
  network_code: OpenElectricityNetworkCode | (string & {})
  /** Metric measured */
  metric: OpenElectricityMetric | (string & {})
  /** Unit of measurement */
  unit: string
  /** Data interval granularity */
  interval: OpenElectricityInterval
  /** Start timestamp (ISO string) */
  start: string
  /** End timestamp (ISO string) */
  end: string
  /** Applied grouping dimensions */
  groupings: readonly (
    | OpenElectricityPrimaryGrouping
    | OpenElectricitySecondaryGrouping
  )[]
  /** Time-series result rows */
  results: readonly OpenElectricityTimeSeriesResult<Row>[]
  /** Network timezone offset (e.g., '+10:00') */
  network_timezone_offset: string
}

/**
 * Generic API response wrapper.
 */
export interface OpenElectricityApiResponse<T> {
  /** Response payload */
  data: T
  /** HTTP status code */
  status?: number
  /** Optional message */
  message?: string
  /** Additional metadata */
  meta?: Record<string, unknown>
}

/**
 * Configuration for OpenElectricity client.
 */
export interface OpenElectricityClientConfig {
  /** API authentication key */
  apiKey?: string
  /** Custom base URL (defaults to production API) */
  baseUrl?: string
}

/**
 * Response from getNetworkData SDK call.
 * Contains raw API response plus convenient DataTable interface.
 */
export interface OpenElectricityTimeSeriesResponse<Row extends OpenElectricityDataRow = OpenElectricityDataRow> {
  /** Raw API response */
  response: OpenElectricityApiResponse<OpenElectricityNetworkTimeSeries<Row>[]>
  /** Convenient DataTable interface for data manipulation */
  datatable?: OpenElectricityDataTable<Row>
}

/**
 * OpenElectricity SDK client interface.
 * Simplified type definition for the methods we use.
 */
export interface OpenElectricityClient {
  /**
   * Fetches network time-series data.
   *
   * @param networkCode - Network to query ('NEM', 'WEM', or 'AU')
   * @param metrics - Metrics to retrieve
   * @param params - Query parameters (interval, date range, grouping)
   * @returns Promise resolving to time-series response with DataTable
   */
  getNetworkData<Row extends OpenElectricityDataRow = OpenElectricityDataRow>(
    networkCode: OpenElectricityNetworkCode,
    metrics: readonly OpenElectricityMetric[],
    params?: OpenElectricityNetworkTimeSeriesParams,
  ): Promise<OpenElectricityTimeSeriesResponse<Row>>
}
