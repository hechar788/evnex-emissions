/**
 * @fileoverview Generation mix visualization component.
 *
 * Displays fuel type breakdown with horizontal bar charts.
 * Color codes by fuel category (renewable, fossil, storage).
 *
 * @module components/dashboard/GenerationMix
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { GenerationMix as GenerationMixType } from '@/types/emissions'

interface GenerationMixProps {
  generationMix: GenerationMixType
}

/**
 * Get fuel color class for visualization.
 */
const getFuelColor = (fuel: string) => {
  const renewables = ['hydro', 'wind', 'solar', 'geothermal', 'biomass']
  if (renewables.includes(fuel)) return 'bg-emerald-500'
  if (fuel === 'battery') return 'bg-blue-500'
  if (fuel === 'gas') return 'bg-orange-500'
  if (fuel === 'coal') return 'bg-red-600'
  return 'bg-slate-500'
}

/**
 * Generation mix visualization component.
 *
 * Renders a card with horizontal bar charts showing power generation
 * by fuel type. Bars are sorted by generation amount (descending)
 * and only shows active fuel sources (>0 MW).
 *
 * Each fuel source displays:
 * - Colored indicator dot
 * - Fuel type name
 * - Generation amount (MW)
 * - Percentage of total generation
 * - Horizontal bar chart
 */
export function GenerationMix({ generationMix }: GenerationMixProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Generation Mix</CardTitle>
        <CardDescription>
          Current power generation by fuel type across the NEM network
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {generationMix
            .sort((a, b) => b.megawatts - a.megawatts)
            .filter((entry) => entry.megawatts > 0)
            .map((entry) => (
              <div key={entry.fuel} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 capitalize">
                    <div className={`h-3 w-3 rounded ${getFuelColor(entry.fuel)}`} />
                    {entry.fuel}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {entry.megawatts.toFixed(0)} MW ({entry.percentage.toFixed(1)}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div
                    className={`h-full ${getFuelColor(entry.fuel)}`}
                    style={{ width: `${entry.percentage}%` }}
                  />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  )
}
