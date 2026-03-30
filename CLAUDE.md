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
npm run dev              # Start dev server (port 3005)
npm run build            # Production build
npm run start            # Production server (port 6600)
npm run lint             # Run ESLint
npm run seed:patients    # Seed patient test data
npx prisma db seed       # Seed users and reference data
npx prisma migrate dev --name <name>  # Create new migration
npx prisma generate      # Regenerate Prisma client
```

## Environment Setup

Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Must be at least 32 characters (validated at startup)

The app validates environment at startup via `instrumentation.ts`.

## Architecture

### Folder Structure (Strict Separation)

- **`actions/`** - Server actions by domain: auth/, patients/, encounters/, triage/, doctor/
- **`app/`** - Routes only (UI + navigation). No business logic.
- **`lib/`** - Infrastructure: db/, auth/, validators/, constants/, utils/
- **`components/`** - Reusable UI only. No DB logic. Subdirs: layout/, ui/, forms/, tables/, triage/
- **`hooks/`** - Custom React hooks (currently contains `useSession()` hook)

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

## Key Files Reference

| File | Purpose |
|------|---------|
| `lib/auth/session.ts` | JWT creation/verification, session caching |
| `lib/auth/guards.ts` | Page & action protection, auth errors |
| `lib/db/index.ts` | Prisma client with connection pooling |
| `lib/security/rate-limiter.ts` | Login rate limiting (atomic pattern) |
| `lib/utils/action-helpers.ts` | Error builders, audit log creation |
| `lib/utils/encounter-helpers.ts` | Encounter lifecycle, stale logic |
| `lib/validators/` | Zod schemas for all domains |
| `lib/constants/enums.ts` | Centralized enum definitions |
| `prisma/schema.prisma` | Complete data model |

## Roles & Access Control

Six roles: ADMIN, REGISTRATION, TRIAGE, DOCTOR, LAB, PHARMACY

- Enforce at 3 levels: route guard, server action validation, audit logging
- UI hiding is NOT security - always validate server-side

### User Scopes
Two scopes control facility access:
- **FACILITY_ONLY** - User can only access their assigned facility
- **CITY_WIDE** - User can access all facilities (typically doctors, admin)

Used in queries:
```typescript
const facilityFilter = session.scope === "FACILITY_ONLY"
  ? { facilityId: session.facilityId }
  : {}
```

### Auth Guards
```typescript
// Page protection (redirects)
const session = await requireSession()      // → /login if no session
const session = await requireRole(["DOCTOR", "LAB"])  // → /unauthorized if wrong role

// Action protection (throws AuthError)
const session = await requireSessionForAction()  // throws AuthError("UNAUTHORIZED")
const session = await requireRoleForAction(["PHARMACY"])  // throws AuthError("FORBIDDEN")
```

### Session Management
- JWT-based using `jose` library with HS256 algorithm
- 8-hour expiration with httpOnly, secure, sameSite cookies
- Payload includes: userId, role, name, facilityId, scope
- Session verified on every action (checks user still exists and is active)
- Uses React's `cache()` to prevent redundant DB lookups per request

### Rate Limiting (Login)
Atomic reservation pattern prevents brute force:
- 5 attempts per 15-minute window
- Both IP-based and email-based tracking
- `reserveAttempt()` - Atomically check AND increment BEFORE password verification
- `confirmAttempt(token)` - Clear on success; preserve IP to prevent reset attacks
- Exponential backoff: 15min → 30min → 60min (capped)

## UI Design

**Always invoke the frontend-design skill before writing any frontend code.**
**Doctors' dashboard should be compact and provide easy access to patient information.**

## Component Patterns

### Form Components (`components/forms/`)
- `FormField` - Label + error + required indicator wrapper
- `FormSection` - Group-level sectioning with title
- `FormFieldGroup` - Multiple fields in row layout
- `VitalInput` - Specialized vital sign inputs with units
- `YesNoToggle` - Boolean selector component

### Action Helpers (`lib/utils/action-helpers.ts`)
```typescript
notFoundError(entity, message?)      // Standardized 404
forbiddenError(message?)             // Access denied
validationError(message, fieldErrors) // With field-level errors
alreadyClaimedError(message?)        // FIFO claim conflicts
fifoViolationError()                 // Must select first patient
createAuditLog(tx, session, action, entity, entityId, metadata)
```

## Database Rules

- Core flow: PATIENT → ENCOUNTER → ACTION
- One active encounter per patient (enforced by partial unique index on WAIT_TRIAGE status)
- Encounter statuses: WAIT_TRIAGE → TRIAGED → WAIT_DOCTOR → IN_CONSULT → FOR_LAB/FOR_PHARMACY → DONE
- Stock cannot go below zero; every change creates InventoryTxn
- All audit logs include: userId, userName, action, entity, entityId, timestamp

### Encounter Lifecycle
- **Stale Encounters**: Auto-cancelled when new encounter created if from previous day
- **Claim System**: 30-minute expiry window for triage/doctor claims
- **FIFO Enforcement**: Cannot skip queue; must select first patient
- `cancelStaleEncountersForPatient()` handles auto-cancellation in transactions

### Diagnosis Taxonomy (3-Layer)
- **DiagnosisCategory** - 10 categories
- **DiagnosisSubcategory** - 86 subcategories with notifiable/animal-bite flags
- **DiagnosisIcdMap** - 148 ICD-10 code mappings
- Diagnoses can be custom text OR linked to taxonomy

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


### Rules (Non-negotiable)
- Do NOT build dashboards before scope logic exists. Multi-facility and Multi-user
enforcement is mandatory from Day 1.

- Encounter statuses must follow workflow: WAIT_TRIAGE → TRIAGED → WAIT_DOCTOR → IN_CONSULT → FOR_LAB/FOR_PHARMACY → DONE.
- Enforce role-based access control at 3 levels: route guard, server action validation, and audit logging. Do NOT rely on UI hiding for security.
- Always create a TODO list before implementing any features.
- Always apply reusable components.
- Use more defensive key generation.
- For production safety, consider validating at least one level deeper or using Zod schemas for runtime validation when parsing from external sources.
- Consider tracking "dirty" state and only triggering auto-save when form data has actually changed since the last save.
- All medical data (patients, encounters, diagnoses) must use soft deletes with deletedAt/deletedById fields. Never hard delete patient/encounter data.
- FIFO is required in queing for TRIAGE and DOCTORS APPOINTMENTS.

#  Multi-Facility and User Role Rules
- REGISTRATION - In the Multi-facility Patients can register in any facility.
- TRIAGE - if the patient is already has an encounter to a facility in that day, it should restrict another encounter in other facilties. But a patient can make encounter to any facility in a day if there is no existing encounter.
