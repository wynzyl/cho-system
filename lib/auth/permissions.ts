import { Role } from "@prisma/client"

/**
 * Roles allowed to add, edit, or remove patient allergies.
 * Used for both UI display logic and server-side authorization.
 */
export const EDIT_ALLERGIES_ROLES: Role[] = ["REGISTRATION", "TRIAGE", "DOCTOR", "ADMIN"]
