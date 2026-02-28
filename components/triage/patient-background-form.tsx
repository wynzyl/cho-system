"use client"

import { useState, useTransition, useMemo } from "react"
import {
  Cigarette,
  Wine,
  Baby,
  Heart,
  Users,
  Pill,
  Syringe,
  Scissors,
  Plus,
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
  diagnosedYear?: number | null
  isControlled?: boolean | null
  notes?: string | null
}

interface Surgery {
  name: string
  year?: number | null
  notes?: string | null
}

interface Medication {
  name: string
  dosage?: string | null
  frequency?: string | null
  purpose?: string | null
}

interface Immunization {
  name: string
  date?: string | null
  notes?: string | null
}

interface FamilyHistoryItem {
  present: boolean
  relation?: string | null
  notes?: string | null
}

interface MedicalHistoryData {
  version?: number
  conditions?: MedicalCondition[]
  surgeries?: Surgery[]
  currentMedications?: Medication[]
  immunizations?: Immunization[]
}

interface FamilyHistoryData {
  version?: number
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

export function PatientBackgroundForm({
  patientId,
  patientSex,
  initialData,
  disabled = false,
}: PatientBackgroundFormProps) {
  const [isPending, startTransition] = useTransition()
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Parse initial data
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

  // Lifestyle state
  const [isSmoker, setIsSmoker] = useState<boolean | null>(initialData.isSmoker)
  const [smokingPackYears, setSmokingPackYears] = useState<number | null>(
    initialData.smokingPackYears
  )
  const [isAlcohol, setIsAlcohol] = useState<boolean | null>(initialData.isAlcohol)
  const [pregnancyStatus, setPregnancyStatus] = useState<string | null>(initialData.pregnancyStatus)
  const [pregnancyWeeks, setPregnancyWeeks] = useState<number | null>(initialData.pregnancyWeeks)

  // Medical history state
  const [conditions, setConditions] = useState<MedicalCondition[]>(medicalData.conditions || [])
  const [surgeries, setSurgeries] = useState<Surgery[]>(medicalData.surgeries || [])
  const [medications, setMedications] = useState<Medication[]>(medicalData.currentMedications || [])
  const [immunizations, setImmunizations] = useState<Immunization[]>(
    medicalData.immunizations || []
  )

  // Family history state
  const [familyHistory, setFamilyHistory] =
    useState<Record<string, FamilyHistoryItem>>(initialFamilyHistory)
  const [familyOther, setFamilyOther] = useState<string>(familyData.other || "")

  // New item inputs
  const [newMedication, setNewMedication] = useState("")
  const [newSurgery, setNewSurgery] = useState("")

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
        familyHistoryData: {
          version: 1,
          ...familyHistory,
          other: familyOther || null,
        },
      })

      if (result.ok) {
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        setError(result.error.message)
      }
    })
  }

  const toggleCondition = (code: string, name: string) => {
    setConditions((prev) => {
      const exists = prev.find((c) => c.code === code)
      if (exists) {
        return prev.filter((c) => c.code !== code)
      }
      return [...prev, { code, name }]
    })
  }

  const addMedication = () => {
    if (!newMedication.trim()) return
    setMedications((prev) => [...prev, { name: newMedication.trim() }])
    setNewMedication("")
  }

  const removeMedication = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index))
  }

  const addSurgery = () => {
    if (!newSurgery.trim()) return
    setSurgeries((prev) => [...prev, { name: newSurgery.trim() }])
    setNewSurgery("")
  }

  const removeSurgery = (index: number) => {
    setSurgeries((prev) => prev.filter((_, i) => i !== index))
  }

  const toggleImmunization = (code: string) => {
    setImmunizations((prev) => {
      const exists = prev.find((i) => i.name === code)
      if (exists) {
        return prev.filter((i) => i.name !== code)
      }
      return [...prev, { name: code }]
    })
  }

  const updateFamilyHistory = (key: string, updates: Partial<FamilyHistoryItem>) => {
    setFamilyHistory((prev) => ({
      ...prev,
      [key]: { ...prev[key], ...updates },
    }))
  }

  const isDisabled = disabled || isPending

  return (
    <div className="space-y-6">
      {/* Lifestyle Section */}
      <div className="space-y-4">
        <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
          <Heart className="h-4 w-4" />
          Lifestyle
        </h3>

        <div className="grid gap-4">
          {/* Smoking */}
          <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
            <Cigarette className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Smoking</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isSmoker === true ? "default" : "outline"}
                    size="sm"
                    disabled={isDisabled}
                    onClick={() => setIsSmoker(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={isSmoker === false ? "default" : "outline"}
                    size="sm"
                    disabled={isDisabled}
                    onClick={() => setIsSmoker(false)}
                  >
                    No
                  </Button>
                </div>
              </div>
              {isSmoker && (
                <div className="flex items-center gap-2">
                  <Label className="text-xs text-muted-foreground">Pack years:</Label>
                  <Input
                    type="number"
                    value={smokingPackYears ?? ""}
                    onChange={(e) =>
                      setSmokingPackYears(e.target.value ? parseInt(e.target.value) : null)
                    }
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
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={isAlcohol === true ? "default" : "outline"}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => setIsAlcohol(true)}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={isAlcohol === false ? "default" : "outline"}
                  size="sm"
                  disabled={isDisabled}
                  onClick={() => setIsAlcohol(false)}
                >
                  No
                </Button>
              </div>
            </div>
          </div>

          {/* Pregnancy (Female only) */}
          {patientSex === "Female" && (
            <div className="flex items-start gap-4 p-3 rounded-lg bg-muted/30">
              <Baby className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Pregnancy Status</Label>
                  <Select
                    value={pregnancyStatus || ""}
                    onValueChange={setPregnancyStatus}
                    disabled={isDisabled}
                  >
                    <SelectTrigger className="w-40 h-8">
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      {PREGNANCY_STATUS_OPTIONS.filter((o) => o.value !== "not_applicable").map(
                        (opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                {pregnancyStatus === "pregnant" && (
                  <div className="flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Weeks pregnant:</Label>
                    <Input
                      type="number"
                      value={pregnancyWeeks ?? ""}
                      onChange={(e) =>
                        setPregnancyWeeks(e.target.value ? parseInt(e.target.value) : null)
                      }
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
      </div>

      {/* Medical Conditions */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
          <Pill className="h-4 w-4" />
          Medical Conditions
        </h3>
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
      </div>

      {/* Current Medications */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
          <Pill className="h-4 w-4" />
          Current Medications
        </h3>
        <div className="flex flex-wrap gap-2">
          {medications.map((med, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              {med.name}
              <button
                type="button"
                onClick={() => removeMedication(index)}
                disabled={isDisabled}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add medication..."
            value={newMedication}
            onChange={(e) => setNewMedication(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addMedication())}
            disabled={isDisabled}
            className="h-8"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addMedication}
            disabled={isDisabled || !newMedication.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Previous Surgeries */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
          <Scissors className="h-4 w-4" />
          Previous Surgeries
        </h3>
        <div className="flex flex-wrap gap-2">
          {surgeries.map((surgery, index) => (
            <Badge key={index} variant="secondary" className="gap-1 pr-1">
              {surgery.name}
              <button
                type="button"
                onClick={() => removeSurgery(index)}
                disabled={isDisabled}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add surgery..."
            value={newSurgery}
            onChange={(e) => setNewSurgery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSurgery())}
            disabled={isDisabled}
            className="h-8"
          />
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={addSurgery}
            disabled={isDisabled || !newSurgery.trim()}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Immunizations */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
          <Syringe className="h-4 w-4" />
          Immunizations
        </h3>
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
      </div>

      {/* Family History */}
      <div className="space-y-3">
        <h3 className="font-medium text-sm flex items-center gap-2 text-muted-foreground uppercase tracking-wide">
          <Users className="h-4 w-4" />
          Family History
        </h3>
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
                  onCheckedChange={(checked) =>
                    updateFamilyHistory(condition.key, { present: !!checked })
                  }
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
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
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
      </div>

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
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Background
        </Button>
      </div>
    </div>
  )
}
