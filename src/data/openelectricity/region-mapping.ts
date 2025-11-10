/**
 * @fileoverview NEM region code mapping utilities.
 *
 * Maps OpenElectricity network region codes (NSW1, QLD1, etc.) to
 * application-friendly NEM region identifiers (NSW, QLD, etc.).
 *
 * @module data/openelectricity/region-mapping
 */

import type { NemRegion } from '@/types/open_electricity/regions'

/**
 * Maps OpenElectricity network_region codes to friendly region identifiers.
 *
 * OpenElectricity uses codes like 'NSW1', 'QLD1', etc. to identify NEM regions.
 * This function normalizes them to simple region codes (NSW, QLD, etc.) for
 * consistent use throughout the application.
 *
 * @param code - OpenElectricity network_region code (may be undefined)
 * @returns NemRegion identifier or null for unknown/invalid codes
 *
 * @example
 * ```ts
 * mapRegionCode('NSW1')      // 'NSW'
 * mapRegionCode('QLD1')      // 'QLD'
 * mapRegionCode('INVALID')   // null
 * mapRegionCode(undefined)   // null
 * ```
 */
export const mapRegionCode = (code: string | undefined): NemRegion | null => {
  switch (code) {
    case 'QLD1':
      return 'QLD'
    case 'NSW1':
      return 'NSW'
    case 'VIC1':
      return 'VIC'
    case 'SA1':
      return 'SA'
    case 'TAS1':
      return 'TAS'
    default:
      return null
  }
}
