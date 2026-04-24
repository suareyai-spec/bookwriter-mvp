import { createDoc, addHeader, addTitle, addSubtitle, addParagraph, addBullet, addTable, checkPage, finalize, type TableCol } from './pdf-helpers'

// ============================================================
// Resource 1: VBC vs Fee-for-Service Comparison Guide
// ============================================================
function gen01(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'VBC vs Fee-for-Service Comparison Guide')
  y = addParagraph(doc, 'This guide provides a comprehensive side-by-side comparison of Value-Based Care (VBC) and traditional Fee-for-Service (FFS) payment models to help healthcare organizations understand the key differences and plan their transition strategy.', y)

  const cols: TableCol[] = [
    { header: 'Dimension', width: 120 },
    { header: 'Fee-for-Service (FFS)', width: 200 },
    { header: 'Value-Based Care (VBC)', width: 200 },
  ]
  const rows = [
    ['Reimbursement Model', 'Payment per service rendered; volume-driven. Each visit, test, and procedure generates revenue.', 'Payment tied to outcomes and quality; may include capitation, bundled payments, or shared savings.'],
    ['Incentive Structure', 'More services = more revenue. No financial incentive to reduce unnecessary care.', 'Better outcomes = higher payment. Incentives aligned with prevention, efficiency, and quality.'],
    ['Quality Focus', 'Quality is measured but not directly tied to payment in most cases.', 'Quality metrics (HEDIS, Stars, MIPS) directly impact reimbursement and bonus eligibility.'],
    ['Risk Sharing', 'Minimal financial risk; payer bears most cost risk. Provider paid regardless of outcome.', 'Shared risk between payer and provider. Upside (bonuses) and downside (penalties) possible.'],
    ['Patient Outcomes', 'Fragmented care; focus on acute episodes. Limited care coordination incentives.', 'Holistic, coordinated care. Emphasis on chronic disease management and preventive services.'],
    ['Documentation', 'Procedure-focused coding (CPT). Document to justify services rendered.', 'Diagnosis-focused coding (HCC/ICD-10). Document to capture severity and risk accurately.'],
    ['Care Coordination', 'Siloed care; limited communication between providers. Patient navigates system alone.', 'Team-based care; care managers, navigators. Proactive outreach and follow-up.'],
    ['Technology', 'EHR for billing. Limited analytics or population health tools.', 'Advanced analytics, risk stratification, predictive modeling, population health platforms.'],
    ['Revenue Predictability', 'Variable; depends on patient volume. Seasonal fluctuations common.', 'More predictable with capitation/PMPM. Shared savings provide upside opportunity.'],
    ['Patient Experience', 'Shorter visits; throughput focus. Wait times can be long.', 'Longer visits; relationship focus. Access to telehealth, same-day appointments.'],
  ]
  y = addTable(doc, cols, rows, y, { fontSize: 7.5 })

  y = checkPage(doc, y, 120)
  y = addSubtitle(doc, 'Key Transition Considerations', y)
  y = addBullet(doc, [
    'Assess current payer mix and identify VBC-ready contracts',
    'Invest in care management infrastructure before taking on downside risk',
    'Build data analytics capabilities for risk stratification and quality reporting',
    'Train providers on HCC coding and comprehensive documentation',
    'Establish patient engagement programs (AWV, chronic care management)',
    'Start with upside-only shared savings models before moving to full capitation',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 2: MACRA/MIPS Quick Reference Guide
// ============================================================
function gen02(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'MACRA/MIPS Quick Reference Guide')
  y = addParagraph(doc, 'The Medicare Access and CHIP Reauthorization Act (MACRA) created the Quality Payment Program (QPP), which includes MIPS and Advanced APMs. This reference covers MIPS categories, scoring, and reporting requirements.', y)

  y = addSubtitle(doc, 'MIPS Performance Categories & Weights (2026)', y)
  const cols: TableCol[] = [
    { header: 'Category', width: 130 },
    { header: 'Weight', width: 60 },
    { header: 'Description', width: 170 },
    { header: 'Key Requirements', width: 170 },
  ]
  const rows = [
    ['Quality', '30%', '6 measures reported; must include 1 outcome measure. Benchmarked against peers.', 'Report via claims, QCDR, qualified registry, or EHR. 12-month performance period.'],
    ['Cost', '30%', 'Calculated by CMS from claims. No separate reporting required.', 'Total Per Capita Cost, MSPB, episode-based measures. Attribution-based.'],
    ['Promoting Interoperability', '25%', 'EHR use measures: e-prescribing, health information exchange, patient access.', 'Must use 2015+ CEHRT. Report numerator/denominator for each measure. 90-day minimum.'],
    ['Improvement Activities', '15%', 'Select activities from CMS inventory. High-weight = 1 activity; medium = 2 activities.', 'Attest to activities performed for 90+ consecutive days. Max 40 points.'],
  ]
  y = addTable(doc, cols, rows, y)

  y = checkPage(doc, y, 140)
  y = addSubtitle(doc, 'MIPS Scoring & Payment Adjustments', y)
  const cols2: TableCol[] = [
    { header: 'Final Score Range', width: 130 },
    { header: 'Payment Adjustment', width: 130 },
    { header: 'Notes', width: 260 },
  ]
  const rows2 = [
    ['0 – 18.75 points', 'Negative (up to -9%)', 'Below performance threshold; penalty applied to Medicare Part B payments.'],
    ['18.75 points (threshold)', '0% (neutral)', 'No bonus, no penalty. Performance threshold set by CMS annually.'],
    ['18.76 – 74.99 points', 'Positive (partial)', 'Linear scaling from 0% up to maximum positive adjustment.'],
    ['75+ points', 'Positive (maximum + exceptional)', 'Eligible for exceptional performance bonus pool (additional funds).'],
    ['Not reported', '-9% (maximum penalty)', 'Failure to report = automatic maximum negative adjustment.'],
  ]
  y = addTable(doc, cols2, rows2, y)

  y = checkPage(doc, y, 140)
  y = addSubtitle(doc, 'MIPS Reporting Timeline', y)
  y = addBullet(doc, [
    'January 1 – December 31: Performance period (full calendar year)',
    'January – March (following year): Data submission window opens',
    'March 31: Submission deadline for quality, PI, and IA categories',
    'July – August: CMS releases preliminary feedback reports',
    'September – October: Targeted review/appeals period',
    'January 1 (2 years after performance): Payment adjustments applied to Medicare claims',
  ], y)

  y = checkPage(doc, y, 80)
  y = addSubtitle(doc, 'Small Practice & Special Status Exemptions', y)
  y = addBullet(doc, [
    'Small practices (≤15 clinicians): Automatic 6-point bonus; simplified reporting',
    'Rural/HPSA practices: Additional scoring considerations',
    'Non-patient-facing clinicians: PI reweighted to other categories',
    'Hospital-based clinicians: PI automatically reweighted',
    'Low-volume threshold: <200 Medicare Part B patients OR <$90K in allowed charges = exempt',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 3: APM Participation Decision Tree
// ============================================================
function gen03(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'APM Participation Decision Tree')
  y = addParagraph(doc, 'Use this guide to evaluate whether your practice is ready to participate in an Alternative Payment Model (APM) and determine which model best fits your capabilities and risk tolerance.', y)

  y = addSubtitle(doc, 'Step 1: Readiness Assessment', y)
  const cols: TableCol[] = [
    { header: 'Readiness Factor', width: 160 },
    { header: 'Minimum Requirement', width: 180 },
    { header: 'Your Status', width: 180 },
  ]
  const rows = [
    ['Annual Revenue', '>$2M in attributed patient revenue', '☐ Meets  ☐ Below  ☐ Unknown'],
    ['Patient Panel Size', '≥5,000 attributed lives (most ACOs)', '☐ Meets  ☐ Below  ☐ Unknown'],
    ['EHR Capability', '2015+ CEHRT with quality reporting', '☐ Meets  ☐ Below  ☐ Unknown'],
    ['Care Management Staff', 'At least 1 FTE care manager per 1,000 high-risk patients', '☐ Meets  ☐ Below  ☐ Unknown'],
    ['Data Analytics', 'Ability to stratify risk, track quality, generate reports', '☐ Meets  ☐ Below  ☐ Unknown'],
    ['Financial Reserves', '3-6 months operating reserves for downside risk models', '☐ Meets  ☐ Below  ☐ Unknown'],
    ['Provider Engagement', 'Clinical champions committed to VBC transformation', '☐ Meets  ☐ Below  ☐ Unknown'],
  ]
  y = addTable(doc, cols, rows, y)

  y = checkPage(doc, y, 160)
  y = addSubtitle(doc, 'Step 2: APM Model Comparison', y)
  const cols2: TableCol[] = [
    { header: 'APM Type', width: 100 },
    { header: 'Risk Level', width: 70 },
    { header: 'Requirements', width: 170 },
    { header: 'Best For', width: 180 },
  ]
  const rows2 = [
    ['MSSP Basic (Track A/B)', 'Upside only', 'Min. 5,000 attributed beneficiaries; quality reporting; 3-year agreement.', 'New-to-VBC practices wanting shared savings without penalty risk.'],
    ['MSSP Enhanced', 'Two-sided', 'Same as Basic + financial reserves for repayment. Higher sharing rate.', 'Experienced ACOs ready for higher reward with downside exposure.'],
    ['ACO REACH', 'Full risk', 'Prospective attribution; capitated payments; quality withhold.', 'Sophisticated organizations with strong data/analytics and reserves.'],
    ['Bundled Payments (BPCI-A)', 'Episode-based', '90-day clinical episodes; target price set by CMS. Reconciliation.', 'Hospitals/systems with strong post-acute coordination.'],
    ['Primary Care First', 'Partial capitation', 'Flat primary care payment + performance bonus. Hybrid model.', 'Primary care practices with panel management capabilities.'],
    ['Direct Contracting', 'Full capitation', 'Total cost of care responsibility. Global/professional capitation.', 'Advanced medical groups and health systems only.'],
  ]
  y = addTable(doc, cols2, rows2, y, { fontSize: 7.5 })

  y = checkPage(doc, y, 100)
  y = addSubtitle(doc, 'Step 3: Risk Tolerance Assessment', y)
  y = addBullet(doc, [
    'Conservative (Start here): MSSP Basic Track — upside-only shared savings, no penalty risk',
    'Moderate: MSSP Enhanced or Primary Care First — some downside risk with higher upside potential',
    'Aggressive: ACO REACH or Direct Contracting — full risk but maximum potential reward',
    'Episode-focused: BPCI Advanced — good for procedural specialties with post-acute coordination',
  ], y)

  y = checkPage(doc, y, 80)
  y = addSubtitle(doc, 'Decision Checklist', y)
  y = addBullet(doc, [
    '☐ Completed readiness assessment above — all critical factors meet minimum requirements',
    '☐ Identified target APM model based on risk tolerance and organizational capability',
    '☐ Evaluated payer landscape — identified commercial VBC contract opportunities',
    '☐ Developed 12-month APM preparation timeline with milestones',
    '☐ Secured executive/board support and allocated transformation budget',
    '☐ Engaged legal counsel for contract review and regulatory compliance',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 4: Top 50 HCC Codes Reference Card
// ============================================================
function gen04(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Top 50 HCC Codes Reference Card')
  y = addParagraph(doc, 'This reference card lists the most clinically significant and financially impactful HCC categories used in CMS-HCC risk adjustment. RAF weights shown are for the CMS-HCC V28 Community Non-Dual Aged model.', y)

  const cols: TableCol[] = [
    { header: 'HCC', width: 35 },
    { header: 'Description', width: 140 },
    { header: 'RAF', width: 35 },
    { header: 'Common ICD-10 Codes', width: 150 },
    { header: 'Documentation Tips', width: 162 },
  ]
  const rows = [
    ['35', 'Diabetes w/ Chronic Complications', '0.302', 'E11.22, E11.65, E11.40, E11.51', 'Specify type, complications; link to organ damage'],
    ['18', 'Diabetes w/ Acute Complications', '0.302', 'E11.10, E11.11, E10.10, E10.11', 'Document ketoacidosis, hyperosmolarity events'],
    ['85', 'Congestive Heart Failure', '0.323', 'I50.22, I50.32, I50.42, I50.9', 'Specify systolic/diastolic, acuity, NYHA class'],
    ['86', 'Acute Myocardial Infarction', '0.231', 'I21.01, I21.09, I21.11, I21.19', 'Document type, vessel, STEMI vs NSTEMI, timing'],
    ['96', 'Specified Heart Arrhythmias', '0.259', 'I48.0, I48.1, I48.2, I48.91', 'Specify paroxysmal vs persistent vs permanent AF'],
    ['111', 'COPD', '0.328', 'J44.0, J44.1, J43.9, J44.9', 'Document severity, exacerbation frequency, FEV1'],
    ['112', 'Fibrosis of Lung & Other Lung Disorders', '0.209', 'J84.10, J84.112, J84.17', 'Biopsy results, imaging findings, progression'],
    ['138', 'Chronic Kidney Disease, Stage 4', '0.237', 'N18.4', 'Document GFR, progression, treatment plan'],
    ['139', 'Chronic Kidney Disease, Stage 5', '0.289', 'N18.5, N18.6', 'Document dialysis status, transplant candidacy'],
    ['115', 'Aspiration & Specified Bacterial Pneumonias', '0.467', 'J15.0, J15.1, J15.212, J69.0', 'Document organism, aspiration risk factors'],
    ['48', 'Morbid Obesity', '0.250', 'E66.01', 'Document BMI ≥40, comorbidities, treatment plan'],
    ['22', 'Macular Degeneration', '0.303', 'H35.3110, H35.3210, H35.3290', 'Specify wet vs dry, laterality, severity'],
    ['23', 'Diabetic Retinopathy', '0.188', 'E11.3211, E11.3411, E11.3511', 'Link to diabetes; specify proliferative vs NPDR'],
    ['55', 'Drug/Alcohol Dependence', '0.254', 'F10.20, F11.20, F14.20, F15.20', 'Document substance, severity, MAT treatment'],
    ['56', 'Drug/Alcohol Abuse, w/o Dependence', '0.254', 'F10.10, F11.10, F12.10', 'Document substance, frequency, counseling'],
    ['57', 'Schizophrenia', '0.479', 'F20.0, F20.1, F20.2, F20.3', 'Document type, current status, medication compliance'],
    ['58', 'Reactive/Unspecified Psychosis', '0.350', 'F23, F28, F29', 'Document symptoms, duration, treatment response'],
    ['59', 'Major Depression, Bipolar Disorders', '0.309', 'F31.10, F31.30, F32.1, F33.1', 'Document episode type, severity, treatment plan'],
    ['70', 'Quadriplegia', '0.955', 'G82.50, G82.51, G82.52, G82.53', 'Document level, completeness, functional status'],
    ['71', 'Paraplegia', '0.515', 'G82.20, G82.21, G82.22', 'Document level, completeness, etiology'],
    ['72', 'Spinal Cord Disorders/Injuries', '0.398', 'G95.0, G95.11, G95.89', 'Document location, severity, functional impact'],
    ['73', 'Amyotrophic Lateral Sclerosis', '0.862', 'G12.21', 'Document progression, functional status, respiratory'],
    ['74', 'Cerebral Palsy', '0.228', 'G80.0, G80.1, G80.2, G80.3', 'Document type, severity, mobility status'],
    ['100', 'Ischemic/Unspecified Stroke', '0.230', 'I63.30, I63.50, I63.9, I69.30', 'Document type, vessel, residual deficits'],
    ['103', 'Hemiplegia/Hemiparesis', '0.344', 'G81.90, G81.91, G81.92, G81.93', 'Document affected side, severity, cause'],
    ['106', 'Atherosclerosis of Arteries', '0.209', 'I70.0, I70.211, I70.231', 'Document location, severity (claudication, rest pain)'],
    ['107', 'Vascular Disease w/ Complications', '0.383', 'I70.261, I70.262, I70.263', 'Document ulceration, gangrene, amputation level'],
    ['108', 'Vascular Disease', '0.188', 'I73.9, I77.1, I70.90', 'Specify type and location of vascular disease'],
    ['8', 'Metastatic Cancer & Acute Leukemia', '2.484', 'C78.00, C79.31, C91.00', 'Document primary site, metastatic sites, treatment'],
    ['9', 'Lung & Other Severe Cancers', '0.972', 'C34.10, C34.90, C22.0', 'Document stage, histology, treatment status'],
    ['10', 'Lymphoma & Other Cancers', '0.677', 'C81.10, C82.00, C83.30', 'Document type, stage, treatment status'],
    ['11', 'Colorectal, Bladder & Other Cancers', '0.285', 'C18.9, C67.9, C56.1', 'Document site, stage, active vs history'],
    ['12', 'Breast, Prostate & Other Cancers', '0.146', 'C50.911, C61', 'Document stage, receptor status, treatment'],
    ['80', 'Rheumatoid Arthritis & Inflammatory CT', '0.302', 'M05.00, M06.00, M05.70', 'Document disease activity, joint involvement, DAS'],
    ['121', 'Pancreas Transplant Status', '0.130', 'Z94.83', 'Document transplant date, function, immunosuppression'],
    ['134', 'Dialysis Status', '0.389', 'Z99.2', 'Document modality, access type, adequacy (Kt/V)'],
    ['135', 'Acute Renal Failure', '0.372', 'N17.0, N17.1, N17.2, N17.9', 'Document cause, staging (AKIN/KDIGO), recovery'],
    ['40', 'Specified Nutritional Deficiencies', '0.512', 'E43, E44.0, E44.1', 'Document BMI, albumin, prealbumin, etiology'],
    ['47', 'Severe Hematological Disorders', '0.601', 'D61.01, D61.09, D46.0', 'Document type, lab values, transfusion needs'],
    ['176', 'Artificial Openings for Feeding/Elimination', '0.535', 'Z93.0, Z93.1, Z93.3, Z93.4', 'Document ostomy type, reason, management'],
    ['2', 'HIV/AIDS', '0.282', 'B20', 'Document viral load, CD4 count, ART regimen'],
    ['6', 'Opportunistic Infections', '0.412', 'B59, B25.0, B37.1', 'Document organism, site, relationship to immune status'],
    ['62', 'Peritonitis/GI Perforation/Necrotizing Enterocolitis', '0.393', 'K65.0, K63.1, K65.9', 'Document cause, location, surgical intervention'],
    ['161', 'Chronic Ulcer of Skin, Except Pressure', '0.515', 'L97.109, L97.209, L97.509', 'Document location, depth, wound stage, treatment'],
    ['162', 'Pressure Ulcer of Skin', '0.515', 'L89.013, L89.023, L89.153', 'Document stage (I-IV), location, dimensions'],
    ['87', 'Unstable Angina & Other Ischemic HD', '0.231', 'I20.0, I25.110, I25.710', 'Document episode type, cardiac cath results'],
    ['99', 'Cerebral Hemorrhage', '0.370', 'I61.0, I61.1, I61.9, I62.9', 'Document location, size, neurological deficits'],
    ['77', 'Multiple Sclerosis', '0.423', 'G35', 'Document type (RRMS, PPMS), EDSS, relapses, DMT'],
    ['82', 'Respirator Dependence/Tracheostomy', '1.032', 'Z99.11, Z99.12, J95.00', 'Document vent settings, duration, weaning status'],
    ['125', 'Vertebral Fractures', '0.484', 'M80.08XA, S12.000A, S22.000A', 'Document location, mechanism, osteoporosis link'],
  ]
  y = addTable(doc, cols, rows, y, { fontSize: 6.5 })

  return finalize(doc)
}

// ============================================================
// Resource 5: MEAT Documentation Checklist
// ============================================================
function gen05(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'MEAT Documentation Checklist')
  y = addParagraph(doc, 'The MEAT framework (Monitor, Evaluate, Assess, Treat) ensures that each chronic condition reported for risk adjustment is adequately documented at every encounter. Use this checklist to verify documentation completeness.', y)

  for (const section of [
    {
      title: 'M — Monitor',
      desc: 'Document signs, symptoms, disease progression, or objective findings being tracked.',
      qualifies: ['Review and document current lab results (A1C, creatinine, BNP)', 'Track symptom changes (dyspnea on exertion worsened from 2 flights to 1)', 'Record vital signs relevant to condition (BP for hypertension, weight for CHF)', 'Document functional status changes (6-minute walk test results)', 'Review and note home monitoring data (blood glucose logs, BP diary)'],
      doesNot: ['Generic statement: "condition stable"', 'Listing a diagnosis in the problem list without further documentation', 'Reviewing labs without documenting the results or trend', 'Copying forward prior visit notes without updating'],
    },
    {
      title: 'E — Evaluate',
      desc: 'Order or review diagnostic tests, consult results, or refer to specialists.',
      qualifies: ['Order lab tests: "Check A1C, lipid panel, urine microalbumin"', 'Review specialist consult notes: "Per cardiology, EF improved to 40%"', 'Order imaging: "Chest X-ray to evaluate for pulmonary congestion"', 'Document test interpretation: "A1C 8.2%, up from 7.5% — diabetes not at goal"', 'Refer to specialist with documented reason for referral'],
      doesNot: ['Ordering tests without clinical indication documented', 'Referral without documenting the reason or expected outcome', 'Noting "labs pending" without follow-up documentation'],
    },
    {
      title: 'A — Assess',
      desc: 'Document clinical impression, status, severity, and/or response to treatment.',
      qualifies: ['"Type 2 diabetes with diabetic nephropathy — worsening, A1C above target"', '"CHF, systolic, NYHA Class III — stable on current diuretic regimen"', '"COPD with acute exacerbation — moderate severity, third this year"', 'Document disease staging: "CKD Stage 4, GFR 22, trending down from 28"', 'Assess response to current plan: "Pain improved from 8/10 to 4/10 on gabapentin"'],
      doesNot: ['Listing diagnosis without assessment of status or severity', '"Diabetes — continue meds" (no assessment of control/severity)', 'Using vague terms: "doing well" without objective data'],
    },
    {
      title: 'T — Treat',
      desc: 'Initiate, continue, adjust, or discontinue treatment. Document rationale for plan.',
      qualifies: ['Start/adjust medication: "Increase metformin to 1000mg BID due to A1C above target"', 'Therapeutic procedure: "Administer joint injection for RA flare"', 'Referral as treatment: "Refer to diabetes educator for insulin training"', 'Patient education: "Discussed low-sodium diet for CHF management"', 'Continue current treatment with rationale: "Continue lisinopril 20mg — BP at goal, CKD stable"'],
      doesNot: ['"Continue current medications" without specifying which or why', 'Ordering a treatment without documented indication', 'Failing to address a listed condition in the treatment plan'],
    },
  ]) {
    y = checkPage(doc, y, 180)
    y = addSubtitle(doc, section.title, y)
    y = addParagraph(doc, section.desc, y)
    y = addParagraph(doc, '✓ Qualifies:', y, { bold: true })
    y = addBullet(doc, section.qualifies, y)
    y = addParagraph(doc, '✗ Does NOT Qualify:', y, { bold: true })
    y = addBullet(doc, section.doesNot, y)
  }

  return finalize(doc)
}

// ============================================================
// Resource 6: CMS-HCC V28 Changes Summary
// ============================================================
function gen06(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'CMS-HCC V28 Changes Summary')
  y = addParagraph(doc, 'CMS transitioned from HCC V24 to V28 for Medicare Advantage risk adjustment. This summary covers the key changes, their financial impact, and implementation timeline to help organizations prepare.', y)

  y = addSubtitle(doc, 'Implementation Timeline', y)
  const cols: TableCol[] = [
    { header: 'Payment Year', width: 100 },
    { header: 'V24 Weight', width: 100 },
    { header: 'V28 Weight', width: 100 },
    { header: 'Notes', width: 220 },
  ]
  y = addTable(doc, cols, [
    ['2024', '67%', '33%', 'Phase-in begins; blended model'],
    ['2025', '33%', '67%', 'V28 weighted more heavily'],
    ['2026', '0%', '100%', 'Full V28 implementation'],
  ], y)

  y = checkPage(doc, y, 180)
  y = addSubtitle(doc, 'Key Structural Changes', y)
  y = addBullet(doc, [
    'V24 had 86 HCC categories → V28 has 115 HCC categories (more granularity)',
    'V28 adds condition severity levels (e.g., differentiates mild vs severe CHF)',
    'Interaction terms reduced from 16 to 12; some disease interactions removed',
    'New denominator methodology changes RAF normalization factor',
    'Coding Intensity Factor (CIF) reduced from 5.90% to 5.40%',
  ], y)

  y = checkPage(doc, y, 200)
  y = addSubtitle(doc, 'Notable Dropped HCCs (V24 → Not in V28)', y)
  const cols2: TableCol[] = [
    { header: 'V24 HCC', width: 70 },
    { header: 'Description', width: 200 },
    { header: 'V24 RAF Weight', width: 80 },
    { header: 'Impact', width: 170 },
  ]
  y = addTable(doc, cols2, [
    ['HCC 23', 'Other Specified Hepatitis', '0.146', 'Revenue loss for hepatitis patients'],
    ['HCC 39', 'Bone/Joint/Muscle Infections', '0.363', 'Significant revenue loss if not remapped'],
    ['HCC 45', 'Intestinal Obstruction/Perforation', '0.283', 'Reclassified under new categories'],
    ['HCC 48', 'Pancreatic Disease', '0.174', 'Dropped entirely from model'],
    ['HCC 54', 'Substance Use Disorder (some)', '0.254', 'Reclassified; document specificity critical'],
    ['HCC 56', 'Guillain-Barré & Inflammatory Neuropathy', '0.235', 'Merged into broader neuro categories'],
  ], y)

  y = checkPage(doc, y, 200)
  y = addSubtitle(doc, 'New/Modified HCCs in V28', y)
  const cols3: TableCol[] = [
    { header: 'V28 HCC', width: 70 },
    { header: 'Description', width: 200 },
    { header: 'V28 RAF Weight', width: 80 },
    { header: 'Action Required', width: 170 },
  ]
  y = addTable(doc, cols3, [
    ['HCC 37', 'Diabetes w/ Chronic Complications (tiered)', '0.302', 'Document all complications with specificity'],
    ['HCC 238', 'Encounter for BMI 40+', '0.250', 'Ensure BMI documented at every visit'],
    ['HCC 263', 'Stem Cell Transplant', '0.888', 'New capture opportunity; document status'],
    ['HCC 385', 'Heart Failure (severity split)', '0.323–1.105', 'Specify NYHA class for appropriate tier'],
    ['HCC 401', 'Chronic Pancreatitis', '0.174', 'New; replaces dropped V24 category'],
  ], y)

  y = checkPage(doc, y, 100)
  y = addSubtitle(doc, 'Revenue Impact Mitigation Strategies', y)
  y = addBullet(doc, [
    'Conduct V28 impact analysis: compare current coded conditions against new model to estimate revenue change',
    'Retrain coders on V28 mapping changes and specificity requirements',
    'Implement clinical documentation improvement (CDI) programs targeting new severity distinctions',
    'Focus on capturing newly weighted conditions (morbid obesity, transplant status, severity-tiered HF)',
    'Update EHR templates and clinical decision support to prompt for V28-specific documentation',
    'Monitor RAF score trends quarterly during the transition period',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 7: Risk Adjustment Audit Template
// ============================================================
function gen07(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Risk Adjustment Audit Template')
  y = addParagraph(doc, 'Use this template for internal risk adjustment audits to ensure coding accuracy, documentation completeness, and compliance with CMS guidelines. Regular audits reduce RADV risk and optimize RAF accuracy.', y)

  y = addSubtitle(doc, 'Pre-Audit Checklist', y)
  y = addBullet(doc, [
    '☐ Define audit scope: number of charts, date range, provider(s), HCC categories',
    '☐ Pull sample: random 10% OR targeted (high-RAF, high-revenue, new providers)',
    '☐ Gather tools: CMS-HCC crosswalk, ICD-10 codebook, coding guidelines',
    '☐ Assign audit team: certified coders (CPC/CRC), compliance officer, clinical reviewer',
    '☐ Prepare chart review worksheets (see below)',
    '☐ Establish scoring criteria and acceptable error threshold (<5%)',
  ], y)

  y = checkPage(doc, y, 200)
  y = addSubtitle(doc, 'Chart Review Worksheet', y)
  const cols: TableCol[] = [
    { header: 'Field', width: 160 },
    { header: 'Finding', width: 180 },
    { header: 'Status', width: 180 },
  ]
  y = addTable(doc, cols, [
    ['Patient ID / Chart #', '_________________', '☐ Complete  ☐ Incomplete'],
    ['Date of Service', '_________________', '☐ Within audit period'],
    ['Provider Name/NPI', '_________________', '☐ Verified'],
    ['ICD-10 Code(s) Submitted', '_________________', '☐ Matches documentation'],
    ['HCC(s) Mapped', '_________________', '☐ Correct mapping'],
    ['MEAT Documented?', 'M☐  E☐  A☐  T☐', '☐ All elements  ☐ Partial  ☐ None'],
    ['Condition Specificity Adequate?', '_________________', '☐ Yes  ☐ Needs improvement'],
    ['Supports Code to Highest Specificity?', '_________________', '☐ Yes  ☐ Undercoded  ☐ Overcoded'],
    ['Coder Agrees with Submitted Codes?', '_________________', '☐ Agree  ☐ Add codes  ☐ Delete codes'],
    ['Overall Chart Score', '_________________', '☐ Pass  ☐ Fail  ☐ Needs review'],
  ], y)

  y = checkPage(doc, y, 160)
  y = addSubtitle(doc, 'Documentation Gaps Tracker', y)
  const cols2: TableCol[] = [
    { header: 'Gap Type', width: 150 },
    { header: 'Frequency', width: 60 },
    { header: 'Impact', width: 80 },
    { header: 'Remediation', width: 230 },
  ]
  y = addTable(doc, cols2, [
    ['Missing MEAT elements', '___', 'High', 'Provider education on documentation requirements'],
    ['Unspecified ICD-10 codes', '___', 'High', 'Code specificity training; update EHR templates'],
    ['Conditions not addressed', '___', 'High', 'Require all chronic conditions reviewed annually'],
    ['Copy-forward without update', '___', 'Medium', 'EHR audit trail; require attestation updates'],
    ['Missing link between DX and treatment', '___', 'Medium', 'CDI specialist real-time chart review'],
    ['Incorrect HCC mapping', '___', 'High', 'Coder training on V28 crosswalk changes'],
  ], y)

  y = checkPage(doc, y, 100)
  y = addSubtitle(doc, 'Remediation Action Plan', y)
  y = addBullet(doc, [
    '1. Summarize findings: total charts reviewed, error rate, top gap categories',
    '2. Provider-specific feedback: share individual results with each provider privately',
    '3. Targeted education: schedule training on top 3 documentation gaps identified',
    '4. EHR optimization: update templates/macros to prompt for missing elements',
    '5. Re-audit timeline: 90-day follow-up audit on same providers to measure improvement',
    '6. Compliance reporting: document audit results for regulatory compliance files',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 8: HEDIS Measures Master Reference
// ============================================================
function gen08(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'HEDIS Measures Master Reference')
  y = addParagraph(doc, 'Healthcare Effectiveness Data and Information Set (HEDIS) measures are used by more than 90% of health plans to evaluate care quality. This reference covers key primary care HEDIS measures relevant to value-based contracts.', y)

  const cols: TableCol[] = [
    { header: 'Measure', width: 85 },
    { header: 'Description', width: 110 },
    { header: 'Numerator / Denominator', width: 160 },
    { header: 'Gap Closure Tips', width: 167 },
  ]
  const rows = [
    ['HbA1c Control (CDC)', 'Diabetic patients 18-75 with A1C <8.0%', 'Num: A1C <8.0% | Den: Diabetes DX + 18-75 years', 'Pre-visit planning; standing lab orders; outreach 30 days before visit'],
    ['Blood Pressure Control (CBP)', 'HTN patients with BP <140/90', 'Num: Most recent BP <140/90 | Den: HTN DX + 18-85 years', 'In-office BP protocol; home monitoring; pharmacist consults'],
    ['Colorectal Screening (COL)', 'Adults 45-75 appropriately screened', 'Num: FIT/FOBT (1yr), colonoscopy (10yr), FIT-DNA (3yr) | Den: 45-75 years', 'Mailed FIT kits; standing orders; patient navigators'],
    ['Breast Cancer Screening (BCS)', 'Women 50-74 with mammogram in 2 years', 'Num: Mammogram in past 27 months | Den: Women 50-74', 'Partner with imaging centers; reminder calls; mobile mammography'],
    ['Controlling BP (CBP) <140/90', 'BP control for patients with HTN diagnosis', 'Num: Last BP <140/90 | Den: Age 18-85 with HTN', 'Standardize measurement; repeat elevated readings; adjust meds same visit'],
    ['Medication Adherence — Statins', 'Statin PDC ≥80% (proportion of days covered)', 'Num: PDC ≥0.80 | Den: 2+ statin fills, age 18+', '90-day fills; auto-refill enrollment; adherence counseling'],
    ['Medication Adherence — RASA', 'RAS antagonist PDC ≥80%', 'Num: PDC ≥0.80 | Den: 2+ RASA fills, age 18+', 'Simplify regimen; pill organizers; pharmacy coordination'],
    ['Medication Adherence — Diabetes', 'Diabetes medication PDC ≥80%', 'Num: PDC ≥0.80 | Den: 2+ diabetes med fills, age 18+', 'Address cost barriers; generic alternatives; refill reminders'],
    ['Depression Screening (DSF)', 'Screening for depression with PHQ-9 and follow-up plan', 'Num: Positive screen + follow-up plan | Den: 12+ years with visit', 'Integrate PHQ-9 into intake; EHR alerts; warm handoff to BH'],
    ['Fall Risk Management (FRM)', 'Patients 65+ screened for fall risk', 'Num: Fall risk screening done | Den: 65+ with visit', 'Use Timed Up and Go; document in structured field; PT referral'],
    ['BMI Screening (ABA)', 'BMI documented + follow-up if abnormal', 'Num: BMI recorded + plan if abnormal | Den: 18+ with visit', 'Auto-calculate BMI from vitals; nutrition referral template'],
    ['Childhood Immunizations (CIS)', 'Children with complete immunization series by age 2', 'Num: All required vaccines by 2nd birthday | Den: Children turning 2', 'Registry tracking; reminder/recall system; standing orders'],
    ['Cervical Cancer Screening (CCS)', 'Women 21-64 appropriately screened', 'Num: Pap (3yr, 21-64) or Pap+HPV (5yr, 30-64) | Den: Women 21-64', 'Standing orders; nurse-led screening; OB/GYN coordination'],
    ['Kidney Health (KED)', 'Diabetic patients with eGFR and uACR in past year', 'Num: Both eGFR + uACR in year | Den: 18-85 with diabetes', 'Add uACR to diabetes lab panel; pre-visit lab orders'],
  ]
  y = addTable(doc, cols, rows, y, { fontSize: 6.5 })

  return finalize(doc)
}

// ============================================================
// Resource 9: Star Rating Calculation Worksheet
// ============================================================
function gen09(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Star Rating Calculation Worksheet')
  y = addParagraph(doc, 'Medicare Star Ratings (1-5 stars) determine quality bonus payments for Medicare Advantage plans. This worksheet explains the calculation methodology and strategies for improvement.', y)

  y = addSubtitle(doc, 'Star Rating Domains & Weights', y)
  const cols: TableCol[] = [
    { header: 'Domain', width: 140 },
    { header: 'Weight', width: 60 },
    { header: 'Example Measures', width: 160 },
    { header: 'Improvement Lever', width: 162 },
  ]
  y = addTable(doc, cols, [
    ['Staying Healthy (Screenings/Tests)', '1x or 3x*', 'Breast cancer screening, colorectal screening, A1C control', 'Proactive gap closure outreach campaigns'],
    ['Managing Chronic Conditions', '1x or 3x*', 'Diabetes care, BP control, RA management, osteoporosis', 'Care management programs for high-risk patients'],
    ['Member Experience (CAHPS)', '1x or 3x*', 'Getting needed care, customer service, rating of plan', 'Access improvements; same-day appointments; follow-up calls'],
    ['Member Complaints', '1x or 3x*', 'Complaints rate, appeals rate, CTM issues', 'Rapid complaint resolution; member services training'],
    ['Drug Safety & Accuracy', '1x', 'MTM completion, high-risk meds, adherence', 'Pharmacist-led medication reviews; deprescribing initiatives'],
    ['*Outcome/patient experience measures are triple-weighted', '', '', ''],
  ], y)

  y = checkPage(doc, y, 180)
  y = addSubtitle(doc, 'Cut Point Thresholds (Illustrative)', y)
  const cols2: TableCol[] = [
    { header: 'Stars', width: 60 },
    { header: 'Percentile Range', width: 120 },
    { header: 'Quality Bonus', width: 120 },
    { header: 'Revenue Impact', width: 220 },
  ]
  y = addTable(doc, cols2, [
    ['5 Stars', '90th+ percentile', '5% QBP', 'Maximum bonus; marketing advantage ("5-star plan")'],
    ['4.5 Stars', '80th-89th percentile', '5% QBP', 'Quality Bonus Payment threshold met'],
    ['4 Stars', '60th-79th percentile', '5% QBP', 'Minimum threshold for Quality Bonus Payment'],
    ['3.5 Stars', '40th-59th percentile', '0%', 'No bonus; at-risk for member attrition'],
    ['3 Stars', '25th-39th percentile', '0%', 'Below average; regulatory scrutiny possible'],
    ['<3 Stars', 'Below 25th percentile', '0%', 'CMS may restrict enrollment; plan at risk of termination'],
  ], y)

  y = checkPage(doc, y, 140)
  y = addSubtitle(doc, 'Categorical Adjustment Index (CAI)', y)
  y = addParagraph(doc, 'The CAI adjusts Star Ratings for plans serving high proportions of members with social risk factors (dual-eligible, disabled, low-income subsidy). Plans with higher proportions of disadvantaged members receive favorable adjustments.', y)
  y = addBullet(doc, [
    'CAI factors: % dual-eligible, % disabled, % LIS recipients in plan membership',
    'Applied as a reward factor after initial star calculation',
    'Intended to prevent penalizing plans serving vulnerable populations',
    'Plans should track their dual/LIS percentage and model CAI impact',
  ], y)

  y = checkPage(doc, y, 120)
  y = addSubtitle(doc, 'Star Rating Improvement Strategies', y)
  y = addBullet(doc, [
    'Identify measures closest to next star threshold (biggest ROI for improvement)',
    'Focus on triple-weighted measures first (outcomes and patient experience)',
    'Implement CAHPS improvement initiatives: access, communication, care coordination',
    'Deploy medication adherence programs: 90-day fills, IVR refill reminders, MTM',
    'Create provider scorecards showing individual performance vs. benchmarks',
    'Run annual "Stars sprint" campaigns in Q3-Q4 for gap closure',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 10: Quality Gap Closure Tracking Template
// ============================================================
function gen10(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Quality Gap Closure Tracking Template')
  y = addParagraph(doc, 'Use this template to track individual patient care gaps, outreach efforts, and closure status. Maintain this as a living document updated weekly by care coordinators.', y)

  y = addSubtitle(doc, 'Patient-Level Gap Tracking', y)
  const cols: TableCol[] = [
    { header: 'Patient Name', width: 80 },
    { header: 'DOB', width: 55 },
    { header: 'Open Gap(s)', width: 100 },
    { header: 'Gap Type', width: 65 },
    { header: 'Outreach Date', width: 65 },
    { header: 'Closure Date', width: 65 },
    { header: 'Status', width: 90 },
  ]
  // Sample data rows
  const rows = [
    ['Smith, John', '03/15/1958', 'A1C Control', 'HEDIS', '01/15/2026', '02/10/2026', '✓ Closed'],
    ['Johnson, Mary', '07/22/1965', 'Mammogram', 'HEDIS', '01/20/2026', '', 'Scheduled 03/01'],
    ['Williams, Robert', '11/03/1952', 'Colonoscopy', 'HEDIS', '01/22/2026', '', 'Declined — retry Q2'],
    ['Brown, Patricia', '04/18/1960', 'BP Control', 'HEDIS', '02/01/2026', '02/15/2026', '✓ Closed'],
    ['Davis, Michael', '09/30/1970', 'Statin Adherence', 'Stars', '02/05/2026', '', 'In progress — 90-day fill'],
    ['Garcia, Linda', '12/08/1948', 'Fall Risk Screen', 'HEDIS', '02/10/2026', '', 'AWV scheduled 03/15'],
    ['Martinez, James', '06/14/1975', 'Depression Screen', 'HEDIS', '02/12/2026', '02/12/2026', '✓ Closed'],
    ['___________', '__ /__ /____', '____________', '______', '__ /__ /____', '__ /__ /____', '___________'],
    ['___________', '__ /__ /____', '____________', '______', '__ /__ /____', '__ /__ /____', '___________'],
    ['___________', '__ /__ /____', '____________', '______', '__ /__ /____', '__ /__ /____', '___________'],
  ]
  y = addTable(doc, cols, rows, y, { fontSize: 7 })

  y = checkPage(doc, y, 200)
  y = addSubtitle(doc, 'Summary Dashboard', y)
  const cols2: TableCol[] = [
    { header: 'Measure', width: 130 },
    { header: 'Total Gaps', width: 70 },
    { header: 'Closed', width: 70 },
    { header: 'In Progress', width: 70 },
    { header: 'Declined', width: 70 },
    { header: 'Closure Rate', width: 110 },
  ]
  y = addTable(doc, cols2, [
    ['A1C Control (<8.0%)', '245', '178', '42', '25', '72.7%'],
    ['Blood Pressure Control', '312', '241', '55', '16', '77.2%'],
    ['Breast Cancer Screening', '189', '152', '28', '9', '80.4%'],
    ['Colorectal Screening', '267', '183', '51', '33', '68.5%'],
    ['Statin Adherence (PDC≥80%)', '421', '298', '89', '34', '70.8%'],
    ['Depression Screening (PHQ-9)', '156', '134', '15', '7', '85.9%'],
    ['Fall Risk Screening (65+)', '198', '145', '38', '15', '73.2%'],
    ['Kidney Health Evaluation', '203', '124', '62', '17', '61.1%'],
  ], y)

  y = checkPage(doc, y, 100)
  y = addSubtitle(doc, 'Outreach Workflow', y)
  y = addBullet(doc, [
    'Week 1: Generate gap report from claims/EHR data; assign patients to care coordinators',
    'Week 2: First outreach attempt (phone + portal message); document in tracking sheet',
    'Week 3: Second outreach for non-responders; escalate to provider for in-person discussion',
    'Week 4: Update closure status; report metrics to quality committee; plan next month strategy',
    'Monthly: Review closure rates by measure; identify barriers; adjust outreach approach',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 11: CCM/TCM Billing Code Reference
// ============================================================
function gen11(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'CCM/TCM Billing Code Reference')
  y = addParagraph(doc, 'Chronic Care Management (CCM) and Transitional Care Management (TCM) represent significant revenue opportunities in value-based care. This reference details CPT codes, requirements, and reimbursement for each service.', y)

  y = addSubtitle(doc, 'Chronic Care Management (CCM) Codes', y)
  const cols: TableCol[] = [
    { header: 'CPT Code', width: 65 },
    { header: 'Description', width: 130 },
    { header: 'Time Requirement', width: 95 },
    { header: 'Billing Frequency', width: 70 },
    { header: 'Est. Reimbursement', width: 80 },
    { header: 'Key Requirements', width: 82 },
  ]
  y = addTable(doc, cols, [
    ['99490', 'CCM, initial 20 min/month', '20 min clinical staff time', 'Monthly', '$62–$64', 'Patient consent; 2+ chronic conditions; care plan'],
    ['99439', 'CCM, each additional 20 min', 'Additional 20 min blocks', 'Monthly (add-on)', '$47–$49', 'Same encounter; document additional time'],
    ['99491', 'CCM, physician/QHP 30 min', '30 min physician/QHP time', 'Monthly', '$86–$89', 'Physician personally provides service; higher complexity'],
    ['99487', 'Complex CCM, initial 60 min', '60 min clinical staff time', 'Monthly', '$133–$137', 'Substantial revision of care plan; medical decision making'],
    ['99489', 'Complex CCM, each add\'l 30 min', 'Additional 30 min blocks', 'Monthly (add-on)', '$72–$75', 'Add-on to 99487; document time and activities'],
  ], y, { fontSize: 7 })

  y = checkPage(doc, y, 200)
  y = addSubtitle(doc, 'Transitional Care Management (TCM) Codes', y)
  const cols2: TableCol[] = [
    { header: 'CPT Code', width: 65 },
    { header: 'Description', width: 150 },
    { header: 'Contact Window', width: 90 },
    { header: 'F2F Visit', width: 80 },
    { header: 'Est. Reimbursement', width: 80 },
    { header: 'MDM Level', width: 57 },
  ]
  y = addTable(doc, cols2, [
    ['99495', 'TCM, moderate complexity', 'Within 2 business days of discharge', 'Within 14 days', '$200–$210', 'Moderate'],
    ['99496', 'TCM, high complexity', 'Within 2 business days of discharge', 'Within 7 days', '$275–$285', 'High'],
  ], y, { fontSize: 7.5 })

  y = checkPage(doc, y, 160)
  y = addSubtitle(doc, 'CCM Documentation Requirements', y)
  y = addBullet(doc, [
    '☐ Patient written or verbal consent documented (required before first billing)',
    '☐ Comprehensive care plan established and in EHR (problem list, medications, goals)',
    '☐ 2+ chronic conditions expected to last ≥12 months (or until death)',
    '☐ Conditions place patient at significant risk of death, decompensation, or functional decline',
    '☐ Time log documenting all CCM activities with dates and durations',
    '☐ 24/7 access to care team for urgent needs',
    '☐ Care coordination with other providers documented',
    '☐ Monthly care plan review and update as needed',
  ], y)

  y = checkPage(doc, y, 120)
  y = addSubtitle(doc, 'TCM Documentation Requirements', y)
  y = addBullet(doc, [
    '☐ Interactive contact (phone/telehealth) within 2 business days of discharge',
    '☐ Face-to-face visit within 7 days (99496) or 14 days (99495)',
    '☐ Medication reconciliation within 30 days of discharge',
    '☐ Review of discharge summary and pending tests/referrals',
    '☐ Communication with discharging facility documented',
    '☐ Patient/caregiver education on warning signs and follow-up plan',
    '☐ Only 1 provider may bill TCM per patient per discharge episode',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 12: Comprehensive Care Plan Template
// ============================================================
function gen12(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Comprehensive Care Plan Template')
  y = addParagraph(doc, 'This care plan template supports CCM documentation requirements and facilitates coordinated, patient-centered chronic disease management. Complete all sections for each patient enrolled in care management.', y)

  y = addSubtitle(doc, 'Patient Information', y)
  const cols: TableCol[] = [
    { header: 'Field', width: 160 },
    { header: 'Value', width: 362 },
  ]
  y = addTable(doc, cols, [
    ['Patient Name', '_______________________________________________'],
    ['Date of Birth', '__ /__ /____   MRN: _________________________'],
    ['Primary Care Provider', '_______________________________________________'],
    ['Care Manager', '_______________________________________________'],
    ['Insurance / Plan', '_______________________________________________'],
    ['Emergency Contact', 'Name: _________________ Phone: _____________'],
    ['Pharmacy', '_______________________________________________'],
    ['Date Care Plan Initiated', '__ /__ /____   Last Updated: __ /__ /____'],
  ], y, { fontSize: 8 })

  y = checkPage(doc, y, 160)
  y = addSubtitle(doc, 'Active Problem List', y)
  const cols2: TableCol[] = [
    { header: '#', width: 25 },
    { header: 'Condition', width: 140 },
    { header: 'ICD-10', width: 65 },
    { header: 'Status', width: 80 },
    { header: 'Date Identified', width: 80 },
    { header: 'Managing Provider', width: 132 },
  ]
  y = addTable(doc, cols2, [
    ['1', '________________________', '________', '☐Active ☐Resolved', '__ /__ /____', '________________________'],
    ['2', '________________________', '________', '☐Active ☐Resolved', '__ /__ /____', '________________________'],
    ['3', '________________________', '________', '☐Active ☐Resolved', '__ /__ /____', '________________________'],
    ['4', '________________________', '________', '☐Active ☐Resolved', '__ /__ /____', '________________________'],
    ['5', '________________________', '________', '☐Active ☐Resolved', '__ /__ /____', '________________________'],
  ], y, { fontSize: 8 })

  y = checkPage(doc, y, 200)
  y = addSubtitle(doc, 'SMART Goals & Interventions', y)
  const cols3: TableCol[] = [
    { header: 'Goal (SMART Format)', width: 180 },
    { header: 'Interventions', width: 170 },
    { header: 'Responsible', width: 80 },
    { header: 'Target Date', width: 92 },
  ]
  y = addTable(doc, cols3, [
    ['Reduce A1C from 9.2% to <8.0% within 3 months', 'Medication adjustment; diabetes education; weekly glucose monitoring', 'PCP + CDE', '__ /__ /____'],
    ['Achieve BP <140/90 within 2 months', 'Home BP monitoring; med titration; low-sodium diet counseling', 'PCP + RN', '__ /__ /____'],
    ['Complete colorectal screening within 30 days', 'Schedule colonoscopy; patient navigator assist; transportation arrange', 'Care Mgr', '__ /__ /____'],
    ['___________________________________', '___________________________________', '________', '__ /__ /____'],
    ['___________________________________', '___________________________________', '________', '__ /__ /____'],
  ], y, { fontSize: 7.5 })

  y = checkPage(doc, y, 120)
  y = addSubtitle(doc, 'Follow-Up Schedule', y)
  const cols4: TableCol[] = [
    { header: 'Visit Type', width: 120 },
    { header: 'Frequency', width: 100 },
    { header: 'Next Scheduled', width: 100 },
    { header: 'Notes', width: 202 },
  ]
  y = addTable(doc, cols4, [
    ['PCP Office Visit', '☐Monthly ☐Quarterly', '__ /__ /____', ''],
    ['Care Manager Call', '☐Weekly ☐Biweekly ☐Monthly', '__ /__ /____', ''],
    ['Specialist Visit', '________ frequency', '__ /__ /____', 'Specialist: ____________'],
    ['Lab Work', '________ frequency', '__ /__ /____', 'Tests: ________________'],
    ['Pharmacy Review', '☐Monthly ☐Quarterly', '__ /__ /____', ''],
  ], y, { fontSize: 8 })

  y = checkPage(doc, y, 80)
  y = addSubtitle(doc, 'Patient Agreement', y)
  y = addParagraph(doc, 'I understand that my care team will contact me regularly to help manage my health conditions. I agree to participate in care management services, including phone calls, telehealth visits, and care plan activities. I understand I may revoke consent at any time.', y)
  y = addParagraph(doc, 'Patient Signature: ________________________  Date: __ /__ /____', y + 10)
  y = addParagraph(doc, 'Provider Signature: ________________________  Date: __ /__ /____', y + 4)

  return finalize(doc)
}

// ============================================================
// Resource 13: SDOH Screening Tool
// ============================================================
function gen13(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Social Determinants of Health (SDOH) Screening Tool')
  y = addParagraph(doc, 'Based on validated instruments including the PRAPARE tool and AHC HRSN screening. Administer annually or at care transitions. Document responses with Z-codes in the EHR for risk adjustment and referral tracking.', y)

  const sections = [
    { title: 'Food Insecurity', questions: [
      '1. Within the past 12 months, did you worry that your food would run out before you got money to buy more?  ☐ Often  ☐ Sometimes  ☐ Never',
      '2. Within the past 12 months, did the food you bought not last and you didn\'t have money to get more?  ☐ Often  ☐ Sometimes  ☐ Never',
    ], zcode: 'Z59.41 — Food insecurity', scoring: 'Positive screen: "Often" or "Sometimes" to either question' },
    { title: 'Housing Instability', questions: [
      '3. What is your current housing situation?  ☐ Own/Rent stable  ☐ Living with others  ☐ Shelter  ☐ Homeless  ☐ Other',
      '4. In the past 12 months, have you been worried about losing your housing?  ☐ Yes  ☐ No',
      '5. In the past 12 months, how many times have you moved?  ☐ 0  ☐ 1-2  ☐ 3+',
    ], zcode: 'Z59.00-Z59.19 — Homelessness / Housing instability', scoring: 'Positive: Shelter/Homeless OR "Yes" to Q4 OR 3+ moves' },
    { title: 'Transportation', questions: [
      '6. In the past 12 months, has lack of reliable transportation kept you from medical appointments or getting medications?  ☐ Yes  ☐ No',
    ], zcode: 'Z59.82 — Transportation insecurity', scoring: 'Positive: "Yes" to Q6' },
    { title: 'Financial Strain', questions: [
      '7. How hard is it for you to pay for the very basics like food, housing, heating, and medical care?  ☐ Not hard  ☐ Somewhat hard  ☐ Very hard',
      '8. In the past year, have you or your family had to go without medical care because of cost?  ☐ Yes  ☐ No',
    ], zcode: 'Z59.86 — Financial insecurity', scoring: 'Positive: "Somewhat hard" or "Very hard" OR "Yes" to Q8' },
    { title: 'Social Isolation', questions: [
      '9. How often do you feel lonely or isolated from those around you?  ☐ Never  ☐ Rarely  ☐ Sometimes  ☐ Often  ☐ Always',
      '10. Do you have someone you can count on for emotional support?  ☐ Yes  ☐ No',
    ], zcode: 'Z60.2 — Problems related to living alone; Z63.9 — Support group issues', scoring: 'Positive: "Often" or "Always" to Q9 OR "No" to Q10' },
    { title: 'Personal Safety', questions: [
      '11. Do you feel physically or emotionally unsafe where you currently live?  ☐ Yes  ☐ No',
      '12. In the past year, have you been afraid of your partner or ex-partner?  ☐ Yes  ☐ No  ☐ N/A',
    ], zcode: 'Z63.0 — Partner relationship problems; T74/T76 series', scoring: 'Positive: "Yes" to either Q11 or Q12. Activate safety protocol.' },
  ]

  for (const s of sections) {
    y = checkPage(doc, y, 100)
    y = addSubtitle(doc, s.title, y)
    for (const q of s.questions) {
      y = addParagraph(doc, q, y)
    }
    y = addParagraph(doc, `ICD-10/Z-Code: ${s.zcode}`, y, { bold: true, fontSize: 8 })
    y = addParagraph(doc, `Scoring: ${s.scoring}`, y, { fontSize: 8 })
    y += 4
  }

  y = checkPage(doc, y, 100)
  y = addSubtitle(doc, 'Referral Resources', y)
  y = addBullet(doc, [
    'Food: Local food banks, SNAP application assistance, Meals on Wheels',
    'Housing: 211 hotline, HUD housing counseling, emergency shelter directory',
    'Transportation: Medicaid NEMT, ride-share health programs, volunteer driver networks',
    'Financial: Patient assistance programs, charity care applications, benefits enrollment',
    'Social: Senior centers, support groups, community health workers, Area Agency on Aging',
    'Safety: National DV Hotline (1-800-799-7233), local crisis intervention, safe housing referral',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 14: Patient Outreach Script Templates
// ============================================================
function gen14(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Patient Outreach Script Templates')
  y = addParagraph(doc, 'Use these scripts for common patient outreach scenarios. Personalize each call using the patient\'s name and specific care gap details. Document all outreach attempts in the EHR.', y)

  const scripts = [
    { title: 'Annual Wellness Visit (AWV) Scheduling', script: `"Hello, this is [Name] calling from [Practice Name] on behalf of Dr. [Provider]. May I speak with [Patient Name]?

I'm calling because you are eligible for your Annual Wellness Visit, which is a comprehensive preventive health checkup covered 100% by Medicare with no copay.

During this visit, Dr. [Provider] will review your medications, update your health screenings, discuss your health goals, and create a personalized prevention plan.

We have availability on [Date/Time options]. Would any of these work for you?

If you need transportation assistance, we can help arrange that as well. Is there anything else I can help you with today?"

Document: Date, time, outcome (scheduled/declined/voicemail/no answer). If declined, note reason.` },
    { title: 'Care Gap Closure — Mammogram', script: `"Hello, this is [Name] from [Practice Name]. I'm reaching out because our records show it's time for your routine breast cancer screening mammogram.

Regular mammograms are one of the most effective ways to detect breast cancer early, when treatment is most successful. This screening is covered by your insurance at no cost to you.

We partner with [Imaging Center] and can schedule your mammogram today. They have appointments available [Date/Time options].

Would you like me to schedule that for you? If you've already had a mammogram done elsewhere, please let us know so we can update your records."

Document: Date, outcome, if completed elsewhere obtain facility name for records retrieval.` },
    { title: 'Medication Adherence Follow-Up', script: `"Hello, this is [Name] from [Practice Name]. I'm calling to check in about your [Medication Name] for [Condition].

Our pharmacy records show your prescription may need a refill. Taking your medication consistently is really important for managing your [condition] and preventing complications.

Are you having any issues with your medication? Common concerns include:
- Side effects — we can discuss alternatives with your doctor
- Cost — we can look into patient assistance programs or generic options  
- Remembering to take it — we can discuss pill organizers or reminders

Would you like me to help arrange a refill? I can also set you up with 90-day supplies to reduce trips to the pharmacy."

Document: Adherence barriers identified, actions taken, refill status.` },
    { title: 'Post-Discharge Follow-Up (TCM)', script: `"Hello, this is [Name] from Dr. [Provider]'s office. I'm calling to check on you following your recent hospital stay on [Discharge Date].

How are you feeling since you came home? I'd like to go over a few things:

1. Do you have all your discharge medications? Have you been able to fill them?
2. Do you understand what each medication is for and when to take it?
3. Have you had any new or worsening symptoms since discharge?
4. Do you have any questions about your discharge instructions?

We need to schedule a follow-up visit with Dr. [Provider] within [7/14] days. Our next available appointment is [Date/Time]. Does that work for you?

If you experience [specific warning signs for their condition], please call us immediately or go to the emergency room."

Document: Symptoms, medication issues, appointment scheduled, red flags discussed.` },
  ]

  for (const s of scripts) {
    y = checkPage(doc, y, 200)
    y = addSubtitle(doc, s.title, y)
    y = addParagraph(doc, s.script, y, { fontSize: 8 })
    y += 6
  }

  return finalize(doc)
}

// ============================================================
// Resource 15: Health IT Vendor Evaluation Checklist
// ============================================================
function gen15(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Health IT Vendor Evaluation Checklist')
  y = addParagraph(doc, 'Use this checklist when evaluating health IT solutions for value-based care. Score each criterion 1-5 (1=Poor, 5=Excellent) and compare total scores across vendors.', y)

  const cols: TableCol[] = [
    { header: 'Category', width: 100 },
    { header: 'Criterion', width: 200 },
    { header: 'Vendor A', width: 55 },
    { header: 'Vendor B', width: 55 },
    { header: 'Vendor C', width: 55 },
    { header: 'Weight', width: 55 },
  ]
  const rows = [
    ['Interoperability', 'FHIR R4 API support', '__ /5', '__ /5', '__ /5', 'High'],
    ['Interoperability', 'HL7 v2 / CDA document exchange', '__ /5', '__ /5', '__ /5', 'High'],
    ['Interoperability', 'ADT feed processing', '__ /5', '__ /5', '__ /5', 'Medium'],
    ['Analytics', 'Risk stratification / predictive modeling', '__ /5', '__ /5', '__ /5', 'High'],
    ['Analytics', 'Quality measure dashboards (HEDIS/Stars)', '__ /5', '__ /5', '__ /5', 'High'],
    ['Analytics', 'Cost/utilization reporting', '__ /5', '__ /5', '__ /5', 'High'],
    ['Analytics', 'Population health segmentation', '__ /5', '__ /5', '__ /5', 'Medium'],
    ['CDS', 'Care gap alerts at point of care', '__ /5', '__ /5', '__ /5', 'High'],
    ['CDS', 'HCC coding suggestions', '__ /5', '__ /5', '__ /5', 'Medium'],
    ['CDS', 'Drug interaction / formulary checks', '__ /5', '__ /5', '__ /5', 'Medium'],
    ['Patient Engagement', 'Patient portal / app', '__ /5', '__ /5', '__ /5', 'Medium'],
    ['Patient Engagement', 'Secure messaging / telehealth', '__ /5', '__ /5', '__ /5', 'Medium'],
    ['Patient Engagement', 'Appointment reminders / outreach', '__ /5', '__ /5', '__ /5', 'Medium'],
    ['Reporting', 'CMS/MIPS reporting capability', '__ /5', '__ /5', '__ /5', 'High'],
    ['Reporting', 'Payer-specific report generation', '__ /5', '__ /5', '__ /5', 'Medium'],
    ['Operations', 'Implementation timeline', '__ /5', '__ /5', '__ /5', 'Medium'],
    ['Operations', 'Training and support', '__ /5', '__ /5', '__ /5', 'Medium'],
    ['Operations', 'Pricing transparency / TCO', '__ /5', '__ /5', '__ /5', 'High'],
    ['Operations', 'Customer references / case studies', '__ /5', '__ /5', '__ /5', 'Low'],
    ['Security', 'HIPAA compliance / SOC 2 certification', '__ /5', '__ /5', '__ /5', 'High'],
    ['', 'TOTAL SCORE', '__ /100', '__ /100', '__ /100', ''],
  ]
  y = addTable(doc, cols, rows, y, { fontSize: 7 })

  return finalize(doc)
}

// ============================================================
// Resource 16: Data Governance Policy Template
// ============================================================
function gen16(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Data Governance Policy Template')
  y = addParagraph(doc, 'This template provides a framework for establishing a comprehensive data governance policy for healthcare organizations participating in value-based care arrangements. Customize sections to fit your organizational structure.', y)

  const sections = [
    { title: '1. Purpose & Scope', content: 'This policy establishes standards for the management, quality, security, and use of data across [Organization Name]. It applies to all employees, contractors, and business associates who create, access, store, or transmit organizational data, including protected health information (PHI), claims data, quality metrics, and financial data used in value-based care arrangements.' },
    { title: '2. Data Stewardship Roles', bullets: [
      'Chief Data Officer (CDO): Overall accountability for data governance program; reports to C-suite',
      'Data Stewards (by domain): Clinical data steward, claims/financial data steward, quality metrics steward',
      'Data Custodians: IT staff responsible for technical implementation of data policies',
      'Data Users: All staff who access data; responsible for following policies and reporting issues',
      'Data Governance Committee: Cross-functional body that meets monthly to review policies and issues',
    ]},
    { title: '3. Data Quality Standards', bullets: [
      'Accuracy: Data must reflect the true state of the entity it represents; validated at entry and periodically',
      'Completeness: All required fields populated; null/missing value threshold <2% for critical fields',
      'Timeliness: Claims data refreshed within 30 days; quality data updated monthly; financial data weekly',
      'Consistency: Standardized coding (ICD-10, CPT, LOINC); master data management for provider/member data',
      'Validity: Business rules enforced at point of entry; range checks, format validation, referential integrity',
    ]},
    { title: '4. Access Controls', bullets: [
      'Role-based access control (RBAC) for all systems containing PHI or sensitive data',
      'Minimum necessary standard: Users access only data required for their job function',
      'Multi-factor authentication required for remote access and privileged accounts',
      'Access reviews conducted quarterly; terminated user access revoked within 24 hours',
      'Audit logging enabled for all PHI access; logs retained for 6 years minimum',
    ]},
    { title: '5. PHI Handling & HIPAA Compliance', bullets: [
      'PHI encrypted at rest (AES-256) and in transit (TLS 1.2+)',
      'De-identification follows HIPAA Safe Harbor or Expert Determination methods',
      'Business Associate Agreements (BAAs) required for all vendors handling PHI',
      'Minimum necessary PHI shared with payers for VBC reporting; use de-identified data when possible',
      'Annual HIPAA training required for all workforce members with PHI access',
    ]},
    { title: '6. Breach Protocols', bullets: [
      'Suspected breach reported to Privacy Officer within 24 hours of discovery',
      'Investigation initiated within 48 hours; forensic analysis if warranted',
      'Risk assessment conducted per HIPAA Breach Notification Rule (45 CFR 164.402)',
      'Individual notification within 60 days of discovery if breach confirmed (>500: media + HHS)',
      'Post-incident review and corrective action plan within 30 days of resolution',
    ]},
    { title: '7. Data Retention & Disposal', bullets: [
      'Medical records: Minimum 7 years (or per state law, whichever is longer)',
      'Claims/billing data: 10 years for Medicare/Medicaid; 7 years for commercial',
      'Quality reporting data: 6 years from reporting date',
      'Secure disposal: NIST 800-88 compliant media sanitization; certificate of destruction',
    ]},
  ]

  for (const s of sections) {
    y = checkPage(doc, y, 120)
    y = addSubtitle(doc, s.title, y)
    if (s.content) y = addParagraph(doc, s.content, y)
    if (s.bullets) y = addBullet(doc, s.bullets, y)
  }

  return finalize(doc)
}

// ============================================================
// Resource 17: Telehealth Workflow Setup Guide
// ============================================================
function gen17(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Telehealth Workflow Setup Guide')
  y = addParagraph(doc, 'This guide provides a complete framework for implementing telehealth services in a value-based care practice, including technology requirements, clinical workflows, billing, and quality assurance.', y)

  y = addSubtitle(doc, 'Technology Requirements', y)
  y = addBullet(doc, [
    'HIPAA-compliant video platform (Zoom for Healthcare, Doxy.me, Amwell, etc.)',
    'EHR integration for scheduling, documentation, and e-prescribing',
    'Patient-facing portal or app for appointment access and consent',
    'Reliable internet: minimum 10 Mbps download/upload for provider; recommend wired connection',
    'Backup phone line for technical difficulties during visits',
    'Peripheral devices as needed: digital stethoscope, otoscope, BP cuff for RPM integration',
  ], y)

  y = checkPage(doc, y, 200)
  y = addSubtitle(doc, 'Telehealth Billing Codes', y)
  const cols: TableCol[] = [
    { header: 'CPT Code', width: 65 },
    { header: 'Service Type', width: 130 },
    { header: 'Requirements', width: 160 },
    { header: 'Modifier', width: 50 },
    { header: 'Est. Reimb.', width: 60 },
    { header: 'Notes', width: 57 },
  ]
  y = addTable(doc, cols, [
    ['99441', 'Phone E/M, 5-10 min', 'Medical discussion by phone', 'None', '$46-$48', 'Audio only'],
    ['99442', 'Phone E/M, 11-20 min', 'Medical discussion by phone', 'None', '$92-$95', 'Audio only'],
    ['99443', 'Phone E/M, 21-30 min', 'Medical discussion by phone', 'None', '$132-$136', 'Audio only'],
    ['99421', 'Online digital E/M, 5-10 min', 'Patient portal/secure message', 'None', '$33-$35', 'Cumulative 7 days'],
    ['99422', 'Online digital E/M, 11-20 min', 'Patient portal/secure message', 'None', '$65-$68', 'Cumulative 7 days'],
    ['99423', 'Online digital E/M, 21+ min', 'Patient portal/secure message', 'None', '$98-$102', 'Cumulative 7 days'],
    ['99201-99215', 'Standard E/M via telehealth', 'Real-time audio/video', '95 or GT', 'Same as in-person', 'Place of service 02/10'],
  ], y, { fontSize: 7 })

  y = checkPage(doc, y, 140)
  y = addSubtitle(doc, 'Patient Eligibility & Scheduling', y)
  y = addBullet(doc, [
    'Appropriate for telehealth: Chronic disease follow-up, medication management, mental health, care coordination, post-discharge check-in, SDOH screening',
    'Not appropriate: Requires physical exam (acute abdomen, chest pain), procedures, new patient with complex presentation',
    'Schedule telehealth visits in same EHR scheduler; include video link in appointment confirmation',
    'Send patient instructions 24-48 hours prior: test connection, find quiet space, have medication list ready',
    'Collect telehealth-specific consent at first virtual visit (verbal consent acceptable; document in chart)',
  ], y)

  y = checkPage(doc, y, 120)
  y = addSubtitle(doc, 'Quality Assurance Checklist', y)
  y = addBullet(doc, [
    '☐ Monthly review of telehealth visit volume and conversion rates',
    '☐ Patient satisfaction survey after telehealth visits (target >4.0/5.0)',
    '☐ Provider documentation audit: ensure telehealth-specific elements captured',
    '☐ Technical issue tracking: connection failures, patient no-shows, platform errors',
    '☐ Billing accuracy review: correct modifiers, place of service, time documentation',
    '☐ Quarterly comparison: telehealth vs in-person outcomes for chronic disease measures',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 18: PMPM Calculator Guide
// ============================================================
function gen18(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'PMPM Calculator Guide')
  y = addParagraph(doc, 'Per Member Per Month (PMPM) is the fundamental financial metric in value-based care. This guide walks through PMPM calculation methodology, cost categories, and benchmarking.', y)

  y = addSubtitle(doc, 'Basic PMPM Formula', y)
  y = addParagraph(doc, 'PMPM = Total Cost of Care ÷ Total Member Months', y, { bold: true, fontSize: 12 })
  y = addParagraph(doc, 'Example: $24,000,000 total cost ÷ 60,000 member months = $400 PMPM', y)

  y = addSubtitle(doc, 'Cost Category Breakdown', y)
  const cols: TableCol[] = [
    { header: 'Category', width: 130 },
    { header: 'Typical % of PMPM', width: 80 },
    { header: 'Components', width: 180 },
    { header: 'Benchmarks', width: 132 },
  ]
  y = addTable(doc, cols, [
    ['Inpatient', '25-35%', 'Acute admissions, surgical, maternity, behavioral health IP', 'Target: <200 admits/1000; ALOS <4.5 days'],
    ['Outpatient', '20-28%', 'ER visits, ambulatory surgery, imaging, labs, therapy', 'Target: <350 ER visits/1000; avoid avoidable ER'],
    ['Professional', '18-22%', 'Physician E/M, specialist consults, procedures', 'PCP utilization ≥4 visits/year for chronic'],
    ['Pharmacy', '18-25%', 'Brand, generic, specialty drugs, infusion', 'Generic dispensing rate >90%; formulary compliance'],
    ['Behavioral Health', '5-10%', 'MH/SUD outpatient, inpatient, PHP/IOP', 'Screening rates; follow-up after MH visit'],
    ['Other/Admin', '3-8%', 'DME, home health, SNF, care management', 'SNF days/1000 <200; home health utilization'],
  ], y)

  y = checkPage(doc, y, 180)
  y = addSubtitle(doc, 'PMPM by Population Type (Illustrative Benchmarks)', y)
  const cols2: TableCol[] = [
    { header: 'Population', width: 150 },
    { header: 'Average PMPM', width: 100 },
    { header: 'Target PMPM (25th %ile)', width: 120 },
    { header: 'Key Cost Drivers', width: 152 },
  ]
  y = addTable(doc, cols2, [
    ['Commercial (under 65)', '$350-$500', '$300-$380', 'ER utilization, specialty drugs, maternity'],
    ['Medicare Advantage', '$800-$1,200', '$700-$950', 'Inpatient admits, post-acute, pharmacy'],
    ['Medicaid (adult)', '$250-$450', '$220-$350', 'BH/SUD, ER utilization, maternity'],
    ['Dual Eligible', '$1,500-$2,500', '$1,200-$2,000', 'LTC/SNF, complex chronic, pharmacy'],
    ['High-Risk Chronic', '$1,800-$3,500', '$1,400-$2,800', 'Inpatient readmissions, specialty pharmacy'],
  ], y)

  y = checkPage(doc, y, 140)
  y = addSubtitle(doc, 'Trend Factor Adjustments', y)
  y = addParagraph(doc, 'When projecting future PMPM costs, apply trend factors to account for medical inflation, utilization changes, and mix shifts:', y)
  y = addBullet(doc, [
    'Medical trend (unit cost inflation): +3-5% annually for commercial; +2-4% for Medicare',
    'Utilization trend: +1-3% (varies by category; outpatient growing faster than inpatient)',
    'Pharmacy trend: +5-10% (driven by specialty drug pipeline and biosimilar adoption)',
    'Mix/severity adjustment: Account for population aging and acuity changes',
    'Program impact: Subtract expected savings from care management programs (-2-5%)',
    'Formula: Projected PMPM = Current PMPM × (1 + Medical Trend) × (1 + Utilization Trend) × (1 + Pharmacy Trend) × (1 - Program Savings)',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 19: Shared Savings Contract Term Sheet Template
// ============================================================
function gen19(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Shared Savings Contract Term Sheet Template')
  y = addParagraph(doc, 'Use this template as a starting point for negotiating shared savings arrangements with payers. All terms should be reviewed by legal counsel before execution.', y)

  const cols: TableCol[] = [
    { header: 'Term', width: 130 },
    { header: 'Description', width: 200 },
    { header: 'Sample Language / Notes', width: 192 },
  ]
  y = addTable(doc, cols, [
    ['Parties', 'Provider entity and payer/health plan', '[Provider Group Name] and [Health Plan Name]'],
    ['Effective Date & Term', 'Contract duration and renewal', '3-year initial term with 1-year auto-renewal; 180-day termination notice'],
    ['Covered Population', 'Attributed member definition', 'Members attributed via plurality-of-care methodology; minimum 5,000 lives'],
    ['Benchmark Methodology', 'How the cost target is set', 'Historical PMPM trended forward; risk-adjusted using CMS-HCC; regional benchmark blend'],
    ['Minimum Savings Rate (MSR)', 'Threshold before sharing begins', '2.0% MSR — savings below this threshold not shared; reduces variance risk'],
    ['Sharing Percentage (Upside)', 'Provider share of savings', '50% of net savings above MSR in Year 1; escalates to 60% in Year 2, 70% in Year 3'],
    ['Downside Risk', 'Provider share of losses', 'Year 1: Upside only. Year 2+: 25% downside, capped at 5% of benchmark'],
    ['Quality Gates', 'Quality thresholds to earn savings', 'Must achieve ≥3 stars on composite quality score (HEDIS/Stars); gates reduce sharing if missed'],
    ['Quality Measures', 'Specific measures tracked', 'A1C <8%, BP control, colorectal screening, medication adherence, ED visit rate, readmission rate'],
    ['Settlement Period', 'When reconciliation occurs', 'Annual reconciliation; preliminary at 6 months; final at 12 months post-performance year'],
    ['Data Sharing', 'What data payer provides', 'Monthly claims feed, member roster, pharmacy data, lab results; minimum 30-day lag'],
    ['Attribution Methodology', 'How members are assigned', 'Prospective attribution based on primary care plurality; updated quarterly; dispute process defined'],
    ['Risk Adjustment', 'How population acuity is accounted for', 'CMS-HCC V28 risk scores; truncation at 95th percentile; new member risk score methodology'],
    ['Termination Clauses', 'Conditions for early exit', 'Material breach (90-day cure period); regulatory change; insolvency; mutual agreement'],
    ['Dispute Resolution', 'Process for disagreements', 'Joint operating committee review → mediation → binding arbitration; governing law: [State]'],
  ], y, { fontSize: 7 })

  y = checkPage(doc, y, 100)
  y = addSubtitle(doc, 'Negotiation Tips', y)
  y = addBullet(doc, [
    'Always negotiate for prospective attribution with quarterly updates (avoid retrospective surprises)',
    'Insist on MSR — protects against statistical noise in small populations',
    'Request at least monthly claims data with <45-day lag for actionable insights',
    'Start upside-only in Year 1 to build infrastructure before accepting downside risk',
    'Include a "corridor" approach for downside: losses shared only between MSR and cap',
    'Quality gates should be achievable — negotiate for improvement-based gates, not absolute thresholds',
    'Ensure risk adjustment methodology accounts for coding intensity changes during transition',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 20: Payer Negotiation Preparation Checklist
// ============================================================
function gen20(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Payer Negotiation Preparation Checklist')
  y = addParagraph(doc, 'Thorough preparation is the single biggest factor in successful payer negotiations. Use this checklist to ensure you enter negotiations with complete data and a clear strategy.', y)

  y = addSubtitle(doc, 'Pre-Negotiation Data Gathering', y)
  y = addBullet(doc, [
    '☐ Current contract terms: rates, quality incentives, attribution method, term dates',
    '☐ Claims analysis: PMPM trend (3 years), service category breakdown, top cost drivers',
    '☐ Quality performance: HEDIS/Stars scores, MIPS scores, clinical outcomes data',
    '☐ Utilization metrics: Admits/1000, ER visits/1000, readmission rate, specialist referral rate',
    '☐ Patient satisfaction: CAHPS scores, patient experience survey results, complaint rates',
    '☐ Market data: Competitor rates, regional benchmarks, plan market share in your area',
    '☐ Financial modeling: Break-even analysis under proposed terms; scenario planning (best/worst/likely)',
  ], y)

  y = checkPage(doc, y, 160)
  y = addSubtitle(doc, 'SWOT Analysis', y)
  const cols: TableCol[] = [
    { header: 'Strengths', width: 260 },
    { header: 'Weaknesses', width: 262 },
  ]
  y = addTable(doc, cols, [
    ['☐ Quality scores above market average', '☐ Gaps in quality performance'],
    ['☐ Low readmission / ER rates', '☐ High cost in specific service categories'],
    ['☐ Patient satisfaction ratings', '☐ Limited data analytics capability'],
    ['☐ Market position / geographic coverage', '☐ Small attributed population size'],
    ['☐ Established care management programs', '☐ Provider turnover / capacity constraints'],
  ], y, { fontSize: 8 })

  const cols2: TableCol[] = [
    { header: 'Opportunities', width: 260 },
    { header: 'Threats', width: 262 },
  ]
  y = addTable(doc, cols2, [
    ['☐ Expand VBC population / new lines of business', '☐ Competitor entering market with lower rates'],
    ['☐ Add new service lines (BH, telehealth, RPM)', '☐ Payer consolidation reducing leverage'],
    ['☐ Performance improvement trajectory', '☐ Regulatory changes affecting reimbursement'],
    ['☐ Technology investments coming online', '☐ Rising medical costs outpacing benchmarks'],
  ], y, { fontSize: 8 })

  y = checkPage(doc, y, 160)
  y = addSubtitle(doc, 'Negotiation Strategy', y)
  const cols3: TableCol[] = [
    { header: 'Priority', width: 50 },
    { header: 'Objective', width: 180 },
    { header: 'Target', width: 140 },
    { header: 'Walk-Away', width: 152 },
  ]
  y = addTable(doc, cols3, [
    ['1', 'Shared savings percentage', '60% provider share', '<40% provider share'],
    ['2', 'Data sharing frequency & lag', 'Monthly, <30 days', '>90-day lag'],
    ['3', 'Attribution methodology', 'Prospective, quarterly update', 'Retrospective only'],
    ['4', 'Quality gate thresholds', 'Improvement-based', 'Unachievable absolute targets'],
    ['5', 'Downside risk cap', '≤5% of benchmark', '>10% of benchmark'],
    ['6', '___________________', '___________________', '___________________'],
  ], y, { fontSize: 8 })

  y = checkPage(doc, y, 100)
  y = addSubtitle(doc, 'Counter-Offer Strategies', y)
  y = addBullet(doc, [
    'If payer offers low sharing %: Present your quality/cost data showing value delivered; propose escalating percentages tied to performance',
    'If payer wants immediate downside risk: Counter with upside-only Year 1 "runway period" to build infrastructure',
    'If payer offers retrospective attribution: Propose prospective with quarterly true-up as compromise',
    'If data sharing is limited: Tie data sharing to shared savings — "we need data to generate savings for both of us"',
    'Always have a BATNA (Best Alternative to Negotiated Agreement): know your walk-away position before entering the room',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 21: Total Cost of Care Benchmarking Worksheet
// ============================================================
function gen21(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Total Cost of Care Benchmarking Worksheet')
  y = addParagraph(doc, 'Total Cost of Care (TCOC) analysis is essential for understanding financial performance in value-based arrangements. This worksheet provides a structured approach to calculating, benchmarking, and improving TCOC.', y)

  y = addSubtitle(doc, 'TCOC Calculation Methodology', y)
  y = addParagraph(doc, 'TCOC captures all medical and pharmacy expenditures for an attributed population over a defined period, expressed as PMPM. Include: professional, facility (IP/OP), pharmacy, ancillary, behavioral health, and post-acute costs.', y)

  const cols: TableCol[] = [
    { header: 'Service Category', width: 120 },
    { header: 'Your PMPM', width: 70 },
    { header: 'CMS Benchmark', width: 80 },
    { header: 'Commercial Benchmark', width: 80 },
    { header: 'Variance', width: 60 },
    { header: 'Opportunity', width: 112 },
  ]
  y = addTable(doc, cols, [
    ['Inpatient Acute', '$_____', '$285', '$165', '$_____', ''],
    ['Inpatient BH/SUD', '$_____', '$42', '$28', '$_____', ''],
    ['Outpatient / ER', '$_____', '$195', '$125', '$_____', ''],
    ['Professional', '$_____', '$175', '$110', '$_____', ''],
    ['Pharmacy (non-spec)', '$_____', '$145', '$95', '$_____', ''],
    ['Specialty Pharmacy', '$_____', '$85', '$65', '$_____', ''],
    ['Post-Acute (SNF/HH)', '$_____', '$120', '$45', '$_____', ''],
    ['Ancillary (DME/Lab)', '$_____', '$55', '$35', '$_____', ''],
    ['TOTAL TCOC PMPM', '$_____', '$1,102', '$668', '$_____', ''],
  ], y)

  y = checkPage(doc, y, 180)
  y = addSubtitle(doc, 'Trend Analysis (Year-over-Year)', y)
  const cols2: TableCol[] = [
    { header: 'Metric', width: 150 },
    { header: 'Year 1', width: 80 },
    { header: 'Year 2', width: 80 },
    { header: 'Year 3', width: 80 },
    { header: 'YOY Trend', width: 132 },
  ]
  y = addTable(doc, cols2, [
    ['Total PMPM', '$_____', '$_____', '$_____', '_____%'],
    ['IP Admits / 1,000', '_____', '_____', '_____', '_____%'],
    ['ER Visits / 1,000', '_____', '_____', '_____', '_____%'],
    ['Readmission Rate (%)', '_____%', '_____%', '_____%', '_____%'],
    ['Avg Length of Stay (days)', '_____', '_____', '_____', '_____%'],
    ['Pharmacy PMPM', '$_____', '$_____', '$_____', '_____%'],
    ['Generic Dispensing Rate', '_____%', '_____%', '_____%', '_____%'],
    ['SNF Days / 1,000', '_____', '_____', '_____', '_____%'],
  ], y)

  y = checkPage(doc, y, 140)
  y = addSubtitle(doc, 'Improvement Opportunity Identification', y)
  y = addBullet(doc, [
    'Inpatient: Reduce avoidable admissions (ambulatory-sensitive conditions); improve discharge planning; TCM programs',
    'ER: Redirect non-emergent visits to urgent care/telehealth; nurse triage line; after-hours access',
    'Pharmacy: Formulary optimization; biosimilar adoption; 90-day fills for chronic meds; MTM programs',
    'Post-Acute: SNF network optimization; home health as SNF alternative; transitional care programs',
    'Specialist: Referral management; eConsults to avoid unnecessary specialist visits; Centers of Excellence',
    'High-Cost Claimants: Identify top 5% of cost; intensive care management; palliative care for advanced illness',
  ], y)

  return finalize(doc)
}

// ============================================================
// Resource 22: Complete VBC Implementation Toolkit (Bonus)
// ============================================================
function gen22(): Buffer {
  const doc = createDoc()
  addHeader(doc)
  let y = addTitle(doc, 'Complete VBC Implementation Toolkit')
  y = addParagraph(doc, 'This comprehensive toolkit synthesizes key takeaways from all course modules into an actionable implementation plan for your organization\'s value-based care transformation.', y)

  y = addSubtitle(doc, 'Executive Summary', y)
  y = addParagraph(doc, 'Transitioning to value-based care requires coordinated transformation across six domains: payment model strategy, clinical documentation and coding, quality measurement, care management, health IT infrastructure, and financial modeling. Success depends on leadership commitment, data-driven decision making, and sustained investment in people, processes, and technology.', y)

  y = addSubtitle(doc, '90-Day Action Plan', y)
  const cols: TableCol[] = [
    { header: 'Phase', width: 65 },
    { header: 'Timeline', width: 60 },
    { header: 'Key Actions', width: 220 },
    { header: 'Owner', width: 80 },
    { header: 'Status', width: 97 },
  ]
  y = addTable(doc, cols, [
    ['Phase 1', 'Days 1-30', 'Assess current state: payer contracts, quality scores, coding accuracy, IT capabilities', 'CMO / COO', '☐ Not started'],
    ['Phase 1', 'Days 1-30', 'Identify VBC-ready payer contracts and potential APM participation', 'CFO / Contracting', '☐ Not started'],
    ['Phase 1', 'Days 1-30', 'Baseline PMPM and TCOC analysis for attributed populations', 'Analytics', '☐ Not started'],
    ['Phase 2', 'Days 31-60', 'Launch HCC coding improvement program and provider education', 'Coding Director', '☐ Not started'],
    ['Phase 2', 'Days 31-60', 'Implement quality gap closure campaigns for top 5 HEDIS measures', 'Quality Director', '☐ Not started'],
    ['Phase 2', 'Days 31-60', 'Deploy care management program for high-risk patients (top 5%)', 'Care Mgmt Dir', '☐ Not started'],
    ['Phase 3', 'Days 61-90', 'Launch SDOH screening and community referral program', 'Population Health', '☐ Not started'],
    ['Phase 3', 'Days 61-90', 'Implement telehealth for chronic disease follow-up visits', 'IT / Operations', '☐ Not started'],
    ['Phase 3', 'Days 61-90', 'Prepare payer negotiation package with quality and cost data', 'Contracting', '☐ Not started'],
    ['Phase 3', 'Days 61-90', 'Present 12-month VBC roadmap to leadership for approval and funding', 'CMO / CEO', '☐ Not started'],
  ], y, { fontSize: 7 })

  y = checkPage(doc, y, 200)
  y = addSubtitle(doc, 'Key Metrics Dashboard', y)
  const cols2: TableCol[] = [
    { header: 'Domain', width: 100 },
    { header: 'Metric', width: 160 },
    { header: 'Current', width: 70 },
    { header: 'Target', width: 70 },
    { header: 'Status', width: 122 },
  ]
  y = addTable(doc, cols2, [
    ['Financial', 'PMPM vs Benchmark', '$_____', '$_____', '☐ On track  ☐ At risk'],
    ['Financial', 'Shared Savings Earned', '$_____', '$_____', '☐ On track  ☐ At risk'],
    ['Quality', 'Star Rating (composite)', '_____', '≥4.0', '☐ On track  ☐ At risk'],
    ['Quality', 'HEDIS Gap Closure Rate', '_____%', '≥80%', '☐ On track  ☐ At risk'],
    ['Coding', 'RAF Accuracy (audit score)', '_____%', '≥95%', '☐ On track  ☐ At risk'],
    ['Coding', 'HCC Recapture Rate', '_____%', '≥90%', '☐ On track  ☐ At risk'],
    ['Utilization', 'IP Admits / 1,000', '_____', '<200', '☐ On track  ☐ At risk'],
    ['Utilization', 'ER Visits / 1,000', '_____', '<350', '☐ On track  ☐ At risk'],
    ['Utilization', '30-day Readmission Rate', '_____%', '<12%', '☐ On track  ☐ At risk'],
    ['Care Mgmt', 'CCM Enrollment Rate', '_____%', '≥60%', '☐ On track  ☐ At risk'],
    ['Experience', 'Patient Satisfaction', '_____/5', '≥4.2/5', '☐ On track  ☐ At risk'],
  ], y, { fontSize: 7.5 })

  y = checkPage(doc, y, 120)
  y = addSubtitle(doc, 'Resource Directory', y)
  y = addBullet(doc, [
    'CMS Quality Payment Program: qpp.cms.gov',
    'NCQA HEDIS Measures: ncqa.org/hedis',
    'CMS-HCC Risk Adjustment: cms.gov/medicare/health-plans/medicareadvtgspecratestats',
    'Medicare Star Ratings: cms.gov/medicare/prescription-drug-coverage/prescriptiondrugcovgenin',
    'AHRQ Care Management Resources: ahrq.gov/ncepcr/care',
    'HealthIT.gov Interoperability Standards: healthit.gov/isa',
    'National Quality Forum: qualityforum.org',
  ], y)

  return finalize(doc)
}

// ============================================================
// Export map
// ============================================================
const generators: Record<string, () => Buffer> = {
  'res-01': gen01, 'res-02': gen02, 'res-03': gen03, 'res-04': gen04,
  'res-05': gen05, 'res-06': gen06, 'res-07': gen07, 'res-08': gen08,
  'res-09': gen09, 'res-10': gen10, 'res-11': gen11, 'res-12': gen12,
  'res-13': gen13, 'res-14': gen14, 'res-15': gen15, 'res-16': gen16,
  'res-17': gen17, 'res-18': gen18, 'res-19': gen19, 'res-20': gen20,
  'res-21': gen21, 'res-22': gen22,
}

export function generatePdf(resourceId: string): Buffer | null {
  const gen = generators[resourceId]
  return gen ? gen() : null
}
