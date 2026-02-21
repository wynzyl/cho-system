# CHO System - Project Status

**Last Updated:** 2026-02-21
**Current Branch:** `implement-CHO-ICD10-Codes`
**Stack:** Next.js 16, Prisma 7, PostgreSQL, TypeScript

---

## Current Sprint Focus

Implementing ICD-10 diagnosis codes for CHO reporting requirements.

---

## Implementation Status

### Database Schema

| Entity | Status | Notes |
|--------|--------|-------|
| Facility | COMPLETE | MAIN + BARANGAY types |
| User | COMPLETE | 6 roles, scope enforcement |
| Barangay | COMPLETE | 34 Urdaneta barangays seeded |
| Patient | COMPLETE | Soft delete, patient code format |
| Encounter | COMPLETE | Status flow implemented |
| TriageRecord | COMPLETE | Vital signs capture |
| Diagnosis | COMPLETE | Optional ICD-10 code link |
| DiagnosisCode | COMPLETE | 20 ICD-10 codes, 7 categories |
| Prescription | COMPLETE | Schema only |
| PrescriptionItem | COMPLETE | Schema only |
| LabOrder | COMPLETE | Dual facility references |
| LabOrderItem | COMPLETE | Schema only |
| LabResult | COMPLETE | Revision tracking |
| Medicine | COMPLETE | Schema only |
| InventoryLevel | COMPLETE | Per-facility stock |
| StockLot | COMPLETE | Lot/expiry tracking |
| InventoryTxn | COMPLETE | IN/OUT/ADJUST/DISPENSE |
| DispenseTxn | COMPLETE | Schema only |
| DispenseItem | COMPLETE | Schema only |
| AuditLog | COMPLETE | Denormalized user fields |

### Migrations Applied

```
20260217093116_created_database_schema
20260217095537_add_audit_denorm_fields
20260219015916_add_barangay_model
20260219031836_add_registration_role
20260221060445_add_diagnosis_codes
```

### Pages

| Page | Route | Status |
|------|-------|--------|
| Login | `/login` | COMPLETE |
| Dashboard | `/dashboard` | PARTIAL (shell) |
| Patients List | `/patients` | COMPLETE |
| New Patient | `/patients/new` | COMPLETE |
| Patient Detail | `/patients/[id]` | COMPLETE |
| Triage | `/triage` | COMPLETE |
| Appointments | `/appointments` | SHELL |
| Laboratory | `/laboratory` | SHELL |
| Pharmacy | `/pharmacy` | SHELL |
| Users | `/users` | SHELL |
| Settings | `/settings` | SHELL |
| Profile | `/profile` | COMPLETE |
| Change Password | `/profile/password` | COMPLETE |
| Unauthorized | `/unauthorized` | COMPLETE |

### Server Actions

| Domain | Actions | Status |
|--------|---------|--------|
| auth | login, logout, getSession | COMPLETE |
| patients | CRUD, search, forward to triage | COMPLETE |
| encounters | create, update status | COMPLETE |
| triage | record vitals, submit | COMPLETE |
| doctor | - | NOT STARTED |
| lab | - | NOT STARTED |
| pharmacy | - | NOT STARTED |
| audit | log action | COMPLETE |

### Components

| Category | Components | Status |
|----------|------------|--------|
| layout | AppNavbar, AppSidebar, UserMenu | COMPLETE |
| ui | Button, Input, Card, Dialog, etc. | COMPLETE (shadcn) |
| forms | PatientForm, TriageForm | COMPLETE |
| tables | PatientTable, TriageQueue | COMPLETE |
| triage | TriagePanel, VitalsForm | COMPLETE |

---

## Recent Changes

### 2026-02-21: ICD-10 Diagnosis Codes
- Added `DiagnosisCategory` enum with 7 categories
- Added `DiagnosisCode` model with indexes
- Updated `Diagnosis` model with optional code reference
- Created seed data with 20 ICD-10 codes
- Migration: `add_diagnosis_codes`

### 2026-02-20: Triage Module Enhancement
- Search/add new patient in triage
- Validation improvements

### 2026-02-19: Barangay Data
- Added Barangay model
- Seeded 34 Urdaneta City barangays
- Added REGISTRATION role

---

## Pending Work

### High Priority
1. Doctor module (appointments, diagnosis, orders)
2. Lab workflow (request → process → release)
3. Pharmacy workflow (prescription → dispense → inventory)

### Medium Priority
1. User management CRUD
2. Dashboard KPIs
3. Reports UI for diagnosis categories

### Low Priority
1. Medicine master list management
2. Lab test catalog
3. System settings

---

## Known Issues

1. `npx prisma db seed` fails if existing data has FK constraints - use incremental seed scripts for existing databases
2. Modified files pending commit: `app/layout.tsx`, `components/layout/app-navbar.tsx`

---

## Test Users

All passwords: `Password123!`

| Email | Role | Facility |
|-------|------|----------|
| admin@cho.local | ADMIN | MAIN |
| registration@cho.local | REGISTRATION | MAIN |
| doctor.main@cho.local | DOCTOR | MAIN |
| doctor.brgy1@cho.local | DOCTOR | CHO-BRG1 |
| triage.main@cho.local | TRIAGE | MAIN |
| triage.brgy2@cho.local | TRIAGE | CHO-BRG2 |
| lab@cho.local | LAB | MAIN |
| pharmacy@cho.local | PHARMACY | MAIN |

---

## Commands Reference

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run lint             # ESLint check
npx prisma generate      # Regenerate client
npx prisma migrate dev   # Run migrations
npx prisma db seed       # Seed database
npx prisma studio        # Open Prisma Studio
```

---

## File Structure

```
cho-system/
├── actions/           # Server actions by domain
│   ├── auth/
│   ├── encounters/
│   ├── patients/
│   └── triage/
├── app/
│   ├── (auth)/        # Login page
│   ├── (dashboards)/  # Protected pages
│   └── unauthorized/
├── components/
│   ├── forms/
│   ├── layout/
│   ├── tables/
│   ├── triage/
│   └── ui/
├── lib/
│   ├── auth/          # Session, guards, routes
│   ├── constants/     # Barangays, diagnosis codes
│   ├── db/            # Prisma client
│   ├── utils/
│   └── validators/
├── prisma/
│   ├── migrations/
│   ├── schema.prisma
│   └── seed.ts
└── docs/              # Documentation
```
