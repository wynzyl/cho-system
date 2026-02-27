"use client"

import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Heart, ShieldAlert, User, Phone, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PatientForConsult } from "@/actions/doctor"
import type { PatientAllergyStatus, AllergySeverity } from "@prisma/client"

interface PatientSnapshotProps {
  patient: PatientForConsult
  chiefComplaint?: string | null
  exposureFlags?: string[]
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

function getAllergyStatusStyle(status: PatientAllergyStatus) {
  switch (status) {
    case "HAS_ALLERGIES":
      return "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
    case "NKA":
      return "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
    default:
      return "border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950"
  }
}

function getSeverityStyle(severity: AllergySeverity) {
  switch (severity) {
    case "SEVERE":
      return "bg-red-600 text-white"
    case "MODERATE":
      return "bg-orange-500 text-white"
    default:
      return "bg-yellow-500 text-white"
  }
}

export function PatientSnapshot({ patient, chiefComplaint, exposureFlags = [] }: PatientSnapshotProps) {
  const age = calculateAge(patient.birthDate)
  const hasAllergies = patient.allergyStatus === "HAS_ALLERGIES"
  const activeAllergies = patient.allergies.filter((a) => a.status === "ACTIVE")
  const severeAllergies = activeAllergies.filter((a) => a.severity === "SEVERE")

  // Extract chronic conditions from medicalHistoryData
  const chronicConditions = patient.medicalHistoryData?.conditions?.filter((c) => c.isActive) ?? []

  return (
    <div className="sticky top-0 z-10 border-b bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Main Patient Info Row */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Patient Avatar/Icon */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-700">
            <User className="h-6 w-6 text-slate-600 dark:text-slate-300" />
          </div>

          {/* Patient Details */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight">
                {patient.lastName}, {patient.firstName}
                {patient.middleName && ` ${patient.middleName.charAt(0)}.`}
              </h2>
              <Badge variant="outline" className="font-mono text-xs">
                {patient.patientCode}
              </Badge>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>{age} y/o</span>
              <span className="text-slate-300">|</span>
              <span>{patient.sex}</span>
              {patient.bloodType && patient.bloodType !== "UNKNOWN" && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="font-medium text-red-600">{patient.bloodType.replace("_", "")}</span>
                </>
              )}
              {patient.phone && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {patient.phone}
                  </span>
                </>
              )}
              {patient.barangay && (
                <>
                  <span className="text-slate-300">|</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {patient.barangay.name}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Chief Complaint Badge */}
        {chiefComplaint && (
          <div className="max-w-md rounded-lg border border-slate-200 bg-white px-4 py-2 dark:border-slate-700 dark:bg-slate-800">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Chief Complaint</p>
            <p className="text-sm font-medium">{chiefComplaint}</p>
          </div>
        )}
      </div>

      {/* Alerts Row */}
      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 px-4 py-2 dark:border-slate-700">
        {/* Allergy Status */}
        <div
          className={cn(
            "flex items-center gap-2 rounded-md border px-3 py-1.5",
            getAllergyStatusStyle(patient.allergyStatus)
          )}
        >
          {hasAllergies ? (
            <>
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium text-red-700 dark:text-red-300">
                {severeAllergies.length > 0 ? "SEVERE ALLERGIES" : "ALLERGIES"}
              </span>
              <div className="flex gap-1">
                {activeAllergies.slice(0, 3).map((allergy) => (
                  <Badge
                    key={allergy.id}
                    className={cn("text-xs", getSeverityStyle(allergy.severity))}
                  >
                    {allergy.allergen}
                  </Badge>
                ))}
                {activeAllergies.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{activeAllergies.length - 3} more
                  </Badge>
                )}
              </div>
            </>
          ) : patient.allergyStatus === "NKA" ? (
            <>
              <Heart className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                No Known Allergies
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700 dark:text-amber-300">
                Allergy Status Unknown
              </span>
            </>
          )}
        </div>

        {/* Chronic Conditions */}
        {chronicConditions.length > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-purple-200 bg-purple-50 px-3 py-1.5 dark:border-purple-800 dark:bg-purple-950">
            <Heart className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700 dark:text-purple-300">
              Chronic:
            </span>
            <div className="flex gap-1">
              {chronicConditions.slice(0, 3).map((condition) => (
                <Badge
                  key={condition.code}
                  variant="outline"
                  className="border-purple-300 text-xs text-purple-700 dark:border-purple-700 dark:text-purple-300"
                >
                  {condition.name}
                </Badge>
              ))}
              {chronicConditions.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{chronicConditions.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Exposure Alerts */}
        {exposureFlags.length > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-1.5 dark:border-orange-800 dark:bg-orange-950">
            <ShieldAlert className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700 dark:text-orange-300">
              Exposure Alert
            </span>
            <div className="flex gap-1">
              {exposureFlags.map((flag) => (
                <Badge
                  key={flag}
                  variant="outline"
                  className="border-orange-300 text-xs text-orange-700 dark:border-orange-700 dark:text-orange-300"
                >
                  {flag.replace(/_/g, " ")}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Lifestyle Indicators */}
        {(patient.isSmoker || patient.isAlcohol || patient.pregnancyStatus === "pregnant") && (
          <div className="flex gap-2">
            {patient.isSmoker && (
              <Badge variant="outline" className="border-slate-300 text-xs">
                Smoker {patient.smokingPackYears ? `(${patient.smokingPackYears} PY)` : ""}
              </Badge>
            )}
            {patient.isAlcohol && (
              <Badge variant="outline" className="border-slate-300 text-xs">
                Alcohol Use
              </Badge>
            )}
            {patient.pregnancyStatus === "pregnant" && (
              <Badge className="bg-pink-500 text-xs text-white">
                Pregnant {patient.pregnancyWeeks ? `(${patient.pregnancyWeeks}w)` : ""}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
