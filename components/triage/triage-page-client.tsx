"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TriageQueue } from "@/components/triage/triage-queue"
import { VitalsForm } from "@/components/triage/vitals-form"
import { AddToQueueDialog } from "@/components/triage/add-to-queue-dialog"
import {
  getTriageQueueAction,
  claimEncounterAction,
  releaseEncounterAction,
  type TriageQueueItem,
} from "@/actions/triage"

interface TriagePageClientProps {
  canEditAllergies?: boolean
}

export function TriagePageClient({ canEditAllergies = false }: TriagePageClientProps) {
  const [encounters, setEncounters] = useState<TriageQueueItem[]>([])
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null)

  // Track current claim for cleanup
  const claimedEncounterIdRef = useRef<string | null>(null)

  const selectedEncounter = encounters.find((e) => e.id === selectedEncounterId) ?? null

  // Fetch queue data
  useEffect(() => {
    let cancelled = false

    async function fetchQueue() {
      setIsLoading(true)
      setError(null)

      try {
        const result = await getTriageQueueAction()
        if (cancelled) return

        if (result.ok) {
          const newEncounters = result.data.encounters
          setEncounters(newEncounters)
          setCurrentUserId(result.data.currentUserId)

          // Find encounter claimed by current user
          const claimedByMe = newEncounters.find(
            (e) => e.claimedById === result.data.currentUserId
          )

          setSelectedEncounterId((currentId) => {
            // If we have a claimed encounter, select it
            if (claimedByMe) {
              claimedEncounterIdRef.current = claimedByMe.id
              return claimedByMe.id
            }

            // If pending selection, use it
            if (pendingSelectId && newEncounters.some((e) => e.id === pendingSelectId)) {
              setPendingSelectId(null)
              return pendingSelectId
            }

            if (newEncounters.length === 0) return null

            // Keep current selection if still valid
            const currentExists = newEncounters.some((e) => e.id === currentId)
            if (currentExists) return currentId

            // Don't auto-select - user must explicitly claim
            return null
          })
        } else {
          setError(result.error.message || "Failed to load triage queue")
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load triage queue")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchQueue()

    return () => {
      cancelled = true
    }
  }, [refreshKey, pendingSelectId])

  // Release claim on unmount or page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (claimedEncounterIdRef.current) {
        // Use sendBeacon for reliable cleanup on page unload
        // Since we can't use sendBeacon with server actions, we'll rely on claim expiry
        // The claim will auto-expire after 15 minutes
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)

      // Release claim on component unmount
      if (claimedEncounterIdRef.current) {
        releaseEncounterAction({ encounterId: claimedEncounterIdRef.current }).catch(() => {
          // Ignore errors during cleanup
        })
      }
    }
  }, [])

  // Handle selecting a patient (with claiming)
  const handleSelect = useCallback(async (encounterId: string) => {
    setError(null)

    // Release previous claim if different
    if (claimedEncounterIdRef.current && claimedEncounterIdRef.current !== encounterId) {
      await releaseEncounterAction({ encounterId: claimedEncounterIdRef.current }).catch(() => {
        // Ignore release errors
      })
      claimedEncounterIdRef.current = null
    }

    // Claim the new encounter
    const result = await claimEncounterAction({ encounterId })

    if (result.ok) {
      claimedEncounterIdRef.current = encounterId
      setSelectedEncounterId(encounterId)
      // Refresh to update UI states for other users
      setRefreshKey((k) => k + 1)
    } else {
      setError(result.error.message)
      // Refresh queue to show updated state
      setRefreshKey((k) => k + 1)
    }
  }, [])

  const handleTriageSuccess = useCallback(() => {
    // Clear claim ref since encounter is no longer WAIT_TRIAGE
    claimedEncounterIdRef.current = null
    setSelectedEncounterId(null)
    setRefreshKey((k) => k + 1)
  }, [])

  const handleAddToQueueSuccess = useCallback((encounterId: string) => {
    setPendingSelectId(encounterId)
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Triage & Vital Signs</h1>
          <p className="text-muted-foreground">
            Record patient vital signs and triage assessment
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Patient to Queue
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {/* Main Content - Two Panel Layout */}
      <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1fr_800px]">
        {/* Left Panel - Queue */}
        <div className="min-h-0 overflow-hidden rounded-lg border bg-card p-4">
          <TriageQueue
            encounters={encounters}
            selectedId={selectedEncounterId}
            currentUserId={currentUserId}
            onSelect={handleSelect}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isLoading={isLoading}
          />
        </div>

        {/* Right Panel - Vitals Form */}
        <div className="min-h-0 overflow-y-auto">
          <VitalsForm
            selectedEncounter={selectedEncounter}
            onSuccess={handleTriageSuccess}
            canEditAllergies={canEditAllergies}
            refreshKey={refreshKey}
            onAllergyUpdate={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      </div>

      {/* Add to Queue Dialog */}
      <AddToQueueDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSuccess={handleAddToQueueSuccess}
      />
    </div>
  )
}
