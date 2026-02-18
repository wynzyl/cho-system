import { Role, UserScope } from "@prisma/client"

export interface SessionPayload {
  userId: string
  role: Role
  name: string
  facilityId: string
  scope: UserScope
  loginTime: number
  exp: number
}

export interface SessionUser {
  userId: string
  role: Role
  name: string
  facilityId: string
  scope: UserScope
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
      }
    }
