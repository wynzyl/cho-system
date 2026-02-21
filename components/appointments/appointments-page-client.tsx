"use client"

import { useEffect, useState, useCallback } from "react"
import { EncounterQueue } from "./encounter-queue"
import { EncounterDetail } from "./encounter-detail"
import {
  getUnclaimedEncountersAction,
  getMyQueueAction,
  claimEncounterAction,
  type UnclaimedEncounterItem,
  type MyQueueItem,
} from "@/actions/doctor"

export function AppointmentsPageClient() {
  const [unclaimedEncounters, setUnclaimedEncounters] = useState<UnclaimedEncounterItem[]>([])
  const [myQueueEncounters, setMyQueueEncounters] = useState<MyQueueItem[]>([])
  const [selectedEncounterId, setSelectedEncounterId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"unclaimed" | "my-queue">("unclaimed")
  const [refreshKey, setRefreshKey] = useState(0)
  const [pendingSelectId, setPendingSelectId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      setIsLoading(true)
      setError(null)

      try {
        const [unclaimedResult, myQueueResult] = await Promise.all([
          getUnclaimedEncountersAction(),
          getMyQueueAction(),
        ])

        if (cancelled) return

        if (unclaimedResult.ok && myQueueResult.ok) {
          const newUnclaimed = unclaimedResult.data.encounters
          const newMyQueue = myQueueResult.data.encounters

          setUnclaimedEncounters(newUnclaimed)
          setMyQueueEncounters(newMyQueue)

          // Handle selection logic
          setSelectedEncounterId((currentId) => {
            // If we have a pending selection (after claim), select it
            if (pendingSelectId) {
              const existsInMyQueue = newMyQueue.some((e) => e.id === pendingSelectId)
              if (existsInMyQueue) {
                setPendingSelectId(null)
                return pendingSelectId
              }
            }

            // If current selection still exists in either list, keep it
            const existsInUnclaimed = newUnclaimed.some((e) => e.id === currentId)
            const existsInMyQueue = newMyQueue.some((e) => e.id === currentId)
            if (existsInUnclaimed || existsInMyQueue) {
              return currentId
            }

            // Otherwise, select first item from active tab or null
            if (activeTab === "unclaimed" && newUnclaimed.length > 0) {
              return newUnclaimed[0].id
            }
            if (activeTab === "my-queue" && newMyQueue.length > 0) {
              return newMyQueue[0].id
            }

            return null
          })
        } else {
          const errorMsg =
            (!unclaimedResult.ok ? unclaimedResult.error.message : "") ||
            (!myQueueResult.ok ? myQueueResult.error.message : "") ||
            "Failed to load data"
          setError(errorMsg)
        }
      } catch {
        if (!cancelled) {
          setError("Failed to load appointments")
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    fetchData()

    return () => {
      cancelled = true
    }
  }, [refreshKey, pendingSelectId, activeTab])

  const handleClaimEncounter = useCallback(async (encounterId: string) => {
    const result = await claimEncounterAction({ encounterId })
    if (result.ok) {
      // Switch to my queue tab and select the claimed encounter
      setActiveTab("my-queue")
      setPendingSelectId(encounterId)
      setRefreshKey((k) => k + 1)
    }
    // Errors are handled by the UI component
  }, [])

  const handleDataChange = useCallback(() => {
    setRefreshKey((k) => k + 1)
  }, [])

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Appointments</h1>
        <p className="text-muted-foreground">
          View and manage patient consultations
        </p>
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
          <EncounterQueue
            unclaimedEncounters={unclaimedEncounters}
            myQueueEncounters={myQueueEncounters}
            selectedId={selectedEncounterId}
            onSelect={setSelectedEncounterId}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            isLoading={isLoading}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onClaimEncounter={handleClaimEncounter}
          />
        </div>

        {/* Right Panel - Encounter Details */}
        <div className="min-h-0 overflow-y-auto">
          <EncounterDetail
            encounterId={selectedEncounterId}
            refreshKey={refreshKey}
            onDataChange={handleDataChange}
          />
        </div>
      </div>
    </div>
  )
}
