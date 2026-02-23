-- AlterTable
ALTER TABLE "DiagnosisCategory" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- AlterTable
ALTER TABLE "DiagnosisIcdMap" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- AlterTable
ALTER TABLE "DiagnosisSubcategory" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "deletedById" TEXT;

-- CreateIndex
CREATE INDEX "DiagnosisCategory_deletedAt_idx" ON "DiagnosisCategory"("deletedAt");

-- CreateIndex
CREATE INDEX "DiagnosisIcdMap_deletedAt_idx" ON "DiagnosisIcdMap"("deletedAt");

-- CreateIndex
CREATE INDEX "DiagnosisSubcategory_deletedAt_idx" ON "DiagnosisSubcategory"("deletedAt");

-- AddForeignKey
ALTER TABLE "DiagnosisCategory" ADD CONSTRAINT "DiagnosisCategory_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisSubcategory" ADD CONSTRAINT "DiagnosisSubcategory_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiagnosisIcdMap" ADD CONSTRAINT "DiagnosisIcdMap_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;
