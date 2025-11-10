/**
 * @fileoverview Utility functions for comparison components.
 *
 * @module components/dashboard/compare/utils
 */

import { Badge } from '@/components/ui/badge'
import type { CountryEmissionsSnapshot } from '@/types/emissions'

/**
 * Categorize fuel types into renewable and non-renewable.
 */
export function categorizeFuelTypes(generationMix: CountryEmissionsSnapshot['generationMix']) {
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
 * Determine carbon intensity severity badge.
 */
export function getIntensityBadge(intensity: number) {
  if (intensity < 200) {
    return <Badge variant="default" className="bg-green-600 px-2.5 py-1 text-sm">Low</Badge>
  }
  if (intensity < 400) {
    return <Badge variant="default" className="bg-yellow-600 px-2.5 py-1 text-sm">Medium</Badge>
  }
  return <Badge variant="destructive" className="px-2.5 py-1 text-sm">High</Badge>
}

