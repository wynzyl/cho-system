"use client"

import { useState, useEffect, useTransition } from "react"
import { Plus, Loader2, Stethoscope, X, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { addDiagnosisAction, type EncounterDetails } from "@/actions/doctor"

interface DiagnosisSectionProps {
  encounter: EncounterDetails
  onSuccess: () => void
  disabled?: boolean
}

type DiagnosisCode = {
  id: string
  icd10Code: string
  title: string
}

export function DiagnosisSection({
  encounter,
  onSuccess,
  disabled = false,
}: DiagnosisSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [text, setText] = useState("")
  const [selectedCode, setSelectedCode] = useState<DiagnosisCode | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [codes, setCodes] = useState<DiagnosisCode[]>([])
  const [codeSearch, setCodeSearch] = useState("")
  const [isLoadingCodes, setIsLoadingCodes] = useState(false)
  const [codePopoverOpen, setCodePopoverOpen] = useState(false)

  // Fetch ICD-10 codes when search changes
  useEffect(() => {
    if (!codeSearch || codeSearch.length < 2) {
      setCodes([])
      return
    }

    const controller = new AbortController()
    setIsLoadingCodes(true)

    fetch(`/api/diagnosis-codes?q=${encodeURIComponent(codeSearch)}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.ok) {
          setCodes(data.data.codes)
        }
      })
      .catch(() => {
        // Ignore abort errors
      })
      .finally(() => {
        setIsLoadingCodes(false)
      })

    return () => controller.abort()
  }, [codeSearch])

  const handleSubmit = () => {
    if (!text.trim()) {
      setError("Diagnosis text is required")
      return
    }

    setError(null)
    startTransition(async () => {
      const result = await addDiagnosisAction({
        encounterId: encounter.id,
        text: text.trim(),
        diagnosisCodeId: selectedCode?.id ?? null,
      })

      if (result.ok) {
        setText("")
        setSelectedCode(null)
        setDialogOpen(false)
        onSuccess()
      } else {
        setError(result.error.message)
      }
    })
  }

  const handleOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setText("")
      setSelectedCode(null)
      setError(null)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Stethoscope className="h-5 w-5" />
            Diagnoses
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setDialogOpen(true)}
            disabled={disabled}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {encounter.diagnoses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No diagnoses recorded</p>
        ) : (
          <div className="space-y-2">
            {encounter.diagnoses.map((diagnosis) => (
              <div
                key={diagnosis.id}
                className="rounded-md border bg-card p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{diagnosis.text}</p>
                  {diagnosis.diagnosisCode && (
                    <Badge variant="outline" className="shrink-0">
                      {diagnosis.diagnosisCode.icd10Code}
                    </Badge>
                  )}
                </div>
                {diagnosis.diagnosisCode && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {diagnosis.diagnosisCode.title}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Diagnosis</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="diagnosis-text">
                Diagnosis <span className="text-destructive">*</span>
              </Label>
              <Input
                id="diagnosis-text"
                placeholder="Enter diagnosis..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label>ICD-10 Code (Optional)</Label>
              <Popover open={codePopoverOpen} onOpenChange={setCodePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start font-normal"
                    disabled={isPending}
                  >
                    {selectedCode ? (
                      <span className="flex items-center gap-2">
                        <Badge variant="secondary">{selectedCode.icd10Code}</Badge>
                        <span className="truncate">{selectedCode.title}</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Search className="h-4 w-4" />
                        Search ICD-10 codes...
                      </span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command shouldFilter={false}>
                    <CommandInput
                      placeholder="Search by code or title..."
                      value={codeSearch}
                      onValueChange={setCodeSearch}
                    />
                    <CommandList>
                      {isLoadingCodes ? (
                        <div className="flex items-center justify-center py-6">
                          <Loader2 className="h-4 w-4 animate-spin" />
                        </div>
                      ) : codes.length === 0 ? (
                        <CommandEmpty>
                          {codeSearch.length < 2
                            ? "Type at least 2 characters to search"
                            : "No codes found"}
                        </CommandEmpty>
                      ) : (
                        <CommandGroup>
                          {codes.map((code) => (
                            <CommandItem
                              key={code.id}
                              value={code.id}
                              onSelect={() => {
                                setSelectedCode(code)
                                setText(code.title)
                                setCodePopoverOpen(false)
                              }}
                            >
                              <Badge variant="outline" className="mr-2">
                                {code.icd10Code}
                              </Badge>
                              <span className="truncate">{code.title}</span>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {selectedCode && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedCode.icd10Code}</Badge>
                  <span className="text-sm text-muted-foreground truncate">
                    {selectedCode.title}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1"
                    onClick={() => setSelectedCode(null)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={isPending || !text.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Diagnosis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
