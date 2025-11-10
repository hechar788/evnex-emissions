/**
 * @fileoverview Shared numeric utility functions for data normalization.
 *
 * This module provides reusable numeric helpers used across both Australian (server-side)
 * and New Zealand (client-side) emissions data processing pipelines.
 *
 * @module lib/number-utils
 */

/**
 * Safely converts unknown values to finite numbers.
 *
 * Handles various input types commonly found in API responses:
 * - Numbers: Returns as-is if finite, otherwise 0
 * - Strings: Attempts numeric parsing, returns 0 if invalid
 * - null/undefined: Returns 0
 * - Other types: Returns 0
 *
 * @param value - Value of unknown type to convert
 * @returns Finite number or 0 for invalid inputs
 *
 * @example
 * ```ts
 * toFiniteNumber(42)           // 42
 * toFiniteNumber("123.45")     // 123.45
 * toFiniteNumber(null)         // 0
 * toFiniteNumber(Infinity)     // 0
 * toFiniteNumber("invalid")    // 0
 * ```
 */
export const toFiniteNumber = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
  }
  return 0
}

/**
 * Clamps a number to non-negative values and rounds to 2 decimal places.
 *
 * Used to clean power/energy/emissions values for consistent precision
 * and eliminate negative values that may result from data quality issues.
 *
 * @param value - Number to clamp and round
 * @returns Non-negative number rounded to 2 decimal places, or 0 if input is negative
 *
 * @example
 * ```ts
 * clamp(123.456)    // 123.46
 * clamp(-10)        // 0
 * clamp(0.001)      // 0
 * clamp(42.1)       // 42.1
 * ```
 */
export const clamp = (value: number): number => (value > 0 ? Math.round(value * 100) / 100 : 0)
