import { Role, UserScope } from "@prisma/client"

export interface SessionUser {
  userId: string
  role: Role
  name: string
  facilityId: string
  scope: UserScope
}

export interface SessionPayload extends SessionUser {
  loginTime: number
}

export type ActionResult<T = unknown> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      error: {
        code: string
        message: string
        fieldErrors?: Record<string, string[]>
        /** Debug info - only attached in development mode */
        _origin?: { file: string; fn: string; line?: number; context?: string }
      }
    }
