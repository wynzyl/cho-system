/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `DiagnosisCategory` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subcategoryId,icd10Code]` on the table `DiagnosisIcdMap` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `DiagnosisSubcategory` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BloodType" AS ENUM ('A_POSITIVE', 'A_NEGATIVE', 'B_POSITIVE', 'B_NEGATIVE', 'AB_POSITIVE', 'AB_NEGATIVE', 'O_POSITIVE', 'O_NEGATIVE', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "PhilHealthMembershipType" AS ENUM ('EMPLOYED', 'SELF_EMPLOYED', 'INDIGENT', 'OFW', 'LIFETIME', 'DEPENDENT', 'OTHER');

-- CreateEnum
CREATE TYPE "AllergySeverity" AS ENUM ('MILD', 'MODERATE', 'SEVERE');

-- CreateEnum
CREATE TYPE "AllergyStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'RESOLVED');

-- CreateEnum
CREATE TYPE "PatientAllergyStatus" AS ENUM ('UNKNOWN', 'NKA', 'HAS_ALLERGIES');

-- DropIndex
DROP INDEX "DiagnosisCategory_code_key";

-- DropIndex
DROP INDEX "DiagnosisIcdMap_subcategoryId_icd10Code_key";

-- DropIndex
DROP INDEX "DiagnosisSubcategory_code_key";

-- DropIndex
DROP INDEX "Patient_patientCode_active_unique";

-- DropIndex
DROP INDEX "Patient_philhealthNo_active_unique";

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "allergyConfirmedAt" TIMESTAMP(3),
ADD COLUMN     "allergyConfirmedById" TEXT,
ADD COLUMN     "allergyStatus" "PatientAllergyStatus" NOT NULL DEFAULT 'UNKNOWN',
ADD COLUMN     "bloodType" "BloodType" DEFAULT 'UNKNOWN',
ADD COLUMN     "philhealthEligibilityEnd" TIMESTAMP(3),
ADD COLUMN     "philhealthEligibilityStart" TIMESTAMP(3),
ADD COLUMN     "philhealthMembershipType" "PhilHealthMembershipType",
ADD COLUMN     "philhealthPrincipalPin" TEXT,
ADD COLUMN     "philhealthUpdatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "PatientAllergy" (
    "id" TEXT NOT NULL,
    "patientId" TEXT NOT NULL,
    "allergen" TEXT NOT NULL,
    "category" TEXT,
    "severity" "AllergySeverity" NOT NULL,
    "reaction" TEXT,
    "status" "AllergyStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "deletedById" TEXT,

    CONSTRAINT "PatientAllergy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientAllergy_patientId_idx" ON "PatientAllergy"("patientId");

-- CreateIndex
CREATE INDEX "PatientAllergy_allergen_idx" ON "PatientAllergy"("allergen");

-- CreateIndex
CREATE INDEX "PatientAllergy_severity_idx" ON "PatientAllergy"("severity");

-- CreateIndex
CREATE INDEX "PatientAllergy_status_idx" ON "PatientAllergy"("status");

-- CreateIndex
CREATE INDEX "PatientAllergy_deletedAt_idx" ON "PatientAllergy"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisCategory_code_key" ON "DiagnosisCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisIcdMap_subcategoryId_icd10Code_key" ON "DiagnosisIcdMap"("subcategoryId", "icd10Code");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisSubcategory_code_key" ON "DiagnosisSubcategory"("code");

-- CreateIndex
CREATE INDEX "Patient_allergyStatus_idx" ON "Patient"("allergyStatus");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_allergyConfirmedById_fkey" FOREIGN KEY ("allergyConfirmedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAllergy" ADD CONSTRAINT "PatientAllergy_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAllergy" ADD CONSTRAINT "PatientAllergy_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientAllergy" ADD CONSTRAINT "PatientAllergy_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "Patient_philhealthNo_idx" RENAME TO "Patient_PhilhealthNo_idx";
