"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { DoctorQueue } from "./doctor-queue"
import { ConsultationForm } from "./consultation-form"
import { Spinner } from "@/components/ui/spinner"
import {
  getDoctorQueueAction,
  getEncounterForConsultAction,
  startConsultationAction,
  claimForConsultAction,
  releaseFromConsultAction,
  type DoctorQueueItem,
  type EncounterForConsult,
} from "@/actions/doctor"
import { toast } from "sonner"

export function DoctorPageClient() {
  const [queue, setQueue] = useState<DoctorQueueItem[]>([])
  const [currentUserId, setCurrentUserId] = useState<string>("")
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null)
  const [encounter, setEncounter] = useState<EncounterForConsult | null>(null)
  const [isLoadingQueue, setIsLoadingQueue] = useState(true)
  const [isLoadingEncounter, setIsLoadingEncounter] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Track currently claimed encounter for cleanup
  const claimedEncounterIdRef = useRef<string | null>(null)

  // Fetch queue
  const fetchQueue = useCallback(async () => {
    setIsLoadingQueue(true)
    try {
      const result = await getDoctorQueueAction()
      if (result.ok) {
        setQueue(result.data.items)
        setCurrentUserId(result.data.currentUserId)
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
    } catch (error) {
      // Log but don't show toast - refetch failures are non-critical
      console.error("Failed to refetch encounter:", error)
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

  // Release claim helper
  const releaseClaim = useCallback(async (encounterId: string) => {
    try {
      await releaseFromConsultAction({ encounterId })
    } catch (error) {
      console.error("Failed to release claim:", error)
    }
  }, [])

  // Handle starting consultation (after claiming)
  const handleStartConsultation = useCallback(async (encounterId: string) => {
    try {
      const result = await startConsultationAction({ encounterId })
      if (result.ok) {
        // Clear claim ref since consultation has started
        claimedEncounterIdRef.current = null
        toast.success("Consultation started")
        setSelectedEncounterId(encounterId)
        setRefreshKey((k) => k + 1)
        await fetchQueue()
      } else {
        // Rollback: release the claim on failure
        await releaseClaim(encounterId)
        claimedEncounterIdRef.current = null
        await fetchQueue()
        toast.error(result.error.message)
      }
    } catch (error) {
      // Rollback: release the claim on exception
      await releaseClaim(encounterId)
      claimedEncounterIdRef.current = null
      await fetchQueue()
      const message = error instanceof Error ? error.message : "Failed to start consultation"
      toast.error(message)
    }
  }, [fetchQueue, releaseClaim])

  // Handle claiming a patient (FIFO) - chains to start consultation for single-click UX
  const handleClaimEncounter = useCallback(async (encounterId: string) => {
    // Release any existing claim first - must succeed before proceeding
    if (claimedEncounterIdRef.current && claimedEncounterIdRef.current !== encounterId) {
      try {
        const releaseResult = await releaseFromConsultAction({
          encounterId: claimedEncounterIdRef.current,
        })
        if (!releaseResult.ok) {
          toast.error("Failed to release current patient: " + releaseResult.error.message)
          await fetchQueue()
          return
        }
        claimedEncounterIdRef.current = null
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error"
        toast.error("Failed to release current patient: " + message)
        await fetchQueue()
        return
      }
    }

    try {
      const result = await claimForConsultAction({ encounterId })
      if (result.ok) {
        claimedEncounterIdRef.current = encounterId
        setRefreshKey((k) => k + 1)
        // Chain to start consultation immediately (single-click UX like triage)
        await handleStartConsultation(encounterId)
      } else {
        toast.error(result.error.message)
      }
    } catch {
      toast.error("Failed to claim patient")
    }
  }, [fetchQueue, handleStartConsultation])

  // Handle selecting an existing consultation (IN_CONSULT or claimed)
  const handleSelectEncounter = useCallback(async (encounterId: string) => {
    // Check if this is a claimed WAIT_DOCTOR encounter
    const queueItem = queue.find((q) => q.id === encounterId)
    if (queueItem?.status === "WAIT_DOCTOR" && queueItem.claimedById === currentUserId) {
      // This is our claimed patient - start consultation
      await handleStartConsultation(encounterId)
    } else {
      // This is an IN_CONSULT encounter - just select it
      setSelectedEncounterId(encounterId)
    }
  }, [queue, currentUserId, handleStartConsultation])

  // Handle consultation complete
  const handleConsultationComplete = async () => {
    setSelectedEncounterId(null)
    setEncounter(null)
    claimedEncounterIdRef.current = null
    await fetchQueue()
  }

  // Release claim on unmount
  useEffect(() => {
    return () => {
      if (claimedEncounterIdRef.current) {
        // Fire and forget - component is unmounting
        releaseFromConsultAction({ encounterId: claimedEncounterIdRef.current })
      }
    }
  }, [])

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4">
      {/* Left panel - Queue */}
      <div className="w-80 flex-shrink-0 overflow-hidden rounded-lg border bg-card">
        <DoctorQueue
          queue={queue}
          isLoading={isLoadingQueue}
          selectedEncounterId={selectedEncounterId}
          currentUserId={currentUserId}
          refreshKey={refreshKey}
          onSelectEncounter={handleSelectEncounter}
          onClaimEncounter={handleClaimEncounter}
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
        ) : isLoadingEncounter ? (
          <div className="flex h-full items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner size="lg" />
              <p className="text-sm text-muted-foreground">Loading patient data...</p>
            </div>
          </div>
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
