# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CHO (City Health Office) System - A medical records and clinic management system for Philippine City Health Offices. Built with Next.js 16 App Router, Prisma 7, and PostgreSQL.

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

- **`actions/`** - Server actions organized by domain: auth/, patients/, encounters/, triage/, doctor/, lab/, pharmacy/, audit/
- **`app/`** - Routes only (UI + navigation). No business logic.
- **`lib/`** - Infrastructure: db/, auth/, validators/, constants/, utils/, storage/
- **`components/`** - Reusable UI only. No DB logic. Subdirs: layout/, ui/, forms/, tables/

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

## Database Rules

- Core flow: PATIENT → ENCOUNTER → ACTION
- One active encounter per patient (enforced by partial unique index on WAIT_TRIAGE status)
- Encounter statuses: WAIT_TRIAGE → TRIAGED → WAIT_DOCTOR → IN_CONSULT → FOR_LAB/FOR_PHARMACY → DONE
- Stock cannot go below zero; every change creates InventoryTxn
- All audit logs include: userId, userName, action, entity, entityId, timestamp





## Workflow

Layout

Page header: Patients

Search bar (name, DOB, patient ID, phone)
Table: patient list (high density)
Action buttons:
Add patient
Edit patient

View patient summary 

On selecting a patient: show “forward to triage” panel/button

Add Patient Form:if adding NEW patient
Outputs

Creates/updates patient record

Forwards to TRIAGE (status = WAIT_TRIAGE)

C) TRIAGE 

Purpose: Search/select queued patient, capture vital signs, then forward to Appointments.

Layout

Left: Patient lists (Today / Status = WAIT_TRIAGE )

Right:
Main: Triage form (Vitals)
BP, HR, RR, Temp, SpO2, Weight, Height
Chief complaint (optional if you allow)
Submit → status becomes TRIAGED → forwarded

Hard rule enforced
No “Add Patient” button here.

Only select from Patients/status=WAIT_TRIAGE.

D) APPOINTMENTS 

Purpose: The logged-in doctor sees only assigned appointments.

Layout

Tabs:
Today
Upcoming
Completed

List/Table:
Time
Patient
Status (WAIT_DOCTOR /  IN_CONSULT / For Lab / For Pharmacy / Done)

Clicking appointment opens:

Patient summary + triage vitals
Diagnosis / notes
Orders (Lab)
Prescriptions
Key permission

Doctor cannot see other doctors’ appointments.

E) LABORATORY

Purpose: manage lab requests and upload results.

Layout

Tabs: Pending / In Progress / Released

Order details page:

Requested tests
Upload result (file or structured results)
Release action (status change)

(If you keep MAIN-only lab rule: include “Requested Facility” vs “Performing Facility = MAIN”.)

F) PHARMACY

Purpose: dispense based on prescriptions, manage inventory in/out.

Layout

Queue: For dispense
Prescription details:
Items, quantity, instructions
Dispense button → inventory OUT txn
Inventory panel:
Low stock alerts
Adjustments

G) USERS

Purpose: manage staff accounts.

Layout

List users
Add/edit user
Assign role + scope + facility
Reset password / deactivate

5) Workflow Summary (Your Intended Path)

Patients (validate or add new )
→ Triage (vitals only)
→ Appointments (doctor consult for assigned doctor only)
→ optional Laboratory
→ optional Pharmacy
→ done

H) Additional Features

# PhilHealth Registration Integration Plan

## Process (brief)

PhilHealth registration in CHO is **captured at patient registration or when editing a patient** in the **Patients** module (no separate “PhilHealth module”). Flow:

1. **Registration staff** searches or creates a patient in the Patients module.
2. When creating or editing a patient, they optionally fill **PhilHealth** fields (beyond the existing PhilHealth number): membership type, eligibility period, and whether the patient is a principal or dependent.
3. The system stores this with the patient and displays it on the **patient detail view** and in encounter context for future use (e.g. benefit eligibility, claims).
4. No external PhilHealth API is assumed for MVP; data is **facility-stored only**. Optional later: PIN format checks, and if PhilHealth provides an API, MDR verification or eligibility check.

```
Patients (create/search) → Triage (vitals) → Appointments (doctor consult) → Lab/Pharmacy → Done
```

Each module has role restrictions:
- REGISTRATION: Patients module
- TRIAGE: Triage queue, vitals capture
- DOCTOR: Appointments, diagnosis, prescriptions, lab orders
- LAB: Lab results upload/release
- PHARMACY: Dispensing, inventory
