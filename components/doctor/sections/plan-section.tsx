"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Pill,
  FlaskConical,
  Syringe,
  MessageSquare,
  Calendar,
  Plus,
  X,
  Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  addPrescriptionAction,
  addLabOrderAction,
  type PrescriptionForConsult,
  type LabOrderForConsult,
} from "@/actions/doctor"
import {
  COMMON_PROCEDURES,
  COMMON_ADVICE,
  COMMON_LAB_TESTS,
} from "@/lib/constants"
import type { ProceduresData, AdviceData, ProcedureEntry } from "@/lib/types/consultation"

interface PlanSectionProps {
  encounterId: string
  prescriptions: PrescriptionForConsult[]
  labOrders: LabOrderForConsult[]
  proceduresData: ProceduresData | null
  adviceData: AdviceData | null
  onProceduresChange: (data: ProceduresData) => void
  onAdviceChange: (data: AdviceData) => void
  onPrescriptionAdded: () => void
  onLabOrderAdded: () => void
  disabled?: boolean
}

interface MedicationItem {
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  quantity: number
  instructions: string
}

interface LabItem {
  testName: string
  testCode: string
  notes: string
}

export function PlanSection({
  encounterId,
  prescriptions,
  labOrders,
  proceduresData,
  adviceData,
  onProceduresChange,
  onAdviceChange,
  onPrescriptionAdded,
  onLabOrderAdded,
  disabled = false,
}: PlanSectionProps) {
  const [isPending, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<"meds" | "labs" | "procedures" | "advice">("meds")

  // Medication form state
  const [medications, setMedications] = useState<MedicationItem[]>([
    { medicineName: "", dosage: "", frequency: "", duration: "", quantity: 0, instructions: "" },
  ])

  // Lab order form state
  const [labItems, setLabItems] = useState<LabItem[]>([
    { testName: "", testCode: "", notes: "" },
  ])

  // Current data
  const currentProcedures: ProceduresData = proceduresData ?? { version: 1, procedures: [] }
  const currentAdvice: AdviceData = adviceData ?? { version: 1, instructions: [] }

  // Medication handlers
  const addMedicationRow = () => {
    setMedications([
      ...medications,
      { medicineName: "", dosage: "", frequency: "", duration: "", quantity: 0, instructions: "" },
    ])
  }

  const removeMedicationRow = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  const updateMedication = (index: number, field: keyof MedicationItem, value: string | number) => {
    const updated = [...medications]
    updated[index] = { ...updated[index], [field]: value }
    setMedications(updated)
  }

  const submitPrescription = () => {
    const validMeds = medications.filter((m) => m.medicineName.trim())
    if (validMeds.length === 0) return

    startTransition(async () => {
      const result = await addPrescriptionAction({
        encounterId,
        items: validMeds.map((m) => ({
          medicineName: m.medicineName,
          dosage: m.dosage || null,
          frequency: m.frequency || null,
          duration: m.duration || null,
          quantity: m.quantity || null,
          instructions: m.instructions || null,
        })),
      })

      if (result.ok) {
        setMedications([
          { medicineName: "", dosage: "", frequency: "", duration: "", quantity: 0, instructions: "" },
        ])
        onPrescriptionAdded()
      }
    })
  }

  // Lab handlers
  const addLabRow = () => {
    setLabItems([...labItems, { testName: "", testCode: "", notes: "" }])
  }

  const removeLabRow = (index: number) => {
    setLabItems(labItems.filter((_, i) => i !== index))
  }

  const updateLabItem = (index: number, field: keyof LabItem, value: string) => {
    const updated = [...labItems]
    updated[index] = { ...updated[index], [field]: value }
    setLabItems(updated)
  }

  const selectCommonTest = (test: (typeof COMMON_LAB_TESTS)[number]) => {
    const emptyIndex = labItems.findIndex((l) => !l.testName.trim())
    if (emptyIndex >= 0) {
      updateLabItem(emptyIndex, "testName", test.label)
      updateLabItem(emptyIndex, "testCode", test.value)
    } else {
      setLabItems([...labItems, { testName: test.label, testCode: test.value, notes: "" }])
    }
  }

  const submitLabOrder = () => {
    const validLabs = labItems.filter((l) => l.testName.trim())
    if (validLabs.length === 0) return

    startTransition(async () => {
      const result = await addLabOrderAction({
        encounterId,
        items: validLabs.map((l) => ({
          testName: l.testName,
          testCode: l.testCode || null,
          notes: l.notes || null,
        })),
      })

      if (result.ok) {
        setLabItems([{ testName: "", testCode: "", notes: "" }])
        onLabOrderAdded()
      }
    })
  }

  // Procedure handlers
  const toggleProcedure = (procedureCode: string, procedureName: string) => {
    const exists = currentProcedures.procedures.find((p) => p.code === procedureCode)
    let newProcedures: ProcedureEntry[]

    if (exists) {
      newProcedures = currentProcedures.procedures.filter((p) => p.code !== procedureCode)
    } else {
      newProcedures = [
        ...currentProcedures.procedures,
        { code: procedureCode, name: procedureName, performedAt: new Date().toISOString() },
      ]
    }

    onProceduresChange({ ...currentProcedures, procedures: newProcedures })
  }

  // Advice handlers
  const toggleAdvice = (advice: string) => {
    const exists = currentAdvice.instructions.includes(advice)
    let newInstructions: string[]

    if (exists) {
      newInstructions = currentAdvice.instructions.filter((a) => a !== advice)
    } else {
      newInstructions = [...currentAdvice.instructions, advice]
    }

    onAdviceChange({ ...currentAdvice, instructions: newInstructions })
  }

  const tabs = [
    { id: "meds" as const, label: "Medications", icon: Pill, count: prescriptions.length },
    { id: "labs" as const, label: "Lab Orders", icon: FlaskConical, count: labOrders.length },
    { id: "procedures" as const, label: "Procedures", icon: Syringe, count: currentProcedures.procedures.length },
    { id: "advice" as const, label: "Advice", icon: MessageSquare, count: currentAdvice.instructions.length },
  ]

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Pill className="h-5 w-5 text-green-600" />
        <h3 className="font-semibold">Treatment Plan</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-white shadow dark:bg-slate-700"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
            {tab.count > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tab.count}
              </Badge>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="rounded-lg border bg-white p-4 dark:bg-slate-900">
        {/* Medications Tab */}
        {activeTab === "meds" && (
          <div className="space-y-4">
            {/* Existing Prescriptions */}
            {prescriptions.length > 0 && (
              <div className="mb-4 space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Added Prescriptions
                </Label>
                {prescriptions.map((rx) => (
                  <div key={rx.id} className="rounded-md border bg-slate-50 p-3 dark:bg-slate-800">
                    <div className="space-y-1">
                      {rx.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2 text-sm">
                          <Badge variant="outline" className="shrink-0">
                            Rx
                          </Badge>
                          <span className="font-medium">{item.medicineName}</span>
                          {item.dosage && <span className="text-muted-foreground">{item.dosage}</span>}
                          {item.frequency && <span className="text-muted-foreground">{item.frequency}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New Medication Form */}
            <div className="space-y-3">
              {medications.map((med, index) => (
                <div key={index} className="rounded-md border p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium">Medication {index + 1}</span>
                    {medications.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => removeMedicationRow(index)}
                        disabled={disabled}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Input
                      placeholder="Medicine name *"
                      value={med.medicineName}
                      onChange={(e) => updateMedication(index, "medicineName", e.target.value)}
                      disabled={disabled}
                    />
                    <Input
                      placeholder="Dosage (e.g., 500mg)"
                      value={med.dosage}
                      onChange={(e) => updateMedication(index, "dosage", e.target.value)}
                      disabled={disabled}
                    />
                    <Input
                      placeholder="Frequency (e.g., TID)"
                      value={med.frequency}
                      onChange={(e) => updateMedication(index, "frequency", e.target.value)}
                      disabled={disabled}
                    />
                    <Input
                      placeholder="Duration (e.g., 7 days)"
                      value={med.duration}
                      onChange={(e) => updateMedication(index, "duration", e.target.value)}
                      disabled={disabled}
                    />
                  </div>
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addMedicationRow} disabled={disabled}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add More
                </Button>
                <Button
                  size="sm"
                  onClick={submitPrescription}
                  disabled={disabled || isPending || !medications.some((m) => m.medicineName.trim())}
                >
                  {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  Save Prescription
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Labs Tab */}
        {activeTab === "labs" && (
          <div className="space-y-4">
            {/* Common Tests Quick Select */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Quick Select
              </Label>
              <div className="flex flex-wrap gap-1.5">
                {COMMON_LAB_TESTS.slice(0, 10).map((test) => (
                  <Badge
                    key={test.value}
                    variant="outline"
                    className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => selectCommonTest(test)}
                  >
                    {test.label}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Existing Lab Orders */}
            {labOrders.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                  Ordered Tests
                </Label>
                {labOrders.map((lo) => (
                  <div key={lo.id} className="rounded-md border bg-slate-50 p-3 dark:bg-slate-800">
                    <div className="flex flex-wrap gap-1">
                      {lo.items.map((item) => (
                        <Badge key={item.id} variant="secondary">
                          {item.testName}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* New Lab Order Form */}
            <div className="space-y-3">
              {labItems.map((lab, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    placeholder="Test name *"
                    value={lab.testName}
                    onChange={(e) => updateLabItem(index, "testName", e.target.value)}
                    disabled={disabled}
                    className="flex-1"
                  />
                  {labItems.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => removeLabRow(index)}
                      disabled={disabled}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={addLabRow} disabled={disabled}>
                  <Plus className="mr-1 h-3 w-3" />
                  Add Test
                </Button>
                <Button
                  size="sm"
                  onClick={submitLabOrder}
                  disabled={disabled || isPending || !labItems.some((l) => l.testName.trim())}
                >
                  {isPending && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                  Order Labs
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Procedures Tab */}
        {activeTab === "procedures" && (
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {COMMON_PROCEDURES.map((proc) => {
                const isSelected = currentProcedures.procedures.some((p) => p.code === proc.value)
                return (
                  <label
                    key={proc.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border p-3 transition-colors",
                      isSelected
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800",
                      disabled && "cursor-not-allowed opacity-50"
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleProcedure(proc.value, proc.label)}
                      disabled={disabled}
                    />
                    <span className={cn("text-sm", isSelected && "font-medium")}>{proc.label}</span>
                  </label>
                )
              })}
            </div>
          </div>
        )}

        {/* Advice Tab */}
        {activeTab === "advice" && (
          <div className="space-y-4">
            {/* Common Advice Quick Select */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                Select Instructions
              </Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {COMMON_ADVICE.map((adv) => {
                  const isSelected = currentAdvice.instructions.includes(adv.label)
                  return (
                    <label
                      key={adv.value}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-2.5 text-sm transition-colors",
                        isSelected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800",
                        disabled && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleAdvice(adv.label)}
                        disabled={disabled}
                      />
                      <span className={cn(isSelected && "font-medium")}>{adv.label}</span>
                    </label>
                  )
                })}
              </div>
            </div>

            {/* Custom Instructions */}
            <div className="space-y-2">
              <Label htmlFor="custom-instructions">Additional Instructions</Label>
              <Textarea
                id="custom-instructions"
                value={currentAdvice.customInstructions ?? ""}
                onChange={(e) =>
                  onAdviceChange({ ...currentAdvice, customInstructions: e.target.value })
                }
                disabled={disabled}
                placeholder="Any additional instructions for the patient..."
                rows={2}
              />
            </div>

            {/* Follow-up */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Follow-up Date
              </Label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={currentAdvice.followUpDate ?? ""}
                  onChange={(e) => onAdviceChange({ ...currentAdvice, followUpDate: e.target.value })}
                  disabled={disabled}
                  className="w-auto"
                />
                <Input
                  placeholder="Follow-up notes"
                  value={currentAdvice.followUpNotes ?? ""}
                  onChange={(e) =>
                    onAdviceChange({ ...currentAdvice, followUpNotes: e.target.value })
                  }
                  disabled={disabled}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
