# Patient Record History Viewing for Doctor Consultation

## Objective
Enable doctors to view patient's past encounter history during consultation, including past diagnoses, prescriptions, lab results, and vitals trends.

## Current State
- Doctor consultation page (`/appointments`) shows only the **current encounter**
- `PatientSnapshot` displays demographics, allergies, chronic conditions
- No access to past encounters, historical diagnoses, or prescription patterns
- Patient detail page has encounter list (summary only) but doctors can't access it during consultation

## Recommended Approach: Slide-Out Sheet

Add a "View History" button in `PatientSnapshot` that opens a right-side Sheet panel with tabbed history views.

**Why Sheet over other approaches:**
- Preserves consultation context (form stays visible)
- Compact trigger button (per CLAUDE.md: "compact but easy access")
- Full space for detailed history when opened
- Sheet component already exists in the codebase

## Components to Create

### 1. `components/doctor/patient-history-sheet.tsx`
Main orchestrator with tabs:
- **Past Encounters** - Timeline of all visits
- **Diagnoses** - Aggregated diagnosis history
- **Medications** - Prescription patterns
- **Lab Results** - Historical lab data
- **Vitals Trend** - BP/HR/weight over time

### 2. History Tab Components (`components/doctor/history/`)
- `encounter-timeline.tsx` - Expandable encounter cards
- `diagnosis-history.tsx` - Grouped by ICD-10 with frequency
- `medication-history.tsx` - Grouped by medicine
- `lab-results-history.tsx` - Lab orders with results
- `vitals-trend.tsx` - Charts/table of vital trends

## Server Actions to Create

### `actions/doctor/get-patient-history.ts`
```typescript
// Fetches encounter summaries + aggregated diagnoses
{
  encounters: [{ id, occurredAt, chiefComplaint, diagnoses[], status }],
  aggregatedDiagnoses: [{ text, icdCode, count, firstDate, lastDate }],
  totalEncounters: number
}
```

### `actions/doctor/get-encounter-details.ts`
```typescript
// Lazy-loads full details for a specific encounter
{
  triageRecord: { vitals... },
  diagnoses: [{ text, icdCode }],
  prescriptions: [{ items: [...] }],
  labOrders: [{ items: [...], results: [...] }]
}
```

## Files to Modify

| File | Changes |
|------|---------|
| `components/doctor/patient-snapshot.tsx` | Add "View History" button with encounter count badge |
| `components/doctor/consultation-form.tsx` | Add state management for history sheet |

## Implementation Steps

### Phase 1: Backend
1. Create `lib/types/patient-history.ts` - Type definitions
2. Create `actions/doctor/get-patient-history.ts` - Fetch encounter summaries
3. Create `actions/doctor/get-encounter-details.ts` - Lazy load details

### Phase 2: UI Shell
4. Create `components/doctor/patient-history-sheet.tsx` - Main sheet with tabs
5. Update `PatientSnapshot` with trigger button
6. Wire up state in `ConsultationForm`

### Phase 3: History Tabs
7. Create `encounter-timeline.tsx` - Timeline view
8. Create `diagnosis-history.tsx` - Aggregated diagnoses
9. Create `medication-history.tsx` - Prescription history
10. Create `lab-results-history.tsx` - Lab history
11. Create `vitals-trend.tsx` - Vitals over time

### Phase 4: Polish
12. Loading skeletons and empty states
13. Error handling with toasts
14. Keyboard navigation (Escape to close)

## Data Flow

```
PatientSnapshot
    └─ [View History] button
         └─ Opens PatientHistorySheet
              ├─ onOpen: fetch getPatientHistoryAction(patientId)
              ├─ Tab: EncounterTimeline
              │    └─ onClick expand: getEncounterDetailsAction(encounterId)
              ├─ Tab: DiagnosisHistory (from aggregatedDiagnoses)
              ├─ Tab: MedicationHistory
              ├─ Tab: LabResultsHistory
              └─ Tab: VitalsTrend
```

## Performance

- Load only summaries initially (limit: 20 encounters)
- Lazy load full details when user expands
- Cache fetched details in component state
- Use existing indexes on `[patientId, occurredAt]`

## Verification

1. Login as doctor (`doctor.main@cho.local`)
2. Open consultation for a patient with history
3. Click "View History" button in PatientSnapshot
4. Verify all tabs display correct historical data
5. Expand an encounter to see full details
6. Check loading states and error handling
