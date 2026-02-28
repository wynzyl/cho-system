"use client"

import { useState } from "react"
import { Plus, X, Loader2, Pill, FlaskConical, Stethoscope, MessageSquare, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"
import {
  COMMON_LAB_TESTS,
  COMMON_PROCEDURES,
  COMMON_ADVICE,
} from "@/lib/constants"
import { addPrescriptionAction, addLabOrderAction } from "@/actions/doctor"
import type { PrescriptionForConsult, LabOrderForConsult } from "@/actions/doctor"
import type { ProceduresData, AdviceData } from "@/lib/types/consultation"
import { toast } from "sonner"

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
}: PlanSectionProps) {
  return (
    <Tabs defaultValue="medications" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="medications" className="gap-1">
          <Pill className="h-4 w-4" />
          Medications
          {prescriptions.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              {prescriptions.reduce((acc, p) => acc + p.items.length, 0)}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="laboratory" className="gap-1">
          <FlaskConical className="h-4 w-4" />
          Laboratory
          {labOrders.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              {labOrders.reduce((acc, lo) => acc + lo.items.length, 0)}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="procedures" className="gap-1">
          <Stethoscope className="h-4 w-4" />
          Procedures
          {(proceduresData?.procedures?.length ?? 0) > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
              {proceduresData?.procedures.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="advice" className="gap-1">
          <MessageSquare className="h-4 w-4" />
          Advice
        </TabsTrigger>
      </TabsList>

      <TabsContent value="medications" className="mt-4">
        <MedicationsTab
          encounterId={encounterId}
          prescriptions={prescriptions}
          onPrescriptionAdded={onPrescriptionAdded}
        />
      </TabsContent>

      <TabsContent value="laboratory" className="mt-4">
        <LaboratoryTab
          encounterId={encounterId}
          labOrders={labOrders}
          onLabOrderAdded={onLabOrderAdded}
        />
      </TabsContent>

      <TabsContent value="procedures" className="mt-4">
        <ProceduresTab
          proceduresData={proceduresData}
          onChange={onProceduresChange}
        />
      </TabsContent>

      <TabsContent value="advice" className="mt-4">
        <AdviceTab adviceData={adviceData} onChange={onAdviceChange} />
      </TabsContent>
    </Tabs>
  )
}

// =============================================================================
// MEDICATIONS TAB
// =============================================================================

interface MedicationItem {
  id: string
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  quantity: number | null
  instructions: string
}

function MedicationsTab({
  encounterId,
  prescriptions,
  onPrescriptionAdded,
}: {
  encounterId: string
  prescriptions: PrescriptionForConsult[]
  onPrescriptionAdded: () => void
}) {
  const [items, setItems] = useState<MedicationItem[]>([])
  const [isAdding, setIsAdding] = useState(false)

  const addEmptyItem = () => {
    setItems([
      ...items,
      {
        id: crypto.randomUUID(),
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        quantity: null,
        instructions: "",
      },
    ])
  }

  const updateItem = (index: number, field: keyof MedicationItem, value: string | number | null) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    const validItems = items.filter((item) => item.medicineName.trim())
    if (validItems.length === 0) {
      toast.error("Add at least one medication")
      return
    }

    setIsAdding(true)
    try {
      const result = await addPrescriptionAction({
        encounterId,
        items: validItems.map((item) => ({
          medicineName: item.medicineName,
          dosage: item.dosage || null,
          frequency: item.frequency || null,
          duration: item.duration || null,
          quantity: item.quantity,
          instructions: item.instructions || null,
        })),
      })
      if (result.ok) {
        toast.success("Prescription added")
        setItems([])
        onPrescriptionAdded()
      } else {
        toast.error(result.error.message)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add prescription")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing Prescriptions */}
      {prescriptions.length > 0 && (
        <div className="space-y-2">
          <Label>Current Prescriptions</Label>
          {prescriptions.map((rx) => (
            <div key={rx.id} className="rounded-lg border p-3">
              <div className="space-y-1">
                {rx.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <Pill className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{item.medicineName}</span>
                    {item.dosage && <span className="text-muted-foreground">{item.dosage}</span>}
                    {item.frequency && <span className="text-muted-foreground">{item.frequency}</span>}
                    {item.duration && <span className="text-muted-foreground">for {item.duration}</span>}
                    {item.quantity && <Badge variant="outline">x{item.quantity}</Badge>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Prescription */}
      <div className="space-y-3 rounded-lg border p-4">
        <Label>Add Prescription</Label>

        {items.map((item, index) => (
          <div key={item.id} className="grid grid-cols-12 gap-2 rounded-lg border bg-muted/30 p-2">
            <Input
              placeholder="Medicine name*"
              value={item.medicineName}
              onChange={(e) => updateItem(index, "medicineName", e.target.value)}
              className="col-span-3"
            />
            <Input
              placeholder="Dosage"
              value={item.dosage}
              onChange={(e) => updateItem(index, "dosage", e.target.value)}
              className="col-span-2"
            />
            <Input
              placeholder="Frequency"
              value={item.frequency}
              onChange={(e) => updateItem(index, "frequency", e.target.value)}
              className="col-span-2"
            />
            <Input
              placeholder="Duration"
              value={item.duration}
              onChange={(e) => updateItem(index, "duration", e.target.value)}
              className="col-span-2"
            />
            <Input
              type="number"
              placeholder="Qty"
              value={item.quantity ?? ""}
              onChange={(e) => updateItem(index, "quantity", e.target.value ? parseInt(e.target.value) : null)}
              className="col-span-2"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="col-span-1"
              onClick={() => removeItem(index)}
              aria-label={`Remove ${item.medicineName || "medication"}`}
            >
              <X className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Instructions (e.g., take with food)"
              value={item.instructions}
              onChange={(e) => updateItem(index, "instructions", e.target.value)}
              className="col-span-11"
            />
          </div>
        ))}

        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" onClick={addEmptyItem}>
            <Plus className="mr-1 h-4 w-4" />
            Add Item
          </Button>
          {items.length > 0 && (
            <Button type="button" onClick={handleSubmit} disabled={isAdding}>
              {isAdding && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
              Save Prescription
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// =============================================================================
// LABORATORY TAB
// =============================================================================

interface LabTestItem {
  id: string
  testCode: string
  testName: string
  notes: string
}

function LaboratoryTab({
  encounterId,
  labOrders,
  onLabOrderAdded,
}: {
  encounterId: string
  labOrders: LabOrderForConsult[]
  onLabOrderAdded: () => void
}) {
  const [items, setItems] = useState<LabTestItem[]>([])
  const [isAdding, setIsAdding] = useState(false)

  const addTest = (test: { code: string; name: string }) => {
    // Check if already added
    if (items.some((item) => item.testCode === test.code)) {
      return
    }
    setItems([...items, { id: crypto.randomUUID(), testCode: test.code, testName: test.name, notes: "" }])
  }

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const updateNotes = (index: number, notes: string) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], notes }
    setItems(newItems)
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      toast.error("Add at least one test")
      return
    }

    setIsAdding(true)
    try {
      const result = await addLabOrderAction({
        encounterId,
        items: items.map((item) => ({
          testCode: item.testCode || null,
          testName: item.testName,
          notes: item.notes || null,
        })),
      })
      if (result.ok) {
        toast.success("Lab order added")
        setItems([])
        onLabOrderAdded()
      } else {
        toast.error(result.error.message)
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add lab order")
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Existing Lab Orders */}
      {labOrders.length > 0 && (
        <div className="space-y-2">
          <Label>Current Lab Orders</Label>
          {labOrders.map((order) => (
            <div key={order.id} className="rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Badge
                  variant={order.status === "RELEASED" ? "default" : "secondary"}
                >
                  {order.status}
                </Badge>
              </div>
              <div className="mt-2 space-y-1">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <FlaskConical className="h-4 w-4 text-muted-foreground" />
                    <span>{item.testName}</span>
                    {item.testCode && (
                      <Badge variant="outline" className="text-xs">
                        {item.testCode}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Lab Order */}
      <div className="space-y-3 rounded-lg border p-4">
        <Label>Order Lab Tests</Label>

        {/* Quick Select */}
        <div className="flex flex-wrap gap-2">
          {COMMON_LAB_TESTS.map((test) => {
            const isSelected = items.some((item) => item.testCode === test.code)
            return (
              <Button
                key={test.code}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => addTest(test)}
                disabled={isSelected}
              >
                {test.code}
              </Button>
            )
          })}
        </div>

        {/* Selected Tests */}
        {items.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Tests</Label>
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-lg border bg-muted/30 p-2"
              >
                <Badge variant="outline">{item.testCode}</Badge>
                <span className="flex-1 text-sm">{item.testName}</span>
                <Input
                  placeholder="Notes"
                  value={item.notes}
                  onChange={(e) => updateNotes(index, e.target.value)}
                  className="w-48"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(index)}
                  aria-label={`Remove ${item.testName}`}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <Button type="button" onClick={handleSubmit} disabled={isAdding}>
            {isAdding && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}
            Submit Lab Order
          </Button>
        )}
      </div>
    </div>
  )
}

// =============================================================================
// PROCEDURES TAB
// =============================================================================

function ProceduresTab({
  proceduresData,
  onChange,
}: {
  proceduresData: ProceduresData | null
  onChange: (data: ProceduresData) => void
}) {
  const [customProcedure, setCustomProcedure] = useState("")

  const toggleProcedure = (code: string, name: string) => {
    const current = proceduresData ?? { version: 1, procedures: [] }
    const exists = current.procedures.some((p) => p.code === code)

    if (exists) {
      onChange({
        ...current,
        procedures: current.procedures.filter((p) => p.code !== code),
      })
    } else {
      onChange({
        ...current,
        procedures: [...current.procedures, { code, name }],
      })
    }
  }

  const addCustomProcedure = () => {
    if (!customProcedure.trim()) return

    const current = proceduresData ?? { version: 1, procedures: [] }
    onChange({
      ...current,
      procedures: [
        ...current.procedures,
        { code: `custom_${Date.now()}`, name: customProcedure.trim() },
      ],
    })
    setCustomProcedure("")
  }

  const updateNotes = (code: string, notes: string) => {
    const current = proceduresData ?? { version: 1, procedures: [] }
    onChange({
      ...current,
      procedures: current.procedures.map((p) =>
        p.code === code ? { ...p, notes: notes || undefined } : p
      ),
    })
  }

  return (
    <div className="space-y-4">
      <Label>Procedures Performed</Label>

      {/* Common Procedures */}
      <div className="grid grid-cols-3 gap-2">
        {COMMON_PROCEDURES.map((proc) => {
          const isSelected = proceduresData?.procedures.some((p) => p.code === proc.value)
          return (
            <label
              key={proc.value}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50",
                isSelected && "border-primary bg-primary/5"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleProcedure(proc.value, proc.label)}
              />
              <span className="text-sm">{proc.label}</span>
            </label>
          )
        })}
      </div>

      {/* Selected Procedures with Notes */}
      {(proceduresData?.procedures.length ?? 0) > 0 && (
        <div className="space-y-2">
          <Label>Procedure Notes</Label>
          {proceduresData?.procedures.map((proc) => (
            <div key={proc.code} className="flex items-center gap-2">
              <Badge variant="secondary">{proc.name}</Badge>
              <Input
                placeholder="Notes..."
                value={proc.notes ?? ""}
                onChange={(e) => updateNotes(proc.code, e.target.value)}
                className="flex-1"
              />
            </div>
          ))}
        </div>
      )}

      {/* Custom Procedure */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Other procedure..."
          value={customProcedure}
          onChange={(e) => setCustomProcedure(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addCustomProcedure()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addCustomProcedure}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>
    </div>
  )
}

// =============================================================================
// ADVICE TAB
// =============================================================================

function AdviceTab({
  adviceData,
  onChange,
}: {
  adviceData: AdviceData | null
  onChange: (data: AdviceData) => void
}) {
  const [customAdvice, setCustomAdvice] = useState("")

  const toggleAdvice = (advice: string) => {
    const current = adviceData ?? { version: 1, instructions: [] }
    const exists = current.instructions.includes(advice)

    onChange({
      ...current,
      instructions: exists
        ? current.instructions.filter((a) => a !== advice)
        : [...current.instructions, advice],
    })
  }

  const addCustomAdvice = () => {
    if (!customAdvice.trim()) return

    const current = adviceData ?? { version: 1, instructions: [] }
    onChange({
      ...current,
      instructions: [...current.instructions, customAdvice.trim()],
    })
    setCustomAdvice("")
  }

  const updateFollowUp = (field: "followUpDate" | "followUpNotes" | "referral", value: string) => {
    const current = adviceData ?? { version: 1, instructions: [] }
    onChange({
      ...current,
      [field]: value || undefined,
    })
  }

  return (
    <div className="space-y-4">
      <Label>Patient Instructions</Label>

      {/* Common Advice */}
      <div className="grid grid-cols-2 gap-2">
        {COMMON_ADVICE.map((advice) => {
          const isSelected = adviceData?.instructions.includes(advice)
          return (
            <label
              key={advice}
              className={cn(
                "flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 transition-colors hover:bg-muted/50",
                isSelected && "border-primary bg-primary/5"
              )}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleAdvice(advice)}
              />
              <span className="text-sm">{advice}</span>
            </label>
          )
        })}
      </div>

      {/* Custom Advice */}
      <div className="flex items-center gap-2">
        <Input
          placeholder="Other instruction..."
          value={customAdvice}
          onChange={(e) => setCustomAdvice(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault()
              addCustomAdvice()
            }
          }}
        />
        <Button type="button" variant="outline" onClick={addCustomAdvice}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      {/* Selected Instructions Preview */}
      {(adviceData?.instructions.length ?? 0) > 0 && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <Label className="text-xs text-muted-foreground">Selected Instructions</Label>
          <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
            {adviceData?.instructions.map((advice, i) => (
              <li key={i}>{advice}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow-up */}
      <div className="space-y-3 rounded-lg border p-4">
        <Label className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Follow-up
        </Label>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Follow-up Date</Label>
            <Input
              type="date"
              value={adviceData?.followUpDate ?? ""}
              onChange={(e) => updateFollowUp("followUpDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">Notes</Label>
            <Input
              placeholder="Follow-up notes..."
              value={adviceData?.followUpNotes ?? ""}
              onChange={(e) => updateFollowUp("followUpNotes", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm text-muted-foreground">Referral</Label>
          <Textarea
            placeholder="Referral notes (e.g., refer to cardiologist for further evaluation)..."
            value={adviceData?.referral ?? ""}
            onChange={(e) => updateFollowUp("referral", e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </div>
  )
}
