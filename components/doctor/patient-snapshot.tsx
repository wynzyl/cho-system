"use client"

import { AlertTriangle, User, Phone, Pill, Cigarette, Wine } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { EXPOSURE_FLAGS, getSeverityColor, type AllergySeverityValue } from "@/lib/constants"
import type { PatientForConsult, TriageRecordForConsult } from "@/actions/doctor"
import { isMedicalHistoryData, type MedicalHistoryData } from "@/lib/types/consultation"

interface PatientSnapshotProps {
  patient: PatientForConsult
  triageRecord: TriageRecordForConsult | null
  chiefComplaint: string | null
}

function calculateAge(birthDate: Date): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

export function PatientSnapshot({ patient, triageRecord, chiefComplaint }: PatientSnapshotProps) {
  // Calculate age
  const age = calculateAge(patient.birthDate)

  // Parse medical history
  const medicalHistory: MedicalHistoryData | null = isMedicalHistoryData(patient.medicalHistoryData)
    ? patient.medicalHistoryData
    : null

  // Get active chronic conditions
  const chronicConditions = medicalHistory?.conditions.filter((c) => c.code) ?? []

  // Get current medications
  const currentMedications = medicalHistory?.currentMedications ?? []

  // Get exposure alerts
  const exposureAlerts = triageRecord?.exposureFlags
    ?.map((flag) => EXPOSURE_FLAGS.find((f) => f.value === flag))
    .filter((f) => f?.alert) ?? []

  // Allergy status banner color
  const allergyBannerClass =
    patient.allergyStatus === "HAS_ALLERGIES"
      ? "bg-red-100 border-red-200 dark:bg-red-950 dark:border-red-800"
      : patient.allergyStatus === "NKA"
        ? "bg-green-100 border-green-200 dark:bg-green-950 dark:border-green-800"
        : "bg-yellow-100 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800"

  return (
    <div className="border-b bg-muted/30">
      {/* Top row - Patient info */}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            <span className="text-lg font-semibold">
              {patient.lastName}, {patient.firstName} {patient.middleName?.[0]}.
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{age} y/o</span>
            <span>•</span>
            <span>{patient.sex}</span>
            <span>•</span>
            <span className="font-mono">{patient.patientCode}</span>
          </div>
          {patient.phone && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Phone className="h-3 w-3" />
              <span>{patient.phone}</span>
            </div>
          )}
        </div>

        {/* Lifestyle indicators */}
        <div className="flex items-center gap-2">
          {patient.isSmoker && (
            <Badge variant="outline" className="gap-1 text-orange-600">
              <Cigarette className="h-3 w-3" />
              Smoker
              {patient.smokingPackYears && ` (${patient.smokingPackYears} pack-yrs)`}
            </Badge>
          )}
          {patient.isAlcohol && (
            <Badge variant="outline" className="gap-1 text-purple-600">
              <Wine className="h-3 w-3" />
              Alcohol
            </Badge>
          )}
          {patient.pregnancyStatus === "pregnant" && (
            <Badge className="bg-pink-500">
              Pregnant {patient.pregnancyWeeks && `(${patient.pregnancyWeeks}w)`}
            </Badge>
          )}
        </div>
      </div>

      {/* Second row - Allergies, Conditions, Exposures */}
      <div className="flex flex-wrap items-center gap-4 px-4 pb-2">
        {/* Allergy Banner */}
        <div className={cn("rounded-md border px-3 py-1", allergyBannerClass)}>
          {patient.allergyStatus === "HAS_ALLERGIES" ? (
            <div className="flex flex-wrap items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                Allergies:
              </span>
              {patient.allergies.map((allergy) => (
                <Badge
                  key={allergy.id}
                  className={cn(
                    "text-xs",
                    getSeverityColor(allergy.severity as AllergySeverityValue)
                  )}
                >
                  {allergy.allergen}
                  {allergy.severity === "SEVERE" && " (SEVERE)"}
                </Badge>
              ))}
            </div>
          ) : patient.allergyStatus === "NKA" ? (
            <span className="text-sm text-green-700 dark:text-green-300">
              No Known Allergies (NKA)
            </span>
          ) : (
            <span className="text-sm text-yellow-700 dark:text-yellow-300">
              Allergy status unconfirmed
            </span>
          )}
        </div>

        {/* Chronic Conditions */}
        {chronicConditions.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Conditions:</span>
            {chronicConditions.map((condition) => (
              <Badge key={condition.code} variant="secondary" className="text-xs">
                {condition.name}
                {condition.isControlled === false && " (uncontrolled)"}
              </Badge>
            ))}
          </div>
        )}

        {/* Current Medications */}
        {currentMedications.length > 0 && (
          <div className="flex items-center gap-2">
            <Pill className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {currentMedications.length} current meds
            </span>
          </div>
        )}

        {/* Exposure Alerts */}
        {exposureAlerts.length > 0 && (
          <div className="flex items-center gap-2">
            {exposureAlerts.map((flag) => (
              <Badge
                key={flag?.value}
                variant="outline"
                className={cn(
                  "gap-1 text-xs",
                  flag?.color === "red" && "border-red-300 bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300",
                  flag?.color === "orange" && "border-orange-300 bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
                  flag?.color === "yellow" && "border-yellow-300 bg-yellow-50 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
                )}
              >
                <AlertTriangle className="h-3 w-3" />
                {flag?.alert}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Chief Complaint */}
      {chiefComplaint && (
        <div className="border-t bg-primary/5 px-4 py-2">
          <span className="text-sm font-medium text-primary">Chief Complaint: </span>
          <span className="text-sm">{chiefComplaint}</span>
        </div>
      )}
    </div>
  )
}
