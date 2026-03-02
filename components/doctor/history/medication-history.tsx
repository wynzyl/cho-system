"use client"

import { Pill, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { AggregatedMedication } from "@/lib/types/patient-history"

interface MedicationHistoryProps {
  medications: AggregatedMedication[]
}

export function MedicationHistory({ medications }: MedicationHistoryProps) {
  if (medications.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Pill className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No medication history found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          {medications.length} unique medication{medications.length !== 1 && "s"}
        </h3>
      </div>

      {medications.map((med, index) => (
        <Card key={`med-hist-${med.medicineName}-${index}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Pill className="h-4 w-4 text-purple-500" />
                  <h4 className="font-medium text-sm">{med.medicineName}</h4>
                </div>

                {/* Dosages used */}
                {med.dosages.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {med.dosages.map((dosage, dosageIndex) => (
                      <Badge
                        key={`dosage-${index}-${dosageIndex}`}
                        variant="outline"
                        className="text-xs"
                      >
                        {dosage}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span>
                    Last prescribed: {formatDate(new Date(med.lastPrescribed))}
                  </span>
                </div>
              </div>

              {/* Frequency indicator */}
              <div className="text-right">
                <span className="text-lg font-semibold">
                  {med.prescriptionCount}
                </span>
                <span className="text-xs text-muted-foreground block">
                  time{med.prescriptionCount !== 1 && "s"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
