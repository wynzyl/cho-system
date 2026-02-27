🩺 DOCTOR CONSULTATION – REQUIRED INFORMATION STRUCTURE

Design this as tab-based or section-based UI.

1️⃣ Patient Snapshot (Header Panel – Always Visible)

Purpose: Quick context before thinking.

Patient Name

Age / Sex
Civil Status
Address (Barangay)
Contact No.
Blood Type
PhilHealth No. (if applicable)
Allergies (highlighted in RED if present)
Chronic Conditions (Hypertension, DM, Asthma, etc.)
Last Visit Date
Current Encounter Status

👉 This should stay pinned at top.

2️⃣ Chief Complaint (Primary Reason for Visit)

Single required field:

“What brought you here today?”

Example:

Fever for 3 days
Dog bite
Persistent cough
Abdominal pain
Keep this short.

3️⃣ History of Present Illness (HPI)

Structured format (avoid long free text only).

Include:

Onset (When did it start?)
Duration
Severity (1–10 scale)
Character (sharp, dull, throbbing, burning)
Location
Radiation (spreading?)
Aggravating factors
Relieving factors
Associated symptoms (checklist)

Example checklist:
☐ Fever
☐ Vomiting
☐ Diarrhea
☐ Headache
☐ Rash
☐ Cough
☐ Shortness of breath

This section is where diagnosis starts forming.

4️⃣ Vital Signs (Auto-pulled from TRIAGE)

Blood Pressure
Heart Rate
Respiratory Rate
Temperature
Oxygen Saturation
Weight
Height
BMI

🚨 Highlight abnormal values automatically.

Example:
Fever ≥ 38°C (red)
BP ≥ 140/90 (orange)

5️⃣ Past Medical History

Checkbox + quick tags:

☐ Hypertension
☐ Diabetes
☐ TB
☐ Asthma
☐ Heart Disease
☐ Stroke
☐ Previous Surgery

Plus:
Current medications
Immunization status (important in CHO)

6️⃣ Family History (Optional but Important)

Diabetes
Hypertension
Cancer
Heart disease

7️⃣ Social History

Especially relevant for CHO:
Smoker (Y/N)
Alcohol (Y/N)
Occupation
Pregnancy status (if applicable)
Exposure history (Dengue area? Rabies exposure?)

8️⃣ Physical Examination

Structured by system (avoid big text box only).
General Appearance

☐ Alert
☐ Weak
☐ Pale
☐ Dehydrated

HEENT
Chest/Lungs
Cardiovascular
Abdomen
Skin
Extremities
Neurologic

Each section:

Normal
Abnormal (with short note)
Keep it semi-structured.

9️⃣ Assessment / Diagnosis

This connects to your ICD-10 table.

Allow:

Primary Diagnosis (Required)
Secondary Diagnosis (Optional)
Example:

A90 – Dengue fever
J06.9 – Upper respiratory infection

Include:
Clinical Impression (short summary)

🔟 Plan of Management
A. Medications

Drug
Dose
Frequency
Duration

B. Laboratory Request

CBC
Urinalysis
X-ray
Dengue NS1
Blood sugar
Auto-forward to LAB dashboard.

C. Procedures

Wound cleaning
Suturing
Nebulization

D. Advice / Instructions

Hydrate
Bed rest
Return if symptoms worsen

E. Follow-up Date