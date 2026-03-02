"use client"

import { FlaskConical, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatDate } from "@/lib/utils"
import type { HistoricalEncounterSummary } from "@/lib/types/patient-history"

interface LabResultsHistoryProps {
  encounters: HistoricalEncounterSummary[]
}

const ENCOUNTER_STATUS_COLORS: Record<string, string> = {
  DONE: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  FOR_LAB: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  FOR_PHARMACY: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
}

export function LabResultsHistory({ encounters }: LabResultsHistoryProps) {
  // Filter encounters that have lab orders
  const encountersWithLabs = encounters.filter((enc) => enc.labOrderCount > 0)

  if (encountersWithLabs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <FlaskConical className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No lab results found</p>
        <p className="text-xs mt-1">Lab orders will appear here when requested</p>
      </div>
    )
  }

  // Note: This shows summary info only. For full lab order details,
  // the user can expand the encounter in the Encounters tab.
  // This is intentional to keep this view simple.

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          {encountersWithLabs.length} encounter
          {encountersWithLabs.length !== 1 && "s"} with lab orders
        </h3>
      </div>

      <p className="text-xs text-muted-foreground mb-4">
        View the Encounters tab and expand each visit for detailed lab information.
      </p>

      {encountersWithLabs.map((enc, index) => (
        <Card key={`lab-enc-${enc.id}-${index}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium text-sm">
                    {formatDate(new Date(enc.occurredAt))}
                  </span>
                  <Badge
                    variant="secondary"
                    className={cn(
                      "text-xs",
                      ENCOUNTER_STATUS_COLORS[enc.status] || "bg-gray-100"
                    )}
                  >
                    {enc.status.replace(/_/g, " ")}
                  </Badge>
                </div>

                {enc.chiefComplaint && (
                  <p className="text-xs text-muted-foreground mt-2 line-clamp-1">
                    {enc.chiefComplaint}
                  </p>
                )}

                {/* Diagnoses related to this encounter */}
                {enc.diagnoses.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {enc.diagnoses.slice(0, 3).map((dx, dxIndex) => (
                      <Badge
                        key={`lab-dx-${index}-${dxIndex}`}
                        variant="outline"
                        className="text-xs"
                      >
                        {dx.text}
                      </Badge>
                    ))}
                    {enc.diagnoses.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{enc.diagnoses.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded">
                  <FlaskConical className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    {enc.labOrderCount}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
