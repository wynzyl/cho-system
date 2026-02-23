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
```

## Architecture

### Folder Structure (Strict Separation)

- **`actions/`** - All server actions and database writes. Organized by domain: auth/, patients/, encounters/, triage/, doctor/, lab/, pharmacy/, audit/
- **`app/`** - Routes only (UI + navigation). No business logic.
- **`lib/`** - Infrastructure: db/, auth/, validators/, constants/, utils/, storage/
- **`components/`** - Reusable UI only. No DB logic. Subdirs: layout/, ui/, forms/, tables/

### Key Patterns

**Prisma 7.x with Adapter**: Uses `@prisma/adapter-pg` with connection pooling. See `lib/db/index.ts` and `prisma/seed.ts` for the pattern:
```typescript
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })
```

**Soft Deletes**: All medical data uses soft delete with `deletedAt`/`deletedById` fields. Never hard delete patient/encounter data.

**Partial Unique Indexes**: Unique constraints use `WHERE deletedAt IS NULL` to allow re-creation after soft delete.

## Roles & Access Control

Six roles: ADMIN, REGISTRATION, TRIAGE, DOCTOR, LAB, PHARMACY

- ADMIN can access everything
- Each role has specific capabilities (see docs/RBAC_POLICY.md)
- Enforce at 3 levels: route guard, server action validation, audit logging
- UI hiding is NOT security - always validate server-side

## Auth Pattern

- Credentials-based (email + password)
- bcrypt for password hashing
- httpOnly cookie sessions with JWT (jose library)
- Session contains: userId, role, name, facilityId, scope
- Generic error messages only - no detail leaks
- Timing-safe login: always compare password hash (even for non-existent users)
- getSession() wrapped in React.cache() for request deduplication

### Route Constants (lib/auth/routes.ts)
```typescript
import { ROLE_ROUTES, ROLE_ALLOWED_PATHS } from "@/lib/auth/routes"
// ROLE_ROUTES: Role → default dashboard path
// ROLE_ALLOWED_PATHS: Role → list of accessible paths
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

### AuthError
```typescript
import { AuthError, AuthErrorCode } from "@/lib/auth/guards"
// AuthErrorCode: "UNAUTHORIZED" | "FORBIDDEN"
// Use: catch (e) { if (e instanceof AuthError && e.code === "UNAUTHORIZED") ... }
```

## UI Design

## Always do first
- Invoke the frontend-design skills before writing any frontend code, every session, no exceptions.

## Database Rules

- Core flow: PATIENT → ENCOUNTER → ACTION
- Stock cannot go below zero; every change creates InventoryTxn
- All audit logs must include: userId, action, entity, entityId, timestamp
- AuditLog has denormalized userName/userEmail for attribution after user deletion

## Test Users (after seeding)

All use password: `Password123!`
- admin@cho.local (ADMIN)
- registration@cho.local (REGISTRATION)
- doctor.main@cho.local (DOCTOR)
- triage.main@cho.local (TRIAGE)
- lab@cho.local (LAB)
- pharmacy@cho.local (PHARMACY)


## CURRENT DASHBOARD LAYOUT (Updated)
1) App Shell Layout
┌──────────────────────────────────────────────────────────────────────┐
│ TOP NAVBAR                                                           │
│  [CHO System]   [Facility: MAIN/CHO1/CHO2/CHO3]   [Role]   [User]  ⚙ │
└──────────────────────────────────────────────────────────────────────┘
┌───────────────────────┬──────────────────────────────────────────────┐
│ SIDEBAR                │ MAIN CONTENT AREA                            │
│                        │                                              │
│  • Admin Dashboard     │  Page Header + Actions                        │
│  • Patients            │  Filters / Search / Tabs                       │
│  • Triage              │  Main Table / Forms / Panels                   │
│  • Appointments        │  Context-specific right panel (optional)       │
│  • Laboratory          │                                              │
│  • Pharmacy            │                                              │
│  • Users               │                                              │
└───────────────────────┴──────────────────────────────────────────────┘

2) Top Navbar (Included)

Left
CHO System logo/name
Current module title (optional)
Center
Facility selector/badge (ex: MAIN, CHO1, CHO2, CHO3)
If scope is FACILITY_ONLY: show fixed badge
If CITY_WIDE: allow switching facility view (or “All Facilities” if allowed)

Right
Role badge (ADMIN/REGISTRATION/TRIAGE/DOCTOR/LAB/PHARMACY)
User menu:
Profile
Change password
Logout

3) Sidebar Navigation (Exactly as you want)

ADMIN Dashboard
PATIENTS
TRIAGE
APPOINTMENTS
LABORATORY
PHARMACY
USERS
SETTINGS

Role-based visibility still applies (ADMIN sees all; others see permitted modules).

4) Current Page Layout Per Sidebar Item
A) ADMIN Dashboard

Purpose: overall operational status.

Typical Sections

KPI Cards (Today)
Waiting Triage
Waiting Doctor (Appointments)
Pending Lab
For Pharmacy
Recent activity (audit-lite)

Alerts:
Low stock
Lab backlog


B) PATIENTS (Entry Point + forward to TRIAGE)

Purpose: Validate old/new patient, manage patient record, and assign to triage.

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

C) TRIAGE (No adding new patient)

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