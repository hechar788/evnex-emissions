/**
 * @fileoverview Custom tooltip for renewable energy pie chart.
 *
 * @module components/shared/renewable_energy/RenewableTooltip
 */

/**
 * Custom tooltip for renewable energy pie chart.
 */
export function RenewableTooltip({ active, payload }: any) {
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

