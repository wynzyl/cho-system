"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  createUserAction,
  updateUserAction,
  type UserListItem,
  type FacilityOption,
} from "@/actions/users"
import { ROLE_OPTIONS, USER_SCOPE_OPTIONS } from "@/lib/constants"
import { toast } from "sonner"

const createFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["ADMIN", "REGISTRATION", "TRIAGE", "DOCTOR", "LAB", "PHARMACY"]),
  facilityId: z.string().uuid("Facility is required"),
  scope: z.enum(["FACILITY_ONLY", "CITY_WIDE"]),
})

const editFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["ADMIN", "REGISTRATION", "TRIAGE", "DOCTOR", "LAB", "PHARMACY"]),
  facilityId: z.string().uuid("Facility is required"),
  scope: z.enum(["FACILITY_ONLY", "CITY_WIDE"]),
})

type CreateFormData = z.infer<typeof createFormSchema>
type EditFormData = z.infer<typeof editFormSchema>

interface UserFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  user?: UserListItem
  facilities: FacilityOption[]
  onSuccess: () => void
}

export function UserFormDialog({
  open,
  onOpenChange,
  mode,
  user,
  facilities,
  onSuccess,
}: UserFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  const schema = mode === "create" ? createFormSchema : editFormSchema

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateFormData | EditFormData>({
    resolver: zodResolver(schema),
    defaultValues: mode === "edit" && user
      ? {
          name: user.name,
          email: user.email,
          role: user.role,
          facilityId: user.facility.id,
          scope: user.scope,
        }
      : {
          name: "",
          email: "",
          password: "",
          role: undefined,
          facilityId: undefined,
          scope: "FACILITY_ONLY",
        },
  })

  const role = watch("role")
  const facilityId = watch("facilityId")
  const scope = watch("scope")

  // Reset form when dialog opens/closes or user changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && user) {
        reset({
          name: user.name,
          email: user.email,
          role: user.role,
          facilityId: user.facility.id,
          scope: user.scope,
        })
      } else {
        reset({
          name: "",
          email: "",
          password: "",
          role: undefined,
          facilityId: undefined,
          scope: "FACILITY_ONLY",
        })
      }
    }
  }, [open, mode, user, reset])

  const onSubmit = async (data: CreateFormData | EditFormData) => {
    setIsSubmitting(true)

    try {
      if (mode === "create") {
        const createData = data as CreateFormData
        const result = await createUserAction({
          name: createData.name,
          email: createData.email,
          password: createData.password,
          role: createData.role,
          facilityId: createData.facilityId,
          scope: createData.scope,
        })

        if (result.ok) {
          toast.success("Staff member created successfully")
          onOpenChange(false)
          onSuccess()
        } else {
          if (result.error.fieldErrors) {
            Object.entries(result.error.fieldErrors).forEach(([, messages]) => {
              messages.forEach((message) => toast.error(message))
            })
          } else {
            toast.error(result.error.message)
          }
        }
      } else {
        if (!user) return

        const editData = data as EditFormData
        const result = await updateUserAction({
          userId: user.id,
          name: editData.name,
          email: editData.email,
          role: editData.role,
          facilityId: editData.facilityId,
          scope: editData.scope,
        })

        if (result.ok) {
          toast.success("Staff member updated successfully")
          onOpenChange(false)
          onSuccess()
        } else {
          if (result.error.fieldErrors) {
            Object.entries(result.error.fieldErrors).forEach(([, messages]) => {
              messages.forEach((message) => toast.error(message))
            })
          } else {
            toast.error(result.error.message)
          }
        }
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "create" ? "Add New Staff" : "Edit Staff Member"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create a new staff account with system access."
              : "Update staff member details and permissions."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Juan Dela Cruz"
                aria-invalid={!!errors.name}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="col-span-2 space-y-2">
              <Label htmlFor="email">
                Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="juan@cho.gov.ph"
                aria-invalid={!!errors.email}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            {mode === "create" && (
              <div className="col-span-2 space-y-2">
                <Label htmlFor="password">
                  Password <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  {...register("password" as keyof (CreateFormData | EditFormData))}
                  placeholder="Minimum 8 characters"
                  aria-invalid={!!(errors as { password?: { message?: string } }).password}
                />
                {(errors as { password?: { message?: string } }).password && (
                  <p className="text-xs text-destructive">
                    {(errors as { password?: { message?: string } }).password?.message}
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label>
                Role <span className="text-destructive">*</span>
              </Label>
              <Select
                value={role}
                onValueChange={(value) =>
                  setValue("role", value as CreateFormData["role"], { shouldValidate: true })
                }
              >
                <SelectTrigger aria-invalid={!!errors.role}>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((roleOption) => (
                    <SelectItem key={`role-option-${roleOption.value}`} value={roleOption.value}>
                      {roleOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.role && (
                <p className="text-xs text-destructive">{errors.role.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>
                Access Scope <span className="text-destructive">*</span>
              </Label>
              <Select
                value={scope}
                onValueChange={(value) =>
                  setValue("scope", value as CreateFormData["scope"], { shouldValidate: true })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select scope" />
                </SelectTrigger>
                <SelectContent>
                  {USER_SCOPE_OPTIONS.map((scopeOption) => (
                    <SelectItem key={`scope-option-${scopeOption.value}`} value={scopeOption.value}>
                      {scopeOption.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2 space-y-2">
              <Label>
                Assigned Facility <span className="text-destructive">*</span>
              </Label>
              <Select
                value={facilityId}
                onValueChange={(value) =>
                  setValue("facilityId", value, { shouldValidate: true })
                }
              >
                <SelectTrigger aria-invalid={!!errors.facilityId}>
                  <SelectValue placeholder="Select facility" />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={`facility-option-${facility.id}`} value={facility.id}>
                      {facility.name} ({facility.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.facilityId && (
                <p className="text-xs text-destructive">{errors.facilityId.message}</p>
              )}
            </div>
          </div>

          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Staff" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
