# CHO System - Project Status

**Last Updated:** February 24, 2026

## Overview

CHO (City Health Office) System is a medical records and clinic management system for Philippine City Health Offices. Built with Next.js 16, Prisma 7, and PostgreSQL.

---

## Current Build Status

| Metric | Status |
|--------|--------|
| Build | Passing |
| TypeScript | No errors |
| Lint | 7 warnings (pre-existing, non-blocking) |
| Database | Synced with 6 migrations |

---

## Module Implementation Status

### Core Infrastructure

| Component | Status | Notes |
|-----------|--------|-------|
| Database Schema | Done | 20+ models, soft deletes, audit logging |
| Prisma 7 + pg adapter | Done | Connection pooling configured |
| Authentication | Done | JWT sessions, bcrypt, httpOnly cookies |
| Role-Based Access Control | Done | 6 roles: ADMIN, REGISTRATION, TRIAGE, DOCTOR, LAB, PHARMACY |
| Scope Enforcement | Done | FACILITY_ONLY and CITY_WIDE scopes |
| Multi-Facility Support | Done | MAIN + BARANGAY facility types |
| Audit Logging | Done | Denormalized user fields for attribution |
| Route Guards | Done | requireSession, requireRole helpers |

### Modules by Workflow Stage

#### 1. Patient Registration (REGISTRATION role)

| Feature | Status | Notes |
|---------|--------|-------|
| Patient search | Done | Name, DOB, phone, patient code |
| Patient list table | Done | Pagination, sorting |
| Create patient | Done | Full form with validation |
| Edit patient | Done | Update patient details |
| View patient details | Done | `/patients/[id]` route |
| Barangay selection | Done | 34 Urdaneta barangays seeded |
| PhilHealth registration data | Done | Membership type, eligibility dates, principal PIN, validation, detail card |
| Forward to triage | Done | Creates encounter with WAIT_TRIAGE status |

#### 2. Triage (TRIAGE role)

| Feature | Status | Notes |
|---------|--------|-------|
| Triage queue | Done | Today's patients with WAIT_TRIAGE status |
| Vitals form | Done | BP, HR, RR, Temp, SpO2, Weight, Height |
| Chief complaint | Done | Text field in encounter |
| Submit triage | Done | Creates TriageRecord, updates status to TRIAGED |
| Quick patient registration | Done | Register + forward to triage in one action |

#### 3. Doctor Consultation (DOCTOR role)

| Feature | Status | Notes |
|---------|--------|-------|
| Appointments page | Partial | Route exists, needs queue implementation |
| Patient summary view | Not Started | Triage vitals display |
| Diagnosis entry | Partial | Taxonomy backend done, UI not started |
| Lab orders | Not Started | LabOrder model exists |
| Prescriptions | Not Started | Prescription model exists |

#### 4. Laboratory (LAB role)

| Feature | Status | Notes |
|---------|--------|-------|
| Laboratory page | Partial | Route exists, placeholder UI |
| Lab order queue | Not Started | View pending orders |
| Result upload | Not Started | File upload + structured data |
| Result release | Not Started | Status change workflow |

#### 5. Pharmacy (PHARMACY role)

| Feature | Status | Notes |
|---------|--------|-------|
| Pharmacy page | Partial | Route exists, placeholder UI |
| Dispense queue | Not Started | View prescriptions for dispensing |
| Medicine inventory | Not Started | Stock levels per facility |
| Dispense transaction | Not Started | Stock deduction workflow |

#### 6. Admin Dashboard (ADMIN role)

| Feature | Status | Notes |
|---------|--------|-------|
| Dashboard page | Partial | Route exists, needs KPI cards |
| User management | Partial | Route exists, needs CRUD UI |
| Settings page | Partial | Route exists, placeholder |
| Facility management | Not Started | Add/edit facilities |
| Reports | Not Started | Future phase |

---

## Recently Completed (February 23, 2026)

### Diagnosis Taxonomy System

Implemented a 3-layer diagnosis taxonomy with ICD-10 mapping:

| Component | Count | Details |
|-----------|-------|---------|
| DiagnosisCategory | 10 | ACUTE, TROPICAL, ANIMAL_ENV, CHRONIC, MCH, REPRO, TRAUMA, PUBLIC_HEALTH, MENTAL, OTHER |
| DiagnosisSubcategory | 86 | Clinical names (e.g., Dengue Fever, Hypertension) |
| DiagnosisIcdMap | 148 | ICD-10 codes with titles |

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



| Email | Role | Facility |
|-------|------|----------|
| admin@cho.local | ADMIN | CHO-MAIN |
| registration@cho.local | REGISTRATION | CHO-MAIN |
| doctor.main@cho.local | DOCTOR | CHO-MAIN |
| doctor.brgy1@cho.local | DOCTOR | CHO-BRG1 |
| triage.main@cho.local | TRIAGE | CHO-MAIN |
| triage.brgy2@cho.local | TRIAGE | CHO-BRG2 |
| lab@cho.local | LAB | CHO-MAIN |
| pharmacy@cho.local | PHARMACY | CHO-MAIN |

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
