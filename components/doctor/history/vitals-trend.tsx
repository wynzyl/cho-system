"use client"

import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn, formatDate, formatDateShort } from "@/lib/utils"
import type { VitalsRecord } from "@/lib/types/patient-history"

interface VitalsTrendProps {
  vitalsHistory: VitalsRecord[]
}

// Simple trend calculation
function calculateTrend(
  values: (number | null)[]
): "up" | "down" | "stable" | null {
  const validValues = values.filter((v): v is number => v !== null)
  if (validValues.length < 2) return null

  const first = validValues[0]
  const last = validValues[validValues.length - 1]
  const diff = last - first
  const threshold = first * 0.05 // 5% change threshold

  if (diff > threshold) return "up"
  if (diff < -threshold) return "down"
  return "stable"
}

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" | null }) {
  if (!trend) return null

  switch (trend) {
    case "up":
      return <TrendingUp className="h-4 w-4 text-red-500" />
    case "down":
      return <TrendingDown className="h-4 w-4 text-blue-500" />
    case "stable":
      return <Minus className="h-4 w-4 text-green-500" />
  }
}

interface VitalCardProps {
  label: string
  unit: string
  values: { date: Date; value: number | null }[]
  normalRange?: { min: number; max: number }
  warningColor?: "red" | "blue" | "yellow"
}

function VitalCard({
  label,
  unit,
  values,
  normalRange,
  warningColor,
}: VitalCardProps) {
  const validValues = values.filter((v) => v.value !== null)
  if (validValues.length === 0) return null

  const latest = validValues[validValues.length - 1]
  const trend = calculateTrend(values.map((v) => v.value))

  const isAbnormal =
    normalRange &&
    latest.value !== null &&
    (latest.value < normalRange.min || latest.value > normalRange.max)

  return (
    <Card
      className={cn(
        "relative overflow-hidden",
        isAbnormal && warningColor === "red" && "border-red-200 bg-red-50/50 dark:bg-red-950/20",
        isAbnormal && warningColor === "blue" && "border-blue-200 bg-blue-50/50 dark:bg-blue-950/20",
        isAbnormal && warningColor === "yellow" && "border-yellow-200 bg-yellow-50/50 dark:bg-yellow-950/20"
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {label}
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl font-semibold tabular-nums">
                {latest.value}
              </span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatDateShort(new Date(latest.date))}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <TrendIcon trend={trend} />
            {isAbnormal && (
              <Badge variant="destructive" className="text-xs">
                Abnormal
              </Badge>
            )}
          </div>
        </div>

        {/* Mini sparkline representation */}
        {validValues.length > 1 && (
          <div className="mt-3 flex items-end gap-0.5 h-8">
            {validValues.slice(-10).map((v, i) => {
              const allVals = validValues.map((x) => x.value as number)
              const min = Math.min(...allVals)
              const max = Math.max(...allVals)
              const range = max - min || 1
              const height = ((v.value as number) - min) / range
              const heightPercent = Math.max(10, height * 100)

              return (
                <div
                  key={`spark-${i}`}
                  className={cn(
                    "flex-1 rounded-sm",
                    i === validValues.slice(-10).length - 1
                      ? "bg-primary"
                      : "bg-primary/30"
                  )}
                  style={{ height: `${heightPercent}%` }}
                  title={`${v.value} ${unit} on ${formatDateShort(new Date(v.date))}`}
                />
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function VitalsTrend({ vitalsHistory }: VitalsTrendProps) {
  if (vitalsHistory.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Activity className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No vitals history found</p>
        <p className="text-xs mt-1">Vitals will be tracked across visits</p>
      </div>
    )
  }

  // Extract values for each vital type
  const bpSystolicValues = vitalsHistory.map((v) => ({
    date: v.occurredAt,
    value: v.bpSystolic,
  }))
  const bpDiastolicValues = vitalsHistory.map((v) => ({
    date: v.occurredAt,
    value: v.bpDiastolic,
  }))
  const heartRateValues = vitalsHistory.map((v) => ({
    date: v.occurredAt,
    value: v.heartRate,
  }))
  const tempValues = vitalsHistory.map((v) => ({
    date: v.occurredAt,
    value: v.temperatureC,
  }))
  const spo2Values = vitalsHistory.map((v) => ({
    date: v.occurredAt,
    value: v.spo2,
  }))
  const weightValues = vitalsHistory.map((v) => ({
    date: v.occurredAt,
    value: v.weightKg,
  }))
  const respiratoryValues = vitalsHistory.map((v) => ({
    date: v.occurredAt,
    value: v.respiratoryRate,
  }))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-muted-foreground">
          Vitals across {vitalsHistory.length} visit
          {vitalsHistory.length !== 1 && "s"}
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <VitalCard
          label="BP Systolic"
          unit="mmHg"
          values={bpSystolicValues}
          normalRange={{ min: 90, max: 140 }}
          warningColor="red"
        />
        <VitalCard
          label="BP Diastolic"
          unit="mmHg"
          values={bpDiastolicValues}
          normalRange={{ min: 60, max: 90 }}
          warningColor="red"
        />
        <VitalCard
          label="Heart Rate"
          unit="bpm"
          values={heartRateValues}
          normalRange={{ min: 60, max: 100 }}
          warningColor="red"
        />
        <VitalCard
          label="Temperature"
          unit="°C"
          values={tempValues}
          normalRange={{ min: 36.1, max: 37.5 }}
          warningColor="red"
        />
        <VitalCard
          label="SpO2"
          unit="%"
          values={spo2Values}
          normalRange={{ min: 95, max: 100 }}
          warningColor="blue"
        />
        <VitalCard
          label="Resp. Rate"
          unit="/min"
          values={respiratoryValues}
          normalRange={{ min: 12, max: 20 }}
          warningColor="yellow"
        />
        <VitalCard label="Weight" unit="kg" values={weightValues} />
      </div>

      {/* Historical table */}
      <Card>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm font-medium">History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">
                    Date
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    BP
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    HR
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    Temp
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    SpO2
                  </th>
                  <th className="py-2 px-3 text-right font-medium text-muted-foreground">
                    Wt
                  </th>
                </tr>
              </thead>
              <tbody>
                {vitalsHistory
                  .slice()
                  .reverse()
                  .map((v, index) => (
                    <tr
                      key={`vitals-row-${v.encounterId}-${index}`}
                      className="border-b last:border-0 hover:bg-muted/30"
                    >
                      <td className="py-2 px-3 text-muted-foreground">
                        {formatDateShort(new Date(v.occurredAt))}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {v.bpSystolic && v.bpDiastolic
                          ? `${v.bpSystolic}/${v.bpDiastolic}`
                          : "—"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {v.heartRate ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {v.temperatureC ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {v.spo2 ?? "—"}
                      </td>
                      <td className="py-2 px-3 text-right font-mono">
                        {v.weightKg ?? "—"}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
