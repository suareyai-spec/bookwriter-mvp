import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}
function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}
function hoursAgo(n: number): Date {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d;
}

const departments = ['Emergency', 'Cardiology', 'Internal Medicine', 'Pulmonology', 'Orthopedics', 'Neurology'];
const physicians = ['Dr. Ramirez', 'Dr. Chen', 'Dr. Patel', 'Dr. Williams', 'Dr. Okafor', 'Dr. Fernandez'];
const nurses = ['RN Garcia', 'RN Thompson', 'RN Nguyen', 'RN Johnson', 'RN Martinez', 'RN Davis'];

const rooms: Record<string, string[]> = {
  Emergency: ['ER-01', 'ER-02', 'ER-03', 'ER-04', 'ER-05', 'ER-06', 'ER-07', 'ER-08', 'ER-09', 'ER-10', 'ER-11', 'ER-12'],
  Cardiology: ['4A-101', '4A-102', '4A-103', '4A-104', '4A-105', 'CCU-01', 'CCU-02', 'CCU-03', 'CCU-04'],
  'Internal Medicine': ['3A-101', '3A-102', '3A-103', '3A-104', '3A-105', '3B-201', '3B-202', '3B-203', '3B-204'],
  Pulmonology: ['5A-101', '5A-102', '5A-103', '5A-104', 'ICU-03', 'ICU-04', 'ICU-05'],
  Orthopedics: ['2A-101', '2A-102', '2A-103', '2A-104', '2A-105', '2A-106'],
  Neurology: ['6A-101', '6A-102', '6A-103', '6A-104', 'ICU-06', 'ICU-07'],
};

const patients = [
  // === ADMITTED (40 patients) ===
  // Cardiology (8 admitted)
  { firstName: 'Maria', lastName: 'Rodriguez', gender: 'Female', dob: '1948-03-15', dept: 'Cardiology', status: 'Admitted', diagnosis: 'Acute STEMI', allergies: 'Penicillin', codeStatus: 'Full Code', diet: 'Cardiac diet' },
  { firstName: 'Rosa', lastName: 'Perez', gender: 'Female', dob: '1947-04-18', dept: 'Cardiology', status: 'Admitted', diagnosis: 'Atrial fibrillation with RVR', allergies: 'None known', codeStatus: 'Full Code', diet: 'Cardiac diet' },
  { firstName: 'Carmen', lastName: 'Diaz', gender: 'Female', dob: '1949-10-07', dept: 'Cardiology', status: 'Admitted', diagnosis: 'Unstable angina', allergies: 'ACE inhibitors', codeStatus: 'Full Code', diet: 'Cardiac diet' },
  { firstName: 'Alberto', lastName: 'Sanchez', gender: 'Male', dob: '1944-06-20', dept: 'Cardiology', status: 'Admitted', diagnosis: 'CHF exacerbation with pulmonary edema', allergies: 'Sulfa drugs', codeStatus: 'Full Code', diet: 'Low sodium 2g' },
  { firstName: 'Gladys', lastName: 'Hernandez', gender: 'Female', dob: '1941-09-12', dept: 'Cardiology', status: 'Admitted', diagnosis: 'Non-STEMI', allergies: 'Latex', codeStatus: 'DNR', diet: 'Cardiac diet' },
  { firstName: 'Walter', lastName: 'Vasquez', gender: 'Male', dob: '1946-01-28', dept: 'Cardiology', status: 'Admitted', diagnosis: 'Aortic stenosis decompensation', allergies: 'Iodine contrast', codeStatus: 'Full Code', diet: 'Cardiac diet' },
  { firstName: 'Beatriz', lastName: 'Morales', gender: 'Female', dob: '1953-07-03', dept: 'Cardiology', status: 'Admitted', diagnosis: 'Hypertensive emergency', allergies: 'None known', codeStatus: 'Full Code', diet: 'Low sodium' },
  { firstName: 'Ernesto', lastName: 'Delgado', gender: 'Male', dob: '1939-11-14', dept: 'Cardiology', status: 'Admitted', diagnosis: 'Complete heart block', allergies: 'Aspirin', codeStatus: 'Full Code', diet: 'Regular' },

  // Emergency (7 admitted)
  { firstName: 'Roberto', lastName: 'Gonzalez', gender: 'Male', dob: '1945-07-22', dept: 'Emergency', status: 'Admitted', diagnosis: 'Sepsis', allergies: 'Sulfa drugs', codeStatus: 'Full Code', diet: 'NPO' },
  { firstName: 'Luz', lastName: 'Alvarez', gender: 'Female', dob: '1955-08-20', dept: 'Emergency', status: 'Admitted', diagnosis: 'Acute pancreatitis', allergies: 'Codeine', codeStatus: 'Full Code', diet: 'NPO' },
  { firstName: 'Isabel', lastName: 'Cruz', gender: 'Female', dob: '1953-11-04', dept: 'Emergency', status: 'Admitted', diagnosis: 'GI bleed', allergies: 'None known', codeStatus: 'Full Code', diet: 'NPO' },
  { firstName: 'Hector', lastName: 'Medina', gender: 'Male', dob: '1942-03-09', dept: 'Emergency', status: 'Admitted', diagnosis: 'Acute appendicitis', allergies: 'Penicillin', codeStatus: 'Full Code', diet: 'NPO' },
  { firstName: 'Ana', lastName: 'Gutierrez', gender: 'Female', dob: '1950-12-17', dept: 'Emergency', status: 'Admitted', diagnosis: 'Pulmonary embolism', allergies: 'Heparin (HIT history)', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Manuel', lastName: 'Ramos', gender: 'Male', dob: '1938-05-29', dept: 'Emergency', status: 'Admitted', diagnosis: 'Acute cholecystitis', allergies: 'Morphine', codeStatus: 'DNR', diet: 'NPO' },
  { firstName: 'Dolores', lastName: 'Vega', gender: 'Female', dob: '1944-08-11', dept: 'Emergency', status: 'Admitted', diagnosis: 'Urosepsis', allergies: 'Fluoroquinolones', codeStatus: 'Full Code', diet: 'Regular' },

  // Internal Medicine (9 admitted)
  { firstName: 'Helen', lastName: 'Murphy', gender: 'Female', dob: '1940-11-08', dept: 'Internal Medicine', status: 'Admitted', diagnosis: 'CHF Exacerbation', allergies: 'None known', codeStatus: 'DNR', diet: 'Low sodium' },
  { firstName: 'James', lastName: "O'Brien", gender: 'Male', dob: '1943-12-03', dept: 'Internal Medicine', status: 'Admitted', diagnosis: 'Diabetic ketoacidosis', allergies: 'Latex', codeStatus: 'Full Code', diet: 'Diabetic diet' },
  { firstName: 'Harold', lastName: 'Davis', gender: 'Male', dob: '1939-03-21', dept: 'Internal Medicine', status: 'Admitted', diagnosis: 'Acute kidney injury', allergies: 'NSAIDs', codeStatus: 'DNR/DNI', diet: 'Renal diet' },
  { firstName: 'Miriam', lastName: 'Torres', gender: 'Female', dob: '1951-06-25', dept: 'Internal Medicine', status: 'Admitted', diagnosis: 'Cellulitis with bacteremia', allergies: 'Vancomycin (Red Man)', codeStatus: 'Full Code', diet: 'Diabetic diet' },
  { firstName: 'Arthur', lastName: 'Cohen', gender: 'Male', dob: '1937-02-14', dept: 'Internal Medicine', status: 'Admitted', diagnosis: 'Hypernatremia', allergies: 'None known', codeStatus: 'DNR', diet: 'Fluid restriction' },
  { firstName: 'Gloria', lastName: 'Santiago', gender: 'Female', dob: '1946-10-30', dept: 'Internal Medicine', status: 'Admitted', diagnosis: 'Pneumonia with ARDS', allergies: 'Erythromycin', codeStatus: 'Full Code', diet: 'NPO' },
  { firstName: 'Eugene', lastName: 'Washington', gender: 'Male', dob: '1943-04-19', dept: 'Internal Medicine', status: 'Admitted', diagnosis: 'Hyponatremia', allergies: 'None known', codeStatus: 'Full Code', diet: 'Fluid restriction 1.5L' },
  { firstName: 'Sylvia', lastName: 'Rosario', gender: 'Female', dob: '1948-08-05', dept: 'Internal Medicine', status: 'Admitted', diagnosis: 'Acute liver failure', allergies: 'Acetaminophen', codeStatus: 'Full Code', diet: 'Low protein' },
  { firstName: 'Leonard', lastName: 'Klein', gender: 'Male', dob: '1940-01-22', dept: 'Internal Medicine', status: 'Admitted', diagnosis: 'C. difficile colitis', allergies: 'Penicillin', codeStatus: 'Full Code', diet: 'Regular' },

  // Pulmonology (6 admitted)
  { firstName: 'Jorge', lastName: 'Fernandez', gender: 'Male', dob: '1952-01-30', dept: 'Pulmonology', status: 'Admitted', diagnosis: 'COPD Exacerbation', allergies: 'Aspirin', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'William', lastName: 'Johnson', gender: 'Male', dob: '1941-02-14', dept: 'Pulmonology', status: 'Admitted', diagnosis: 'Pneumonia', allergies: 'Vancomycin (Red Man)', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Esperanza', lastName: 'Navarro', gender: 'Female', dob: '1945-09-08', dept: 'Pulmonology', status: 'Admitted', diagnosis: 'Bilateral pleural effusions', allergies: 'None known', codeStatus: 'Full Code', diet: 'Low sodium' },
  { firstName: 'Raymond', lastName: 'Foster', gender: 'Male', dob: '1940-04-17', dept: 'Pulmonology', status: 'Admitted', diagnosis: 'Lung abscess', allergies: 'Sulfa drugs', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Norma', lastName: 'Castillo', gender: 'Female', dob: '1952-12-01', dept: 'Pulmonology', status: 'Admitted', diagnosis: 'Acute respiratory failure', allergies: 'Codeine', codeStatus: 'Full Code', diet: 'NPO' },
  { firstName: 'Thomas', lastName: 'Patterson', gender: 'Male', dob: '1938-07-23', dept: 'Pulmonology', status: 'Admitted', diagnosis: 'Pulmonary fibrosis exacerbation', allergies: 'None known', codeStatus: 'DNR', diet: 'Regular' },

  // Orthopedics (5 admitted)
  { firstName: 'Dorothy', lastName: 'Williams', gender: 'Female', dob: '1938-06-12', dept: 'Orthopedics', status: 'Admitted', diagnosis: 'Right hip fracture', allergies: 'Morphine', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Robert', lastName: 'Thompson', gender: 'Male', dob: '1944-05-29', dept: 'Orthopedics', status: 'Admitted', diagnosis: 'Left knee replacement post-op', allergies: 'None known', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Francisca', lastName: 'Rojas', gender: 'Female', dob: '1947-03-26', dept: 'Orthopedics', status: 'Admitted', diagnosis: 'Vertebral compression fracture', allergies: 'Iodine contrast', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Henry', lastName: 'Miller', gender: 'Male', dob: '1942-11-09', dept: 'Orthopedics', status: 'Admitted', diagnosis: 'Left femur fracture ORIF post-op', allergies: 'Latex', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Margaret', lastName: 'Evans', gender: 'Female', dob: '1939-08-18', dept: 'Orthopedics', status: 'Admitted', diagnosis: 'Right total hip arthroplasty post-op', allergies: 'Penicillin', codeStatus: 'Full Code', diet: 'Regular' },

  // Neurology (5 admitted)
  { firstName: 'Carlos', lastName: 'Martinez', gender: 'Male', dob: '1950-09-25', dept: 'Neurology', status: 'Admitted', diagnosis: 'Acute ischemic stroke', allergies: 'Iodine contrast', codeStatus: 'Full Code', diet: 'Dysphagia puree' },
  { firstName: 'Elena', lastName: 'Suarez', gender: 'Female', dob: '1951-07-16', dept: 'Neurology', status: 'Admitted', diagnosis: 'New-onset seizures', allergies: 'Phenytoin', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Bernard', lastName: 'Jackson', gender: 'Male', dob: '1943-10-02', dept: 'Neurology', status: 'Admitted', diagnosis: 'Subdural hematoma', allergies: 'None known', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Consuelo', lastName: 'Reyes', gender: 'Female', dob: '1946-05-14', dept: 'Neurology', status: 'Admitted', diagnosis: 'Status epilepticus', allergies: 'Carbamazepine', codeStatus: 'Full Code', diet: 'NPO' },
  { firstName: 'Edward', lastName: 'Harris', gender: 'Male', dob: '1941-01-07', dept: 'Neurology', status: 'Admitted', diagnosis: 'Guillain-Barré syndrome', allergies: 'None known', codeStatus: 'Full Code', diet: 'Regular' },

  // === OBSERVATION (10 patients) ===
  { firstName: 'Frank', lastName: 'Anderson', gender: 'Male', dob: '1946-08-12', dept: 'Cardiology', status: 'Observation', diagnosis: 'Chest pain rule-out MI', allergies: 'Shellfish', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Marta', lastName: 'Reyes', gender: 'Female', dob: '1954-01-28', dept: 'Pulmonology', status: 'Observation', diagnosis: 'Asthma exacerbation', allergies: 'None known', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Gerald', lastName: 'White', gender: 'Male', dob: '1942-06-30', dept: 'Neurology', status: 'Observation', diagnosis: 'TIA evaluation', allergies: 'Heparin (HIT history)', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Lucia', lastName: 'Mendez', gender: 'Female', dob: '1949-11-20', dept: 'Emergency', status: 'Observation', diagnosis: 'Syncope workup', allergies: 'None known', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Howard', lastName: 'Lee', gender: 'Male', dob: '1945-04-05', dept: 'Cardiology', status: 'Observation', diagnosis: 'Supraventricular tachycardia', allergies: 'None known', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Virginia', lastName: 'Brown', gender: 'Female', dob: '1943-02-18', dept: 'Internal Medicine', status: 'Observation', diagnosis: 'Hypoglycemia evaluation', allergies: 'ACE inhibitors', codeStatus: 'Full Code', diet: 'Diabetic diet' },
  { firstName: 'Oscar', lastName: 'Fuentes', gender: 'Male', dob: '1950-07-09', dept: 'Emergency', status: 'Observation', diagnosis: 'Abdominal pain — rule out obstruction', allergies: 'Codeine', codeStatus: 'Full Code', diet: 'NPO' },
  { firstName: 'Lillian', lastName: 'Adams', gender: 'Female', dob: '1947-12-24', dept: 'Orthopedics', status: 'Observation', diagnosis: 'Fall with head CT negative', allergies: 'None known', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Pedro', lastName: 'Soto', gender: 'Male', dob: '1951-03-16', dept: 'Pulmonology', status: 'Observation', diagnosis: 'Hemoptysis workup', allergies: 'Aspirin', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Catherine', lastName: 'Price', gender: 'Female', dob: '1944-09-27', dept: 'Neurology', status: 'Observation', diagnosis: 'Altered mental status evaluation', allergies: 'Sulfa drugs', codeStatus: 'Full Code', diet: 'Regular' },

  // === DISCHARGED (5 patients) ===
  { firstName: 'Patricia', lastName: 'Lopez', gender: 'Female', dob: '1948-09-15', dept: 'Internal Medicine', status: 'Discharged', diagnosis: 'Community-acquired pneumonia', allergies: 'Erythromycin', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Richard', lastName: 'Garcia', gender: 'Male', dob: '1950-04-08', dept: 'Orthopedics', status: 'Discharged', diagnosis: 'Lumbar spinal stenosis', allergies: 'None known', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Alicia', lastName: 'Vargas', gender: 'Female', dob: '1952-06-13', dept: 'Cardiology', status: 'Discharged', diagnosis: 'Paroxysmal atrial fibrillation', allergies: 'None known', codeStatus: 'Full Code', diet: 'Cardiac diet' },
  { firstName: 'Donald', lastName: 'Martin', gender: 'Male', dob: '1940-10-22', dept: 'Pulmonology', status: 'Discharged', diagnosis: 'COPD exacerbation — resolved', allergies: 'Aspirin', codeStatus: 'Full Code', diet: 'Regular' },
  { firstName: 'Sandra', lastName: 'Ruiz', gender: 'Female', dob: '1945-05-31', dept: 'Emergency', status: 'Discharged', diagnosis: 'UTI with dehydration', allergies: 'Sulfa drugs', codeStatus: 'Full Code', diet: 'Regular' },
];

const noteTemplates = {
  Admission: (p: typeof patients[0], physician: string) =>
    `S: Patient is a ${2026 - parseInt(p.dob.slice(0, 4))}-year-old ${p.gender.toLowerCase()} presenting with ${p.diagnosis.toLowerCase()}. Patient reports symptoms for the past ${randomInt(1, 5)} days. PMH significant for hypertension, diabetes mellitus type 2. Allergies: ${p.allergies}.\n\nO: VS: T 98.6°F, HR 88, BP 142/88, RR 18, SpO2 96% on RA. General: Alert, oriented x3, appears in mild distress. ${p.dept === 'Cardiology' ? 'CV: Irregular rate and rhythm, no murmurs. JVP elevated.' : p.dept === 'Pulmonology' ? 'Lungs: Decreased breath sounds bilaterally, scattered wheezes. Using accessory muscles.' : p.dept === 'Neurology' ? 'Neuro: CN II-XII intact. Motor 5/5 bilateral UE, 4/5 bilateral LE. Babinski negative.' : p.dept === 'Orthopedics' ? 'MSK: Affected extremity with limited ROM, tenderness to palpation. NV intact distally.' : p.dept === 'Emergency' ? 'Abdomen: Soft, diffuse tenderness. No rebound. Bowel sounds hypoactive.' : 'Physical exam otherwise unremarkable for age.'}\n\nA: ${p.diagnosis}\n\nP: Admit to ${p.dept}. ${p.diet} diet. Continuous telemetry monitoring. Labs: CBC, CMP, ${p.dept === 'Cardiology' ? 'Troponin q6h, BNP, lipid panel' : p.dept === 'Neurology' ? 'PT/INR, CT Head stat, MRI Brain' : 'UA, blood cultures x2'}. Start appropriate medication regimen. Consult ${p.dept} if not primary. DVT prophylaxis per protocol. Fall precautions.`,

  Progress: (p: typeof patients[0], physician: string) =>
    `S: Patient reports ${pick(['improvement in symptoms', 'persistent mild discomfort', 'feeling better today', 'some difficulty sleeping', 'decreased pain compared to yesterday'])}. ${pick(['Tolerating diet well.', 'Appetite improving.', 'Mild nausea this morning.', 'No new complaints.'])} ${pick(['Ambulated in hallway with PT.', 'Resting comfortably.', 'Family at bedside.'])}\n\nO: VS stable. T 98.4°F, HR ${randomInt(68, 95)}, BP ${randomInt(120, 155)}/${randomInt(70, 90)}, RR ${randomInt(14, 20)}, SpO2 ${randomInt(93, 99)}% on ${pick(['RA', '2L NC', '4L NC'])}. ${pick(['No acute distress.', 'Alert and conversational.', 'Comfortable appearance.'])} Labs from this AM reviewed - ${pick(['trending toward normal', 'stable from yesterday', 'showing mild improvement', 'see lab section for details'])}.\n\nA: ${p.diagnosis} - ${pick(['improving', 'stable', 'slowly improving', 'responding to treatment'])}\n\nP: Continue current plan. ${pick(['Advance diet as tolerated.', 'Continue IV antibiotics.', 'Titrate medications as needed.', 'PT/OT to continue daily.'])} Reassess in AM. Anticipate ${p.status === 'Admitted' ? 'continued inpatient stay' : 'possible discharge in 24-48h'}.`,

  Nursing: (p: typeof patients[0], _physician: string) =>
    `Nursing Assessment - ${pick(['Day', 'Night', 'Evening'])} Shift\n\nPatient ${p.firstName} ${p.lastName} assessed at start of shift. ${pick(['Alert and oriented x4.', 'Alert, oriented to person and place.', 'Drowsy but easily arousable.'])} ${pick(['Pain controlled at 3/10.', 'Denies pain at this time.', 'Reports pain 5/10, medicated per order.', 'Pain 2/10, tolerable per patient.'])} IV site ${pick(['right forearm', 'left hand', 'right AC'])} - no signs of infiltration or phlebitis. ${pick(['Skin warm and dry.', 'Skin intact, no breakdown noted.', 'Sacral redness noted, turning q2h.'])} ${pick(['Foley catheter draining clear yellow urine.', 'Voiding independently.', 'I&O monitored.'])} Fall risk ${pick(['low', 'moderate', 'high'])} - precautions in place. Call bell within reach. Side rails x2 up. Family updated on plan of care.`,

  'Discharge Summary': (p: typeof patients[0], physician: string) =>
    `DISCHARGE SUMMARY\n\nPatient: ${p.firstName} ${p.lastName}\nAdmission Diagnosis: ${p.diagnosis}\nDischarge Diagnosis: ${p.diagnosis} - resolved/improved\nLength of Stay: ${randomInt(3, 8)} days\n\nHospital Course: Patient was admitted with ${p.diagnosis.toLowerCase()}. Treated with appropriate medication regimen. Patient responded well to treatment. Symptoms improved. Vitals stabilized. Labs trending toward normal at time of discharge.\n\nDischarge Medications: See medication reconciliation.\nFollow-up: ${physician} in ${randomInt(5, 14)} days. PCP within 1 week.\nDischarge Condition: Stable, improved.\nDisposition: Home ${pick(['with home health', 'with family', 'independently', 'to skilled nursing facility'])}.\n\nPatient educated on warning signs requiring return to ED. Discharge instructions reviewed and provided. Patient verbalized understanding.`,

  Consultation: (p: typeof patients[0], _physician: string) => {
    const consultPhysician = pick(physicians.filter(ph => ph !== _physician));
    return `CONSULTATION NOTE\n\nReason for Consultation: ${pick(['Management of', 'Evaluation of', 'Assessment of'])} ${p.diagnosis.toLowerCase()}\nRequesting Physician: ${_physician}\nConsulting Physician: ${consultPhysician}\n\nHPI: ${2026 - parseInt(p.dob.slice(0, 4))}-year-old ${p.gender.toLowerCase()} admitted ${randomInt(1, 3)} days ago with ${p.diagnosis.toLowerCase()}. ${pick(['Course has been complicated by', 'Patient also has history of', 'Recent workup notable for'])} ${pick(['persistent symptoms despite initial therapy', 'new findings on imaging', 'electrolyte abnormalities', 'cardiac rhythm changes'])}.\n\nAssessment: ${p.diagnosis}. ${pick(['Agree with current management.', 'Recommend additional workup.', 'Suggest modification of current regimen.'])}\n\nRecommendations:\n1. ${pick(['Continue current antibiotics', 'Obtain echocardiogram', 'Start anticoagulation', 'CT scan of chest with contrast', 'MRI brain without contrast'])}\n2. ${pick(['Serial labs q12h', 'Repeat imaging in 48h', 'Cardiology follow-up post-discharge', 'Physical therapy consult'])}\n3. Will follow along during hospitalization\n\nThank you for this consultation.\n${consultPhysician}`;
  },
};

const medicationPool = [
  { name: 'Metoprolol', dosage: '25 mg', route: 'PO', frequency: 'BID' },
  { name: 'Metoprolol', dosage: '50 mg', route: 'PO', frequency: 'BID' },
  { name: 'Lisinopril', dosage: '10 mg', route: 'PO', frequency: 'Daily' },
  { name: 'Lisinopril', dosage: '20 mg', route: 'PO', frequency: 'Daily' },
  { name: 'Furosemide', dosage: '40 mg', route: 'IV', frequency: 'BID' },
  { name: 'Furosemide', dosage: '20 mg', route: 'PO', frequency: 'Daily' },
  { name: 'Heparin', dosage: '5000 units', route: 'SubQ', frequency: 'Q8H' },
  { name: 'Heparin drip', dosage: 'per protocol', route: 'IV', frequency: 'Continuous' },
  { name: 'Aspirin', dosage: '81 mg', route: 'PO', frequency: 'Daily' },
  { name: 'Atorvastatin', dosage: '40 mg', route: 'PO', frequency: 'QHS' },
  { name: 'Clopidogrel', dosage: '75 mg', route: 'PO', frequency: 'Daily' },
  { name: 'Amlodipine', dosage: '5 mg', route: 'PO', frequency: 'Daily' },
  { name: 'Insulin glargine', dosage: '20 units', route: 'SubQ', frequency: 'QHS' },
  { name: 'Insulin lispro', dosage: 'sliding scale', route: 'SubQ', frequency: 'AC+HS' },
  { name: 'Pantoprazole', dosage: '40 mg', route: 'IV', frequency: 'Daily' },
  { name: 'Metformin', dosage: '500 mg', route: 'PO', frequency: 'BID' },
  { name: 'Enoxaparin', dosage: '40 mg', route: 'SubQ', frequency: 'Daily' },
  { name: 'Ceftriaxone', dosage: '1 g', route: 'IV', frequency: 'Q24H' },
  { name: 'Vancomycin', dosage: '1 g', route: 'IV', frequency: 'Q12H' },
  { name: 'Piperacillin-tazobactam', dosage: '4.5 g', route: 'IV', frequency: 'Q6H' },
  { name: 'Albuterol', dosage: '2.5 mg', route: 'Nebulizer', frequency: 'Q4H PRN' },
  { name: 'Ipratropium', dosage: '0.5 mg', route: 'Nebulizer', frequency: 'Q6H' },
  { name: 'Prednisone', dosage: '40 mg', route: 'PO', frequency: 'Daily' },
  { name: 'Morphine', dosage: '2 mg', route: 'IV', frequency: 'Q4H PRN' },
  { name: 'Acetaminophen', dosage: '650 mg', route: 'PO', frequency: 'Q6H PRN' },
  { name: 'Ondansetron', dosage: '4 mg', route: 'IV', frequency: 'Q6H PRN' },
  { name: 'Docusate sodium', dosage: '100 mg', route: 'PO', frequency: 'BID' },
  { name: 'Warfarin', dosage: '5 mg', route: 'PO', frequency: 'Daily' },
  { name: 'Potassium chloride', dosage: '20 mEq', route: 'PO', frequency: 'Daily' },
  { name: 'Magnesium oxide', dosage: '400 mg', route: 'PO', frequency: 'Daily' },
  { name: 'Levetiracetam', dosage: '500 mg', route: 'IV', frequency: 'BID' },
  { name: 'Hydrocodone-APAP', dosage: '5-325 mg', route: 'PO', frequency: 'Q6H PRN' },
  { name: 'Diltiazem', dosage: '30 mg', route: 'PO', frequency: 'Q6H' },
  { name: 'Amiodarone', dosage: '200 mg', route: 'PO', frequency: 'Daily' },
  { name: 'Nitroglycerin', dosage: '0.4 mg', route: 'SL', frequency: 'PRN chest pain' },
  { name: 'Lorazepam', dosage: '0.5 mg', route: 'IV', frequency: 'Q6H PRN' },
  { name: 'Methylprednisolone', dosage: '125 mg', route: 'IV', frequency: 'Q6H' },
  { name: 'Dexamethasone', dosage: '4 mg', route: 'IV', frequency: 'Q6H' },
];

const labTests = [
  // CBC
  { testName: 'WBC', normalRange: '4.5-11.0', unit: 'K/uL', normalVal: () => (randomInt(50, 100) / 10).toFixed(1), abnormalVal: () => (randomInt(120, 200) / 10).toFixed(1), criticalVal: () => (randomInt(10, 25) / 10).toFixed(1) },
  { testName: 'Hemoglobin', normalRange: '12.0-17.5', unit: 'g/dL', normalVal: () => (randomInt(120, 160) / 10).toFixed(1), abnormalVal: () => (randomInt(90, 115) / 10).toFixed(1), criticalVal: () => (randomInt(55, 70) / 10).toFixed(1) },
  { testName: 'Hematocrit', normalRange: '36-51', unit: '%', normalVal: () => randomInt(38, 48).toString(), abnormalVal: () => randomInt(28, 34).toString(), criticalVal: () => randomInt(18, 22).toString() },
  { testName: 'Platelets', normalRange: '150-400', unit: 'K/uL', normalVal: () => randomInt(180, 350).toString(), abnormalVal: () => randomInt(80, 140).toString(), criticalVal: () => randomInt(20, 50).toString() },
  // BMP
  { testName: 'Sodium', normalRange: '136-145', unit: 'mEq/L', normalVal: () => randomInt(137, 143).toString(), abnormalVal: () => randomInt(128, 134).toString(), criticalVal: () => randomInt(118, 124).toString() },
  { testName: 'Potassium', normalRange: '3.5-5.0', unit: 'mEq/L', normalVal: () => (randomInt(37, 48) / 10).toFixed(1), abnormalVal: () => (randomInt(52, 58) / 10).toFixed(1), criticalVal: () => (randomInt(62, 72) / 10).toFixed(1) },
  { testName: 'Chloride', normalRange: '98-106', unit: 'mEq/L', normalVal: () => randomInt(99, 105).toString(), abnormalVal: () => randomInt(88, 96).toString(), criticalVal: () => randomInt(80, 86).toString() },
  { testName: 'CO2', normalRange: '23-29', unit: 'mEq/L', normalVal: () => randomInt(24, 28).toString(), abnormalVal: () => randomInt(16, 21).toString(), criticalVal: () => randomInt(10, 14).toString() },
  { testName: 'BUN', normalRange: '7-20', unit: 'mg/dL', normalVal: () => randomInt(10, 18).toString(), abnormalVal: () => randomInt(28, 45).toString(), criticalVal: () => randomInt(60, 90).toString() },
  { testName: 'Creatinine', normalRange: '0.7-1.3', unit: 'mg/dL', normalVal: () => (randomInt(7, 12) / 10).toFixed(1), abnormalVal: () => (randomInt(16, 25) / 10).toFixed(1), criticalVal: () => (randomInt(40, 60) / 10).toFixed(1) },
  { testName: 'Glucose', normalRange: '70-100', unit: 'mg/dL', normalVal: () => randomInt(75, 99).toString(), abnormalVal: () => randomInt(140, 250).toString(), criticalVal: () => randomInt(350, 500).toString() },
  // Cardiac
  { testName: 'Troponin I', normalRange: '<0.04', unit: 'ng/mL', normalVal: () => (randomInt(1, 3) / 100).toFixed(2), abnormalVal: () => (randomInt(10, 80) / 100).toFixed(2), criticalVal: () => (randomInt(200, 1200) / 100).toFixed(2) },
  { testName: 'BNP', normalRange: '<100', unit: 'pg/mL', normalVal: () => randomInt(20, 80).toString(), abnormalVal: () => randomInt(200, 800).toString(), criticalVal: () => randomInt(1200, 3000).toString() },
  // Coag
  { testName: 'PT/INR', normalRange: '0.8-1.1', unit: 'INR', normalVal: () => (randomInt(8, 11) / 10).toFixed(1), abnormalVal: () => (randomInt(15, 25) / 10).toFixed(1), criticalVal: () => (randomInt(40, 60) / 10).toFixed(1) },
  { testName: 'D-Dimer', normalRange: '<0.50', unit: 'mg/L', normalVal: () => (randomInt(10, 40) / 100).toFixed(2), abnormalVal: () => (randomInt(80, 250) / 100).toFixed(2), criticalVal: () => (randomInt(400, 800) / 100).toFixed(2) },
  // Other
  { testName: 'Lactate', normalRange: '0.5-2.0', unit: 'mmol/L', normalVal: () => (randomInt(5, 18) / 10).toFixed(1), abnormalVal: () => (randomInt(25, 40) / 10).toFixed(1), criticalVal: () => (randomInt(50, 80) / 10).toFixed(1) },
  { testName: 'HbA1c', normalRange: '4.0-5.6', unit: '%', normalVal: () => (randomInt(42, 55) / 10).toFixed(1), abnormalVal: () => (randomInt(65, 85) / 10).toFixed(1), criticalVal: () => (randomInt(100, 140) / 10).toFixed(1) },
  { testName: 'Total Cholesterol', normalRange: '<200', unit: 'mg/dL', normalVal: () => randomInt(150, 195).toString(), abnormalVal: () => randomInt(220, 280).toString(), criticalVal: () => randomInt(300, 400).toString() },
  { testName: 'LDL', normalRange: '<100', unit: 'mg/dL', normalVal: () => randomInt(60, 95).toString(), abnormalVal: () => randomInt(130, 180).toString(), criticalVal: () => randomInt(200, 250).toString() },
  { testName: 'Magnesium', normalRange: '1.7-2.2', unit: 'mg/dL', normalVal: () => (randomInt(18, 21) / 10).toFixed(1), abnormalVal: () => (randomInt(12, 15) / 10).toFixed(1), criticalVal: () => (randomInt(8, 10) / 10).toFixed(1) },
  { testName: 'Phosphorus', normalRange: '2.5-4.5', unit: 'mg/dL', normalVal: () => (randomInt(28, 42) / 10).toFixed(1), abnormalVal: () => (randomInt(50, 65) / 10).toFixed(1), criticalVal: () => (randomInt(70, 90) / 10).toFixed(1) },
  { testName: 'Albumin', normalRange: '3.5-5.5', unit: 'g/dL', normalVal: () => (randomInt(37, 48) / 10).toFixed(1), abnormalVal: () => (randomInt(22, 32) / 10).toFixed(1), criticalVal: () => (randomInt(12, 18) / 10).toFixed(1) },
  { testName: 'AST', normalRange: '10-40', unit: 'U/L', normalVal: () => randomInt(15, 35).toString(), abnormalVal: () => randomInt(60, 120).toString(), criticalVal: () => randomInt(300, 800).toString() },
  { testName: 'ALT', normalRange: '7-56', unit: 'U/L', normalVal: () => randomInt(12, 45).toString(), abnormalVal: () => randomInt(70, 150).toString(), criticalVal: () => randomInt(300, 700).toString() },
];

const problemsPool = [
  { name: 'Essential hypertension', icdCode: 'I10' },
  { name: 'Type 2 diabetes mellitus', icdCode: 'E11.9' },
  { name: 'Hyperlipidemia', icdCode: 'E78.5' },
  { name: 'Chronic kidney disease, stage 3', icdCode: 'N18.3' },
  { name: 'Atrial fibrillation', icdCode: 'I48.91' },
  { name: 'Coronary artery disease', icdCode: 'I25.10' },
  { name: 'Heart failure, unspecified', icdCode: 'I50.9' },
  { name: 'COPD', icdCode: 'J44.1' },
  { name: 'Osteoarthritis of knee', icdCode: 'M17.9' },
  { name: 'Obesity', icdCode: 'E66.9' },
  { name: 'GERD', icdCode: 'K21.0' },
  { name: 'Hypothyroidism', icdCode: 'E03.9' },
  { name: 'Anemia', icdCode: 'D64.9' },
  { name: 'Major depressive disorder', icdCode: 'F32.9' },
  { name: 'Peripheral vascular disease', icdCode: 'I73.9' },
  { name: 'Osteoporosis', icdCode: 'M81.0' },
  { name: 'Deep vein thrombosis', icdCode: 'I82.40' },
  { name: 'Pulmonary embolism', icdCode: 'I26.99' },
  { name: 'Acute kidney injury', icdCode: 'N17.9' },
  { name: 'Urinary tract infection', icdCode: 'N39.0' },
  { name: 'Acute STEMI', icdCode: 'I21.3' },
  { name: 'Sepsis', icdCode: 'A41.9' },
  { name: 'Pneumonia', icdCode: 'J18.9' },
  { name: 'Cerebral infarction', icdCode: 'I63.9' },
  { name: 'Seizure disorder', icdCode: 'G40.909' },
  { name: 'Hip fracture', icdCode: 'S72.009A' },
  { name: 'Lumbar spinal stenosis', icdCode: 'M48.06' },
  { name: 'Acute pancreatitis', icdCode: 'K85.9' },
  { name: 'GI hemorrhage', icdCode: 'K92.2' },
  { name: 'Diabetic ketoacidosis', icdCode: 'E13.10' },
  { name: 'Chronic pain syndrome', icdCode: 'G89.4' },
  { name: 'Benign prostatic hyperplasia', icdCode: 'N40.0' },
  { name: 'Chronic obstructive asthma', icdCode: 'J44.9' },
  { name: 'Iron deficiency anemia', icdCode: 'D50.9' },
  { name: 'Anxiety disorder', icdCode: 'F41.9' },
];

const orderTemplates = [
  { orderType: 'Lab', descriptions: ['CBC with differential', 'Comprehensive metabolic panel', 'Troponin I serial q6h', 'BNP level', 'Blood cultures x2', 'Urinalysis with culture', 'Coagulation studies PT/INR/PTT', 'Lipid panel fasting', 'Lactate level', 'HbA1c', 'Type and screen'] },
  { orderType: 'Imaging', descriptions: ['Chest X-ray PA/Lateral', 'CT Head without contrast', 'CT Chest with contrast (PE protocol)', 'Echocardiogram TTE', 'MRI Brain without contrast', 'X-ray Right hip AP/Lateral', 'CT Abdomen/Pelvis with contrast', 'Doppler ultrasound bilateral lower extremities', 'Abdominal ultrasound'] },
  { orderType: 'Consult', descriptions: ['Cardiology consultation', 'Pulmonology consultation', 'Infectious disease consultation', 'Nephrology consultation', 'Orthopedic surgery consultation', 'Neurology consultation', 'GI consultation', 'Physical therapy evaluation', 'Occupational therapy evaluation', 'Social work consult'] },
  { orderType: 'Procedure', descriptions: ['Foley catheter insertion', 'Central line placement', 'Arterial line placement', 'Lumbar puncture', 'Thoracentesis', 'Paracentesis', 'Right heart catheterization', 'EGD', 'Wound care daily'] },
];

async function main() {
  console.log('🏥 Seeding ChartIQ data (55 patients)...\n');

  // Clear existing data in order
  await prisma.chartProblem.deleteMany();
  await prisma.chartOrder.deleteMany();
  await prisma.chartLab.deleteMany();
  await prisma.chartMedication.deleteMany();
  await prisma.chartVital.deleteMany();
  await prisma.chartNote.deleteMany();
  await prisma.chartPatientImage.deleteMany();
  await prisma.chartPatient.deleteMany();
  console.log('Cleared existing ChartIQ data.');

  for (let i = 0; i < patients.length; i++) {
    const p = patients[i];
    const mrn = `CHT-${String(i + 1).padStart(4, '0')}`;
    const dept = p.dept;
    const physician = pick(physicians);
    const admitDaysAgo = p.status === 'Discharged' ? randomInt(10, 20) : randomInt(1, 7);
    const admitDate = daysAgo(admitDaysAgo);
    const room = pick(rooms[dept]);

    const patient = await prisma.chartPatient.create({
      data: {
        mrn,
        firstName: p.firstName,
        lastName: p.lastName,
        dateOfBirth: new Date(p.dob),
        gender: p.gender,
        roomNumber: room,
        bedNumber: pick(['A', 'B']),
        admissionDate: admitDate,
        admissionDiagnosis: p.diagnosis,
        status: p.status,
        allergies: p.allergies,
        codeStatus: p.codeStatus,
        dietaryRestrictions: p.diet,
        primaryPhysician: physician,
        insurance: pick(['Medicare Advantage - Humana', 'Medicare FFS', 'Medicare Advantage - Aetna', 'Medicare Advantage - Simply Health', 'Medicare Advantage - UHC', 'Medicaid']),
      },
    });

    console.log(`  Created patient: ${patient.firstName} ${patient.lastName} (${mrn}) - ${dept} - ${p.status}`);

    // --- Notes ---
    const noteCount = randomInt(3, 5);
    const noteTypes: (keyof typeof noteTemplates)[] = ['Admission'];
    if (p.status === 'Discharged') noteTypes.push('Discharge Summary');
    while (noteTypes.length < noteCount) {
      noteTypes.push(pick(['Progress', 'Nursing', 'Consultation'] as const));
    }
    for (let n = 0; n < noteCount; n++) {
      const noteType = noteTypes[n];
      const isNursing = noteType === 'Nursing';
      const author = isNursing ? pick(nurses) : physician;
      const authorRole = isNursing ? 'Nurse' : 'Physician';
      await prisma.chartNote.create({
        data: {
          patientId: patient.id,
          authorName: author,
          authorRole,
          noteType,
          shiftType: pick(['Day', 'Night', 'Evening']),
          content: noteTemplates[noteType](p, physician),
          createdAt: hoursAgo(randomInt(1, admitDaysAgo * 24)),
          department: dept,
        },
      });
    }

    // --- Vitals ---
    const vitalCount = randomInt(3, 8);
    const isConcerning = i < 10; // first 10 patients have some concerning readings
    for (let v = 0; v < vitalCount; v++) {
      const isBadReading = isConcerning && v === 0;
      await prisma.chartVital.create({
        data: {
          patientId: patient.id,
          temperature: isBadReading && i % 5 === 1 ? 102.4 : parseFloat((randomInt(972, 994) / 10).toFixed(1)),
          heartRate: isBadReading && i % 5 === 0 ? 122 : randomInt(62, 98),
          bloodPressureSys: isBadReading ? randomInt(170, 200) : randomInt(118, 148),
          bloodPressureDia: isBadReading ? randomInt(95, 110) : randomInt(65, 88),
          respiratoryRate: isBadReading ? randomInt(24, 32) : randomInt(14, 20),
          oxygenSat: isBadReading && i % 5 === 3 ? 87 : parseFloat((randomInt(930, 1000) / 10).toFixed(1)),
          painLevel: randomInt(0, 7),
          recordedAt: hoursAgo(randomInt(1, admitDaysAgo * 24)),
          recordedBy: pick(nurses),
        },
      });
    }

    // --- Labs ---
    const labCount = randomInt(5, 10);
    const selectedLabs = pickN(labTests, labCount);
    for (const lab of selectedLabs) {
      const roll = Math.random();
      let value: string, flag: string;
      if (roll < 0.6) {
        value = lab.normalVal();
        flag = 'Normal';
      } else if (roll < 0.85) {
        value = lab.abnormalVal();
        flag = 'Abnormal';
      } else {
        value = lab.criticalVal();
        flag = 'Critical';
      }
      const collectedAt = hoursAgo(randomInt(2, admitDaysAgo * 24));
      await prisma.chartLab.create({
        data: {
          patientId: patient.id,
          testName: lab.testName,
          value,
          unit: lab.unit,
          normalRange: lab.normalRange,
          flag,
          collectedAt,
          resultAt: new Date(collectedAt.getTime() + randomInt(30, 180) * 60000),
        },
      });
    }

    // --- Medications ---
    const medCount = randomInt(3, 8);
    const selectedMeds = pickN(medicationPool, medCount);
    for (let m = 0; m < selectedMeds.length; m++) {
      const med = selectedMeds[m];
      const isDiscontinued = Math.random() < 0.15;
      const isPRN = med.frequency.includes('PRN');
      await prisma.chartMedication.create({
        data: {
          patientId: patient.id,
          name: med.name,
          dosage: med.dosage,
          route: med.route,
          frequency: med.frequency,
          status: isDiscontinued ? 'Discontinued' : isPRN ? 'PRN' : 'Active',
          startDate: admitDate,
          endDate: isDiscontinued ? hoursAgo(randomInt(1, 48)) : null,
          orderedBy: physician,
          notes: isDiscontinued ? pick(['Patient developed adverse reaction', 'No longer indicated', 'Switched to alternative']) : null,
        },
      });
    }

    // --- Orders ---
    const orderCount = randomInt(2, 5);
    for (let o = 0; o < orderCount; o++) {
      const orderCat = pick(orderTemplates);
      const desc = pick(orderCat.descriptions);
      const roll = Math.random();
      const status = roll < 0.5 ? 'Completed' : roll < 0.85 ? 'Pending' : 'Cancelled';
      const priority = Math.random() < 0.2 ? 'Stat' : Math.random() < 0.4 ? 'Urgent' : 'Routine';
      await prisma.chartOrder.create({
        data: {
          patientId: patient.id,
          orderType: orderCat.orderType,
          description: desc,
          status,
          priority,
          orderedBy: physician,
          orderedAt: hoursAgo(randomInt(1, admitDaysAgo * 24)),
          completedAt: status === 'Completed' ? hoursAgo(randomInt(0, admitDaysAgo * 12)) : null,
        },
      });
    }

    // --- Problems ---
    const problemCount = randomInt(2, 5);
    const admissionProblem = problemsPool.find(pr => p.diagnosis.toLowerCase().includes(pr.name.toLowerCase().split(',')[0]));
    const otherProblems = pickN(problemsPool.filter(pr => pr !== admissionProblem), problemCount - 1);
    const allProblems = admissionProblem ? [admissionProblem, ...otherProblems] : pickN(problemsPool, problemCount);

    for (let pi = 0; pi < allProblems.length; pi++) {
      const prob = allProblems[pi];
      const isActive = pi === 0 || Math.random() > 0.25;
      await prisma.chartProblem.create({
        data: {
          patientId: patient.id,
          name: prob.name,
          icdCode: prob.icdCode,
          status: isActive ? 'Active' : 'Resolved',
          onsetDate: pi === 0 ? admitDate : daysAgo(randomInt(30, 3650)),
          notes: pi === 0 ? `Reason for admission: ${p.diagnosis}` : null,
        },
      });
    }
  }

  // Print summary
  console.log('\n✅ Seeding complete! Summary:');
  console.log('  Patients:', await prisma.chartPatient.count());
  console.log('  Notes:', await prisma.chartNote.count());
  console.log('  Vitals:', await prisma.chartVital.count());
  console.log('  Labs:', await prisma.chartLab.count());
  console.log('  Medications:', await prisma.chartMedication.count());
  console.log('  Orders:', await prisma.chartOrder.count());
  console.log('  Problems:', await prisma.chartProblem.count());
}

main()
  .catch((e) => {
    console.error('Error seeding ChartIQ:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
