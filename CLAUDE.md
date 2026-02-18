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

Five roles: ADMIN, TRIAGE, DOCTOR, LAB, PHARMACY

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

## Database Rules

- Core flow: PATIENT → ENCOUNTER → ACTION
- Stock cannot go below zero; every change creates InventoryTxn
- All audit logs must include: userId, action, entity, entityId, timestamp
- AuditLog has denormalized userName/userEmail for attribution after user deletion

## Test Users (after seeding)

All use password: `Password123!`
- admin@cho.local (ADMIN)
- doctor.main@cho.local (DOCTOR)
- triage.main@cho.local (TRIAGE)
- lab@cho.local (LAB)
- pharmacy@cho.local (PHARMACY)
