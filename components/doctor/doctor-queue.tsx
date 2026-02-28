"use client"

import { RefreshCw, User, Clock, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { DoctorQueueItem } from "@/actions/doctor"
import { EXPOSURE_FLAGS, ASSOCIATED_SYMPTOMS } from "@/lib/constants"

interface DoctorQueueProps {
  queue: DoctorQueueItem[]
  isLoading: boolean
  selectedEncounterId: string | null
  onSelectEncounter: (encounterId: string) => void
  onStartConsultation: (encounterId: string) => void
  onRefresh: () => void
}

export function DoctorQueue({
  queue,
  isLoading,
  selectedEncounterId,
  onSelectEncounter,
  onStartConsultation,
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
              {waitingPatients.map((item) => (
                <QueueCard
                  key={item.id}
                  item={item}
                  isSelected={selectedEncounterId === item.id}
                  onClick={() => onStartConsultation(item.id)}
                />
              ))}
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

function QueueCard({ item, isSelected, isActive, onClick }: QueueCardProps) {
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

  return (
    <button
      className={cn(
        "w-full px-4 py-3 text-left transition-colors hover:bg-muted/50",
        isSelected && "bg-primary/5 hover:bg-primary/10",
        isActive && "border-l-2 border-l-blue-500"
      )}
      onClick={onClick}
    >
      {/* Patient Info */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {patient.lastName}, {patient.firstName}
          </span>
        </div>
        {patient.allergyStatus === "HAS_ALLERGIES" && (
          <Badge variant="destructive" className="text-[10px]">
            ALLERGY
          </Badge>
        )}
      </div>

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
