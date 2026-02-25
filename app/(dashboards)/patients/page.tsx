"use client"

import { useEffect, useState, useTransition, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PatientsTable } from "@/components/tables/patients-table"
import {
  searchPatientsAction,
  type PatientSearchResult,
} from "@/actions/patients"
import { createEncounterAction } from "@/actions/encounters"
import { Search, Plus, Loader2 } from "lucide-react"
import { useSession } from "@/hooks/use-session"

export default function PatientsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { session } = useSession()

  const [isPending, startTransition] = useTransition()
  const [isStartingEncounter, setIsStartingEncounter] = useState(false)
  const [patients, setPatients] = useState<PatientSearchResult[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)
  const [query, setQuery] = useState(searchParams.get("q") ?? "")
  const [searchInput, setSearchInput] = useState(query)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [encounterError, setEncounterError] = useState<string | null>(null)
  const [encounterNotice, setEncounterNotice] = useState<string | null>(null)

  const canEdit = session?.role === "REGISTRATION" || session?.role === "ADMIN"
  const canStartEncounter = session?.role === "REGISTRATION" || session?.role === "ADMIN"

  const fetchPatients = useCallback(() => {
    startTransition(async () => {
      try {
        const result = await searchPatientsAction({ query, page, pageSize })
        if (result.ok) {
          setPatients(result.data.patients)
          setTotal(result.data.total)
          setFetchError(null)
        } else {
          setFetchError(result.error.message || "Failed to load patients")
        }
      } catch {
        setFetchError("Failed to load patients")
      }
    })
  }, [query, page, pageSize])

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setQuery(searchInput)
    setPage(1)
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1)
  }

  const handleStartEncounter = async (patientId: string) => {
    setIsStartingEncounter(true)
    setEncounterError(null)
    try {
      const result = await createEncounterAction({ patientId })
      if (result.ok) {
        router.push(`/patients/${patientId}`)
      } else {
        setEncounterError(result.error.message || "Failed to start encounter")
      }
    } finally {
      setIsStartingEncounter(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>
        {canEdit && (
          <Button onClick={() => router.push("/patients/new")}>
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        )}
      </div>

      {fetchError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {fetchError}
        </div>
      )}

      {encounterError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {encounterError}
        </div>
      )}

      {encounterNotice && (
        <div className="rounded-md bg-primary/10 p-3 text-sm text-primary">
          {encounterNotice}
        </div>
      )}

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search patients by name, phone, or patient code..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      <PatientsTable
        patients={patients}
        total={total}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onStartEncounter={handleStartEncounter}
        isLoading={isPending || isStartingEncounter}
        canEdit={canEdit}
        canStartEncounter={canStartEncounter}
      />
    </div>
  )
}
