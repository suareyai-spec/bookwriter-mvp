import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function randomDate(start: Date, end: Date) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
}

// ── TEMPLATE SECTIONS GENERATOR ──
function soapSections(cc: string, type: string) {
  const base = [
    { name: 'Chief Complaint', fields: [{ name: 'chiefComplaint', type: 'text', label: 'Chief Complaint', placeholder: cc }] },
    { name: 'History of Present Illness', fields: [
      { name: 'onset', type: 'text', label: 'Onset' },
      { name: 'duration', type: 'text', label: 'Duration' },
      { name: 'severity', type: 'select', label: 'Severity', options: ['Mild', 'Moderate', 'Severe'] },
      { name: 'aggravating', type: 'text', label: 'Aggravating Factors' },
      { name: 'alleviating', type: 'text', label: 'Alleviating Factors' },
      { name: 'associated', type: 'text', label: 'Associated Symptoms' },
    ]},
    { name: 'Review of Systems', fields: [
      { name: 'constitutional', type: 'checkbox', label: 'Constitutional: Fever, chills, weight change' },
      { name: 'heent', type: 'checkbox', label: 'HEENT: Headache, vision changes, sore throat' },
      { name: 'cardiovascular', type: 'checkbox', label: 'CV: Chest pain, palpitations, edema' },
      { name: 'respiratory', type: 'checkbox', label: 'Resp: Cough, SOB, wheezing' },
      { name: 'gi', type: 'checkbox', label: 'GI: Nausea, vomiting, diarrhea, constipation' },
      { name: 'musculoskeletal', type: 'checkbox', label: 'MSK: Joint pain, swelling, stiffness' },
      { name: 'neuro', type: 'checkbox', label: 'Neuro: Dizziness, numbness, weakness' },
      { name: 'psych', type: 'checkbox', label: 'Psych: Depression, anxiety, sleep changes' },
    ]},
    { name: 'Vitals', fields: [
      { name: 'bp', type: 'text', label: 'Blood Pressure' },
      { name: 'hr', type: 'number', label: 'Heart Rate' },
      { name: 'temp', type: 'number', label: 'Temperature' },
      { name: 'rr', type: 'number', label: 'Respiratory Rate' },
      { name: 'o2sat', type: 'number', label: 'O2 Saturation' },
      { name: 'weight', type: 'number', label: 'Weight (lbs)' },
      { name: 'height', type: 'text', label: 'Height' },
      { name: 'bmi', type: 'number', label: 'BMI' },
    ]},
    { name: 'Physical Exam', fields: [
      { name: 'general', type: 'text', label: 'General Appearance', placeholder: 'Well-appearing, NAD' },
      { name: 'heent', type: 'text', label: 'HEENT' },
      { name: 'neck', type: 'text', label: 'Neck' },
      { name: 'lungs', type: 'text', label: 'Lungs' },
      { name: 'heart', type: 'text', label: 'Heart' },
      { name: 'abdomen', type: 'text', label: 'Abdomen' },
      { name: 'extremities', type: 'text', label: 'Extremities' },
      { name: 'neuro', type: 'text', label: 'Neurological' },
      { name: 'skin', type: 'text', label: 'Skin' },
    ]},
    { name: 'Assessment', fields: [
      { name: 'diagnoses', type: 'textarea', label: 'Diagnoses/ICD-10' },
      { name: 'clinicalImpression', type: 'textarea', label: 'Clinical Impression' },
    ]},
    { name: 'Plan', fields: [
      { name: 'medications', type: 'textarea', label: 'Medications' },
      { name: 'labsOrdered', type: 'textarea', label: 'Labs/Imaging Ordered' },
      { name: 'procedures', type: 'textarea', label: 'Procedures' },
      { name: 'referrals', type: 'textarea', label: 'Referrals' },
      { name: 'patientEducation', type: 'textarea', label: 'Patient Education' },
      { name: 'followUp', type: 'text', label: 'Follow-Up' },
    ]},
  ];
  if (type === 'screening') {
    return [
      { name: 'Screening Tool', fields: [
        { name: 'toolName', type: 'text', label: 'Screening Instrument' },
        { name: 'score', type: 'number', label: 'Total Score' },
        { name: 'interpretation', type: 'select', label: 'Interpretation', options: ['Negative', 'Mild', 'Moderate', 'Severe'] },
        { name: 'questions', type: 'textarea', label: 'Question Responses' },
      ]},
      { name: 'Clinical Assessment', fields: [
        { name: 'clinicalCorrelation', type: 'textarea', label: 'Clinical Correlation' },
        { name: 'riskFactors', type: 'textarea', label: 'Risk Factors Identified' },
      ]},
      { name: 'Plan', fields: [
        { name: 'interventions', type: 'textarea', label: 'Interventions' },
        { name: 'referrals', type: 'textarea', label: 'Referrals' },
        { name: 'followUp', type: 'text', label: 'Follow-Up Screening Date' },
      ]},
    ];
  }
  if (type === 'procedure') {
    return [
      { name: 'Pre-Procedure', fields: [
        { name: 'indication', type: 'textarea', label: 'Indication' },
        { name: 'consent', type: 'checkbox', label: 'Informed Consent Obtained' },
        { name: 'allergies', type: 'text', label: 'Allergies Reviewed' },
        { name: 'timeout', type: 'checkbox', label: 'Time-Out Performed' },
      ]},
      { name: 'Procedure Details', fields: [
        { name: 'anesthesia', type: 'select', label: 'Anesthesia', options: ['None', 'Local', 'Topical', 'Conscious Sedation'] },
        { name: 'technique', type: 'textarea', label: 'Technique/Description' },
        { name: 'findings', type: 'textarea', label: 'Findings' },
        { name: 'specimens', type: 'text', label: 'Specimens Collected' },
        { name: 'complications', type: 'text', label: 'Complications', placeholder: 'None' },
        { name: 'ebl', type: 'text', label: 'Estimated Blood Loss' },
      ]},
      { name: 'Post-Procedure', fields: [
        { name: 'instructions', type: 'textarea', label: 'Post-Procedure Instructions' },
        { name: 'followUp', type: 'text', label: 'Follow-Up' },
      ]},
    ];
  }
  return base;
}

function wellChildSections(age: string) {
  return [
    { name: 'Growth & Development', fields: [
      { name: 'weight', type: 'number', label: 'Weight' },
      { name: 'weightPercentile', type: 'number', label: 'Weight Percentile' },
      { name: 'height', type: 'number', label: 'Height/Length' },
      { name: 'heightPercentile', type: 'number', label: 'Height Percentile' },
      { name: 'headCirc', type: 'number', label: 'Head Circumference' },
      { name: 'bmi', type: 'number', label: 'BMI' },
      { name: 'bmiPercentile', type: 'number', label: 'BMI Percentile' },
    ]},
    { name: 'Developmental Milestones', fields: [
      { name: 'grossMotor', type: 'select', label: 'Gross Motor', options: ['On Track', 'Concern', 'Delayed'] },
      { name: 'fineMotor', type: 'select', label: 'Fine Motor', options: ['On Track', 'Concern', 'Delayed'] },
      { name: 'language', type: 'select', label: 'Language', options: ['On Track', 'Concern', 'Delayed'] },
      { name: 'social', type: 'select', label: 'Social/Emotional', options: ['On Track', 'Concern', 'Delayed'] },
      { name: 'cognitive', type: 'select', label: 'Cognitive', options: ['On Track', 'Concern', 'Delayed'] },
    ]},
    { name: 'Nutrition', fields: [
      { name: 'feeding', type: 'textarea', label: `Feeding/Nutrition (${age})` },
      { name: 'supplements', type: 'text', label: 'Supplements' },
    ]},
    { name: 'Screenings', fields: [
      { name: 'vision', type: 'select', label: 'Vision', options: ['Pass', 'Refer', 'N/A'] },
      { name: 'hearing', type: 'select', label: 'Hearing', options: ['Pass', 'Refer', 'N/A'] },
      { name: 'dental', type: 'select', label: 'Dental', options: ['Referred', 'N/A'] },
      { name: 'lead', type: 'select', label: 'Lead Screen', options: ['Done', 'Not Due', 'Deferred'] },
      { name: 'developmental', type: 'select', label: 'Developmental Screen', options: ['Normal', 'Concern', 'N/A'] },
    ]},
    { name: 'Physical Exam', fields: [
      { name: 'general', type: 'text', label: 'General', placeholder: 'Well-appearing, active' },
      { name: 'heent', type: 'text', label: 'HEENT' },
      { name: 'heart', type: 'text', label: 'Heart' },
      { name: 'lungs', type: 'text', label: 'Lungs' },
      { name: 'abdomen', type: 'text', label: 'Abdomen' },
      { name: 'genitalia', type: 'text', label: 'Genitalia' },
      { name: 'skin', type: 'text', label: 'Skin' },
      { name: 'neuro', type: 'text', label: 'Neurological' },
    ]},
    { name: 'Immunizations', fields: [
      { name: 'vaccinesGiven', type: 'textarea', label: 'Vaccines Administered' },
      { name: 'visGiven', type: 'checkbox', label: 'VIS Given to Parent' },
      { name: 'nextVaccines', type: 'textarea', label: 'Next Vaccines Due' },
    ]},
    { name: 'Anticipatory Guidance', fields: [
      { name: 'safety', type: 'textarea', label: 'Safety Counseling' },
      { name: 'nutrition', type: 'textarea', label: 'Nutrition Guidance' },
      { name: 'development', type: 'textarea', label: 'Developmental Guidance' },
      { name: 'parentConcerns', type: 'textarea', label: 'Parent Concerns Addressed' },
    ]},
    { name: 'Plan', fields: [
      { name: 'assessment', type: 'textarea', label: 'Assessment' },
      { name: 'followUp', type: 'text', label: 'Next Well-Child Visit' },
    ]},
  ];
}

// ── ALL 120+ TEMPLATES ──
function getAllTemplates() {
  const templates: any[] = [];
  const add = (name: string, category: string, subcategory: string | null, type: string, cc: string) => {
    templates.push({ name, category, subcategory, type, sections: JSON.stringify(type === 'screening' ? soapSections(cc, 'screening') : type === 'procedure' ? soapSections(cc, 'procedure') : soapSections(cc, 'encounter')), isDefault: true });
  };
  const addWC = (name: string, age: string) => {
    templates.push({ name, category: 'Preventive Care', subcategory: 'Pediatric Well-Child', type: 'encounter', sections: JSON.stringify(wellChildSections(age)), isDefault: true });
  };

  // 1. Core Visit
  ['Sick Visit','Follow-Up','Chronic Disease Management','Medication Management','Same-Day/Urgent','Telemedicine','Transition of Care (Hospital Discharge)','ER Follow-Up','Specialist Referral','Pre-Operative Clearance','Post-Hospital Follow-Up'].forEach(n => add(n, 'Core Visit', 'Adult', 'encounter', n));
  ['Sick Visit','Follow-Up','Same-Day/Urgent','Telemedicine','ER Follow-Up','Post-Hospital','Medication Management','Behavioral Visit','ADHD Follow-Up','Asthma Follow-Up'].forEach(n => add(`Pediatric ${n}`, 'Core Visit', 'Pediatric', 'encounter', n));

  // 2. Preventive Care - Adult
  ['Annual Physical','Medicare AWV (Initial)','Medicare Subsequent AWV','Welcome to Medicare (IPPE)','Preventive 18-39','Preventive 40-64','Preventive 65+','Women\'s Well Visit','Men\'s Preventive'].forEach(n => add(n, 'Preventive Care', 'Adult', 'encounter', n));
  // Well-Child
  const wcAges = ['Newborn','2 Week','1 Month','2 Month','4 Month','6 Month','9 Month','12 Month','15 Month','18 Month','24 Month','30 Month','3 Year','4 Year','5 Year','6-8 Year','9-10 Year','11-12 Year','13-15 Year','16-17 Year','18-21 Year'];
  wcAges.forEach(a => addWC(`Well-Child ${a}`, a));
  // Sex-Specific
  ['Adolescent Female','Adolescent Male','Menstrual Health','Sports Physical','School Physical','Camp Physical'].forEach(n => add(n, 'Preventive Care', 'Sex-Specific', 'encounter', n));

  // 3. Chronic Disease
  ['Diabetes','Hypertension','Hyperlipidemia','Obesity','CAD','CHF','COPD','Asthma','CKD','Depression','Anxiety','Hypothyroidism','Osteoporosis','Chronic Pain','GERD','Tobacco Use'].forEach(n => add(`${n} Management`, 'Chronic Disease', 'Adult', 'encounter', `${n} follow-up`));
  ['Asthma','Obesity','ADHD','Autism','Diabetes','Depression','Anxiety','Allergies','Eczema','GERD'].forEach(n => add(`Pediatric ${n} Management`, 'Chronic Disease', 'Pediatric', 'encounter', `Pediatric ${n}`));

  // 4. Acute Conditions
  ['URI','Sinusitis','Pharyngitis','Bronchitis','Pneumonia','Influenza','COVID-19','UTI','Gastroenteritis','Back Pain','Headache','Rash','Allergic Reaction','Conjunctivitis'].forEach(n => add(n, 'Acute Condition', 'Adult', 'encounter', n));
  ['URI','Otitis Media','Fever','Cough','Gastroenteritis','Rash','Conjunctivitis','Strep','Bronchiolitis','Viral Syndrome'].forEach(n => add(`Pediatric ${n}`, 'Acute Condition', 'Pediatric', 'encounter', `Pediatric ${n}`));

  // 5. Mental Health Screening
  ['PHQ-2','PHQ-9','GAD-7','Columbia Suicide Scale','Pediatric Depression','Pediatric Anxiety','ADHD Assessment','Behavioral Health Eval'].forEach(n => add(n, 'Mental Health Screening', null, 'screening', n));

  // 6. Developmental Screening
  ['ASQ-3','ASQ-SE','M-CHAT-R/F','SWYC','PEDS','Denver','Vanderbilt ADHD','PSC-17','SCARED','Sleep Screening'].forEach(n => add(n, 'Developmental Screening', null, 'screening', n));

  // 7. Preventive Screening
  ['Depression','Fall Risk','Cognitive Assessment','Tobacco','Alcohol (AUDIT-C)','Drug','Colon Cancer','Breast Cancer','Cervical Cancer','Lung Cancer','Osteoporosis','AAA','Hepatitis C','HIV'].forEach(n => add(`${n} Screening`, 'Preventive Screening', 'Adult', 'screening', n));
  ['Lead','Anemia','Vision','Hearing','Oral Health','Developmental','Autism'].forEach(n => add(`Pediatric ${n} Screening`, 'Preventive Screening', 'Pediatric', 'screening', n));

  // 8. Continuity of Care
  ['CCM Visit','Care Plan Documentation','Care Coordination Note','Transition of Care','ER Follow-Up','Specialist Review','Medication Reconciliation','High-Risk Management','Case Management'].forEach(n => add(n, 'Continuity of Care', null, 'encounter', n));

  // 9. Vaccination
  ['Adult Immunization','Pediatric Immunization','Vaccine Counseling','Vaccine Refusal','Catch-Up Schedule','Travel Vaccine'].forEach(n => add(n, 'Vaccination', null, 'encounter', n));

  // 10. Specialty
  ['Weight Loss','Smoking Cessation','Pre-Employment Physical','Disability Eval','DOT Physical','Immigration Physical','School Physical','Sports Clearance'].forEach(n => add(n, 'Specialty', null, 'encounter', n));

  // 11. Value-Based Care
  ['MEAT Documentation (HCC)','HCC Recapture Visit','Quality Gap Closure','Population Health Outreach','Medication Adherence Review','High-Cost Patient Review'].forEach(n => add(n, 'Value-Based Care', null, 'encounter', n));

  // 12. Telemedicine
  ['Adult Telehealth','Pediatric Telehealth','Telehealth Follow-Up','Telehealth Behavioral','Telehealth Medication Management'].forEach(n => add(n, 'Telemedicine', null, 'encounter', n));

  // 13. Procedure
  ['Skin Biopsy','Cryotherapy','I&D','Laceration Repair','Joint Injection','Ear Irrigation','Nebulizer Treatment','Wart Removal'].forEach(n => add(n, 'Procedure', null, 'procedure', n));

  // 14. SDOH
  ['SDOH Screening','Food Insecurity','Housing Instability','Transportation','Financial Strain'].forEach(n => add(n, 'SDOH', null, 'screening', n));

  // 15. Administrative
  ['Work/School Excuse','Medical Clearance','Disability Form','Medication Refill','Telephone Encounter','Patient Portal Encounter'].forEach(n => add(n, 'Administrative', null, 'encounter', n));

  return templates;
}

// ── PATIENT FLOW SEED ──
function getPatientFlowData() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const providers = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
  const reasons = ['Annual Physical', 'Diabetes Follow-Up', 'Sick Visit - Cough', 'Hypertension Check', 'Back Pain', 'Medication Review', 'Well-Child 12 Month', 'Knee Pain', 'Anxiety Follow-Up', 'Pre-Op Clearance', 'Lab Review', 'Skin Rash', 'Headache', 'UTI Symptoms', 'ADHD Follow-Up', 'Asthma Check', 'Post-Hospital Follow-Up', 'Referral Follow-Up'];
  const statuses = ['checked-in', 'waiting', 'vitals', 'exam-room', 'with-provider', 'checkout', 'completed'];
  const patients = [
    'Maria Garcia', 'James Wilson', 'Linda Chen', 'Robert Taylor', 'Jennifer Brown',
    'Michael Davis', 'Susan Martinez', 'David Anderson', 'Patricia Thomas', 'Richard Jackson',
    'Barbara White', 'Joseph Harris', 'Margaret Martin', 'Charles Thompson', 'Dorothy Robinson',
    'Christopher Clark', 'Lisa Lewis', 'Daniel Lee', 'Nancy Walker', 'Matthew Hall',
  ];

  return patients.map((name, i) => {
    const hour = 8 + Math.floor(i * 0.55);
    const minute = (i * 17) % 60;
    const appointmentTime = new Date(today);
    appointmentTime.setHours(hour, minute);
    const status = statuses[Math.min(i % 7, 6)];
    const checkedInAt = new Date(appointmentTime.getTime() - 5 * 60000);
    return {
      patientId: `PF-${1000 + i}`,
      patientName: name,
      appointmentTime,
      provider: providers[i % providers.length],
      reason: reasons[i % reasons.length],
      status,
      roomNumber: status === 'exam-room' || status === 'with-provider' ? `Room ${(i % 8) + 1}` : null,
      checkedInAt,
      vitalsAt: ['vitals', 'exam-room', 'with-provider', 'checkout', 'completed'].includes(status) ? new Date(checkedInAt.getTime() + 10 * 60000) : null,
      examRoomAt: ['exam-room', 'with-provider', 'checkout', 'completed'].includes(status) ? new Date(checkedInAt.getTime() + 20 * 60000) : null,
      providerAt: ['with-provider', 'checkout', 'completed'].includes(status) ? new Date(checkedInAt.getTime() + 25 * 60000) : null,
      checkoutAt: ['checkout', 'completed'].includes(status) ? new Date(checkedInAt.getTime() + 45 * 60000) : null,
      completedAt: status === 'completed' ? new Date(checkedInAt.getTime() + 50 * 60000) : null,
    };
  });
}

// ── CLINICAL DOCUMENTS SEED ──
function getDocuments() {
  const types = ['fax-in', 'fax-out', 'patient-doc', 'transcription', 'scanned', 'lab-result', 'referral'];
  const statuses = ['pending', 'reviewed', 'signed'];
  const providers = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
  const patients = ['Maria Garcia', 'James Wilson', 'Linda Chen', 'Robert Taylor', 'Jennifer Brown', 'Michael Davis', 'Susan Martinez', 'David Anderson', 'Patricia Thomas', 'Richard Jackson'];
  const titles: Record<string, string[]> = {
    'fax-in': ['Cardiology Consult Report', 'Lab Results from Quest', 'Hospital Discharge Summary', 'Specialist Referral Response', 'Insurance Authorization', 'Imaging Report - MRI', 'Pathology Report', 'Physical Therapy Progress Note'],
    'fax-out': ['Referral to Cardiology', 'Prior Auth Request', 'Medical Records Request', 'Letter to Specialist', 'Insurance Appeal'],
    'patient-doc': ['Signed Consent Form', 'HIPAA Acknowledgment', 'Advance Directive', 'Insurance Card Copy', 'Photo ID Copy', 'Release of Information'],
    'transcription': ['Office Visit Transcription', 'Procedure Note Transcription', 'Phone Call Documentation', 'Dictation - Follow Up'],
    'scanned': ['Old Medical Records', 'Outside Lab Results', 'Patient Questionnaire', 'Medication List', 'Growth Chart'],
    'lab-result': ['CBC with Differential', 'Comprehensive Metabolic Panel', 'Lipid Panel', 'HbA1c', 'TSH', 'Urinalysis', 'PSA', 'Vitamin D Level'],
    'referral': ['Cardiology Referral', 'Orthopedic Referral', 'Dermatology Referral', 'GI Referral', 'Neurology Referral', 'ENT Referral'],
  };
  const docs: any[] = [];
  for (let i = 0; i < 55; i++) {
    const type = types[i % types.length];
    const titleList = titles[type];
    docs.push({
      patientId: `DOC-${1000 + i}`,
      patientName: patients[i % patients.length],
      type,
      title: titleList[i % titleList.length],
      content: `Document content for ${titleList[i % titleList.length]}. This is a sample document generated for demonstration purposes.`,
      status: statuses[i % statuses.length],
      provider: providers[i % providers.length],
      source: type === 'fax-in' ? `(305) 555-${1000 + i}` : type === 'scanned' ? 'Front Desk Scanner' : type === 'patient-doc' ? 'Patient Portal' : null,
      createdAt: randomDate(new Date('2025-01-01'), new Date('2026-03-12')),
    });
  }
  return docs;
}

// ── SENIOR CARE PATIENTS ──
function getSeniorCarePatients() {
  const firstNames = ['Eleanor', 'Harold', 'Dorothy', 'Walter', 'Ruth', 'Frank', 'Margaret', 'Arthur', 'Virginia', 'Herbert', 'Evelyn', 'Clarence', 'Mildred', 'Raymond', 'Gladys', 'Eugene', 'Edna', 'Howard', 'Florence', 'Norman', 'Josephine', 'Lawrence', 'Helen', 'Albert', 'Irene', 'Stanley', 'Thelma', 'Leonard', 'Pauline', 'Bernard', 'Doris', 'Gerald', 'Lucille', 'Ernest', 'Lillian', 'Kenneth', 'Rose', 'Donald', 'Agnes', 'Ralph'];
  const lastNames = ['Johnson', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Rodriguez', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'Hernandez', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams', 'Baker', 'Gonzalez', 'Nelson', 'Carter', 'Mitchell'];
  const pcps = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
  const conditionsList = ['Diabetes, Hypertension', 'CHF, COPD', 'CKD Stage 3, Diabetes', 'Atrial Fibrillation, CHF', 'COPD, Osteoporosis', 'Diabetes, CKD, Hypertension', 'Depression, Chronic Pain', 'CAD, Hyperlipidemia', 'Obesity, Diabetes', 'Hypothyroidism, Osteoporosis'];
  const hccGapsList = ['Diabetes w/o complications', 'CHF documented but not coded', 'CKD Stage not specified', 'COPD severity not documented', 'Depression not recaptured', 'Malnutrition suspected', 'Vascular disease unspecified', 'None'];
  const carePlanStatuses = ['Active', 'Due for Review', 'Expired', 'Not Started'];
  const riskLevels = ['Low', 'Moderate', 'High', 'Very High'];

  return firstNames.map((fn, i) => {
    const age = 65 + Math.floor(Math.random() * 30);
    const riskScore = +(0.5 + Math.random() * 3.5).toFixed(2);
    const riskLevel = riskScore < 1.0 ? 'Low' : riskScore < 1.5 ? 'Moderate' : riskScore < 2.5 ? 'High' : 'Very High';
    return {
      patientName: `${fn} ${lastNames[i]}`,
      age,
      medicareId: `1EG4-TE5-MK${(7200 + i).toString()}`,
      riskScore,
      hccGaps: hccGapsList[i % hccGapsList.length],
      lastVisit: randomDate(new Date('2025-06-01'), new Date('2026-03-01')),
      nextAWVDue: randomDate(new Date('2026-03-01'), new Date('2027-03-01')),
      carePlanStatus: carePlanStatuses[i % carePlanStatuses.length],
      pcp: pcps[i % pcps.length],
      riskLevel,
      conditions: conditionsList[i % conditionsList.length],
      medications: 3 + Math.floor(Math.random() * 12),
    };
  });
}

// ── CLINICAL MESSAGES ──
function getMessages() {
  const providers = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
  const staff = ['Nurse Amy Johnson', 'MA Karen Smith', 'Front Desk Julie', 'Billing Dept', 'Lab Dept', 'Referral Coordinator'];
  const categories = ['clinical', 'rx-refill', 'lab-result', 'appointment', 'general'];
  const priorities = ['urgent', 'high', 'normal', 'normal', 'normal', 'low'];
  const patients = ['Maria Garcia', 'James Wilson', 'Linda Chen', 'Robert Taylor', 'Jennifer Brown'];
  const subjects: Record<string, string[]> = {
    clinical: ['Abnormal Lab Result - Action Required', 'Patient Symptom Update', 'Medication Side Effect Report', 'Post-Procedure Follow-Up', 'Critical Value Alert', 'Imaging Results Available'],
    'rx-refill': ['Refill Request - Metformin', 'Refill Request - Lisinopril', 'Prior Auth Needed for Rx', 'Controlled Substance Refill', 'New Rx Order'],
    'lab-result': ['Lab Results Ready for Review', 'Abnormal HbA1c Result', 'CBC Results', 'Lipid Panel Results', 'Urinalysis Results'],
    appointment: ['Appointment Reschedule Request', 'No-Show Follow-Up', 'New Patient Appointment', 'Urgent Add-On Request', 'Telehealth Request'],
    general: ['Staff Meeting Reminder', 'Policy Update', 'Equipment Maintenance', 'Patient Complaint', 'Insurance Verification'],
  };
  const msgs: any[] = [];
  for (let i = 0; i < 35; i++) {
    const cat = categories[i % categories.length];
    const subjectList = subjects[cat];
    const isInbox = i % 3 !== 2;
    msgs.push({
      fromName: isInbox ? pick([...staff, ...patients]) : pick(providers),
      toName: isInbox ? pick(providers) : pick([...staff, ...patients]),
      subject: subjectList[i % subjectList.length],
      body: `This is a detailed message regarding ${subjectList[i % subjectList.length].toLowerCase()}. Please review and take appropriate action. Patient information and relevant clinical details are included below for your reference.\n\nPlease respond at your earliest convenience.`,
      category: cat,
      priority: priorities[i % priorities.length],
      isRead: Math.random() > 0.4,
      folder: isInbox ? 'inbox' : 'outbox',
      patientId: cat !== 'general' ? `MSG-${1000 + i}` : null,
      patientName: cat !== 'general' ? patients[i % patients.length] : null,
      createdAt: randomDate(new Date('2026-02-01'), new Date('2026-03-12')),
    });
  }
  return msgs;
}

// ── REFERRALS ──
function getReferrals() {
  const providers = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
  const specialists = ['Dr. Robert Kim - Cardiology', 'Dr. Angela Foster - Orthopedics', 'Dr. David Park - Dermatology', 'Dr. Maria Santos - GI', 'Dr. William Chang - Neurology', 'Dr. Susan Lee - ENT', 'Dr. John Baker - Pulmonology', 'Dr. Karen White - Endocrinology', 'Dr. Thomas Green - Urology', 'Dr. Rachel Brown - Rheumatology'];
  const specialities = ['Cardiology', 'Orthopedics', 'Dermatology', 'Gastroenterology', 'Neurology', 'ENT', 'Pulmonology', 'Endocrinology', 'Urology', 'Rheumatology'];
  const statuses = ['sent', 'acknowledged', 'scheduled', 'completed', 'report-received'];
  const urgencies = ['routine', 'urgent', 'stat'];
  const patients = ['Maria Garcia', 'James Wilson', 'Linda Chen', 'Robert Taylor', 'Jennifer Brown', 'Michael Davis', 'Susan Martinez', 'David Anderson', 'Patricia Thomas', 'Richard Jackson'];
  const reasons = ['Chest pain evaluation', 'Knee replacement consult', 'Suspicious skin lesion', 'Chronic GERD not responding', 'Recurring migraines', 'Chronic sinusitis', 'Persistent cough', 'Uncontrolled diabetes', 'Recurrent UTI', 'Joint pain evaluation', 'Cardiac stress test', 'MRI interpretation', 'Colonoscopy screening', 'Sleep study', 'Allergy testing'];
  const refs: any[] = [];
  for (let i = 0; i < 28; i++) {
    const status = statuses[i % statuses.length];
    const isIncoming = i % 3 === 0;
    refs.push({
      patientId: `REF-${1000 + i}`,
      patientName: patients[i % patients.length],
      referringProvider: isIncoming ? specialists[i % specialists.length].split(' - ')[0] : providers[i % providers.length],
      specialist: isIncoming ? providers[i % providers.length] : specialists[i % specialists.length],
      speciality: specialities[i % specialities.length],
      reason: reasons[i % reasons.length],
      status,
      urgency: urgencies[i % urgencies.length],
      direction: isIncoming ? 'incoming' : 'outgoing',
      notes: i % 2 === 0 ? 'Patient needs evaluation within 2 weeks. Relevant records attached.' : null,
      scheduledDate: ['scheduled', 'completed', 'report-received'].includes(status) ? randomDate(new Date('2026-03-01'), new Date('2026-04-30')) : null,
      completedDate: ['completed', 'report-received'].includes(status) ? randomDate(new Date('2026-02-01'), new Date('2026-03-10')) : null,
      createdAt: randomDate(new Date('2025-12-01'), new Date('2026-03-12')),
    });
  }
  return refs;
}

// ── EXTRA FRAUD ALERTS ──
function getExtraFraudAlerts() {
  const alertTypes = ['Upcoding', 'Unbundling', 'Phantom Billing', 'Identity Theft', 'Duplicate Claim', 'Impossible Day', 'Modifier Abuse', 'Place of Service Mismatch'];
  const severities = ['Critical', 'High', 'Medium', 'Low'];
  const providers = ['Dr. Alan Pierce', 'Dr. Rita Sharma', 'Dr. Kevin Brown', 'Dr. Nancy Liu', 'Dr. Carlos Mendez', 'Dr. Heather Stone', 'Dr. Paul Wright', 'Dr. Diane Foster', 'Dr. Steven Park', 'Dr. Laura Kim'];
  const statuses = ['Open', 'Under Review', 'Confirmed Fraud', 'False Positive', 'Resolved'];
  const alerts: any[] = [];
  for (let i = 0; i < 200; i++) {
    alerts.push({
      claimId: `CLM-${10000 + i}`,
      alertType: alertTypes[i % alertTypes.length],
      severity: severities[i % severities.length],
      provider: providers[i % providers.length],
      estimatedOverpayment: +(500 + Math.random() * 50000).toFixed(2),
      status: statuses[i % statuses.length],
      investigationNotes: i % 3 === 0 ? 'Pattern detected across multiple claims. Further review needed.' : null,
      detectedDate: randomDate(new Date('2025-06-01'), new Date('2026-03-12')),
    });
  }
  return alerts;
}

// ── EXTRA CLAIMS ──
function getExtraClaims() {
  const patients = ['Maria Garcia', 'James Wilson', 'Linda Chen', 'Robert Taylor', 'Jennifer Brown', 'Michael Davis', 'Susan Martinez', 'David Anderson', 'Patricia Thomas', 'Richard Jackson', 'Barbara White', 'Joseph Harris', 'Margaret Martin', 'Charles Thompson', 'Dorothy Robinson'];
  const providers = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
  const payers = ['Medicare', 'Medicaid', 'BlueCross', 'Aetna', 'UnitedHealth', 'Cigna', 'Humana'];
  const statuses = ['Draft', 'Submitted', 'Accepted', 'Paid', 'Denied', 'Appealed', 'Partially Paid'];
  const cptCodes = ['99213', '99214', '99215', '99396', '99397', '99490', '99491', '99205', '99203', '36415', '71046', '93000', '80053', '85025'];
  const icdCodes = ['E11.9', 'I10', 'E78.5', 'J06.9', 'M54.5', 'K21.0', 'F32.1', 'G47.33', 'N39.0', 'E03.9'];
  const denialReasons = ['Missing modifier', 'Duplicate claim', 'Not medically necessary', 'Timely filing', 'Invalid diagnosis code', 'Authorization required', null, null, null];
  const claims: any[] = [];
  for (let i = 0; i < 500; i++) {
    const status = statuses[i % statuses.length];
    const charges = +(75 + Math.random() * 800).toFixed(2);
    claims.push({
      patient: patients[i % patients.length],
      provider: providers[i % providers.length],
      dateOfService: randomDate(new Date('2025-01-01'), new Date('2026-03-12')),
      cptCodes: JSON.stringify(pickN(cptCodes, 1 + Math.floor(Math.random() * 3))),
      icdCodes: JSON.stringify(pickN(icdCodes, 1 + Math.floor(Math.random() * 3))),
      charges,
      payer: payers[i % payers.length],
      status,
      denialReason: status === 'Denied' ? pick(denialReasons.filter(Boolean) as string[]) : null,
      appealStatus: status === 'Appealed' ? pick(['Pending', 'Won', 'Lost']) : null,
      paidAmount: ['Paid', 'Partially Paid'].includes(status) ? +(charges * (0.5 + Math.random() * 0.5)).toFixed(2) : 0,
      createdAt: randomDate(new Date('2025-01-01'), new Date('2026-03-12')),
    });
  }
  return claims;
}

// ── EXTRA PRIOR AUTHS ──
function getExtraPriorAuths() {
  const patients = ['Maria Garcia', 'James Wilson', 'Linda Chen', 'Robert Taylor', 'Jennifer Brown', 'Michael Davis', 'Susan Martinez', 'David Anderson', 'Patricia Thomas', 'Richard Jackson'];
  const providers = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
  const procedures = ['MRI Brain', 'MRI Lumbar Spine', 'CT Abdomen', 'Knee Arthroscopy', 'Cardiac Catheterization', 'Colonoscopy', 'Sleep Study', 'Physical Therapy (12 visits)', 'Humira', 'Ozempic', 'CPAP Machine', 'Hip Replacement', 'Spinal Fusion', 'Botox Injections', 'Home Health Services'];
  const payers = ['Medicare', 'BlueCross', 'Aetna', 'UnitedHealth', 'Cigna', 'Humana'];
  const statuses = ['Draft', 'Submitted', 'Under Review', 'Approved', 'Denied', 'Peer-to-Peer Scheduled', 'Expired'];
  const urgencies = ['Routine', 'Urgent', 'Emergent'];
  const auths: any[] = [];
  for (let i = 0; i < 150; i++) {
    const status = statuses[i % statuses.length];
    auths.push({
      patient: patients[i % patients.length],
      provider: providers[i % providers.length],
      procedure: procedures[i % procedures.length],
      payer: payers[i % payers.length],
      clinicalJustification: `Patient presents with ${pick(['chronic pain', 'progressive symptoms', 'failed conservative treatment', 'diagnostic uncertainty', 'acute exacerbation'])}. ${pick(['Prior treatments have been ineffective', 'Imaging supports surgical intervention', 'Clinical guidelines recommend this procedure', 'Alternative therapies exhausted'])}. This procedure is medically necessary for ${pick(['diagnosis', 'treatment', 'management', 'prevention of further deterioration'])}.`,
      urgency: urgencies[i % urgencies.length],
      status,
      submitDate: randomDate(new Date('2025-06-01'), new Date('2026-03-12')),
      decisionDate: ['Approved', 'Denied'].includes(status) ? randomDate(new Date('2026-01-01'), new Date('2026-03-12')) : null,
      authNumber: status === 'Approved' ? `AUTH-${100000 + i}` : null,
      expirationDate: status === 'Approved' ? randomDate(new Date('2026-06-01'), new Date('2026-12-31')) : null,
      notes: i % 3 === 0 ? 'Peer-to-peer review may be required if initial determination is adverse.' : null,
    });
  }
  return auths;
}

// ── EXTRA COMPLIANCE DATA ──
function getComplianceTrainingRecords() {
  const staffMembers = Array.from({ length: 30 }, (_, i) => {
    const roles = ['Physician', 'Nurse', 'MA', 'Front Desk', 'Billing', 'Admin', 'Lab Tech', 'IT'];
    const firstNames = ['Sarah', 'James', 'Patricia', 'Michael', 'Lisa', 'Amy', 'Karen', 'Julie', 'David', 'Robert', 'Jennifer', 'William', 'Maria', 'Thomas', 'Nancy', 'Steven', 'Linda', 'Richard', 'Susan', 'Joseph', 'Barbara', 'Charles', 'Margaret', 'Daniel', 'Dorothy', 'Matthew', 'Helen', 'Anthony', 'Sandra', 'Mark'];
    const lastNames = ['Mitchell', 'Rodriguez', 'Chen', 'Thompson', 'Patel', 'Johnson', 'Smith', 'Williams', 'Brown', 'Jones', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Garcia', 'Martinez', 'Robinson', 'Clark', 'Lewis', 'Lee', 'Walker', 'Hall', 'Allen'];
    return { name: `${firstNames[i]} ${lastNames[i]}`, role: roles[i % roles.length] };
  });
  return staffMembers;
}

async function main() {
  console.log('🌱 Starting EMR bulk seed...');

  // Templates
  const templates = getAllTemplates();
  console.log(`📝 Seeding ${templates.length} note templates...`);
  for (const t of templates) {
    await prisma.noteTemplate.create({ data: t });
  }

  // Patient Flow
  const flows = getPatientFlowData();
  console.log(`🏥 Seeding ${flows.length} patient flow entries...`);
  for (const f of flows) {
    await prisma.patientFlow.create({ data: f });
  }

  // Clinical Documents
  const docs = getDocuments();
  console.log(`📄 Seeding ${docs.length} clinical documents...`);
  for (const d of docs) {
    await prisma.clinicalDocument.create({ data: d });
  }

  // Senior Care Patients
  const seniors = getSeniorCarePatients();
  console.log(`👴 Seeding ${seniors.length} senior care patients...`);
  for (const s of seniors) {
    await prisma.seniorCarePatient.create({ data: s });
  }

  // Clinical Messages
  const messages = getMessages();
  console.log(`💬 Seeding ${messages.length} clinical messages...`);
  for (const m of messages) {
    await prisma.clinicalMessage.create({ data: m });
  }

  // Clinical Referrals
  const referrals = getReferrals();
  console.log(`🔗 Seeding ${referrals.length} clinical referrals...`);
  for (const r of referrals) {
    await prisma.clinicalReferral.create({ data: r });
  }

  // Extra Fraud Alerts
  const fraudAlerts = getExtraFraudAlerts();
  console.log(`🛡️ Seeding ${fraudAlerts.length} fraud alerts...`);
  for (const a of fraudAlerts) {
    await prisma.fraudAlert.create({ data: a });
  }

  // Extra Claims
  const claims = getExtraClaims();
  console.log(`📄 Seeding ${claims.length} claim submissions...`);
  for (const c of claims) {
    await prisma.claimSubmission.create({ data: c });
  }

  // Extra Prior Auths
  const auths = getExtraPriorAuths();
  console.log(`🔐 Seeding ${auths.length} prior authorizations...`);
  for (const a of auths) {
    await prisma.priorAuth.create({ data: a });
  }

  // Extra Compliance Incidents
  const incidentTypes = ['HIPAA Breach', 'Patient Complaint', 'Medication Error', 'Documentation Error', 'Privacy Violation', 'Safety Concern', 'Billing Irregularity'];
  const severities = ['Critical', 'High', 'Medium', 'Low'];
  console.log('⚖️ Seeding extra compliance incidents...');
  for (let i = 0; i < 30; i++) {
    await prisma.complianceIncident.create({
      data: {
        type: incidentTypes[i % incidentTypes.length],
        severity: severities[i % severities.length],
        description: `Incident report #${i + 1}: ${incidentTypes[i % incidentTypes.length]} detected during routine monitoring. Investigation initiated.`,
        reportedBy: `Staff Member ${i + 1}`,
        reportedDate: randomDate(new Date('2025-06-01'), new Date('2026-03-12')),
        status: pick(['Open', 'Under Investigation', 'Resolved', 'Closed']),
        investigation: i % 2 === 0 ? 'Investigation findings documented. Root cause identified.' : null,
        correctiveAction: i % 3 === 0 ? 'Corrective action plan implemented. Staff retraining completed.' : null,
      },
    });
  }

  console.log('✅ EMR bulk seed complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
