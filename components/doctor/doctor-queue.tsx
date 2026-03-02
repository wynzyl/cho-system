"use client"

import { RefreshCw, User, Clock, AlertTriangle, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DoctorQueueItem } from "@/actions/doctor"
import { EXPOSURE_FLAGS, ASSOCIATED_SYMPTOMS } from "@/lib/constants"

// Claims expire after 15 minutes (must match server)
const CLAIM_EXPIRY_MS = 15 * 60 * 1000

type QueueItemState = "selected" | "claimed-by-other" | "available" | "disabled"

function isClaimExpired(claimedAt: Date | null): boolean {
  if (!claimedAt) return true
  const expiryThreshold = new Date(Date.now() - CLAIM_EXPIRY_MS)
  return new Date(claimedAt) <= expiryThreshold
}

function getItemState(
  item: DoctorQueueItem,
  index: number,
  waitingItems: DoctorQueueItem[],
  currentUserId: string
): QueueItemState {
  // Guard: If currentUserId is not set yet, disable all items
  if (!currentUserId) {
    return "disabled"
  }

  // Check if current user has already claimed any patient in the waiting list
  const currentUserHasClaim = waitingItems.some(
    (i) => i.claimedById === currentUserId && !isClaimExpired(i.claimedAt)
  )

  // If claimed by current user, it's selected
  if (item.claimedById === currentUserId && !isClaimExpired(item.claimedAt)) {
    return "selected"
  }

  // If current user has a claim elsewhere, all other patients are disabled
  // User must complete their current consultation before selecting another
  if (currentUserHasClaim) {
    return "disabled"
  }

  // If claimed by another user and claim is not expired
  if (item.claimedById && !isClaimExpired(item.claimedAt)) {
    return "claimed-by-other"
  }

  // Find the first unclaimed (or expired claim) item - FIFO order
  const firstAvailableIndex = waitingItems.findIndex(
    (i) => !i.claimedById || isClaimExpired(i.claimedAt)
  )

  // FIFO: Only the first available item can be selected
  if (index === firstAvailableIndex) {
    return "available"
  }

  // All other items are disabled - user cannot skip the queue
  return "disabled"
}

interface DoctorQueueProps {
  queue: DoctorQueueItem[]
  isLoading: boolean
  selectedEncounterId: string | null
  currentUserId: string
  onSelectEncounter: (encounterId: string) => void
  onClaimEncounter: (encounterId: string) => void
  onRefresh: () => void
}

export function DoctorQueue({
  queue,
  isLoading,
  selectedEncounterId,
  currentUserId,
  onSelectEncounter,
  onClaimEncounter,
  onRefresh,
}: DoctorQueueProps) {
  const waitingPatients = queue.filter((q) => q.status === "WAIT_DOCTOR")
  const myConsults = queue.filter((q) => q.status === "IN_CONSULT")

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h2 className="font-semibold">Patient Queue</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {/* My Active Consultations */}
        {myConsults.length > 0 && (
          <div className="border-b">
            <div className="bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              My Consultations ({myConsults.length})
            </div>
            <div className="divide-y">
              {myConsults.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  isSelected={selectedEncounterId === item.id}
                  isActive
                  state="selected"
                  onClick={() => onSelectEncounter(item.id)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Waiting Patients */}
        <div>
          <div className="bg-muted/50 px-4 py-2 text-xs font-medium text-muted-foreground">
            Waiting ({waitingPatients.length})
          </div>
          {waitingPatients.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              No patients waiting
            </div>
          ) : (
            <div className="divide-y">
              {waitingPatients.map((item, index) => {
                const state = getItemState(item, index, waitingPatients, currentUserId)
                return (
                  <QueueCard
                    key={item.id}
                    item={item}
                    isSelected={selectedEncounterId === item.id}
                    state={state}
                    onClick={() => {
                      if (state === "available") {
                        onClaimEncounter(item.id)
                      } else if (state === "selected") {
                        onSelectEncounter(item.id)
                      }
                    }}
                  />
                )
              })}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

interface QueueCardProps {
  item: DoctorQueueItem
  isSelected: boolean
  isActive?: boolean
  state: QueueItemState
  onClick: () => void
}

function calculateAge(birthDate: Date): number {
  const today = new Date()
  const birth = new Date(birthDate)
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  return age
}

function QueueCard({ item, isSelected, isActive, state, onClick }: QueueCardProps) {
  const { patient, triageRecord, chiefComplaint } = item

  // Calculate age
  const age = calculateAge(patient.birthDate)

  // Get exposure alerts
  const exposureAlerts = triageRecord?.exposureFlags
    ?.map((flag) => EXPOSURE_FLAGS.find((f) => f.value === flag))
    .filter((f) => f?.alert) ?? []

  // Get symptom labels (first 3)
  const symptomLabels = triageRecord?.associatedSymptoms
    ?.slice(0, 3)
    .map((s) => ASSOCIATED_SYMPTOMS.find((as) => as.value === s)?.label ?? s) ?? []

  const isDisabled = state === "disabled" || state === "claimed-by-other"
  const isClaimedByOther = state === "claimed-by-other"
  const isMyClaim = state === "selected" && !isActive

  return (
    <button
      type="button"
      className={cn(
        "w-full px-4 py-3 text-left transition-colors",
        // Available state - clickable
        state === "available" && "hover:bg-muted/50 cursor-pointer",
        // Selected state (my claim)
        state === "selected" && "hover:bg-muted/50 cursor-pointer",
        // Selected visual highlight
        isSelected && "bg-primary/5 hover:bg-primary/10",
        // Active consultation (IN_CONSULT)
        isActive && "border-l-2 border-l-blue-500",
        // My claim (WAIT_DOCTOR but claimed by me)
        isMyClaim && "border-l-2 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20",
        // Claimed by another doctor - LOCKED
        isClaimedByOther &&
          "cursor-not-allowed border-l-2 border-l-amber-500 bg-amber-50/50 opacity-60 pointer-events-none dark:bg-amber-950/20",
        // Disabled (not first in FIFO) - GREYED OUT
        state === "disabled" && "cursor-not-allowed opacity-40 pointer-events-none"
      )}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-disabled={isDisabled}
    >
      {/* Patient Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isClaimedByOther ? (
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          ) : (
            <User className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">
            {patient.lastName}, {patient.firstName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {/* Show NEXT badge for first available patient */}
          {state === "available" && (
            <Badge className="bg-emerald-500 text-[10px] text-white">
              NEXT
            </Badge>
          )}
          {/* Show MY CLAIM badge for claimed patient */}
          {isMyClaim && (
            <Badge className="bg-blue-500 text-[10px] text-white">
              CLAIMED
            </Badge>
          )}
          {patient.allergyStatus === "HAS_ALLERGIES" && (
            <Badge variant="destructive" className="text-[10px]">
              ALLERGY
            </Badge>
          )}
        </div>
      </div>

      {/* Claimed by indicator */}
      {isClaimedByOther && item.claimedByName && (
        <div className="mt-1 flex items-center gap-1 text-xs text-amber-700 dark:text-amber-400">
          <span>In progress by {item.claimedByName}</span>
        </div>
      )}

      {/* Demographics */}
      <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
        <span>{age}y</span>
        <span>•</span>
        <span>{patient.sex}</span>
        <span>•</span>
        <span>{patient.patientCode}</span>
      </div>

      {/* Chief Complaint */}
      {chiefComplaint && (
        <p className="mt-2 line-clamp-2 text-sm text-foreground/80">
          {chiefComplaint}
        </p>
      )}

      {/* Vitals Preview */}
      {triageRecord && (
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {triageRecord.bpSystolic && triageRecord.bpDiastolic && (
            <span className="rounded bg-muted px-1.5 py-0.5">
              BP: {triageRecord.bpSystolic}/{triageRecord.bpDiastolic}
            </span>
          )}
          {triageRecord.temperatureC && (
            <span className="rounded bg-muted px-1.5 py-0.5">
              T: {triageRecord.temperatureC}°C
            </span>
          )}
          {triageRecord.heartRate && (
            <span className="rounded bg-muted px-1.5 py-0.5">
              HR: {triageRecord.heartRate}
            </span>
          )}
        </div>
      )}

      {/* Symptoms */}
      {symptomLabels.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {symptomLabels.map((label) => (
            <Badge key={label} variant="secondary" className="text-[10px]">
              {label}
            </Badge>
          ))}
          {(triageRecord?.associatedSymptoms?.length ?? 0) > 3 && (
            <Badge variant="secondary" className="text-[10px]">
              +{(triageRecord?.associatedSymptoms?.length ?? 0) - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Exposure Alerts */}
      {exposureAlerts.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {exposureAlerts.map((flag) => (
            <Badge
              key={flag?.value}
              variant="outline"
              className="border-orange-300 bg-orange-50 text-[10px] text-orange-700 dark:bg-orange-950 dark:text-orange-300"
            >
              <AlertTriangle className="mr-1 h-3 w-3" />
              {flag?.alert}
            </Badge>
          ))}
        </div>
      )}

      {/* Wait Time */}
      <div className="mt-2 flex items-center gap-1 text-[10px] text-muted-foreground">
        <Clock className="h-3 w-3" />
        <span>
          {new Date(item.occurredAt).toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
          })}
        </span>
      </div>
    </button>
  )
}
