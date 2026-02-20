"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TriageQueue } from "@/components/triage/triage-queue"
import { VitalsForm } from "@/components/triage/vitals-form"
import { getTriageQueueAction, type TriageQueueItem } from "@/actions/triage"

export function TriagePageClient() {
  const [encounters, setEncounters] = useState<TriageQueueItem[]>([])
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshKey, setRefreshKey] = useState(0)

  const selectedEncounter = encounters.find((e) => e.id === selectedEncounterId) ?? null

  useEffect(() => {
    let cancelled = false

    async function fetchQueue() {
      setIsLoading(true)
      const result = await getTriageQueueAction()
      if (cancelled) return

      if (result.ok) {
        const newEncounters = result.data.encounters
        setEncounters(newEncounters)
        // Auto-select first encounter if none selected or current selection no longer exists
        setSelectedEncounterId((currentId) => {
          if (newEncounters.length === 0) return null
          const currentExists = newEncounters.some((e) => e.id === currentId)
          if (!currentExists) return newEncounters[0].id
          return currentId
        })
      }
      setIsLoading(false)
    }

    fetchQueue()

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const handleTriageSuccess = useCallback(() => {
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
        <Button asChild>
          <Link href="/patients">
            <Plus className="mr-2 h-4 w-4" />
            Add Patient to Queue
          </Link>
        </Button>
      </div>

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
    </div>
  )
}
