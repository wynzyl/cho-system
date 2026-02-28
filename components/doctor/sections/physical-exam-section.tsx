"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { BODY_SYSTEMS, PE_FINDINGS, type BodySystemValue } from "@/lib/constants"
import type { PhysicalExamData, BodySystemExam } from "@/lib/types/consultation"

interface PhysicalExamSectionProps {
  value: PhysicalExamData | null
  onChange: (data: PhysicalExamData) => void
}

export function PhysicalExamSection({ value, onChange }: PhysicalExamSectionProps) {
  const [expandedSystem, setExpandedSystem] = useState<BodySystemValue | null>("general")

  const handleFindingToggle = (system: BodySystemValue, finding: string, checked: boolean) => {
    const currentData = value ?? { version: 1 }
    const systemData = currentData[system] ?? { findings: [] }
    const findings = checked
      ? [...systemData.findings, finding]
      : systemData.findings.filter((f) => f !== finding)

    onChange({
      ...currentData,
      [system]: { ...systemData, findings },
    })
  }

  const handleNotesChange = (system: BodySystemValue, notes: string) => {
    const currentData = value ?? { version: 1 }
    const systemData = currentData[system] ?? { findings: [] }

    onChange({
      ...currentData,
      [system]: { ...systemData, notes: notes || undefined },
    })
  }

  const selectAllNormal = (system: BodySystemValue) => {
    const currentData = value ?? { version: 1 }
    const existingSystem = currentData[system] ?? { findings: [] }
    const normalFindings = PE_FINDINGS[system]
      .filter((f) => f.isNormal)
      .map((f) => f.value)

    onChange({
      ...currentData,
      [system]: { ...existingSystem, findings: normalFindings },
    })
  }

  const getSystemData = (system: BodySystemValue): BodySystemExam | undefined => {
    return value?.[system] as BodySystemExam | undefined
  }

  const getSystemSummary = (system: BodySystemValue): string => {
    const data = getSystemData(system)
    if (!data || data.findings.length === 0) return "No findings"

    const findingLabels = data.findings
      .map((f) => PE_FINDINGS[system].find((pf) => pf.value === f)?.label ?? f)
      .slice(0, 3)

    const more = data.findings.length > 3 ? ` +${data.findings.length - 3}` : ""
    return findingLabels.join(", ") + more
  }

  const hasAbnormalFindings = (system: BodySystemValue): boolean => {
    const data = getSystemData(system)
    if (!data) return false
    return data.findings.some((f) => {
      const finding = PE_FINDINGS[system].find((pf) => pf.value === f)
      return finding && !finding.isNormal
    })
  }

  return (
    <div className="space-y-2">
      {BODY_SYSTEMS.map((system) => {
        const isExpanded = expandedSystem === system.value
        const findings = PE_FINDINGS[system.value as BodySystemValue]
        const systemData = getSystemData(system.value as BodySystemValue)
        const hasAbnormal = hasAbnormalFindings(system.value as BodySystemValue)

        return (
          <div
            key={system.value}
            className={cn(
              "rounded-lg border",
              hasAbnormal && "border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/50"
            )}
          >
            {/* Header */}
            <button
              type="button"
              className="flex w-full items-center justify-between px-4 py-3 text-left"
              onClick={() => setExpandedSystem(isExpanded ? null : (system.value as BodySystemValue))}
            >
              <div className="flex items-center gap-2">
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="font-medium">{system.label}</span>
                {systemData && systemData.findings.length > 0 && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
              {!isExpanded && (
                <span className="text-sm text-muted-foreground">
                  {getSystemSummary(system.value as BodySystemValue)}
                </span>
              )}
            </button>

            {/* Content */}
            {isExpanded && (
              <div className="border-t px-4 py-3">
                {/* Quick actions */}
                <div className="mb-3 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => selectAllNormal(system.value as BodySystemValue)}
                  >
                    Select All Normal
                  </Button>
                </div>

                {/* Findings grid */}
                <div className="grid grid-cols-3 gap-2">
                  {findings.map((finding) => {
                    const isChecked = systemData?.findings.includes(finding.value) ?? false
                    return (
                      <label
                        key={finding.value}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm transition-colors hover:bg-muted/50",
                          isChecked && finding.isNormal && "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950",
                          isChecked && !finding.isNormal && "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
                        )}
                      >
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) =>
                            handleFindingToggle(
                              system.value as BodySystemValue,
                              finding.value,
                              checked as boolean
                            )
                          }
                        />
                        <span className={cn(!finding.isNormal && "text-orange-700 dark:text-orange-300")}>
                          {finding.label}
                        </span>
                      </label>
                    )
                  })}
                </div>

                {/* Notes */}
                <div className="mt-3">
                  <Textarea
                    placeholder={`Additional notes for ${system.label.toLowerCase()}...`}
                    value={systemData?.notes ?? ""}
                    onChange={(e) =>
                      handleNotesChange(system.value as BodySystemValue, e.target.value)
                    }
                    rows={2}
                    className="text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
