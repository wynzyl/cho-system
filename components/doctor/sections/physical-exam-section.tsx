"use client"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { BODY_SYSTEMS, PE_FINDINGS } from "@/lib/constants"
import type { PhysicalExamData, PhysicalExamSection as PESection } from "@/lib/types/consultation"
import { Stethoscope, ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface PhysicalExamSectionProps {
  value: PhysicalExamData | null
  onChange: (data: PhysicalExamData) => void
  disabled?: boolean
}

type BodySystem = (typeof BODY_SYSTEMS)[number]["value"]

export function PhysicalExamSection({ value, onChange, disabled = false }: PhysicalExamSectionProps) {
  const [expandedSystem, setExpandedSystem] = useState<BodySystem | null>(null)

  const currentData: PhysicalExamData = value ?? { version: 1 }

  const updateSystem = (system: BodySystem, sectionData: PESection) => {
    onChange({
      ...currentData,
      [system]: sectionData,
    })
  }

  const toggleFinding = (system: BodySystem, findingValue: string) => {
    const currentSection = currentData[system] ?? { findings: [] }
    const currentFindings = currentSection.findings || []
    const newFindings = currentFindings.includes(findingValue)
      ? currentFindings.filter((f) => f !== findingValue)
      : [...currentFindings, findingValue]

    updateSystem(system, {
      ...currentSection,
      findings: newFindings,
      isNormal: false, // Clear normal if manually selecting findings
    })
  }

  const setNormal = (system: BodySystem) => {
    updateSystem(system, {
      findings: [],
      isNormal: true,
      notes: currentData[system]?.notes,
    })
  }

  const updateNotes = (system: BodySystem, notes: string) => {
    const currentSection = currentData[system] ?? { findings: [] }
    updateSystem(system, {
      ...currentSection,
      notes,
    })
  }

  const getSystemSummary = (system: BodySystem): string => {
    const section = currentData[system]
    if (!section) return "Not examined"
    if (section.isNormal) return "Normal"
    if (section.findings.length === 0) return "Not examined"
    return section.findings
      .map((f) => {
        const finding = PE_FINDINGS[system]?.find((pf) => pf.value === f)
        return finding?.label ?? f
      })
      .join(", ")
  }

  const isSystemComplete = (system: BodySystem): boolean => {
    const section = currentData[system]
    return !!(section?.isNormal || (section?.findings && section.findings.length > 0))
  }

  return (
    <div className="space-y-3">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <Stethoscope className="h-5 w-5 text-blue-600" />
        <h3 className="font-semibold">Physical Examination</h3>
      </div>

      {/* Body Systems */}
      <div className="space-y-2">
        {BODY_SYSTEMS.map((system) => {
          const isExpanded = expandedSystem === system.value
          const isComplete = isSystemComplete(system.value)
          const section = currentData[system.value]
          const findings = PE_FINDINGS[system.value] || []

          return (
            <div
              key={system.value}
              className={cn(
                "rounded-lg border transition-all",
                isExpanded
                  ? "border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-950/30"
                  : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
              )}
            >
              {/* System Header */}
              <button
                type="button"
                onClick={() => setExpandedSystem(isExpanded ? null : system.value)}
                disabled={disabled}
                className={cn(
                  "flex w-full items-center justify-between px-4 py-3 text-left",
                  disabled && "cursor-not-allowed opacity-50"
                )}
              >
                <div className="flex items-center gap-3">
                  {isComplete && (
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div>
                    <span className="font-medium">{system.label}</span>
                    {!isExpanded && isComplete && (
                      <p className="text-xs text-muted-foreground">
                        {getSystemSummary(system.value)}
                      </p>
                    )}
                  </div>
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isExpanded && "rotate-180"
                  )}
                />
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t px-4 pb-4 pt-3">
                  {/* Quick Normal Button */}
                  <div className="mb-3">
                    <Button
                      type="button"
                      variant={section?.isNormal ? "default" : "outline"}
                      size="sm"
                      onClick={() => setNormal(system.value)}
                      disabled={disabled}
                    >
                      <Check className="mr-1 h-3 w-3" />
                      Mark as Normal
                    </Button>
                  </div>

                  {/* Findings Grid */}
                  {!section?.isNormal && (
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">
                        Select Findings
                      </Label>
                      <div className="grid grid-cols-2 gap-2">
                        {findings.map((finding) => {
                          const isSelected = section?.findings?.includes(finding.value)
                          return (
                            <label
                              key={finding.value}
                              className={cn(
                                "flex cursor-pointer items-center gap-2 rounded-md border p-2 text-sm transition-colors",
                                isSelected
                                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                                  : "border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
                                disabled && "cursor-not-allowed opacity-50"
                              )}
                            >
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => toggleFinding(system.value, finding.value)}
                                disabled={disabled}
                              />
                              <span className={cn(isSelected && "font-medium")}>
                                {finding.label}
                              </span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div className="mt-3">
                    <Label htmlFor={`pe-notes-${system.value}`} className="text-xs">
                      Additional Notes
                    </Label>
                    <Textarea
                      id={`pe-notes-${system.value}`}
                      value={section?.notes ?? ""}
                      onChange={(e) => updateNotes(system.value, e.target.value)}
                      disabled={disabled}
                      placeholder="Additional findings or observations..."
                      rows={2}
                      className="mt-1 resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-slate-100 p-3 dark:bg-slate-800">
        <p className="mb-2 text-xs font-medium uppercase tracking-wider text-slate-500">
          Examination Summary
        </p>
        <div className="flex flex-wrap gap-1">
          {BODY_SYSTEMS.map((system) => {
            const isComplete = isSystemComplete(system.value)
            return (
              <Badge
                key={system.value}
                variant={isComplete ? "default" : "outline"}
                className={cn(
                  "text-xs",
                  isComplete
                    ? "bg-green-600"
                    : "border-dashed text-muted-foreground"
                )}
              >
                {system.label}
              </Badge>
            )
          })}
        </div>
      </div>
    </div>
  )
}
