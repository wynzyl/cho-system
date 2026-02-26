# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CHO (City Health Office) System - A medical records and clinic management system for Philippine City Health Offices. Built with Next.js 16 App Router, Prisma 7, and PostgreSQL.

## Current Implementation Status

### Completed
- **Auth** - Login/logout, JWT sessions, role-based guards
- **Patients Module** - Search, create, edit, detail view, PhilHealth fields
- **Triage Module** - Queue (FIFO), vitals capture, status workflow
- **Allergy Module** - Patient allergy tracking with severity levels, allergy banner, NKA confirmation
- **Database Schema** - 20+ models fully defined with soft deletes
- **Reference Data** - 34 barangays, 10 diagnosis categories, 86 subcategories, 148 ICD-10 codes
- **App Shell** - Layout, sidebar, navbar, responsive design

### In Progress
- **Appointments/Doctor Module** - Route exists, queue not implemented
- **Diagnosis Entry** - Backend taxonomy ready, UI not started

### Not Started
- **Laboratory Module** - Queue, result upload, release workflow
- **Pharmacy Module** - Dispense queue, inventory management
- **Admin Features** - User CRUD, dashboard KPIs, reports

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npx prisma db seed   # Seed database with test users
npx prisma migrate dev --name <name>  # Create new migration
npx prisma generate  # Regenerate Prisma client
npx prisma db push   # Push schema changes without migration (dev only)
```

## Architecture

### Folder Structure (Strict Separation)

- **`actions/`** - Server actions by domain: auth/, patients/, encounters/, triage/, doctor/
- **`app/`** - Routes only (UI + navigation). No business logic.
- **`lib/`** - Infrastructure: db/, auth/, validators/, constants/, utils/
- **`components/`** - Reusable UI only. No DB logic. Subdirs: layout/, ui/, forms/, tables/, triage/
- **`hooks/`** - Custom React hooks

### Key Patterns

**Prisma 7.x with Adapter**: Uses `@prisma/adapter-pg` with connection pooling:
```typescript
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

**Soft Deletes**: All medical data uses `deletedAt`/`deletedById` fields. Never hard delete patient/encounter data.

**Partial Unique Indexes**: Unique constraints use `WHERE deletedAt IS NULL` to allow re-creation after soft delete.

**ActionResult Pattern**: All server actions return:
```typescript
type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fieldErrors?: Record<string, string[]> } }
```

## Roles & Access Control

Six roles: ADMIN, REGISTRATION, TRIAGE, DOCTOR, LAB, PHARMACY

- Enforce at 3 levels: route guard, server action validation, audit logging
- UI hiding is NOT security - always validate server-side

### Auth Guards
```typescript
// Page protection (redirects)
const session = await requireSession()      // → /login if no session
const session = await requireRole(["DOCTOR", "LAB"])  // → /unauthorized if wrong role

// Action protection (throws AuthError)
const session = await requireSessionForAction()  // throws AuthError("UNAUTHORIZED")
const session = await requireRoleForAction(["PHARMACY"])  // throws AuthError("FORBIDDEN")
```

## UI Design

**Always invoke the frontend-design skill before writing any frontend code.**
**Doctors Dashboard should be compact and easy access to patients informations.

## Database Rules

- Core flow: PATIENT → ENCOUNTER → ACTION
- One active encounter per patient (enforced by partial unique index on WAIT_TRIAGE status)
- Encounter statuses: WAIT_TRIAGE → TRIAGED → WAIT_DOCTOR → IN_CONSULT → FOR_LAB/FOR_PHARMACY → DONE
- Stock cannot go below zero; every change creates InventoryTxn
- All audit logs include: userId, userName, action, entity, entityId, timestamp

## Test Users (Seeded)

8 users across roles/facilities. Password for all: `password123`
- `admin` (ADMIN), `registration` (REGISTRATION), `triage` (TRIAGE)
- `doctor` (DOCTOR), `lab` (LAB), `pharmacy` (PHARMACY)
- Barangay staff: `brgy_anonas_reg`, `brgy_anonas_triage`


## Module Requirements

### Patient Flow
```
Patients (create/search) → Triage (vitals) → Appointments (doctor) → Lab/Pharmacy → Done
```

### A) Patients (REGISTRATION role) ✅ Implemented
- Search by name, DOB, patient ID, phone
- High-density patient table with pagination
- Add/edit patient with PhilHealth fields
- Allergy display and management (banner + detailed card)
- Forward to triage (creates encounter with WAIT_TRIAGE status)

### B) Triage (TRIAGE role) ✅ Implemented
- Queue: Today's patients with status=WAIT_TRIAGE
- FIFO claiming system (one patient per nurse)
- Vitals form: BP, HR, RR, Temp, SpO2, Weight, Height, chief complaint
- Allergy management: Add/edit/remove allergies, confirm NKA status
- Submit → status becomes TRIAGED

### C) Appointments (DOCTOR role) ⚠️ Route only
- Tabs: Today / Upcoming / Completed
- Doctor sees only their assigned appointments
- Consultation view: patient summary, triage vitals, diagnosis, orders, prescriptions
- Statuses: WAIT_DOCTOR → IN_CONSULT → FOR_LAB/FOR_PHARMACY → DONE
- Make UI simple but has ALL the information needed in examining a Patient.

### D) Laboratory (LAB role) ❌ Not started
- Tabs: Pending / In Progress / Released
- View requested tests, upload results, release action
- Main facility only performs lab work

### E) Pharmacy (PHARMACY role) ❌ Not started
- Queue: prescriptions for dispense
- Dispense button → inventory OUT transaction
- Inventory panel: low stock alerts, adjustments

### F) Users (ADMIN role) ⚠️ Route only
- List users, add/edit, assign role + facility
- Reset password / deactivate

### PhilHealth Integration
PhilHealth data captured in patient registration (not separate module):
- Membership type, eligibility period, principal/dependent status
- Stored with patient, displayed in detail view and encounters
- No external API for MVP


### RULES NON NEGOTIABLE
- Do NOT build dashboards before scope logic exists. Multi-facility
enforcement is mandatory from Day 1.

