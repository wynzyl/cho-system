-- AlterTable
ALTER TABLE "Diagnosis" ADD COLUMN     "subcategoryId" TEXT;

-- CreateTable
CREATE TABLE "DiagnosisCategory" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosisCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosisSubcategory" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isNotifiable" BOOLEAN NOT NULL DEFAULT false,
    "isAnimalBite" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosisSubcategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiagnosisIcdMap" (
    "id" TEXT NOT NULL,
    "subcategoryId" TEXT NOT NULL,
    "icd10Code" TEXT NOT NULL,
    "icdTitle" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiagnosisIcdMap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisCategory_code_key" ON "DiagnosisCategory"("code");

-- CreateIndex
CREATE INDEX "DiagnosisCategory_isActive_idx" ON "DiagnosisCategory"("isActive");

-- CreateIndex
CREATE INDEX "DiagnosisCategory_sortOrder_idx" ON "DiagnosisCategory"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisSubcategory_code_key" ON "DiagnosisSubcategory"("code");

-- CreateIndex
CREATE INDEX "DiagnosisSubcategory_categoryId_idx" ON "DiagnosisSubcategory"("categoryId");

-- CreateIndex
CREATE INDEX "DiagnosisSubcategory_isActive_idx" ON "DiagnosisSubcategory"("isActive");

-- CreateIndex
CREATE INDEX "DiagnosisSubcategory_isNotifiable_idx" ON "DiagnosisSubcategory"("isNotifiable");

-- CreateIndex
CREATE INDEX "DiagnosisSubcategory_isAnimalBite_idx" ON "DiagnosisSubcategory"("isAnimalBite");

-- CreateIndex
CREATE INDEX "DiagnosisIcdMap_icd10Code_idx" ON "DiagnosisIcdMap"("icd10Code");

-- CreateIndex
CREATE INDEX "DiagnosisIcdMap_subcategoryId_idx" ON "DiagnosisIcdMap"("subcategoryId");

-- CreateIndex
CREATE INDEX "DiagnosisIcdMap_isActive_idx" ON "DiagnosisIcdMap"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "DiagnosisIcdMap_subcategoryId_icd10Code_key" ON "DiagnosisIcdMap"("subcategoryId", "icd10Code");

-- CreateIndex
CREATE INDEX "Diagnosis_subcategoryId_idx" ON "Diagnosis"("subcategoryId");

-- AddForeignKey
ALTER TABLE "Diagnosis" ADD CONSTRAINT "Diagnosis_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "DiagnosisSubcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisSubcategory" ADD CONSTRAINT "DiagnosisSubcategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "DiagnosisCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisIcdMap" ADD CONSTRAINT "DiagnosisIcdMap_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "DiagnosisSubcategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
