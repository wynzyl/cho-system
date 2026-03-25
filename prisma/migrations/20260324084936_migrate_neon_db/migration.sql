-- AlterTable
ALTER TABLE "Encounter" ADD COLUMN     "cancellationReason" TEXT,
ADD COLUMN     "cancelledAt" TIMESTAMP(3),
ADD COLUMN     "cancelledById" TEXT;

-- CreateIndex
CREATE INDEX "Encounter_cancelledAt_idx" ON "Encounter"("cancelledAt");

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_cancelledById_fkey" FOREIGN KEY ("cancelledById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
