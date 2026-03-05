export const ROLE_OPTIONS = [
  { value: "ADMIN", label: "Administrator" },
  { value: "REGISTRATION", label: "Registration Staff" },
  { value: "TRIAGE", label: "Triage Nurse" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "LAB", label: "Laboratory Staff" },
  { value: "PHARMACY", label: "Pharmacy Staff" },
] as const

export const USER_SCOPE_OPTIONS = [
  { value: "FACILITY_ONLY", label: "Facility Only" },
  { value: "CITY_WIDE", label: "City-wide Access" },
] as const

export const USER_STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "all", label: "All" },
] as const

export type RoleValue = (typeof ROLE_OPTIONS)[number]["value"]
export type UserScopeValue = (typeof USER_SCOPE_OPTIONS)[number]["value"]
export type UserStatusFilterValue = (typeof USER_STATUS_OPTIONS)[number]["value"]

export function getRoleLabel(value: string): string {
  return ROLE_OPTIONS.find((opt) => opt.value === value)?.label ?? value
}

export function getScopeLabel(value: string): string {
  return USER_SCOPE_OPTIONS.find((opt) => opt.value === value)?.label ?? value
}

export function getRoleBadgeColor(role: string): string {
  switch (role) {
    case "ADMIN":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
    case "REGISTRATION":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
    case "TRIAGE":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
    case "DOCTOR":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
    case "LAB":
      return "bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200"
    case "PHARMACY":
      return "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}

export function getScopeBadgeColor(scope: string): string {
  switch (scope) {
    case "CITY_WIDE":
      return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200"
    case "FACILITY_ONLY":
      return "bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200"
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
  }
}
