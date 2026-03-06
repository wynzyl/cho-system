import { db } from "@/lib/db"
import type { SessionUser } from "@/lib/auth/types"
import type { EncounterStatus } from "@prisma/client"
import { getClaimExpiryThreshold } from "@/lib/utils/date"

export async function getFacilityById(facilityId: string) {
  return db.facility.findUnique({
    where: { id: facilityId },
    select: { code: true, name: true },
  })
}

/**
 * Options for encounter query
 */
export interface FindEncounterOptions {
  /** Required encounter status */
  status?: EncounterStatus
  /** Whether to require a valid (non-expired) claim by the session user */
  requireClaim?: boolean
  /** Whether admin users bypass facility scoping */
  adminBypassFacility?: boolean
  /** Include patient data */
  includePatient?: boolean
}

/**
 * Result of encounter lookup
 */
export type EncounterLookupResult =
  | { found: true; encounter: EncounterWithPatient; claimStatus: ClaimStatus }
  | { found: false; reason: "NOT_FOUND" | "WRONG_STATUS" | "WRONG_FACILITY" }

export type ClaimStatus =
  | "CLAIMED_BY_USER"
  | "CLAIMED_BY_OTHER"
  | "CLAIM_EXPIRED"
  | "UNCLAIMED"

export interface EncounterWithPatient {
  id: string
  status: EncounterStatus
  facilityId: string
  claimedById: string | null
  claimedAt: Date | null
  occurredAt: Date
  patient?: {
    patientCode: string
  }
}

/**
 * Find an encounter with access control and claim status
 * Consolidates common encounter query patterns across actions
 */
export async function findEncounterWithAccess(
  encounterId: string,
  session: SessionUser,
  options: FindEncounterOptions = {}
): Promise<EncounterLookupResult> {
  const {
    status,
    adminBypassFacility = false,
    includePatient = true,
  } = options

  const isAdmin = session.role === "ADMIN" && adminBypassFacility

  const encounter = await db.encounter.findFirst({
    where: {
      id: encounterId,
      deletedAt: null,
      // Apply facility scoping unless admin bypass
      ...(isAdmin ? {} : { facilityId: session.facilityId }),
      // Apply status filter if specified
      ...(status ? { status } : {}),
    },
    select: {
      id: true,
      status: true,
      facilityId: true,
      claimedById: true,
      claimedAt: true,
      occurredAt: true,
      ...(includePatient
        ? {
            patient: {
              select: { patientCode: true },
            },
          }
        : {}),
    },
  })

  if (!encounter) {
    return { found: false, reason: "NOT_FOUND" }
  }

  // Determine claim status
  const expiryThreshold = getClaimExpiryThreshold()
  let claimStatus: ClaimStatus

  if (!encounter.claimedById) {
    claimStatus = "UNCLAIMED"
  } else if (encounter.claimedById === session.userId) {
    if (encounter.claimedAt && encounter.claimedAt > expiryThreshold) {
      claimStatus = "CLAIMED_BY_USER"
    } else {
      claimStatus = "CLAIM_EXPIRED"
    }
  } else {
    if (encounter.claimedAt && encounter.claimedAt > expiryThreshold) {
      claimStatus = "CLAIMED_BY_OTHER"
    } else {
      claimStatus = "CLAIM_EXPIRED"
    }
  }

  return {
    found: true,
    encounter: encounter as EncounterWithPatient,
    claimStatus,
  }
}
