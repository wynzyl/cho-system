# Doctor Queue FIFO Claiming System

## Objective
Implement multi-user FIFO claiming for the doctor queue, similar to the triage system. When a doctor claims a patient, it should be locked from other doctors.

## Current State

**Triage (has FIFO claiming):**
- Uses `claimedById` and `claimedAt` fields on Encounter model
- `claimEncounterAction` / `releaseEncounterAction` server actions
- 15-minute claim expiry
- Client-side FIFO enforcement (can only select first available)
- One claim per user at a time

**Doctor (no claiming - gap):**
- Direct click → `startConsultationAction` → immediately IN_CONSULT
- No protection against two doctors starting same patient
- No release mechanism back to queue

## Implementation Plan

### Phase 1: Server Actions

**1. Create `actions/doctor/claim-for-consult.ts`**
- Claims a WAIT_DOCTOR encounter for the doctor
- Uses same `claimedById`/`claimedAt` fields as triage
- 15-minute expiry (consistent with triage)
- Transaction-based for multi-user safety
- Returns error if already claimed by another doctor

**2. Create `actions/doctor/release-from-consult.ts`**
- Releases a claim so other doctors can select
- Only the claiming doctor can release
- Clears `claimedById` and `claimedAt`

**3. Update `actions/doctor/get-doctor-queue.ts`**
- Include `claimedById`, `claimedAt`, `claimedByName` in response
- Return `currentUserId` so client can determine permissions

**4. Update `actions/doctor/start-consultation.ts`**
- Verify the doctor has a valid claim before starting
- Prevent starting if claimed by another doctor

### Phase 2: UI Components

**5. Update `components/doctor/doctor-queue.tsx`**
- Add FIFO state calculation (like triage-queue.tsx)
- States: "selected" | "claimed-by-other" | "available" | "disabled"
- Show lock icon + "In progress by [name]" for claimed-by-other
- Disable cards that can't be selected (FIFO enforcement)

**6. Update `components/doctor/doctor-page-client.tsx`**
- Add `handleClaim` function (replaces direct startConsultation for selection)
- Track claimed encounter via ref
- Add release on unmount / beforeunload
- Separate "Claim" from "Start Consultation" flow:
  - Click waiting patient → claim it (locks for this doctor)
  - Click "Start Consultation" button → begins actual consultation

### Phase 3: Validators

**7. Add validators in `lib/validators/doctor.ts`**
- `claimForConsultSchema` - validate encounterId
- `releaseFromConsultSchema` - validate encounterId

## Files to Create
- `actions/doctor/claim-for-consult.ts`
- `actions/doctor/release-from-consult.ts`

## Files to Modify
- `actions/doctor/get-doctor-queue.ts` - Add claim fields to response
- `actions/doctor/start-consultation.ts` - Verify claim ownership
- `actions/doctor/index.ts` - Export new actions
- `lib/validators/doctor.ts` - Add new schemas
- `components/doctor/doctor-queue.tsx` - Add FIFO states & lock UI
- `components/doctor/doctor-page-client.tsx` - Add claim/release handling

## Data Flow

```
Doctor clicks waiting patient
    ↓
claimForConsultAction(encounterId)
    ↓
[Success] Patient locked (claimedById = doctorId, claimedAt = now)
    ↓
UI shows patient as "selected", others see "claimed-by-other"
    ↓
Doctor clicks "Start Consultation"
    ↓
startConsultationAction (verifies claim → transitions to IN_CONSULT)
    ↓
Consultation form loads
```

## FIFO Enforcement Logic (Client-Side)

```typescript
function getItemState(item, index, items, currentUserId) {
  // Already in consultation with me
  if (item.status === "IN_CONSULT" && item.doctorId === currentUserId) {
    return "selected"
  }

  // I claimed this patient
  if (item.claimedById === currentUserId && !isClaimExpired(item.claimedAt)) {
    return "selected"
  }

  // Someone else claimed it (not expired)
  if (item.claimedById && item.claimedById !== currentUserId && !isClaimExpired(item.claimedAt)) {
    return "claimed-by-other"
  }

  // I already have a claim elsewhere → can't claim another
  if (items.some(i => i.claimedById === currentUserId && !isClaimExpired(i.claimedAt))) {
    return "disabled"
  }

  // Find first available (unclaimed/expired) WAIT_DOCTOR patient
  const waitingItems = items.filter(i => i.status === "WAIT_DOCTOR")
  const firstAvailableIdx = waitingItems.findIndex(i =>
    !i.claimedById || isClaimExpired(i.claimedAt)
  )

  // This is the first available → can claim
  if (waitingItems[firstAvailableIdx]?.id === item.id) {
    return "available"
  }

  // Not first in FIFO order
  return "disabled"
}
```

## Verification

1. Login as two different doctors in separate browsers
2. Both should see the same WAIT_DOCTOR queue
3. Doctor A claims first patient → Doctor B sees it locked
4. Doctor B cannot click the locked patient
5. Doctor B can only click the next available (FIFO)
6. Doctor A releases claim → patient becomes available for Doctor B
7. Claim expires after 15 minutes if not started

## Constants

```typescript
const CLAIM_EXPIRY_MS = 15 * 60 * 1000  // Same as triage
```
