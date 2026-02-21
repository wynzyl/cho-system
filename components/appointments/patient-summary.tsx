"use client"

import {
  User,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  Ruler,
  Activity,
  CreditCard,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { EncounterDetails } from "@/actions/doctor"

interface PatientSummaryProps {
  encounter: EncounterDetails
}

function formatDate(isoString: string): string {
  return new Date(isoString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

function formatSex(sex: string): string {
  switch (sex) {
    case "MALE":
      return "Male"
    case "FEMALE":
      return "Female"
    case "OTHER":
      return "Other"
    default:
      return "Unknown"
  }
}

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    TRIAGED: { variant: "outline", label: "Triaged" },
    WAIT_DOCTOR: { variant: "secondary", label: "Waiting" },
    IN_CONSULT: { variant: "default", label: "In Consult" },
    FOR_LAB: { variant: "outline", label: "For Lab" },
    FOR_PHARMACY: { variant: "outline", label: "For Pharmacy" },
    DONE: { variant: "secondary", label: "Done" },
  }
  return variants[status] || { variant: "secondary" as const, label: status }
}

export function PatientSummary({ encounter }: PatientSummaryProps) {
  const { patient, triageRecord, status } = encounter
  const statusInfo = getStatusBadge(status)

  return (
    <div className="space-y-4">
      {/* Patient Info Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5" />
              Patient Information
            </CardTitle>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xl font-semibold">
              {patient.lastName}, {patient.firstName}
              {patient.middleName && ` ${patient.middleName}`}
            </p>
            <p className="text-sm text-muted-foreground">
              {patient.patientCode}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {formatDate(patient.birthDate)} ({patient.age}y)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>{formatSex(patient.sex)}</span>
            </div>
            {patient.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{patient.phone}</span>
              </div>
            )}
            {patient.philhealthNo && (
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span>{patient.philhealthNo}</span>
              </div>
            )}
          </div>

          {(patient.addressLine || patient.barangay) && (
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <span>
                {[patient.addressLine, patient.barangay].filter(Boolean).join(", ")}
              </span>
            </div>
          )}

          {encounter.chiefComplaint && (
            <div className="rounded-md bg-muted p-3">
              <p className="text-xs font-medium text-muted-foreground uppercase">
                Chief Complaint
              </p>
              <p className="mt-1 text-sm">{encounter.chiefComplaint}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Vitals Card */}
      {triageRecord && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {triageRecord.bpSystolic && triageRecord.bpDiastolic && (
                <VitalItem
                  icon={<Heart className="h-4 w-4 text-red-500" />}
                  label="Blood Pressure"
                  value={`${triageRecord.bpSystolic}/${triageRecord.bpDiastolic} mmHg`}
                />
              )}
              {triageRecord.heartRate && (
                <VitalItem
                  icon={<Activity className="h-4 w-4 text-pink-500" />}
                  label="Heart Rate"
                  value={`${triageRecord.heartRate} bpm`}
                />
              )}
              {triageRecord.temperatureC && (
                <VitalItem
                  icon={<Thermometer className="h-4 w-4 text-orange-500" />}
                  label="Temperature"
                  value={`${triageRecord.temperatureC}°C`}
                />
              )}
              {triageRecord.respiratoryRate && (
                <VitalItem
                  icon={<Wind className="h-4 w-4 text-blue-500" />}
                  label="Respiratory Rate"
                  value={`${triageRecord.respiratoryRate}/min`}
                />
              )}
              {triageRecord.spo2 && (
                <VitalItem
                  icon={<Droplets className="h-4 w-4 text-cyan-500" />}
                  label="SpO2"
                  value={`${triageRecord.spo2}%`}
                />
              )}
              {triageRecord.weightKg && (
                <VitalItem
                  icon={<Scale className="h-4 w-4 text-green-500" />}
                  label="Weight"
                  value={`${triageRecord.weightKg} kg`}
                />
              )}
              {triageRecord.heightCm && (
                <VitalItem
                  icon={<Ruler className="h-4 w-4 text-emerald-500" />}
                  label="Height"
                  value={`${triageRecord.heightCm} cm`}
                />
              )}
            </div>
            {triageRecord.notes && (
              <div className="mt-3 rounded-md bg-muted p-2 text-sm">
                <p className="text-xs font-medium text-muted-foreground">
                  Triage Notes
                </p>
                <p className="mt-1">{triageRecord.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function VitalItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card p-2">
      {icon}
      <div className="min-w-0">
        <p className="truncate text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}
