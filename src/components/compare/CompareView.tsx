/**
 * @fileoverview Country comparison view component.
 *
 * Displays side-by-side comparison of Australia and New Zealand metrics:
 * - Carbon intensity comparison
 * - Total demand comparison
 * - Renewable energy comparison
 * - Generation mix comparison
 *
 * @module components/compare/CompareView
 */

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientOnly } from '@/components/ClientOnly'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import type { CountryEmissionsSnapshot } from '@/types/emissions'
import { RenewableEnergyCard } from '../shared'
import { GenerationMixComparison } from './generation_mix/GenerationMixComparison'
import { CarbonIntensityCard } from './carbon_intensity/CarbonIntensityCard'
import { TotalDemandCard } from './total_demand/TotalDemandCard'
import { ViewModeTabs } from './view_mode/ViewModeTabs'
import { categorizeFuelTypes } from '@/lib/fuel-utils'

interface CompareViewProps {
  auData: CountryEmissionsSnapshot
  nzData: CountryEmissionsSnapshot
}

/**
 * Country comparison view component.
 *
 * Displays comparison grids:
 * - Row 1: Carbon intensity for AU and NZ
 * - Row 2: Total demand for AU and NZ
 * - Row 3: Renewable energy for AU and NZ
 * - Row 4: Generation mix comparison
 */
export function CompareView({ auData, nzData }: CompareViewProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'chart'>('grid')
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

  // Combined chart data for all metrics
  const combinedChartData = [
    {
      metric: 'Carbon Intensity',
      Australia: auData.carbonIntensity.current,
      'New Zealand': nzData.carbonIntensity.current,
      unit: 'gCO₂/kWh',
    },
    {
      metric: 'Total Demand',
      Australia: auData.totalDemandMW !== null ? auData.totalDemandMW / 1000 : 0,
      'New Zealand': nzData.totalDemandMW !== null ? nzData.totalDemandMW / 1000 : 0,
      unit: 'GW',
    },
    {
      metric: 'Renewable Energy',
      Australia: auData.carbonIntensity.renewableShare !== null ? auData.carbonIntensity.renewableShare : 0,
      'New Zealand': nzData.carbonIntensity.renewableShare !== null ? nzData.carbonIntensity.renewableShare : 0,
      unit: '%',
    },
  ]

  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the unit for this metric
      const dataItem = combinedChartData.find((item) => item.metric === label)
      const unit = dataItem?.unit || ''
      
      return (
        <div className="rounded-lg border border-border bg-background p-3 shadow-lg">
          <p className="mb-2 font-semibold">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value} {unit}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* View Mode Tabs - Desktop Only */}
      <div className="hidden md:block">
        <ViewModeTabs viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>

      {/* Grid View - Desktop Only */}
      {viewMode === 'grid' && (
        <div className="hidden md:block">
          {/* Two Column Layout with Country Headings */}
          <div className="grid gap-4 py-6 md:grid-cols-2">
            {/* Australia Column */}
            <div className="space-y-4">
              <h2 className="text-center text-xl font-semibold text-foreground">Australia</h2>
              <CarbonIntensityCard 
                intensity={auData.carbonIntensity.current} 
              />
              <TotalDemandCard 
                totalDemandMW={auData.totalDemandMW} 
              />
              <RenewableEnergyCard
                renewableShare={auData.carbonIntensity.renewableShare}
                pieData={auPieData}
              />
            </div>

            {/* New Zealand Column */}
            <div className="space-y-4">
              <h2 className="text-center text-xl font-semibold text-foreground">New Zealand</h2>
              <CarbonIntensityCard 
                intensity={nzData.carbonIntensity.current} 
              />
              <TotalDemandCard 
                totalDemandMW={nzData.totalDemandMW} 
              />
              <RenewableEnergyCard
                renewableShare={nzData.carbonIntensity.renewableShare}
                pieData={nzPieData}
              />
            </div>
          </div>
        </div>
      )}

      {/* Chart View - Mobile Always, Desktop When Selected */}
      <>
        {/* Mobile: Always show chart */}
        <div className="block md:hidden space-y-6">
          {/* Combined Comparison Chart */}
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Metrics Comparison</CardTitle>
            </CardHeader>
            <CardContent className="p-2 sm:p-6">
              <ClientOnly>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart 
                    data={combinedChartData} 
                    margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="metric" 
                      className="text-xs sm:text-sm"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <YAxis 
                      className="text-xs sm:text-sm"
                      tick={{ fill: 'hsl(var(--muted-foreground))' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend 
                      wrapperStyle={{ paddingTop: '10px', fontSize: '14px' }}
                      iconSize={14}
                    />
                    <Bar 
                      dataKey="Australia" 
                      fill="#eab308" 
                      name="Australia"
                    />
                    <Bar 
                      dataKey="New Zealand" 
                      fill="#84cc16" 
                      name="New Zealand"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ClientOnly>
            </CardContent>
          </Card>

          {/* Renewable Energy Cards (kept in chart view) */}
          <div className="grid gap-4 md:grid-cols-2">
            <RenewableEnergyCard
              renewableShare={auData.carbonIntensity.renewableShare}
              pieData={auPieData}
              country="Australia"
            />
            <RenewableEnergyCard
              renewableShare={nzData.carbonIntensity.renewableShare}
              pieData={nzPieData}
              country="New Zealand"
            />
          </div>
        </div>

        {/* Desktop: Show chart when selected */}
        {viewMode === 'chart' && (
          <div className="hidden md:block space-y-6">
            {/* Combined Comparison Chart */}
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Metrics Comparison</CardTitle>
              </CardHeader>
              <CardContent className="p-2 sm:p-6">
                <ClientOnly>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart 
                      data={combinedChartData} 
                      margin={{ top: 20, right: 10, left: 0, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis 
                        dataKey="metric" 
                        className="text-xs sm:text-sm"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <YAxis 
                        className="text-xs sm:text-sm"
                        tick={{ fill: 'hsl(var(--muted-foreground))' }}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend 
                        wrapperStyle={{ paddingTop: '10px', fontSize: '14px' }}
                        iconSize={14}
                      />
                      <Bar 
                        dataKey="Australia" 
                        fill="#eab308" 
                        name="Australia"
                      />
                      <Bar 
                        dataKey="New Zealand" 
                        fill="#84cc16" 
                        name="New Zealand"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </ClientOnly>
              </CardContent>
            </Card>

            {/* Renewable Energy Cards (kept in chart view) */}
            <div className="grid gap-4 md:grid-cols-2">
              <RenewableEnergyCard
                renewableShare={auData.carbonIntensity.renewableShare}
                pieData={auPieData}
              />
              <RenewableEnergyCard
                renewableShare={nzData.carbonIntensity.renewableShare}
                pieData={nzPieData}
              />
            </div>
          </div>
        )}
      </>

      {/* Generation Mix Comparison */}
      <GenerationMixComparison
        auGenerationMix={auData.generationMix}
        nzGenerationMix={nzData.generationMix}
      />
    </div>
  )
}

