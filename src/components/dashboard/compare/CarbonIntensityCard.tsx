/**
 * @fileoverview Carbon intensity comparison card component.
 *
 * @module components/dashboard/compare/CarbonIntensityCard
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getIntensityBadge } from './utils'

interface CarbonIntensityCardProps {
  intensity: number
}

/**
 * Carbon intensity comparison card component.
 */
export function CarbonIntensityCard({ intensity }: CarbonIntensityCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Carbon Intensity
          </CardTitle>
          {getIntensityBadge(intensity)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-bold">
              {intensity.toFixed(0)}
            </div>
            <p className="text-sm text-muted-foreground">gCO₂/kWh</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

