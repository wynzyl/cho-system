"use client"

import { useState, useTransition } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  CHRONIC_CONDITIONS,
  PREGNANCY_STATUS_OPTIONS,
  FAMILY_HISTORY_ITEMS,
} from "@/lib/constants"
import type {
  MedicalHistoryData,
  FamilyHistoryData,
} from "@/lib/types/consultation"
import {
  HeartPulse,
  Baby,
  Cigarette,
  Wine,
  Users,
  ChevronDown,
  Loader2,
  Save,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { updatePatientBackgroundAction } from "@/actions/triage"

interface PatientBackgroundSectionProps {
  patientId: string
  patientSex: string
  // Current values from patient record
  isSmoker?: boolean | null
  smokingPackYears?: number | null
  isAlcohol?: boolean | null
  pregnancyStatus?: string | null
  pregnancyWeeks?: number | null
  medicalHistoryData?: MedicalHistoryData | null
  familyHistoryData?: FamilyHistoryData | null
  disabled?: boolean
  onUpdate?: () => void
}

export function PatientBackgroundSection({
  patientId,
  patientSex,
  isSmoker: initialSmoker,
  smokingPackYears: initialPackYears,
  isAlcohol: initialAlcohol,
  pregnancyStatus: initialPregnancyStatus,
  pregnancyWeeks: initialPregnancyWeeks,
  medicalHistoryData: initialMedicalHistory,
  familyHistoryData: initialFamilyHistory,
  disabled = false,
  onUpdate,
}: PatientBackgroundSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)

  // Local state for edits
  const [isSmoker, setIsSmoker] = useState(initialSmoker ?? false)
  const [smokingPackYears, setSmokingPackYears] = useState(initialPackYears ?? 0)
  const [isAlcohol, setIsAlcohol] = useState(initialAlcohol ?? false)
  const [pregnancyStatus, setPregnancyStatus] = useState(initialPregnancyStatus ?? "not_applicable")
  const [pregnancyWeeks, setPregnancyWeeks] = useState(initialPregnancyWeeks ?? 0)

  // Chronic conditions (simplified - just code tracking)
  const [selectedConditions, setSelectedConditions] = useState<string[]>(
    initialMedicalHistory?.conditions?.map((c) => c.code) ?? []
  )

  // Family history
  const [familyHistory, setFamilyHistory] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {}
    FAMILY_HISTORY_ITEMS.forEach((item) => {
      const key = item.value as keyof FamilyHistoryData
      const entry = initialFamilyHistory?.[key]
      initial[item.value] = typeof entry === "object" && "present" in entry ? entry.present : false
    })
    return initial
  })

  const isFemale = patientSex === "FEMALE"

  const toggleCondition = (code: string) => {
    setSelectedConditions((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    )
  }

  const toggleFamilyHistory = (key: string) => {
    setFamilyHistory((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const handleSave = () => {
    startTransition(async () => {
      // Build medical history data
      const medicalHistoryData: MedicalHistoryData = {
        version: 1,
        conditions: selectedConditions.map((code) => {
          const condition = CHRONIC_CONDITIONS.find((c) => c.value === code)
          return {
            code,
            name: condition?.label ?? code,
            isActive: true,
          }
        }),
        surgeries: initialMedicalHistory?.surgeries ?? [],
        currentMedications: initialMedicalHistory?.currentMedications ?? [],
        immunizations: initialMedicalHistory?.immunizations ?? [],
      }

      // Build family history data
      const familyHistoryData: FamilyHistoryData = {
        version: 1,
        diabetes: { present: familyHistory.diabetes ?? false },
        hypertension: { present: familyHistory.hypertension ?? false },
        cancer: { present: familyHistory.cancer ?? false },
        heartDisease: { present: familyHistory.heartDisease ?? false },
        stroke: { present: familyHistory.stroke ?? false },
        asthma: { present: familyHistory.asthma ?? false },
        mentalIllness: { present: familyHistory.mentalIllness ?? false },
        kidneyDisease: { present: familyHistory.kidneyDisease ?? false },
      }

      const result = await updatePatientBackgroundAction({
        patientId,
        isSmoker,
        smokingPackYears: isSmoker ? smokingPackYears : null,
        isAlcohol,
        pregnancyStatus: isFemale ? pregnancyStatus : "not_applicable",
        pregnancyWeeks: pregnancyStatus === "pregnant" ? pregnancyWeeks : null,
        medicalHistoryData,
        familyHistoryData,
      })

      if (result.ok) {
        onUpdate?.()
      }
    })
  }

  const hasChanges = true // Simplified - always allow save

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border p-4">
        <CollapsibleTrigger asChild>
          <Button
            variant="ghost"
            className="flex w-full items-center justify-between p-0 hover:bg-transparent"
          >
            <h3 className="flex items-center gap-2 font-medium">
              <HeartPulse className="h-4 w-4 text-purple-500" />
              Patient Background
              {selectedConditions.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {selectedConditions.length} condition{selectedConditions.length > 1 ? "s" : ""}
                </Badge>
              )}
            </h3>
            <ChevronDown
              className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")}
            />
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="mt-4 space-y-6">
          {/* Lifestyle Section */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Lifestyle</h4>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Smoking */}
              <div className="space-y-3 rounded-md border p-3">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2">
                    <Cigarette className="h-4 w-4" />
                    Smoker
                  </Label>
                  <Switch
                    checked={isSmoker}
                    onCheckedChange={setIsSmoker}
                    disabled={disabled}
                  />
                </div>
                {isSmoker && (
                  <div className="space-y-1">
                    <Label className="text-xs">Pack Years</Label>
                    <Input
                      type="number"
                      value={smokingPackYears}
                      onChange={(e) => setSmokingPackYears(parseInt(e.target.value) || 0)}
                      disabled={disabled}
                      className="h-8"
                      min={0}
                      max={200}
                    />
                  </div>
                )}
              </div>

              {/* Alcohol */}
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label className="flex items-center gap-2">
                  <Wine className="h-4 w-4" />
                  Alcohol Use
                </Label>
                <Switch
                  checked={isAlcohol}
                  onCheckedChange={setIsAlcohol}
                  disabled={disabled}
                />
              </div>

              {/* Pregnancy (females only) */}
              {isFemale && (
                <div className="space-y-3 rounded-md border p-3 sm:col-span-2">
                  <Label className="flex items-center gap-2">
                    <Baby className="h-4 w-4" />
                    Pregnancy Status
                  </Label>
                  <div className="flex gap-3">
                    <Select
                      value={pregnancyStatus}
                      onValueChange={setPregnancyStatus}
                      disabled={disabled}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PREGNANCY_STATUS_OPTIONS.filter((o) => o.value !== "not_applicable").map(
                          (option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          )
                        )}
                      </SelectContent>
                    </Select>
                    {pregnancyStatus === "pregnant" && (
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={pregnancyWeeks}
                          onChange={(e) => setPregnancyWeeks(parseInt(e.target.value) || 0)}
                          disabled={disabled}
                          className="h-9 w-20"
                          min={1}
                          max={45}
                        />
                        <span className="text-sm text-muted-foreground">weeks</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chronic Conditions */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Chronic Conditions</h4>
            <div className="flex flex-wrap gap-2">
              {CHRONIC_CONDITIONS.map((condition) => {
                const isSelected = selectedConditions.includes(condition.value)
                return (
                  <Badge
                    key={condition.value}
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                    onClick={() => !disabled && toggleCondition(condition.value)}
                  >
                    {condition.label}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Family History */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Users className="h-4 w-4" />
              Family History
            </h4>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
              {FAMILY_HISTORY_ITEMS.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`fh-${item.value}`}
                    checked={familyHistory[item.value] ?? false}
                    onCheckedChange={() => toggleFamilyHistory(item.value)}
                    disabled={disabled}
                  />
                  <label
                    htmlFor={`fh-${item.value}`}
                    className={cn(
                      "text-sm leading-none",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {item.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={disabled || isPending || !hasChanges}
            className="w-full"
            variant="secondary"
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Background
          </Button>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
