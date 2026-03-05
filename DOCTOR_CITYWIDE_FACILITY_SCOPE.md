# Pending Fixes

## 1. Users Page - Handle Facilities Error (app/(dashboards)/users/page.tsx)

**Issue:** Silent fallback to empty array on failure.

**Fix:**
```typescript
export default async function UsersPage() {
  await requireRole(["ADMIN"])

  const facilitiesResult = await getFacilitiesAction()
  if (!facilitiesResult.ok) {
    throw new Error(`Failed to load facilities: ${facilitiesResult.error.message}`)
  }

  return <UsersPageClient facilities={facilitiesResult.data} />
}
```

## 2. Users Page Client - Add Exception Handling (components/users/users-page-client.tsx)

**Issue:** `fetchUsers` has try/finally but no catch - exceptions would be unhandled.

**Fix:** Add catch block (following triage-page-client.tsx pattern):
```typescript
const fetchUsers = useCallback(async () => {
  setIsLoading(true)
  try {
    const result = await listUsersAction({
      query: searchQuery,
      page,
      pageSize,
      roleFilter: roleFilter as "all" | "ADMIN" | "REGISTRATION" | "TRIAGE" | "DOCTOR" | "LAB" | "PHARMACY",
      facilityFilter: facilityFilter === "all" ? "all" : facilityFilter,
      statusFilter: statusFilter as "active" | "inactive" | "all",
    })

    if (result.ok) {
      setUsers(result.data.users)
      setTotal(result.data.total)
      setTotalPages(result.data.totalPages)
    } else {
      toast.error(result.error.message)
    }
  } catch (error) {
    console.error("Failed to fetch users:", error)
    toast.error("Failed to load users")
  } finally {
    setIsLoading(false)
  }
}, [searchQuery, page, pageSize, roleFilter, facilityFilter, statusFilter])
```

## 3. Row Action Button - Keyboard Accessibility (components/users/users-page-client.tsx)

**Issue:** Action button uses `opacity-0 group-hover:opacity-100` - invisible to keyboard users.

**Fix (line 287):**
```typescript
// Before:
className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"

// After:
className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:opacity-100 transition-opacity"
```

## 4. Remove Email PII from Audit Logs

**Issue:** Email stored in audit metadata is redundant (entityId already identifies user) and is PII.

### 4a. reset-password.ts (lines 58-62)
```typescript
// Before:
metadata: {
  passwordReset: true,
  targetUserName: user.name,
  targetUserEmail: user.email,
},

// After:
metadata: {
  passwordReset: true,
  targetUserName: user.name,
},
```

Also remove `email: true` from the select query (line 28) since it's no longer needed.

### 4b. create-user.ts (lines 71-76)
```typescript
// Before:
metadata: {
  name: data.name,
  email: normalizedEmail,
  role: data.role,
  scope: data.scope,
},

// After:
metadata: {
  name: data.name,
  role: data.role,
  scope: data.scope,
},
```

---

## Summary of Fixes

| # | File | Issue |
|---|------|-------|
| 1 | `app/(dashboards)/users/page.tsx` | Silent error fallback to `[]` |
| 2 | `components/users/users-page-client.tsx` | Missing catch block in fetchUsers |
| 3 | `components/users/users-page-client.tsx` | Action button invisible to keyboard |
| 4a | `actions/users/reset-password.ts` | Email PII in audit log |
| 4b | `actions/users/create-user.ts` | Email PII in audit log |

## Verification

1. **TypeScript check**: `npx tsc --noEmit`
2. **Lint check**: `npm run lint`
3. **Build**: `npm run build`
4. **Manual testing**:
   - Navigate to /users as admin
   - Tab through the table to verify action buttons are visible on focus
   - Create a user and verify audit log doesn't contain email
   - Reset a password and verify audit log doesn't contain email

---

# Fix CITY_WIDE Scope for Doctor Role

## Problem

The `CITY_WIDE` scope is only enforced in `get-patient-history.ts`. All other doctor actions filter by `session.facilityId` regardless of scope, meaning CITY_WIDE doctors can only consult patients from their assigned facility.

## Design Decisions

1. **Queue Display**: CITY_WIDE doctors see patients from ALL facilities with facility name shown
2. **FIFO Enforcement**: FIFO checked within each facility, not globally
3. **UI**: Display facility name in queue for CITY_WIDE doctors

## Pattern to Apply

From `get-patient-history.ts` (working reference):
```typescript
const facilityFilter =
  session.scope === "FACILITY_ONLY" ? { facilityId: session.facilityId } : {}
```

---

## Files to Modify (8 Server Actions + 1 UI)

### 1. `actions/doctor/get-doctor-queue.ts`

**Changes:**
- Add scope-aware facility filter
- Include facility info in response
- Update `DoctorQueueItem` interface to include facility

```typescript
// Add after session retrieval
const facilityFilter =
  session.scope === "FACILITY_ONLY" ? { facilityId: session.facilityId } : {}

// Replace facilityId: session.facilityId with ...facilityFilter

// Add to include block:
facility: {
  select: { id: true, name: true, code: true }
}
```

### 2. `actions/doctor/claim-for-consult.ts`

**Changes:**
- Add scope-aware facility filter for encounter lookup
- FIFO check must use `encounter.facilityId` (not `session.facilityId`)

```typescript
// Encounter lookup: use ...facilityFilter
// FIFO check: use facilityId: encounter.facilityId
// Add facilityId to select for FIFO check
```

### 3. `actions/doctor/start-consultation.ts`

**Change:** Replace `facilityId: session.facilityId` with `...facilityFilter`

### 4. `actions/doctor/save-consultation.ts`

**Change:** Replace `facilityId: session.facilityId` with `...facilityFilter`

### 5. `actions/doctor/add-diagnosis.ts`

**Change:** Replace `facilityId: session.facilityId` with `...facilityFilter`

### 6. `actions/doctor/complete-consultation.ts`

**Change:** Replace `facilityId: session.facilityId` with `...facilityFilter`

### 7. `actions/doctor/get-encounter-details.ts`

**Change:** Replace misleading `session.facilityId ? {...}` check with proper scope check

### 8. `actions/doctor/get-encounter-for-consult.ts`

**Changes:**
- Replace `facilityId: session.facilityId` with `...facilityFilter`
- Add facility info to response
- Update `EncounterForConsult` interface

### 9. `components/doctor/doctor-queue.tsx`

**Changes:**
- Display facility name for each queue item
- Import `Building` icon from lucide-react

```tsx
{item.facility && (
  <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
    <Building className="h-3 w-3" />
    <span>{item.facility.name}</span>
  </div>
)}
```

---

## Implementation Order

1. `get-doctor-queue.ts` - Core queue, adds facility to response
2. `claim-for-consult.ts` - Cross-facility claiming with proper FIFO
3. `start-consultation.ts`
4. `get-encounter-for-consult.ts` - Add facility to encounter
5. `save-consultation.ts`
6. `add-diagnosis.ts`
7. `complete-consultation.ts`
8. `get-encounter-details.ts`
9. `doctor-queue.tsx` - UI facility display

---

## Verification Plan

### Test Matrix

| Action | CITY_WIDE | FACILITY_ONLY |
|--------|-----------|---------------|
| See patients from all facilities | Yes | No |
| Claim patient from other facility | Yes | No |
| Start/save/complete consult cross-facility | Yes | No |
| FIFO within same facility | Enforced | Enforced |
| View patient history cross-facility | Yes | No (existing) |

### Manual Testing Steps

1. Login as CITY_WIDE doctor
2. Verify queue shows patients from multiple facilities
3. Verify facility name displayed in queue
4. Claim and consult a patient from a different facility
5. Complete consultation successfully
6. Login as FACILITY_ONLY doctor
7. Verify queue only shows assigned facility patients
8. Verify cannot access cross-facility encounters
