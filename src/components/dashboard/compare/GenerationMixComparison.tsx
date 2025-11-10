/**
 * @fileoverview Generation mix comparison component.
 *
 * Displays line graph comparing Australia and New Zealand
 * generation mix by fuel type.
 *
 * @module components/dashboard/GenerationMixComparison
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientOnly } from '@/components/ClientOnly'
import type { FuelType, GenerationMix } from '@/types/emissions'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface GenerationMixComparisonProps {
  auGenerationMix: GenerationMix
  nzGenerationMix: GenerationMix
}

/**
 * Transform generation mix data into chart format.
 *
 * Combines AU and NZ data by fuel type, ensuring all fuel types
 * from both countries are represented.
 */
const transformDataForChart = (auMix: GenerationMix, nzMix: GenerationMix) => {
  // Get all unique fuel types from both countries
  const allFuelTypes = new Set<FuelType>()
  auMix.forEach((entry) => allFuelTypes.add(entry.fuel))
  nzMix.forEach((entry) => allFuelTypes.add(entry.fuel))

  // Create a map for easy lookup
  const auMap = new Map<FuelType, number>(auMix.map((entry) => [entry.fuel, entry.megawatts]))
  const nzMap = new Map<FuelType, number>(nzMix.map((entry) => [entry.fuel, entry.megawatts]))

  // Transform into chart data format
  const chartData = Array.from(allFuelTypes).map((fuel) => ({
    fuel: fuel.charAt(0).toUpperCase() + fuel.slice(1), // Capitalize first letter
    Australia: auMap.get(fuel) || 0,
    'New Zealand': nzMap.get(fuel) || 0,
  }))

  // Sort by total generation (descending)
  return chartData.sort((a, b) => {
    const totalA = a.Australia + a['New Zealand']
    const totalB = b.Australia + b['New Zealand']
    return totalB - totalA
  })
}

/**
 * Custom tooltip for the chart.
 */
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
        <p className="mb-2 font-semibold">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toFixed(0)} MW
          </p>
        ))}
      </div>
    )
  }
  return null
}

/**
 * Generation mix comparison component.
 *
 * Displays a line graph comparing power generation by fuel type
 * between Australia and New Zealand.
 *
 * Features:
 * - Yellow line for Australia
 * - Sage green line for New Zealand
 * - Tooltip showing exact MW values
 * - Sorted by total generation
 */
export function GenerationMixComparison({
  auGenerationMix,
  nzGenerationMix,
}: GenerationMixComparisonProps) {
  const chartData = transformDataForChart(auGenerationMix, nzGenerationMix)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Mix Comparison</CardTitle>
        <CardDescription>
          Power generation by fuel type across Australia and New Zealand
        </CardDescription>
      </CardHeader>
      <CardContent className="p-2 sm:p-6">
        <ClientOnly>
          <ResponsiveContainer width="100%" height={450}>
            <LineChart data={chartData} margin={{ top: 20, right: 10, left: 0, bottom: 80 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="fuel"
                className="text-xs sm:text-sm"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis
                label={{ value: 'MW', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                className="text-xs sm:text-sm"
                tick={{ fill: 'hsl(var(--muted-foreground))' }}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '10px', fontSize: '14px' }}
                iconSize={14}
              />
              <Line
                type="monotone"
                dataKey="Australia"
                stroke="#eab308"
                strokeWidth={2.5}
                dot={{ fill: '#eab308', r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="New Zealand"
                stroke="#84cc16"
                strokeWidth={2.5}
                dot={{ fill: '#84cc16', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ClientOnly>
      </CardContent>
    </Card>
  )
}
