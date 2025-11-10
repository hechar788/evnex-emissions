/**
 * @fileoverview Australian regional breakdown component.
 *
 * Displays NEM regional metrics in a grid layout.
 * Shows carbon intensity, demand, and renewable share per region.
 *
 * @module components/dashboard/AusRegionalData
 */

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { RegionEmissionsSnapshot } from '@/types/emissions'
import type { NemRegion } from '@/types/open_electricity'

interface AusRegionalDataProps {
  regions: Record<NemRegion, RegionEmissionsSnapshot>
}

/**
 * Australian regional breakdown component.
 *
 * Renders a grid of cards showing metrics for each NEM region:
 * - QLD (Queensland)
 * - NSW (New South Wales)
 * - VIC (Victoria)
 * - SA (South Australia)
 * - TAS (Tasmania)
 *
 * Each region card displays:
 * - Carbon intensity (gCO₂/kWh)
 * - Demand (GW)
 * - Renewable share percentage badge
 */
export function AusRegionalData({ regions }: AusRegionalDataProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Breakdown</CardTitle>
        <CardDescription>Carbon intensity and generation across NEM regions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(regions).map(([region, regionData]) => (
            <Card key={region} className="border-muted">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{region}</CardTitle>
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
                    <span className="font-mono">
                      {(regionData.demandMW / 1000).toFixed(2)} GW
                    </span>
                  </div>
                )}
                {regionData.carbonIntensity.renewableShare !== null && (
                  <div className="pt-2">
                    <Badge variant="outline" className="border-emerald-600 text-emerald-400">
                      {regionData.carbonIntensity.renewableShare.toFixed(1)}% Renewable
                    </Badge>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
