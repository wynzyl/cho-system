"use client"

import { useEffect, useState, useCallback } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TriageQueue } from "@/components/triage/triage-queue"
import { VitalsForm } from "@/components/triage/vitals-form"
import { AddToQueueDialog } from "@/components/triage/add-to-queue-dialog"
import { getTriageQueueAction, type TriageQueueItem } from "@/actions/triage"

export function TriagePageClient() {
  const [encounters, setEncounters] = useState<TriageQueueItem[]>([])
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null)

  const selectedEncounter = encounters.find((e) => e.id === selectedEncounterId) ?? null

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
          // Auto-select new encounter if we have a pending selection, otherwise keep current or select first
          setSelectedEncounterId((currentId) => {
            if (pendingSelectId && newEncounters.some((e) => e.id === pendingSelectId)) {
              setPendingSelectId(null)
              return pendingSelectId
            }
            if (newEncounters.length === 0) return null
            const currentExists = newEncounters.some((e) => e.id === currentId)
            if (!currentExists) return newEncounters[0].id
            return currentId
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

  const handleTriageSuccess = useCallback(() => {
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
      <div className="mt-6 grid flex-1 gap-6 lg:grid-cols-[1fr_400px]">
        {/* Left Panel - Queue */}
        <div className="min-h-0 overflow-hidden rounded-lg border bg-card p-4">
          <TriageQueue
            encounters={encounters}
            selectedId={selectedEncounterId}
            onSelect={setSelectedEncounterId}
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
