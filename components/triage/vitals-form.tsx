"use client"

import { useEffect, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Activity, Heart, Thermometer, Wind, Droplets, Scale, Ruler, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AllergyBanner } from "@/components/allergy"
import { submitTriageAction, type TriageQueueItem } from "@/actions/triage"

const vitalsFormSchema = z.object({
  bpSystolic: z
    .string()
    .min(1, "Systolic BP is required")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 50 && num <= 300
    }, "Must be between 50-300"),
  bpDiastolic: z
    .string()
    .min(1, "Diastolic BP is required")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 20 && num <= 200
    }, "Must be between 20-200"),
  heartRate: z
    .string()
    .min(1, "Heart rate is required")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 20 && num <= 250
    }, "Must be between 20-250"),
  temperatureC: z
    .string()
    .min(1, "Temperature is required")
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 30 && num <= 45
    }, "Must be between 30-45°C"),
  respiratoryRate: z
    .string()
    .min(1, "Respiratory rate is required")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 5 && num <= 60
    }, "Must be between 5-60"),
  spo2: z
    .string()
    .min(1, "Oxygen saturation is required")
    .refine((val) => {
      const num = parseInt(val, 10)
      return !isNaN(num) && num >= 50 && num <= 100
    }, "Must be between 50-100%"),
  weightKg: z
    .string()
    .min(1, "Weight is required")
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 0.5 && num <= 500
    }, "Must be between 0.5-500 kg"),
  heightCm: z
    .string()
    .min(1, "Height is required")
    .refine((val) => {
      const num = parseFloat(val)
      return !isNaN(num) && num >= 20 && num <= 300
    }, "Must be between 20-300 cm"),
  chiefComplaint: z
    .string()
    .min(1, "Chief complaint is required")
    .max(500, "Maximum 500 characters"),
  triageNotes: z.string().max(2000, "Maximum 2000 characters").optional(),
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
    mode: "onChange",
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

  const { formState: { errors, isValid } } = form

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
      const result = await submitTriageAction({
        encounterId: selectedEncounter.id,
        bpSystolic: parseInt(data.bpSystolic, 10),
        bpDiastolic: parseInt(data.bpDiastolic, 10),
        heartRate: parseInt(data.heartRate, 10),
        respiratoryRate: parseInt(data.respiratoryRate, 10),
        temperatureC: parseFloat(data.temperatureC),
        spo2: parseInt(data.spo2, 10),
        weightKg: parseFloat(data.weightKg),
        heightCm: parseFloat(data.heightCm),
        chiefComplaint: data.chiefComplaint,
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
        } else {
          form.setError("root", {
            message: result.error.message || "Submission failed",
          })
        }
      }
    })
  }

  const isFormDisabled = !selectedEncounter || isPending
  const isSubmitDisabled = isFormDisabled || !isValid

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Record Vital Signs
        </CardTitle>
        {selectedEncounter ? (
          <div className="space-y-3">
            <div className="rounded-md bg-muted px-3 py-2 text-sm">
              Recording vitals for: <span className="font-semibold">{selectedEncounter.patientName}</span>
            </div>
            {/* Allergy Banner */}
            <AllergyBanner
              status={selectedEncounter.allergyStatus}
              allergies={selectedEncounter.allergies}
              compact
            />
          </div>
        ) : (
          <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            Select a patient from the queue to record vitals
          </div>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Blood Pressure */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              Blood Pressure (mmHg) <span className="text-destructive">*</span>
            </Label>
            <div className="flex items-center gap-2">
              <div>
                <Input
                  placeholder="120"
                  {...form.register("bpSystolic")}
                  disabled={isFormDisabled}
                  className="w-24"
                  type="number"
                  aria-invalid={!!errors.bpSystolic}
                />
              </div>
              <span className="text-muted-foreground">/</span>
              <div>
                <Input
                  placeholder="80"
                  {...form.register("bpDiastolic")}
                  disabled={isFormDisabled}
                  className="w-24"
                  type="number"
                  aria-invalid={!!errors.bpDiastolic}
                />
              </div>
            </div>
            {(errors.bpSystolic || errors.bpDiastolic) && (
              <p className="text-sm text-destructive">
                {errors.bpSystolic?.message || errors.bpDiastolic?.message}
              </p>
            )}
          </div>

          {/* Heart Rate */}
          <div className="space-y-2">
            <Label htmlFor="heartRate" className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-pink-500" />
              Heart Rate (bpm) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="heartRate"
              placeholder="e.g., 72"
              {...form.register("heartRate")}
              disabled={isFormDisabled}
              type="number"
              aria-invalid={!!errors.heartRate}
            />
            {errors.heartRate && (
              <p className="text-sm text-destructive">{errors.heartRate.message}</p>
            )}
          </div>

          {/* Temperature */}
          <div className="space-y-2">
            <Label htmlFor="temperatureC" className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-orange-500" />
              Temperature (°C) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="temperatureC"
              placeholder="e.g., 36.5"
              {...form.register("temperatureC")}
              disabled={isFormDisabled}
              type="number"
              step="0.1"
              aria-invalid={!!errors.temperatureC}
            />
            {errors.temperatureC && (
              <p className="text-sm text-destructive">{errors.temperatureC.message}</p>
            )}
          </div>

          {/* Respiratory Rate */}
          <div className="space-y-2">
            <Label htmlFor="respiratoryRate" className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-blue-500" />
              Respiratory Rate (breaths/min) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="respiratoryRate"
              placeholder="e.g., 16"
              {...form.register("respiratoryRate")}
              disabled={isFormDisabled}
              type="number"
              aria-invalid={!!errors.respiratoryRate}
            />
            {errors.respiratoryRate && (
              <p className="text-sm text-destructive">{errors.respiratoryRate.message}</p>
            )}
          </div>

          {/* Oxygen Saturation */}
          <div className="space-y-2">
            <Label htmlFor="spo2" className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-cyan-500" />
              Oxygen Saturation (%) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="spo2"
              placeholder="e.g., 98"
              {...form.register("spo2")}
              disabled={isFormDisabled}
              type="number"
              aria-invalid={!!errors.spo2}
            />
            {errors.spo2 && (
              <p className="text-sm text-destructive">{errors.spo2.message}</p>
            )}
          </div>

          {/* Weight */}
          <div className="space-y-2">
            <Label htmlFor="weightKg" className="flex items-center gap-2">
              <Scale className="h-4 w-4 text-green-500" />
              Weight (kg) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="weightKg"
              placeholder="e.g., 65"
              {...form.register("weightKg")}
              disabled={isFormDisabled}
              type="number"
              step="0.1"
              aria-invalid={!!errors.weightKg}
            />
            {errors.weightKg && (
              <p className="text-sm text-destructive">{errors.weightKg.message}</p>
            )}
          </div>

          {/* Height */}
          <div className="space-y-2">
            <Label htmlFor="heightCm" className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-emerald-500" />
              Height (cm) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="heightCm"
              placeholder="e.g., 165"
              {...form.register("heightCm")}
              disabled={isFormDisabled}
              type="number"
              step="0.1"
              aria-invalid={!!errors.heightCm}
            />
            {errors.heightCm && (
              <p className="text-sm text-destructive">{errors.heightCm.message}</p>
            )}
          </div>

          {/* Chief Complaint */}
          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">
              Chief Complaint <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="chiefComplaint"
              placeholder="Patient's main complaint..."
              {...form.register("chiefComplaint")}
              disabled={isFormDisabled}
              rows={2}
              aria-invalid={!!errors.chiefComplaint}
            />
            {errors.chiefComplaint && (
              <p className="text-sm text-destructive">{errors.chiefComplaint.message}</p>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="triageNotes">Assessment Notes (Optional)</Label>
            <Textarea
              id="triageNotes"
              placeholder="Additional observations..."
              {...form.register("triageNotes")}
              disabled={isFormDisabled}
              rows={2}
            />
            {errors.triageNotes && (
              <p className="text-sm text-destructive">{errors.triageNotes.message}</p>
            )}
          </div>

          {errors.root && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errors.root.message}
            </div>
          )}

          <Button type="submit" disabled={isSubmitDisabled} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Triage
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
