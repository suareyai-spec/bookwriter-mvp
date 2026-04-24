import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

const firstNames = ['Margaret','Robert','Dorothy','James','Helen','William','Betty','Richard','Patricia','Charles','Barbara','Thomas','Mary','Donald','Ruth','George','Virginia','Edward','Frances','Joseph','Evelyn','Frank','Alice','Harold','Jean','Raymond','Eleanor','Arthur','Doris','Carl','Grace','Walter','Irene','Henry','Lillian','Albert','Florence','Ernest','Mildred','Ralph','Ethel','Lawrence','Gladys','Howard','Edna','Eugene','Hazel','Fred','Martha','Clarence'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores'];
const providers = ['Dr. Sarah Mitchell','Dr. James Rodriguez','Dr. Patricia Chen','Dr. Michael Thompson','Dr. Lisa Patel'];
const states = ['FL','TX','CA','NY','AZ'];
const cities: Record<string,string[]> = { FL:['Miami','Orlando','Tampa'], TX:['Houston','Dallas','Austin'], CA:['Los Angeles','San Diego','Sacramento'], NY:['New York','Buffalo','Albany'], AZ:['Phoenix','Tucson','Scottsdale'] };
const insurances = ['Medicare Advantage - Humana','Medicare Advantage - UnitedHealthcare','Medicare Advantage - Aetna','Medicare FFS','Medicaid - Sunshine Health'];
const pharmacies = ['CVS Pharmacy','Walgreens','Walmart Pharmacy','Rite Aid','Publix Pharmacy'];
const medications = [
  { name:'Metformin',dosage:'500mg',freq:'twice daily',controlled:false },
  { name:'Metformin',dosage:'1000mg',freq:'twice daily',controlled:false },
  { name:'Lisinopril',dosage:'10mg',freq:'once daily',controlled:false },
  { name:'Lisinopril',dosage:'20mg',freq:'once daily',controlled:false },
  { name:'Atorvastatin',dosage:'20mg',freq:'once daily at bedtime',controlled:false },
  { name:'Atorvastatin',dosage:'40mg',freq:'once daily at bedtime',controlled:false },
  { name:'Amlodipine',dosage:'5mg',freq:'once daily',controlled:false },
  { name:'Amlodipine',dosage:'10mg',freq:'once daily',controlled:false },
  { name:'Omeprazole',dosage:'20mg',freq:'once daily before breakfast',controlled:false },
  { name:'Omeprazole',dosage:'40mg',freq:'once daily before breakfast',controlled:false },
  { name:'Levothyroxine',dosage:'50mcg',freq:'once daily on empty stomach',controlled:false },
  { name:'Levothyroxine',dosage:'75mcg',freq:'once daily on empty stomach',controlled:false },
  { name:'Metoprolol Succinate',dosage:'25mg',freq:'once daily',controlled:false },
  { name:'Metoprolol Succinate',dosage:'50mg',freq:'once daily',controlled:false },
  { name:'Losartan',dosage:'50mg',freq:'once daily',controlled:false },
  { name:'Furosemide',dosage:'20mg',freq:'once daily',controlled:false },
  { name:'Furosemide',dosage:'40mg',freq:'once daily',controlled:false },
  { name:'Gabapentin',dosage:'300mg',freq:'three times daily',controlled:false },
  { name:'Sertraline',dosage:'50mg',freq:'once daily',controlled:false },
  { name:'Warfarin',dosage:'5mg',freq:'once daily',controlled:false },
  { name:'Hydrocodone/APAP',dosage:'5/325mg',freq:'every 6 hours as needed',controlled:true,schedule:'II' },
  { name:'Tramadol',dosage:'50mg',freq:'every 6 hours as needed',controlled:true,schedule:'IV' },
  { name:'Alprazolam',dosage:'0.25mg',freq:'twice daily as needed',controlled:true,schedule:'IV' },
  { name:'Zolpidem',dosage:'5mg',freq:'at bedtime as needed',controlled:true,schedule:'IV' },
];

const appointmentTypes = ['New Patient','Follow-up','Urgent','Telehealth','Annual Wellness','Chronic Care'];
const appointmentStatuses = ['Scheduled','Checked-in','In Progress','Completed','No-show','Cancelled'];

const chiefComplaints = ['Annual wellness visit','Follow-up for hypertension','Follow-up for diabetes','Shortness of breath','Chest pain','Back pain','Joint pain','Medication refill','Cough and cold symptoms','Dizziness','Fatigue','Abdominal pain','Headache','Skin rash','Depression follow-up','Weight management','Post-hospital follow-up','Fall risk assessment','Memory concerns','Urinary complaints'];

const icd10Codes = [
  { code:'E11.9', desc:'Type 2 diabetes mellitus without complications' },
  { code:'I10', desc:'Essential hypertension' },
  { code:'E78.5', desc:'Hyperlipidemia, unspecified' },
  { code:'E03.9', desc:'Hypothyroidism, unspecified' },
  { code:'J06.9', desc:'Acute upper respiratory infection' },
  { code:'M54.5', desc:'Low back pain' },
  { code:'K21.0', desc:'GERD with esophagitis' },
  { code:'I25.10', desc:'Atherosclerotic heart disease' },
  { code:'N39.0', desc:'Urinary tract infection' },
  { code:'J44.1', desc:'COPD with acute exacerbation' },
  { code:'F32.1', desc:'Major depressive disorder, moderate' },
  { code:'G47.33', desc:'Obstructive sleep apnea' },
  { code:'I48.91', desc:'Atrial fibrillation, unspecified' },
  { code:'M17.11', desc:'Primary osteoarthritis, right knee' },
  { code:'E66.01', desc:'Morbid obesity due to excess calories' },
];

const cptCodes = [
  { code:'99213', desc:'Office visit, established, low complexity', charge:150 },
  { code:'99214', desc:'Office visit, established, moderate complexity', charge:220 },
  { code:'99215', desc:'Office visit, established, high complexity', charge:310 },
  { code:'99396', desc:'Preventive visit, established, 40-64', charge:280 },
  { code:'99397', desc:'Preventive visit, established, 65+', charge:300 },
  { code:'99490', desc:'Chronic care management, 20 min', charge:65 },
  { code:'99395', desc:'Annual wellness visit', charge:250 },
  { code:'99441', desc:'Telehealth E/M, 5-10 min', charge:50 },
];

const labPanels = [
  { name:'CBC', tests:['WBC','RBC','Hemoglobin','Hematocrit','Platelets','MCV','MCH','MCHC'] },
  { name:'BMP', tests:['Glucose','BUN','Creatinine','Sodium','Potassium','Chloride','CO2','Calcium'] },
  { name:'CMP', tests:['Glucose','BUN','Creatinine','Sodium','Potassium','Chloride','CO2','Calcium','Total Protein','Albumin','Bilirubin','ALP','AST','ALT'] },
  { name:'Lipid Panel', tests:['Total Cholesterol','LDL','HDL','Triglycerides'] },
  { name:'HbA1c', tests:['Hemoglobin A1c'] },
  { name:'TSH', tests:['TSH'] },
  { name:'Urinalysis', tests:['pH','Specific Gravity','Protein','Glucose','Ketones','Blood','Leukocyte Esterase','Nitrites'] },
];

const labNormalRanges: Record<string,{min:number,max:number,unit:string}> = {
  'WBC':{min:4.5,max:11.0,unit:'K/uL'},'RBC':{min:4.0,max:5.5,unit:'M/uL'},'Hemoglobin':{min:12.0,max:17.5,unit:'g/dL'},'Hematocrit':{min:36,max:50,unit:'%'},'Platelets':{min:150,max:400,unit:'K/uL'},'MCV':{min:80,max:100,unit:'fL'},'MCH':{min:27,max:33,unit:'pg'},'MCHC':{min:32,max:36,unit:'g/dL'},
  'Glucose':{min:70,max:100,unit:'mg/dL'},'BUN':{min:7,max:20,unit:'mg/dL'},'Creatinine':{min:0.6,max:1.2,unit:'mg/dL'},'Sodium':{min:136,max:145,unit:'mEq/L'},'Potassium':{min:3.5,max:5.0,unit:'mEq/L'},'Chloride':{min:98,max:106,unit:'mEq/L'},'CO2':{min:23,max:29,unit:'mEq/L'},'Calcium':{min:8.5,max:10.5,unit:'mg/dL'},
  'Total Protein':{min:6.0,max:8.3,unit:'g/dL'},'Albumin':{min:3.5,max:5.5,unit:'g/dL'},'Bilirubin':{min:0.1,max:1.2,unit:'mg/dL'},'ALP':{min:44,max:147,unit:'U/L'},'AST':{min:10,max:40,unit:'U/L'},'ALT':{min:7,max:56,unit:'U/L'},
  'Total Cholesterol':{min:0,max:200,unit:'mg/dL'},'LDL':{min:0,max:100,unit:'mg/dL'},'HDL':{min:40,max:100,unit:'mg/dL'},'Triglycerides':{min:0,max:150,unit:'mg/dL'},
  'Hemoglobin A1c':{min:4.0,max:5.6,unit:'%'},'TSH':{min:0.4,max:4.0,unit:'mIU/L'},
};

const claimStatuses = ['Draft','Submitted','Accepted','Denied','Paid'];
const payers = ['Humana Medicare Advantage','UnitedHealthcare MA','Aetna Medicare','Medicare FFS','Sunshine Medicaid'];

function generateVitals() {
  return JSON.stringify({
    bloodPressureSys: 110 + Math.floor(Math.random() * 50),
    bloodPressureDia: 60 + Math.floor(Math.random() * 30),
    heartRate: 60 + Math.floor(Math.random() * 40),
    temperature: +(97.0 + Math.random() * 2.5).toFixed(1),
    respiratoryRate: 12 + Math.floor(Math.random() * 8),
    oxygenSat: 94 + Math.floor(Math.random() * 6),
    weight: 130 + Math.floor(Math.random() * 100),
    height: 60 + Math.floor(Math.random() * 16),
    bmi: +(20 + Math.random() * 18).toFixed(1),
    painLevel: Math.floor(Math.random() * 6),
  });
}

function generateSOAP(complaint: string) {
  const subjectives: Record<string,string> = {
    'Annual wellness visit': 'Patient presents for annual wellness examination. Reports feeling generally well. Denies chest pain, shortness of breath, or changes in weight. Continues current medications without issues. Asks about flu and pneumonia vaccines.',
    'Follow-up for hypertension': 'Patient returns for blood pressure follow-up. Reports monitoring BP at home with readings averaging 138/82. Occasional headaches in the morning. Denies vision changes or chest pain. Taking Lisinopril as prescribed.',
    'Follow-up for diabetes': 'Patient returns for diabetes management. Reports checking blood sugars regularly, fasting levels 120-150. Occasional numbness in feet. Denies vision changes. Following diabetic diet with occasional lapses.',
  };
  const s = subjectives[complaint] || `Patient presents with ${complaint.toLowerCase()}. Symptoms began approximately 3 days ago. Denies fever, chills, or recent travel. No known sick contacts. Current medications taken as prescribed.`;
  const o = `General: Alert and oriented x3, in no acute distress. HEENT: NCAT, PERRL, oropharynx clear. Neck: Supple, no lymphadenopathy. Lungs: Clear to auscultation bilaterally. Heart: Regular rate and rhythm, no murmurs. Abdomen: Soft, non-tender, non-distended. Extremities: No edema, pulses intact.`;
  const dx = pick(icd10Codes);
  const a = `${dx.code} - ${dx.desc}. Patient presents with ${complaint.toLowerCase()}. Condition is ${pick(['stable','improving','well-controlled','requiring adjustment'])}.`;
  const p = `1. Continue current medications\n2. ${pick(['Recheck in 3 months','Follow up in 6 weeks','Return in 2 weeks','Annual labs ordered'])}\n3. ${pick(['Diet and exercise counseling provided','Medication adjustment discussed','Referral to specialist if no improvement','Patient education materials provided'])}\n4. ${pick(['RTC PRN for worsening symptoms','Call with any concerns','Schedule follow-up before leaving','Labs to be drawn today'])}`;
  return { subjective: s, objective: o, assessment: a, plan: p, diagnoses: JSON.stringify([dx]), procedures: JSON.stringify([pick(cptCodes)]) };
}

function generateLabResults(panel: typeof labPanels[0]) {
  const results: Record<string,{value:number,unit:string,normalRange:string,flag:string}> = {};
  const abnormals: string[] = [];
  panel.tests.forEach(test => {
    const range = labNormalRanges[test];
    if (!range) {
      results[test] = { value: +(Math.random()*10).toFixed(1), unit:'', normalRange:'N/A', flag:'' };
      return;
    }
    const isAbnormal = Math.random() < 0.2;
    let value: number;
    if (isAbnormal) {
      value = Math.random() < 0.5
        ? +(range.min - (range.max - range.min) * (0.1 + Math.random() * 0.3)).toFixed(1)
        : +(range.max + (range.max - range.min) * (0.1 + Math.random() * 0.3)).toFixed(1);
      abnormals.push(test);
    } else {
      value = +(range.min + Math.random() * (range.max - range.min)).toFixed(1);
    }
    results[test] = {
      value,
      unit: range.unit,
      normalRange: `${range.min}-${range.max}`,
      flag: isAbnormal ? (value < range.min ? 'Low' : 'High') : '',
    };
  });
  return { results: JSON.stringify(results), abnormalFlags: JSON.stringify(abnormals) };
}

const messageSubjects = [
  'Prescription refill request','Appointment scheduling question','Lab results inquiry','Medication side effects','Follow-up question from visit',
  'Insurance authorization update','Referral status question','Blood pressure readings','Blood sugar log','Vaccine question',
  'Billing inquiry','Request for medical records','Prior authorization needed','Test results explanation','Appointment cancellation',
];

async function main() {
  console.log('Seeding CoreIQ data...');

  // Create patients
  const patients: { id: string; name: string }[] = [];
  for (let i = 0; i < 55; i++) {
    const fn = pick(firstNames);
    const ln = pick(lastNames);
    const st = pick(states);
    const ct = pick(cities[st]);
    const ins = pick(insurances);
    const pharm = pick(pharmacies);
    const p = await prisma.corePatient.create({
      data: {
        mrn: `MRN${String(100000 + i).padStart(6, '0')}`,
        firstName: fn,
        lastName: ln,
        dateOfBirth: randomDate(new Date('1935-01-01'), new Date('1960-12-31')),
        gender: pick(['Male','Female']),
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}${i}@email.com`,
        phone: `(${305 + Math.floor(Math.random()*600)}) ${String(Math.floor(Math.random()*900)+100)}-${String(Math.floor(Math.random()*9000)+1000)}`,
        address: `${100 + Math.floor(Math.random()*9900)} ${pick(['Oak','Maple','Pine','Cedar','Elm','Palm','Sunset','Main'])} ${pick(['St','Ave','Blvd','Dr','Ln'])}`,
        city: ct, state: st, zip: String(10000 + Math.floor(Math.random()*90000)),
        ssn: `***-**-${String(1000 + Math.floor(Math.random()*9000))}`,
        maritalStatus: pick(['Married','Widowed','Single','Divorced']),
        language: pick(['English','Spanish','English','English']),
        race: pick(['White','Black','Hispanic','Asian','Other']),
        ethnicity: pick(['Non-Hispanic','Hispanic']),
        emergencyContactName: `${pick(firstNames)} ${ln}`,
        emergencyContactPhone: `(${305 + Math.floor(Math.random()*600)}) ${String(Math.floor(Math.random()*900)+100)}-${String(Math.floor(Math.random()*9000)+1000)}`,
        insuranceName: ins,
        insuranceId: `INS${String(Math.floor(Math.random()*9000000)+1000000)}`,
        insuranceGroup: `GRP${String(Math.floor(Math.random()*90000)+10000)}`,
        pharmacyName: pharm,
        pharmacyPhone: `(${305 + Math.floor(Math.random()*600)}) ${String(Math.floor(Math.random()*900)+100)}-${String(Math.floor(Math.random()*9000)+1000)}`,
        pharmacyAddress: `${100 + Math.floor(Math.random()*9900)} ${pick(['Commercial','Market','Central','First','Second'])} ${pick(['St','Ave','Blvd'])}`,
        status: Math.random() < 0.9 ? 'Active' : pick(['Inactive','Deceased']),
      },
    });
    patients.push({ id: p.id, name: `${fn} ${ln}` });
  }
  console.log(`Created ${patients.length} patients`);

  // Create appointments
  const now = new Date();
  const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const twoWeeksAhead = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  for (let i = 0; i < 220; i++) {
    const apptDate = randomDate(monthAgo, twoWeeksAhead);
    const isPast = apptDate < now;
    const hour = 8 + Math.floor(Math.random() * 9);
    const min = pick([0, 15, 30, 45]);
    let status: string;
    if (isPast) {
      status = pick(['Completed','Completed','Completed','Completed','No-show','Cancelled']);
    } else {
      status = pick(['Scheduled','Scheduled','Scheduled','Checked-in']);
    }
    const pat = pick(patients);
    await prisma.coreAppointment.create({
      data: {
        patientId: pat.id,
        providerName: pick(providers),
        date: apptDate,
        time: `${String(hour).padStart(2,'0')}:${String(min).padStart(2,'0')}`,
        duration: pick([15, 30, 30, 30, 45, 60]),
        type: pick(appointmentTypes),
        status,
        reason: pick(chiefComplaints),
        notes: Math.random() < 0.3 ? 'Patient requested early morning slot' : null,
        roomNumber: Math.random() < 0.5 ? `Room ${Math.floor(Math.random()*10)+1}` : null,
      },
    });
  }
  console.log('Created 220 appointments');

  // Create encounters
  const encounterIds: string[] = [];
  for (let i = 0; i < 110; i++) {
    const pat = pick(patients);
    const complaint = pick(chiefComplaints);
    const soap = generateSOAP(complaint);
    const enc = await prisma.coreEncounter.create({
      data: {
        patientId: pat.id,
        providerName: pick(providers),
        date: randomDate(monthAgo, now),
        chiefComplaint: complaint,
        subjective: soap.subjective,
        objective: soap.objective,
        assessment: soap.assessment,
        plan: soap.plan,
        vitals: generateVitals(),
        diagnoses: soap.diagnoses,
        procedures: soap.procedures,
        status: pick(['Signed','Signed','Signed','In Progress','Addendum']),
        visitType: pick(['Office Visit','Telehealth','Annual Wellness','Follow-up']),
      },
    });
    encounterIds.push(enc.id);
  }
  console.log('Created 110 encounters');

  // Create prescriptions
  for (let i = 0; i < 160; i++) {
    const med = pick(medications);
    const pat = pick(patients);
    const prescribed = randomDate(new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), now);
    const exp = new Date(prescribed.getTime() + 365 * 24 * 60 * 60 * 1000);
    await prisma.corePrescription.create({
      data: {
        patientId: pat.id,
        providerName: pick(providers),
        medication: med.name,
        dosage: med.dosage,
        frequency: med.freq,
        duration: pick(['30 days','60 days','90 days']),
        quantity: pick([30, 60, 90]),
        refillsRemaining: Math.floor(Math.random() * 6),
        pharmacy: pick(pharmacies),
        status: pick(['Active','Active','Active','Completed','Discontinued','On Hold']),
        controlledSubstance: med.controlled,
        deaSchedule: (med as any).schedule || null,
        prescribedDate: prescribed,
        expirationDate: exp,
      },
    });
  }
  console.log('Created 160 prescriptions');

  // Create lab orders
  for (let i = 0; i < 85; i++) {
    const panel = pick(labPanels);
    const pat = pick(patients);
    const orderDate = randomDate(monthAgo, now);
    const hasResults = Math.random() < 0.7;
    const { results, abnormalFlags } = generateLabResults(panel);
    const statuses = hasResults ? 'Results Available' : pick(['Ordered','Collected','Processing']);
    await prisma.coreLabOrder.create({
      data: {
        patientId: pat.id,
        providerName: pick(providers),
        orderDate,
        tests: JSON.stringify({ panelName: panel.name, tests: panel.tests }),
        status: statuses,
        results: hasResults ? results : null,
        resultDate: hasResults ? new Date(orderDate.getTime() + (1 + Math.random() * 3) * 24 * 60 * 60 * 1000) : null,
        abnormalFlags: hasResults ? abnormalFlags : null,
        priority: pick(['Routine','Routine','Routine','STAT','Urgent']),
        fasting: panel.name === 'Lipid Panel' || panel.name === 'BMP' || panel.name === 'CMP',
      },
    });
  }
  console.log('Created 85 lab orders');

  // Create claims
  for (let i = 0; i < 65; i++) {
    const pat = pick(patients);
    const encId = encounterIds.length > 0 ? pick(encounterIds) : null;
    const cpt = pick(cptCodes);
    const dx = pick(icd10Codes);
    const status = pick(claimStatuses);
    const charge = cpt.charge + Math.floor(Math.random() * 100);
    const paid = status === 'Paid' ? charge * (0.6 + Math.random() * 0.35) : status === 'Accepted' ? charge * 0.8 : 0;
    const adj = status === 'Paid' || status === 'Accepted' ? charge - paid : 0;
    await prisma.coreClaim.create({
      data: {
        patientId: pat.id,
        encounterId: encId,
        dateOfService: randomDate(monthAgo, now),
        diagnoses: JSON.stringify([dx]),
        procedures: JSON.stringify([cpt]),
        totalCharge: charge,
        status,
        payer: pick(payers),
        payerClaimId: status !== 'Draft' ? `CLM${String(Math.floor(Math.random()*9000000)+1000000)}` : null,
        paidAmount: +paid.toFixed(2),
        adjustments: +adj.toFixed(2),
        patientBalance: +(charge - paid - adj).toFixed(2),
        submittedDate: status !== 'Draft' ? randomDate(monthAgo, now) : null,
        paidDate: status === 'Paid' ? randomDate(monthAgo, now) : null,
      },
    });
  }
  console.log('Created 65 claims');

  // Create messages
  for (let i = 0; i < 35; i++) {
    const pat = pick(patients);
    const prov = pick(providers);
    const isFromPatient = Math.random() < 0.5;
    await prisma.coreMessage.create({
      data: {
        fromName: isFromPatient ? pat.name : prov,
        fromRole: isFromPatient ? 'Patient' : 'Provider',
        toName: isFromPatient ? prov : pat.name,
        toRole: isFromPatient ? 'Provider' : 'Patient',
        patientId: pat.id,
        subject: pick(messageSubjects),
        body: isFromPatient
          ? `Hello, I wanted to follow up regarding my recent visit. ${pick(['Could you please call me back?','I have a question about my medication.','When should I schedule my next appointment?','I am experiencing some side effects from my new medication.','Please send my lab results when available.'])}`
          : `Dear ${pat.name}, thank you for reaching out. ${pick(['Your lab results look good overall.','I have adjusted your medication as discussed.','Please schedule a follow-up in 2 weeks.','Your referral has been submitted.','Please continue taking your medications as prescribed.'])}`,
        read: Math.random() < 0.6,
        urgent: Math.random() < 0.15,
        category: pick(['Clinical','Administrative','Billing','Prescription','Lab Results']),
        createdAt: randomDate(monthAgo, now),
      },
    });
  }
  console.log('Created 35 messages');

  console.log('CoreIQ seed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
