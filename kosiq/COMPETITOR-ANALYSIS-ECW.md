# eClinicalWorks CIPHR — Competitor Analysis for KOSIQ

Source: eClinicalWorks "Value-Based Care for eCW Users" presentation (Feb 2026)

## CIPHR — Clinical Intelligence for Population Health Records
- AI-powered analytics drawing from EMR + Population Health modules
- Tree analysis using nodes that represent discrete metrics
- Crosses data from: CQM, HCC, ACG, CCM, TCM, RPM, BHM
- Users can: create custom tree analyses, drill down to patients, track as custom measures, send alerts to To-Do lists
- Conversational AI search to generate analyses
- Access 1,000+ discrete metrics

### KOSIQ equivalent: Our AI analysis engine + dashboard. Need to add tree/drill-down visualization and natural language querying.

---

## HCC Risk Adjustment and Performance Management
- CMS HCC model including V28
- HHS HCC (Bronze, Silver, Gold, Platinum, Catastrophic)
- RAF (Risk Adjustment Factor) score calculation from demographics + chronic conditions
- **75% recapture rate** target metric
- Identifies coding gaps at point of care
- Displays Potential Codes for Evaluation (PCE) with evidence
- Pulls codes from external sources (PRISMA, healow Insights, claims data)
- To-Do features for provider review lists
- Population-level analysis and trends
- Daily automatic patient score calculation

### KOSIQ equivalent: Billing & Coding page. Need to add: PCE suggestions, RAF score calculation, HCC gap identification, recapture rate tracking, V28 support.

---

## ACG — Adjusted Clinical Groups (Johns Hopkins)
- Case-mix methodology for risk, cost, utilization
- Predicts future costs, admissions, readmissions
- Risk stratification: healthy → very high
- Multi-criteria filtering: Morbidity Markers, Utilization, Cost, Pharmacy, Probability
- Medication adherence metrics across 17 chronic conditions
- Identify patients at risk for coordination issues
- Real-time filtering and sorting

### KOSIQ equivalent: Risk stratification + Complex Cases pages. Our AI engine can emulate ACG methodology through claims analysis.

---

## HEDIS Quality Measures
- NCQA certified
- 100+ measures: Primary Care, Internal Medicine, Behavioral Health, Pediatrics
- Clinical Quality Measure Dashboard
- Point-of-care alerts and patient reminders
- Practice/provider/patient level filtering
- Compliance tracking via PRISMA from external providers
- Clinical Rule Engine (CRE) for CPT automation
- Daily quality measure computation
- Performance stratified by providers, payers, patient factors

### KOSIQ equivalent: Quality Metrics page. Need Florida-specific HEDIS measures. Should show numerator/denominator/rate for each measure.

---

## Patient-Centered Medical Home (PCMH)
- NCQA recognized
- 37 standard reports with drill-down
- Dashboard, Summary, Detail, De-identified Detail, Raw Data views
- Export: CSV, PDF, HTML
- NCQA submission view
- Auto-save report preferences
- Scheduled reports
- Provider performance gauge charts (red/yellow/green)
- Bundles with Care Plan, HEDIS Analytics, HCC

### KOSIQ equivalent: Business Insights > Physician Scorecards. Add gauge-style visualizations and multiple report views.

---

## Care/Disease Management Programs

### CCM (Chronic Care Management)
- For Medicare/managed-care patients with multiple chronic conditions
- Care coordination, medication management, frequent follow-ups
- CMS reimburses for non-face-to-face services
- Integrated time tracker for billing compliance
- Patient engagement tools
- Program enrollment management

### PCM (Principal Care Management)
- Single complex chronic condition focus
- PCM for Specialists (additional revenue without disrupting CCM)
- PCM for Primary Care (prevent deterioration)
- Care plan templates for 27 chronic conditions
- Batch billing automation
- Time-based activity tracking

### CCM + PCM Complementary
- Can run simultaneously for same patient population
- Different billing codes, different eligibility criteria

### APCM (Advanced Primary Care Management)
- Eligibility verification for attributed patients
- Automatic QMB (Qualified Medicare Beneficiary) status identification
- Consent management (electronic)
- Structured documentation
- Personalized care plans
- Batch claim generation for all eligible patients
- Centralized patient dashboard

### TCM (Transitional Care Management)
- Post-discharge follow-up
- Critical for readmission prevention

### RPM (Remote Patient Monitoring)
- Connected device data integration

### KOSIQ equivalent: Need a Care Management section with enrollment tracking, program eligibility identification, time tracking for billing. This is a major revenue driver for practices.

---

## Behavioral/Mental Health (BHM)
- Behavioral health integration
- Inpatient/24-hour behavioral health (BHIS)
- Aligns with Dr. J.D.'s SMI program requirement

---

## Cost & Utilization Explorer + Payer Analytics
- Claims-to-insights transformation
- Cost and utilization analysis tools
- Payer-specific analytics and comparison

### KOSIQ equivalent: Finance page + Claims page. Already have basic versions.

---

## Key Takeaways for KOSIQ

### Must-Have for Investor Demo:
1. HCC coding gap identification with RAF scores
2. HEDIS quality measures dashboard (Florida-specific)
3. Care management program tracking (CCM/PCM enrollment)
4. Provider scorecards with gauge-style visuals
5. Payer-specific analytics comparison
6. Natural language AI querying ("Show me diabetics with HbA1c > 9 not seen in 6 months")

### Differentiators KOSIQ Can Win On:
1. **AI-native** — eCW bolted AI onto legacy EMR; KOSIQ is AI-first
2. **Modern UI** — eCW looks dated; KOSIQ has Apple-quality design
3. **Faster insights** — No EMR integration needed; works from claims data alone
4. **Lower cost** — eCW requires full EMR subscription; KOSIQ is standalone
5. **Easier onboarding** — Upload CSV/Excel vs months of EMR implementation

---

## Care Plans (Chronic Care/Disease Management)
- Holistic patient view: health, wellness, lifestyle, home/community supports
- Collaborative care planning with care team, patient, family/caregivers
- Customized care plans to monitor progress and patient actions
- Risk identification and management
- Goal assignment, intervention definition, progress monitoring
- Automated reviews with patient/care team signature capture
- Member enrollment, program enrollment, care team assignment
- Group visit scheduling and documentation
- Dashboard: tasks, reminders, referrals, messaging, comprehensive reports

### KOSIQ equivalent: Need a Care Plan section within patient detail. Goals, interventions, progress tracking.

---

## TCM — Transitional Care Management
- Post-discharge continuity of care (acute → ambulatory)
- Reduces readmissions through follow-up care, medication reconciliation
- GENERATES REIMBURSEMENTS for non-face-to-face services
- **LACE tool** predicts 30-day readmission likelihood (Length of stay, Acuity, Comorbidities, ER visits)
- Automated TCM CPT code placement in Progress Notes
- Episodic notification management
- Success metrics reports: performance and hospitalization trends
- Tracks 14-day and 30-day readmission windows

### KOSIQ equivalent: Connect ENS discharge events → automatic TCM workflow triggers. Add LACE score calculation. Critical for readmission prevention tracking.

---

## RPM — Remote Patient Monitoring
- Wearable/tracker data integration into clinical records
- Blood pressure, glucose, weight trending (7/14/30/90 day)
- Out-of-range threshold alerts (configurable to reduce alert fatigue)
- Digital adherence trending for patient engagement
- Progress indicators for proactive interventions
- CMS reimbursements for monitoring services
- Time-based activity capture for billing

### KOSIQ equivalent: Future roadmap feature. Show as "Coming Soon" capability in investor pitch. Would require device integration APIs.

---

## Behavioral/Mental Health (BHM)
- Integrates behavioral health into primary care
- Regular screenings, timely referrals to specialists
- Coordinated care plans (behavioral + physical)
- Wiley content library for evidence-based guidelines
- **Group Visits**: peer support settings
- **AI Clinical Notes**: Sunoh.ai scribe for DAP/BIRP notes
- **Time Capture**: auto-populate CPTs based on time per user
- **Flexible Screening**: custom/state-specific forms with calculations
- **Phased Treatment**: pulls background info into progress notes
- **Enhanced Treatment Plans**: regulatory-compliant, editable
- **Privacy/Confidentiality**: provider/supervisor-only notes
- **Clinician Dashboard**: searchable caseload management
- **Discharge/Safety Plans**: customized per patient

### KOSIQ equivalent: BHM module ties to SMI program. For MVP, flag behavioral health patients and track screening compliance.

---

## BHIS — Inpatient/24-Hour Behavioral Health
- Full CCBHC (Certified Community Behavioral Health Clinic) support
- Crisis Management, Inpatient Services, Telehealth
- Addiction Treatment (alcohol, substance, gambling)
- Day Services (partial hospitalization)
- Intensive Outpatient Care
- Outpatient Behavioral Health Management

### KOSIQ equivalent: Out of scope for MVP. Note as future expansion.

---

## Cost & Utilization Explorer
- Medicare and multi-payer claims data access
- Population-level interactive analysis
- PMPM breakdown by category: Ambulatory Surgical, DME, Hospital Admits ER, Home Health, Hospital Admits
- Year-over-year comparison (claims count trends)
- Patient Count & Total Cost summary ($3M example for 200 patients)
- ER visit cost drilldown ($61K, 78 claims)
- Pie chart: cost distribution by service category
- Utilization patterns and trending dashboards
- Roster management integration

### KOSIQ equivalent: Finance page should match this layout. PMPM breakdown cards + cost distribution pie chart + ER analysis.

---

## Payer Analytics
- For ACOs, Managed Risk orgs, Practices of all sizes
- Works with any EHR (not just eCW)
- **11 dashboards**: Quality, HCC performance, avoidable ER, predictive costs, admission risk, procedures, referrals, Rx utilization
- ETL technology for multi-payer claims data
- ACG (Johns Hopkins) risk management model
- Predictive modeling: hospitalization risk + future medical costs
- Dashboard tabs: Cover Page, Overview, ACO Detail, Facility Analysis, Provider Dashboard, Patient Level, Cost Analysis, ER Raw Data

### KOSIQ equivalent: Our Analytics + Finance pages combined. Need: predictive cost modeling, avoidable ER analysis, facility-level drilldown.

---

## Professional Services for VBC
- **CCM Specialist Services**: Dedicated RN/LPN/MA for monthly outreach, care gap closure, enrollment, documentation, billing compliance
- **Business Analyst Services**: Gap analysis → project planning → workflow redesign
  - Discovery calls, remote consultations, site visits
  - Solution prioritization, scope/timeline definition
  - Workflow optimization, activation/setup/configuration assistance
- Expertise: BHM, CCM, TCM, RPM, PCMH, HEDIS, HCC, ACG

### KOSIQ opportunity: Offer implementation/consulting services alongside software. Revenue multiplier. Your dad's clinical expertise = built-in consulting team.

---

### Dr. J.D.'s Notes (from presentation):
- Focus on care quality for customers
- Need care manager workflows
- Population health + right team + risk adjustment are priorities
- Align HEDIS measures to Florida specifically
- Claims info organized by payer name
- Payer analytics as dedicated feature
- Data ingestion: handle HL7 format, protect PHI
- DQM (Data Quality Management) needed
