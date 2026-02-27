"use client"

import { Activity, Thermometer, Heart, Wind, Droplets, Scale, Ruler, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { ASSOCIATED_SYMPTOMS, SYMPTOM_ONSET_OPTIONS, SYMPTOM_DURATION_OPTIONS } from "@/lib/constants"
import type { TriageRecordForConsult } from "@/actions/doctor"

interface TriageSummaryProps {
  triageRecord: TriageRecordForConsult | null
}

export function TriageSummary({ triageRecord }: TriageSummaryProps) {
  if (!triageRecord) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        No triage data available
      </div>
    )
  }

  // Get symptom labels
  const symptoms = triageRecord.associatedSymptoms
    .map((s) => ASSOCIATED_SYMPTOMS.find((as) => as.value === s)?.label ?? s)

  // Get onset and duration labels
  const onsetLabel = SYMPTOM_ONSET_OPTIONS.find((o) => o.value === triageRecord.symptomOnset)?.label
  const durationLabel = SYMPTOM_DURATION_OPTIONS.find((d) => d.value === triageRecord.symptomDuration)?.label

  return (
    <div className="space-y-4">
      {/* Vital Signs Grid */}
      <div className="grid grid-cols-4 gap-3">
        <VitalCard
          icon={Activity}
          label="Blood Pressure"
          value={
            triageRecord.bpSystolic && triageRecord.bpDiastolic
              ? `${triageRecord.bpSystolic}/${triageRecord.bpDiastolic}`
              : null
          }
          unit="mmHg"
          warning={
            triageRecord.bpSystolic && triageRecord.bpDiastolic
              ? triageRecord.bpSystolic >= 140 || triageRecord.bpDiastolic >= 90
              : false
          }
        />
        <VitalCard
          icon={Heart}
          label="Heart Rate"
          value={triageRecord.heartRate}
          unit="bpm"
          warning={
            triageRecord.heartRate
              ? triageRecord.heartRate > 100 || triageRecord.heartRate < 60
              : false
          }
        />
        <VitalCard
          icon={Wind}
          label="Respiratory Rate"
          value={triageRecord.respiratoryRate}
          unit="/min"
          warning={
            triageRecord.respiratoryRate
              ? triageRecord.respiratoryRate > 20 || triageRecord.respiratoryRate < 12
              : false
          }
        />
        <VitalCard
          icon={Thermometer}
          label="Temperature"
          value={triageRecord.temperatureC}
          unit="°C"
          warning={triageRecord.temperatureC ? triageRecord.temperatureC >= 38 : false}
        />
        <VitalCard
          icon={Droplets}
          label="SpO2"
          value={triageRecord.spo2}
          unit="%"
          warning={triageRecord.spo2 ? triageRecord.spo2 < 95 : false}
        />
        <VitalCard
          icon={Scale}
          label="Weight"
          value={triageRecord.weightKg}
          unit="kg"
        />
        <VitalCard
          icon={Ruler}
          label="Height"
          value={triageRecord.heightCm}
          unit="cm"
        />
        {triageRecord.weightKg && triageRecord.heightCm && (
          <VitalCard
            icon={Scale}
            label="BMI"
            value={
              Math.round(
                (triageRecord.weightKg / Math.pow(triageRecord.heightCm / 100, 2)) * 10
              ) / 10
            }
            unit="kg/m²"
          />
        )}
      </div>

      {/* HPI Screening */}
      {(triageRecord.symptomOnset || triageRecord.symptomDuration || triageRecord.painSeverity || symptoms.length > 0) && (
        <div className="rounded-lg border p-4">
          <h4 className="mb-3 text-sm font-medium text-muted-foreground">HPI Screening (from Triage)</h4>

          <div className="grid grid-cols-3 gap-4">
            {/* Onset & Duration */}
            <div className="space-y-2">
              {onsetLabel && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Onset:</span>
                  <span>{onsetLabel}</span>
                </div>
              )}
              {durationLabel && (
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Duration:</span>
                  <span>{durationLabel}</span>
                </div>
              )}
            </div>

            {/* Pain Severity */}
            {triageRecord.painSeverity && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Pain Severity</div>
                <div className="flex items-center gap-2">
                  <div className="flex h-6 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className={cn(
                        "h-full transition-all",
                        triageRecord.painSeverity <= 3 && "bg-green-500",
                        triageRecord.painSeverity > 3 && triageRecord.painSeverity <= 6 && "bg-yellow-500",
                        triageRecord.painSeverity > 6 && "bg-red-500"
                      )}
                      style={{ width: `${triageRecord.painSeverity * 10}%` }}
                    />
                  </div>
                  <span className="w-8 text-right font-medium">{triageRecord.painSeverity}/10</span>
                </div>
              </div>
            )}

            {/* Associated Symptoms */}
            {symptoms.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Associated Symptoms</div>
                <div className="flex flex-wrap gap-1">
                  {symptoms.map((symptom) => (
                    <Badge key={symptom} variant="secondary" className="text-xs">
                      {symptom}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Triage Notes */}
      {triageRecord.notes && (
        <div className="rounded-lg border p-4">
          <h4 className="mb-2 text-sm font-medium text-muted-foreground">Triage Notes</h4>
          <p className="text-sm">{triageRecord.notes}</p>
        </div>
      )}
    </div>
  )
}

interface VitalCardProps {
  icon: React.ElementType
  label: string
  value: string | number | null
  unit?: string
  warning?: boolean
}

function VitalCard({ icon: Icon, label, value, unit, warning }: VitalCardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        warning && "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"
      )}
    >
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", warning && "text-red-500")} />
        <span>{label}</span>
      </div>
      <div className="mt-1">
        {value !== null ? (
          <span className={cn("text-lg font-semibold", warning && "text-red-600 dark:text-red-400")}>
            {value}
            {unit && <span className="ml-1 text-xs font-normal text-muted-foreground">{unit}</span>}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">--</span>
        )}
      </div>
    </div>
  )
}
