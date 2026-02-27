"use client"

import { useState, useEffect, useTransition, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Loader2,
  Save,
  CheckCircle,
  ArrowRight,
  FlaskConical,
  Pill,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  getEncounterForConsultAction,
  saveConsultationAction,
  completeConsultationAction,
  type EncounterForConsult,
} from "@/actions/doctor"
import type { PhysicalExamData, ProceduresData, AdviceData } from "@/lib/types/consultation"
import { PatientSnapshot } from "./patient-snapshot"
import { TriageSummary } from "./triage-summary"
import { PhysicalExamSection, AssessmentSection, PlanSection } from "./sections"

interface ConsultationFormProps {
  encounterId: string
  onComplete: () => void
}

export function ConsultationForm({ encounterId, onComplete }: ConsultationFormProps) {
  const [encounter, setEncounter] = useState<EncounterForConsult | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, startSaving] = useTransition()
  const [isCompleting, startCompleting] = useTransition()
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Form state
  const [physicalExamData, setPhysicalExamData] = useState<PhysicalExamData | null>(null)
  const [clinicalImpression, setClinicalImpression] = useState("")
  const [proceduresData, setProceduresData] = useState<ProceduresData | null>(null)
  const [adviceData, setAdviceData] = useState<AdviceData | null>(null)

  // Refetch encounter data (used when diagnoses/prescriptions change)
  const refetchEncounter = useCallback(async () => {
    const result = await getEncounterForConsultAction({ encounterId })
    if (result.ok) {
      setEncounter(result.data)
    }
  }, [encounterId])

  // Initial fetch on mount
  useEffect(() => {
    let cancelled = false

    const load = async () => {
      setIsLoading(true)
      const result = await getEncounterForConsultAction({ encounterId })
      if (!cancelled && result.ok) {
        setEncounter(result.data)
        setPhysicalExamData(result.data.physicalExamData)
        setClinicalImpression(result.data.clinicalImpression ?? "")
        setProceduresData(result.data.proceduresData)
        setAdviceData(result.data.adviceData)
      }
      if (!cancelled) {
        setIsLoading(false)
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [encounterId])

  const handleSave = useCallback(() => {
    if (!encounter) return

    startSaving(async () => {
      const result = await saveConsultationAction({
        encounterId,
        physicalExamData,
        clinicalImpression: clinicalImpression || null,
        proceduresData,
        adviceData,
      })

      if (result.ok) {
        setLastSaved(new Date())
      }
    })
  }, [encounter, encounterId, physicalExamData, clinicalImpression, proceduresData, adviceData])

  // Auto-save every 30 seconds if there are changes
  useEffect(() => {
    if (!encounter || encounter.status !== "IN_CONSULT") return

    const interval = setInterval(() => {
      handleSave()
    }, 30000)

    return () => clearInterval(interval)
  }, [encounter, handleSave])

  const handleComplete = (nextStatus: "FOR_LAB" | "FOR_PHARMACY" | "DONE") => {
    if (!encounter) return

    // Validate diagnoses
    if (encounter.diagnoses.length === 0) {
      return // Assessment section shows warning
    }

    startCompleting(async () => {
      const result = await completeConsultationAction({
        encounterId,
        physicalExamData,
        clinicalImpression: clinicalImpression || null,
        proceduresData,
        adviceData,
        nextStatus,
      })

      if (result.ok) {
        onComplete()
      }
    })
  }

  if (isLoading) {
    return (
      <div className="h-full space-y-4 p-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!encounter) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Failed to load encounter data</p>
      </div>
    )
  }

  const isEditable = encounter.status === "IN_CONSULT"
  const canComplete = encounter.diagnoses.length > 0
  const hasLabOrders = encounter.labOrders.length > 0
  const hasPrescriptions = encounter.prescriptions.length > 0

  return (
    <div className="flex h-full flex-col">
      {/* Fixed Patient Header */}
      <PatientSnapshot
        patient={encounter.patient}
        chiefComplaint={encounter.chiefComplaint}
        exposureFlags={encounter.triageRecord?.exposureFlags}
      />

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-4xl space-y-6 p-6">
          {/* Triage Summary */}
          <TriageSummary triageRecord={encounter.triageRecord} />

          {/* Separator */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Doctor&apos;s Assessment
              </span>
            </div>
          </div>

          {/* Physical Examination */}
          <PhysicalExamSection
            value={physicalExamData}
            onChange={setPhysicalExamData}
            disabled={!isEditable}
          />

          {/* Assessment & Diagnosis */}
          <AssessmentSection
            encounterId={encounterId}
            diagnoses={encounter.diagnoses}
            clinicalImpression={clinicalImpression}
            onClinicalImpressionChange={setClinicalImpression}
            onDiagnosesChange={refetchEncounter}
            disabled={!isEditable}
          />

          {/* Treatment Plan */}
          <PlanSection
            encounterId={encounterId}
            prescriptions={encounter.prescriptions}
            labOrders={encounter.labOrders}
            proceduresData={proceduresData}
            adviceData={adviceData}
            onProceduresChange={setProceduresData}
            onAdviceChange={setAdviceData}
            onPrescriptionAdded={refetchEncounter}
            onLabOrderAdded={refetchEncounter}
            disabled={!isEditable}
          />
        </div>
      </div>

      {/* Fixed Footer Actions */}
      {isEditable && (
        <div className="border-t bg-white p-4 dark:bg-slate-900">
          <div className="mx-auto flex max-w-4xl items-center justify-between">
            {/* Save Status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : lastSaved ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Saved at {lastSaved.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}
                </>
              ) : null}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>

              {/* Complete Buttons */}
              <div className="flex gap-2">
                {hasLabOrders && (
                  <Button
                    variant="secondary"
                    onClick={() => handleComplete("FOR_LAB")}
                    disabled={isCompleting || !canComplete}
                  >
                    {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Send to Lab
                  </Button>
                )}
                {hasPrescriptions && (
                  <Button
                    variant="secondary"
                    onClick={() => handleComplete("FOR_PHARMACY")}
                    disabled={isCompleting || !canComplete}
                  >
                    {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Pill className="mr-2 h-4 w-4" />
                    Send to Pharmacy
                  </Button>
                )}
                <Button
                  onClick={() => handleComplete("DONE")}
                  disabled={isCompleting || !canComplete}
                  className={cn(!canComplete && "opacity-50")}
                >
                  {isCompleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
