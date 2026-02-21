"use client"

import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EncounterCard } from "./encounter-card"
import type { UnclaimedEncounterItem, MyQueueItem } from "@/actions/doctor"

interface EncounterQueueProps {
  unclaimedEncounters: UnclaimedEncounterItem[]
  myQueueEncounters: MyQueueItem[]
  selectedId: string | null
  onSelect: (id: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  isLoading: boolean
  activeTab: "unclaimed" | "my-queue"
  onTabChange: (tab: "unclaimed" | "my-queue") => void
  onClaimEncounter: (encounterId: string) => Promise<void>
}

export function EncounterQueue({
  unclaimedEncounters,
  myQueueEncounters,
  selectedId,
  onSelect,
  searchQuery,
  onSearchChange,
  isLoading,
  activeTab,
  onTabChange,
  onClaimEncounter,
}: EncounterQueueProps) {
  const filterItems = <T extends { patientName: string; patientCode: string }>(
    items: T[]
  ): T[] => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(
      (item) =>
        item.patientName.toLowerCase().includes(query) ||
        item.patientCode.toLowerCase().includes(query)
    )
  }

  const filteredUnclaimed = filterItems(unclaimedEncounters)
  const filteredMyQueue = filterItems(myQueueEncounters)

  return (
    <div className="flex h-full flex-col">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id="encounter-queue-search"
          aria-label="Search patients by name or ID"
          placeholder="Search patients by name or ID..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9"
        />
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(v) => onTabChange(v as "unclaimed" | "my-queue")}
        className="mt-4 flex flex-1 flex-col"
      >
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="unclaimed">
            Unclaimed ({unclaimedEncounters.length})
          </TabsTrigger>
          <TabsTrigger value="my-queue">
            My Queue ({myQueueEncounters.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unclaimed" className="mt-3 flex-1 overflow-y-auto">
          <div className="space-y-3">
            {isLoading ? (
              <>
                <QueueCardSkeleton />
                <QueueCardSkeleton />
                <QueueCardSkeleton />
              </>
            ) : filteredUnclaimed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No patients match your search"
                    : "No unclaimed patients"}
                </p>
              </div>
            ) : (
              filteredUnclaimed.map((item) => (
                <EncounterCard
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  onClick={() => onSelect(item.id)}
                  showClaimButton
                  onClaim={() => onClaimEncounter(item.id)}
                />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="my-queue" className="mt-3 flex-1 overflow-y-auto">
          <div className="space-y-3">
            {isLoading ? (
              <>
                <QueueCardSkeleton />
                <QueueCardSkeleton />
                <QueueCardSkeleton />
              </>
            ) : filteredMyQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "No patients match your search"
                    : "No patients in your queue"}
                </p>
              </div>
            ) : (
              filteredMyQueue.map((item) => (
                <EncounterCard
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  onClick={() => onSelect(item.id)}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function QueueCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-1 h-4 w-24" />
          </div>
        </div>
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="mt-3 flex justify-between">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-16" />
      </div>
    </div>
  )
}
