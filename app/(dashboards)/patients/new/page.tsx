import { requireRole } from "@/lib/auth/guards"
import { PatientForm } from "@/components/forms/patient-form"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

export default async function NewPatientPage() {
  await requireRole(["REGISTRATION"])

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

      <h1 className="text-2xl font-semibold">New Patient</h1>

      <div className="max-w-2xl">
        <PatientForm mode="create" />
      </div>
    </div>
  )
}
