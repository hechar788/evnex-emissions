/**
 * @fileoverview Quick statistics cards for dashboard.
 *
 * Displays key metrics in card format:
 * - Carbon intensity with severity badge
 * - Total demand
 * - Last updated timestamp
 *
 * @module components/dashboard/QuickStats
 */

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CountryEmissionsSnapshot } from '@/types/emissions'

interface QuickStatsProps {
  data: CountryEmissionsSnapshot
}

/**
 * Determine carbon intensity severity badge.
 */
const getIntensityBadge = (intensity: number) => {
  if (intensity < 200) return <Badge variant="default" className="bg-green-600">Low</Badge>
  if (intensity < 400) return <Badge variant="default" className="bg-yellow-600">Medium</Badge>
  return <Badge variant="destructive">High</Badge>
}

/**
 * Quick statistics cards component.
 *
 * Renders three metric cards:
 * 1. Carbon Intensity - with severity badge and renewable share
 * 2. Total Demand - in gigawatts
 * 3. Last Updated - timestamp and data source badge
 */
export function QuickStats({ data }: QuickStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Carbon Intensity Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Carbon Intensity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold">
                {data.carbonIntensity.current.toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">gCO₂/kWh</p>
            </div>
            {getIntensityBadge(data.carbonIntensity.current)}
          </div>
          {data.carbonIntensity.renewableShare !== null && (
            <div className="mt-4 flex items-center gap-2">
              <Badge variant="outline" className="border-emerald-600 text-emerald-400">
                {data.carbonIntensity.renewableShare.toFixed(1)}% Renewable
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Demand Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total Demand
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {data.totalDemandMW !== null ? (data.totalDemandMW / 1000).toFixed(2) : 'N/A'}
          </div>
          <p className="text-sm text-muted-foreground">Gigawatts (GW)</p>
        </CardContent>
      </Card>

      {/* Last Updated Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Last Updated
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold">
            {new Date(data.timestamp).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false,
            })}
          </div>
          <p className="text-sm text-muted-foreground">
            {new Date(data.timestamp).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </p>
          <Badge variant="outline" className="mt-2">
            {data.metadata.source === 'network' ? 'Live' : 'Cached'}
          </Badge>
        </CardContent>
      </Card>
    </div>
  )
}
