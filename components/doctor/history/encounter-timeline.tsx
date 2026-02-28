"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronRight,
  Calendar,
  User,
  Stethoscope,
  Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn, formatDate, formatTime } from "@/lib/utils"
import type {
  HistoricalEncounterSummary,
  HistoricalEncounterDetails,
} from "@/lib/types/patient-history"
import {
  isAdviceData,
  isProceduresData,
  type AdviceData,
  type ProceduresData,
} from "@/lib/types/consultation"

interface EncounterTimelineProps {
  encounters: HistoricalEncounterSummary[]
  encounterDetailsCache: Map<string, HistoricalEncounterDetails>
  loadingEncounterId: string | null
  onLoadDetails: (encounterId: string) => Promise<HistoricalEncounterDetails | null>
}

const STATUS_COLORS: Record<string, string> = {
  DONE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  FOR_LAB: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  FOR_PHARMACY: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function EncounterTimeline({
  encounters,
  encounterDetailsCache,
  loadingEncounterId,
  onLoadDetails,
}: EncounterTimelineProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const toggleExpand = async (encounterId: string) => {
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(encounterId)) {
      newExpanded.delete(encounterId)
    } else {
      newExpanded.add(encounterId)
      // Load details if not cached
      if (!encounterDetailsCache.has(encounterId)) {
        await onLoadDetails(encounterId)
      }
    }
    setExpandedIds(newExpanded)
  }

  if (encounters.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">No past encounters found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {encounters.map((encounter, index) => {
        const isExpanded = expandedIds.has(encounter.id)
        const isLoading = loadingEncounterId === encounter.id
        const details = encounterDetailsCache.get(encounter.id)

        return (
          <Card
            key={`encounter-${encounter.id}-${index}`}
            className={cn(
              "transition-all duration-200",
              isExpanded && "ring-1 ring-primary/20"
            )}
          >
            <CardContent className="p-0">
              {/* Header - Always visible */}
              <Button
                variant="ghost"
                className="w-full justify-start p-4 h-auto hover:bg-muted/50"
                onClick={() => toggleExpand(encounter.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  {/* Expand icon */}
                  <div className="mt-0.5">
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    ) : isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5 text-sm font-medium">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(new Date(encounter.occurredAt))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(new Date(encounter.occurredAt))}
                      </span>
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs font-normal",
                          STATUS_COLORS[encounter.status] || "bg-gray-100"
                        )}
                      >
                        {encounter.status.replace(/_/g, " ")}
                      </Badge>
                    </div>

                    {/* Chief Complaint */}
                    {encounter.chiefComplaint && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {encounter.chiefComplaint}
                      </p>
                    )}

                    {/* Summary badges */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {encounter.diagnoses.length > 0 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          {encounter.diagnoses.length} diagnosis
                          {encounter.diagnoses.length !== 1 && "es"}
                        </Badge>
                      )}
                      {encounter.prescriptionCount > 0 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          {encounter.prescriptionCount} Rx
                        </Badge>
                      )}
                      {encounter.labOrderCount > 0 && (
                        <Badge variant="outline" className="text-xs font-normal">
                          {encounter.labOrderCount} lab
                          {encounter.labOrderCount !== 1 && "s"}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Doctor */}
                  {encounter.doctorName && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <User className="h-3 w-3" />
                      {encounter.doctorName}
                    </div>
                  )}
                </div>
              </Button>

              {/* Expanded details */}
              {isExpanded && details && (
                <div className="px-4 pb-4 pt-0 border-t bg-muted/20">
                  <div className="pt-4 space-y-4">
                    {/* Vitals summary */}
                    {details.triageRecord && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Vitals
                        </h4>
                        <div className="grid grid-cols-4 gap-2 text-sm">
                          {details.triageRecord.bpSystolic && (
                            <div className="bg-background rounded p-2">
                              <span className="text-xs text-muted-foreground block">
                                BP
                              </span>
                              <span className="font-mono">
                                {details.triageRecord.bpSystolic}/
                                {details.triageRecord.bpDiastolic}
                              </span>
                            </div>
                          )}
                          {details.triageRecord.heartRate && (
                            <div className="bg-background rounded p-2">
                              <span className="text-xs text-muted-foreground block">
                                HR
                              </span>
                              <span className="font-mono">
                                {details.triageRecord.heartRate}
                              </span>
                            </div>
                          )}
                          {details.triageRecord.temperatureC && (
                            <div className="bg-background rounded p-2">
                              <span className="text-xs text-muted-foreground block">
                                Temp
                              </span>
                              <span className="font-mono">
                                {details.triageRecord.temperatureC}°C
                              </span>
                            </div>
                          )}
                          {details.triageRecord.spo2 && (
                            <div className="bg-background rounded p-2">
                              <span className="text-xs text-muted-foreground block">
                                SpO2
                              </span>
                              <span className="font-mono">
                                {details.triageRecord.spo2}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Diagnoses */}
                    {details.diagnoses.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Stethoscope className="h-3 w-3" />
                          Diagnoses
                        </h4>
                        <ul className="space-y-1">
                          {details.diagnoses.map((dx, dxIndex) => (
                            <li
                              key={`dx-${dx.id}-${dxIndex}`}
                              className="flex items-center gap-2 text-sm"
                            >
                              <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-xs flex items-center justify-center font-medium">
                                {dxIndex + 1}
                              </span>
                              <span>{dx.text}</span>
                              {dx.icdCode && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-mono"
                                >
                                  {dx.icdCode}
                                </Badge>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Prescriptions */}
                    {details.prescriptions.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Prescriptions
                        </h4>
                        <div className="space-y-2">
                          {details.prescriptions.map((rx, rxIndex) => (
                            <div
                              key={`rx-${rx.id}-${rxIndex}`}
                              className="bg-background rounded p-2"
                            >
                              {rx.items.map((item, itemIndex) => (
                                <div
                                  key={`rx-item-${rxIndex}-${itemIndex}`}
                                  className="text-sm"
                                >
                                  <span className="font-medium">
                                    {item.medicineName}
                                  </span>
                                  {item.dosage && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      {item.dosage}
                                    </span>
                                  )}
                                  {item.frequency && (
                                    <span className="text-muted-foreground">
                                      {" "}
                                      - {item.frequency}
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lab Orders */}
                    {details.labOrders.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Lab Orders
                        </h4>
                        <div className="space-y-1">
                          {details.labOrders.map((lo, loIndex) => (
                            <div
                              key={`lab-${lo.id}-${loIndex}`}
                              className="flex items-center gap-2 text-sm"
                            >
                              <Badge
                                variant={
                                  lo.status === "RELEASED"
                                    ? "default"
                                    : "secondary"
                                }
                                className="text-xs"
                              >
                                {lo.status}
                              </Badge>
                              <span>
                                {lo.items.map((i) => i.testName).join(", ")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Clinical Impression */}
                    {details.clinicalImpression && (
                      <div>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                          Clinical Impression
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {details.clinicalImpression}
                        </p>
                      </div>
                    )}

                    {/* Procedures */}
                    {isProceduresData(details.proceduresData) &&
                      (details.proceduresData as ProceduresData).procedures.length > 0 ? (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Procedures
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {(details.proceduresData as ProceduresData).procedures.map(
                              (proc, procIndex) => (
                                <Badge
                                  key={`proc-${procIndex}`}
                                  variant="outline"
                                  className="text-xs"
                                >
                                  {proc.name}
                                </Badge>
                              )
                            )}
                          </div>
                        </div>
                      ) : null}

                    {/* Advice */}
                    {isAdviceData(details.adviceData) &&
                      (details.adviceData as AdviceData).instructions.length > 0 ? (
                        <div>
                          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                            Advice Given
                          </h4>
                          <ul className="text-sm space-y-1 text-muted-foreground">
                            {(details.adviceData as AdviceData).instructions.map(
                              (instruction, instrIndex) => (
                                <li
                                  key={`instr-${instrIndex}`}
                                  className="flex items-start gap-2"
                                >
                                  <span className="text-primary">•</span>
                                  {instruction}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      ) : null}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
