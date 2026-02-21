-- CreateEnum
CREATE TYPE "DiagnosisCategory" AS ENUM ('INFECTIOUS', 'NOTIFIABLE_DISEASE', 'ANIMAL_BITE', 'CHRONIC', 'MATERNAL', 'MATERNAL_CHILD', 'TRAUMA');

-- AlterTable
ALTER TABLE "Diagnosis" ADD COLUMN     "diagnosisCodeId" TEXT;

-- CreateTable
CREATE TABLE "DiagnosisCode" (
    "id" TEXT NOT NULL,
    "icd10Code" VARCHAR(10) NOT NULL,
    "title" TEXT NOT NULL,
    "category" "DiagnosisCategory" NOT NULL,
    "isNotifiable" BOOLEAN NOT NULL DEFAULT false,
    "requiresLab" BOOLEAN NOT NULL DEFAULT false,
    "requiresReferral" BOOLEAN NOT NULL DEFAULT false,
    "isAnimalBiteCase" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosisCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisCode_icd10Code_key" ON "DiagnosisCode"("icd10Code");

-- CreateIndex
CREATE INDEX "DiagnosisCode_category_idx" ON "DiagnosisCode"("category");

-- CreateIndex
CREATE INDEX "DiagnosisCode_isNotifiable_idx" ON "DiagnosisCode"("isNotifiable");

-- CreateIndex
CREATE INDEX "DiagnosisCode_isActive_idx" ON "DiagnosisCode"("isActive");

-- CreateIndex
CREATE INDEX "DiagnosisCode_isAnimalBiteCase_idx" ON "DiagnosisCode"("isAnimalBiteCase");

-- CreateIndex
CREATE INDEX "Diagnosis_diagnosisCodeId_idx" ON "Diagnosis"("diagnosisCodeId");

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_diagnosisCodeId_fkey" FOREIGN KEY ("diagnosisCodeId") REFERENCES "DiagnosisCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;
