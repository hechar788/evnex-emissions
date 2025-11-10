/**
 * @fileoverview New Zealand national-level data component.
 *
 * Displays NZ national emissions metrics.
 * Shows carbon intensity, demand, and renewable share for the entire country.
 *
 * Note: The EM6 API does not provide regional breakdowns for NZ,
 * so this component displays aggregated national data only.
 *
 * @module components/dashboard/NzRegionalData
 */

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useNzData } from '@/hooks'

/**
 * New Zealand national data component.
 *
 * Fetches and displays NZ national emissions data from EM6 API.
 * Shows aggregated metrics for the entire country.
 *
 * The card displays:
 * - Carbon intensity (gCO₂/kWh)
 * - Total demand (GW)
 * - Renewable share percentage badge
 *
 * Note: Regional breakdowns (North/South Island) are not available
 * from the EM6 API, so only national-level data is shown.
 */
export function NzRegionalData() {
  const { data, isLoading, error } = useNzData()

  if (isLoading) {
    return (
      <Card className="border-muted max-w-md">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-6 w-24" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Failed to load New Zealand data. {error instanceof Error ? error.message : 'Unknown error'}
        </AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Alert>
        <AlertDescription>No data available for New Zealand.</AlertDescription>
      </Alert>
    )
  }

  // NZ data is national-level only (no regional breakdown available from EM6 API)
  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription>
          Regional breakdowns are not available for New Zealand. Showing national-level data.
        </AlertDescription>
      </Alert>

      <Card className="border-muted max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">New Zealand (National)</CardTitle>
            {data.carbonIntensity.renewableShare !== null && (
              <Badge variant="outline" className="border-emerald-600 text-emerald-400">
                {data.carbonIntensity.renewableShare.toFixed(1)}% Renewable
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Intensity:</span>
            <span className="font-mono font-semibold">
              {data.carbonIntensity.current.toFixed(0)} gCO₂/kWh
            </span>
          </div>
          {data.totalDemandMW !== null && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Demand:</span>
              <span className="font-mono">
                {(data.totalDemandMW / 1000).toFixed(2)} GW
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
