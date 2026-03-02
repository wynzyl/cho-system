/**
 * Display formatting utilities
 */

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  return age
}

/**
 * Format sex enum to display string
 */
export function formatSex(sex: string): string {
  const map: Record<string, string> = {
    MALE: "Male",
    FEMALE: "Female",
    OTHER: "Other",
    UNKNOWN: "Unknown",
  }
  return map[sex] ?? "Unknown"
}

/**
 * Format date to localized time (e.g., "10:30 AM")
 */
export function formatTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

/**
 * Format date to localized date string (e.g., "Jan 15, 2024")
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

/**
 * Format date to short format (e.g., "Jan 15, 24")
 */
export function formatDateShort(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date
  return d.toLocaleDateString("en-PH", {
    month: "short",
    day: "numeric",
    year: "2-digit",
  })
}

/**
 * Format date for HTML input[type="date"] (YYYY-MM-DD)
 */
export function formatDateForInput(date: Date | string | null): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split("T")[0]
}

/**
 * Convert empty strings to null for database storage
 */
export function emptyToNull(val: string | undefined | null): string | null {
  return val?.trim() ? val.trim() : null
}
