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

```
Patients (create/search) → Triage (vitals) → Appointments (doctor consult) → Lab/Pharmacy → Done
```

Each module has role restrictions:
- REGISTRATION: Patients module
- TRIAGE: Triage queue, vitals capture
- DOCTOR: Appointments, diagnosis, prescriptions, lab orders
- LAB: Lab results upload/release
- PHARMACY: Dispensing, inventory
