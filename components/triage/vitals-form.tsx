"use client"

import { useEffect, useState, useTransition, useMemo } from "react"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Activity,
  Heart,
  Thermometer,
  Wind,
  Droplets,
  Scale,
  Ruler,
  Loader2,
  Clock,
  AlertTriangle,
  Stethoscope,
  FileText,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AllergyBanner, AllergyCard } from "@/components/allergy"
import { VitalInput } from "@/components/forms"
import { PatientBackgroundForm } from "./patient-background-form"
import { submitTriageAction, type TriageQueueItem } from "@/actions/triage"
import { getPatientAction, type PatientWithEncounters } from "@/actions/patients"
import { vitalsFormSchema, type VitalsFormData } from "@/lib/validators/vitals-form"
import {
  ASSOCIATED_SYMPTOMS,
  SYMPTOM_ONSET_OPTIONS,
  SYMPTOM_DURATION_OPTIONS,
  EXPOSURE_FLAGS,
} from "@/lib/constants/consultation"
import { cn } from "@/lib/utils"

interface VitalsFormProps {
  selectedEncounter: TriageQueueItem | null
  onSuccess: () => void
  canEditAllergies?: boolean
  refreshKey?: number
  onAllergyUpdate?: () => void
}

type TabValue = "vitals" | "hpi" | "exposure" | "background"

export function VitalsForm({
  selectedEncounter,
  onSuccess,
  canEditAllergies = false,
  refreshKey = 0,
  onAllergyUpdate,
}: VitalsFormProps) {
  const [isPending, startTransition] = useTransition()
  const [patient, setPatient] = useState<PatientWithEncounters | null>(null)
  const [activeTab, setActiveTab] = useState<TabValue>("vitals")

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
      symptomOnset: undefined,
      symptomDuration: undefined,
      painSeverity: undefined,
      associatedSymptoms: [],
      exposureFlags: [],
      exposureNotes: "",
    },
  })

  const {
    formState: { errors, isValid },
    watch,
    control,
  } = form

  // Watch all form values for completion tracking
  const formValues = watch()

  // Derive completed sections from form values (no useEffect needed)
  const completedSections = useMemo(() => {
    const completed = new Set<TabValue>()

    // Check vitals completion (all required fields)
    const vitalsFields = [
      formValues.bpSystolic,
      formValues.bpDiastolic,
      formValues.heartRate,
      formValues.temperatureC,
      formValues.respiratoryRate,
      formValues.spo2,
      formValues.weightKg,
      formValues.heightCm,
      formValues.chiefComplaint,
    ]
    const vitalsComplete = vitalsFields.every((v) => v && String(v).trim() !== "")
    if (vitalsComplete) completed.add("vitals")

    // Check HPI completion (at least onset or duration filled)
    const hpiHasData =
      formValues.symptomOnset ||
      formValues.symptomDuration ||
      formValues.painSeverity !== undefined ||
      (formValues.associatedSymptoms && formValues.associatedSymptoms.length > 0)
    if (hpiHasData) completed.add("hpi")

    // Check exposure completion (any flags selected)
    if (formValues.exposureFlags && formValues.exposureFlags.length > 0) {
      completed.add("exposure")
    }

    return completed
  }, [formValues])

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
      symptomOnset: undefined,
      symptomDuration: undefined,
      painSeverity: undefined,
      associatedSymptoms: [],
      exposureFlags: [],
      exposureNotes: "",
    })
    setActiveTab("vitals")
  }, [selectedEncounter?.id, selectedEncounter?.chiefComplaint, form])

  // Fetch full patient when selected for allergy management
  useEffect(() => {
    if (!selectedEncounter?.patientId) {
      setPatient(null)
      return
    }
    let cancelled = false
    getPatientAction(selectedEncounter.patientId).then((result) => {
      if (cancelled) return
      setPatient(result.ok ? result.data : null)
    })
    return () => {
      cancelled = true
    }
  }, [selectedEncounter?.patientId, refreshKey])

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
        // HPI Screening
        symptomOnset: data.symptomOnset || null,
        symptomDuration: data.symptomDuration || null,
        painSeverity: data.painSeverity ?? null,
        associatedSymptoms: data.associatedSymptoms || [],
        // Exposure Screening
        exposureFlags: data.exposureFlags || [],
        exposureNotes: data.exposureNotes || null,
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

  // Tab indicator component
  const TabIndicator = ({ tab }: { tab: TabValue }) => {
    if (completedSections.has(tab)) {
      return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
    }
    return null
  }

  // Get exposure flags with alerts
  const selectedExposureFlags = formValues.exposureFlags || []
  const activeAlerts = EXPOSURE_FLAGS.filter(
    (f) => selectedExposureFlags.includes(f.value) && f.alert
  )

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Triage Assessment
        </CardTitle>
        {selectedEncounter ? (
          <div className="space-y-2">
            <div className="rounded-md bg-muted px-3 py-2 text-sm">
              Recording for:{" "}
              <span className="font-semibold">{selectedEncounter.patientName}</span>
            </div>
            <AllergyBanner
              status={selectedEncounter.allergyStatus}
              allergies={selectedEncounter.allergies}
              compact
            />
            {/* Active Exposure Alerts */}
            {activeAlerts.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {activeAlerts.map((alert) => (
                  <Badge
                    key={alert.value}
                    variant="destructive"
                    className={cn(
                      "text-xs gap-1",
                      alert.color === "red" && "bg-red-600",
                      alert.color === "orange" && "bg-orange-500",
                      alert.color === "yellow" && "bg-yellow-500 text-yellow-950",
                      alert.color === "purple" && "bg-purple-600"
                    )}
                  >
                    <AlertTriangle className="h-3 w-3" />
                    {alert.alert}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            Select a patient from the queue to begin triage
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden flex flex-col">
        {/* Allergy management section */}
        {selectedEncounter &&
          canEditAllergies &&
          patient &&
          patient.id === selectedEncounter.patientId && (
            <div className="mb-4 flex-shrink-0">
              <AllergyCard
                patientId={patient.id}
                allergyStatus={patient.allergyStatus ?? "UNKNOWN"}
                allergies={patient.allergies ?? []}
                allergyConfirmedAt={patient.allergyConfirmedAt}
                allergyConfirmedBy={patient.allergyConfirmedBy}
                canEdit={true}
                onUpdate={onAllergyUpdate}
              />
            </div>
          )}

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as TabValue)}
          className="flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-4 flex-shrink-0">
            <TabsTrigger value="vitals" className="gap-1.5 text-xs px-2">
              <Heart className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Vitals</span>
              <TabIndicator tab="vitals" />
            </TabsTrigger>
            <TabsTrigger value="hpi" className="gap-1.5 text-xs px-2">
              <Clock className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">HPI</span>
              <TabIndicator tab="hpi" />
            </TabsTrigger>
            <TabsTrigger value="exposure" className="gap-1.5 text-xs px-2">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Exposure</span>
              <TabIndicator tab="exposure" />
            </TabsTrigger>
            <TabsTrigger value="background" className="gap-1.5 text-xs px-2">
              <FileText className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">History</span>
              {patient?.medicalHistoryData && <TabIndicator tab="background" />}
            </TabsTrigger>
          </TabsList>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex-1 overflow-hidden flex flex-col"
          >
            {/* Vital Signs Tab */}
            <TabsContent value="vitals" className="flex-1 overflow-y-auto mt-4 space-y-4">
              {/* Blood Pressure */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  Blood Pressure (mmHg) <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    placeholder="120"
                    {...form.register("bpSystolic")}
                    disabled={isFormDisabled}
                    className="w-24"
                    type="number"
                    aria-invalid={!!errors.bpSystolic}
                  />
                  <span className="text-muted-foreground">/</span>
                  <Input
                    placeholder="80"
                    {...form.register("bpDiastolic")}
                    disabled={isFormDisabled}
                    className="w-24"
                    type="number"
                    aria-invalid={!!errors.bpDiastolic}
                  />
                </div>
                {(errors.bpSystolic || errors.bpDiastolic) && (
                  <p className="text-sm text-destructive">
                    {errors.bpSystolic?.message || errors.bpDiastolic?.message}
                  </p>
                )}
              </div>

              <VitalInput<VitalsFormData>
                id="heartRate"
                label="Heart Rate"
                icon={Activity}
                iconColor="text-pink-500"
                unit="bpm"
                placeholder="e.g., 72"
                register={form.register}
                error={errors.heartRate}
                disabled={isFormDisabled}
              />

              <VitalInput<VitalsFormData>
                id="temperatureC"
                label="Temperature"
                icon={Thermometer}
                iconColor="text-orange-500"
                unit="°C"
                placeholder="e.g., 36.5"
                register={form.register}
                error={errors.temperatureC}
                disabled={isFormDisabled}
                step="0.1"
              />

              <VitalInput<VitalsFormData>
                id="respiratoryRate"
                label="Respiratory Rate"
                icon={Wind}
                iconColor="text-blue-500"
                unit="breaths/min"
                placeholder="e.g., 16"
                register={form.register}
                error={errors.respiratoryRate}
                disabled={isFormDisabled}
              />

              <VitalInput<VitalsFormData>
                id="spo2"
                label="Oxygen Saturation"
                icon={Droplets}
                iconColor="text-cyan-500"
                unit="%"
                placeholder="e.g., 98"
                register={form.register}
                error={errors.spo2}
                disabled={isFormDisabled}
              />

              <VitalInput<VitalsFormData>
                id="weightKg"
                label="Weight"
                icon={Scale}
                iconColor="text-green-500"
                unit="kg"
                placeholder="e.g., 65"
                register={form.register}
                error={errors.weightKg}
                disabled={isFormDisabled}
                step="0.1"
              />

              <VitalInput<VitalsFormData>
                id="heightCm"
                label="Height"
                icon={Ruler}
                iconColor="text-emerald-500"
                unit="cm"
                placeholder="e.g., 165"
                register={form.register}
                error={errors.heightCm}
                disabled={isFormDisabled}
                step="0.1"
              />

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
              </div>
            </TabsContent>

            {/* HPI Screening Tab */}
            <TabsContent value="hpi" className="flex-1 overflow-y-auto mt-4 space-y-4">
              <div className="rounded-md bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 px-3 py-2 text-sm text-blue-700 dark:text-blue-300">
                <Stethoscope className="inline h-4 w-4 mr-1.5" />
                Quick interview to help the doctor assess the patient faster.
              </div>

              {/* Symptom Onset */}
              <div className="space-y-2">
                <Label>When did symptoms start?</Label>
                <Controller
                  name="symptomOnset"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={isFormDisabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select onset..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SYMPTOM_ONSET_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Symptom Duration */}
              <div className="space-y-2">
                <Label>How long have symptoms persisted?</Label>
                <Controller
                  name="symptomDuration"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      onValueChange={field.onChange}
                      disabled={isFormDisabled}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select duration..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SYMPTOM_DURATION_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              {/* Pain Severity */}
              <div className="space-y-3">
                <Label>Pain Severity (0-10)</Label>
                <Controller
                  name="painSeverity"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      <div className="flex gap-1">
                        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <button
                            key={n}
                            type="button"
                            disabled={isFormDisabled}
                            onClick={() => field.onChange(field.value === n ? undefined : n)}
                            className={cn(
                              "flex-1 h-9 rounded text-sm font-medium transition-colors",
                              "border hover:border-primary/50",
                              field.value === n
                                ? n <= 3
                                  ? "bg-green-500 text-white border-green-600"
                                  : n <= 6
                                    ? "bg-yellow-500 text-white border-yellow-600"
                                    : "bg-red-500 text-white border-red-600"
                                : "bg-muted/50 text-muted-foreground",
                              isFormDisabled && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground px-1">
                        <span>No pain</span>
                        <span>Moderate</span>
                        <span>Severe</span>
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* Associated Symptoms */}
              <div className="space-y-3">
                <Label>Associated Symptoms</Label>
                <Controller
                  name="associatedSymptoms"
                  control={control}
                  render={({ field }) => (
                    <div className="grid grid-cols-2 gap-2">
                      {ASSOCIATED_SYMPTOMS.map((symptom) => {
                        const isChecked = field.value?.includes(symptom.value) || false
                        return (
                          <label
                            key={symptom.value}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors text-sm",
                              isChecked
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-muted/30 border-transparent hover:bg-muted/50",
                              isFormDisabled && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <Checkbox
                              checked={isChecked}
                              disabled={isFormDisabled}
                              onCheckedChange={(checked) => {
                                const current = field.value || []
                                if (checked) {
                                  field.onChange([...current, symptom.value])
                                } else {
                                  field.onChange(current.filter((v) => v !== symptom.value))
                                }
                              }}
                            />
                            <span>{symptom.label}</span>
                          </label>
                        )
                      })}
                    </div>
                  )}
                />
              </div>
            </TabsContent>

            {/* Exposure Screening Tab */}
            <TabsContent value="exposure" className="flex-1 overflow-y-auto mt-4 space-y-4">
              <div className="rounded-md bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                <AlertTriangle className="inline h-4 w-4 mr-1.5" />
                Screen for CHO program referrals and special protocols.
              </div>

              {/* Exposure Flags */}
              <div className="space-y-3">
                <Label>Exposure Risk Factors</Label>
                <Controller
                  name="exposureFlags"
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-2">
                      {EXPOSURE_FLAGS.map((flag) => {
                        const isChecked = field.value?.includes(flag.value) || false
                        const colorClasses = {
                          red: "border-red-300 bg-red-50 dark:bg-red-950/30 dark:border-red-900",
                          orange:
                            "border-orange-300 bg-orange-50 dark:bg-orange-950/30 dark:border-orange-900",
                          yellow:
                            "border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30 dark:border-yellow-900",
                          blue: "border-blue-300 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-900",
                          purple:
                            "border-purple-300 bg-purple-50 dark:bg-purple-950/30 dark:border-purple-900",
                        }
                        return (
                          <label
                            key={flag.value}
                            className={cn(
                              "flex items-center justify-between px-3 py-2.5 rounded-md border cursor-pointer transition-colors",
                              isChecked
                                ? colorClasses[flag.color as keyof typeof colorClasses]
                                : "bg-muted/30 border-muted hover:bg-muted/50",
                              isFormDisabled && "opacity-50 cursor-not-allowed"
                            )}
                          >
                            <div className="flex items-center gap-3">
                              <Checkbox
                                checked={isChecked}
                                disabled={isFormDisabled}
                                onCheckedChange={(checked) => {
                                  const current = field.value || []
                                  if (checked) {
                                    field.onChange([...current, flag.value])
                                  } else {
                                    field.onChange(current.filter((v) => v !== flag.value))
                                  }
                                }}
                              />
                              <span className="font-medium text-sm">{flag.label}</span>
                            </div>
                            {flag.alert && (
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-xs",
                                  flag.color === "red" &&
                                    "border-red-400 text-red-600 dark:text-red-400",
                                  flag.color === "orange" &&
                                    "border-orange-400 text-orange-600 dark:text-orange-400",
                                  flag.color === "yellow" &&
                                    "border-yellow-500 text-yellow-700 dark:text-yellow-400",
                                  flag.color === "purple" &&
                                    "border-purple-400 text-purple-600 dark:text-purple-400"
                                )}
                              >
                                {flag.alert}
                              </Badge>
                            )}
                          </label>
                        )
                      })}
                    </div>
                  )}
                />
              </div>

              {/* Exposure Notes */}
              <div className="space-y-2">
                <Label htmlFor="exposureNotes">Exposure Details (Optional)</Label>
                <Textarea
                  id="exposureNotes"
                  placeholder="Describe exposure circumstances, dates, locations..."
                  {...form.register("exposureNotes")}
                  disabled={isFormDisabled}
                  rows={3}
                />
              </div>
            </TabsContent>

            {/* Patient Background Tab */}
            <TabsContent value="background" className="flex-1 overflow-y-auto mt-4">
              {selectedEncounter && patient ? (
                <PatientBackgroundForm
                  key={patient.id}
                  patientId={patient.id}
                  patientSex={patient.sex}
                  initialData={{
                    isSmoker: patient.isSmoker ?? null,
                    smokingPackYears: patient.smokingPackYears ?? null,
                    isAlcohol: patient.isAlcohol ?? null,
                    pregnancyStatus: patient.pregnancyStatus ?? null,
                    pregnancyWeeks: patient.pregnancyWeeks ?? null,
                    medicalHistoryData: patient.medicalHistoryData as Record<string, unknown> | null,
                    familyHistoryData: patient.familyHistoryData as Record<string, unknown> | null,
                  }}
                  disabled={isFormDisabled}
                />
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Select a patient to view/edit medical history
                </div>
              )}
            </TabsContent>

            {/* Submit Button - Always visible */}
            <div className="flex-shrink-0 pt-4 mt-auto border-t">
              {errors.root && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive mb-3">
                  {errors.root.message}
                </div>
              )}

              <div className="flex items-center justify-between gap-3">
                <div className="flex gap-1.5">
                  {(["vitals", "hpi", "exposure"] as const).map((tab) => (
                    <div
                      key={tab}
                      className={cn(
                        "w-2 h-2 rounded-full transition-colors",
                        completedSections.has(tab) ? "bg-emerald-500" : "bg-muted-foreground/30"
                      )}
                      title={`${tab} ${completedSections.has(tab) ? "complete" : "incomplete"}`}
                    />
                  ))}
                </div>
                <Button type="submit" disabled={isSubmitDisabled} className="flex-1 max-w-xs">
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Complete Triage
                </Button>
              </div>
            </div>
          </form>
        </Tabs>
      </CardContent>
    </Card>
  )
}
