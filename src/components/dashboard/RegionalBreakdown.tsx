/**
 * @fileoverview Carbon intensity breakdown component.
 *
 * Displays regional emissions data for Australia or national data for New Zealand.
 *
 * @module components/dashboard/RegionalBreakdown
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { RegionEmissionsSnapshot, CountryEmissionsSnapshot } from '@/types/emissions'
import type { NemRegion } from '@/types/open_electricity'
import { Badge } from '@/components/ui/badge'

interface RegionalBreakdownProps {
  country: 'AU' | 'NZ'
  auRegions?: Record<NemRegion, RegionEmissionsSnapshot>
  nzData?: CountryEmissionsSnapshot
}

/**
 * Carbon intensity breakdown component.
 *
 * Displays:
 * - Australia: NEM regional data (QLD, NSW, VIC, SA, TAS)
 * - New Zealand: National-level data
 */
export function RegionalBreakdown({ country, auRegions, nzData }: RegionalBreakdownProps) {
  const title = country === 'AU' ? 'Regional Breakdown of Carbon Intensity' : 'Carbon Intensity'
  const description =
    country === 'AU'
      ? 'Carbon intensity and generation across NEM regions'
      : 'Carbon intensity and generation across New Zealand'

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {country === 'AU' && auRegions ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(auRegions).map(([region, regionData]) => (
              <Card key={region} className="border-muted">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{region}</CardTitle>
                    {regionData.carbonIntensity.renewableShare !== null && (
                      <Badge variant="outline" className="border-emerald-600 text-emerald-400">
                        {regionData.carbonIntensity.renewableShare.toFixed(1)}% Renewable
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Intensity:</span>
                    <span className="font-mono font-semibold">
                      {regionData.carbonIntensity.current.toFixed(0)} gCO₂/kWh
                    </span>
                  </div>
                  {regionData.demandMW !== null && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Demand:</span>
                      <span className="font-mono">{(regionData.demandMW / 1000).toFixed(2)} GW</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : country === 'NZ' && nzData ? (
          <Card className="border-muted max-w-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">New Zealand (National)</CardTitle>
                {nzData.carbonIntensity.renewableShare !== null && (
                  <Badge variant="outline" className="border-emerald-600 text-emerald-400">
                    {nzData.carbonIntensity.renewableShare.toFixed(1)}% Renewable
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Intensity:</span>
                <span className="font-mono font-semibold">
                  {nzData.carbonIntensity.current.toFixed(0)} gCO₂/kWh
                </span>
              </div>
              {nzData.totalDemandMW !== null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Demand:</span>
                  <span className="font-mono">{(nzData.totalDemandMW / 1000).toFixed(2)} GW</span>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>
  )
}
