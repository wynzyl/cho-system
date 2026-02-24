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

-- DropIndex
DROP INDEX "DiagnosisCategory_code_key";

-- DropIndex
DROP INDEX "DiagnosisIcdMap_subcategoryId_icd10Code_key";

-- DropIndex
DROP INDEX "DiagnosisSubcategory_code_key";

-- AlterTable
ALTER TABLE "Patient" ADD COLUMN     "bloodType" "BloodType" DEFAULT 'UNKNOWN',
ADD COLUMN     "philhealthEligibilityEnd" TIMESTAMP(3),
ADD COLUMN     "philhealthEligibilityStart" TIMESTAMP(3),
ADD COLUMN     "philhealthMembershipType" "PhilHealthMembershipType",
ADD COLUMN     "philhealthPrincipalPin" TEXT,
ADD COLUMN     "philhealthUpdatedAt" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisCategory_code_key" ON "DiagnosisCategory"("code");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisIcdMap_subcategoryId_icd10Code_key" ON "DiagnosisIcdMap"("subcategoryId", "icd10Code");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisSubcategory_code_key" ON "DiagnosisSubcategory"("code");
