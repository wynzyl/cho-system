# CHO System - Project Status

**Last Updated:** March 6, 2026

## Overview

CHO (City Health Office) System is a medical records and clinic management system for Philippine City Health Offices. Built with Next.js 16, Prisma 7, and PostgreSQL.

---

## Current Build Status


| Metric     | Status                                  |
| ---------- | --------------------------------------- |
| Build      | Passing                                 |
| TypeScript | No errors                               |
| Lint       | 9 warnings (pre-existing, non-blocking) |
| Database   | Synced with 6 migrations                |


---

## Module Implementation Status

### Core Infrastructure


| Component                 | Status | Notes                                                       |
| ------------------------- | ------ | ----------------------------------------------------------- |
| Database Schema           | Done   | 20+ models, soft deletes, audit logging                     |
| Prisma 7 + pg adapter     | Done   | Connection pooling configured                               |
| Authentication            | Done   | JWT sessions, bcrypt, httpOnly cookies                      |
| Role-Based Access Control | Done   | 6 roles: ADMIN, REGISTRATION, TRIAGE, DOCTOR, LAB, PHARMACY |
| Scope Enforcement         | Done   | FACILITY_ONLY and CITY_WIDE scopes                          |
| Multi-Facility Support    | Done   | MAIN + BARANGAY facility types                              |
| Audit Logging             | Done   | Denormalized user fields for attribution                    |
| Route Guards              | Done   | requireSession, requireRole helpers                         |
| Shared Utilities          | Done   | Date utils, action helpers, shared enums                    |
| Reusable Form Components  | Done   | FormErrorMessage, FormFieldGroup, SectionHeader             |


### Modules by Workflow Stage

#### 1. Patient Registration (REGISTRATION role)


| Feature                      | Status | Notes                                                                      |
| ---------------------------- | ------ | -------------------------------------------------------------------------- |
| Patient search               | Done   | Name, DOB, phone, patient code                                             |
| Patient list table           | Done   | Pagination, sorting                                                        |
| Create patient               | Done   | Full form with validation                                                  |
| Edit patient                 | Done   | Update patient details                                                     |
| View patient details         | Done   | `/patients/[id]` route                                                     |
| Barangay selection           | Done   | 34 Urdaneta barangays seeded                                               |
| PhilHealth registration data | Done   | Membership type, eligibility dates, principal PIN, validation, detail card |
| Forward to triage            | Done   | Creates encounter with WAIT_TRIAGE status                                  |


#### 2. Triage (TRIAGE role)


| Feature                    | Status | Notes                                           |
| -------------------------- | ------ | ----------------------------------------------- |
| Triage queue               | Done   | Today's patients with WAIT_TRIAGE status        |
| FIFO claiming system       | Done   | One patient per nurse, prevents queue jumping   |
| Vitals form                | Done   | BP, HR, RR, Temp, SpO2, Weight, Height          |
| Chief complaint            | Done   | Text field in encounter                         |
| Submit triage              | Done   | Creates TriageRecord, updates status to TRIAGED |
| Quick patient registration | Done   | Register + forward to triage in one action      |
| Allergy management         | Done   | Add/edit/remove allergies, confirm NKA status   |


#### 2.5 Allergy Module (Cross-Module)


| Feature                    | Status | Notes                                           |
| -------------------------- | ------ | ----------------------------------------------- |
| Patient allergy tracking   | Done   | Track allergies with severity levels            |
| Allergy banner             | Done   | Prominent display on patient views              |
| NKA confirmation           | Done   | Explicit "No Known Allergies" confirmation      |
| Severity levels            | Done   | Supports mild, moderate, severe classifications |


#### 3. Doctor Consultation (DOCTOR role)


| Feature              | Status      | Notes                                    |
| -------------------- | ----------- | ---------------------------------------- |
| Appointments page    | Done        | FIFO queue with claim/rollback system    |
| FIFO claiming system | Done        | One patient per doctor, prevents jumping |
| Patient summary view | Not Started | Triage vitals display                    |
| Diagnosis entry      | Partial     | Taxonomy backend done, UI not started    |
| Lab orders           | Not Started | LabOrder model exists                    |
| Prescriptions        | Not Started | Prescription model exists                |


#### 4. Laboratory (LAB role)


| Feature         | Status      | Notes                         |
| --------------- | ----------- | ----------------------------- |
| Laboratory page | Partial     | Route exists, placeholder UI  |
| Lab order queue | Not Started | View pending orders           |
| Result upload   | Not Started | File upload + structured data |
| Result release  | Not Started | Status change workflow        |


#### 5. Pharmacy (PHARMACY role)


| Feature              | Status      | Notes                             |
| -------------------- | ----------- | --------------------------------- |
| Pharmacy page        | Partial     | Route exists, placeholder UI      |
| Dispense queue       | Not Started | View prescriptions for dispensing |
| Medicine inventory   | Not Started | Stock levels per facility         |
| Dispense transaction | Not Started | Stock deduction workflow          |


#### 6. Admin Dashboard (ADMIN role)


| Feature             | Status      | Notes                         |
| ------------------- | ----------- | ----------------------------- |
| Dashboard page      | Partial     | Route exists, needs KPI cards |
| User management     | Partial     | Route exists, needs CRUD UI   |
| Settings page       | Partial     | Route exists, placeholder     |
| Facility management | Not Started | Add/edit facilities           |
| Reports             | Not Started | Future phase                  |


---

## Recently Completed

### March 2026

#### Codebase Refactoring (March 6)

Major refactoring to eliminate code duplication and improve maintainability:

**New Shared Utilities (10 files created):**
| File | Purpose |
|------|---------|
| `lib/constants/enums.ts` | Shared enum definitions for validators |
| `lib/utils/date.ts` | Date utilities (getTodayDateRange, getClaimExpiryThreshold, CLAIM_EXPIRY_MS) |
| `lib/utils/action-helpers.ts` | Action helpers (notFoundError, forbiddenError, createAuditLog) |
| `lib/validators/refinements.ts` | Shared Zod refinements |
| `components/ui/form-error-message.tsx` | FormErrorMessage, FormErrorBanner components |
| `components/forms/form-field-group.tsx` | FormFieldGroup, FormFieldWrapper components |
| `components/forms/section-header.tsx` | SectionHeader, FormSection components |
| `components/forms/patient/*.tsx` | Patient form split into 3 section components |

**Files Refactored (12 files updated):**
- `lib/validators/patient.ts` - Uses shared enums and refinements
- `lib/validators/patient-form.ts` - Reduced ~40 lines using shared enums
- `lib/db/queries.ts` - Added findEncounterWithAccess helper
- `actions/triage/*` - Uses date utils and action helpers
- `actions/doctor/*` - Uses date utils, action helpers, createAuditLog
- `components/forms/patient-form.tsx` - Refactored to use section components

**Impact:**
- ~150+ lines of duplicate code eliminated
- Patient form split into 7 maintainable sections
- 8 duplicate error patterns consolidated to reusable components
- Claim expiry logic centralized (was duplicated in 3+ files)
- Audit logging simplified with createAuditLog helper

#### FIFO Queue System for Doctor Appointments
- Implemented FIFO claiming system for doctor appointments
- Claim/rollback mechanism to prevent queue jumping
- One patient per doctor at a time
- Bug fixes for FIFO edge cases (PR #24)

#### Allergy Module
- Patient allergy tracking with severity levels (mild, moderate, severe)
- Allergy banner prominently displayed on patient views
- NKA (No Known Allergies) explicit confirmation workflow
- Allergy management integrated into triage workflow

### February 2026

#### Diagnosis Taxonomy System

Implemented a 3-layer diagnosis taxonomy with ICD-10 mapping:


| Component            | Count | Details                                                                                |
| -------------------- | ----- | -------------------------------------------------------------------------------------- |
| DiagnosisCategory    | 10    | ACUTE, TROPICAL, ANIMAL_ENV, CHRONIC, MCH, REPRO, TRAUMA, PUBLIC_HEALTH, MENTAL, OTHER |
| DiagnosisSubcategory | 86    | Clinical names (e.g., Dengue Fever, Hypertension)                                      |
| DiagnosisIcdMap      | 148   | ICD-10 codes with titles                                                               |


**Key Features:**

- `isNotifiable` flag for DOH-reportable diseases (dengue, TB, measles, etc.)
- `isAnimalBite` flag for ABTC tracking (dog/cat bites, rabies)
- One subcategory can map to multiple ICD-10 codes
- Diagnosis.subcategoryId is optional (allows free-text diagnoses)

**Server Actions:**

- `getCategoriesAction()` - Fetch categories with nested subcategories
- `searchSubcategoriesAction()` - Search by name, code, or ICD-10

---

## Database Schema Summary

### Core Models

- `Facility` - MAIN and BARANGAY health centers
- `User` - Staff with role and facility assignment
- `Patient` - Patient registry with Philippine-specific fields
- `Encounter` - Visit record linking patient to facility
- `TriageRecord` - Vital signs per encounter

### Clinical Models

- `Diagnosis` - Diagnosis per encounter (linked to taxonomy)
- `DiagnosisCategory` - Top-level grouping
- `DiagnosisSubcategory` - Clinical diagnosis names
- `DiagnosisIcdMap` - ICD-10 code mappings

### Laboratory Models

- `LabOrder` - Lab test requests
- `LabOrderItem` - Individual tests in an order
- `LabResult` - Results with file uploads

### Pharmacy Models

- `Prescription` - Prescription header
- `PrescriptionItem` - Prescription line items
- `Medicine` - Medicine catalog
- `InventoryLevel` - Stock per facility
- `StockLot` - Batch tracking with expiry
- `InventoryTxn` - Stock movement audit
- `DispenseTxn` - Dispensing transactions
- `DispenseItem` - Dispensed items

### System Models

- `Barangay` - Location reference (34 seeded)
- `AuditLog` - Action audit trail

---

## Test Users


| Email                                                   | Role         | Facility |
| ------------------------------------------------------- | ------------ | -------- |
| [admin@cho.local](mailto:admin@cho.local)               | ADMIN        | CHO-MAIN |
| [registration@cho.local](mailto:registration@cho.local) | REGISTRATION | CHO-MAIN |
| [doctor.main@cho.local](mailto:doctor.main@cho.local)   | DOCTOR       | CHO-MAIN |
| [doctor.brgy1@cho.local](mailto:doctor.brgy1@cho.local) | DOCTOR       | CHO-BRG1 |
| [triage.main@cho.local](mailto:triage.main@cho.local)   | TRIAGE       | CHO-MAIN |
| [triage.brgy2@cho.local](mailto:triage.brgy2@cho.local) | TRIAGE       | CHO-BRG2 |
| [lab@cho.local](mailto:lab@cho.local)                   | LAB          | CHO-MAIN |
| [pharmacy@cho.local](mailto:pharmacy@cho.local)         | PHARMACY     | CHO-MAIN |


---

## Technical Debt / Known Issues

1. **React Hook Form warnings** - `watch()` incompatibility with React Compiler (non-blocking)
2. **TanStack Table warnings** - `useReactTable()` memoization warnings (non-blocking)
3. **useEffect dependency warning** in vitals-form.tsx (minor)

---

## Environment

- **Framework:** Next.js 16.1.6 (Turbopack)
- **ORM:** Prisma 7.4.0
- **Database:** PostgreSQL
- **Node:** Latest LTS
- **Package Manager:** npm

