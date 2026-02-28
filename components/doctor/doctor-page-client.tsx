"use client"

import { useState, useCallback, useEffect } from "react"
import { DoctorQueue } from "./doctor-queue"
import { ConsultationForm } from "./consultation-form"
import {
  getDoctorQueueAction,
  getEncounterForConsultAction,
  startConsultationAction,
  type DoctorQueueItem,
  type EncounterForConsult,
} from "@/actions/doctor"
import { toast } from "sonner"

export function DoctorPageClient() {
  const [queue, setQueue] = useState<DoctorQueueItem[]>([])
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null)
  const [encounter, setEncounter] = useState<EncounterForConsult | null>(null)
  const [isLoadingQueue, setIsLoadingQueue] = useState(true)
  const [isLoadingEncounter, setIsLoadingEncounter] = useState(false)

  // Fetch queue
  const fetchQueue = useCallback(async () => {
    setIsLoadingQueue(true)
    try {
      const result = await getDoctorQueueAction()
      if (result.ok) {
        setQueue(result.data)
      } else {
        toast.error(result.error.message)
      }
    } finally {
      setIsLoadingQueue(false)
    }
  }, [])

  // Fetch encounter for consultation
  const refetchEncounter = useCallback(async () => {
    if (!selectedEncounterId) return
    try {
      const result = await getEncounterForConsultAction({
        encounterId: selectedEncounterId,
      })
      if (result.ok) {
        setEncounter(result.data)
      }
    } catch {
      // Silent fail on refetch
    }
  }, [selectedEncounterId])

  // Load queue on mount
  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  // Load encounter when selected
  useEffect(() => {
    if (!selectedEncounterId) {
      setEncounter(null)
      return
    }

    const loadEncounter = async () => {
      setIsLoadingEncounter(true)
      try {
        const result = await getEncounterForConsultAction({
          encounterId: selectedEncounterId,
        })
        if (result.ok) {
          setEncounter(result.data)
        } else {
          toast.error(result.error.message)
          setSelectedEncounterId(null)
        }
      } finally {
        setIsLoadingEncounter(false)
      }
    }

    loadEncounter()
  }, [selectedEncounterId])

  // Handle starting consultation
  const handleStartConsultation = async (encounterId: string) => {
    try {
      const result = await startConsultationAction({ encounterId })
      if (result.ok) {
        toast.success("Consultation started")
        setSelectedEncounterId(encounterId)
        await fetchQueue()
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error("Failed to start consultation")
    }
  }

  // Handle selecting an existing consultation
  const handleSelectEncounter = (encounterId: string) => {
    setSelectedEncounterId(encounterId)
  }

  // Handle consultation complete
  const handleConsultationComplete = async () => {
    setSelectedEncounterId(null)
    setEncounter(null)
    await fetchQueue()
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Left panel - Queue */}
      <div className="w-80 flex-shrink-0 overflow-hidden rounded-lg border bg-card">
        <DoctorQueue
          queue={queue}
          isLoading={isLoadingQueue}
          selectedEncounterId={selectedEncounterId}
          onSelectEncounter={handleSelectEncounter}
          onStartConsultation={handleStartConsultation}
          onRefresh={fetchQueue}
        />
      </div>

      {/* Right panel - Consultation */}
      <div className="flex-1 overflow-hidden rounded-lg border bg-card">
        {selectedEncounterId && encounter ? (
          <ConsultationForm
            encounter={encounter}
            isLoading={isLoadingEncounter}
            onComplete={handleConsultationComplete}
            onEncounterUpdated={refetchEncounter}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-lg font-medium">No patient selected</p>
              <p className="mt-1 text-sm">
                Select a patient from the queue to start consultation
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
