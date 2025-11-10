/**
 * @fileoverview Renewable energy comparison card component.
 *
 * @module components/shared/renewable_energy/RenewableEnergyCard
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ClientOnly } from '@/components/ClientOnly'
import { Cell, Pie, PieChart, Tooltip as RechartsTooltip } from 'recharts'
import { RenewableTooltip } from './RenewableTooltip'

interface RenewableEnergyCardProps {
  renewableShare: number | null
  pieData: Array<{
    name: string
    value: number
    fuels: Array<{ fuel: string; percentage: number }>
    color: string
  }>
  country?: 'Australia' | 'New Zealand'
}

/**
 * Renewable energy comparison card component.
 */
export function RenewableEnergyCard({ renewableShare, pieData, country }: RenewableEnergyCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-medium text-muted-foreground">
          <span className="md:hidden">{country ? `${country} ` : ''}</span>
          Renewable Energy
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-2">
        <div>
          <div className="text-3xl font-bold">
            {renewableShare !== null
              ? renewableShare.toFixed(1)
              : 'N/A'}
            {renewableShare !== null && (
              <span className="text-2xl">%</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">of total generation</p>
        </div>
      </CardContent>
      <div className="absolute top-[62.5%] right-4 -translate-y-1/2 md:top-1/2">
        <ClientOnly fallback={<div className="h-[120px] w-[120px]" />}>
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
            <RechartsTooltip content={<RenewableTooltip />} />
          </PieChart>
        </ClientOnly>
      </div>
    </Card>
  )
}

