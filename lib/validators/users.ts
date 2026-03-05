import { z } from "zod"

export const listUsersSchema = z.strictObject({
  query: z.string().max(100).default(""),
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(25),
  roleFilter: z.enum(["ADMIN", "REGISTRATION", "TRIAGE", "DOCTOR", "LAB", "PHARMACY", "all"]).default("all"),
  facilityFilter: z.string().uuid().optional().or(z.literal("all")),
  statusFilter: z.enum(["active", "inactive", "all"]).default("active"),
})

export const createUserSchema = z.strictObject({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(100),
  role: z.enum(["ADMIN", "REGISTRATION", "TRIAGE", "DOCTOR", "LAB", "PHARMACY"], {
    message: "Role is required",
  }),
  facilityId: z.string().uuid("Facility is required"),
  scope: z.enum(["FACILITY_ONLY", "CITY_WIDE"]).default("FACILITY_ONLY"),
})

export const updateUserSchema = z.strictObject({
  userId: z.string().uuid("User ID is required"),
  name: z.string().min(2, "Name must be at least 2 characters").max(100).optional(),
  email: z.string().email("Invalid email address").max(255).optional(),
  role: z.enum(["ADMIN", "REGISTRATION", "TRIAGE", "DOCTOR", "LAB", "PHARMACY"]).optional(),
  facilityId: z.string().uuid("Facility is required").optional(),
  scope: z.enum(["FACILITY_ONLY", "CITY_WIDE"]).optional(),
  isActive: z.boolean().optional(),
})

export const resetPasswordSchema = z.strictObject({
  userId: z.string().uuid("User ID is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(100),
})

export const toggleUserStatusSchema = z.strictObject({
  userId: z.string().uuid("User ID is required"),
})

export const getUserSchema = z.strictObject({
  userId: z.string().uuid("User ID is required"),
})

export type ListUsersInput = z.infer<typeof listUsersSchema>
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ToggleUserStatusInput = z.infer<typeof toggleUserStatusSchema>
export type GetUserInput = z.infer<typeof getUserSchema>
