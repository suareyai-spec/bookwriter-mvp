import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// 20 featured patients that will exist across ALL products
const featuredPatients = [
  { firstName: 'Maria', lastName: 'Santos', gender: 'Female', dob: '1958-03-15', riskScore: 87, riskLevel: 'High', conditions: 'Type 2 Diabetes,Hypertension,COPD', lob: 'Medicare', plan: 'Simply Health' },
  { firstName: 'James', lastName: 'Chen', gender: 'Male', dob: '1952-07-22', riskScore: 72, riskLevel: 'High', conditions: 'Congestive Heart Failure,Atrial Fibrillation,Hypertension', lob: 'Medicare', plan: 'Humana' },
  { firstName: 'Patricia', lastName: 'Williams', gender: 'Female', dob: '1960-11-08', riskScore: 65, riskLevel: 'Medium', conditions: 'Type 2 Diabetes,Chronic Kidney Disease,Obesity', lob: 'Medicare', plan: 'Sunshine Health' },
  { firstName: 'Robert', lastName: 'Kumar', gender: 'Male', dob: '1955-01-30', riskScore: 91, riskLevel: 'High', conditions: 'COPD,Coronary Artery Disease,Major Depressive Disorder', lob: 'Medicare', plan: 'Simply Health' },
  { firstName: 'Angela', lastName: 'Martinez', gender: 'Female', dob: '1963-09-12', riskScore: 54, riskLevel: 'Medium', conditions: 'Hypertension,Hyperlipidemia,Anxiety Disorder', lob: 'Medicaid', plan: 'Sunshine Health' },
  { firstName: 'David', lastName: 'Thompson', gender: 'Male', dob: '1948-05-18', riskScore: 83, riskLevel: 'High', conditions: 'Congestive Heart Failure,Type 2 Diabetes,Chronic Kidney Disease', lob: 'Medicare', plan: 'Simply Health' },
  { firstName: 'Lisa', lastName: 'Park', gender: 'Female', dob: '1957-12-25', riskScore: 68, riskLevel: 'Medium', conditions: 'Osteoarthritis,Hypertension,GERD', lob: 'Medicare', plan: 'Florida Blue' },
  { firstName: 'Michael', lastName: 'Brown', gender: 'Male', dob: '1950-08-03', riskScore: 78, riskLevel: 'High', conditions: 'COPD,Sleep Apnea,Obesity,Hypertension', lob: 'Medicare', plan: 'Humana' },
  { firstName: 'Sarah', lastName: 'Johnson', gender: 'Female', dob: '1965-04-20', riskScore: 45, riskLevel: 'Medium', conditions: 'Major Depressive Disorder,Anxiety Disorder,Chronic Pain Syndrome', lob: 'Commercial', plan: 'Florida Blue' },
  { firstName: 'Kevin', lastName: 'Lee', gender: 'Male', dob: '1953-10-07', riskScore: 76, riskLevel: 'High', conditions: 'Coronary Artery Disease,Type 2 Diabetes,Peripheral Neuropathy', lob: 'Medicare', plan: 'WellCare' },
  { firstName: 'Rachel', lastName: 'Green', gender: 'Female', dob: '1961-06-14', riskScore: 42, riskLevel: 'Medium', conditions: 'Hypothyroidism,Osteoporosis,Hypertension', lob: 'Medicare', plan: 'Simply Health' },
  { firstName: 'Thomas', lastName: 'Wilson', gender: 'Male', dob: '1946-02-28', riskScore: 95, riskLevel: 'High', conditions: 'Congestive Heart Failure,COPD,Chronic Kidney Disease,Anemia', lob: 'Medicare', plan: 'Simply Health' },
  { firstName: 'Jennifer', lastName: 'Adams', gender: 'Female', dob: '1959-08-11', riskScore: 58, riskLevel: 'Medium', conditions: 'Type 2 Diabetes,Obesity,Sleep Apnea', lob: 'Medicare', plan: 'Sunshine Health' },
  { firstName: 'Carlos', lastName: 'Rivera', gender: 'Male', dob: '1956-03-04', riskScore: 81, riskLevel: 'High', conditions: 'Coronary Artery Disease,Hypertension,Hyperlipidemia', lob: 'Medicaid', plan: 'Sunshine Health' },
  { firstName: 'Nicole', lastName: 'Taylor', gender: 'Female', dob: '1962-11-19', riskScore: 39, riskLevel: 'Low', conditions: 'Asthma,GERD', lob: 'Commercial', plan: 'Florida Blue' },
  { firstName: 'William', lastName: 'Garcia', gender: 'Male', dob: '1951-07-08', riskScore: 88, riskLevel: 'High', conditions: 'Type 2 Diabetes,Congestive Heart Failure,Atrial Fibrillation', lob: 'Medicare', plan: 'Humana' },
  { firstName: 'Dorothy', lastName: 'Lopez', gender: 'Female', dob: '1947-01-23', riskScore: 92, riskLevel: 'High', conditions: 'COPD,Chronic Kidney Disease,Anemia,Osteoporosis', lob: 'Medicare', plan: 'Simply Health' },
  { firstName: 'Richard', lastName: 'Harris', gender: 'Male', dob: '1954-09-16', riskScore: 71, riskLevel: 'High', conditions: 'Hypertension,Type 2 Diabetes,Major Depressive Disorder', lob: 'Medicare', plan: 'WellCare' },
  { firstName: 'Barbara', lastName: 'Clark', gender: 'Female', dob: '1958-05-30', riskScore: 63, riskLevel: 'Medium', conditions: 'Hypothyroidism,Hypertension,Anxiety Disorder', lob: 'Medicare', plan: 'Simply Health' },
  { firstName: 'Joseph', lastName: 'Rodriguez', gender: 'Male', dob: '1949-12-12', riskScore: 85, riskLevel: 'High', conditions: 'Coronary Artery Disease,Type 2 Diabetes,COPD,Peripheral Neuropathy', lob: 'Medicare', plan: 'Sunshine Health' },
];

const pcpNames = ['Dr. Maria Santos', 'Dr. James Chen', 'Dr. Patricia Williams', 'Dr. Robert Kumar', 'Dr. Angela Martinez'];
const medicalCenters = ['KOSIQ Primary - Coral Gables', 'KOSIQ Primary - Aventura', 'KOSIQ Primary - Kendall', 'KOSIQ Primary - Hialeah', 'KOSIQ Primary - Doral'];
const providers = ['Dr. Sarah Mitchell', 'Dr. James Rodriguez', 'Dr. Patricia Chen', 'Dr. Michael Thompson', 'Dr. Lisa Patel'];
const pharmacies = ['CVS Pharmacy', 'Walgreens', 'Walmart Pharmacy', 'Rite Aid', 'Publix Pharmacy'];
const insurances = ['Medicare Advantage - Humana', 'Medicare Advantage - UnitedHealthcare', 'Medicare Advantage - Aetna', 'Medicare FFS', 'Medicaid - Sunshine Health'];
const hospitals = ['Jackson Memorial Hospital', 'Baptist Health South Florida', 'Mount Sinai Miami Beach', 'Aventura Hospital', 'Memorial Regional Hospital'];
const diagnosisCodes = ['E11.9', 'I10', 'I50.9', 'J44.1', 'N18.3', 'E66.01', 'F32.1', 'I48.91'];
const procedureCodes = ['99213', '99214', '99215', '99283', '99284'];
const healthPlans = ['Simply Health', 'Sunshine Health', 'Humana', 'Florida Blue', 'WellCare'];

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }
function daysAgo(days: number) { return new Date(Date.now() - days * 86400000); }

async function main() {
  console.log('Seeding cross-product connected data for 20 featured patients...');

  // Get the org
  const org = await prisma.organization.findFirst();
  if (!org) { console.error('No organization found. Run main seed first.'); return; }

  for (let i = 0; i < featuredPatients.length; i++) {
    const fp = featuredPatients[i];
    const pcp = pcpNames[i % pcpNames.length];
    const center = medicalCenters[i % medicalCenters.length];
    const provider = providers[i % providers.length];

    console.log(`  Creating ${fp.firstName} ${fp.lastName}...`);

    // 1. Check if Patient (pop health) already exists with this name
    let popPatient = await prisma.patient.findFirst({
      where: { firstName: fp.firstName, lastName: fp.lastName, organizationId: org.id },
    });

    if (!popPatient) {
      popPatient = await prisma.patient.create({
        data: {
          externalId: `FP-${String(1000 + i)}`,
          firstName: fp.firstName,
          lastName: fp.lastName,
          dob: new Date(fp.dob),
          gender: fp.gender,
          primaryPayer: fp.plan,
          pcpName: pcp,
          riskScore: fp.riskScore,
          riskLevel: fp.riskLevel,
          conditions: fp.conditions,
          lob: fp.lob,
          healthPlan: fp.plan,
          medicalCenter: center,
          mraScore: randomFloat(0.85, 1.40),
          predictiveRisk30: randomFloat(0.05, 0.35),
          predictiveRisk60: randomFloat(0.10, 0.45),
          predictiveRisk90: randomFloat(0.15, 0.55),
          laceScore: randomInt(3, 15),
          costForecast6mo: randomFloat(5000, 85000),
          organizationId: org.id,
        },
      });
    }

    // Add risk scores
    for (let j = 0; j < 3; j++) {
      await prisma.riskScore.create({
        data: {
          patientId: popPatient.id,
          score: fp.riskScore + randomInt(-5, 5),
          level: fp.riskLevel,
          factors: fp.conditions,
          calculatedAt: daysAgo(j * 30),
        },
      });
    }

    // Add claims in pop health
    for (let j = 0; j < randomInt(5, 12); j++) {
      await prisma.claim.create({
        data: {
          patientId: popPatient.id,
          claimDate: daysAgo(randomInt(10, 300)),
          claimType: pick(['PRO', 'FAC', 'RX']),
          providerName: pick([pcp, ...providers]),
          payer: fp.plan,
          amount: randomFloat(150, 8500),
          diagnosisCode: pick(diagnosisCodes),
          procedureCode: pick(procedureCodes),
          status: pick(['paid', 'paid', 'paid', 'denied', 'pending']),
          organizationId: org.id,
        },
      });
    }

    // Add pharmacy records
    const meds = ['Metformin TAB 1000MG', 'Lisinopril TAB 20MG', 'Atorvastatin TAB 40MG', 'Amlodipine TAB 10MG', 'Omeprazole CAP 20MG'];
    for (let j = 0; j < randomInt(2, 5); j++) {
      await prisma.pharmacyRecord.create({
        data: {
          patientId: popPatient.id,
          drugName: meds[j % meds.length],
          drugType: 'Generic',
          totalCost: randomFloat(5, 50),
          prescriberName: pcp,
          fillDate: daysAgo(randomInt(5, 90)),
          organizationId: org.id,
        },
      });
    }

    // Add hospitalization events for high-risk patients
    if (fp.riskScore >= 70) {
      for (let j = 0; j < randomInt(1, 3); j++) {
        const admitDate = daysAgo(randomInt(30, 200));
        const los = randomInt(2, 8);
        await prisma.hospitalizationEvent.create({
          data: {
            patientId: popPatient.id,
            admitDate,
            dischargeDate: new Date(admitDate.getTime() + los * 86400000),
            los,
            facility: pick(hospitals),
            diagnosis: pick(['CHF Exacerbation', 'COPD Exacerbation', 'Pneumonia', 'Acute MI', 'Diabetic Ketoacidosis']),
            diagnosisCode: pick(diagnosisCodes),
            eventType: pick(['Inpatient', 'ER', 'Observation']),
            isAvoidable: Math.random() < 0.3,
            isReadmission: Math.random() < 0.2,
            isObservation: false,
            payer: fp.plan,
            totalCost: randomFloat(8000, 45000),
            organizationId: org.id,
          },
        });
      }
    }

    // Add referrals
    for (let j = 0; j < randomInt(1, 3); j++) {
      await prisma.referral.create({
        data: {
          patientId: popPatient.id,
          referralDate: daysAgo(randomInt(10, 120)),
          specialty: pick(['Cardiology', 'Endocrinology', 'Pulmonology', 'Nephrology', 'Gastroenterology']),
          fromFacility: center,
          toFacility: pick(['Miami Cardiology Group', 'Diabetes & Endocrine Center', 'Pulmonary Medicine Associates', 'Kidney Care Center Miami']),
          fromProvider: pcp,
          toProvider: `Dr. ${pick(['Robert', 'Sarah', 'Michael', 'Lisa'])} ${pick(['Anderson', 'Kim', 'Patel', 'Rodriguez'])}`,
          status: pick(['Open', 'Completed', 'Pending']),
          priority: pick(['Routine', 'Urgent']),
          organizationId: org.id,
        },
      });
    }

    // 2. Create matching CoreIQ patient
    let corePatient = await prisma.corePatient.findFirst({
      where: { firstName: fp.firstName, lastName: fp.lastName },
    });

    if (!corePatient) {
      corePatient = await prisma.corePatient.create({
        data: {
          mrn: `MRN${String(200000 + i).padStart(6, '0')}`,
          firstName: fp.firstName,
          lastName: fp.lastName,
          dateOfBirth: new Date(fp.dob),
          gender: fp.gender,
          email: `${fp.firstName.toLowerCase()}.${fp.lastName.toLowerCase()}@email.com`,
          phone: `(305) ${String(randomInt(100, 999))}-${String(randomInt(1000, 9999))}`,
          address: `${randomInt(100, 9999)} ${pick(['Oak', 'Palm', 'Sunset', 'Main', 'Coral'])} ${pick(['St', 'Ave', 'Blvd'])}`,
          city: 'Miami',
          state: 'FL',
          zip: String(33100 + randomInt(0, 99)),
          maritalStatus: pick(['Married', 'Widowed', 'Single', 'Divorced']),
          language: 'English',
          race: pick(['White', 'Black', 'Hispanic', 'Asian']),
          ethnicity: pick(['Non-Hispanic', 'Hispanic']),
          insuranceName: pick(insurances),
          insuranceId: `INS${randomInt(1000000, 9999999)}`,
          insuranceGroup: `GRP${randomInt(10000, 99999)}`,
          pharmacyName: pick(pharmacies),
          status: 'Active',
        },
      });
    }

    // Add encounters
    const chiefComplaints = ['Annual Wellness Visit', 'Follow-up: Diabetes Management', 'Follow-up: Hypertension', 'Chest Pain Evaluation', 'Shortness of Breath', 'Medication Review', 'Lab Results Review'];
    for (let j = 0; j < randomInt(3, 7); j++) {
      await prisma.coreEncounter.create({
        data: {
          patientId: corePatient.id,
          providerName: provider,
          date: daysAgo(randomInt(5, 250)),
          chiefComplaint: chiefComplaints[j % chiefComplaints.length],
          subjective: 'Patient presents for follow-up. Reports compliance with medications.',
          objective: 'VS: BP 138/88, HR 78, T 98.6°F. Exam: NAD, regular rhythm.',
          assessment: fp.conditions.split(',').slice(0, 2).join(', '),
          plan: 'Continue current medications. Follow up in 4-6 weeks. Labs ordered.',
          vitals: JSON.stringify({ bp: '138/88', hr: 78, temp: 98.6, weight: randomInt(150, 220), spo2: randomInt(94, 99) }),
          diagnoses: JSON.stringify(fp.conditions.split(',').slice(0, 3).map(c => c.trim())),
          status: j === 0 ? 'In Progress' : 'Signed',
          visitType: pick(['Office Visit', 'Follow-Up', 'Telehealth', 'Annual Wellness']),
        },
      });
    }

    // Add prescriptions
    const coreMeds = [
      { medication: 'Metformin', dosage: '1000mg', frequency: 'Twice daily' },
      { medication: 'Lisinopril', dosage: '20mg', frequency: 'Once daily' },
      { medication: 'Atorvastatin', dosage: '40mg', frequency: 'Once daily at bedtime' },
      { medication: 'Metoprolol', dosage: '50mg', frequency: 'Twice daily' },
      { medication: 'Omeprazole', dosage: '20mg', frequency: 'Once daily before breakfast' },
    ];
    for (let j = 0; j < randomInt(2, 4); j++) {
      const med = coreMeds[j % coreMeds.length];
      await prisma.corePrescription.create({
        data: {
          patientId: corePatient.id,
          providerName: provider,
          medication: med.medication,
          dosage: med.dosage,
          frequency: med.frequency,
          duration: '90 days',
          quantity: 90,
          refillsRemaining: randomInt(0, 5),
          pharmacy: pick(pharmacies),
          status: 'Active',
          prescribedDate: daysAgo(randomInt(10, 90)),
        },
      });
    }

    // Add lab orders
    const panels = ['Comprehensive Metabolic Panel', 'HbA1c', 'Lipid Panel', 'CBC with Differential', 'Thyroid Panel'];
    for (let j = 0; j < randomInt(1, 3); j++) {
      const panelName = panels[j % panels.length];
      const hasResults = j > 0;
      await prisma.coreLabOrder.create({
        data: {
          patientId: corePatient.id,
          providerName: provider,
          orderDate: daysAgo(randomInt(5, 60)),
          tests: JSON.stringify({ panelName, tests: [panelName] }),
          status: hasResults ? 'Results Available' : 'Ordered',
          results: hasResults ? JSON.stringify({
            Glucose: { value: randomInt(90, 200), unit: 'mg/dL', normalRange: '70-100', flag: randomInt(90, 200) > 100 ? 'H' : null },
            BUN: { value: randomInt(7, 25), unit: 'mg/dL', normalRange: '7-20', flag: null },
            Creatinine: { value: randomFloat(0.7, 1.8), unit: 'mg/dL', normalRange: '0.7-1.3', flag: randomFloat(0.7, 1.8) > 1.3 ? 'H' : null },
          }) : null,
          resultDate: hasResults ? daysAgo(randomInt(1, 5)) : null,
          priority: 'Routine',
        },
      });
    }

    // Add CoreIQ claims
    for (let j = 0; j < randomInt(3, 8); j++) {
      const status = pick(['Paid', 'Paid', 'Paid', 'Denied', 'Submitted', 'Draft']);
      const charge = randomFloat(150, 3500);
      await prisma.coreClaim.create({
        data: {
          patientId: corePatient.id,
          dateOfService: daysAgo(randomInt(10, 200)),
          diagnoses: JSON.stringify(fp.conditions.split(',').slice(0, 2).map(c => c.trim())),
          procedures: JSON.stringify([pick(procedureCodes)]),
          totalCharge: charge,
          status,
          payer: fp.plan,
          paidAmount: status === 'Paid' ? charge * randomFloat(0.6, 0.95) : 0,
          patientBalance: status === 'Paid' ? charge * randomFloat(0.05, 0.15) : 0,
        },
      });
    }

    // 3. Create ClaimIQ submissions for this patient
    const fullName = `${fp.firstName} ${fp.lastName}`;
    const claimStatuses = ['Draft', 'Scrubbed', 'Submitted', 'Accepted', 'Denied', 'Paid', 'Appealed'];
    for (let j = 0; j < randomInt(5, 10); j++) {
      const status = claimStatuses[j % claimStatuses.length];
      await prisma.claimSubmission.create({
        data: {
          patient: fullName,
          provider: pcp,
          dateOfService: daysAgo(randomInt(10, 200)),
          cptCodes: JSON.stringify([pick(procedureCodes)]),
          icdCodes: JSON.stringify([pick(diagnosisCodes)]),
          charges: randomFloat(150, 3000),
          payer: fp.plan,
          status,
          denialReason: status === 'Denied' ? pick(['CO-4', 'CO-16', 'CO-97', 'PR-1']) : null,
          paidAmount: status === 'Paid' ? randomFloat(100, 2500) : 0,
        },
      });
    }

    // 4. Create AuthIQ prior auths
    const authStatuses = ['Submitted', 'In Review', 'Approved', 'Denied'];
    const authProcedures = ['MRI Brain w/wo Contrast (70553)', 'CT Abdomen/Pelvis (74177)', 'Cardiac Catheterization (93458)', 'Colonoscopy (45378)'];
    for (let j = 0; j < randomInt(1, 3); j++) {
      const status = authStatuses[j % authStatuses.length];
      await prisma.priorAuth.create({
        data: {
          patient: fullName,
          provider: pcp,
          procedure: authProcedures[j % authProcedures.length],
          payer: fp.plan,
          clinicalJustification: 'Patient meets medical necessity criteria.',
          urgency: pick(['Routine', 'Urgent']),
          status,
          submitDate: daysAgo(randomInt(5, 60)),
          decisionDate: status === 'Approved' || status === 'Denied' ? daysAgo(randomInt(1, 10)) : null,
          authNumber: status === 'Approved' ? `AUTH-${60000 + i * 10 + j}` : null,
        },
      });
    }
  }

  console.log('Cross-product seed complete! 20 featured patients connected across all products.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
