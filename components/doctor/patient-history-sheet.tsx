"use client"

import { useState, useEffect, useCallback } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  ClipboardList,
  Stethoscope,
  Pill,
  FlaskConical,
  Activity,
} from "lucide-react"
import { getPatientHistoryAction } from "@/actions/doctor/get-patient-history"
import { getEncounterDetailsAction } from "@/actions/doctor/get-encounter-details"
import type {
  PatientHistoryResult,
  HistoricalEncounterDetails,
} from "@/lib/types/patient-history"
import { EncounterTimeline } from "./history/encounter-timeline"
import { DiagnosisHistory } from "./history/diagnosis-history"
import { MedicationHistory } from "./history/medication-history"
import { LabResultsHistory } from "./history/lab-results-history"
import { VitalsTrend } from "./history/vitals-trend"

interface PatientHistorySheetProps {
  patientId: string
  patientName: string
  isOpen: boolean
  onClose: () => void
}

export function PatientHistorySheet({
  patientId,
  patientName,
  isOpen,
  onClose,
}: PatientHistorySheetProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [history, setHistory] = useState<PatientHistoryResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("encounters")

  // Cache for expanded encounter details
  const [encounterDetailsCache, setEncounterDetailsCache] = useState<
    Map<string, HistoricalEncounterDetails>
  >(new Map())
  const [loadingEncounterId, setLoadingEncounterId] = useState<string | null>(null)

  // Fetch history when sheet opens
  useEffect(() => {
    if (isOpen && patientId) {
      setIsLoading(true)
      setError(null)

      getPatientHistoryAction({ patientId, limit: 20 })
        .then((result) => {
          if (result.ok) {
            setHistory(result.data)
          } else {
            setError(result.error.message)
          }
        })
        .catch(() => {
          setError("Failed to load patient history")
        })
        .finally(() => {
          setIsLoading(false)
        })
    }
  }, [isOpen, patientId])

  // Reset state when sheet closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab("encounters")
    }
  }, [isOpen])

  // Load encounter details on demand
  const loadEncounterDetails = useCallback(
    async (encounterId: string) => {
      // Check cache first
      if (encounterDetailsCache.has(encounterId)) {
        return encounterDetailsCache.get(encounterId)!
      }

      setLoadingEncounterId(encounterId)
      try {
        const result = await getEncounterDetailsAction({ encounterId })
        if (result.ok) {
          setEncounterDetailsCache((prev) => {
            const newCache = new Map(prev)
            newCache.set(encounterId, result.data)
            return newCache
          })
          return result.data
        }
        return null
      } finally {
        setLoadingEncounterId(null)
      }
    },
    [encounterDetailsCache]
  )

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl md:max-w-2xl lg:max-w-3xl flex flex-col p-0"
      >
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-4 border-b bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold tracking-tight">
                Patient History
              </SheetTitle>
              <SheetDescription className="text-sm mt-0.5">
                {patientName}
              </SheetDescription>
            </div>
            {history && (
              <Badge variant="secondary" className="font-mono text-xs">
                {history.totalEncounters} encounter{history.totalEncounters !== 1 && "s"}
              </Badge>
            )}
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            </div>
          ) : history && history.encounters.length === 0 ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center text-muted-foreground">
                <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No encounter history found</p>
                <p className="text-xs mt-1">This is the patient&apos;s first visit</p>
              </div>
            </div>
          ) : history ? (
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col h-full"
            >
              <div className="px-4 pt-4 border-b bg-background">
                <TabsList className="w-full h-9 grid grid-cols-5 gap-1">
                  <TabsTrigger
                    value="encounters"
                    className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <ClipboardList className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Encounters</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="diagnoses"
                    className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Stethoscope className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Diagnoses</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="medications"
                    className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Pill className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Meds</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="labs"
                    className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <FlaskConical className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Labs</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="vitals"
                    className="text-xs gap-1.5 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  >
                    <Activity className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Vitals</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <TabsContent value="encounters" className="m-0 p-4">
                  <EncounterTimeline
                    encounters={history.encounters}
                    encounterDetailsCache={encounterDetailsCache}
                    loadingEncounterId={loadingEncounterId}
                    onLoadDetails={loadEncounterDetails}
                  />
                </TabsContent>

                <TabsContent value="diagnoses" className="m-0 p-4">
                  <DiagnosisHistory diagnoses={history.aggregatedDiagnoses} />
                </TabsContent>

                <TabsContent value="medications" className="m-0 p-4">
                  <MedicationHistory medications={history.aggregatedMedications} />
                </TabsContent>

                <TabsContent value="labs" className="m-0 p-4">
                  <LabResultsHistory encounters={history.encounters} />
                </TabsContent>

                <TabsContent value="vitals" className="m-0 p-4">
                  <VitalsTrend vitalsHistory={history.vitalsHistory} />
                </TabsContent>
              </ScrollArea>
            </Tabs>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
