/**
 * @fileoverview Quick statistics cards for dashboard.
 *
 * Displays key metrics in card format:
 * - Carbon intensity with severity badge
 * - Total demand
 * - Renewable energy with pie chart
 *
 * @module components/dashboard/QuickStats
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientOnly } from '@/components/ClientOnly'
import type { CountryEmissionsSnapshot } from '@/types/emissions'
import { Cell, Pie, PieChart, Tooltip } from 'recharts'
import { categorizeFuelTypes, getIntensityBadge } from '../compare/utils'
import { RenewableTooltip } from '../compare/RenewableTooltip'

interface QuickStatsProps {
  data: CountryEmissionsSnapshot
}

/**
 * Quick statistics cards component.
 *
 * Renders three metric cards:
 * 1. Carbon Intensity - with severity badge
 * 2. Total Demand - in gigawatts
 * 3. Renewable Energy - percentage of generation with pie chart
 */
export function QuickStats({ data }: QuickStatsProps) {
  const { renewable, nonRenewable, renewableTotal, nonRenewableTotal } = categorizeFuelTypes(
    data.generationMix
  )

  const pieData = [
    {
      name: 'Renewable',
      value: renewableTotal,
      fuels: renewable,
      color: '#22c55e', // green-500
    },
    {
      name: 'Non-Renewable',
      value: nonRenewableTotal,
      fuels: nonRenewable,
      color: '#64748b', // slate-500
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Carbon Intensity Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Carbon Intensity
            </CardTitle>
            {getIntensityBadge(data.carbonIntensity.current)}
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-baseline justify-between">
            <div>
              <div className="text-3xl font-bold">
                {data.carbonIntensity.current.toFixed(0)}
              </div>
              <p className="text-sm text-muted-foreground">gCO₂/kWh</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Demand Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Total Demand
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="text-3xl font-bold">
            {data.totalDemandMW !== null ? (data.totalDemandMW / 1000).toFixed(2) : 'N/A'}
          </div>
          <p className="text-sm text-muted-foreground">Gigawatts (GW)</p>
        </CardContent>
      </Card>

      {/* Renewable Energy Card */}
      <Card className="relative">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-medium text-muted-foreground">
            Renewable Energy
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <div>
            <div className="text-3xl font-bold">
              {data.carbonIntensity.renewableShare !== null
                ? data.carbonIntensity.renewableShare.toFixed(1)
                : 'N/A'}
              {data.carbonIntensity.renewableShare !== null && (
                <span className="text-2xl">%</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">of total generation</p>
          </div>
        </CardContent>
        {/* Absolutely positioned pie chart - centered vertically in entire card */}
        <div className="absolute top-1/2 right-4 -translate-y-1/2">
          <ClientOnly>
            <PieChart width={120} height={120}>
              <Pie
                data={pieData}
                dataKey="value"
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<RenewableTooltip />} />
            </PieChart>
          </ClientOnly>
        </div>
      </Card>
    </div>
  )
}
