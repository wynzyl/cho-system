-- Drop existing unique constraints (if they exist)
DROP INDEX IF EXISTS "Patient_patientCode_key";
DROP INDEX IF EXISTS "Patient_PhilhealthNo_key";

-- Create regular indexes for query performance
CREATE INDEX IF NOT EXISTS "Patient_patientCode_idx" ON "Patient" ("patientCode");
CREATE INDEX IF NOT EXISTS "Patient_philhealthNo_idx" ON "Patient" ("PhilhealthNo");

-- Create partial unique indexes (only enforce uniqueness for non-deleted records)
CREATE UNIQUE INDEX "Patient_patientCode_active_unique"
  ON "Patient" ("patientCode")
  WHERE "deletedAt" IS NULL;

CREATE UNIQUE INDEX "Patient_philhealthNo_active_unique"
  ON "Patient" ("PhilhealthNo")
  WHERE "deletedAt" IS NULL AND "PhilhealthNo" IS NOT NULL;
