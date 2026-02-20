"use client"

import { User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { TriageQueueItem } from "@/actions/triage"

interface TriageQueueCardProps {
  item: TriageQueueItem
  isSelected: boolean
  onClick: () => void
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
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

export function TriageQueueCard({ item, isSelected, onClick }: TriageQueueCardProps) {
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

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full rounded-lg border bg-card p-4 text-left transition-all hover:bg-accent/50",
        isSelected && "ring-2 ring-primary border-primary"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
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
