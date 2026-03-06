/**
 * Date utility functions for consistent date handling across the application
 * Centralizes date range calculations for queues, claims, and queries
 */

/** Claim expiry duration in milliseconds (15 minutes) */
export const CLAIM_EXPIRY_MS = 15 * 60 * 1000

/**
 * Returns the start and end of today as Date objects
 * Start: 00:00:00.000
 * End: 23:59:59.999
 */
export function getTodayDateRange(): { start: Date; end: Date } {
  const start = new Date()
  start.setHours(0, 0, 0, 0)

  const end = new Date()
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Returns start of today and start of tomorrow for date range queries
 * Useful for queries using gte/lt pattern
 * Start: Today at 00:00:00.000
 * Tomorrow: Tomorrow at 00:00:00.000
 */
export function getTodayAndTomorrow(): { today: Date; tomorrow: Date } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return { today, tomorrow }
}

/**
 * Calculates the claim expiry threshold date
 * Claims older than this threshold are considered expired
 * @param now - Current timestamp (defaults to now)
 * @param expiryMs - Expiry duration in ms (defaults to CLAIM_EXPIRY_MS)
 */
export function getClaimExpiryThreshold(
  now: Date = new Date(),
  expiryMs: number = CLAIM_EXPIRY_MS
): Date {
  return new Date(now.getTime() - expiryMs)
}

/**
 * Checks if a claim is expired based on claimedAt timestamp
 * @param claimedAt - When the claim was made
 * @param expiryThreshold - Threshold date (claims before this are expired)
 */
export function isClaimExpired(claimedAt: Date | null, expiryThreshold: Date): boolean {
  if (!claimedAt) return true
  return claimedAt <= expiryThreshold
}
