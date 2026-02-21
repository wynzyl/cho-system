"use client"

import { useEffect, useState, useCallback } from "react"
import { Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { PatientSummary } from "./patient-summary"
import { DiagnosisSection } from "./diagnosis-section"
import { PrescriptionSection } from "./prescription-section"
import { ConsultActions } from "./consult-actions"
import { getEncounterDetailsAction, type EncounterDetails } from "@/actions/doctor"

interface EncounterDetailProps {
  encounterId: string | null
  refreshKey: number
  onDataChange: () => void
}

export function EncounterDetail({
  encounterId,
  refreshKey,
  onDataChange,
}: EncounterDetailProps) {
  const [encounter, setEncounter] = useState<EncounterDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDetails = useCallback(async (id: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await getEncounterDetailsAction(id)
      if (result.ok) {
        setEncounter(result.data.encounter)
      } else {
        setError(result.error.message)
        setEncounter(null)
      }
    } catch {
      setError("Failed to load encounter details")
      setEncounter(null)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (encounterId) {
      fetchDetails(encounterId)
    } else {
      setEncounter(null)
      setError(null)
    }
  }, [encounterId, refreshKey, fetchDetails])

  const handleSuccess = useCallback(() => {
    if (encounterId) {
      fetchDetails(encounterId)
    }
    onDataChange()
  }, [encounterId, fetchDetails, onDataChange])

  if (!encounterId) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center py-12">
          <p className="text-muted-foreground">
            Select a patient to view details
          </p>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="h-full">
        <CardContent className="flex h-full items-center justify-center py-12">
          <p className="text-destructive">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (!encounter) {
    return null
  }

  const canEdit = encounter.status === "IN_CONSULT"

  return (
    <div className="space-y-4">
      <PatientSummary encounter={encounter} />

      <ConsultActions encounter={encounter} onSuccess={handleSuccess} />

      <DiagnosisSection
        encounter={encounter}
        onSuccess={handleSuccess}
        disabled={!canEdit}
      />

      <PrescriptionSection
        encounter={encounter}
        onSuccess={handleSuccess}
        disabled={!canEdit}
      />
    </div>
  )
}
