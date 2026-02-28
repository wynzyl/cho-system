"use client"

import { useState, useCallback } from "react"
import { Search, X, Plus, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { searchSubcategoriesAction, type SubcategorySearchResult } from "@/actions/doctor/diagnosis"
import { addDiagnosisAction, removeDiagnosisAction, type DiagnosisForConsult } from "@/actions/doctor"
import { toast } from "sonner"
import { useDebouncedCallback } from "use-debounce"

interface AssessmentSectionProps {
  encounterId: string
  diagnoses: DiagnosisForConsult[]
  clinicalImpression: string | null
  onClinicalImpressionChange: (value: string) => void
  onDiagnosisAdded: () => void
  onDiagnosisRemoved: () => void
}

export function AssessmentSection({
  encounterId,
  diagnoses,
  clinicalImpression,
  onClinicalImpressionChange,
  onDiagnosisAdded,
  onDiagnosisRemoved,
}: AssessmentSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SubcategorySearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [removingId, setRemovingId] = useState<string | null>(null)
  const [customDiagnosis, setCustomDiagnosis] = useState("")

  // Debounced search
  const debouncedSearch = useDebouncedCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const result = await searchSubcategoriesAction({ query, limit: 10 })
      if (result.ok) {
        setSearchResults(result.data)
      }
    } finally {
      setIsSearching(false)
    }
  }, 300)

  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    debouncedSearch(value)
  }

  const handleAddDiagnosis = useCallback(
    async (text: string, subcategoryId?: string) => {
      setIsAdding(true)
      try {
        const result = await addDiagnosisAction({
          encounterId,
          text,
          subcategoryId: subcategoryId ?? null,
        })
        if (result.ok) {
          toast.success("Diagnosis added")
          setSearchQuery("")
          setSearchResults([])
          setCustomDiagnosis("")
          onDiagnosisAdded()
        } else {
          toast.error(result.error.message)
        }
      } finally {
        setIsAdding(false)
      }
    },
    [encounterId, onDiagnosisAdded]
  )

  const handleRemoveDiagnosis = async (diagnosisId: string) => {
    setRemovingId(diagnosisId)
    try {
      const result = await removeDiagnosisAction({ diagnosisId })
      if (result.ok) {
        toast.success("Diagnosis removed")
        onDiagnosisRemoved()
      } else {
        toast.error(result.error.message)
      }
    } finally {
      setRemovingId(null)
    }
  }

  const handleSelectResult = (result: SubcategorySearchResult) => {
    // Get the default ICD code title if available
    const defaultIcd = result.icdMappings?.find((m) => m.isDefault)
    const text = defaultIcd ? `${result.name} (${defaultIcd.icd10Code})` : result.name
    handleAddDiagnosis(text, result.id)
  }

  return (
    <div className="space-y-6">
      {/* Clinical Impression */}
      <div className="space-y-2">
        <Label>Clinical Impression / Assessment</Label>
        <Textarea
          placeholder="Enter your clinical assessment and impression..."
          value={clinicalImpression ?? ""}
          onChange={(e) => onClinicalImpressionChange(e.target.value)}
          rows={3}
        />
      </div>

      {/* Current Diagnoses */}
      <div className="space-y-2">
        <Label>Diagnoses ({diagnoses.length})</Label>
        {diagnoses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No diagnoses added yet. At least one diagnosis is required to complete the consultation.
          </p>
        ) : (
          <div className="space-y-2">
            {diagnoses.map((diagnosis, index) => (
              <div
                key={diagnosis.id}
                className="flex items-start justify-between gap-2 rounded-lg border bg-muted/30 p-3"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                      {index + 1}
                    </span>
                    <span className="font-medium">{diagnosis.text}</span>
                  </div>
                  {diagnosis.subcategory && (
                    <div className="mt-1 flex items-center gap-2 pl-7 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {diagnosis.subcategory.code}
                      </Badge>
                      {diagnosis.subcategory.icdMappings?.find((m) => m.isDefault) && (
                        <span className="font-mono text-xs">
                          ICD-10: {diagnosis.subcategory.icdMappings.find((m) => m.isDefault)?.icd10Code}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleRemoveDiagnosis(diagnosis.id)}
                  disabled={removingId === diagnosis.id}
                >
                  {removingId === diagnosis.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search / Add Diagnosis */}
      <div className="space-y-3 rounded-lg border p-4">
        <Label>Add Diagnosis</Label>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search diagnoses (e.g., dengue, hypertension, UTI)..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-h-64 overflow-y-auto rounded-lg border">
            {searchResults.map((result) => (
              <button
                type="button"
                key={result.id}
                className="flex w-full items-start gap-3 border-b px-3 py-2 text-left transition-colors hover:bg-muted/50 last:border-b-0"
                onClick={() => handleSelectResult(result)}
                disabled={isAdding}
              >
                <div className="flex-1">
                  <div className="font-medium">{result.name}</div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-[10px]">
                      {result.category.code}
                    </Badge>
                    <span className="font-mono">
                      {result.icdMappings?.find((m) => m.isDefault)?.icd10Code ?? result.code}
                    </span>
                  </div>
                </div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {/* Custom Diagnosis */}
        <div className="flex items-center gap-2 pt-2">
          <Input
            placeholder="Or enter custom diagnosis..."
            value={customDiagnosis}
            onChange={(e) => setCustomDiagnosis(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customDiagnosis.trim()) {
                e.preventDefault()
                handleAddDiagnosis(customDiagnosis.trim())
              }
            }}
          />
          <Button
            type="button"
            onClick={() => handleAddDiagnosis(customDiagnosis.trim())}
            disabled={!customDiagnosis.trim() || isAdding}
          >
            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </Button>
        </div>
      </div>
    </div>
  )
}
