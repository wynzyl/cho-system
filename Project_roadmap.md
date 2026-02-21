# CHO System - Project Roadmap

## Overview

CHO (City Health Office) System - A medical records and clinic management system for Philippine City Health Offices. Built with Next.js 16 App Router, Prisma 7, and PostgreSQL.

**Target:** Urdaneta City Health Office (Multi-facility: Main + Barangay branches)

---

## Phase 1: Foundation (COMPLETE)

### 1.1 Database Schema
- [x] Core entities: Facility, User, Patient, Encounter
- [x] Clinical: TriageRecord, Diagnosis, Prescription, PrescriptionItem
- [x] Laboratory: LabOrder, LabOrderItem, LabResult
- [x] Pharmacy: Medicine, InventoryLevel, StockLot, InventoryTxn, DispenseTxn, DispenseItem
- [x] Audit: AuditLog with denormalized user fields
- [x] Barangay reference data (34 Urdaneta barangays)
- [x] Soft delete pattern (`deletedAt`/`deletedById`)

### 1.2 Authentication & Authorization
- [x] Credentials-based auth (email + password)
- [x] bcrypt password hashing
- [x] JWT sessions with httpOnly cookies
- [x] Six roles: ADMIN, REGISTRATION, TRIAGE, DOCTOR, LAB, PHARMACY
- [x] Scope enforcement: FACILITY_ONLY vs CITY_WIDE
- [x] Route guards and action protection
- [x] Generic error messages (no detail leaks)

### 1.3 App Shell
- [x] Top navbar with facility selector, role badge, user menu
- [x] Sidebar navigation (role-based visibility)
- [x] Layout structure (dashboards group)

---

## Phase 2: Core Modules (IN PROGRESS)

### 2.1 Patient Registry
- [x] Patient list with search
- [x] Add new patient form
- [x] Patient detail view
- [x] Patient code generation (Urd-CHOX-YYYY-XXXXX format)
- [x] Forward to triage action

### 2.2 Triage Module
- [x] Triage queue (WAIT_TRIAGE status)
- [x] Vital signs form (BP, HR, RR, Temp, SpO2, Weight, Height)
- [x] Chief complaint capture
- [x] Search/add patient in triage
- [x] Status transition: WAIT_TRIAGE → TRIAGED

### 2.3 Appointments/Doctor Module
- [ ] Doctor queue (WAIT_DOCTOR status)
- [ ] Doctor-only assigned encounters
- [ ] Patient summary + triage vitals display
- [ ] Diagnosis entry with ICD-10 codes
- [ ] Lab order creation
- [ ] Prescription creation
- [ ] Status transitions: IN_CONSULT → FOR_LAB/FOR_PHARMACY → DONE

### 2.4 Laboratory Module
- [ ] Lab queue (Pending/In Progress/Released tabs)
- [ ] Main-only lab rule enforcement
- [ ] Result upload (file or structured)
- [ ] Result release workflow
- [ ] Multi-facility request tracking

### 2.5 Pharmacy Module
- [ ] Dispense queue (FOR_PHARMACY status)
- [ ] Prescription fulfillment
- [ ] Inventory deduction (auto StockLot FEFO)
- [ ] Low stock alerts
- [ ] Inventory adjustments (IN/OUT/ADJUST)

---

## Phase 3: Reporting & ICD-10 Integration (STARTED)

### 3.1 Diagnosis Codes
- [x] DiagnosisCategory enum (7 categories)
- [x] DiagnosisCode model with ICD-10 codes
- [x] Seed data (20 codes across all categories)
- [x] Relation to Diagnosis model

**Categories:**
| Category | Count | Examples |
|----------|-------|----------|
| INFECTIOUS | 4 | URI, Pharyngitis, Pneumonia, Gastroenteritis |
| NOTIFIABLE_DISEASE | 5 | Dengue, DHF, Chikungunya, Leptospirosis, TB |
| ANIMAL_BITE | 3 | Dog bite, Other mammals, Rabies exposure |
| CHRONIC | 3 | Hypertension, Diabetes, Asthma |
| MATERNAL | 1 | Normal pregnancy supervision |
| MATERNAL_CHILD | 2 | Anemia, Malnutrition |
| TRAUMA | 2 | Scalp wound, Burns |

### 3.2 Reports (PLANNED)
- [ ] Morbidity reports by category
- [ ] Notifiable disease reporting
- [ ] Animal bite case tracking
- [ ] Chronic disease registry
- [ ] Maternal health tracking
- [ ] Facility-wise statistics

---

## Phase 4: Admin & Settings (PARTIAL)

### 4.1 User Management
- [x] User list page
- [ ] Add/edit user
- [ ] Role + scope + facility assignment
- [ ] Password reset
- [ ] Deactivate user

### 4.2 Settings
- [x] Settings page shell
- [ ] Facility management
- [ ] Medicine master list
- [ ] Lab test catalog
- [ ] System configuration

### 4.3 Profile
- [x] Profile page
- [x] Change password page

---

## Phase 5: Production Readiness (PLANNED)

### 5.1 Security Hardening
- [ ] Input validation (all forms)
- [ ] Rate limiting
- [ ] CSRF protection
- [ ] Audit log review UI

### 5.2 Performance
- [ ] Database indexing review
- [ ] Query optimization
- [ ] Caching strategy

### 5.3 Deployment
- [ ] Production build testing
- [ ] PM2 configuration
- [ ] Backup strategy (pg_dump)
- [ ] Monitoring setup

---

## Technical Debt & Improvements

- [ ] Comprehensive test coverage
- [ ] Error boundary implementation
- [ ] Loading states for all async operations
- [ ] Offline capability (PWA)
- [ ] Mobile responsiveness audit

---

## Version History

| Version | Date | Milestone |
|---------|------|-----------|
| 0.1.0 | 2026-02-17 | Initial schema and auth |
| 0.2.0 | 2026-02-19 | Barangay data, Registration role |
| 0.3.0 | 2026-02-20 | Triage module with search/add patient |
| 0.4.0 | 2026-02-21 | ICD-10 diagnosis codes |
