/**
 * @fileoverview Utility functions for comparison components.
 *
 * @module components/dashboard/compare/utils
 */

import { Badge } from '@/components/ui/badge'

// Re-export shared fuel utilities for convenience
export { categorizeFuelTypes } from '@/lib/fuel-utils'

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

