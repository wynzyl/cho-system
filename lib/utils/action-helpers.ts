/**
 * Action helper utilities for consistent error handling and audit logging
 * Consolidates common patterns used across server actions
 */

import type { ActionResult, SessionUser } from "@/lib/auth/types"
import type { Prisma } from "@prisma/client"

/**
 * Creates a standard NOT_FOUND error result
 * @param entity - The entity type that was not found (e.g., "Patient", "Encounter")
 * @param message - Optional custom message (defaults to "[Entity] not found")
 */
export function notFoundError<T = never>(
  entity: string,
  message?: string
): ActionResult<T> {
  return {
    ok: false,
    error: {
      code: "NOT_FOUND",
      message: message ?? `${entity} not found`,
    },
  }
}

/**
 * Creates a standard FORBIDDEN error result
 * @param message - Optional custom message (defaults to "Access denied")
 */
export function forbiddenError<T = never>(message?: string): ActionResult<T> {
  return {
    ok: false,
    error: {
      code: "FORBIDDEN",
      message: message ?? "Access denied",
    },
  }
}

/**
 * Creates a standard VALIDATION_ERROR result
 * @param message - Error message
 * @param fieldErrors - Optional field-specific errors
 */
export function validationError<T = never>(
  message: string,
  fieldErrors?: Record<string, string[]>
): ActionResult<T> {
  return {
    ok: false,
    error: {
      code: "VALIDATION_ERROR",
      message,
      fieldErrors,
    },
  }
}

/**
 * Creates a standard ALREADY_CLAIMED error result
 * @param message - Optional custom message
 */
export function alreadyClaimedError<T = never>(message?: string): ActionResult<T> {
  return {
    ok: false,
    error: {
      code: "ALREADY_CLAIMED",
      message: message ?? "This item is already being processed by another user",
    },
  }
}

/**
 * Creates a standard FIFO_VIOLATION error result
 */
export function fifoViolationError<T = never>(): ActionResult<T> {
  return {
    ok: false,
    error: {
      code: "FIFO_VIOLATION",
      message: "You must select the first patient in the queue",
    },
  }
}

/**
 * Type for Prisma transaction client
 */
type TransactionClient = Omit<
  Prisma.TransactionClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>

/**
 * AuditAction enum values from Prisma schema
 */
type AuditAction =
  | "CREATE"
  | "UPDATE"
  | "DELETE_SOFT"
  | "ROLE_CHANGE"
  | "LOGIN"
  | "LOGOUT"
  | "UPLOAD"
  | "RELEASE"
  | "OVERRIDE"

/**
 * Creates an audit log entry within a transaction
 * @param tx - Prisma transaction client
 * @param session - Current user session
 * @param action - The action type (matches AuditAction enum in Prisma schema)
 * @param entity - The entity type being audited
 * @param entityId - The ID of the entity
 * @param metadata - Additional context for the audit log
 */
export async function createAuditLog(
  tx: TransactionClient,
  session: SessionUser,
  action: AuditAction,
  entity: string,
  entityId: string,
  metadata?: Record<string, string | number | boolean | null>
): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId: session.userId,
      userName: session.name,
      action,
      entity,
      entityId,
      metadata: metadata ?? {},
    },
  })
}
