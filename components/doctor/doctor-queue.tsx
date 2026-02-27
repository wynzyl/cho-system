"use client"

import { useState, useEffect, useTransition } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { RefreshCw, Users, Stethoscope } from "lucide-react"
import { cn } from "@/lib/utils"
import { getDoctorQueueAction, type DoctorQueueItem } from "@/actions/doctor"
import { DoctorQueueCard } from "./doctor-queue-card"

interface DoctorQueueProps {
  selectedEncounterId: string | null
  onSelectEncounter: (encounter: DoctorQueueItem) => void
  onStartConsult: (encounterId: string) => void
  currentUserId?: string
  refreshTrigger?: number
}

type QueueTab = "waiting" | "my_consults"

export function DoctorQueue({
  selectedEncounterId,
  onSelectEncounter,
  onStartConsult,
  currentUserId,
  refreshTrigger = 0,
}: DoctorQueueProps) {
  const [queue, setQueue] = useState<DoctorQueueItem[]>([])
  const [isLoading, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<QueueTab>("waiting")
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const fetchQueue = () => {
    startTransition(async () => {
      const result = await getDoctorQueueAction({})
      if (result.ok) {
        setQueue(result.data)
        setLastRefresh(new Date())
      }
    })
  }

  // Initial fetch and refresh on trigger change
  useEffect(() => {
    fetchQueue()
  }, [refreshTrigger])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchQueue, 30000)
    return () => clearInterval(interval)
  }, [])

  // Filter queue based on active tab
  const waitingQueue = queue.filter(
    (item) => item.status === "TRIAGED" || item.status === "WAIT_DOCTOR"
  )
  const myConsults = queue.filter(
    (item) => item.status === "IN_CONSULT" && item.doctorId === currentUserId
  )

  const displayQueue = activeTab === "waiting" ? waitingQueue : myConsults

  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="border-b bg-white p-4 dark:bg-slate-900">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">Patient Queue</h2>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={fetchQueue}
            disabled={isLoading}
            className="shrink-0"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          </Button>
        </div>

        {/* Tab Buttons */}
        <div className="mt-3 flex gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setActiveTab("waiting")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === "waiting"
                ? "bg-white shadow dark:bg-slate-700"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Users className="h-4 w-4" />
            Waiting
            {waitingQueue.length > 0 && (
              <Badge
                variant={activeTab === "waiting" ? "default" : "secondary"}
                className="ml-1 h-5 px-1.5"
              >
                {waitingQueue.length}
              </Badge>
            )}
          </button>
          <button
            onClick={() => setActiveTab("my_consults")}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              activeTab === "my_consults"
                ? "bg-white shadow dark:bg-slate-700"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Stethoscope className="h-4 w-4" />
            My Consults
            {myConsults.length > 0 && (
              <Badge
                variant={activeTab === "my_consults" ? "default" : "secondary"}
                className="ml-1 h-5 px-1.5"
              >
                {myConsults.length}
              </Badge>
            )}
          </button>
        </div>
      </div>

      {/* Queue List */}
      <div className="flex-1 overflow-y-auto p-3">
        {isLoading && queue.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border bg-white p-4 dark:bg-slate-900">
                <Skeleton className="mb-2 h-4 w-3/4" />
                <Skeleton className="mb-3 h-3 w-1/2" />
                <Skeleton className="h-8 w-full" />
              </div>
            ))}
          </div>
        ) : displayQueue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 rounded-full bg-slate-100 p-4 dark:bg-slate-800">
              {activeTab === "waiting" ? (
                <Users className="h-8 w-8 text-slate-400" />
              ) : (
                <Stethoscope className="h-8 w-8 text-slate-400" />
              )}
            </div>
            <h3 className="font-medium text-slate-600 dark:text-slate-400">
              {activeTab === "waiting" ? "No patients waiting" : "No active consultations"}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {activeTab === "waiting"
                ? "Patients will appear here after triage"
                : "Start a consultation from the waiting queue"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayQueue.map((item) => (
              <DoctorQueueCard
                key={item.id}
                item={item}
                isSelected={item.id === selectedEncounterId}
                onSelect={() => onSelectEncounter(item)}
                onStartConsult={() => onStartConsult(item.id)}
                currentUserId={currentUserId}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t bg-white px-4 py-2 text-xs text-muted-foreground dark:bg-slate-900">
        Last updated: {lastRefresh.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}
      </div>
    </div>
  )
}
