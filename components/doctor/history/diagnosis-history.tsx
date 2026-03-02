"use client"

import { Stethoscope, TrendingUp, Calendar } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { formatDate } from "@/lib/utils"
import type { AggregatedDiagnosis } from "@/lib/types/patient-history"

interface DiagnosisHistoryProps {
  diagnoses: AggregatedDiagnosis[]
}

export function DiagnosisHistory({ diagnoses }: DiagnosisHistoryProps) {
  if (diagnoses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Stethoscope className="h-12 w-12 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No diagnosis history found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">
          {diagnoses.length} unique diagnosis
          {diagnoses.length !== 1 && "es"}
        </h3>
      </div>

      {diagnoses.map((dx, index) => (
        <Card key={`dx-hist-${dx.text}-${index}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-medium text-sm">{dx.text}</h4>
                  {dx.icdCode && (
                    <Badge variant="secondary" className="font-mono text-xs">
                      {dx.icdCode}
                    </Badge>
                  )}
                  {dx.subcategoryCode && (
                    <Badge variant="outline" className="text-xs">
                      {dx.subcategoryCode}
                    </Badge>
                  )}
                </div>

                {dx.subcategoryName && dx.subcategoryName !== dx.text && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {dx.subcategoryName}
                  </p>
                )}

                <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>
                      First: {formatDate(new Date(dx.firstOccurrence))}
                    </span>
                  </div>
                  {dx.count > 1 && (
                    <div className="flex items-center gap-1">
                      <span>
                        Last: {formatDate(new Date(dx.lastOccurrence))}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Frequency indicator */}
              <div className="text-right">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-lg font-semibold">{dx.count}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  occurrence{dx.count !== 1 && "s"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
