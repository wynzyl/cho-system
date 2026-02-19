import { Role } from "@prisma/client"

/**
 * Role-specific dashboard routes.
 * Used for redirecting users after login and for access control.
 */
export const ROLE_ROUTES: Record<Role, string> = {
  ADMIN: "/dashboard",
  REGISTRATION: "/patients",
  TRIAGE: "/dashboard/triage",
  DOCTOR: "/dashboard/doctor",
  LAB: "/dashboard/laboratory",
  PHARMACY: "/dashboard/pharmacy",
}

/**
 * Routes each role is allowed to access.
 * ADMIN access is handled separately via hasAdminBypass.
 */
export const ROLE_ALLOWED_PATHS: Record<Role, string[]> = {
  ADMIN: [
    "/dashboard",
    "/dashboard/registration",
    "/dashboard/triage",
    "/dashboard/doctor",
    "/dashboard/laboratory",
    "/dashboard/pharmacy",
    "/patients",
  ],
  REGISTRATION: [
    "/dashboard",
    "/dashboard/registration",
    "/patients",
  ],
  TRIAGE: ["/dashboard", "/dashboard/triage", "/patients"],
  DOCTOR: ["/dashboard", "/dashboard/doctor", "/patients"],
  LAB: ["/dashboard", "/dashboard/laboratory"],
  PHARMACY: ["/dashboard", "/dashboard/pharmacy"],
}
