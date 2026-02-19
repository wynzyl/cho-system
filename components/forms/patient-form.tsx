"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import {
  createPatientAction,
  updatePatientAction,
  getBarangaysAction,
  type BarangayOption,
} from "@/actions/patients"
import { Loader2 } from "lucide-react"

// Form schema - uses string for date input from HTML date picker
const patientFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1, "Last name is required").max(100),
  birthDate: z.string().min(1, "Birth date is required"),
  sex: z.enum(["MALE", "FEMALE", "OTHER", "UNKNOWN"]),
  phone: z.string().max(20).optional(),
  philhealthNo: z.string().max(20).optional(),
  addressLine: z.string().max(255).optional(),
  barangayId: z.string().uuid().optional().nullable(),
  notes: z.string().max(1000).optional(),
})

type PatientFormData = z.infer<typeof patientFormSchema>

type FormMode = "create" | "edit"

interface PatientFormProps {
  mode: FormMode
  patientId?: string
  defaultValues?: {
    firstName?: string
    middleName?: string
    lastName?: string
    birthDate?: Date | string
    sex?: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN"
    phone?: string
    philhealthNo?: string
    addressLine?: string
    barangayId?: string | null
    notes?: string
  }
  onSuccess?: (patientId: string) => void
}

function formatDateForInput(date: Date | string | undefined): string {
  if (!date) return ""
  const d = typeof date === "string" ? new Date(date) : date
  return d.toISOString().split("T")[0]
}

export function PatientForm({
  mode,
  patientId,
  defaultValues,
  onSuccess,
}: PatientFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [barangays, setBarangays] = useState<BarangayOption[]>([])
  const [error, setError] = useState<string | null>(null)

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: {
      firstName: defaultValues?.firstName ?? "",
      middleName: defaultValues?.middleName ?? "",
      lastName: defaultValues?.lastName ?? "",
      birthDate: formatDateForInput(defaultValues?.birthDate),
      sex: defaultValues?.sex ?? "UNKNOWN",
      phone: defaultValues?.phone ?? "",
      philhealthNo: defaultValues?.philhealthNo ?? "",
      addressLine: defaultValues?.addressLine ?? "",
      barangayId: defaultValues?.barangayId ?? null,
      notes: defaultValues?.notes ?? "",
    },
  })

  useEffect(() => {
    async function loadBarangays() {
      const result = await getBarangaysAction()
      if (result.ok) {
        setBarangays(result.data)
      }
    }
    loadBarangays()
  }, [])

  const onSubmit = (data: PatientFormData) => {
    setError(null)
    startTransition(async () => {
      try {
        // Convert form data to action input (string date to Date)
        const actionData = {
          ...data,
          birthDate: new Date(data.birthDate),
        }

        if (mode === "create") {
          const result = await createPatientAction(actionData)
          if (result.ok) {
            if (onSuccess) {
              onSuccess(result.data.id)
            } else {
              router.push(`/patients/${result.data.id}`)
            }
          } else {
            setError(result.error.message)
            if (result.error.fieldErrors) {
              Object.entries(result.error.fieldErrors).forEach(([field, messages]) => {
                form.setError(field as keyof PatientFormData, {
                  message: messages[0],
                })
              })
            }
          }
        } else if (patientId) {
          const result = await updatePatientAction(patientId, actionData)
          if (result.ok) {
            if (onSuccess) {
              onSuccess(result.data.id)
            } else {
              router.push(`/patients/${result.data.id}`)
            }
          } else {
            setError(result.error.message)
            if (result.error.fieldErrors) {
              Object.entries(result.error.fieldErrors).forEach(([field, messages]) => {
                form.setError(field as keyof PatientFormData, {
                  message: messages[0],
                })
              })
            }
          }
        }
      } catch {
        setError("An unexpected error occurred")
      }
    })
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card>
        <CardContent className="space-y-6 pt-6">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="firstName">
                First Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="firstName"
                {...form.register("firstName")}
                aria-invalid={!!form.formState.errors.firstName}
              />
              {form.formState.errors.firstName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input id="middleName" {...form.register("middleName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName">
                Last Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="lastName"
                {...form.register("lastName")}
                aria-invalid={!!form.formState.errors.lastName}
              />
              {form.formState.errors.lastName && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="birthDate">
                Birth Date <span className="text-destructive">*</span>
              </Label>
              <Input
                id="birthDate"
                type="date"
                {...form.register("birthDate")}
                aria-invalid={!!form.formState.errors.birthDate}
              />
              {form.formState.errors.birthDate && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.birthDate.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sex">Sex</Label>
              <Select
                value={form.watch("sex")}
                onValueChange={(value) =>
                  form.setValue("sex", value as PatientFormData["sex"])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MALE">Male</SelectItem>
                  <SelectItem value="FEMALE">Female</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                  <SelectItem value="UNKNOWN">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="09XX-XXX-XXXX"
                {...form.register("phone")}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="philhealthNo">PhilHealth Number</Label>
              <Input
                id="philhealthNo"
                placeholder="XX-XXXXXXXXX-X"
                {...form.register("philhealthNo")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="barangayId">Barangay</Label>
              <Select
                value={form.watch("barangayId") ?? ""}
                onValueChange={(value) =>
                  form.setValue("barangayId", value || null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select barangay" />
                </SelectTrigger>
                <SelectContent>
                  {barangays.map((brgy) => (
                    <SelectItem key={brgy.id} value={brgy.id}>
                      {brgy.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="addressLine">Address Line</Label>
            <Input
              id="addressLine"
              placeholder="Street, House No., etc."
              {...form.register("addressLine")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes about the patient..."
              {...form.register("notes")}
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === "create" ? "Create Patient" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
