"use client"

import { useState, useTransition } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { AlertTriangle, Loader2, X } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ALLERGY_SEVERITY_OPTIONS,
  ALLERGY_STATUS_OPTIONS,
  ALLERGEN_CATEGORIES,
  getAllergensByCategory,
} from "@/lib/constants"
import { addAllergyAction, updateAllergyAction } from "@/actions/patients"
import type { PatientAllergyWithRecorder } from "@/actions/patients"
import { cn } from "@/lib/utils"

const allergyFormSchema = z.object({
  allergen: z.string().min(1, "Allergen is required").max(100),
  category: z.enum(["Drug", "Food", "Environmental", "Other"]).optional(),
  severity: z.enum(["MILD", "MODERATE", "SEVERE"], { message: "Severity is required" }),
  reaction: z.string().max(200).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "RESOLVED"]).optional(),
  notes: z.string().max(500).optional(),
})

type AllergyFormData = z.infer<typeof allergyFormSchema>

interface AllergyFormProps {
  patientId: string
  allergy?: PatientAllergyWithRecorder | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AllergyForm({
  patientId,
  allergy,
  open,
  onClose,
  onSuccess,
}: AllergyFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>(
    allergy?.category || undefined
  )
  const initialCustomAllergen =
    !!allergy?.allergen &&
    (!allergy.category ||
      !getAllergensByCategory(allergy.category).some((a) => a.name === allergy.allergen))
  const [customAllergen, setCustomAllergen] = useState(initialCustomAllergen)

  const isEditing = !!allergy

  const form = useForm<AllergyFormData>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      allergen: allergy?.allergen ?? "",
      category: (allergy?.category as AllergyFormData["category"]) ?? undefined,
      severity: allergy?.severity ?? undefined,
      reaction: allergy?.reaction ?? "",
      status: allergy?.status ?? "ACTIVE",
      notes: allergy?.notes ?? "",
    },
  })

  const onSubmit = (data: AllergyFormData) => {
    setError(null)
    startTransition(async () => {
      try {
        if (isEditing) {
          const result = await updateAllergyAction({
            allergyId: allergy.id,
            ...data,
          })
          if (result.ok) {
            onSuccess()
          } else {
            setError(result.error.message)
          }
        } else {
          // addAllergySchema does not accept status - new allergies are always ACTIVE
          const { status: _status, ...addData } = data
          const result = await addAllergyAction({
            patientId,
            ...addData,
          })
          if (result.ok) {
            onSuccess()
          } else {
            setError(result.error.message)
          }
        }
      } catch {
        setError("An unexpected error occurred")
      }
    })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    form.setValue("category", category as AllergyFormData["category"])
    // Reset allergen when category changes (unless custom)
    if (!customAllergen) {
      form.setValue("allergen", "")
    }
  }

  const handleAllergenSelect = (allergen: string) => {
    if (allergen === "__custom__") {
      setCustomAllergen(true)
      form.setValue("allergen", "")
    } else {
      setCustomAllergen(false)
      form.setValue("allergen", allergen)
    }
  }

  const categoryAllergens = selectedCategory
    ? getAllergensByCategory(selectedCategory)
    : []

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            {isEditing ? "Edit Allergy" : "Add Allergy"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
              {error}
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Category</Label>
            <div className="flex flex-wrap gap-2">
              {ALLERGEN_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={cn(
                    "rounded-lg border px-3 py-1.5 text-sm font-medium transition-all",
                    selectedCategory === cat
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border/60 hover:border-border hover:bg-accent/50"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Allergen Selection */}
          <div className="space-y-2">
            <Label htmlFor="allergen" className="text-sm font-medium">
              Allergen <span className="text-destructive">*</span>
            </Label>

            {selectedCategory && categoryAllergens.length > 0 && !customAllergen ? (
              <div className="space-y-2">
                <Select
                  value={form.watch("allergen") || undefined}
                  onValueChange={handleAllergenSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select common allergen..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryAllergens.map((a) => (
                      <SelectItem key={a.name} value={a.name}>
                        {a.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="__custom__">
                      <span className="text-muted-foreground">Other (specify)...</span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <div className="relative">
                <Input
                  id="allergen"
                  placeholder="Enter allergen name..."
                  {...form.register("allergen")}
                  aria-invalid={!!form.formState.errors.allergen}
                />
                {customAllergen && (
                  <button
                    type="button"
                    onClick={() => setCustomAllergen(false)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
            {form.formState.errors.allergen && (
              <p className="text-xs text-destructive">
                {form.formState.errors.allergen.message}
              </p>
            )}
          </div>

          {/* Severity */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              Severity <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              {ALLERGY_SEVERITY_OPTIONS.map((opt) => {
                const isSelected = form.watch("severity") === opt.value
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => form.setValue("severity", opt.value as AllergyFormData["severity"])}
                    className={cn(
                      "flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all",
                      isSelected
                        ? opt.value === "SEVERE"
                          ? "border-red-500 bg-red-500/10 text-red-400"
                          : opt.value === "MODERATE"
                            ? "border-amber-500 bg-amber-500/10 text-amber-400"
                            : "border-yellow-500 bg-yellow-500/10 text-yellow-400"
                        : "border-border/60 hover:border-border hover:bg-accent/50"
                    )}
                  >
                    <span
                      className={cn(
                        "mr-2 inline-block h-2 w-2 rounded-full",
                        opt.value === "SEVERE"
                          ? "bg-red-500"
                          : opt.value === "MODERATE"
                            ? "bg-amber-500"
                            : "bg-yellow-400"
                      )}
                    />
                    {opt.label}
                  </button>
                )
              })}
            </div>
            {form.formState.errors.severity && (
              <p className="text-xs text-destructive">
                {form.formState.errors.severity.message}
              </p>
            )}
          </div>

          {/* Status (only for editing) */}
          {isEditing && (
            <div className="space-y-2">
              <Label htmlFor="status" className="text-sm font-medium">
                Status
              </Label>
              <Select
                value={form.watch("status")}
                onValueChange={(val) => form.setValue("status", val as AllergyFormData["status"])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALLERGY_STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reaction */}
          <div className="space-y-2">
            <Label htmlFor="reaction" className="text-sm font-medium text-muted-foreground">
              Reaction (optional)
            </Label>
            <Input
              id="reaction"
              placeholder="e.g., Anaphylaxis, Hives, Swelling..."
              {...form.register("reaction")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-medium text-muted-foreground">
              Notes (optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Additional information..."
              {...form.register("notes")}
              rows={2}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                form.watch("severity") === "SEVERE" &&
                  "bg-red-600 hover:bg-red-700 text-white"
              )}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Save Changes" : "Add Allergy"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
