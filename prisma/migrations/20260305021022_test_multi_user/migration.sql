-- AlterTable
ALTER TABLE "Encounter" ADD COLUMN     "adviceData" JSONB,
ADD COLUMN     "clinicalImpression" TEXT,
ADD COLUMN     "consultEndedAt" TIMESTAMP(3),
ADD COLUMN     "consultStartedAt" TIMESTAMP(3),
ADD COLUMN     "hpiDoctorNotes" JSONB,
ADD COLUMN     "physicalExamData" JSONB,
ADD COLUMN     "proceduresData" JSONB;

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "familyHistoryData" JSONB,
ADD COLUMN     "isAlcohol" BOOLEAN,
ADD COLUMN     "isSmoker" BOOLEAN,
ADD COLUMN     "medicalHistoryData" JSONB,
ADD COLUMN     "medicalHistoryUpdatedAt" TIMESTAMP(3),
ADD COLUMN     "medicalHistoryUpdatedById" TEXT,
ADD COLUMN     "pregnancyStatus" TEXT,
ADD COLUMN     "pregnancyWeeks" INTEGER,
ADD COLUMN     "smokingPackYears" INTEGER,
ADD COLUMN     "socialHistoryData" JSONB;

-- AlterTable
ALTER TABLE "TriageRecord" ADD COLUMN     "associatedSymptoms" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "exposureFlags" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "exposureNotes" TEXT,
ADD COLUMN     "painSeverity" INTEGER,
ADD COLUMN     "symptomDuration" TEXT,
ADD COLUMN     "symptomOnset" TEXT;

-- CreateIndex
CREATE INDEX "Encounter_doctorId_status_idx" ON "Encounter"("doctorId", "status");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_medicalHistoryUpdatedById_fkey" FOREIGN KEY ("medicalHistoryUpdatedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
