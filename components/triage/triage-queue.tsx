"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { TriageQueueCard, type QueueItemState } from "./triage-queue-card"
import type { TriageQueueItem } from "@/actions/triage"

// Claims expire after 15 minutes (must match server)
const CLAIM_EXPIRY_MS = 15 * 60 * 1000

interface TriageQueueProps {
  encounters: TriageQueueItem[]
  selectedId: string | null
  currentUserId: string | null
  onSelect: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading: boolean
}

function isClaimExpired(claimedAt: string | null): boolean {
  if (!claimedAt) return true
  const claimTime = new Date(claimedAt).getTime()
  const now = Date.now()
  return now - claimTime > CLAIM_EXPIRY_MS
}

function getItemState(
  item: TriageQueueItem,
  index: number,
  items: TriageQueueItem[],
  currentUserId: string | null
): QueueItemState {
  // Check if current user has already claimed any patient
  const currentUserHasClaim = items.some(
    (i) => i.claimedById === currentUserId && !isClaimExpired(i.claimedAt)
  )

  // If claimed by current user, it's selected
  if (item.claimedById === currentUserId && !isClaimExpired(item.claimedAt)) {
    return "selected"
  }

  // If current user has a claim, all other patients are disabled
  // User must complete their current triage before selecting another
  if (currentUserHasClaim) {
    return "disabled"
  }

  // If claimed by another user and claim is not expired
  if (item.claimedById && !isClaimExpired(item.claimedAt)) {
    return "claimed-by-other"
  }

  // Find the first unclaimed (or expired claim) item
  const firstAvailableIndex = items.findIndex(
    (i) => !i.claimedById || isClaimExpired(i.claimedAt)
  )

  // If this is the first available, it's available
  if (index === firstAvailableIndex) {
    return "available"
  }

  // Otherwise, user cannot skip - disabled
  return "disabled"
}

export function TriageQueue({
  encounters,
  selectedId,
  currentUserId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading,
}: TriageQueueProps) {
  const filteredEncounters = encounters.filter((item) => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      item.patientName.toLowerCase().includes(query) ||
      item.patientCode.toLowerCase().includes(query)
    )
  })

  return (
    <div className="flex h-full flex-col">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="triage-queue-search"
          aria-label="Search patients by name or ID"
          placeholder="Search patients by name or ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <h2 className="mt-4 text-lg font-semibold">Triage Queue</h2>

      <div className="mt-3 flex-1 space-y-3 overflow-y-auto">
        {isLoading ? (
          <>
            <QueueCardSkeleton />
            <QueueCardSkeleton />
            <QueueCardSkeleton />
          </>
        ) : filteredEncounters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              {searchQuery
                ? "No patients match your search"
                : "No patients waiting for triage"}
            </p>
          </div>
        ) : (
          filteredEncounters.map((item, index) => {
            const state = getItemState(item, index, filteredEncounters, currentUserId)
            return (
              <TriageQueueCard
                key={item.id}
                item={item}
                state={state}
                isSelected={selectedId === item.id}
                onClick={() => onSelect(item.id)}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

function QueueCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-1 h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="mt-3 flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}
