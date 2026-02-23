-- RevertMigration: Drop DiagnosisCode model and related schema

-- Drop FK constraint
ALTER TABLE "Diagnosis" DROP CONSTRAINT IF EXISTS "Diagnosis_diagnosisCodeId_fkey";

-- Drop index
DROP INDEX IF EXISTS "Diagnosis_diagnosisCodeId_idx";

-- Drop column
ALTER TABLE "Diagnosis" DROP COLUMN IF EXISTS "diagnosisCodeId";

-- Drop table
DROP TABLE IF EXISTS "DiagnosisCode";

-- Drop enum
DROP TYPE IF EXISTS "DiagnosisCategory";
