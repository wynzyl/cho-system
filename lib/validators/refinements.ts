/**
 * Shared Zod refinements for common validation patterns
 * Reusable across multiple validator files
 */

/**
 * Validates that PhilHealth eligibility end date is after start date
 * Works with both Date objects (server) and string dates (client forms)
 */
export function validateEligibilityDates(data: {
  philhealthEligibilityStart?: Date | string | null
  philhealthEligibilityEnd?: Date | string | null
}): boolean {
  const start = data.philhealthEligibilityStart
  const end = data.philhealthEligibilityEnd

  if (start && end) {
    const startDate = typeof start === "string" ? new Date(start) : start
    const endDate = typeof end === "string" ? new Date(end) : end
    return endDate > startDate
  }
  return true
}

/**
 * Error configuration for eligibility date validation
 */
export const ELIGIBILITY_DATE_ERROR = {
  message: "End date must be after start date",
  path: ["philhealthEligibilityEnd"] as string[],
}

/**
 * PhilHealth number validation regex (12 digits)
 */
export const PHILHEALTH_NUMBER_REGEX = /^\d{12}$/

/**
 * PhilHealth number validation error message
 */
export const PHILHEALTH_NUMBER_ERROR = "Must be exactly 12 digits"
