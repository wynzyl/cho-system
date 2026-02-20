"use client"

import { useState, useCallback } from "react"
import { Search, UserPlus, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  searchPatientsAction,
  type PatientSearchResult,
} from "@/actions/patients"
import {
  createEncounterForPatientAction,
  createPatientAndEncounterAction,
} from "@/actions/triage"

type TabType = "search" | "new"

interface AddToQueueDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: (encounterId: string) => void
}

export function AddToQueueDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddToQueueDialogProps) {
  const [activeTab, setActiveTab] = useState<TabType>("search")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Search tab state
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<PatientSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  // New patient tab state
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [birthDate, setBirthDate] = useState("")
  const [sex, setSex] = useState<string>("UNKNOWN")
  const [phone, setPhone] = useState("")
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  const resetState = useCallback(() => {
    setActiveTab("search")
    setIsLoading(false)
    setError(null)
    setSearchQuery("")
    setSearchResults([])
    setIsSearching(false)
    setHasSearched(false)
    setFirstName("")
    setLastName("")
    setBirthDate("")
    setSex("UNKNOWN")
    setPhone("")
    setFieldErrors({})
  }, [])

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetState()
    }
    onOpenChange(newOpen)
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsSearching(true)
    setError(null)
    setHasSearched(true)

    const result = await searchPatientsAction({
      query: searchQuery.trim(),
      page: 1,
      pageSize: 10,
    })

    setIsSearching(false)

    if (result.ok) {
      setSearchResults(result.data.patients)
    } else {
      setError(result.error.message)
    }
  }

  const handleAddExistingPatient = async (patientId: string) => {
    setIsLoading(true)
    setError(null)

    const result = await createEncounterForPatientAction({ patientId })

    setIsLoading(false)

    if (result.ok) {
      onSuccess(result.data.encounterId)
      handleOpenChange(false)
    } else {
      setError(result.error.message)
    }
  }

  const handleCreateNewPatient = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setFieldErrors({})

    const result = await createPatientAndEncounterAction({
      firstName,
      lastName,
      birthDate: new Date(birthDate),
      sex: sex as "MALE" | "FEMALE" | "OTHER" | "UNKNOWN",
      phone: phone || undefined,
    })

    setIsLoading(false)

    if (result.ok) {
      onSuccess(result.data.encounterId)
      handleOpenChange(false)
    } else {
      if (result.error.fieldErrors) {
        setFieldErrors(result.error.fieldErrors)
      } else {
        setError(result.error.message)
      }
    }
  }

  const calculateAge = (birthDate: Date): number => {
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--
    }
    return age
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Patient to Queue</DialogTitle>
        </DialogHeader>

        {/* Tab buttons */}
        <div className="flex gap-2 border-b pb-2">
          <Button
            type="button"
            variant={activeTab === "search" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("search")}
            className="gap-2"
          >
            <Search className="h-4 w-4" />
            Search Patient
          </Button>
          <Button
            type="button"
            variant={activeTab === "new" ? "default" : "ghost"}
            size="sm"
            onClick={() => setActiveTab("new")}
            className="gap-2"
          >
            <UserPlus className="h-4 w-4" />
            New Patient
          </Button>
        </div>

        {/* Error display */}
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Search tab */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search by name, patient code, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              {isSearching ? (
                <div className="flex items-center justify-center py-8 text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Searching...
                </div>
              ) : searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((patient) => (
                    <div
                      key={patient.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div>
                        <div className="font-medium">
                          {patient.lastName}, {patient.firstName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {patient.patientCode} &bull;{" "}
                          {calculateAge(new Date(patient.birthDate))}y &bull;{" "}
                          {patient.sex === "MALE"
                            ? "Male"
                            : patient.sex === "FEMALE"
                              ? "Female"
                              : patient.sex}
                        </div>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        onClick={() => handleAddExistingPatient(patient.id)}
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Add to Queue"
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : hasSearched ? (
                <div className="py-8 text-center text-muted-foreground">
                  No patients found. Try a different search or create a new
                  patient.
                </div>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Enter a search term to find patients
                </div>
              )}
            </div>
          </div>
        )}

        {/* New patient tab */}
        {activeTab === "new" && (
          <form onSubmit={handleCreateNewPatient} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  First Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  aria-invalid={!!fieldErrors.firstName}
                  required
                />
                {fieldErrors.firstName && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.firstName[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">
                  Last Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  aria-invalid={!!fieldErrors.lastName}
                  required
                />
                {fieldErrors.lastName && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.lastName[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="birthDate">
                  Birth Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="birthDate"
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  aria-invalid={!!fieldErrors.birthDate}
                  required
                />
                {fieldErrors.birthDate && (
                  <p className="text-xs text-destructive">
                    {fieldErrors.birthDate[0]}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sex">Sex</Label>
                <Select value={sex} onValueChange={setSex}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UNKNOWN">Unknown</SelectItem>
                    <SelectItem value="MALE">Male</SelectItem>
                    <SelectItem value="FEMALE">Female</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone (optional)</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="09XX XXX XXXX"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create & Add to Queue
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
