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
import {
  createPatientAction,
  updatePatientAction,
  getBarangaysAction,
  type BarangayOption,
} from "@/actions/patients"
import {
  CIVIL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
  EDUCATION_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  PHILHEALTH_MEMBERSHIP_TYPE_OPTIONS,
} from "@/lib/constants"
import {
  Loader2,
  User,
  Calendar,
  Heart,
  MapPin,
  Phone,
  FileText,
  Briefcase,
  GraduationCap,
  Droplet,
  X,
  Save,
  UserPlus,
  Shield,
} from "lucide-react"

// Form schema - uses string for date input from HTML date picker
const patientFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(100),
  middleName: z.string().max(100).optional(),
  lastName: z.string().min(1, "Last name is required").max(100),
  birthDate: z.string().min(1, "Birth date is required"),
  sex: z.enum(["MALE", "FEMALE", "OTHER"], { message: "Sex is required" }),
  civilStatus: z.enum(["SINGLE", "MARRIED", "WIDOWED", "SEPARATED", "ANNULLED"], { message: "Civil status is required" }),
  religion: z.enum(["ROMAN_CATHOLIC", "PROTESTANT", "IGLESIA_NI_CRISTO", "ISLAM", "BUDDHIST", "OTHER", "NONE", "UNKNOWN"]),
  education: z.enum(["NO_FORMAL", "ELEMENTARY", "JUNIOR_HIGH", "SENIOR_HIGH", "VOCATIONAL", "COLLEGE", "POSTGRADUATE", "UNKNOWN"]),
  bloodType: z.enum(["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE", "UNKNOWN"]),
  occupation: z.string().max(100).optional(),
  phone: z.string().min(1, "Phone number is required").max(20),
  philhealthNo: z.string().regex(/^\d{12}$/, "Must be exactly 12 digits").optional().or(z.literal("")),
  philhealthMembershipType: z.enum(["EMPLOYED", "SELF_EMPLOYED", "INDIGENT", "OFW", "LIFETIME", "DEPENDENT", "OTHER"]).optional(),
  philhealthEligibilityStart: z.string().optional(),
  philhealthEligibilityEnd: z.string().optional(),
  philhealthPrincipalPin: z.string().regex(/^\d{12}$/, "Must be exactly 12 digits").optional().or(z.literal("")),
  addressLine: z.string().max(255).optional(),
  barangayId: z.string().uuid("Barangay is required"),
  notes: z.string().max(1000).optional(),
}).refine(
  (data) => {
    if (data.philhealthEligibilityStart && data.philhealthEligibilityEnd) {
      return new Date(data.philhealthEligibilityEnd) > new Date(data.philhealthEligibilityStart)
    }
    return true
  },
  {
    message: "End date must be after start date",
    path: ["philhealthEligibilityEnd"],
  }
)

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

// Section header component
function SectionHeader({
  icon: Icon,
  title,
  delay = 0,
}: {
  icon: React.ElementType
  title: string
  delay?: number
}) {
  return (
    <div
      className="clinical-section-header clinical-animate-in mb-4"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Icon className="h-3.5 w-3.5" />
      <span>{title}</span>
    </div>
  )
}

// Form field wrapper with animation
function FormField({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode
  delay?: number
  className?: string
}) {
  return (
    <div
      className={`clinical-animate-in space-y-2 ${className}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </div>
  )
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
        {error && (
          <div className="clinical-animate-in mb-6 flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            <div className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
            {error}
          </div>
        )}

        <div className="space-y-8">
          {/* Identity Section */}
          <section className="clinical-section pl-5">
            <SectionHeader icon={User} title="Patient Identity" delay={50} />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField delay={100}>
                <Label htmlFor="firstName" className="text-sm font-medium">
                  First Name <span className="clinical-required">*</span>
                </Label>
                <div className="clinical-input rounded-md">
                  <Input
                    id="firstName"
                    {...form.register("firstName")}
                    aria-invalid={!!form.formState.errors.firstName}
                    className="bg-input/50 border-border/60 focus-visible:border-primary/60"
                    placeholder="Juan"
                  />
                </div>
                {form.formState.errors.firstName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-destructive" />
                    {form.formState.errors.firstName.message}
                  </p>
                )}
              </FormField>

              <FormField delay={150}>
                <Label htmlFor="middleName" className="text-sm font-medium text-muted-foreground">
                  Middle Name
                </Label>
                <div className="clinical-input rounded-md">
                  <Input
                    id="middleName"
                    {...form.register("middleName")}
                    className="bg-input/50 border-border/60 focus-visible:border-primary/60"
                    placeholder="Santos"
                  />
                </div>
              </FormField>

              <FormField delay={200}>
                <Label htmlFor="lastName" className="text-sm font-medium">
                  Last Name <span className="clinical-required">*</span>
                </Label>
                <div className="clinical-input rounded-md">
                  <Input
                    id="lastName"
                    {...form.register("lastName")}
                    aria-invalid={!!form.formState.errors.lastName}
                    className="bg-input/50 border-border/60 focus-visible:border-primary/60"
                    placeholder="Dela Cruz"
                  />
                </div>
                {form.formState.errors.lastName && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-destructive" />
                    {form.formState.errors.lastName.message}
                  </p>
                )}
              </FormField>
            </div>
          </section>

          {/* Demographics Section */}
          <section className="clinical-section pl-5">
            <SectionHeader icon={Calendar} title="Demographics" delay={250} />

            <div className="grid gap-4 md:grid-cols-3">
              <FormField delay={300}>
                <Label htmlFor="birthDate" className="text-sm font-medium">
                  Birth Date <span className="clinical-required">*</span>
                </Label>
                <div className="clinical-input rounded-md">
                  <Input
                    id="birthDate"
                    type="date"
                    {...form.register("birthDate")}
                    aria-invalid={!!form.formState.errors.birthDate}
                    className="bg-input/50 border-border/60 focus-visible:border-primary/60"
                  />
                </div>
                {form.formState.errors.birthDate && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-destructive" />
                    {form.formState.errors.birthDate.message}
                  </p>
                )}
              </FormField>

              <FormField delay={350}>
                <Label htmlFor="sex" className="text-sm font-medium">
                  Sex <span className="clinical-required">*</span>
                </Label>
                <Select
                  value={form.watch("sex") ?? ""}
                  onValueChange={(value) =>
                    form.setValue("sex", value as PatientFormData["sex"])
                  }
                >
                  <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.sex && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-destructive" />
                    {form.formState.errors.sex.message}
                  </p>
                )}
              </FormField>

              <FormField delay={375}>
                <Label htmlFor="bloodType" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Droplet className="h-3 w-3" />
                  Blood Type
                </Label>
                <Select
                  value={form.watch("bloodType")}
                  onValueChange={(value) =>
                    form.setValue("bloodType", value as PatientFormData["bloodType"])
                  }
                >
                  <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
                    <SelectValue placeholder="Select blood type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BLOOD_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </section>

          {/* Civil Status & Personal Info Section */}
          <section className="clinical-section pl-5">
            <SectionHeader icon={Heart} title="Personal Information" delay={400} />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField delay={450}>
                <Label htmlFor="civilStatus" className="text-sm font-medium">
                  Civil Status <span className="clinical-required">*</span>
                </Label>
                <Select
                  value={form.watch("civilStatus") ?? ""}
                  onValueChange={(value) =>
                    form.setValue("civilStatus", value as PatientFormData["civilStatus"])
                  }
                >
                  <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
                    <SelectValue placeholder="Select civil status" />
                  </SelectTrigger>
                  <SelectContent>
                    {CIVIL_STATUS_OPTIONS.filter(opt => opt.value !== "UNKNOWN").map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.civilStatus && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-destructive" />
                    {form.formState.errors.civilStatus.message}
                  </p>
                )}
              </FormField>

              <FormField delay={500}>
                <Label htmlFor="religion" className="text-sm font-medium text-muted-foreground">
                  Religion
                </Label>
                <Select
                  value={form.watch("religion")}
                  onValueChange={(value) =>
                    form.setValue("religion", value as PatientFormData["religion"])
                  }
                >
                  <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    {RELIGION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </section>

          {/* Education & Occupation Section */}
          <section className="clinical-section pl-5">
            <SectionHeader icon={GraduationCap} title="Education & Employment" delay={550} />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField delay={600}>
                <Label htmlFor="education" className="text-sm font-medium text-muted-foreground">
                  Education Level
                </Label>
                <Select
                  value={form.watch("education")}
                  onValueChange={(value) =>
                    form.setValue("education", value as PatientFormData["education"])
                  }
                >
                  <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
                    <SelectValue placeholder="Select education level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EDUCATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <FormField delay={650}>
                <Label htmlFor="occupation" className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Briefcase className="h-3 w-3" />
                  Occupation
                </Label>
                <div className="clinical-input rounded-md">
                  <Input
                    id="occupation"
                    placeholder="e.g., Teacher, Farmer, Engineer"
                    {...form.register("occupation")}
                    className="bg-input/50 border-border/60 focus-visible:border-primary/60"
                  />
                </div>
              </FormField>
            </div>
          </section>

          {/* Contact Section */}
          <section className="clinical-section pl-5">
            <SectionHeader icon={Phone} title="Contact Information" delay={700} />

            <FormField delay={750}>
              <Label htmlFor="phone" className="text-sm font-medium">
                Phone Number <span className="clinical-required">*</span>
              </Label>
              <div className="clinical-input rounded-md">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="09XX-XXX-XXXX"
                  {...form.register("phone")}
                  aria-invalid={!!form.formState.errors.phone}
                  className="bg-input/50 border-border/60 focus-visible:border-primary/60 font-mono tracking-wide"
                />
              </div>
              {form.formState.errors.phone && (
                <p className="text-xs text-destructive flex items-center gap-1">
                  <span className="h-1 w-1 rounded-full bg-destructive" />
                  {form.formState.errors.phone.message}
                </p>
              )}
            </FormField>
          </section>

          {/* PhilHealth Section */}
          <section className="clinical-section pl-5">
            <SectionHeader icon={Shield} title="PhilHealth Information" delay={800} />

            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField delay={850}>
                  <Label htmlFor="philhealthNo" className="text-sm font-medium text-muted-foreground">
                    PhilHealth Number (PIN)
                  </Label>
                  <div className="clinical-input rounded-md">
                    <Input
                      id="philhealthNo"
                      placeholder="123456789012"
                      maxLength={12}
                      {...form.register("philhealthNo")}
                      aria-invalid={!!form.formState.errors.philhealthNo}
                      className="bg-input/50 border-border/60 focus-visible:border-primary/60 font-mono tracking-wide"
                    />
                  </div>
                  {form.formState.errors.philhealthNo && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-destructive" />
                      {form.formState.errors.philhealthNo.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">12-digit PhilHealth Identification Number</p>
                </FormField>

                <FormField delay={900}>
                  <Label htmlFor="philhealthMembershipType" className="text-sm font-medium text-muted-foreground">
                    Membership Type
                  </Label>
                  <Select
                    value={form.watch("philhealthMembershipType") ?? ""}
                    onValueChange={(value) =>
                      form.setValue("philhealthMembershipType", value as PatientFormData["philhealthMembershipType"])
                    }
                  >
                    <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
                      <SelectValue placeholder="Select membership type" />
                    </SelectTrigger>
                    <SelectContent>
                      {PHILHEALTH_MEMBERSHIP_TYPE_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField delay={950}>
                  <Label htmlFor="philhealthEligibilityStart" className="text-sm font-medium text-muted-foreground">
                    Eligibility Start Date
                  </Label>
                  <div className="clinical-input rounded-md">
                    <Input
                      id="philhealthEligibilityStart"
                      type="date"
                      {...form.register("philhealthEligibilityStart")}
                      className="bg-input/50 border-border/60 focus-visible:border-primary/60"
                    />
                  </div>
                </FormField>

                <FormField delay={1000}>
                  <Label htmlFor="philhealthEligibilityEnd" className="text-sm font-medium text-muted-foreground">
                    Eligibility End Date
                  </Label>
                  <div className="clinical-input rounded-md">
                    <Input
                      id="philhealthEligibilityEnd"
                      type="date"
                      {...form.register("philhealthEligibilityEnd")}
                      aria-invalid={!!form.formState.errors.philhealthEligibilityEnd}
                      className="bg-input/50 border-border/60 focus-visible:border-primary/60"
                    />
                  </div>
                  {form.formState.errors.philhealthEligibilityEnd && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-destructive" />
                      {form.formState.errors.philhealthEligibilityEnd.message}
                    </p>
                  )}
                </FormField>
              </div>

              {/* Conditional Principal PIN field - only shown for dependents */}
              {form.watch("philhealthMembershipType") === "DEPENDENT" && (
                <FormField delay={1050}>
                  <Label htmlFor="philhealthPrincipalPin" className="text-sm font-medium text-muted-foreground">
                    Principal Member&apos;s PhilHealth PIN
                  </Label>
                  <div className="clinical-input rounded-md">
                    <Input
                      id="philhealthPrincipalPin"
                      placeholder="123456789012"
                      maxLength={12}
                      {...form.register("philhealthPrincipalPin")}
                      aria-invalid={!!form.formState.errors.philhealthPrincipalPin}
                      className="bg-input/50 border-border/60 focus-visible:border-primary/60 font-mono tracking-wide"
                    />
                  </div>
                  {form.formState.errors.philhealthPrincipalPin && (
                    <p className="text-xs text-destructive flex items-center gap-1">
                      <span className="h-1 w-1 rounded-full bg-destructive" />
                      {form.formState.errors.philhealthPrincipalPin.message}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">12-digit PIN of the principal PhilHealth member</p>
                </FormField>
              )}
            </div>
          </section>

          {/* Address Section */}
          <section className="clinical-section pl-5">
            <SectionHeader icon={MapPin} title="Address" delay={1100} />

            <div className="grid gap-4 md:grid-cols-2">
              <FormField delay={1150}>
                <Label htmlFor="addressLine" className="text-sm font-medium text-muted-foreground">
                  Street Address
                </Label>
                <div className="clinical-input rounded-md">
                  <Input
                    id="addressLine"
                    placeholder="House No., Street, Purok, etc."
                    {...form.register("addressLine")}
                    className="bg-input/50 border-border/60 focus-visible:border-primary/60"
                  />
                </div>
              </FormField>

              <FormField delay={1150}>
                <Label htmlFor="barangayId" className="text-sm font-medium">
                  Barangay <span className="clinical-required">*</span>
                </Label>
                <Select
                  value={form.watch("barangayId") ?? ""}
                  onValueChange={(value) =>
                    form.setValue("barangayId", value)
                  }
                >
                  <SelectTrigger className="bg-input/50 border-border/60 focus:border-primary/60 focus:ring-primary/20">
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
                {form.formState.errors.barangayId && (
                  <p className="text-xs text-destructive flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-destructive" />
                    {form.formState.errors.barangayId.message}
                  </p>
                )}
              </FormField>
            </div>
          </section>

          {/* Notes Section */}
          <section className="clinical-section pl-5">
            <SectionHeader icon={FileText} title="Additional Notes" delay={1250} />

            <FormField delay={1300}>
              <div className="clinical-input rounded-md">
                <Textarea
                  id="notes"
                  placeholder="Medical history, allergies, special instructions..."
                  {...form.register("notes")}
                  rows={3}
                  className="bg-input/50 border-border/60 focus-visible:border-primary/60 resize-none"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Include any relevant medical history or special considerations
              </p>
            </FormField>
          </section>
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
