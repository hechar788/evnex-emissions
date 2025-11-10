/**
 * @fileoverview Total demand comparison card component.
 *
 * @module components/dashboard/compare/TotalDemandCard
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TotalDemandCardProps {
  totalDemandMW: number | null
}

/**
 * Total demand comparison card component.
 */
export function TotalDemandCard({ totalDemandMW }: TotalDemandCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-muted-foreground">
          Total Demand
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="text-3xl font-bold">
          {totalDemandMW !== null ? (totalDemandMW / 1000).toFixed(2) : 'N/A'}
        </div>
        <p className="text-sm text-muted-foreground">Gigawatts (GW)</p>
      </CardContent>
    </Card>
  )
}

