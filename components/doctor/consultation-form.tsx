"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { Loader2, Save, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PatientSnapshot } from "./patient-snapshot"
import { TriageSummary } from "./triage-summary"
import { PhysicalExamSection } from "./sections/physical-exam-section"
import { AssessmentSection } from "./sections/assessment-section"
import { PlanSection } from "./sections/plan-section"
import { saveConsultationAction, completeConsultationAction, type EncounterForConsult } from "@/actions/doctor"
import { toast } from "sonner"
import { isPhysicalExamData, isProceduresData, isAdviceData, type PhysicalExamData, type ProceduresData, type AdviceData } from "@/lib/types/consultation"

interface ConsultationFormProps {
  encounter: EncounterForConsult
  isLoading: boolean
  onComplete: () => void
  onEncounterUpdated: () => void
}

export function ConsultationForm({
  encounter,
  isLoading,
  onComplete,
  onEncounterUpdated,
}: ConsultationFormProps) {
  // Parse JSON data with type guards
  const initialPhysicalExam = isPhysicalExamData(encounter.physicalExamData)
    ? encounter.physicalExamData
    : null
  const initialProcedures = isProceduresData(encounter.proceduresData)
    ? encounter.proceduresData
    : null
  const initialAdvice = isAdviceData(encounter.adviceData)
    ? encounter.adviceData
    : null

  // Form state
  const [physicalExamData, setPhysicalExamData] = useState<PhysicalExamData | null>(initialPhysicalExam)
  const [clinicalImpression, setClinicalImpression] = useState(encounter.clinicalImpression ?? "")
  const [proceduresData, setProceduresData] = useState<ProceduresData | null>(initialProcedures)
  const [adviceData, setAdviceData] = useState<AdviceData | null>(initialAdvice)

  // UI state
  const [isSaving, setIsSaving] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [showCompleteDialog, setShowCompleteDialog] = useState(false)
  const [nextStatus, setNextStatus] = useState<"FOR_LAB" | "FOR_PHARMACY" | "DONE">("DONE")
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Auto-save ref
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Handle save
  const handleSave = useCallback(async (showToast = true) => {
    setIsSaving(true)
    try {
      const result = await saveConsultationAction({
        encounterId: encounter.id,
        physicalExamData,
        clinicalImpression: clinicalImpression || null,
        proceduresData,
        adviceData,
      })
      if (result.ok) {
        setLastSaved(new Date())
        if (showToast) {
          toast.success("Consultation saved")
        }
      } else {
        toast.error(result.error.message)
      }
    } finally {
      setIsSaving(false)
    }
  }, [encounter.id, physicalExamData, clinicalImpression, proceduresData, adviceData])

  // Auto-save on changes
  useEffect(() => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current)
    }

    autoSaveTimeoutRef.current = setTimeout(() => {
      handleSave(false)
    }, 30000) // Auto-save every 30 seconds if there are changes

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current)
      }
    }
  }, [handleSave])

  // Handle complete
  const handleComplete = async () => {
    if (encounter.diagnoses.length === 0) {
      toast.error("At least one diagnosis is required")
      return
    }

    setIsCompleting(true)
    try {
      // Save first
      await handleSave(false)

      const result = await completeConsultationAction({
        encounterId: encounter.id,
        nextStatus,
      })
      if (result.ok) {
        toast.success("Consultation completed")
        onComplete()
      } else {
        toast.error(result.error.message)
      }
    } finally {
      setIsCompleting(false)
      setShowCompleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Patient Snapshot - Pinned Header */}
      <PatientSnapshot
        patient={encounter.patient}
        triageRecord={encounter.triageRecord}
        chiefComplaint={encounter.chiefComplaint}
      />

      {/* Main Content */}
      <ScrollArea className="flex-1">
        <div className="p-4">
          <Tabs defaultValue="vitals" className="w-full">
            <TabsList className="mb-4 grid w-full grid-cols-4">
              <TabsTrigger value="vitals">Vitals & HPI</TabsTrigger>
              <TabsTrigger value="exam">Physical Exam</TabsTrigger>
              <TabsTrigger value="assessment">Assessment</TabsTrigger>
              <TabsTrigger value="plan">Plan</TabsTrigger>
            </TabsList>

            <TabsContent value="vitals">
              <TriageSummary triageRecord={encounter.triageRecord} />
            </TabsContent>

            <TabsContent value="exam">
              <PhysicalExamSection
                value={physicalExamData}
                onChange={setPhysicalExamData}
              />
            </TabsContent>

            <TabsContent value="assessment">
              <AssessmentSection
                encounterId={encounter.id}
                diagnoses={encounter.diagnoses}
                clinicalImpression={clinicalImpression}
                onClinicalImpressionChange={setClinicalImpression}
                onDiagnosisAdded={onEncounterUpdated}
                onDiagnosisRemoved={onEncounterUpdated}
              />
            </TabsContent>

            <TabsContent value="plan">
              <PlanSection
                encounterId={encounter.id}
                prescriptions={encounter.prescriptions}
                labOrders={encounter.labOrders}
                proceduresData={proceduresData}
                adviceData={adviceData}
                onProceduresChange={setProceduresData}
                onAdviceChange={setAdviceData}
                onPrescriptionAdded={onEncounterUpdated}
                onLabOrderAdded={onEncounterUpdated}
              />
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {lastSaved && (
            <>
              <Save className="h-4 w-4" />
              <span>
                Last saved: {lastSaved.toLocaleTimeString()}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => handleSave(true)} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Save Draft
          </Button>
          <Button onClick={() => setShowCompleteDialog(true)} disabled={isSaving || isCompleting}>
            <CheckCircle className="mr-1 h-4 w-4" />
            Complete Consultation
          </Button>
        </div>
      </div>

      {/* Complete Dialog */}
      <AlertDialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Consultation</AlertDialogTitle>
            <AlertDialogDescription>
              {encounter.diagnoses.length === 0 ? (
                <span className="flex items-center gap-2 text-red-500">
                  <AlertCircle className="h-4 w-4" />
                  At least one diagnosis is required to complete.
                </span>
              ) : (
                <>
                  This will finalize the consultation with {encounter.diagnoses.length} diagnosis(es).
                  Select the next status for this encounter:
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {encounter.diagnoses.length > 0 && (
            <div className="py-4">
              <Select
                value={nextStatus}
                onValueChange={(v) => setNextStatus(v as typeof nextStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DONE">
                    Done - No further action needed
                  </SelectItem>
                  <SelectItem value="FOR_LAB">
                    For Lab - Patient needs lab tests
                  </SelectItem>
                  <SelectItem value="FOR_PHARMACY">
                    For Pharmacy - Patient needs to pick up medication
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleComplete}
              disabled={encounter.diagnoses.length === 0 || isCompleting}
            >
              {isCompleting && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
