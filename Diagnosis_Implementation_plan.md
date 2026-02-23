# Plan: Implement 3-Layer Diagnosis Taxonomy with ICD-10 Mapping

## Summary

Implement a 3-layer diagnosis taxonomy using **models** (not enums) for future flexibility:

1. **DiagnosisCategory** - Practical grouping (e.g., "Tropical Diseases")
2. **DiagnosisSubcategory** - Clinical name used by doctors (e.g., "Dengue Fever")
3. **DiagnosisIcdMap** - ICD-10 code mappings (e.g., A90 → Dengue Fever)

**Key Design Decisions:**
- Models allow admin updates without migrations
- `Diagnosis.subcategoryId` is optional (null = custom/free-text)
- One subcategory can map to multiple ICD-10 codes (e.g., Dengue → A90, A91)
- Flags: `isNotifiable` (DOH reporting), `isAnimalBite` (ABTC tracking)

## Schema Changes

### New Models in `prisma/schema.prisma`

```prisma
model DiagnosisCategory {
  id          String   @id @default(uuid())
  code        String   @unique   // e.g., "TROPICAL", "CHRONIC"
  name        String              // e.g., "Vector-Borne & Tropical Diseases"
  description String?
  sortOrder   Int      @default(0)
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  subcategories DiagnosisSubcategory[]

  @@index([isActive])
  @@index([sortOrder])
}

model DiagnosisSubcategory {
  id           String   @id @default(uuid())
  categoryId   String
  category     DiagnosisCategory @relation(fields: [categoryId], references: [id], onDelete: Restrict, onUpdate: Cascade)
  code         String   @unique   // e.g., "DENGUE", "HYPERTENSION"
  name         String              // e.g., "Dengue Fever"
  description  String?
  isNotifiable Boolean  @default(false)
  isAnimalBite Boolean  @default(false)
  sortOrder    Int      @default(0)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  icdMappings DiagnosisIcdMap[]
  diagnoses   Diagnosis[]

  @@index([categoryId])
  @@index([isActive])
  @@index([isNotifiable])
  @@index([isAnimalBite])
}

model DiagnosisIcdMap {
  id            String   @id @default(uuid())
  subcategoryId String
  subcategory   DiagnosisSubcategory @relation(fields: [subcategoryId], references: [id], onDelete: Cascade, onUpdate: Cascade)
  icd10Code     String              // e.g., "A90", "I10"
  icdTitle      String              // e.g., "Dengue Fever", "Essential Hypertension"
  isDefault     Boolean  @default(false)  // Default ICD code for this subcategory
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@unique([subcategoryId, icd10Code])
  @@index([icd10Code])
  @@index([subcategoryId])
  @@index([isActive])
}
```

### Modify Existing Diagnosis Model

Add optional `subcategoryId` FK:

```prisma
model Diagnosis {
  // ... existing fields ...

  subcategoryId String?
  subcategory   DiagnosisSubcategory? @relation(fields: [subcategoryId], references: [id], onDelete: SetNull, onUpdate: Cascade)

  @@index([subcategoryId])  // Add this index
}
```

## Files to Create

| File | Purpose |
|------|---------|
| `lib/constants/diagnosis-taxonomy.ts` | Seed data: categories, subcategories, ICD mappings |
| `actions/diagnosis/get-categories.ts` | Fetch all categories with nested subcategories |
| `actions/diagnosis/search-subcategories.ts` | Search subcategories by name |
| `actions/diagnosis/index.ts` | Export barrel |
| `lib/validators/diagnosis.ts` | Zod schemas for diagnosis entry |

## Files to Modify

| File | Changes |
|------|---------|
| `prisma/schema.prisma` | Add 3 new models; modify Diagnosis |
| `prisma/seed.ts` | Add taxonomy seeding logic |
| `lib/constants/index.ts` | Export diagnosis taxonomy constants |

## Seed Data Structure

### Categories (10)
```
ACUTE       - Common Acute Conditions
TROPICAL    - Vector-Borne & Tropical Diseases
ANIMAL_ENV  - Animal & Environmental Exposure
CHRONIC     - Chronic Disease Management
MCH         - Maternal & Child Health
REPRO       - Reproductive Health
TRAUMA      - Minor Injuries / Primary Care Trauma
PUBLIC_HEALTH - Public Health & Preventive Cases
MENTAL      - Mental Health
OTHER       - Other Common CHO Encounters
```

### Sample ICD-10 Mappings

| Category | Subcategory | ICD-10 | Title |
|----------|-------------|--------|-------|
| TROPICAL | Dengue Fever | A90 | Dengue Fever |
| TROPICAL | Dengue Hemorrhagic Fever | A91 | Dengue Hemorrhagic Fever |
| TROPICAL | Chikungunya | A92.0 | Chikungunya Virus Disease |
| TROPICAL | Leptospirosis | A27.9 | Leptospirosis, unspecified |
| TROPICAL | Malaria | B54 | Unspecified Malaria |
| ANIMAL_ENV | Dog Bite | W54 | Bitten by Dog |
| ANIMAL_ENV | Cat Bite | W55 | Bitten by Other Mammals |
| ANIMAL_ENV | Rabies Exposure | Z20.3 | Exposure to Rabies |
| CHRONIC | Hypertension | I10 | Essential Hypertension |
| CHRONIC | Type 2 Diabetes | E11.9 | Type 2 DM without Complications |
| CHRONIC | Asthma | J45.9 | Asthma, unspecified |
| CHRONIC | COPD | J44.9 | COPD, unspecified |
| MCH | Normal Pregnancy | Z34.9 | Supervision of Normal Pregnancy |
| MCH | High-Risk Pregnancy | O09.9 | High-Risk Pregnancy |
| MCH | Iron Deficiency Anemia | D50.9 | Iron Deficiency Anemia |
| PUBLIC_HEALTH | Pulmonary TB | A15.9 | Respiratory TB |
| PUBLIC_HEALTH | Extra-pulmonary TB | A18.9 | TB of Other Organs |
| TRAUMA | Open Wound | S01.0 | Open Wound of Scalp |
| TRAUMA | Minor Burn | T30.0 | Burn, unspecified |
| TRAUMA | Sprain | S93.4 | Sprain of Ankle |

## Implementation Steps

### Phase 1: Schema & Migration
1. Add DiagnosisCategory, DiagnosisSubcategory, DiagnosisIcdMap models to schema.prisma
2. Add subcategoryId field to Diagnosis model
3. Run `npx prisma migrate dev --name add_diagnosis_taxonomy`
4. Run `npx prisma generate`

### Phase 2: Seed Data
1. Create `lib/constants/diagnosis-taxonomy.ts` with:
   - DIAGNOSIS_CATEGORIES array (10 categories)
   - DIAGNOSIS_SUBCATEGORIES array (~84 subcategories)
   - DIAGNOSIS_ICD_MAPPINGS array (ICD-10 codes per subcategory)
2. Update `lib/constants/index.ts` to export taxonomy
3. Update `prisma/seed.ts` to seed all 3 tables
4. Run `npx prisma db seed`

### Phase 3: Server Actions
1. Create `lib/validators/diagnosis.ts`
2. Create `actions/diagnosis/get-categories.ts` - returns categories with subcategories and ICD mappings
3. Create `actions/diagnosis/search-subcategories.ts` - search by name or ICD code
4. Create `actions/diagnosis/index.ts`

### Phase 4: Verification
1. `npm run build` - No TypeScript errors
2. `npx prisma studio` - Verify seeded data in all 3 tables
3. Test actions manually

## Verification Checklist

- [ ] Migration runs without errors
- [ ] 10 categories seeded in DiagnosisCategory table
- [ ] ~84 subcategories seeded in DiagnosisSubcategory table
- [ ] ICD-10 mappings seeded in DiagnosisIcdMap table
- [ ] Tropical diseases have `isNotifiable=true`
- [ ] Animal bite cases have `isAnimalBite=true`
- [ ] TB cases have `isNotifiable=true`
- [ ] `npm run build` passes
- [ ] Diagnosis model accepts null subcategoryId (custom text)

## Optional Future implementation
1. Monitoring of animal bites and isnotifiable subcategories diseases
2. Chronic disease monitoring and tracking
3. Follow up schedule for ex. animal bites and other diseases.

