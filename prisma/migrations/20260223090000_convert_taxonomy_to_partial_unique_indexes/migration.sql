-- Convert standard unique constraints to partial unique indexes
-- This allows re-creation of records after soft-delete (deletedAt IS NOT NULL)

-- DiagnosisCategory: Drop standard unique and create partial unique index
DROP INDEX IF EXISTS "DiagnosisCategory_code_key";
CREATE UNIQUE INDEX "DiagnosisCategory_code_key" ON "DiagnosisCategory"("code") WHERE "deletedAt" IS NULL;

-- DiagnosisSubcategory: Drop standard unique and create partial unique index
DROP INDEX IF EXISTS "DiagnosisSubcategory_code_key";
CREATE UNIQUE INDEX "DiagnosisSubcategory_code_key" ON "DiagnosisSubcategory"("code") WHERE "deletedAt" IS NULL;

-- DiagnosisIcdMap: Drop standard unique and create partial unique index
DROP INDEX IF EXISTS "DiagnosisIcdMap_subcategoryId_icd10Code_key";
CREATE UNIQUE INDEX "DiagnosisIcdMap_subcategoryId_icd10Code_key" ON "DiagnosisIcdMap"("subcategoryId", "icd10Code") WHERE "deletedAt" IS NULL;
