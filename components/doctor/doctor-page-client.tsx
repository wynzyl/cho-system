"use client"

import { useState, useTransition, useCallback } from "react"
import { Stethoscope, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  startConsultationAction,
  type DoctorQueueItem,
} from "@/actions/doctor"
import { DoctorQueue } from "./doctor-queue"
import { ConsultationForm } from "./consultation-form"

interface DoctorPageClientProps {
  userId: string
}

export function DoctorPageClient({ userId }: DoctorPageClientProps) {
  const [selectedEncounter, setSelectedEncounter] = useState<DoctorQueueItem | null>(null)
  const [activeConsultId, setActiveConsultId] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [isPending, startTransition] = useTransition()

  const handleSelectEncounter = (encounter: DoctorQueueItem) => {
    setSelectedEncounter(encounter)
    // If already in consultation, show the form
    if (encounter.status === "IN_CONSULT" && encounter.doctorId === userId) {
      setActiveConsultId(encounter.id)
    } else {
      setActiveConsultId(null)
    }
  }

  const handleStartConsult = (encounterId: string) => {
    startTransition(async () => {
      const result = await startConsultationAction({ encounterId })
      if (result.ok) {
        setActiveConsultId(encounterId)
        setRefreshTrigger((t) => t + 1)
      }
    })
  }

  const handleConsultComplete = useCallback(() => {
    setActiveConsultId(null)
    setSelectedEncounter(null)
    setRefreshTrigger((t) => t + 1)
  }, [])

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-slate-100 dark:bg-slate-950">
      {/* Left Panel: Queue */}
      <div className="w-80 shrink-0 border-r bg-white dark:bg-slate-900 lg:w-96">
        <DoctorQueue
          selectedEncounterId={selectedEncounter?.id ?? null}
          onSelectEncounter={handleSelectEncounter}
          onStartConsult={handleStartConsult}
          currentUserId={userId}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Right Panel: Consultation */}
      <div className="flex-1 overflow-hidden">
        {activeConsultId ? (
          <ConsultationForm
            key={activeConsultId}
            encounterId={activeConsultId}
            onComplete={handleConsultComplete}
          />
        ) : selectedEncounter ? (
          // Preview selected patient (not in active consultation)
          <div className="flex h-full flex-col items-center justify-center bg-white p-8 dark:bg-slate-900">
            <div className="text-center">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                <Stethoscope className="h-10 w-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="mb-2 text-xl font-semibold">
                {selectedEncounter.patient.lastName}, {selectedEncounter.patient.firstName}
              </h2>
              <p className="mb-6 text-muted-foreground">
                {selectedEncounter.chiefComplaint ?? "No chief complaint recorded"}
              </p>
              <button
                onClick={() => handleStartConsult(selectedEncounter.id)}
                disabled={isPending}
                className={cn(
                  "inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-medium text-white transition-colors hover:bg-blue-700",
                  isPending && "cursor-not-allowed opacity-50"
                )}
              >
                {isPending ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Stethoscope className="h-5 w-5" />
                )}
                Start Consultation
              </button>
            </div>
          </div>
        ) : (
          // Empty state
          <div className="flex h-full flex-col items-center justify-center bg-slate-50 p-8 dark:bg-slate-950">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-200 dark:bg-slate-800">
              <FileText className="h-12 w-12 text-slate-400" />
            </div>
            <h2 className="mb-2 text-xl font-medium text-slate-600 dark:text-slate-400">
              No Patient Selected
            </h2>
            <p className="max-w-sm text-center text-muted-foreground">
              Select a patient from the queue to start a consultation or view their information
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
