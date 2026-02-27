"use client"

import { UseFormReturn } from "react-hook-form"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  SYMPTOM_ONSET_OPTIONS,
  SYMPTOM_DURATION_OPTIONS,
  ASSOCIATED_SYMPTOMS,
} from "@/lib/constants"
import { Clock, Timer, Gauge, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"

interface HpiScreeningSectionProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  form: UseFormReturn<any>
  disabled?: boolean
}

export function HpiScreeningSection({ form, disabled = false }: HpiScreeningSectionProps) {
  const selectedSymptoms = form.watch("associatedSymptoms") || []
  const painSeverity = form.watch("painSeverity") || 0

  const toggleSymptom = (symptom: string) => {
    const current = form.getValues("associatedSymptoms") || []
    if (current.includes(symptom)) {
      form.setValue(
        "associatedSymptoms",
        current.filter((s: string) => s !== symptom)
      )
    } else {
      form.setValue("associatedSymptoms", [...current, symptom])
    }
  }

  const getSeverityColor = (value: number) => {
    if (value <= 3) return "text-green-600"
    if (value <= 6) return "text-yellow-600"
    return "text-red-600"
  }

  const getSeverityLabel = (value: number) => {
    if (value === 0) return "None"
    if (value <= 3) return "Mild"
    if (value <= 6) return "Moderate"
    return "Severe"
  }

  return (
    <div className="space-y-4 rounded-lg border p-4">
      <h3 className="flex items-center gap-2 font-medium">
        <Stethoscope className="h-4 w-4 text-blue-500" />
        HPI Screening
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Symptom Onset */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Clock className="h-3.5 w-3.5" />
            When did it start?
          </Label>
          <Select
            disabled={disabled}
            value={form.watch("symptomOnset") || ""}
            onValueChange={(value) => form.setValue("symptomOnset", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select onset" />
            </SelectTrigger>
            <SelectContent>
              {SYMPTOM_ONSET_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm">
            <Timer className="h-3.5 w-3.5" />
            How long has it lasted?
          </Label>
          <Select
            disabled={disabled}
            value={form.watch("symptomDuration") || ""}
            onValueChange={(value) => form.setValue("symptomDuration", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {SYMPTOM_DURATION_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Pain Severity */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="flex items-center gap-2 text-sm">
            <Gauge className="h-3.5 w-3.5" />
            Pain/Discomfort Severity
          </Label>
          <span className={cn("text-sm font-medium", getSeverityColor(painSeverity))}>
            {painSeverity}/10 ({getSeverityLabel(painSeverity)})
          </span>
        </div>
        <Slider
          disabled={disabled}
          value={[painSeverity]}
          onValueChange={([value]) => form.setValue("painSeverity", value)}
          max={10}
          step={1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>None</span>
          <span>Mild</span>
          <span>Moderate</span>
          <span>Severe</span>
        </div>
      </div>

      {/* Associated Symptoms */}
      <div className="space-y-2">
        <Label className="text-sm">Associated Symptoms</Label>
        <div className="flex flex-wrap gap-2">
          {ASSOCIATED_SYMPTOMS.map((symptom) => {
            const isSelected = selectedSymptoms.includes(symptom.value)
            return (
              <Badge
                key={symptom.value}
                variant={isSelected ? "default" : "outline"}
                className={cn(
                  "cursor-pointer transition-colors",
                  disabled && "cursor-not-allowed opacity-50"
                )}
                onClick={() => !disabled && toggleSymptom(symptom.value)}
              >
                {symptom.label}
              </Badge>
            )
          })}
        </div>
        {selectedSymptoms.length > 0 && (
          <p className="text-xs text-muted-foreground">
            {selectedSymptoms.length} symptom{selectedSymptoms.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>
    </div>
  )
}
