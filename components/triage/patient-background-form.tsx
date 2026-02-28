"use client"

import { useState, useTransition, useMemo, useRef, useEffect } from "react"
import {
  Cigarette,
  Wine,
  Baby,
  Heart,
  Users,
  Pill,
  Syringe,
  Scissors,
  X,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { BackgroundSection, YesNoToggle, AddItemInput } from "@/components/forms"
import { updatePatientBackgroundAction } from "@/actions/triage"
import {
  COMMON_MEDICAL_CONDITIONS,
  FAMILY_HISTORY_CONDITIONS,
  FAMILY_RELATION_OPTIONS,
  COMMON_IMMUNIZATIONS,
  PREGNANCY_STATUS_OPTIONS,
} from "@/lib/constants/consultation"
import { cn } from "@/lib/utils"

interface MedicalCondition {
  code: string
  name: string
}

interface Surgery {
  name: string
}

interface Medication {
  name: string
}

interface Immunization {
  name: string
}

interface FamilyHistoryItem {
  present: boolean
  relation?: string | null
}

interface MedicalHistoryData {
  conditions?: MedicalCondition[]
  surgeries?: Surgery[]
  currentMedications?: Medication[]
  immunizations?: Immunization[]
}

interface FamilyHistoryData {
  diabetes?: FamilyHistoryItem | null
  hypertension?: FamilyHistoryItem | null
  cancer?: FamilyHistoryItem | null
  heartDisease?: FamilyHistoryItem | null
  stroke?: FamilyHistoryItem | null
  asthma?: FamilyHistoryItem | null
  mentalHealth?: FamilyHistoryItem | null
  other?: string | null
}

interface PatientBackgroundFormProps {
  patientId: string
  patientSex: string
  initialData: {
    isSmoker: boolean | null
    smokingPackYears: number | null
    isAlcohol: boolean | null
    pregnancyStatus: string | null
    pregnancyWeeks: number | null
    medicalHistoryData: Record<string, unknown> | null
    familyHistoryData: Record<string, unknown> | null
  }
  disabled?: boolean
}

// Reusable item list with remove buttons
function ItemList({
  items,
  onRemove,
  disabled,
}: {
  items: { name: string }[]
  onRemove: (index: number) => void
  disabled: boolean
}) {
  if (items.length === 0) return null
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <Badge key={index} variant="secondary" className="gap-1 pr-1">
          {item.name}
          <button
            type="button"
            onClick={() => onRemove(index)}
            disabled={disabled}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}

export function PatientBackgroundForm({
  patientId,
  patientSex,
  initialData,
  disabled = false,
}: PatientBackgroundFormProps) {
  const [isPending, startTransition] = useTransition()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const saveSuccessTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (saveSuccessTimeoutRef.current) clearTimeout(saveSuccessTimeoutRef.current)
    }
  }, [])

  const medicalData = useMemo(
    () => (initialData.medicalHistoryData as MedicalHistoryData) || {},
    [initialData.medicalHistoryData]
  )
  const familyData = useMemo(
    () => (initialData.familyHistoryData as FamilyHistoryData) || {},
    [initialData.familyHistoryData]
  )

  const initialFamilyHistory = useMemo(() => {
    const initial: Record<string, FamilyHistoryItem> = {}
    FAMILY_HISTORY_CONDITIONS.forEach((c) => {
      const existing = familyData[c.key as keyof FamilyHistoryData]
      if (existing && typeof existing === "object" && "present" in existing) {
        initial[c.key] = existing as FamilyHistoryItem
      } else {
        initial[c.key] = { present: false }
      }
    })
    return initial
  }, [familyData])

  // State
  const [isSmoker, setIsSmoker] = useState<boolean | null>(initialData.isSmoker)
  const [smokingPackYears, setSmokingPackYears] = useState<number | null>(initialData.smokingPackYears)
  const [isAlcohol, setIsAlcohol] = useState<boolean | null>(initialData.isAlcohol)
  const [pregnancyStatus, setPregnancyStatus] = useState<string | null>(initialData.pregnancyStatus)
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number | null>(initialData.pregnancyWeeks)
  const [conditions, setConditions] = useState<MedicalCondition[]>(medicalData.conditions || [])
  const [surgeries, setSurgeries] = useState<Surgery[]>(medicalData.surgeries || [])
  const [medications, setMedications] = useState<Medication[]>(medicalData.currentMedications || [])
  const [immunizations, setImmunizations] = useState<Immunization[]>(medicalData.immunizations || [])
  const [familyHistory, setFamilyHistory] = useState<Record<string, FamilyHistoryItem>>(initialFamilyHistory)
  const [familyOther, setFamilyOther] = useState<string>(familyData.other || "")

  const isDisabled = disabled || isPending

  const handleSave = () => {
    setError(null)
    setSaveSuccess(false)

    startTransition(async () => {
      const result = await updatePatientBackgroundAction({
        patientId,
        isSmoker,
        smokingPackYears: isSmoker ? smokingPackYears : null,
        isAlcohol,
        pregnancyStatus: patientSex === "Female" ? pregnancyStatus : null,
        pregnancyWeeks: pregnancyStatus === "pregnant" ? pregnancyWeeks : null,
        medicalHistoryData: {
          version: 1,
          conditions,
          surgeries,
          currentMedications: medications,
          immunizations,
        },
        familyHistoryData: { version: 1, ...familyHistory, other: familyOther || null },
      })

      if (result.ok) {
        setSaveSuccess(true)
        if (saveSuccessTimeoutRef.current) clearTimeout(saveSuccessTimeoutRef.current)
        saveSuccessTimeoutRef.current = setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setError(result.error.message)
      }
    })
  }

  const toggleCondition = (code: string, name: string) => {
    setConditions((prev) =>
      prev.some((c) => c.code === code)
        ? prev.filter((c) => c.code !== code)
        : [...prev, { code, name }]
    )
  }

  const toggleImmunization = (code: string) => {
    setImmunizations((prev) =>
      prev.some((i) => i.name === code)
        ? prev.filter((i) => i.name !== code)
        : [...prev, { name: code }]
    )
  }

  const updateFamilyHistory = (key: string, updates: Partial<FamilyHistoryItem>) => {
    setFamilyHistory((prev) => ({ ...prev, [key]: { ...prev[key], ...updates } }))
  }

  return (
    <div className="space-y-6">
      {/* Lifestyle */}
      <BackgroundSection icon={Heart} title="Lifestyle">
        <div className="grid gap-4">
          {/* Smoking */}
          <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
            <Cigarette className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Smoking</Label>
                <YesNoToggle value={isSmoker} onChange={setIsSmoker} disabled={isDisabled} />
              </div>
              {isSmoker && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Pack years:</Label>
                  <Input
                    type="number"
                    value={smokingPackYears ?? ""}
                    onChange={(e) => setSmokingPackYears(e.target.value ? parseInt(e.target.value) : null)}
                    disabled={isDisabled}
                    className="w-20 h-8"
                    min={0}
                    max={100}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Alcohol */}
          <div className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
            <Wine className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 flex items-center justify-between">
              <Label className="text-sm font-medium">Alcohol Use</Label>
              <YesNoToggle value={isAlcohol} onChange={setIsAlcohol} disabled={isDisabled} />
            </div>
          </div>

          {/* Pregnancy */}
          {patientSex === "Female" && (
            <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
              <Baby className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Pregnancy Status</Label>
                  <Select value={pregnancyStatus || ""} onValueChange={setPregnancyStatus} disabled={isDisabled}>
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PREGNANCY_STATUS_OPTIONS.filter((o) => o.value !== "not_applicable").map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {pregnancyStatus === "pregnant" && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Weeks:</Label>
                    <Input
                      type="number"
                      value={pregnancyWeeks ?? ""}
                      onChange={(e) => setPregnancyWeeks(e.target.value ? parseInt(e.target.value) : null)}
                      disabled={isDisabled}
                      className="w-20 h-8"
                      min={1}
                      max={45}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </BackgroundSection>

      {/* Medical Conditions */}
      <BackgroundSection icon={Pill} title="Medical Conditions">
        <div className="flex flex-wrap gap-2">
          {COMMON_MEDICAL_CONDITIONS.map((condition) => {
            const isSelected = conditions.some((c) => c.code === condition.code)
            return (
              <button
                key={condition.code}
                type="button"
                disabled={isDisabled}
                onClick={() => toggleCondition(condition.code, condition.name)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-colors border",
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-muted/50 text-muted-foreground border-transparent hover:bg-muted",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {condition.name}
              </button>
            )
          })}
        </div>
      </BackgroundSection>

      {/* Current Medications */}
      <BackgroundSection icon={Pill} title="Current Medications">
        <ItemList
          items={medications}
          onRemove={(i) => setMedications((prev) => prev.filter((_, idx) => idx !== i))}
          disabled={isDisabled}
        />
        <AddItemInput
          placeholder="Add medication..."
          onAdd={(name) => setMedications((prev) => [...prev, { name }])}
          disabled={isDisabled}
        />
      </BackgroundSection>

      {/* Previous Surgeries */}
      <BackgroundSection icon={Scissors} title="Previous Surgeries">
        <ItemList
          items={surgeries}
          onRemove={(i) => setSurgeries((prev) => prev.filter((_, idx) => idx !== i))}
          disabled={isDisabled}
        />
        <AddItemInput
          placeholder="Add surgery..."
          onAdd={(name) => setSurgeries((prev) => [...prev, { name }])}
          disabled={isDisabled}
        />
      </BackgroundSection>

      {/* Immunizations */}
      <BackgroundSection icon={Syringe} title="Immunizations">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {COMMON_IMMUNIZATIONS.map((vaccine) => {
            const isSelected = immunizations.some((i) => i.name === vaccine.code)
            return (
              <label
                key={vaccine.code}
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors text-sm",
                  isSelected
                    ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300"
                    : "bg-muted/30 border-transparent hover:bg-muted/50",
                  isDisabled && "opacity-50 cursor-not-allowed"
                )}
              >
                <Checkbox
                  checked={isSelected}
                  disabled={isDisabled}
                  onCheckedChange={() => toggleImmunization(vaccine.code)}
                />
                <span>{vaccine.name}</span>
              </label>
            )
          })}
        </div>
      </BackgroundSection>

      {/* Family History */}
      <BackgroundSection icon={Users} title="Family History">
        <div className="space-y-2">
          {FAMILY_HISTORY_CONDITIONS.map((condition) => {
            const item = familyHistory[condition.key] || { present: false }
            return (
              <div
                key={condition.key}
                className={cn(
                  "flex items-center gap-3 p-2.5 rounded-md border transition-colors",
                  item.present
                    ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
                    : "bg-muted/30 border-transparent"
                )}
              >
                <Checkbox
                  checked={item.present}
                  disabled={isDisabled}
                  onCheckedChange={(checked) => updateFamilyHistory(condition.key, { present: !!checked })}
                />
                <span className="flex-1 text-sm font-medium">{condition.label}</span>
                {item.present && (
                  <Select
                    value={item.relation || ""}
                    onValueChange={(value) => updateFamilyHistory(condition.key, { relation: value })}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="w-36 h-7 text-xs">
                      <SelectValue placeholder="Relation..." />
                    </SelectTrigger>
                    <SelectContent>
                      {FAMILY_RELATION_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )
          })}
        </div>
        <Input
          placeholder="Other family conditions..."
          value={familyOther}
          onChange={(e) => setFamilyOther(e.target.value)}
          disabled={isDisabled}
          className="h-8"
        />
      </BackgroundSection>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2 border-t">
        {error && <p className="text-sm text-destructive">{error}</p>}
        {saveSuccess && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
            <CheckCircle2 className="h-4 w-4" />
            Saved
          </p>
        )}
        <div className="flex-1" />
        <Button type="button" onClick={handleSave} disabled={isDisabled} variant="secondary">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Background
        </Button>
      </div>
    </div>
  )
}
