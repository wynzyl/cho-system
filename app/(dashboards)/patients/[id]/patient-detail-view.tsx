"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { createEncounterAction } from "@/actions/encounters"
import type { PatientWithEncounters } from "@/actions/patients"
import { Pencil, PlayCircle, Loader2, Info } from "lucide-react"
import Link from "next/link"

interface PatientDetailViewProps {
  patient: PatientWithEncounters
  canEdit: boolean
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

export function PatientDetailView({
  patient,
  canEdit,
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
        <h1 className="text-2xl font-semibold">Edit Patient</h1>
        <div className="max-w-2xl">
          <PatientForm
            mode="edit"
            patientId={patient.id}
            defaultValues={{
              firstName: patient.firstName,
              middleName: patient.middleName ?? undefined,
              lastName: patient.lastName,
              birthDate: patient.birthDate,
              sex: patient.sex,
              phone: patient.phone ?? undefined,
              philhealthNo: patient.philhealthNo ?? undefined,
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

  return (
    <div className="space-y-6">
      {patient.todayEncounter && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-600" />
              <span className="text-sm">
                Encounter in progress today -{" "}
                <Badge variant={getStatusBadgeVariant(patient.todayEncounter.status)}>
                  {formatStatus(patient.todayEncounter.status)}
                </Badge>
              </span>
            </div>
            <Link
              href={`/encounters/${patient.todayEncounter.id}`}
              className="text-sm font-medium text-blue-600 underline underline-offset-4 hover:text-blue-800"
            >
              View Encounter
            </Link>
          </CardContent>
        </Card>
      )}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patient Details</h1>
        <div className="flex gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push(`/patients/${patient.id}?edit=true`)}
            >
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {canStartEncounter && !patient.todayEncounter && (
            <div className="flex flex-col items-end gap-1">
              <Button onClick={handleStartEncounter} disabled={isPending}>
                {isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <PlayCircle className="mr-2 h-4 w-4" />
                )}
                Start Encounter
              </Button>
              {encounterError && (
                <p className="text-sm text-destructive">{encounterError}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <span className="font-mono text-lg text-muted-foreground">
                {patient.patientCode}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">
                {patient.lastName}, {patient.firstName}
                {patient.middleName ? ` ${patient.middleName}` : ""}
              </h2>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              <span>
                DOB: {formatDate(patient.birthDate)} ({age} y/o)
              </span>
              <span className="flex items-center gap-1">
                <Badge variant={patient.sex === "MALE" ? "default" : "secondary"}>
                  {patient.sex}
                </Badge>
              </span>
              {patient.phone && <span>Phone: {patient.phone}</span>}
            </div>
            {fullAddress && (
              <div className="text-sm text-muted-foreground">
                Address: {fullAddress}
              </div>
            )}
            {patient.philhealthNo && (
              <div className="text-sm text-muted-foreground">
                PhilHealth: {patient.philhealthNo}
              </div>
            )}
            {patient.notes && (
              <div className="text-sm">
                <span className="text-muted-foreground">Notes:</span> {patient.notes}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Encounter History</CardTitle>
        </CardHeader>
        <CardContent>
          {patient.encounters.length === 0 ? (
            <p className="text-sm text-muted-foreground">No encounters yet</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Chief Complaint</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.encounters.map((encounter) => (
                  <TableRow key={encounter.id}>
                    <TableCell>{formatDate(encounter.occurredAt)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(encounter.status)}>
                        {formatStatus(encounter.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{encounter.chiefComplaint || "-"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
