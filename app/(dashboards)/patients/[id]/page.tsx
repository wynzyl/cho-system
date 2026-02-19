import { notFound } from "next/navigation"
import Link from "next/link"
import { requireRole } from "@/lib/auth/guards"
import { getPatientAction } from "@/actions/patients"
import { PatientDetailView } from "./patient-detail-view"
import { ChevronLeft } from "lucide-react"

interface PatientDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ edit?: string }>
}

export default async function PatientDetailPage({
  params,
  searchParams,
}: PatientDetailPageProps) {
  const session = await requireRole(["REGISTRATION", "TRIAGE", "DOCTOR"])
  const { id } = await params
  const { edit } = await searchParams

  const result = await getPatientAction(id)

  if (!result.ok) {
    notFound()
  }

  const patient = result.data
  const canEdit = session.role === "REGISTRATION" || session.role === "ADMIN"
  const canStartEncounter = session.role === "REGISTRATION" || session.role === "ADMIN"
  const isEditMode = edit === "true" && canEdit

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/patients"
          className="flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Back to Patients
        </Link>
      </div>

      <PatientDetailView
        patient={patient}
        canEdit={canEdit}
        canStartEncounter={canStartEncounter}
        isEditMode={isEditMode}
      />
    </div>
  )
}
