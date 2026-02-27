"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Clock,
  AlertTriangle,
  Play,
  ChevronRight,
  Thermometer,
  Heart,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { DoctorQueueItem } from "@/actions/doctor"
import type { EncounterStatus } from "@prisma/client"

interface DoctorQueueCardProps {
  item: DoctorQueueItem
  isSelected: boolean
  onSelect: () => void
  onStartConsult?: () => void
  currentUserId?: string
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

function getStatusStyle(status: EncounterStatus) {
  switch (status) {
    case "IN_CONSULT":
      return "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900 dark:text-blue-300"
    case "TRIAGED":
    case "WAIT_DOCTOR":
      return "bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-900 dark:text-amber-300"
    default:
      return "bg-slate-100 text-slate-700 border-slate-300"
  }
}

function getStatusLabel(status: EncounterStatus) {
  switch (status) {
    case "IN_CONSULT":
      return "In Consultation"
    case "TRIAGED":
      return "Ready"
    case "WAIT_DOCTOR":
      return "Waiting"
    default:
      return status
  }
}

function formatWaitTime(occurredAt: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - new Date(occurredAt).getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 60) {
    return `${diffMins}m`
  }
  const hours = Math.floor(diffMins / 60)
  const mins = diffMins % 60
  return `${hours}h ${mins}m`
}

export function DoctorQueueCard({
  item,
  isSelected,
  onSelect,
  onStartConsult,
  currentUserId,
}: DoctorQueueCardProps) {
  const age = calculateAge(item.patient.birthDate)
  const hasAllergies = item.patient.allergyStatus === "HAS_ALLERGIES"
  const hasSevereAllergy = item.allergies.some((a) => a.severity === "SEVERE")
  const hasExposure = (item.triageRecord?.exposureFlags?.length ?? 0) > 0
  const isMyConsult = item.doctorId === currentUserId && item.status === "IN_CONSULT"
  const waitTime = formatWaitTime(item.occurredAt)

  return (
    <div
      onClick={onSelect}
      className={cn(
        "group relative cursor-pointer rounded-lg border p-3 transition-all hover:shadow-md",
        isSelected
          ? "border-blue-500 bg-blue-50 shadow-md ring-1 ring-blue-500 dark:bg-blue-950"
          : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900",
        isMyConsult && "border-l-4 border-l-blue-500"
      )}
    >
      {/* Top Row: Name + Status */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="truncate font-semibold">
              {item.patient.lastName}, {item.patient.firstName}
            </h4>
            {(hasAllergies || hasExposure) && (
              <AlertTriangle
                className={cn(
                  "h-4 w-4 shrink-0",
                  hasSevereAllergy ? "text-red-500" : "text-amber-500"
                )}
              />
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {age} y/o • {item.patient.sex}
          </p>
        </div>

        <Badge variant="outline" className={cn("shrink-0 text-xs", getStatusStyle(item.status))}>
          {getStatusLabel(item.status)}
        </Badge>
      </div>

      {/* Chief Complaint */}
      {item.chiefComplaint && (
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-slate-400">
          {item.chiefComplaint}
        </p>
      )}

      {/* Quick Vitals Preview */}
      {item.triageRecord && (
        <div className="mt-2 flex flex-wrap gap-2">
          {item.triageRecord.bpSystolic && item.triageRecord.bpDiastolic && (
            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-1.5 py-0.5 text-xs dark:bg-slate-800">
              <Heart className="h-3 w-3 text-red-500" />
              {item.triageRecord.bpSystolic}/{item.triageRecord.bpDiastolic}
            </span>
          )}
          {item.triageRecord.temperatureC && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs",
                item.triageRecord.temperatureC >= 38
                  ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                  : "bg-slate-100 dark:bg-slate-800"
              )}
            >
              <Thermometer className="h-3 w-3 text-orange-500" />
              {item.triageRecord.temperatureC}°C
            </span>
          )}
          {item.triageRecord.painSeverity && item.triageRecord.painSeverity > 0 && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-xs font-medium",
                item.triageRecord.painSeverity > 6
                  ? "bg-red-100 text-red-700"
                  : item.triageRecord.painSeverity > 3
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700"
              )}
            >
              Pain: {item.triageRecord.painSeverity}/10
            </span>
          )}
        </div>
      )}

      {/* Allergy Tags */}
      {hasAllergies && item.allergies.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {item.allergies.slice(0, 2).map((allergy) => (
            <Badge
              key={allergy.id}
              variant="outline"
              className={cn(
                "text-xs",
                allergy.severity === "SEVERE"
                  ? "border-red-300 bg-red-50 text-red-700"
                  : "border-amber-300 bg-amber-50 text-amber-700"
              )}
            >
              {allergy.allergen}
            </Badge>
          ))}
          {item.allergies.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{item.allergies.length - 2}
            </Badge>
          )}
        </div>
      )}

      {/* Bottom Row: Wait Time + Action */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Waiting {waitTime}</span>
        </div>

        {item.status === "TRIAGED" || item.status === "WAIT_DOCTOR" ? (
          <Button
            size="xs"
            onClick={(e) => {
              e.stopPropagation()
              onStartConsult?.()
            }}
            className="gap-1 opacity-0 transition-opacity group-hover:opacity-100"
          >
            <Play className="h-3 w-3" />
            Start
          </Button>
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  )
}
