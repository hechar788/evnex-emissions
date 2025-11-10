/**
 * @fileoverview Carbon intensity breakdown component.
 *
 * Displays regional emissions data for Australia or national data for New Zealand.
 *
 * @module components/dashboard/RegionalBreakdown
 */

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { RegionEmissionsSnapshot, CountryEmissionsSnapshot } from '@/types/emissions'
import type { NemRegion } from '@/types/open_electricity'
import { Badge } from '@/components/ui/badge'

interface RegionalBreakdownProps {
  country: 'AU' | 'NZ'
  auRegions?: Record<NemRegion, RegionEmissionsSnapshot>
  nzData?: CountryEmissionsSnapshot
}

type SortOption = 'renewable' | 'intensity' | 'demand'

/**
 * Carbon intensity breakdown component.
 *
 * Displays:
 * - Australia: NEM regional data (QLD, NSW, VIC, SA, TAS)
 * - New Zealand: National-level data
 */
export function RegionalBreakdown({ country, auRegions, nzData }: RegionalBreakdownProps) {
  const [sortBy, setSortBy] = useState<SortOption>('intensity')
  
  const title = country === 'AU' ? 'Regional Breakdown of Carbon Intensity' : 'Carbon Intensity'
  const description =
    country === 'AU'
      ? 'Carbon intensity and generation across NEM regions'
      : 'Carbon intensity and generation across New Zealand'

  // Sort regions for Australia based on selected sort option
  const sortedRegions = country === 'AU' && auRegions
    ? Object.entries(auRegions).sort(([, a], [, b]) => {
        switch (sortBy) {
          case 'renewable': {
            const aRenewable = a.carbonIntensity.renewableShare ?? 0
            const bRenewable = b.carbonIntensity.renewableShare ?? 0
            return bRenewable - aRenewable // Highest to lowest
          }
          case 'intensity': {
            return b.carbonIntensity.current - a.carbonIntensity.current // Highest to lowest
          }
          case 'demand': {
            const aDemand = a.demandMW ?? 0
            const bDemand = b.demandMW ?? 0
            return bDemand - aDemand // Highest to lowest
          }
          default:
            return 0
        }
      })
    : []

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {country === 'AU' && auRegions && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
              >
                <option value="renewable">Renewable</option>
                <option value="intensity">Intensity</option>
                <option value="demand">Demand</option>
              </select>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {country === 'AU' && auRegions ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sortedRegions.map(([region, regionData]) => (
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
