"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Plus,
  X,
  FileText,
  AlertTriangle,
  Loader2,
} from "lucide-react"
import {
  addDiagnosisAction,
  removeDiagnosisAction,
  type DiagnosisForConsult,
} from "@/actions/doctor"
import { searchSubcategoriesAction, type SubcategorySearchResult } from "@/actions/doctor/diagnosis"

interface AssessmentSectionProps {
  encounterId: string
  diagnoses: DiagnosisForConsult[]
  clinicalImpression: string
  onClinicalImpressionChange: (value: string) => void
  onDiagnosesChange: () => void
  disabled?: boolean
}

export function AssessmentSection({
  encounterId,
  diagnoses,
  clinicalImpression,
  onClinicalImpressionChange,
  onDiagnosesChange,
  disabled = false,
}: AssessmentSectionProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<SubcategorySearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [customDiagnosis, setCustomDiagnosis] = useState("")
  const [showCustomInput, setShowCustomInput] = useState(false)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
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
  }

  const addDiagnosis = (subcategory: SubcategorySearchResult) => {
    startTransition(async () => {
      const defaultIcd = subcategory.icdMappings?.find((m) => m.isDefault)
      const text = defaultIcd
        ? `${subcategory.name} (${defaultIcd.icd10Code})`
        : subcategory.name

      const result = await addDiagnosisAction({
        encounterId,
        text,
        subcategoryId: subcategory.id,
      })

      if (result.ok) {
        setSearchQuery("")
        setSearchResults([])
        onDiagnosesChange()
      }
    })
  }

  const addCustomDiagnosis = () => {
    if (!customDiagnosis.trim()) return

    startTransition(async () => {
      const result = await addDiagnosisAction({
        encounterId,
        text: customDiagnosis.trim(),
        subcategoryId: null,
      })

      if (result.ok) {
        setCustomDiagnosis("")
        setShowCustomInput(false)
        onDiagnosesChange()
      }
    })
  }

  const removeDiagnosis = (diagnosisId: string) => {
    startTransition(async () => {
      const result = await removeDiagnosisAction({ diagnosisId })
      if (result.ok) {
        onDiagnosesChange()
      }
    })
  }

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-purple-600" />
        <h3 className="font-semibold">Assessment & Diagnosis</h3>
      </div>

      {/* Clinical Impression */}
      <div className="space-y-2">
        <Label htmlFor="clinical-impression">Clinical Impression</Label>
        <Textarea
          id="clinical-impression"
          value={clinicalImpression}
          onChange={(e) => onClinicalImpressionChange(e.target.value)}
          disabled={disabled}
          placeholder="Summary of clinical findings and assessment..."
          rows={3}
          className="resize-none"
        />
      </div>

      {/* Diagnosis Search */}
      <div className="space-y-2">
        <Label>Diagnoses</Label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            disabled={disabled || isPending}
            placeholder="Search diagnosis (e.g., Dengue, Hypertension, URTI)..."
            className="pl-9"
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
          )}
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="max-h-60 overflow-y-auto rounded-lg border bg-white dark:bg-slate-900">
            {searchResults.map((result) => {
              const defaultIcd = result.icdMappings?.find((m) => m.isDefault)
              return (
                <button
                  key={result.id}
                  onClick={() => addDiagnosis(result)}
                  disabled={disabled || isPending}
                  className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{result.name}</span>
                      {result.isNotifiable && (
                        <Badge variant="destructive" className="h-4 px-1 text-[10px]">
                          NOTIFIABLE
                        </Badge>
                      )}
                    </div>
                    {defaultIcd && (
                      <p className="text-xs text-muted-foreground">
                        {defaultIcd.icd10Code} - {defaultIcd.icdTitle}
                      </p>
                    )}
                  </div>
                  <Plus className="h-4 w-4 text-muted-foreground" />
                </button>
              )
            })}
          </div>
        )}

        {/* Custom Diagnosis Input */}
        {showCustomInput ? (
          <div className="flex gap-2">
            <Input
              value={customDiagnosis}
              onChange={(e) => setCustomDiagnosis(e.target.value)}
              placeholder="Enter custom diagnosis..."
              disabled={disabled || isPending}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addCustomDiagnosis()
                }
              }}
            />
            <Button
              size="sm"
              onClick={addCustomDiagnosis}
              disabled={disabled || isPending || !customDiagnosis.trim()}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowCustomInput(false)
                setCustomDiagnosis("")
              }}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCustomInput(true)}
            disabled={disabled}
          >
            <Plus className="mr-1 h-3 w-3" />
            Add Custom Diagnosis
          </Button>
        )}
      </div>

      {/* Current Diagnoses */}
      {diagnoses.length > 0 ? (
        <div className="space-y-2">
          <Label className="text-xs uppercase tracking-wider text-muted-foreground">
            Added Diagnoses
          </Label>
          <div className="space-y-2">
            {diagnoses.map((diagnosis, index) => (
              <div
                key={diagnosis.id}
                className="flex items-start justify-between rounded-lg border bg-white p-3 dark:bg-slate-900"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100 text-xs font-medium text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{diagnosis.text}</p>
                    {diagnosis.subcategory && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {diagnosis.subcategory.code}
                        </Badge>
                        {diagnosis.subcategory.icdMappings
                          .filter((m) => m.isDefault)
                          .map((icd) => (
                            <Badge
                              key={icd.icd10Code}
                              variant="secondary"
                              className="text-xs"
                            >
                              {icd.icd10Code}
                            </Badge>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => removeDiagnosis(diagnosis.id)}
                  disabled={disabled || isPending}
                  className="shrink-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed p-6 text-center">
          <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-amber-500" />
          <p className="font-medium text-amber-600">No diagnoses added</p>
          <p className="mt-1 text-sm text-muted-foreground">
            At least one diagnosis is required to complete the consultation
          </p>
        </div>
      )}
    </div>
  )
}
