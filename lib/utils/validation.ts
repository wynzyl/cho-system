import { ZodSchema, ZodError } from "zod"
import type { ActionResult } from "@/lib/auth/types"

/**
 * Parse Zod validation errors into a field-error map
 */
export function parseZodErrors(error: ZodError): Record<string, string[]> {
  const fieldErrors: Record<string, string[]> = {}
  for (const issue of error.issues) {
    const field = String(issue.path[0] || "_root")
    if (!fieldErrors[field]) fieldErrors[field] = []
    fieldErrors[field].push(issue.message)
  }
  return fieldErrors
}

/**
 * Validate input against a Zod schema with standardized error handling
 *
 * Usage:
 * ```typescript
 * const validation = validateInput(createPatientSchema, input)
 * if (!validation.ok) return validation.result
 * const data = validation.data
 * ```
 */
export function validateInput<T>(
  schema: ZodSchema<T>,
  input: unknown
): { ok: true; data: T } | { ok: false; result: ActionResult<never> } {
  const parsed = schema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      result: {
        ok: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid input",
          fieldErrors: parseZodErrors(parsed.error),
        },
      },
    }
  }
  return { ok: true, data: parsed.data }
}
