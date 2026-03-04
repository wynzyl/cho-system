# Users/Staff Management Module Implementation Plan

## Overview

Implement a Staff Management module for ADMIN role users to manage all system users. Based on the reference design with card-based grid layout, adapted to CHO system context.

---

## Design Adaptations

| Reference Design | CHO System Adaptation |
|------------------|----------------------|
| Department | Facility (CHO-MAIN, CHO-BRG1, etc.) |
| Role (Cardiologist, etc.) | Role (ADMIN, REGISTRATION, TRIAGE, DOCTOR, LAB, PHARMACY) |
| Experience, Shift | Skip for MVP (not in current User model) |
| Available/Busy status | Active/Inactive (isActive field) |
| Schedule button | Skip for MVP |
| View Profile button | Edit User action |

---

## Files to Create/Modify

### 1. Constants
**`lib/constants/user.ts`** (new)
- ROLE_OPTIONS with labels
- SCOPE_OPTIONS
- USER_STATUS_OPTIONS

### 2. Validators
**`lib/validators/user.ts`** (new)
- `createUserSchema` - name, email, password, role, facilityId, scope
- `updateUserSchema` - name, email, role, facilityId, scope, isActive
- `resetPasswordSchema` - userId, newPassword

### 3. Server Actions
**`actions/users/`** (new directory)
- `get-users.ts` - Paginated list with filters (search, role, facility, status)
- `get-user.ts` - Single user by ID
- `create-user.ts` - Create new user with password hashing
- `update-user.ts` - Update user details
- `toggle-user-status.ts` - Activate/deactivate user (soft delete)
- `reset-password.ts` - Admin reset password
- `get-facilities.ts` - Fetch facilities for dropdown
- `index.ts` - Barrel export

### 4. Components
**`components/users/users-page-client.tsx`** (new)
- Main client component with state management
- Search, filters, grid display

**`components/users/user-card.tsx`** (new)
- Individual staff card matching reference design
- Avatar with initials, name, email, role, facility, status badge
- Edit and deactivate action buttons

**`components/users/user-form-dialog.tsx`** (new)
- Dialog for create/edit user
- Form fields: name, email, password (create only), role, facility, scope

**`components/users/user-filters.tsx`** (new)
- Search input
- Role filter dropdown
- Facility filter dropdown
- Status filter (Active/All/Inactive)

### 5. Pages
**`app/(dashboards)/users/page.tsx`** (modify)
- Server component wrapper
- Fetch initial data, pass to client

---

## Implementation Order

### Step 1: Constants & Validators
1. Create `lib/constants/user.ts` with role/scope options
2. Create `lib/validators/user.ts` with Zod schemas

### Step 2: Server Actions
1. Create `actions/users/get-facilities.ts`
2. Create `actions/users/get-users.ts` with pagination & filters
3. Create `actions/users/get-user.ts`
4. Create `actions/users/create-user.ts` with password hashing & audit
5. Create `actions/users/update-user.ts` with audit
6. Create `actions/users/toggle-user-status.ts` with soft delete
7. Create `actions/users/reset-password.ts`
8. Create `actions/users/index.ts` barrel export

### Step 3: UI Components
1. Create `components/users/user-card.tsx`
2. Create `components/users/user-filters.tsx`
3. Create `components/users/user-form-dialog.tsx`
4. Create `components/users/users-page-client.tsx`

### Step 4: Page Integration
1. Update `app/(dashboards)/users/page.tsx`

---

## User Card Design (Based on Reference)

```
┌─────────────────────────────────────────┐
│  [AV]  Name                        [⋮]  │
│        email@cho.local                  │
│                                         │
│  Role            Facility               │
│  DOCTOR          CHO-MAIN               │
│                                         │
│  Scope                                  │
│  FACILITY_ONLY                          │
│                                         │
│  [Active]  ← status badge               │
│                                         │
│  Last login: Mar 3, 2026 2:30 PM        │
│                                         │
│  [  Edit  ]  [Deactivate]               │
└─────────────────────────────────────────┘
```

**Design Decisions:**
- Skip Experience/Shift fields (not in current model, no migration needed)
- Show last login timestamp on each card (already tracked in User model)

---

## Key Security Considerations

1. **Role Check**: All actions require `requireRoleForAction(["ADMIN"])`
2. **Password Hashing**: Use bcrypt for new passwords
3. **Audit Logging**: Log CREATE, UPDATE, ROLE_CHANGE, DELETE_SOFT actions
4. **Soft Delete**: Never hard delete users (set deletedAt/deletedById)
5. **Self-Protection**: Prevent admin from deactivating themselves

---

## Verification Plan

1. **Create User**
   - Login as admin
   - Click "+ Add Staff"
   - Fill form, submit
   - Verify user appears in grid
   - Verify can login with new credentials

2. **Edit User**
   - Click Edit on a user card
   - Change role/facility
   - Verify changes saved
   - Verify audit log created

3. **Deactivate User**
   - Click Deactivate on a user card
   - Confirm action
   - Verify user shows "Inactive" badge
   - Verify deactivated user cannot login

4. **Reset Password**
   - Click Reset Password in menu
   - Enter new password
   - Verify user can login with new password

5. **Filters**
   - Search by name/email
   - Filter by role
   - Filter by facility
   - Filter by status
   - Verify results update correctly

---

## Critical Files Summary

| File | Action |
|------|--------|
| `lib/constants/user.ts` | Create |
| `lib/validators/user.ts` | Create |
| `actions/users/*.ts` | Create (8 files) |
| `components/users/*.tsx` | Create (4 files) |
| `app/(dashboards)/users/page.tsx` | Modify |
