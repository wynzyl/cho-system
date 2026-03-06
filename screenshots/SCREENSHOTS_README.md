# Screenshot Capture Instructions

This folder holds screenshots for the CHO System Executive Presentation. Follow these steps to populate the images referenced in [PRESENTATION.md](../PRESENTATION.md).

## Prerequisites

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Open the app in a browser (e.g., `http://localhost:3000`).

## Test Users

All test users use the password: `password123`

| Screenshot | Route | Login As |
|------------|-------|----------|
| 01-login.png | `/login` | (capture before login) |
| 02-patients-list.png | `/patients` | registration@cho.local |
| 03-patient-form.png | `/patients/new` | registration@cho.local |
| 04-patient-detail.png | `/patients/[id]` | registration@cho.local |
| 05-triage-queue.png | `/triage` | triage.main@cho.local |
| 06-vitals-form.png | `/triage` (with patient claimed) | triage.main@cho.local |
| 07-doctor-queue.png | `/appointments` | doctor.main@cho.local |
| 08-consultation.png | `/appointments` (with patient claimed) | doctor.main@cho.local |

## Suggested Workflow

1. **Login** — Capture the login screen before entering credentials.
2. **Registration flow** — Log in as `registration@cho.local`, go to Patients, capture list and form. Open a patient detail and capture before forwarding to triage.
3. **Triage flow** — Log in as `triage.main@cho.local`, go to Triage, capture queue. Claim a patient and capture the vitals form panel.
4. **Doctor flow** — Log in as `doctor.main@cho.local`, go to Appointments, capture queue. Claim a patient and capture the consultation panel.

## Naming Convention

Save screenshots with these exact filenames in this folder:

- `01-login.png`
- `02-patients-list.png`
- `03-patient-form.png`
- `04-patient-detail.png`
- `05-triage-queue.png`
- `06-vitals-form.png`
- `07-doctor-queue.png`
- `08-consultation.png`

## Notes

- Ensure the database is seeded (`npx prisma db seed`) so test data exists for the queues.
- For best results, use a consistent browser width (e.g., 1280px) and capture full-page or focused UI sections.
