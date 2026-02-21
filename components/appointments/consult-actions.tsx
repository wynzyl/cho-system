"use client"

import { useTransition } from "react"
import { Play, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { startConsultAction, completeConsultationAction, type EncounterDetails } from "@/actions/doctor"

interface ConsultActionsProps {
  encounter: EncounterDetails
  onSuccess: () => void
}

export function ConsultActions({ encounter, onSuccess }: ConsultActionsProps) {
  const [isPendingStart, startStartTransition] = useTransition()
  const [isPendingComplete, startCompleteTransition] = useTransition()

  const handleStartConsult = () => {
    startStartTransition(async () => {
      const result = await startConsultAction({ encounterId: encounter.id })
      if (result.ok) {
        onSuccess()
      }
    })
  }

  const handleCompleteConsult = () => {
    startCompleteTransition(async () => {
      const result = await completeConsultationAction({ encounterId: encounter.id })
      if (result.ok) {
        onSuccess()
      }
    })
  }

  const isPending = isPendingStart || isPendingComplete
  const canStart = encounter.status === "WAIT_DOCTOR"
  const canComplete = encounter.status === "IN_CONSULT"
  const hasDiagnosis = encounter.diagnoses.length > 0
  const hasPrescription = encounter.prescriptions.length > 0

  if (!canStart && !canComplete) {
    return null
  }

  return (
    <Card>
      <CardContent className="pt-4">
        {canStart && (
          <Button
            className="w-full"
            size="lg"
            onClick={handleStartConsult}
            disabled={isPending}
          >
            {isPendingStart ? (
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            ) : (
              <Play className="mr-2 h-5 w-5" />
            )}
            Start Consultation
          </Button>
        )}

        {canComplete && (
          <div className="space-y-3">
            {!hasDiagnosis && (
              <div className="rounded-md bg-amber-500/10 px-3 py-2 text-sm text-amber-600 dark:text-amber-400">
                Add at least one diagnosis before completing
              </div>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  className="w-full"
                  size="lg"
                  variant={hasDiagnosis ? "default" : "secondary"}
                  disabled={isPending || !hasDiagnosis}
                >
                  {isPendingComplete ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <CheckCircle className="mr-2 h-5 w-5" />
                  )}
                  Complete Consultation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Complete Consultation</AlertDialogTitle>
                  <AlertDialogDescription className="space-y-2">
                    <p>Are you sure you want to complete this consultation?</p>
                    <div className="mt-3 rounded-md bg-muted p-3 text-sm">
                      <p className="font-medium">Summary:</p>
                      <ul className="mt-1 list-inside list-disc text-muted-foreground">
                        <li>{encounter.diagnoses.length} diagnosis(es)</li>
                        <li>{encounter.prescriptions.length} prescription(s)</li>
                      </ul>
                      <p className="mt-2">
                        Patient will be{" "}
                        <span className="font-medium">
                          {hasPrescription
                            ? "forwarded to Pharmacy"
                            : "marked as Done"}
                        </span>
                      </p>
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCompleteConsult}>
                    Complete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
