-- AlterTable: add claim fields for multi-user FIFO triage queue
ALTER TABLE "Encounter" ADD COLUMN "claimedById" TEXT;
ALTER TABLE "Encounter" ADD COLUMN "claimedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Encounter" ADD CONSTRAINT "Encounter_claimedById_fkey" FOREIGN KEY ("claimedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
