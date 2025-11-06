import type { NzTranspowerFeedMetadata } from '../common'
import type { NzGenerationFuelCode } from './fuel_codes'

export type NzGenerationMetricKey = `${NzGenerationFuelCode}_wap` | `${NzGenerationFuelCode}_mwh`

export type NzGenerationFuelMetrics = Partial<Record<NzGenerationMetricKey, number>>

export interface NzGenerationItem {
  grid_zone_id: number
  grid_zone_name: string
  generation_type: NzGenerationFuelMetrics[]
  /** ISO-like trading date string (YYYY-MM-DD or UTC timestamp) */
  trading_date: string
}

export interface NzGenerationFeed extends NzTranspowerFeedMetadata {
  items: NzGenerationItem[]
}
