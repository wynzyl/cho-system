import type { ActionResult } from "@/lib/auth/types"
import { ERROR_CODES, ERROR_MESSAGES, type ErrorCode } from "@/lib/constants/errors"

/**
 * Error origin tracking for debugging
 * Only attached in development mode
 */
export interface ErrorOrigin {
  file: string // e.g., "actions/patients/get-patient.ts"
  fn: string // e.g., "getPatientAction"
  line?: number // optional line number
  context?: string // optional context like "validation", "db-lookup"
}

export const isDev = process.env.NODE_ENV !== "production"

/**
 * Create an ErrorOrigin object for a server action
 */
export function createOrigin(file: string, fn: string): ErrorOrigin {
  return { file, fn }
}

/**
 * Extend an origin with additional context
 */
export function withContext(
  origin: ErrorOrigin,
  context: string,
  line?: number
): ErrorOrigin {
  return { ...origin, context, line }
}

/**
 * Create an ActionResult error with optional origin tracking
 * Origin is only attached in development mode
 */
export function actionError<T = never>(
  code: ErrorCode,
  message?: string,
  origin?: ErrorOrigin,
  fieldErrors?: Record<string, string[]>
): ActionResult<T> {
  const errorMessage = message ?? ERROR_MESSAGES[code] ?? "An error occurred"

  const error: ActionResult<T> = {
    ok: false,
    error: {
      code,
      message: errorMessage,
      ...(fieldErrors && { fieldErrors }),
      ...(isDev && origin && { _origin: origin }),
    },
  }

  return error
}

// Re-export ERROR_CODES for convenience
export { ERROR_CODES }
