"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Activity, Heart, Thermometer, Wind, Droplets, Scale } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { submitTriageAction, type TriageQueueItem } from "@/actions/triage"

const vitalsFormSchema = z.object({
  bpSystolic: z.string().optional(),
  bpDiastolic: z.string().optional(),
  heartRate: z.string().optional(),
  temperatureC: z.string().optional(),
  respiratoryRate: z.string().optional(),
  spo2: z.string().optional(),
  weightKg: z.string().optional(),
  heightCm: z.string().optional(),
  chiefComplaint: z.string().max(500).optional(),
  triageNotes: z.string().max(2000).optional(),
})

type VitalsFormData = z.infer<typeof vitalsFormSchema>

interface VitalsFormProps {
  selectedEncounter: TriageQueueItem | null
  onSuccess: () => void
}

export function VitalsForm({ selectedEncounter, onSuccess }: VitalsFormProps) {
  const [isPending, startTransition] = useTransition()

  const form = useForm<VitalsFormData>({
    resolver: zodResolver(vitalsFormSchema),
    defaultValues: {
      bpSystolic: "",
      bpDiastolic: "",
      heartRate: "",
      temperatureC: "",
      respiratoryRate: "",
      spo2: "",
      weightKg: "",
      heightCm: "",
      chiefComplaint: "",
      triageNotes: "",
    },
  })

  // Reset form when selected encounter changes
  useEffect(() => {
    form.reset({
      bpSystolic: "",
      bpDiastolic: "",
      heartRate: "",
      temperatureC: "",
      respiratoryRate: "",
      spo2: "",
      weightKg: "",
      heightCm: "",
      chiefComplaint: selectedEncounter?.chiefComplaint ?? "",
      triageNotes: "",
    })
  }, [selectedEncounter?.id, form])

  const onSubmit = (data: VitalsFormData) => {
    if (!selectedEncounter) return

    startTransition(async () => {
      const parseNumber = (val: string | undefined) => {
        if (!val || val.trim() === "") return null
        const num = parseFloat(val)
        return isNaN(num) ? null : num
      }

      const parseInteger = (val: string | undefined) => {
        if (!val || val.trim() === "") return null
        const num = parseInt(val, 10)
        return isNaN(num) ? null : num
      }

      const result = await submitTriageAction({
        encounterId: selectedEncounter.id,
        bpSystolic: parseInteger(data.bpSystolic),
        bpDiastolic: parseInteger(data.bpDiastolic),
        heartRate: parseInteger(data.heartRate),
        respiratoryRate: parseInteger(data.respiratoryRate),
        temperatureC: parseNumber(data.temperatureC),
        spo2: parseInteger(data.spo2),
        weightKg: parseNumber(data.weightKg),
        heightCm: parseNumber(data.heightCm),
        chiefComplaint: data.chiefComplaint || null,
        triageNotes: data.triageNotes || null,
      })

      if (result.ok) {
        form.reset()
        onSuccess()
      } else {
        if (result.error.fieldErrors) {
          Object.entries(result.error.fieldErrors).forEach(([field, messages]) => {
            form.setError(field as keyof VitalsFormData, {
              message: messages[0],
            })
          })
        }
      }
    })
  }

  const isDisabled = !selectedEncounter || isPending

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Record Vital Signs
        </CardTitle>
        {selectedEncounter && (
          <div className="rounded-md bg-muted px-3 py-2 text-sm">
            Recording vitals for: <span className="font-semibold">{selectedEncounter.patientName}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Blood Pressure */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Blood Pressure (mmHg)
            </Label>
            <div className="flex items-center gap-2">
              <Input
                placeholder="120"
                {...form.register("bpSystolic")}
                disabled={isDisabled}
                className="w-24"
                type="number"
                min="50"
                max="300"
              />
              <span className="text-muted-foreground">/</span>
              <Input
                placeholder="80"
                {...form.register("bpDiastolic")}
                disabled={isDisabled}
                className="w-24"
                type="number"
                min="20"
                max="200"
              />
            </div>
          </div>

          {/* Heart Rate */}
          <div className="space-y-2">
            <Label htmlFor="heartRate" className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-pink-500" />
              Heart Rate (bpm)
            </Label>
            <Input
              id="heartRate"
              placeholder="e.g., 72"
              {...form.register("heartRate")}
              disabled={isDisabled}
              type="number"
              min="20"
              max="250"
            />
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperatureC" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              Temperature (°C)
            </Label>
            <Input
              id="temperatureC"
              placeholder="e.g., 36.5"
              {...form.register("temperatureC")}
              disabled={isDisabled}
              type="number"
              step="0.1"
              min="30"
              max="45"
            />
          </div>

          {/* Respiratory Rate */}
          <div className="space-y-2">
            <Label htmlFor="respiratoryRate" className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-blue-500" />
              Respiratory Rate (breaths/min)
            </Label>
            <Input
              id="respiratoryRate"
              placeholder="e.g., 16"
              {...form.register("respiratoryRate")}
              disabled={isDisabled}
              type="number"
              min="5"
              max="60"
            />
          </div>

          {/* Oxygen Saturation */}
          <div className="space-y-2">
            <Label htmlFor="spo2" className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              Oxygen Saturation (%)
            </Label>
            <Input
              id="spo2"
              placeholder="e.g., 98"
              {...form.register("spo2")}
              disabled={isDisabled}
              type="number"
              min="50"
              max="100"
            />
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weightKg" className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-green-500" />
              Weight (kg)
            </Label>
            <Input
              id="weightKg"
              placeholder="e.g., 65"
              {...form.register("weightKg")}
              disabled={isDisabled}
              type="number"
              step="0.1"
              min="0.5"
              max="500"
            />
          </div>

          {/* Chief Complaint */}
          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint</Label>
            <Textarea
              id="chiefComplaint"
              placeholder="Patient's main complaint..."
              {...form.register("chiefComplaint")}
              disabled={isDisabled}
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="triageNotes">Notes (Optional)</Label>
            <Textarea
              id="triageNotes"
              placeholder="Additional observations..."
              {...form.register("triageNotes")}
              disabled={isDisabled}
              rows={2}
            />
          </div>

          <Button type="submit" disabled={isDisabled} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Triage
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
