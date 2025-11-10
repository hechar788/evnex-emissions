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

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CountryEmissionsSnapshot } from '@/types/emissions'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

interface QuickStatsProps {
  data: CountryEmissionsSnapshot
}

/**
 * Categorize fuel types into renewable and non-renewable.
 */
const categorizeFuelTypes = (generationMix: CountryEmissionsSnapshot['generationMix']) => {
  const renewableFuels = ['hydro', 'wind', 'solar', 'geothermal', 'biomass']

  const renewable: Array<{ fuel: string; percentage: number }> = []
  const nonRenewable: Array<{ fuel: string; percentage: number }> = []

  let renewableTotal = 0
  let nonRenewableTotal = 0

  generationMix.forEach((entry) => {
    if (renewableFuels.includes(entry.fuel)) {
      renewable.push({ fuel: entry.fuel, percentage: entry.percentage })
      renewableTotal += entry.percentage
    } else {
      nonRenewable.push({ fuel: entry.fuel, percentage: entry.percentage })
      nonRenewableTotal += entry.percentage
    }
  })

  return {
    renewable,
    nonRenewable,
    renewableTotal,
    nonRenewableTotal,
  }
}

/**
 * Custom tooltip for renewable energy pie chart.
 */
const RenewableTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg min-w-44">
        <p className="mb-2 font-semibold">{data.name}</p>
        <p className="mb-2 text-sm font-mono">
          {data.value.toFixed(1)}% of total
        </p>
        <div className="border-t border-muted pt-2 space-y-1">
          <p className="text-xs font-semibold text-muted-foreground mb-1">Fuel Types:</p>
          {data.fuels.map((fuel: { fuel: string; percentage: number }) => (
            <p key={fuel.fuel} className="text-xs capitalize">
              {fuel.fuel}: {fuel.percentage.toFixed(1)}%
            </p>
          ))}
        </div>
      </div>
    )
  }
  return null
}

/**
 * Determine carbon intensity severity badge.
 */
const getIntensityBadge = (intensity: number) => {
  if (intensity < 200) return <Badge variant="default" className="bg-green-600 px-2.5 py-1 text-sm">Low</Badge>
  if (intensity < 400) return <Badge variant="default" className="bg-yellow-600 px-2.5 py-1 text-sm">Medium</Badge>
  return <Badge variant="destructive" className="px-2.5 py-1 text-sm">High</Badge>
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
          <ResponsiveContainer width={120} height={120}>
            <PieChart>
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
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
