"use client"

import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Activity,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  Ruler,
  Clock,
  Timer,
  Gauge,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { TriageRecordForConsult } from "@/actions/doctor"
import { ASSOCIATED_SYMPTOMS, SYMPTOM_ONSET_OPTIONS, SYMPTOM_DURATION_OPTIONS } from "@/lib/constants"

interface TriageSummaryProps {
  triageRecord: TriageRecordForConsult | null
}

function VitalCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  alert,
}: {
  icon: React.ElementType
  label: string
  value: string | number | null
  unit: string
  color: string
  alert?: boolean
}) {
  if (value === null || value === undefined) return null

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border bg-white p-3 dark:bg-slate-900",
        alert && "border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950"
      )}
    >
      <div className={cn("rounded-md p-2", color)}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className={cn("text-lg font-bold tabular-nums", alert && "text-red-600")}>
          {value}
          <span className="ml-1 text-sm font-normal text-muted-foreground">{unit}</span>
        </p>
      </div>
    </div>
  )
}

function getOnsetLabel(value: string | null): string {
  if (!value) return ""
  const option = SYMPTOM_ONSET_OPTIONS.find((o) => o.value === value)
  return option?.label ?? value
}

function getDurationLabel(value: string | null): string {
  if (!value) return ""
  const option = SYMPTOM_DURATION_OPTIONS.find((o) => o.value === value)
  return option?.label ?? value
}

function getSymptomLabel(value: string): string {
  const symptom = ASSOCIATED_SYMPTOMS.find((s) => s.value === value)
  return symptom?.label ?? value
}

function getSeverityLabel(value: number): { label: string; color: string } {
  if (value <= 3) return { label: "Mild", color: "text-green-600 bg-green-100" }
  if (value <= 6) return { label: "Moderate", color: "text-yellow-600 bg-yellow-100" }
  return { label: "Severe", color: "text-red-600 bg-red-100" }
}

export function TriageSummary({ triageRecord }: TriageSummaryProps) {
  if (!triageRecord) {
    return (
      <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
        No triage data recorded for this encounter
      </div>
    )
  }

  const { painSeverity } = triageRecord
  const severityInfo = painSeverity ? getSeverityLabel(painSeverity) : null

  // Check for abnormal vitals
  const isHighBP = (triageRecord.bpSystolic ?? 0) >= 140 || (triageRecord.bpDiastolic ?? 0) >= 90
  const isLowBP = (triageRecord.bpSystolic ?? 120) < 90 || (triageRecord.bpDiastolic ?? 80) < 60
  const isHighHR = (triageRecord.heartRate ?? 0) > 100
  const isLowHR = (triageRecord.heartRate ?? 70) < 50
  const isHighTemp = (triageRecord.temperatureC ?? 0) >= 38.0
  const isLowSpO2 = (triageRecord.spo2 ?? 100) < 95

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
          <Activity className="h-4 w-4" />
          Triage Summary
        </h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {triageRecord.recordedBy && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {triageRecord.recordedBy.name}
            </span>
          )}
          <span>
            {new Date(triageRecord.recordedAt).toLocaleTimeString("en-PH", {
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>

      {/* Vital Signs Grid */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <VitalCard
          icon={Heart}
          label="Blood Pressure"
          value={
            triageRecord.bpSystolic && triageRecord.bpDiastolic
              ? `${triageRecord.bpSystolic}/${triageRecord.bpDiastolic}`
              : null
          }
          unit="mmHg"
          color="bg-red-500"
          alert={isHighBP || isLowBP}
        />
        <VitalCard
          icon={Activity}
          label="Heart Rate"
          value={triageRecord.heartRate}
          unit="bpm"
          color="bg-pink-500"
          alert={isHighHR || isLowHR}
        />
        <VitalCard
          icon={Thermometer}
          label="Temperature"
          value={triageRecord.temperatureC}
          unit="°C"
          color="bg-orange-500"
          alert={isHighTemp}
        />
        <VitalCard
          icon={Droplets}
          label="SpO2"
          value={triageRecord.spo2}
          unit="%"
          color="bg-cyan-500"
          alert={isLowSpO2}
        />
        <VitalCard
          icon={Wind}
          label="Resp. Rate"
          value={triageRecord.respiratoryRate}
          unit="/min"
          color="bg-blue-500"
        />
        <VitalCard
          icon={Scale}
          label="Weight"
          value={triageRecord.weightKg}
          unit="kg"
          color="bg-green-500"
        />
        <VitalCard
          icon={Ruler}
          label="Height"
          value={triageRecord.heightCm}
          unit="cm"
          color="bg-emerald-500"
        />
        {triageRecord.weightKg && triageRecord.heightCm && (
          <VitalCard
            icon={Activity}
            label="BMI"
            value={(
              triageRecord.weightKg / Math.pow(triageRecord.heightCm / 100, 2)
            ).toFixed(1)}
            unit="kg/m²"
            color="bg-violet-500"
          />
        )}
      </div>

      {/* HPI Screening */}
      {(triageRecord.symptomOnset ||
        triageRecord.symptomDuration ||
        triageRecord.painSeverity ||
        triageRecord.associatedSymptoms.length > 0) && (
        <div className="rounded-lg border bg-slate-50 p-4 dark:bg-slate-900">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
            HPI Screening (from Triage)
          </h4>

          <div className="grid gap-4 sm:grid-cols-3">
            {/* Onset */}
            {triageRecord.symptomOnset && (
              <div className="flex items-start gap-2">
                <Clock className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Onset</p>
                  <p className="font-medium">{getOnsetLabel(triageRecord.symptomOnset)}</p>
                </div>
              </div>
            )}

            {/* Duration */}
            {triageRecord.symptomDuration && (
              <div className="flex items-start gap-2">
                <Timer className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Duration</p>
                  <p className="font-medium">{getDurationLabel(triageRecord.symptomDuration)}</p>
                </div>
              </div>
            )}

            {/* Severity */}
            {painSeverity !== null && painSeverity > 0 && severityInfo && (
              <div className="flex items-start gap-2">
                <Gauge className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs text-muted-foreground">Pain Severity</p>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold tabular-nums">{painSeverity}/10</span>
                    <Badge className={cn("text-xs", severityInfo.color)}>
                      {severityInfo.label}
                    </Badge>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Associated Symptoms */}
          {triageRecord.associatedSymptoms.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs text-muted-foreground">Associated Symptoms</p>
              <div className="flex flex-wrap gap-1.5">
                {triageRecord.associatedSymptoms.map((symptom) => (
                  <Badge key={symptom} variant="secondary" className="text-xs">
                    {getSymptomLabel(symptom)}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Triage Notes */}
      {triageRecord.notes && (
        <div className="rounded-lg border bg-amber-50 p-3 dark:bg-amber-950">
          <p className="text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-400">
            Triage Notes
          </p>
          <p className="mt-1 text-sm">{triageRecord.notes}</p>
        </div>
      )}
    </div>
  )
}
