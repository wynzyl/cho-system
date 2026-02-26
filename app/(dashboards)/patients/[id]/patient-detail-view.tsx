"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { PatientForm } from "@/components/forms/patient-form"
import { AllergyBanner, AllergyCard } from "@/components/allergy"
import { createEncounterAction } from "@/actions/encounters"
import type { PatientWithEncounters } from "@/actions/patients"
import {
  CIVIL_STATUS_OPTIONS,
  RELIGION_OPTIONS,
  EDUCATION_OPTIONS,
  BLOOD_TYPE_OPTIONS,
  PHILHEALTH_MEMBERSHIP_TYPE_OPTIONS,
} from "@/lib/constants"
import {
  Pencil,
  PlayCircle,
  Loader2,
  User,
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  FileText,
  Heart,
  GraduationCap,
  Briefcase,
  Droplet,
  Clock,
  Activity,
  Shield,
  CalendarRange,
  Users,
} from "lucide-react"
import Link from "next/link"

function formatEnumLabel(
  value: string | null | undefined,
  options: readonly { value: string; label: string }[]
): string | null {
  if (!value || value === "UNKNOWN") return null
  const option = options.find((opt) => opt.value === value)
  return option?.label ?? null
}

interface PatientDetailViewProps {
  patient: PatientWithEncounters
  canEdit: boolean
  canEditAllergies: boolean
  canStartEncounter: boolean
  isEditMode: boolean
}

function formatDate(date: Date | string | null): string {
  if (!date) return "-"
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

function calculateAge(birthDate: Date | string): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function getStatusBadgeVariant(
  status: string
): "default" | "secondary" | "outline" | "destructive" {
  switch (status) {
    case "DONE":
      return "default"
    case "CANCELLED":
      return "destructive"
    case "WAIT_TRIAGE":
    case "WAIT_DOCTOR":
      return "secondary"
    default:
      return "outline"
  }
}

function formatStatus(status: string): string {
  return status.replace(/_/g, " ")
}

// Info row component for consistent styling
function InfoRow({
  icon: Icon,
  label,
  value,
  mono = false,
}: {
  icon: React.ElementType
  label: string
  value: string | null | undefined
  mono?: boolean
}) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={`text-sm ${mono ? "font-mono tracking-wide" : ""}`}>
          {value}
        </p>
      </div>
    </div>
  )
}

export function PatientDetailView({
  patient,
  canEdit,
  canEditAllergies,
  canStartEncounter,
  isEditMode,
}: PatientDetailViewProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [encounterError, setEncounterError] = useState<string | null>(null)

  const handleStartEncounter = () => {
    setEncounterError(null)
    startTransition(async () => {
      const result = await createEncounterAction({ patientId: patient.id })
      if (result.ok) {
        router.refresh()
      } else {
        setEncounterError(result.error.message || "Failed to start encounter")
      }
    })
  }

  const handleEditSuccess = () => {
    router.push(`/patients/${patient.id}`)
  }

  if (isEditMode) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <Pencil className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Edit Patient Record</h1>
            <p className="text-sm text-muted-foreground">
              Update patient information for{" "}
              <span className="clinical-code text-xs">{patient.patientCode}</span>
            </p>
          </div>
        </div>
        <div className="max-w-3xl">
          <PatientForm
            mode="edit"
            patientId={patient.id}
            defaultValues={{
              firstName: patient.firstName,
              middleName: patient.middleName ?? undefined,
              lastName: patient.lastName,
              birthDate: patient.birthDate,
              sex: patient.sex,
              civilStatus: patient.civilStatus,
              religion: patient.religion,
              education: patient.education,
              bloodType: patient.bloodType,
              occupation: patient.occupation ?? undefined,
              phone: patient.phone ?? undefined,
              philhealthNo: patient.philhealthNo ?? undefined,
              philhealthMembershipType: patient.philhealthMembershipType,
              philhealthEligibilityStart: patient.philhealthEligibilityStart,
              philhealthEligibilityEnd: patient.philhealthEligibilityEnd,
              philhealthPrincipalPin: patient.philhealthPrincipalPin,
              addressLine: patient.addressLine ?? undefined,
              barangayId: patient.barangayId,
              notes: patient.notes ?? undefined,
            }}
            onSuccess={handleEditSuccess}
          />
        </div>
      </div>
    )
  }

  const age = calculateAge(patient.birthDate)
  const fullAddress = [
    patient.addressLine,
    patient.barangay?.name ? `Brgy. ${patient.barangay.name}` : null,
    patient.city,
    patient.province,
  ]
    .filter(Boolean)
    .join(", ")

  const handleAllergyUpdate = () => {
    router.refresh()
  }

  // Get active allergies for banner
  const activeAllergies = (patient.allergies ?? [])
    .filter((a) => a.status === "ACTIVE")
    .map((a) => ({ allergen: a.allergen, severity: a.severity }))

  return (
    <div className="space-y-6">
      {/* Allergy Banner - Always visible at top */}
      <AllergyBanner
        status={patient.allergyStatus ?? "UNKNOWN"}
        allergies={activeAllergies}
      />

      {/* Active encounter alert */}
      {patient.todayEncounter && (
        <div className="clinical-animate-in flex items-center justify-between rounded-xl border border-primary/30 bg-primary/5 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Activity className="h-5 w-5 text-primary" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-medium">Active Encounter</p>
              <p className="text-xs text-muted-foreground">
                Started today -{" "}
                <Badge
                  variant={getStatusBadgeVariant(patient.todayEncounter.status)}
                  className="ml-1"
                >
                  {formatStatus(patient.todayEncounter.status)}
                </Badge>
              </p>
            </div>
          </div>
          <Link
            href={`/encounters/${patient.todayEncounter.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary/20"
          >
            View Encounter
            <span className="text-xs">→</span>
          </Link>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {/* Avatar placeholder */}
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20">
            <User className="h-8 w-8 text-primary/60" />
          </div>
          {/* Patient Name & Info */}
          <div>
            <div className="clinical-code mb-2 inline-block text-xs">
              {patient.patientCode}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {patient.lastName}, {patient.firstName}
              {patient.middleName ? ` ${patient.middleName}` : ""}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5" />
                {formatDate(patient.birthDate)}
              </span>
              <span className="text-border">•</span>
              <span>{age} years old</span>
              <span className="text-border">•</span>
              <Badge
                variant={patient.sex === "MALE" ? "default" : "secondary"}
                className="text-xs"
              >
                {patient.sex}
              </Badge>
              {formatEnumLabel(patient.civilStatus, CIVIL_STATUS_OPTIONS) && (
                <>
                  <span className="text-border">•</span>
                  <span>{formatEnumLabel(patient.civilStatus, CIVIL_STATUS_OPTIONS)}</span>
                </>
              )}
            </div>
          </div>
          {/* end of patient name & info */}
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push(`/patients/${patient.id}?edit=true`)}
              className="border-border/60 hover:border-border hover:bg-accent/50"
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {canStartEncounter && !patient.todayEncounter && (
            <div className="flex flex-col items-end gap-1">
              <Button
                onClick={handleStartEncounter}
                disabled={isPending}
                className="clinical-button-primary"
              >
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="mr-2 h-4 w-4" />
                )}
                Start Encounter
              </Button>
              {encounterError && (
                <p className="text-xs text-destructive">{encounterError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Patient info cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Contact Card */}
        <div className="clinical-card rounded-xl border border-border/50 p-5">
          <h3 className="clinical-section-header mb-4">
            <Phone className="h-3.5 w-3.5" />
            Contact
          </h3>
          <div className="space-y-1">
            <InfoRow icon={Phone} label="Phone" value={patient.phone} mono />
          </div>
        </div>

        {/* Address Card */}
        <div className="clinical-card rounded-xl border border-border/50 p-5">
          <h3 className="clinical-section-header mb-4">
            <MapPin className="h-3.5 w-3.5" />
            Address
          </h3>
          {fullAddress ? (
            <p className="text-sm leading-relaxed">{fullAddress}</p>
          ) : (
            <p className="text-sm text-muted-foreground">No address on file</p>
          )}
        </div>

        {/* Demographics Card */}
        <div className="clinical-card rounded-xl border border-border/50 p-5">
          <h3 className="clinical-section-header mb-4">
            <Heart className="h-3.5 w-3.5" />
            Demographics
          </h3>
          <div className="space-y-1">
            <InfoRow
              icon={Heart}
              label="Religion"
              value={formatEnumLabel(patient.religion, RELIGION_OPTIONS)}
            />
            <InfoRow
              icon={Droplet}
              label="Blood Type"
              value={formatEnumLabel(patient.bloodType, BLOOD_TYPE_OPTIONS)}
            />
            <InfoRow
              icon={GraduationCap}
              label="Education"
              value={formatEnumLabel(patient.education, EDUCATION_OPTIONS)}
            />
            <InfoRow
              icon={Briefcase}
              label="Occupation"
              value={patient.occupation}
            />
          </div>
        </div>
      </div>

      {/* PhilHealth Card */}
      <div className="clinical-card rounded-xl border border-border/50 p-5">
        <h3 className="clinical-section-header mb-4">
          <Shield className="h-3.5 w-3.5" />
          PhilHealth
        </h3>
        {patient.philhealthNo || patient.philhealthMembershipType ? (
          <div className="space-y-1">
            <InfoRow icon={CreditCard} label="PIN" value={patient.philhealthNo} mono />
            <InfoRow
              icon={Shield}
              label="Membership"
              value={formatEnumLabel(patient.philhealthMembershipType, PHILHEALTH_MEMBERSHIP_TYPE_OPTIONS)}
            />
            {(patient.philhealthEligibilityStart || patient.philhealthEligibilityEnd) && (
              <InfoRow
                icon={CalendarRange}
                label="Eligibility"
                value={
                  patient.philhealthEligibilityStart && patient.philhealthEligibilityEnd
                    ? `${formatDate(patient.philhealthEligibilityStart)} - ${formatDate(patient.philhealthEligibilityEnd)}`
                    : patient.philhealthEligibilityStart
                      ? `From ${formatDate(patient.philhealthEligibilityStart)}`
                      : `Until ${formatDate(patient.philhealthEligibilityEnd)}`
                }
              />
            )}
            {patient.philhealthMembershipType === "DEPENDENT" && patient.philhealthPrincipalPin && (
              <InfoRow
                icon={Users}
                label="Principal PIN"
                value={patient.philhealthPrincipalPin}
                mono
              />
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No PhilHealth information on file</p>
        )}
      </div>

      {/* Allergy Card */}
      <AllergyCard
        patientId={patient.id}
        allergyStatus={patient.allergyStatus ?? "UNKNOWN"}
        allergies={patient.allergies ?? []}
        allergyConfirmedAt={patient.allergyConfirmedAt}
        allergyConfirmedBy={patient.allergyConfirmedBy}
        canEdit={canEditAllergies}
        onUpdate={handleAllergyUpdate}
      />

      {/* Notes */}
      {patient.notes && (
        <div className="clinical-card rounded-xl border border-border/50 p-5">
          <h3 className="clinical-section-header mb-3">
            <FileText className="h-3.5 w-3.5" />
            Notes
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {patient.notes}
          </p>
        </div>
      )}

      {/* Encounter History */}
      <div className="clinical-card rounded-xl border border-border/50 p-5">
        <h3 className="clinical-section-header mb-4">
          <Clock className="h-3.5 w-3.5" />
          Encounter History
        </h3>

        {patient.encounters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Activity className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium">No encounters yet</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Start an encounter to begin recording patient visits
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-border/50">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Chief Complaint
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.encounters.map((encounter, index) => (
                  <TableRow
                    key={encounter.id}
                    className="border-border/30 transition-colors hover:bg-accent/30"
                    style={{
                      animationDelay: `${index * 50}ms`,
                    }}
                  >
                    <TableCell className="font-mono text-sm">
                      {formatDate(encounter.occurredAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(encounter.status)}>
                        {formatStatus(encounter.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {encounter.chiefComplaint || (
                        <span className="text-muted-foreground/50">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}
