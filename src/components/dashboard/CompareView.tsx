/**
 * @fileoverview Country comparison view component.
 *
 * Displays side-by-side comparison of Australia and New Zealand metrics:
 * - Carbon intensity comparison
 * - Total demand comparison
 *
 * @module components/dashboard/CompareView
 */

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CountryEmissionsSnapshot } from '@/types/emissions'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { GenerationMixComparison } from './GenerationMixComparison'

interface CompareViewProps {
  auData: CountryEmissionsSnapshot
  nzData: CountryEmissionsSnapshot
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
 * Country comparison view component.
 *
 * Displays comparison grids:
 * - Row 1: Carbon intensity for AU and NZ
 * - Row 2: Total demand for AU and NZ
 * - Row 3: Renewable energy for AU and NZ
 */
export function CompareView({ auData, nzData }: CompareViewProps) {
  const auCategories = categorizeFuelTypes(auData.generationMix)
  const nzCategories = categorizeFuelTypes(nzData.generationMix)

  const auPieData = [
    {
      name: 'Renewable',
      value: auCategories.renewableTotal,
      fuels: auCategories.renewable,
      color: '#22c55e',
    },
    {
      name: 'Non-Renewable',
      value: auCategories.nonRenewableTotal,
      fuels: auCategories.nonRenewable,
      color: '#64748b',
    },
  ]

  const nzPieData = [
    {
      name: 'Renewable',
      value: nzCategories.renewableTotal,
      fuels: nzCategories.renewable,
      color: '#22c55e',
    },
    {
      name: 'Non-Renewable',
      value: nzCategories.nonRenewableTotal,
      fuels: nzCategories.nonRenewable,
      color: '#64748b',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Carbon Intensity Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Australia Carbon Intensity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-muted-foreground">
                Australia Carbon Intensity
              </CardTitle>
              {getIntensityBadge(auData.carbonIntensity.current)}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {auData.carbonIntensity.current.toFixed(0)}
                </div>
                <p className="text-sm text-muted-foreground">gCO₂/kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* New Zealand Carbon Intensity */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium text-muted-foreground">
                New Zealand Carbon Intensity
              </CardTitle>
              {getIntensityBadge(nzData.carbonIntensity.current)}
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl font-bold">
                  {nzData.carbonIntensity.current.toFixed(0)}
                </div>
                <p className="text-sm text-muted-foreground">gCO₂/kWh</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total Demand Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Australia Total Demand */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Australia Total Demand
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">
              {auData.totalDemandMW !== null ? (auData.totalDemandMW / 1000).toFixed(2) : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">Gigawatts (GW)</p>
          </CardContent>
        </Card>

        {/* New Zealand Total Demand */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-muted-foreground">
              New Zealand Total Demand
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="text-3xl font-bold">
              {nzData.totalDemandMW !== null ? (nzData.totalDemandMW / 1000).toFixed(2) : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">Gigawatts (GW)</p>
          </CardContent>
        </Card>
      </div>

      {/* Renewable Energy Comparison */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Australia Renewable Energy */}
        <Card className="relative">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-muted-foreground">
              Australia Renewable Energy
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div>
              <div className="text-3xl font-bold">
                {auData.carbonIntensity.renewableShare !== null
                  ? auData.carbonIntensity.renewableShare.toFixed(1)
                  : 'N/A'}
                {auData.carbonIntensity.renewableShare !== null && (
                  <span className="text-2xl">%</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">of total generation</p>
            </div>
          </CardContent>
          <div className="absolute top-1/2 right-4 -translate-y-1/2">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={auPieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                >
                  {auPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<RenewableTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* New Zealand Renewable Energy */}
        <Card className="relative">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium text-muted-foreground">
              New Zealand Renewable Energy
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div>
              <div className="text-3xl font-bold">
                {nzData.carbonIntensity.renewableShare !== null
                  ? nzData.carbonIntensity.renewableShare.toFixed(1)
                  : 'N/A'}
                {nzData.carbonIntensity.renewableShare !== null && (
                  <span className="text-2xl">%</span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">of total generation</p>
            </div>
          </CardContent>
          <div className="absolute top-1/2 right-4 -translate-y-1/2">
            <ResponsiveContainer width={120} height={120}>
              <PieChart>
                <Pie
                  data={nzPieData}
                  dataKey="value"
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                >
                  {nzPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<RenewableTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Generation Mix Comparison */}
      <GenerationMixComparison
        auGenerationMix={auData.generationMix}
        nzGenerationMix={nzData.generationMix}
      />
    </div>
  )
}
