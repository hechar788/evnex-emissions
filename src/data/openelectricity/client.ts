/**
 * @fileoverview OpenElectricity SDK client management.
 *
 * Provides singleton access to the OpenElectricity API client.
 * The client is instantiated once per runtime and reused across requests.
 *
 * @module data/openelectricity/client
 */

import { OpenElectricityClient } from 'openelectricity'

/**
 * Cached OpenElectricity SDK client instance.
 * Created once per runtime to reuse connections and avoid redundant initialization.
 *
 * @internal
 */
let cachedClient: OpenElectricityClient | null = null

/**
 * Gets or creates the OpenElectricity SDK client instance.
 *
 * Implements singleton pattern to reuse the client across multiple requests.
 * Requires OPEN_ELECTRICITY_API_KEY environment variable to be set.
 *
 * @returns Configured OpenElectricity client instance
 * @throws {Error} When OPEN_ELECTRICITY_API_KEY environment variable is missing
 *
 * @example
 * ```ts
 * const client = getOpenElectricityClient()
 * const { datatable } = await client.getNetworkData('NEM', ['power'], {...})
 * ```
 */
export const getOpenElectricityClient = (): OpenElectricityClient => {
  if (cachedClient) return cachedClient

  const apiKey = process.env.OPEN_ELECTRICITY_API_KEY
  if (!apiKey) {
    throw new Error(
      'OPEN_ELECTRICITY_API_KEY environment variable is required. ' +
      'Check your .env file and ensure the key is set.'
    )
  }

  cachedClient = new OpenElectricityClient({ apiKey })
  return cachedClient
}
