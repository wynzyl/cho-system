"use client"

import { useState, useTransition } from "react"
import { Plus, AlertTriangle, CheckCircle2, HelpCircle, ChevronDown, Trash2, Edit2, Clock, User } from "lucide-react"
import { PatientAllergyStatus, AllergySeverity, AllergyStatus } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { PatientAllergyWithRecorder } from "@/actions/patients"
import { AllergyForm } from "./allergy-form"
import { removeAllergyAction, confirmNkaAction } from "@/actions/patients"

interface AllergyCardProps {
  patientId: string
  allergyStatus: PatientAllergyStatus
  allergies: PatientAllergyWithRecorder[]
  allergyConfirmedAt?: Date | null
  allergyConfirmedBy?: { id: string; name: string } | null
  canEdit?: boolean
  onUpdate?: () => void
}

function getSeverityStyles(severity: AllergySeverity) {
  switch (severity) {
    case "SEVERE":
      return {
        badge: "bg-red-500/20 text-red-300 ring-red-500/30",
        dot: "bg-red-500",
        label: "Severe",
      }
    case "MODERATE":
      return {
        badge: "bg-amber-500/20 text-amber-300 ring-amber-500/30",
        dot: "bg-amber-500",
        label: "Moderate",
      }
    case "MILD":
      return {
        badge: "bg-yellow-500/20 text-yellow-300 ring-yellow-500/30",
        dot: "bg-yellow-400",
        label: "Mild",
      }
  }
}

function getStatusBadge(status: AllergyStatus) {
  switch (status) {
    case "ACTIVE":
      return null // Active is default, no badge needed
    case "INACTIVE":
      return <Badge variant="outline" className="text-[10px] text-muted-foreground">Inactive</Badge>
    case "RESOLVED":
      return <Badge variant="outline" className="text-[10px] text-emerald-400">Resolved</Badge>
  }
}

function formatDate(date: Date | string | null | undefined): string {
  if (!date) return ""
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

export function AllergyCard({
  patientId,
  allergyStatus,
  allergies,
  allergyConfirmedAt,
  allergyConfirmedBy,
  canEdit = false,
  onUpdate,
}: AllergyCardProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingAllergy, setEditingAllergy] = useState<PatientAllergyWithRecorder | null>(null)
  const [isPending, startTransition] = useTransition()

  const activeAllergies = allergies.filter((a) => a.status === "ACTIVE")
  const inactiveAllergies = allergies.filter((a) => a.status !== "ACTIVE")

  const handleRemoveAllergy = (allergyId: string) => {
    if (!confirm("Are you sure you want to remove this allergy?")) return

    startTransition(async () => {
      const result = await removeAllergyAction({ allergyId })
      if (result.ok) {
        onUpdate?.()
      }
    })
  }

  const handleConfirmNka = () => {
    startTransition(async () => {
      const result = await confirmNkaAction({ patientId })
      if (result.ok) {
        onUpdate?.()
      }
    })
  }

  const handleFormSuccess = () => {
    setShowAddForm(false)
    setEditingAllergy(null)
    onUpdate?.()
  }

  const getStatusIcon = () => {
    switch (allergyStatus) {
      case "HAS_ALLERGIES":
        return <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
      case "NKA":
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
      default:
        return <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
    }
  }

  const getStatusLabel = () => {
    switch (allergyStatus) {
      case "HAS_ALLERGIES":
        return "Documented Allergies"
      case "NKA":
        return "No Known Allergies"
      default:
        return "Status Unknown"
    }
  }

  return (
    <div className="clinical-card rounded-xl border border-border/50 p-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="clinical-section-header mb-1">
            {getStatusIcon()}
            <span>Allergies</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            {getStatusLabel()}
            {activeAllergies.length > 0 && (
              <span className="ml-1 text-red-400">({activeAllergies.length} active)</span>
            )}
          </p>
        </div>

        {canEdit && (
          <div className="flex gap-2">
            {allergyStatus === "UNKNOWN" && allergies.length === 0 && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleConfirmNka}
                disabled={isPending}
                className="h-8 text-xs border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
              >
                <CheckCircle2 className="mr-1.5 h-3 w-3" />
                Confirm NKA
              </Button>
            )}
            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              disabled={isPending}
              className="h-8 text-xs"
            >
              <Plus className="mr-1.5 h-3 w-3" />
              Add Allergy
            </Button>
          </div>
        )}
      </div>

      {/* Confirmation info */}
      {allergyConfirmedAt && (
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Last updated: {formatDate(allergyConfirmedAt)}
          </span>
          {allergyConfirmedBy && (
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              by {allergyConfirmedBy.name}
            </span>
          )}
        </div>
      )}

      {/* Active Allergies List */}
      {activeAllergies.length > 0 && (
        <div className="mt-4 space-y-2">
          {activeAllergies.map((allergy) => {
            const severity = getSeverityStyles(allergy.severity)
            const isExpanded = expandedId === allergy.id

            return (
              <div
                key={allergy.id}
                className={cn(
                  "rounded-lg border transition-all duration-200",
                  allergy.severity === "SEVERE"
                    ? "border-red-500/30 bg-red-500/5"
                    : "border-border/50 bg-background/50"
                )}
              >
                {/* Allergy chip header */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : allergy.id)}
                  className="flex w-full items-center justify-between px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", severity.dot)} />
                    <span className="font-medium text-sm">{allergy.allergen}</span>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] ring-1", severity.badge)}
                    >
                      {severity.label}
                    </Badge>
                    {allergy.category && (
                      <Badge variant="secondary" className="text-[10px]">
                        {allergy.category}
                      </Badge>
                    )}
                    {getStatusBadge(allergy.status)}
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 text-muted-foreground transition-transform",
                      isExpanded && "rotate-180"
                    )}
                  />
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t border-border/30 px-3 py-3">
                    <div className="grid gap-3 text-sm">
                      {allergy.reaction && (
                        <div>
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Reaction
                          </span>
                          <p className="mt-0.5">{allergy.reaction}</p>
                        </div>
                      )}
                      {allergy.notes && (
                        <div>
                          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            Notes
                          </span>
                          <p className="mt-0.5 text-muted-foreground">{allergy.notes}</p>
                        </div>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Recorded: {formatDate(allergy.recordedAt)}
                        </span>
                        {allergy.recordedBy && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            by {allergy.recordedBy.name}
                          </span>
                        )}
                      </div>

                      {canEdit && (
                        <div className="flex gap-2 pt-2 border-t border-border/30">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingAllergy(allergy)}
                            className="h-7 text-xs"
                          >
                            <Edit2 className="mr-1.5 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveAllergy(allergy.id)}
                            disabled={isPending}
                            className="h-7 text-xs text-destructive hover:text-destructive"
                          >
                            <Trash2 className="mr-1.5 h-3 w-3" />
                            Remove
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Inactive/Resolved allergies (collapsed) */}
      {inactiveAllergies.length > 0 && (
        <div className="mt-4">
          <p className="text-xs text-muted-foreground mb-2">
            Inactive/Resolved ({inactiveAllergies.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {inactiveAllergies.map((allergy) => (
              <span
                key={allergy.id}
                className="inline-flex items-center gap-1.5 rounded-md bg-muted/50 px-2 py-1 text-xs text-muted-foreground line-through"
              >
                {allergy.allergen}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {allergies.length === 0 && allergyStatus !== "NKA" && (
        <div className="mt-4 flex flex-col items-center justify-center py-6 text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/10">
            <HelpCircle className="h-5 w-5 text-amber-400" />
          </div>
          <p className="text-sm font-medium">No allergies documented</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {canEdit
              ? "Add an allergy or confirm No Known Allergies (NKA)"
              : "Allergy status has not been confirmed"}
          </p>
        </div>
      )}

      {/* NKA confirmed state */}
      {allergyStatus === "NKA" && allergies.length === 0 && (
        <div className="mt-4 flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            <span className="font-medium">No Known Allergies confirmed</span>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {(showAddForm || editingAllergy) && (
        <AllergyForm
          patientId={patientId}
          allergy={editingAllergy}
          open={showAddForm || !!editingAllergy}
          onClose={() => {
            setShowAddForm(false)
            setEditingAllergy(null)
          }}
          onSuccess={handleFormSuccess}
        />
      )}
    </div>
  )
}
