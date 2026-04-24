import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function d(daysAgo: number, hour = 8): Date {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 0, 0, 0);
  return date;
}

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  // Clear existing data
  await prisma.patientImage.deleteMany();
  await prisma.chartNote.deleteMany();
  await prisma.vital.deleteMany();
  await prisma.medication.deleteMany();
  await prisma.labResult.deleteMany();
  await prisma.order.deleteMany();
  await prisma.problem.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.user.deleteMany();

  // Users
  const hash = await bcrypt.hash('admin123', 10);
  const demoHash = await bcrypt.hash('demo123', 10);
  await prisma.user.createMany({
    data: [
      { email: 'suarey@gmail.com', password: hash, name: 'Dr. Suarez', role: 'admin', department: 'Administration' },
      { email: 'suareyai@gmail.com', password: hash, name: 'Dr. Suarez', role: 'admin', department: 'Administration' },
      { email: 'demo@chartiq.ai', password: demoHash, name: 'Demo User', role: 'admin', department: 'Administration' },
    ],
  });

  // Patient definitions
  const patientDefs = [
    { firstName: 'James', lastName: 'Morrison', mrn: 'MRN-100001', dob: '1958-03-15', gender: 'Male', room: '401', bed: 'A', dept: 'ICU', dx: 'Acute respiratory failure with sepsis', code: 'Full Code', allergies: 'Penicillin, Sulfa', physician: 'Dr. Sarah Chen', insurance: 'Medicare', diet: 'NPO' },
    { firstName: 'Maria', lastName: 'Rodriguez', mrn: 'MRN-100002', dob: '1972-07-22', gender: 'Female', room: '402', bed: 'B', dept: 'ICU', dx: 'Diabetic ketoacidosis', code: 'Full Code', allergies: 'Latex', physician: 'Dr. Sarah Chen', insurance: 'Blue Cross', diet: 'Diabetic' },
    { firstName: 'Robert', lastName: 'Johnson', mrn: 'MRN-100003', dob: '1965-11-08', gender: 'Male', room: '310', bed: 'A', dept: 'Cardiac', dx: 'Acute STEMI, s/p PCI to LAD', code: 'Full Code', allergies: null, physician: 'Dr. Michael Patel', insurance: 'Aetna', diet: 'Low Sodium' },
    { firstName: 'Dorothy', lastName: 'Williams', mrn: 'MRN-100004', dob: '1945-02-28', gender: 'Female', room: '312', bed: 'A', dept: 'Cardiac', dx: 'Acute decompensated heart failure', code: 'DNR', allergies: 'ACE inhibitors', physician: 'Dr. Michael Patel', insurance: 'Medicare', diet: 'Cardiac' },
    { firstName: 'Thomas', lastName: 'Anderson', mrn: 'MRN-100005', dob: '1970-09-14', gender: 'Male', room: '220', bed: 'A', dept: 'Neuro', dx: 'Acute ischemic stroke, right MCA territory', code: 'Full Code', allergies: 'Codeine', physician: 'Dr. Lisa Huang', insurance: 'United Health', diet: null },
    { firstName: 'Susan', lastName: 'Chen', mrn: 'MRN-100006', dob: '1955-06-03', gender: 'Female', room: '222', bed: 'B', dept: 'Neuro', dx: 'Subarachnoid hemorrhage, Hunt-Hess grade III', code: 'Full Code', allergies: 'Iodine contrast', physician: 'Dr. Lisa Huang', insurance: 'Cigna', diet: null },
    { firstName: 'Michael', lastName: 'Brown', mrn: 'MRN-100007', dob: '1962-12-25', gender: 'Male', room: '510', bed: 'A', dept: 'Oncology', dx: 'Stage IIIB non-small cell lung cancer, chemo cycle 3', code: 'Full Code', allergies: 'Morphine', physician: 'Dr. Jennifer Kim', insurance: 'Blue Shield', diet: null },
    { firstName: 'Linda', lastName: 'Davis', mrn: 'MRN-100008', dob: '1968-04-19', gender: 'Female', room: '512', bed: 'A', dept: 'Oncology', dx: 'Pancreatic adenocarcinoma with liver metastases', code: 'DNR/DNI', allergies: 'Aspirin, NSAIDs', physician: 'Dr. Jennifer Kim', insurance: 'Medicare', diet: null },
    { firstName: 'William', lastName: 'Taylor', mrn: 'MRN-100009', dob: '1978-08-07', gender: 'Male', room: '601', bed: 'A', dept: 'Orthopedics', dx: 'Open reduction internal fixation right femur fracture', code: 'Full Code', allergies: null, physician: 'Dr. David Park', insurance: 'Aetna', diet: 'Regular' },
    { firstName: 'Patricia', lastName: 'Martinez', mrn: 'MRN-100010', dob: '1950-01-30', gender: 'Female', room: '603', bed: 'B', dept: 'Orthopedics', dx: 'Right total hip arthroplasty, POD 2', code: 'Full Code', allergies: 'Vancomycin', physician: 'Dr. David Park', insurance: 'Medicare', diet: null },
    { firstName: 'David', lastName: 'Wilson', mrn: 'MRN-100011', dob: '1975-05-12', gender: 'Male', room: '105', bed: 'A', dept: 'Med-Surg', dx: 'Acute pancreatitis, gallstone etiology', code: 'Full Code', allergies: null, physician: 'Dr. Amanda Lee', insurance: 'Humana', diet: 'NPO' },
    { firstName: 'Barbara', lastName: 'Moore', mrn: 'MRN-100012', dob: '1960-10-04', gender: 'Female', room: '107', bed: 'B', dept: 'Med-Surg', dx: 'Community-acquired pneumonia with parapneumonic effusion', code: 'Full Code', allergies: 'Fluoroquinolones', physician: 'Dr. Amanda Lee', insurance: 'Blue Cross', diet: null },
    { firstName: 'Richard', lastName: 'Jackson', mrn: 'MRN-100013', dob: '1948-07-16', gender: 'Male', room: '403', bed: 'A', dept: 'ICU', dx: 'Massive pulmonary embolism, s/p tPA', code: 'Full Code', allergies: 'Heparin (HIT)', physician: 'Dr. Sarah Chen', insurance: 'Medicare', diet: null },
    { firstName: 'Elizabeth', lastName: 'White', mrn: 'MRN-100014', dob: '1982-03-21', gender: 'Female', room: '109', bed: 'A', dept: 'Med-Surg', dx: 'Crohn disease flare with small bowel obstruction', code: 'Full Code', allergies: 'Metoclopramide', physician: 'Dr. Amanda Lee', insurance: 'Cigna', diet: 'Clear Liquids' },
    { firstName: 'Joseph', lastName: 'Harris', mrn: 'MRN-100015', dob: '1940-12-09', gender: 'Male', room: '314', bed: 'A', dept: 'Cardiac', dx: 'Atrial fibrillation with rapid ventricular response', code: 'DNR', allergies: 'Amiodarone', physician: 'Dr. Michael Patel', insurance: 'Medicare', diet: 'Cardiac' },
    { firstName: 'Margaret', lastName: 'Clark', mrn: 'MRN-100016', dob: '1957-08-14', gender: 'Female', room: '224', bed: 'A', dept: 'Neuro', dx: 'New-onset seizures, brain mass under evaluation', code: 'Full Code', allergies: null, physician: 'Dr. Lisa Huang', insurance: 'United Health', diet: null },
    { firstName: 'Charles', lastName: 'Lewis', mrn: 'MRN-100017', dob: '1973-02-06', gender: 'Male', room: '514', bed: 'B', dept: 'Oncology', dx: 'Acute myeloid leukemia, induction chemotherapy', code: 'Full Code', allergies: 'Sulfa', physician: 'Dr. Jennifer Kim', insurance: 'Aetna', diet: null },
    { firstName: 'Nancy', lastName: 'Robinson', mrn: 'MRN-100018', dob: '1985-11-23', gender: 'Female', room: '111', bed: 'A', dept: 'Med-Surg', dx: 'Acute pyelonephritis with urosepsis', code: 'Full Code', allergies: 'Ciprofloxacin', physician: 'Dr. Amanda Lee', insurance: 'Blue Shield', diet: null },
    { firstName: 'Daniel', lastName: 'Walker', mrn: 'MRN-100019', dob: '1952-06-30', gender: 'Male', room: '605', bed: 'A', dept: 'Orthopedics', dx: 'L4-L5 laminectomy and fusion, POD 1', code: 'Full Code', allergies: 'Gabapentin', physician: 'Dr. David Park', insurance: 'Medicare', diet: null },
    { firstName: 'Karen', lastName: 'Hall', mrn: 'MRN-100020', dob: '1946-09-17', gender: 'Female', room: '404', bed: 'B', dept: 'ICU', dx: 'Acute liver failure, acetaminophen toxicity', code: 'Full Code', allergies: 'Shellfish', physician: 'Dr. Sarah Chen', insurance: 'Medicaid', diet: 'Renal' },
  ];

  const nurses = ['RN Jessica Adams', 'RN Michael Torres', 'RN Amy Foster', 'RN David Kim', 'RN Sarah Murphy'];
  const specialists = ['Dr. Robert Yang (Pulmonology)', 'Dr. Emily Stone (Nephrology)', 'Dr. Mark Rivera (GI)', 'Dr. Anna Schmidt (ID)', 'Dr. James Cooper (Cardiology)'];

  for (const pDef of patientDefs) {
    const admitDays = Math.floor(Math.random() * 5) + 2;
    const patient = await prisma.patient.create({
      data: {
        mrn: pDef.mrn,
        firstName: pDef.firstName,
        lastName: pDef.lastName,
        dateOfBirth: new Date(pDef.dob),
        gender: pDef.gender,
        roomNumber: pDef.room,
        bedNumber: pDef.bed,
        admissionDate: d(admitDays),
        admissionDiagnosis: pDef.dx,
        status: 'admitted',
        allergies: pDef.allergies,
        codeStatus: pDef.code,
        primaryPhysician: pDef.physician,
        insurance: pDef.insurance,
        dietaryRestrictions: pDef.diet,
      },
    });

    // Problems
    const problemSets: Record<string, { name: string; icd: string; notes: string }[]> = {
      ICU: [
        { name: 'Sepsis', icd: 'A41.9', notes: 'Blood cultures pending, on broad-spectrum antibiotics' },
        { name: 'Acute respiratory failure', icd: 'J96.00', notes: 'On mechanical ventilation, FiO2 weaning' },
        { name: 'Acute kidney injury', icd: 'N17.9', notes: 'Cr trending up, nephrology consulted' },
        { name: 'Metabolic acidosis', icd: 'E87.2', notes: 'Gap closing with resuscitation' },
      ],
      Cardiac: [
        { name: 'Acute coronary syndrome', icd: 'I21.9', notes: 'Troponin trending down, on dual antiplatelet' },
        { name: 'Heart failure', icd: 'I50.9', notes: 'BNP elevated, on IV diuresis' },
        { name: 'Hypertension', icd: 'I10', notes: 'BP goal <130/80, adjusting medications' },
        { name: 'Type 2 diabetes mellitus', icd: 'E11.9', notes: 'Sliding scale insulin, A1c 8.2%' },
      ],
      Neuro: [
        { name: 'Acute ischemic stroke', icd: 'I63.9', notes: 'NIHSS improving, on antiplatelet therapy' },
        { name: 'Dysphagia', icd: 'R13.10', notes: 'Failed bedside swallow, NPO, speech therapy consulted' },
        { name: 'Hypertension', icd: 'I10', notes: 'Permissive HTN per stroke protocol' },
      ],
      Oncology: [
        { name: 'Malignant neoplasm', icd: 'C34.90', notes: 'Cycle 3 chemotherapy in progress' },
        { name: 'Neutropenic fever', icd: 'D70.9', notes: 'ANC < 500, on empiric antibiotics' },
        { name: 'Nausea/vomiting', icd: 'R11.2', notes: 'Chemotherapy-induced, on ondansetron' },
        { name: 'Cancer pain', icd: 'G89.3', notes: 'Pain management with PCA morphine' },
      ],
      Orthopedics: [
        { name: 'Fracture', icd: 'S72.001A', notes: 'Post-operative, hardware in place' },
        { name: 'Acute pain', icd: 'G89.11', notes: 'Multimodal pain management' },
        { name: 'DVT prophylaxis', icd: 'Z79.01', notes: 'On enoxaparin, SCDs in place' },
      ],
      'Med-Surg': [
        { name: 'Infection', icd: 'A49.9', notes: 'On IV antibiotics, cultures pending' },
        { name: 'Acute pain', icd: 'R10.9', notes: 'Pain managed with multimodal approach' },
        { name: 'Dehydration', icd: 'E86.0', notes: 'IV fluids running, monitoring I&Os' },
      ],
    };

    const deptProblems = problemSets[pDef.dept] || problemSets['Med-Surg'];
    for (const prob of deptProblems.slice(0, Math.floor(Math.random() * 2) + 3)) {
      await prisma.problem.create({
        data: { patientId: patient.id, name: prob.name, icdCode: prob.icd, status: 'active', onsetDate: d(admitDays), notes: prob.notes },
      });
    }

    // Vitals - Q4H for admission duration
    for (let day = admitDays; day >= 0; day--) {
      for (const hour of [2, 6, 10, 14, 18, 22]) {
        const isICU = pDef.dept === 'ICU';
        await prisma.vital.create({
          data: {
            patientId: patient.id,
            temperature: 97.5 + Math.random() * (isICU ? 4 : 2.5),
            heartRate: Math.floor(70 + Math.random() * (isICU ? 60 : 30)),
            bloodPressureSys: Math.floor(110 + Math.random() * (isICU ? 50 : 30)),
            bloodPressureDia: Math.floor(60 + Math.random() * 25),
            respiratoryRate: Math.floor(14 + Math.random() * (isICU ? 12 : 6)),
            oxygenSat: Math.round((isICU ? 90 + Math.random() * 9 : 94 + Math.random() * 5) * 10) / 10,
            painLevel: Math.floor(Math.random() * (isICU ? 8 : 5)),
            recordedAt: d(day, hour),
            recordedBy: rand(nurses),
          },
        });
      }
    }

    // Medications
    const medSets: Record<string, { name: string; dosage: string; route: string; freq: string }[]> = {
      ICU: [
        { name: 'Norepinephrine', dosage: '0.1 mcg/kg/min', route: 'IV', freq: 'continuous' },
        { name: 'Vancomycin', dosage: '1g', route: 'IV', freq: 'Q12H' },
        { name: 'Piperacillin-Tazobactam', dosage: '4.5g', route: 'IV', freq: 'Q6H' },
        { name: 'Fentanyl', dosage: '25-50 mcg', route: 'IV', freq: 'PRN' },
        { name: 'Propofol', dosage: '20 mcg/kg/min', route: 'IV', freq: 'continuous' },
        { name: 'Pantoprazole', dosage: '40mg', route: 'IV', freq: 'daily' },
        { name: 'Heparin', dosage: '5000 units', route: 'SubQ', freq: 'BID' },
        { name: 'Insulin Regular', dosage: 'per protocol', route: 'IV', freq: 'continuous' },
      ],
      Cardiac: [
        { name: 'Aspirin', dosage: '81mg', route: 'PO', freq: 'daily' },
        { name: 'Clopidogrel', dosage: '75mg', route: 'PO', freq: 'daily' },
        { name: 'Atorvastatin', dosage: '80mg', route: 'PO', freq: 'daily' },
        { name: 'Metoprolol', dosage: '25mg', route: 'PO', freq: 'BID' },
        { name: 'Lisinopril', dosage: '10mg', route: 'PO', freq: 'daily' },
        { name: 'Furosemide', dosage: '40mg', route: 'IV', freq: 'BID' },
        { name: 'Heparin drip', dosage: 'per protocol', route: 'IV', freq: 'continuous' },
      ],
      Neuro: [
        { name: 'Alteplase', dosage: '0.9mg/kg', route: 'IV', freq: 'once' },
        { name: 'Aspirin', dosage: '325mg', route: 'PO', freq: 'daily' },
        { name: 'Atorvastatin', dosage: '40mg', route: 'PO', freq: 'daily' },
        { name: 'Nicardipine', dosage: '5mg/hr', route: 'IV', freq: 'continuous' },
        { name: 'Levetiracetam', dosage: '500mg', route: 'IV', freq: 'BID' },
        { name: 'Pantoprazole', dosage: '40mg', route: 'IV', freq: 'daily' },
      ],
      Oncology: [
        { name: 'Ondansetron', dosage: '4mg', route: 'IV', freq: 'Q8H' },
        { name: 'Dexamethasone', dosage: '4mg', route: 'IV', freq: 'BID' },
        { name: 'Morphine PCA', dosage: '1mg demand, 10min lockout', route: 'IV', freq: 'continuous' },
        { name: 'Filgrastim', dosage: '5mcg/kg', route: 'SubQ', freq: 'daily' },
        { name: 'Fluconazole', dosage: '200mg', route: 'PO', freq: 'daily' },
        { name: 'Pantoprazole', dosage: '40mg', route: 'PO', freq: 'daily' },
        { name: 'Docusate', dosage: '100mg', route: 'PO', freq: 'BID' },
      ],
      Orthopedics: [
        { name: 'Ketorolac', dosage: '15mg', route: 'IV', freq: 'Q6H' },
        { name: 'Oxycodone', dosage: '5mg', route: 'PO', freq: 'Q4H PRN' },
        { name: 'Acetaminophen', dosage: '1000mg', route: 'PO', freq: 'Q6H' },
        { name: 'Enoxaparin', dosage: '40mg', route: 'SubQ', freq: 'daily' },
        { name: 'Cefazolin', dosage: '2g', route: 'IV', freq: 'Q8H' },
        { name: 'Ondansetron', dosage: '4mg', route: 'IV', freq: 'PRN' },
      ],
      'Med-Surg': [
        { name: 'Ceftriaxone', dosage: '1g', route: 'IV', freq: 'daily' },
        { name: 'Azithromycin', dosage: '500mg', route: 'IV', freq: 'daily' },
        { name: 'Acetaminophen', dosage: '650mg', route: 'PO', freq: 'Q6H PRN' },
        { name: 'Ondansetron', dosage: '4mg', route: 'IV', freq: 'Q8H PRN' },
        { name: 'Pantoprazole', dosage: '40mg', route: 'PO', freq: 'daily' },
        { name: 'Heparin', dosage: '5000 units', route: 'SubQ', freq: 'TID' },
      ],
    };

    const meds = medSets[pDef.dept] || medSets['Med-Surg'];
    for (const med of meds.slice(0, Math.floor(Math.random() * 4) + 5)) {
      await prisma.medication.create({
        data: {
          patientId: patient.id, name: med.name, dosage: med.dosage, route: med.route, frequency: med.freq,
          status: 'active', startDate: d(admitDays), orderedBy: pDef.physician!,
        },
      });
    }
    // Add one discontinued med
    await prisma.medication.create({
      data: {
        patientId: patient.id, name: 'Morphine', dosage: '2mg', route: 'IV', frequency: 'Q4H PRN',
        status: 'discontinued', startDate: d(admitDays), endDate: d(admitDays - 1), orderedBy: pDef.physician!, notes: 'Changed to alternative per allergy/preference',
      },
    });

    // Lab Results
    const labSets: { name: string; value: () => string; unit: string; range: string; flagFn: (v: string) => string }[] = [
      { name: 'WBC', value: () => (3 + Math.random() * 18).toFixed(1), unit: 'K/uL', range: '4.5-11.0', flagFn: v => parseFloat(v) > 11 ? (parseFloat(v) > 20 ? 'critical' : 'high') : parseFloat(v) < 4.5 ? 'low' : 'normal' },
      { name: 'Hgb', value: () => (7 + Math.random() * 9).toFixed(1), unit: 'g/dL', range: '12.0-17.5', flagFn: v => parseFloat(v) < 7 ? 'critical' : parseFloat(v) < 12 ? 'low' : 'normal' },
      { name: 'Hct', value: () => (22 + Math.random() * 26).toFixed(1), unit: '%', range: '36-51', flagFn: v => parseFloat(v) < 25 ? 'critical' : parseFloat(v) < 36 ? 'low' : 'normal' },
      { name: 'Plt', value: () => Math.floor(50 + Math.random() * 350).toString(), unit: 'K/uL', range: '150-400', flagFn: v => parseInt(v) < 50 ? 'critical' : parseInt(v) < 150 ? 'low' : 'normal' },
      { name: 'Na', value: () => Math.floor(130 + Math.random() * 15).toString(), unit: 'mEq/L', range: '136-145', flagFn: v => parseInt(v) < 130 ? 'critical' : parseInt(v) < 136 ? 'low' : parseInt(v) > 145 ? 'high' : 'normal' },
      { name: 'K', value: () => (3.0 + Math.random() * 3).toFixed(1), unit: 'mEq/L', range: '3.5-5.0', flagFn: v => parseFloat(v) > 6 ? 'critical' : parseFloat(v) > 5 ? 'high' : parseFloat(v) < 3.5 ? 'low' : 'normal' },
      { name: 'Cl', value: () => Math.floor(95 + Math.random() * 15).toString(), unit: 'mEq/L', range: '98-106', flagFn: v => parseInt(v) < 98 ? 'low' : parseInt(v) > 106 ? 'high' : 'normal' },
      { name: 'CO2', value: () => Math.floor(18 + Math.random() * 12).toString(), unit: 'mEq/L', range: '23-29', flagFn: v => parseInt(v) < 18 ? 'critical' : parseInt(v) < 23 ? 'low' : 'normal' },
      { name: 'BUN', value: () => Math.floor(8 + Math.random() * 50).toString(), unit: 'mg/dL', range: '7-20', flagFn: v => parseInt(v) > 40 ? 'critical' : parseInt(v) > 20 ? 'high' : 'normal' },
      { name: 'Cr', value: () => (0.5 + Math.random() * 3).toFixed(2), unit: 'mg/dL', range: '0.7-1.3', flagFn: v => parseFloat(v) > 3 ? 'critical' : parseFloat(v) > 1.3 ? 'high' : 'normal' },
      { name: 'Glucose', value: () => Math.floor(70 + Math.random() * 200).toString(), unit: 'mg/dL', range: '70-100', flagFn: v => parseInt(v) > 300 ? 'critical' : parseInt(v) > 100 ? 'high' : parseInt(v) < 70 ? 'low' : 'normal' },
      { name: 'Troponin I', value: () => (Math.random() * 5).toFixed(3), unit: 'ng/mL', range: '<0.04', flagFn: v => parseFloat(v) > 1 ? 'critical' : parseFloat(v) > 0.04 ? 'high' : 'normal' },
      { name: 'BNP', value: () => Math.floor(50 + Math.random() * 2000).toString(), unit: 'pg/mL', range: '<100', flagFn: v => parseInt(v) > 500 ? 'critical' : parseInt(v) > 100 ? 'high' : 'normal' },
      { name: 'INR', value: () => (0.8 + Math.random() * 3).toFixed(1), unit: '', range: '0.8-1.1', flagFn: v => parseFloat(v) > 3 ? 'critical' : parseFloat(v) > 1.1 ? 'high' : 'normal' },
      { name: 'PT', value: () => (10 + Math.random() * 15).toFixed(1), unit: 'sec', range: '11-13.5', flagFn: v => parseFloat(v) > 20 ? 'critical' : parseFloat(v) > 13.5 ? 'high' : 'normal' },
      { name: 'Lactate', value: () => (0.5 + Math.random() * 6).toFixed(1), unit: 'mmol/L', range: '0.5-2.0', flagFn: v => parseFloat(v) > 4 ? 'critical' : parseFloat(v) > 2 ? 'high' : 'normal' },
    ];

    for (let day = admitDays; day >= 0; day -= 1) {
      const labsToRun = labSets.slice(0, Math.floor(Math.random() * 6) + 8);
      for (const lab of labsToRun) {
        const val = lab.value();
        await prisma.labResult.create({
          data: {
            patientId: patient.id, testName: lab.name, value: val, unit: lab.unit,
            normalRange: lab.range, flag: lab.flagFn(val),
            collectedAt: d(day, 4), resultAt: d(day, 6),
          },
        });
      }
    }

    // Orders
    const orderTemplates = [
      { type: 'imaging', desc: 'Chest X-ray portable AP', priority: 'routine' },
      { type: 'imaging', desc: 'CT Head without contrast', priority: 'urgent' },
      { type: 'lab', desc: 'CBC, BMP, Magnesium Q6H', priority: 'routine' },
      { type: 'lab', desc: 'Blood cultures x2', priority: 'stat' },
      { type: 'consult', desc: 'Physical Therapy evaluation', priority: 'routine' },
      { type: 'consult', desc: 'Nutrition consult', priority: 'routine' },
      { type: 'diet', desc: 'Cardiac diet, 2g Na restriction', priority: 'routine' },
      { type: 'activity', desc: 'Ambulate TID with assistance', priority: 'routine' },
      { type: 'procedure', desc: 'Central line placement', priority: 'urgent' },
      { type: 'lab', desc: 'Type and screen', priority: 'stat' },
    ];

    for (let i = 0; i < Math.floor(Math.random() * 4) + 4; i++) {
      const tmpl = rand(orderTemplates);
      await prisma.order.create({
        data: {
          patientId: patient.id, orderType: tmpl.type, description: tmpl.desc,
          status: rand(['pending', 'pending', 'completed']), priority: tmpl.priority,
          orderedBy: pDef.physician!, orderedAt: d(Math.floor(Math.random() * admitDays)),
        },
      });
    }

    // Chart Notes - 8-15 per patient
    const noteCount = Math.floor(Math.random() * 8) + 8;
    for (let i = 0; i < noteCount; i++) {
      const dayOffset = Math.floor(Math.random() * admitDays);
      const shift = rand(['day', 'night', 'evening']);
      const hour = shift === 'day' ? 8 + Math.floor(Math.random() * 8) : shift === 'evening' ? 16 + Math.floor(Math.random() * 4) : Math.floor(Math.random() * 6);
      const isPhysician = Math.random() > 0.4;
      const noteType = isPhysician ? rand(['progress', 'consult']) : rand(['nursing', 'nursing', 'handoff']);
      const author = isPhysician ? rand([pDef.physician!, ...specialists]) : rand(nurses);
      const role = isPhysician ? (author === pDef.physician ? 'physician' : 'specialist') : 'nurse';

      // Generate realistic note content based on department and type
      let content = '';
      if (noteType === 'progress') {
        content = generateProgressNote(pDef.dept, pDef.dx, pDef.firstName);
      } else if (noteType === 'nursing') {
        content = generateNursingNote(pDef.dept, pDef.firstName);
      } else if (noteType === 'consult') {
        content = generateConsultNote(pDef.dept, pDef.dx);
      } else {
        content = generateHandoffNote(pDef.dept, pDef.firstName);
      }

      await prisma.chartNote.create({
        data: {
          patientId: patient.id, authorName: author, authorRole: role,
          noteType, shiftType: shift, content, createdAt: d(dayOffset, hour), department: pDef.dept,
        },
      });
    }
  }

  console.log('✅ Seed complete: 3 users, 20 patients with full chart data');
}

function generateProgressNote(dept: string, dx: string, name: string): string {
  const notes: Record<string, string[]> = {
    ICU: [
      `S: Patient ${name} remains intubated and sedated. Hemodynamically improving on vasopressors.\nO: T 101.2°F, HR 98, BP 102/68 on norepinephrine 0.08 mcg/kg/min (weaned from 0.15), RR 16 (vent), SpO2 96% on FiO2 40%. WBC 14.2 (down from 18.6). Lactate 2.1 (down from 4.8). Cr 1.8 (stable). Urine output 35 mL/hr. Blood cultures NGTD.\nA: Sepsis improving on current antibiotic regimen. AKI stage 2, non-oliguric. Respiratory failure - tolerating vent weaning.\nP: Continue Vanc/Zosyn. Wean norepinephrine as tolerated. Spontaneous breathing trial tomorrow if hemodynamically stable. Repeat lactate Q6H. Nephrology following for AKI. Hold diuretics given vasopressor requirement.`,
      `S: No acute events overnight. Fevers resolved. Vasopressors weaned off at 0300.\nO: T 98.8°F, HR 82, BP 118/72 off pressors, RR 14 (PSV 10/5), SpO2 97% on FiO2 35%. WBC 11.4, Lactate 1.2, Cr 1.6 (improving). CXR: bilateral infiltrates improved. Procalcitonin trending down to 1.8.\nA: Sepsis resolving. Improving multiorgan function. Ready for SBT.\nP: Spontaneous breathing trial this AM. If passes, plan extubation. Narrow antibiotics to Zosyn monotherapy. Restart nutrition via OG tube. PT/OT consult for ICU rehabilitation.`,
    ],
    Cardiac: [
      `S: Patient ${name} reports mild chest pressure, improved from yesterday. No dyspnea at rest.\nO: T 98.4°F, HR 68, BP 124/78, RR 16, SpO2 98% on 2L NC. Troponin 0.82 (trending down from peak 4.2). EKG: NSR, ST elevations resolving in V2-V4. Echo: EF 40%, anterior wall hypokinesis. BNP 450.\nA: STEMI s/p PCI to LAD with DES, evolving. Reduced EF likely from acute event. Mild heart failure.\nP: Continue DAPT (ASA + Plavix), atorvastatin 80mg, metoprolol, lisinopril. Strict I&O. Daily weights. Cardiology follow-up in 2 weeks. Cardiac rehab referral. Target LDL < 70. Echocardiography repeat in 6-8 weeks.`,
      `S: Patient feeling much better. Ambulated in hallway x2 without symptoms. Appetite improved.\nO: T 98.6°F, HR 72, BP 128/76, RR 14, SpO2 99% on RA. Troponin 0.12 (near baseline). Repeat EKG: NSR, Q waves V1-V3, no acute ST changes. Daily weight stable.\nA: STEMI status post PCI, recovering well. Hemodynamically stable off supplemental O2.\nP: Transition to oral meds. Discharge planning - target tomorrow. Medications: ASA 81mg, clopidogrel 75mg, atorvastatin 80mg, metoprolol succinate 50mg, lisinopril 10mg. VNA referral for home BP monitoring. Smoking cessation counseling completed.`,
    ],
    Neuro: [
      `S: Patient ${name} with improving left-sided weakness. Speech clearer today. Following commands consistently.\nO: T 98.2°F, HR 76, BP 148/88 (permissive HTN per protocol), NIHSS 8 (improved from 14 on admission). Pupils PERRL 3mm bilaterally. Left arm 3/5, left leg 4/5 strength. CT head: completed right MCA infarct, no hemorrhagic transformation. Swallow eval: passed modified barium swallow for pureed diet.\nA: Acute ischemic stroke, right MCA territory, improving. Large vessel occlusion s/p tPA with partial recanalization.\nP: Continue aspirin 325mg. Permissive hypertension (SBP < 180). Advance diet to purees per SLP. PT/OT/SLP daily. MRA neck and brain pending. Statin initiation. DVT prophylaxis with SCDs (hold anticoagulation 24h post-tPA). Social work for discharge planning - likely rehab facility.`,
    ],
    Oncology: [
      `S: Patient ${name} with nausea and fatigue, expected post-chemo day 3. No fevers, no bleeding.\nO: T 99.1°F, HR 88, BP 110/68, RR 16, SpO2 97% RA. ANC 680 (nadir expected day 7-10). Plt 98K. Hgb 9.2. BMP within normal limits. Patient tolerating clear liquids.\nA: Cycle 3 chemotherapy, post-treatment course as expected. Counts declining but not yet nadir. Mild thrombocytopenia.\nP: Continue antiemetics (ondansetron + dexamethasone). Filgrastim starting tomorrow. Neutropenic precautions. Daily CBC. Transfuse PRBCs if Hgb < 7, platelets if < 10K or active bleeding. Advance diet as tolerated. Continue PCA for pain management.`,
    ],
    Orthopedics: [
      `S: Patient ${name} reports pain 4/10, improved from 7/10 yesterday. Able to dangle legs at bedside.\nO: T 98.6°F, HR 74, BP 132/80, RR 14, SpO2 99% RA. Surgical site clean, dry, intact. No erythema or drainage. Distal pulses 2+ bilaterally. Sensation intact L4-S1 dermatomes. Hgb 10.2 (from 11.8 pre-op).\nA: POD 2 s/p ORIF right femur. Recovering well. Pain controlled on multimodal regimen.\nP: Continue ketorolac (last day), acetaminophen ATC, oxycodone PRN. PT for weight-bearing as tolerated with walker. DVT prophylaxis - enoxaparin 40mg SQ daily. Cefazolin x 24h post-op (discontinue after today's dose). Anticipate discharge POD 3-4 pending PT clearance.`,
    ],
    'Med-Surg': [
      `S: Patient ${name} with improving symptoms. Fever resolved. Cough productive but less frequent.\nO: T 98.8°F, HR 78, BP 126/74, RR 18, SpO2 95% on 2L NC (improved from 4L). WBC 10.2 (down from 16.8). CXR: RLL consolidation slightly improved, small parapneumonic effusion stable. Sputum culture: Streptococcus pneumoniae, sensitive to ceftriaxone.\nA: Community-acquired pneumonia with small parapneumonic effusion, improving on antibiotics.\nP: Continue ceftriaxone + azithromycin (day 3 of planned 7-day course). Wean O2 as tolerated. Incentive spirometry Q1H while awake. Monitor effusion - if enlarges, consider thoracentesis. Target discharge when on RA and afebrile x 48h.`,
    ],
  };
  return rand(notes[dept] || notes['Med-Surg']);
}

function generateNursingNote(dept: string, name: string): string {
  return rand([
    `0700 Assessment: Patient ${name} alert and oriented x3. Respiratory: lungs CTA bilaterally, on 2L NC, SpO2 96%. CV: regular rate and rhythm, no edema noted. GI: abdomen soft, non-tender, bowel sounds present. Neuro: pupils equal, follows commands. Skin: warm, dry, intact, no pressure injuries. IV sites patent, no signs of infiltration. Pain 3/10, managed with current regimen. Patient participated in morning care. Diet: regular, ate 50% of breakfast. Ambulated to bathroom with standby assist. Fall risk precautions in place.`,
    `1500 Nursing Note: Vital signs stable. Patient resting comfortably. Pain assessment: ${Math.floor(Math.random() * 5)}/10, offered PRN pain medication. I&O for shift: Intake 850mL (IV 500mL + PO 350mL), Output 600mL urine. Daily weight: 78.2 kg (stable). All medications administered as scheduled. Lab specimens collected and sent. Patient education provided regarding diagnosis and medications. Family at bedside, updated on plan of care. Call light within reach. Bed in low position, side rails x2 up.`,
    `2300 Night shift assessment: Patient sleeping intermittently. Arousable, oriented x3 when awakened for vitals and meds. Vitals within baseline. SpO2 94-96% on current O2. IV fluids infusing at ordered rate. Pain managed - patient declined PRN at 2100, reports comfortable. No acute complaints. Skin check completed, repositioned to left side. SCDs in place bilaterally. Fall risk score: moderate. Bed alarm activated. Night medications given. Will continue to monitor Q4H.`,
    `1100 Assessment update: Patient ${name} had episode of nausea with emesis x1 (approximately 150mL bilious). Ondansetron 4mg IV given with relief. Vital signs rechecked: stable. Provider notified. Patient resting comfortably after antiemetic. Continuing to monitor. Clear liquid diet offered, patient taking small sips. I&O updated. All other assessments unchanged from morning evaluation.`,
  ]);
}

function generateConsultNote(dept: string, dx: string): string {
  return rand([
    `Consult Note - Infectious Disease\nReason for consult: Assistance with antimicrobial management in setting of ${dx}.\nReview of culture data: Blood cultures x2 drawn on admission, NGTD at 48h. Urine culture: no growth. Sputum culture: pending. Procalcitonin 3.2 (elevated).\nAssessment: Clinical picture consistent with bacterial infection. Empiric coverage appropriate. Recommend continuing current broad-spectrum regimen. De-escalate when culture data available.\nRecommendations:\n1. Continue current antibiotics\n2. Repeat blood cultures if fever recurs\n3. Check C. diff if diarrhea develops\n4. Will follow daily, thank you for this interesting consult`,
    `Consult Note - Nephrology\nReason for consult: Acute kidney injury in setting of ${dx}.\nBaseline Cr 0.9 per outpatient records, now 2.4. Urine studies: FENa 0.8% (prerenal pattern). Urine microscopy: bland sediment, no casts. Renal ultrasound: normal size bilaterally, no hydronephrosis.\nAssessment: AKI, likely prerenal in setting of volume depletion/sepsis. No evidence of intrinsic renal disease or obstruction.\nRecommendations:\n1. Aggressive IV fluid resuscitation\n2. Avoid nephrotoxins (hold NSAIDs, aminoglycosides)\n3. Renally dose all medications\n4. Monitor Cr, urine output closely\n5. Renal replacement therapy unlikely needed at this point\n6. Will follow daily`,
    `Consult Note - Physical Therapy\nEvaluation: Patient evaluated at bedside. Baseline: independent in all ADLs prior to admission. Current status: requiring moderate assistance for transfers, standby assist for ambulation 50 feet with rolling walker. Balance: fair static, poor dynamic. Strength: 4/5 bilateral LE, 4+/5 bilateral UE. Patient motivated and cooperative.\nGoals: Independent transfers, ambulation 200ft with least restrictive device, stair negotiation for home discharge.\nPlan: PT BID for strengthening, balance training, gait training, ADL retraining. Recommend OT evaluation for fine motor and ADL assessment. Anticipate 3-5 days to meet discharge goals. Recommend inpatient rehab if not meeting goals.`,
  ]);
}

function generateHandoffNote(dept: string, name: string): string {
  return `Shift Handoff Note - Patient ${name}
S (Situation): Patient is a ${Math.floor(50 + Math.random() * 30)}-year-old admitted for ${dept === 'ICU' ? 'critical illness requiring ICU-level care' : 'acute management'}. Currently ${rand(['stable', 'improving', 'requiring close monitoring'])}.
B (Background): Admitted ${Math.floor(2 + Math.random() * 5)} days ago. Key history includes ${rand(['hypertension', 'diabetes', 'coronary artery disease', 'COPD', 'chronic kidney disease'])}. ${rand(['No known drug allergies', 'Allergies noted in chart - please verify'])}.
A (Assessment): Overall ${rand(['improving', 'stable with ongoing issues', 'showing signs of improvement'])}. Pain controlled. ${rand(['Afebrile x 24h', 'Low-grade fever this shift', 'Vitals stable all shift'])}. I&O balanced.
R (Recommendation): Continue current plan. ${rand(['Monitor for fever', 'Follow up AM labs', 'PT eval scheduled for morning', 'Pending consult results'])}. ${rand(['May need repeat imaging if symptoms worsen', 'Family meeting scheduled tomorrow', 'Discharge planning initiated'])}. Contact attending if ${rand(['fever > 101.5', 'change in mental status', 'hemodynamic instability', 'acute pain increase'])}.`;
}

main().catch(console.error).finally(() => prisma.$disconnect());
