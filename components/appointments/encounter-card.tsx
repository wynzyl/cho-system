"use client"

import { useTransition } from "react"
import { User, Loader2, Heart, Thermometer } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { UnclaimedEncounterItem } from "@/actions/doctor"
import type { MyQueueItem } from "@/actions/doctor"

type EncounterItem = UnclaimedEncounterItem | MyQueueItem

interface EncounterCardProps {
  item: EncounterItem
  isSelected: boolean
  onClick: () => void
  showClaimButton?: boolean
  onClaim?: () => Promise<void>
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

function getStatusBadge(status: string) {
  const variants: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; label: string }> = {
    WAIT_DOCTOR: { variant: "secondary", label: "Waiting" },
    IN_CONSULT: { variant: "default", label: "In Consult" },
    FOR_LAB: { variant: "outline", label: "For Lab" },
    FOR_PHARMACY: { variant: "outline", label: "For Pharmacy" },
  }
  return variants[status] || { variant: "secondary" as const, label: status }
}

function isMyQueueItem(item: EncounterItem): item is MyQueueItem {
  return "status" in item
}

export function EncounterCard({
  item,
  isSelected,
  onClick,
  showClaimButton = false,
  onClaim,
}: EncounterCardProps) {
  const [isPending, startTransition] = useTransition()

  const handleClaim = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onClaim) {
      startTransition(async () => {
        await onClaim()
      })
    }
  }

  const statusInfo = isMyQueueItem(item) ? getStatusBadge(item.status) : null

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
        {statusInfo && (
          <Badge variant={statusInfo.variant} className="shrink-0">
            {statusInfo.label}
          </Badge>
        )}
      </div>

      {/* Vitals Summary */}
      {item.triageRecord && (
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
          {item.triageRecord.bpSystolic && item.triageRecord.bpDiastolic && (
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {item.triageRecord.bpSystolic}/{item.triageRecord.bpDiastolic}
            </span>
          )}
          {item.triageRecord.temperatureC && (
            <span className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              {item.triageRecord.temperatureC}°C
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center justify-between text-sm">
        <div>
          <span className="text-muted-foreground">Arrival:</span>
          <span className="ml-1 font-medium">{formatTime(item.occurredAt)}</span>
        </div>
        {isMyQueueItem(item) && (
          <div className="flex gap-2 text-xs text-muted-foreground">
            {item.diagnosisCount > 0 && (
              <span>{item.diagnosisCount} dx</span>
            )}
            {item.prescriptionCount > 0 && (
              <span>{item.prescriptionCount} rx</span>
            )}
          </div>
        )}
      </div>

      {item.chiefComplaint && (
        <div className="mt-1 text-sm">
          <span className="text-muted-foreground">CC: </span>
          <span className="font-medium truncate">{item.chiefComplaint}</span>
        </div>
      )}

      {showClaimButton && onClaim && (
        <div className="mt-3">
          <Button
            size="sm"
            className="w-full"
            onClick={handleClaim}
            disabled={isPending}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Claim Patient
          </Button>
        </div>
      )}
    </button>
  )
}
