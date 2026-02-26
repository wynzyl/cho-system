import { AuditAction, Prisma } from "@prisma/client"

interface AuditLogParams {
  userId: string
  userName: string
  action: AuditAction
  entity: string
  entityId: string
  metadata?: Prisma.InputJsonValue
}

/**
 * Create audit log data object for use with Prisma
 */
export function createAuditLogData(params: AuditLogParams) {
  return {
    userId: params.userId,
    userName: params.userName,
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
    metadata: params.metadata ?? {},
  }
}

/**
 * Create an audit log entry within a transaction
 *
 * Usage:
 * ```typescript
 * await logAudit(tx, {
 *   userId: session.userId,
 *   userName: session.name,
 *   action: "CREATE",
 *   entity: "Patient",
 *   entityId: patient.id,
 *   metadata: { patientCode },
 * })
 * ```
 */
export async function logAudit(
  tx: { auditLog: { create: (args: { data: Prisma.AuditLogCreateInput }) => Promise<unknown> } },
  params: AuditLogParams
) {
  return tx.auditLog.create({
    data: createAuditLogData(params),
  })
}
