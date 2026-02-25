"use client"

import { User, Lock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TriageQueueItem } from "@/actions/triage"

export type QueueItemState = "selected" | "claimed-by-other" | "available" | "disabled"

interface TriageQueueCardProps {
  item: TriageQueueItem
  state: QueueItemState
  isSelected: boolean
  onClick: () => void
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

function formatSex(sex: string): string {
  switch (sex) {
    case "MALE":
      return "Male"
    case "FEMALE":
      return "Female"
    case "OTHER":
      return "Other"
    default:
      return "Unknown"
  }
}

export function TriageQueueCard({ item, state, isSelected, onClick }: TriageQueueCardProps) {
  const priorityVariant = {
    HIGH: "destructive" as const,
    MEDIUM: "secondary" as const,
    LOW: "outline" as const,
  }

  const priorityLabel = {
    HIGH: "High Priority",
    MEDIUM: "Medium Priority",
    LOW: "Low Priority",
  }

  const isDisabled = state === "claimed-by-other" || state === "disabled"
  const isClaimedByOther = state === "claimed-by-other"

  return (
    <button
      type="button"
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      className={cn(
        "w-full rounded-lg border bg-card p-4 text-left transition-all",
        !isDisabled && "hover:bg-accent/50 cursor-pointer",
        isSelected && "ring-2 ring-primary border-primary",
        isClaimedByOther && "opacity-60 bg-muted/50 cursor-not-allowed",
        state === "disabled" && "opacity-40 cursor-not-allowed"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            isClaimedByOther ? "bg-amber-100 dark:bg-amber-900/30" : "bg-muted"
          )}>
            {isClaimedByOther ? (
              <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            ) : (
              <User className="h-5 w-5 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground truncate">{item.patientName}</p>
            <p className="text-sm text-muted-foreground">
              {item.patientCode} &bull; {item.age}y &bull; {formatSex(item.sex)}
            </p>
          </div>
        </div>
        <Badge variant={priorityVariant[item.priority]} className="shrink-0">
          {priorityLabel[item.priority]}
        </Badge>
      </div>

      {isClaimedByOther && item.claimedByName && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400">
          <Lock className="h-3 w-3" />
          <span>In progress by {item.claimedByName}</span>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between text-sm">
        <div>
          <span className="text-muted-foreground">Arrival:</span>
        </div>
        <span className="font-medium">{formatTime(item.occurredAt)}</span>
      </div>

      {item.chiefComplaint && (
        <div className="mt-1 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Chief Complaint:</span>
          <span className="font-medium text-right max-w-[60%] truncate">
            {item.chiefComplaint}
          </span>
        </div>
      )}
    </button>
  )
}
