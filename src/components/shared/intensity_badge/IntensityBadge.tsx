/**
 * @fileoverview Carbon intensity severity badge component.
 *
 * Displays a colored badge indicating the severity level of carbon intensity.
 *
 * @module components/shared/intensity_badge/IntensityBadge
 */

import { Badge } from '@/components/ui/badge'

interface IntensityBadgeProps {
  /** Carbon intensity value in gCO₂/kWh */
  intensity: number
}

/**
 * Carbon intensity severity badge.
 *
 * Shows severity level based on intensity thresholds:
 * - Low: < 200 gCO₂/kWh (green)
 * - Medium: 200-400 gCO₂/kWh (yellow)
 * - High: > 400 gCO₂/kWh (red)
 */
export function IntensityBadge({ intensity }: IntensityBadgeProps) {
  if (intensity < 200) {
    return <Badge variant="default" className="bg-green-600 px-2.5 py-1 text-sm">Low</Badge>
  }
  if (intensity < 400) {
    return <Badge variant="default" className="bg-yellow-600 px-2.5 py-1 text-sm">Medium</Badge>
  }
  return <Badge variant="destructive" className="px-2.5 py-1 text-sm">High</Badge>
}
