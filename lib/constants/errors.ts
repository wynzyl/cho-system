/**
 * Centralized error codes used across the codebase
 */

export const ERROR_CODES = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  SESSION_ERROR: "SESSION_ERROR",
  ENCOUNTER_ALREADY_IN_PROGRESS: "ENCOUNTER_ALREADY_IN_PROGRESS",
  DUPLICATE_ENCOUNTER: "DUPLICATE_ENCOUNTER",
  DUPLICATE_PATIENT_CODE: "DUPLICATE_PATIENT_CODE",
  ALREADY_CLAIMED: "ALREADY_CLAIMED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
} as const

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES]

/**
 * Default error messages for each error code
 */
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR: "Invalid input",
  NOT_FOUND: "Resource not found",
  UNAUTHORIZED: "Authentication required",
  FORBIDDEN: "Access denied",
  INVALID_CREDENTIALS: "Invalid username or password",
  SESSION_ERROR: "Session error occurred",
  ENCOUNTER_ALREADY_IN_PROGRESS: "An encounter is already in progress for this patient",
  DUPLICATE_ENCOUNTER: "Duplicate encounter detected",
  DUPLICATE_PATIENT_CODE: "A patient with this code already exists",
  ALREADY_CLAIMED: "This record has already been claimed",
  INTERNAL_ERROR: "An internal error occurred",
}
