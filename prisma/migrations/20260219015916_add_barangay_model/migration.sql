/*
  Warnings:

  - You are about to drop the column `barangay` on the `Patient` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Patient" DROP COLUMN "barangay",
ADD COLUMN     "barangayId" TEXT;

-- CreateTable
CREATE TABLE "Barangay" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Barangay_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Barangay_code_key" ON "Barangay"("code");

-- CreateIndex
CREATE INDEX "Barangay_name_idx" ON "Barangay"("name");

-- CreateIndex
CREATE INDEX "Barangay_isActive_idx" ON "Barangay"("isActive");

-- CreateIndex
CREATE INDEX "Patient_barangayId_idx" ON "Patient"("barangayId");

-- AddForeignKey
ALTER TABLE "Patient" ADD CONSTRAINT "Patient_barangayId_fkey" FOREIGN KEY ("barangayId") REFERENCES "Barangay"("id") ON DELETE SET NULL ON UPDATE CASCADE;
