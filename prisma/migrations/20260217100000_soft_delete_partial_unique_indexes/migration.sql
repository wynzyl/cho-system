-- Convert unique constraints to partial unique indexes for soft-delete compatibility
-- These indexes only enforce uniqueness on non-deleted rows (WHERE "deletedAt" IS NULL)

-- Facility.code
DROP INDEX "Facility_code_key";
CREATE UNIQUE INDEX "Facility_code_key" ON "Facility"("code") WHERE "deletedAt" IS NULL;

-- User.email
DROP INDEX "User_email_key";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email") WHERE "deletedAt" IS NULL;

-- Patient.patientCode
DROP INDEX "Patient_patientCode_key";
CREATE UNIQUE INDEX "Patient_patientCode_key" ON "Patient"("patientCode") WHERE "deletedAt" IS NULL;

-- Patient.PhilhealthNo (mapped from philhealthNo)
DROP INDEX "Patient_PhilhealthNo_key";
CREATE UNIQUE INDEX "Patient_PhilhealthNo_key" ON "Patient"("PhilhealthNo") WHERE "deletedAt" IS NULL;

-- Medicine.code
DROP INDEX "Medicine_code_key";
CREATE UNIQUE INDEX "Medicine_code_key" ON "Medicine"("code") WHERE "deletedAt" IS NULL;

-- InventoryLevel (facilityId, medicineId)
DROP INDEX "InventoryLevel_facilityId_medicineId_key";
CREATE UNIQUE INDEX "InventoryLevel_facilityId_medicineId_key" ON "InventoryLevel"("facilityId", "medicineId") WHERE "deletedAt" IS NULL;
