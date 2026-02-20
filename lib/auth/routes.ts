import { Role } from "@prisma/client"

/**
 * Role-specific dashboard routes.
 * Used for redirecting users after login and for access control.
 */
export const ROLE_ROUTES: Record<Role, string> = {
  ADMIN: "/dashboard",
  REGISTRATION: "/patients",
  TRIAGE: "/triage",
  DOCTOR: "/appointments",
  LAB: "/laboratory",
  PHARMACY: "/pharmacy",
}

/**
 * Routes each role is allowed to access.
 * ADMIN access is handled separately via hasAdminBypass.
 */
export const ROLE_ALLOWED_PATHS: Record<Role, string[]> = {
  ADMIN: [
    "/dashboard",
    "/patients",
    "/triage",
    "/appointments",
    "/laboratory",
    "/pharmacy",
    "/users",
    "/settings",
    "/profile",
  ],
  REGISTRATION: ["/dashboard", "/patients", "/profile"],
  TRIAGE: ["/dashboard", "/patients", "/triage", "/appointments", "/profile"],
  DOCTOR: ["/dashboard", "/appointments", "/profile"],
  LAB: ["/dashboard", "/laboratory", "/profile"],
  PHARMACY: ["/dashboard", "/pharmacy", "/profile"],
}
