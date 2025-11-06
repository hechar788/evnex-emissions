import type { NzTranspowerFeedMetadata } from './common'

export interface NzCarbonIntensityItem {
  trading_date: string
  trading_period: number
  timestamp: string
  nz_carbon_t: number
  nz_carbon_gkwh: number
  nz_carbon_gkwh_prev: number
  nz_carbon_change_gkwh: number
  nz_renewable: number
  max_24hrs_gkwh: number
  min_24hrs_gkwh: number
  current_month_avg_gkwh: number
  current_year_avg_gkwh: number
  pct_current_year_gkwh: number
}

export interface NzCarbonIntensityFeed extends NzTranspowerFeedMetadata {
  items: NzCarbonIntensityItem[]
}

