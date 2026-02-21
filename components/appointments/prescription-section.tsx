"use client"

import { useState, useTransition } from "react"
import { Plus, Loader2, Pill, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { createPrescriptionAction, type EncounterDetails } from "@/actions/doctor"

interface PrescriptionSectionProps {
  encounter: EncounterDetails
  onSuccess: () => void
  disabled?: boolean
}

type PrescriptionItemInput = {
  medicineName: string
  dosage: string
  frequency: string
  duration: string
  quantity: string
  instructions: string
}

const emptyItem: PrescriptionItemInput = {
  medicineName: "",
  dosage: "",
  frequency: "",
  duration: "",
  quantity: "",
  instructions: "",
}

export function PrescriptionSection({
  encounter,
  onSuccess,
  disabled = false,
}: PrescriptionSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [items, setItems] = useState<PrescriptionItemInput[]>([{ ...emptyItem }])
  const [notes, setNotes] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleAddItem = () => {
    setItems([...items, { ...emptyItem }])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index))
    }
  }

  const handleItemChange = (
    index: number,
    field: keyof PrescriptionItemInput,
    value: string
  ) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleSubmit = () => {
    // Validate at least one item has medicine name
    const validItems = items.filter((item) => item.medicineName.trim())
    if (validItems.length === 0) {
      setError("At least one medicine is required")
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await createPrescriptionAction({
        encounterId: encounter.id,
        notes: notes.trim() || null,
        items: validItems.map((item) => ({
          medicineName: item.medicineName.trim(),
          dosage: item.dosage.trim() || null,
          frequency: item.frequency.trim() || null,
          duration: item.duration.trim() || null,
          quantity: item.quantity ? parseInt(item.quantity, 10) : null,
          instructions: item.instructions.trim() || null,
        })),
      })

      if (result.ok) {
        setItems([{ ...emptyItem }])
        setNotes("")
        setDialogOpen(false)
        onSuccess()
      } else {
        setError(result.error.message)
      }
    })
  }

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setItems([{ ...emptyItem }])
      setNotes("")
      setError(null)
    }
  }

  const hasValidItems = items.some((item) => item.medicineName.trim())

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Pill className="h-5 w-5" />
            Prescriptions
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
            disabled={disabled}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {encounter.prescriptions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No prescriptions</p>
        ) : (
          <div className="space-y-3">
            {encounter.prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="rounded-md border bg-card p-3"
              >
                <div className="space-y-2">
                  {prescription.items.map((item, idx) => (
                    <div key={item.id} className="text-sm">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {idx + 1}. {item.medicineName}
                        </span>
                        {item.quantity && (
                          <span className="text-muted-foreground">
                            x{item.quantity}
                          </span>
                        )}
                      </div>
                      <div className="ml-4 text-muted-foreground">
                        {[item.dosage, item.frequency, item.duration]
                          .filter(Boolean)
                          .join(" • ")}
                      </div>
                      {item.instructions && (
                        <div className="ml-4 text-xs text-muted-foreground italic">
                          {item.instructions}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {prescription.notes && (
                  <p className="mt-2 text-xs text-muted-foreground border-t pt-2">
                    Note: {prescription.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Prescription</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {items.map((item, index) => (
              <div
                key={index}
                className="rounded-md border bg-muted/50 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Item {index + 1}</span>
                  {items.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                      disabled={isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    Medicine Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    placeholder="e.g., Paracetamol 500mg"
                    value={item.medicineName}
                    onChange={(e) =>
                      handleItemChange(index, "medicineName", e.target.value)
                    }
                    disabled={isPending}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Dosage</Label>
                    <Input
                      placeholder="e.g., 1 tablet"
                      value={item.dosage}
                      onChange={(e) =>
                        handleItemChange(index, "dosage", e.target.value)
                      }
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Frequency</Label>
                    <Input
                      placeholder="e.g., 3x daily"
                      value={item.frequency}
                      onChange={(e) =>
                        handleItemChange(index, "frequency", e.target.value)
                      }
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Duration</Label>
                    <Input
                      placeholder="e.g., 7 days"
                      value={item.duration}
                      onChange={(e) =>
                        handleItemChange(index, "duration", e.target.value)
                      }
                      disabled={isPending}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      placeholder="e.g., 21"
                      value={item.quantity}
                      onChange={(e) =>
                        handleItemChange(index, "quantity", e.target.value)
                      }
                      disabled={isPending}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Instructions</Label>
                  <Input
                    placeholder="e.g., Take after meals"
                    value={item.instructions}
                    onChange={(e) =>
                      handleItemChange(index, "instructions", e.target.value)
                    }
                    disabled={isPending}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={handleAddItem}
              disabled={isPending}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Another Medicine
            </Button>

            <div className="space-y-2">
              <Label>Prescription Notes (Optional)</Label>
              <Textarea
                placeholder="Additional notes for the prescription..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isPending}
                rows={2}
              />
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !hasValidItems}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Prescription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
