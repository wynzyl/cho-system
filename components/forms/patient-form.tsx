"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import {
  createPatientAction,
  updatePatientAction,
  getBarangaysAction,
  type BarangayOption,
} from "@/actions/patients"
import { Loader2, X, Save, UserPlus } from "lucide-react"
import { patientFormSchema, type PatientFormData } from "@/lib/validators/patient-form"
import { FormErrorBanner } from "@/components/ui/form-error-message"
import {
  PatientIdentitySection,
  DemographicsSection,
  PersonalInfoSection,
  EducationEmploymentSection,
  ContactSection,
  PhilHealthSection,
  AddressSection,
  NotesSection,
} from "@/components/forms/patient"

type FormMode = "create" | "edit"

interface PatientFormProps {
  mode: FormMode
  patientId?: string
  defaultValues?: {
    firstName?: string
    middleName?: string
    lastName?: string
    birthDate?: Date | string
    // Allow UNKNOWN for existing records, but form will require valid selection
    sex?: "MALE" | "FEMALE" | "OTHER" | "UNKNOWN"
    civilStatus?: "SINGLE" | "MARRIED" | "WIDOWED" | "SEPARATED" | "ANNULLED" | "UNKNOWN" | null
    religion?: "ROMAN_CATHOLIC" | "PROTESTANT" | "IGLESIA_NI_CRISTO" | "ISLAM" | "BUDDHIST" | "OTHER" | "NONE" | "UNKNOWN" | null
    education?: "NO_FORMAL" | "ELEMENTARY" | "JUNIOR_HIGH" | "SENIOR_HIGH" | "VOCATIONAL" | "COLLEGE" | "POSTGRADUATE" | "UNKNOWN" | null
    bloodType?: "A_POSITIVE" | "A_NEGATIVE" | "B_POSITIVE" | "B_NEGATIVE" | "AB_POSITIVE" | "AB_NEGATIVE" | "O_POSITIVE" | "O_NEGATIVE" | "UNKNOWN" | null
    occupation?: string
    phone?: string
    philhealthNo?: string
    philhealthMembershipType?: "EMPLOYED" | "SELF_EMPLOYED" | "INDIGENT" | "OFW" | "LIFETIME" | "DEPENDENT" | "OTHER" | null
    philhealthEligibilityStart?: Date | string | null
    philhealthEligibilityEnd?: Date | string | null
    philhealthPrincipalPin?: string | null
    addressLine?: string
    barangayId?: string | null
    notes?: string
  }
  onSuccess?: (patientId: string) => void
}

function formatDateForInput(date: Date | string | null | undefined): string {
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
      // Treat UNKNOWN as undefined to show placeholder and require selection
      sex: defaultValues?.sex === "UNKNOWN" ? undefined : defaultValues?.sex,
      civilStatus:
        defaultValues?.civilStatus &&
        defaultValues.civilStatus !== "UNKNOWN"
          ? defaultValues.civilStatus
          : undefined,
      religion: defaultValues?.religion ?? "UNKNOWN",
      education: defaultValues?.education ?? "UNKNOWN",
      bloodType: defaultValues?.bloodType ?? "UNKNOWN",
      occupation: defaultValues?.occupation ?? "",
      phone: defaultValues?.phone ?? "",
      philhealthNo: defaultValues?.philhealthNo ?? "",
      philhealthMembershipType: defaultValues?.philhealthMembershipType ?? undefined,
      philhealthEligibilityStart: formatDateForInput(defaultValues?.philhealthEligibilityStart),
      philhealthEligibilityEnd: formatDateForInput(defaultValues?.philhealthEligibilityEnd),
      philhealthPrincipalPin: defaultValues?.philhealthPrincipalPin ?? "",
      addressLine: defaultValues?.addressLine ?? "",
      barangayId: defaultValues?.barangayId ?? "",
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
          philhealthEligibilityStart: data.philhealthEligibilityStart
            ? new Date(data.philhealthEligibilityStart)
            : null,
          philhealthEligibilityEnd: data.philhealthEligibilityEnd
            ? new Date(data.philhealthEligibilityEnd)
            : null,
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
        } else if (mode === "edit") {
          if (!patientId) {
            setError("Cannot update patient: missing patient ID")
            return
          }
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Main form card */}
      <div className="clinical-card rounded-xl border border-border/50 p-6">
        {/* Error display */}
        <FormErrorBanner message={error} className="clinical-animate-in mb-6" />

        <div className="space-y-8">
          <PatientIdentitySection form={form} />
          <DemographicsSection form={form} />
          <PersonalInfoSection form={form} />
          <EducationEmploymentSection form={form} />
          <ContactSection form={form} />
          <PhilHealthSection form={form} />
          <AddressSection form={form} barangays={barangays} />
          <NotesSection form={form} />
        </div>
      </div>

      {/* Action buttons - outside the card */}
      <div
        className="clinical-animate-in flex items-center gap-3"
        style={{ animationDelay: "1350ms" }}
      >
        <Button
          type="submit"
          disabled={isPending}
          className="clinical-button-primary h-11 px-6 text-sm font-semibold tracking-wide"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : mode === "create" ? (
            <UserPlus className="mr-2 h-4 w-4" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {mode === "create" ? "Register Patient" : "Save Changes"}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
          className="h-11 px-6 border-border/60 hover:bg-accent/50 hover:border-border"
        >
          <X className="mr-2 h-4 w-4" />
          Cancel
        </Button>

        {mode === "edit" && (
          <div className="ml-auto text-xs text-muted-foreground">
            Changes are saved immediately after submission
          </div>
        )}
      </div>
    </form>
  )
}
