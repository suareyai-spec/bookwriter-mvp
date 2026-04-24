import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const firstNames = ['James','Mary','Robert','Patricia','John','Jennifer','Michael','Linda','David','Elizabeth','William','Barbara','Richard','Susan','Joseph','Jessica','Thomas','Sarah','Charles','Karen','Christopher','Lisa','Daniel','Nancy','Matthew','Betty','Anthony','Margaret','Mark','Sandra','Donald','Ashley','Steven','Kimberly','Paul','Emily','Andrew','Donna','Joshua','Michelle','Kenneth','Carol','Kevin','Amanda','Brian','Dorothy','George','Melissa','Timothy','Deborah','Ronald','Stephanie','Edward','Rebecca','Jason','Sharon','Jeffrey','Laura','Ryan','Cynthia','Jacob','Kathleen','Gary','Amy','Nicholas','Angela','Eric','Shirley','Jonathan','Anna','Stephen','Brenda','Larry','Pamela','Justin','Emma','Scott','Nicole','Brandon','Helen','Benjamin','Samantha','Samuel','Katherine','Raymond','Christine','Gregory','Debra','Frank','Rachel','Alexander','Carolyn','Patrick','Janet','Jack','Catherine','Dennis','Maria','Jerry','Heather','Tyler','Diane','Aaron','Ruth','Jose','Julie','Adam','Olivia','Nathan','Joyce','Henry','Virginia','Douglas','Victoria','Peter','Kelly','Zachary','Lauren','Kyle','Christina','Noah','Joan','Ethan','Evelyn','Jeremy','Judith','Walter','Megan','Christian','Andrea','Keith','Cheryl','Roger','Hannah','Terry','Jacqueline','Austin','Martha','Sean','Gloria','Gerald','Teresa','Carl','Ann','Harold','Sara','Dylan','Madison','Arthur','Frances','Lawrence','Kathryn','Jordan','Janice','Jesse','Jean','Bryan','Abigail','Billy','Alice','Bruce','Judy','Gabriel','Sophia','Joe','Grace','Logan','Denise','Albert','Amber','Willie','Doris','Alan','Marilyn','Eugene','Danielle','Russell','Beverly','Vincent','Isabella','Philip','Theresa','Bobby','Diana','Johnny','Natalie','Bradley','Brittany','Roy','Charlotte','Ralph','Marie','Wayne','Kayla','Elijah','Alexis','Randy','Lori'];
const lastNames = ['Smith','Johnson','Williams','Brown','Jones','Garcia','Miller','Davis','Rodriguez','Martinez','Hernandez','Lopez','Gonzalez','Wilson','Anderson','Thomas','Taylor','Moore','Jackson','Martin','Lee','Perez','Thompson','White','Harris','Sanchez','Clark','Ramirez','Lewis','Robinson','Walker','Young','Allen','King','Wright','Scott','Torres','Nguyen','Hill','Flores','Green','Adams','Nelson','Baker','Hall','Rivera','Campbell','Mitchell','Carter','Roberts','Gomez','Phillips','Evans','Turner','Diaz','Parker','Cruz','Edwards','Collins','Reyes','Stewart','Morris','Morales','Murphy','Cook','Rogers','Gutierrez','Ortiz','Morgan','Cooper','Peterson','Bailey','Reed','Kelly','Howard','Ramos','Kim','Cox','Ward','Richardson','Watson','Brooks','Chavez','Wood','James','Bennett','Gray','Mendoza','Ruiz','Hughes','Price','Alvarez','Castillo','Sanders','Patel','Myers','Long','Ross','Foster','Jimenez','Powell','Jenkins','Perry','Russell','Sullivan','Bell','Coleman','Butler','Henderson','Barnes','Gonzales','Fisher','Vasquez','Simmons','Medina','Fox','Jordan','Patterson','Alexander','Hamilton','Graham','Reynolds','Griffin','Wallace','West','Cole','Hayes','Bryant','Herrera','Gibson','Ellis','Tran','Dunn','Murray','Ford','Owens','McDonald','Harrison','Dixon','Hunt','Palmer','Robertson','Black','Holmes','Stone','Meyer','Boyd','Mills','Warren','Daniels','Ferguson','Burns','Spencer'];
const healthPlans = ['Simply Health','Sunshine Health','Humana','Florida Blue','WellCare'];
const healthPlanWeights = [35, 30, 15, 12, 8];
const lobs = ['Medicare','Medicaid','Commercial','FFS'];
const lobWeights = [45, 30, 20, 5];
const medicalCenters = ['KOSIQ Primary - Coral Gables','KOSIQ Primary - Aventura','KOSIQ Primary - Kendall','KOSIQ Primary - Hialeah','KOSIQ Primary - Doral','KOSIQ Specialty - Brickell','KOSIQ Specialty - Miami Beach','KOSIQ Urgent Care - Homestead','KOSIQ Pediatrics - Pembroke Pines','KOSIQ Geriatrics - Hollywood'];
const pcpNames = ['Dr. Maria Santos','Dr. James Chen','Dr. Patricia Williams','Dr. Robert Kumar','Dr. Angela Martinez','Dr. David Thompson','Dr. Lisa Park','Dr. Michael Brown','Dr. Sarah Johnson','Dr. Kevin Lee','Dr. Rachel Green','Dr. Thomas Wilson','Dr. Jennifer Adams','Dr. Carlos Rivera','Dr. Nicole Taylor'];
const conditions = ['Type 2 Diabetes','Hypertension','Congestive Heart Failure','COPD','Chronic Kidney Disease','Obesity','Major Depressive Disorder','Atrial Fibrillation','Coronary Artery Disease','Asthma','Hyperlipidemia','Osteoarthritis','Anxiety Disorder','Hypothyroidism','GERD','Chronic Pain Syndrome','Sleep Apnea','Peripheral Neuropathy','Anemia','Osteoporosis'];
const hospitals = ['Jackson Memorial Hospital','Baptist Health South Florida','Mount Sinai Miami Beach','Aventura Hospital','Memorial Regional Hospital','Mercy Hospital','South Miami Hospital','Homestead Hospital','Kendall Regional Medical Center','Palmetto General Hospital'];
const providerNames = ['Miami Primary Care Associates','South Florida Specialists','Coral Gables Medical Group','Aventura Health Center','Dade County Internal Medicine','Biscayne Pharmacy','CVS Pharmacy','Walgreens','LabCorp South','Quest Diagnostics','Miami Imaging Center','Advanced Radiology','Palm Beach Orthopedics','Broward Cardiology','South Beach Neurology'];
const diagnosisCodes = ['E11.9','I10','I50.9','J44.1','N18.3','E66.01','F32.1','I48.91','I25.10','J45.20','E78.5','M17.11','F41.1','E03.9','K21.0','G89.29','G47.33','G62.9','D64.9','M81.0'];
const procedureCodes = ['99213','99214','99215','99283','99284','99285','99291','99232','99233','99238','90834','90837','97110','97140','70553','71046','73721','74177','80053','85025'];

// Pharmacy data
const brandDrugs = [
  { name: 'Dupixent INJ 300/2ML', avgCost: 2480 },
  { name: 'Imbruvica CAP 140MG', avgCost: 15200 },
  { name: 'Eliquis TAB 5MG', avgCost: 640 },
  { name: 'Ozempic INJ 2MG/3ML', avgCost: 720 },
  { name: 'Jardiance TAB 25MG', avgCost: 580 },
  { name: 'Xarelto TAB 20MG', avgCost: 550 },
  { name: 'Entresto TAB 97/103MG', avgCost: 620 },
  { name: 'Trulicity INJ 1.5MG/0.5ML', avgCost: 680 },
  { name: 'Biktarvy TAB', avgCost: 3500 },
  { name: 'Vyndamax CAP 61MG', avgCost: 4300 },
  { name: 'Farxiga TAB 10MG', avgCost: 560 },
  { name: 'Humira INJ 40MG/0.8ML', avgCost: 2900 },
  { name: 'Keytruda INJ 100MG/4ML', avgCost: 10200 },
  { name: 'Trodelvy SOL 180MG', avgCost: 9620 },
  { name: 'Mekinist TAB 0.5MG', avgCost: 7480 },
];
const genericDrugs = [
  { name: 'Metformin TAB 1000MG', avgCost: 12 },
  { name: 'Lisinopril TAB 20MG', avgCost: 8 },
  { name: 'Amlodipine TAB 10MG', avgCost: 10 },
  { name: 'Atorvastatin TAB 40MG', avgCost: 15 },
  { name: 'Omeprazole CAP 20MG', avgCost: 11 },
  { name: 'Metoprolol TAB 50MG', avgCost: 9 },
  { name: 'Gabapentin CAP 300MG', avgCost: 14 },
  { name: 'Levothyroxine TAB 100MCG', avgCost: 13 },
  { name: 'Losartan TAB 50MG', avgCost: 10 },
  { name: 'Hydrochlorothiazide TAB 25MG', avgCost: 6 },
  { name: 'Furosemide TAB 40MG', avgCost: 7 },
  { name: 'Prednisone TAB 10MG', avgCost: 5 },
  { name: 'Albuterol INH 90MCG', avgCost: 25 },
  { name: 'Sertraline TAB 100MG', avgCost: 11 },
  { name: 'Clopidogrel TAB 75MG', avgCost: 12 },
  { name: 'Carvedilol TAB 25MG', avgCost: 9 },
  { name: 'Warfarin TAB 5MG', avgCost: 8 },
  { name: 'Glipizide TAB 10MG', avgCost: 7 },
  { name: 'Tamsulosin CAP 0.4MG', avgCost: 10 },
  { name: 'Pantoprazole TAB 40MG', avgCost: 12 },
];

const specialties = ['Gastroenterology','Dermatology','Orthopedic Surgery','Psychology','Nephrology','Speech Therapy','ENT','Ophthalmology','Physical Therapy','Occupational Therapy','Cardiology','Pulmonology','Endocrinology','Rheumatology','Urology','Neurology','Oncology','Podiatry','Allergy/Immunology','General Surgery'];
const referralFacilities = ['South Florida Gastro Associates','Miami Dermatology Center','Orthopedic Specialists of FL','Behavioral Health Partners','Kidney Care Center Miami','Speech & Language Center','Miami ENT Associates','Bascom Palmer Eye Institute','PhysioFirst Rehab','OT Solutions Miami','Miami Cardiology Group','Pulmonary Medicine Associates','Diabetes & Endocrine Center','Rheumatology Consultants','Urology Partners FL'];

function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min: number, max: number) { return Math.round((Math.random() * (max - min) + min) * 100) / 100; }
function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function weightedPick<T>(arr: T[], weights: number[]): T {
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < arr.length; i++) { r -= weights[i]; if (r <= 0) return arr[i]; }
  return arr[arr.length - 1];
}
function normalRandom(mean: number, stddev: number) {
  const u1 = Math.random(), u2 = Math.random();
  return Math.round(mean + stddev * Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2));
}

async function main() {
  console.log('Cleaning database...');
  await prisma.pharmacyRecord.deleteMany();
  await prisma.referral.deleteMany();
  await prisma.revenueRecord.deleteMany();
  await prisma.hospitalizationEvent.deleteMany();
  await prisma.aIMonthlyReport.deleteMany();
  await prisma.claim.deleteMany();
  await prisma.riskScore.deleteMany();
  await prisma.eNSEvent.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.report.deleteMany();
  await prisma.dataUpload.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  console.log('Creating organization...');
  const org = await prisma.organization.create({ data: { name: 'KOSIQ Health Partners', type: 'managed_care', state: 'FL', city: 'Miami' } });

  console.log('Creating admin users...');
  const hash = await bcrypt.hash('admin123', 10);
  await prisma.user.create({ data: { email: 'suarey@gmail.com', passwordHash: hash, name: 'David Suarez', role: 'admin', organizationId: org.id } });
  await prisma.user.create({ data: { email: 'suareyai@gmail.com', passwordHash: hash, name: 'Dr. J.D. Suarez', role: 'admin', organizationId: org.id } });

  console.log('Creating 2000 patients...');
  const patients: any[] = [];
  const missingAddress = new Set<number>();
  const missingPhone = new Set<number>();
  // Mark ~5% missing address, ~8% missing phone
  while (missingAddress.size < 100) missingAddress.add(randomInt(0, 1999));
  while (missingPhone.size < 160) missingPhone.add(randomInt(0, 1999));

  for (let i = 0; i < 2000; i++) {
    const gender = Math.random() > 0.48 ? 'M' : 'F';
    const firstName = pick(gender === 'M' ? firstNames.filter((_, idx) => idx % 2 === 0) : firstNames.filter((_, idx) => idx % 2 === 1));
    const lastName = pick(lastNames);
    const age = Math.max(22, Math.min(95, normalRandom(68, 15)));
    const dob = new Date(2026 - age, randomInt(0, 11), randomInt(1, 28));
    const riskScore = Math.max(1, Math.min(100, normalRandom(45, 22)));
    const riskLevel = riskScore <= 25 ? 'Low' : riskScore <= 50 ? 'Medium' : riskScore <= 75 ? 'High' : 'Critical';
    const numConditions = riskLevel === 'Low' ? randomInt(0, 2) : riskLevel === 'Medium' ? randomInt(1, 4) : riskLevel === 'High' ? randomInt(3, 6) : randomInt(4, 8);
    const patientConditions: string[] = [];
    const shuffled = [...conditions].sort(() => Math.random() - 0.5);
    for (let c = 0; c < Math.min(numConditions, shuffled.length); c++) patientConditions.push(shuffled[c]);

    const lob = age >= 65 ? (Math.random() > 0.15 ? 'Medicare' : weightedPick(lobs, lobWeights)) : weightedPick(lobs, lobWeights);
    const mraScore = randomFloat(0.5, 3.5);
    const predictiveRisk30 = riskScore > 70 ? randomFloat(0.4, 0.95) : riskScore > 50 ? randomFloat(0.15, 0.55) : randomFloat(0.02, 0.2);
    const predictiveRisk60 = Math.min(1, predictiveRisk30 * randomFloat(1.1, 1.4));
    const predictiveRisk90 = Math.min(1, predictiveRisk60 * randomFloat(1.05, 1.3));
    const laceScore = riskLevel === 'Critical' ? randomInt(10, 19) : riskLevel === 'High' ? randomInt(6, 14) : riskLevel === 'Medium' ? randomInt(2, 8) : randomInt(0, 4);
    const costForecast6mo = riskLevel === 'Critical' ? randomFloat(30000, 120000) : riskLevel === 'High' ? randomFloat(15000, 50000) : riskLevel === 'Medium' ? randomFloat(5000, 20000) : randomFloat(1000, 8000);

    const p = await prisma.patient.create({
      data: {
        externalId: `KSQ-${String(i + 1).padStart(5, '0')}`,
        firstName, lastName, dob, gender,
        primaryPayer: weightedPick(healthPlans, healthPlanWeights),
        pcpName: pick(pcpNames),
        riskScore, riskLevel,
        conditions: JSON.stringify(patientConditions),
        lob,
        healthPlan: weightedPick(healthPlans, healthPlanWeights),
        medicalCenter: pick(medicalCenters),
        mraScore,
        address: missingAddress.has(i) ? null : `${randomInt(100, 9999)} ${pick(['SW','NW','NE','SE'])} ${randomInt(1, 180)}${pick(['st','nd','rd','th'])} ${pick(['St','Ave','Blvd','Ter','Ct'])}`,
        phone: missingPhone.has(i) ? null : `305-${randomInt(200, 999)}-${String(randomInt(1000, 9999))}`,
        predictiveRisk30,
        predictiveRisk60,
        predictiveRisk90,
        laceScore,
        costForecast6mo,
        organizationId: org.id,
      }
    });
    patients.push({ ...p, riskScore, riskLevel, lob, primaryPayer: p.primaryPayer });
    if ((i + 1) % 500 === 0) console.log(`  ${i + 1} patients created`);
  }

  console.log('Creating claims (~30k)...');
  const claimBatch: any[] = [];
  for (const patient of patients) {
    const monthlyBase = patient.riskLevel === 'Low' ? 1 : patient.riskLevel === 'Medium' ? 2 : patient.riskLevel === 'High' ? 4 : 6;
    for (let month = 0; month < 12; month++) {
      const numClaims = Math.max(1, monthlyBase + randomInt(-1, 1));
      for (let c = 0; c < numClaims; c++) {
        const claimTypes: [string, string, number, number][] = [
          ['PCP Visit', 'PRO', 100, 300], ['Specialist', 'PRO', 150, 500], ['ER', 'OUT', 800, 4000],
          ['Inpatient', 'INP', 5000, 25000], ['Pharmacy', 'PRO', 20, 1200], ['Lab', 'OUT', 50, 350],
          ['Imaging', 'OUT', 200, 1200], ['DME', 'OUT', 75, 800]
        ];
        let weights: number[];
        if (patient.riskLevel === 'Critical') weights = [15, 15, 12, 8, 25, 10, 10, 5];
        else if (patient.riskLevel === 'High') weights = [20, 15, 8, 4, 25, 12, 10, 6];
        else if (patient.riskLevel === 'Medium') weights = [25, 12, 4, 2, 28, 15, 10, 4];
        else weights = [30, 8, 2, 1, 30, 15, 10, 4];
        const totalWeight = weights.reduce((a, b) => a + b, 0);
        let r = Math.random() * totalWeight; let typeIdx = 0;
        for (let w = 0; w < weights.length; w++) { r -= weights[w]; if (r <= 0) { typeIdx = w; break; } }
        const [claimType, expenseType, minCost, maxCost] = claimTypes[typeIdx];
        claimBatch.push({
          patientId: patient.id, claimDate: new Date(2025, month, randomInt(1, 28)),
          claimType, expenseType, providerName: pick(providerNames), payer: patient.primaryPayer,
          amount: randomFloat(minCost, maxCost), diagnosisCode: pick(diagnosisCodes),
          procedureCode: pick(procedureCodes), status: Math.random() > 0.05 ? 'paid' : 'denied',
        });
      }
    }
  }
  const batchSize = 5000;
  for (let i = 0; i < claimBatch.length; i += batchSize) {
    await prisma.claim.createMany({ data: claimBatch.slice(i, i + batchSize) });
    console.log(`  ${Math.min(i + batchSize, claimBatch.length)} / ${claimBatch.length} claims`);
  }

  console.log('Creating ENS events...');
  const highRiskPatients = patients.filter(p => p.riskScore > 50);
  for (let i = 0; i < 300; i++) {
    const patient = pick(highRiskPatients.length > 0 ? highRiskPatients : patients);
    const daysAgo = randomInt(0, 60);
    const admitDate = new Date(2026, 0, 31 - daysAgo, randomInt(0, 23), randomInt(0, 59));
    const discharged = Math.random() > 0.3;
    await prisma.eNSEvent.create({
      data: {
        patientId: patient.id, hospitalName: pick(hospitals),
        admissionType: pick(['ER', 'Inpatient', 'Observation']),
        admitDate, dischargeDate: discharged ? new Date(admitDate.getTime() + randomInt(2, 120) * 3600000) : null,
        diagnosis: pick(['Chest Pain','Acute Abdominal Pain','Shortness of Breath','Syncope','Diabetic Ketoacidosis','COPD Exacerbation','CHF Exacerbation','Pneumonia','Fall with Injury','Acute MI','CVA/Stroke','Sepsis','GI Bleeding','Acute Renal Failure','Atrial Fibrillation with RVR']),
        status: discharged ? 'Discharged' : 'Active',
      }
    });
  }

  console.log('Creating pharmacy records...');
  const rxBatch: any[] = [];
  for (const patient of patients) {
    const numRx = patient.riskLevel === 'Low' ? randomInt(0, 2) : patient.riskLevel === 'Medium' ? randomInt(1, 4) : patient.riskLevel === 'High' ? randomInt(2, 6) : randomInt(3, 8);
    for (let r = 0; r < numRx; r++) {
      const isBrand = Math.random() < 0.15;
      const drug = isBrand ? pick(brandDrugs) : pick(genericDrugs);
      const monthOffset = randomInt(0, 11);
      rxBatch.push({
        patientId: patient.id, drugName: drug.name,
        drugType: isBrand ? 'Brand' : 'Generic',
        rxCount: randomInt(1, 3), totalCost: randomFloat(drug.avgCost * 0.7, drug.avgCost * 1.3),
        prescriberName: patient.pcpName, fillDate: new Date(2025, monthOffset, randomInt(1, 28)),
        organizationId: org.id,
      });
    }
  }
  for (let i = 0; i < rxBatch.length; i += batchSize) {
    await prisma.pharmacyRecord.createMany({ data: rxBatch.slice(i, i + batchSize) });
  }
  console.log(`  ${rxBatch.length} pharmacy records`);

  console.log('Creating referrals...');
  const refBatch: any[] = [];
  for (let i = 0; i < 800; i++) {
    const patient = pick(patients);
    const specialty = pick(specialties);
    refBatch.push({
      patientId: patient.id, referralDate: new Date(2025, randomInt(0, 11), randomInt(1, 28)),
      specialty, fromFacility: patient.medicalCenter || pick(medicalCenters),
      toFacility: pick(referralFacilities), fromProvider: patient.pcpName,
      toProvider: `Dr. ${pick(firstNames)} ${pick(lastNames)}`,
      status: pick(['Open','Completed','Pending','Cancelled']),
      priority: weightedPick(['Routine','Urgent','Stat'], [70, 25, 5]),
      organizationId: org.id,
    });
  }
  await prisma.referral.createMany({ data: refBatch });
  console.log(`  ${refBatch.length} referrals`);

  console.log('Creating revenue records (13 months)...');
  const months13 = ['2025-01','2025-02','2025-03','2025-04','2025-05','2025-06','2025-07','2025-08','2025-09','2025-10','2025-11','2025-12','2026-01'];
  for (const month of months13) {
    const gross = randomFloat(2200000, 3100000);
    const grossMedicare = gross * randomFloat(0.35, 0.45);
    const grossMedicaid = gross * randomFloat(0.40, 0.50);
    const grossCommercial = gross - grossMedicare - grossMedicaid;
    const net = gross * randomFloat(0.92, 0.97);
    await prisma.revenueRecord.create({
      data: {
        month, netRevenue: net, grossRevenue: gross, grossMedicare, grossMedicaid,
        grossCommercial: Math.max(0, grossCommercial),
        mlr: randomFloat(72, 92), mraScore: randomFloat(0.95, 1.35),
        premiumPmpm: randomFloat(1200, 1600), totalExpenses: gross * randomFloat(0.75, 0.90),
        organizationId: org.id,
      }
    });
  }

  console.log('Creating hospitalization events...');
  const hospBatch: any[] = [];
  for (let i = 0; i < 500; i++) {
    const patient = pick(highRiskPatients.length > 0 ? highRiskPatients : patients);
    const monthOffset = randomInt(0, 11);
    const los = randomInt(1, 12);
    const admitDate = new Date(2025, monthOffset, randomInt(1, 25));
    const dischargeDate = new Date(admitDate.getTime() + los * 86400000);
    hospBatch.push({
      patientId: patient.id, admitDate, dischargeDate, los, facility: pick(hospitals),
      diagnosis: pick(['Pneumonia','CHF Exacerbation','COPD Exacerbation','Sepsis','Hip Fracture','Acute MI','Stroke','GI Bleeding','Diabetic Ketoacidosis','UTI/Pyelonephritis','Acute Renal Failure','Cellulitis','DVT/PE','Atrial Fibrillation','Dehydration']),
      diagnosisCode: pick(diagnosisCodes),
      eventType: weightedPick(['Inpatient','ER','Observation'], [50, 35, 15]),
      isAvoidable: Math.random() < 0.25, isReadmission: Math.random() < 0.15,
      isObservation: Math.random() < 0.15, payer: patient.primaryPayer,
      totalCost: randomFloat(3000, 45000), organizationId: org.id,
    });
  }
  await prisma.hospitalizationEvent.createMany({ data: hospBatch });
  console.log(`  ${hospBatch.length} hospitalization events`);

  console.log('Creating monthly reports...');
  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  for (let m = 0; m < 12; m++) {
    const totalCost = randomFloat(2800000, 4200000);
    const erVisits = randomInt(180, 320);
    const admissions = randomInt(60, 140);
    await prisma.report.create({
      data: {
        period: `2025-${String(m + 1).padStart(2, '0')}`, title: `${monthNames[m]} 2025 Monthly Report`,
        organizationId: org.id,
        summary: JSON.stringify({
          totalCostOfCare: totalCost, totalPatients: 2000, highRiskCount: randomInt(280, 430),
          erVisits, hospitalAdmissions: admissions, avgCostPerPatient: Math.round(totalCost / 2000),
          pharmacySpendPct: randomFloat(22, 32), topDiagnosis: 'Type 2 Diabetes (E11.9)',
          aiRecommendations: [
            erVisits > 250 ? 'ER utilization above target. Recommend expanding after-hours PCP access.' : 'ER utilization trending down. Care coordination efforts showing results.',
            `Pharmacy costs ${m > 5 ? 'increased' : 'stable'} — ${m > 5 ? 'review biologic therapy authorizations' : 'generic substitution program effective'}.`,
            admissions > 100 ? 'Hospital readmission rate elevated. Recommend 48-hour post-discharge follow-up.' : 'Readmission rates within target range.',
            'Top 25 high-cost patients account for ~18% of total spend. Focused care management recommended.',
          ],
          executiveSummary: `In ${monthNames[m]} 2025, total cost of care was $${(totalCost / 1000000).toFixed(1)}M across 2,000 managed lives.`,
        }),
      }
    });
  }

  console.log('Creating AI Monthly Reports (6 months)...');
  for (let m = 7; m <= 12; m++) {
    const period = `2025-${String(m).padStart(2, '0')}`;
    const pmpm = randomFloat(1200, 1600);
    const erRate = randomFloat(180, 340);
    const readmitPct = randomFloat(10, 18);
    const mra = randomFloat(0.95, 1.35);
    const unengaged = randomInt(30, 80);
    const hccGaps = randomInt(80, 200);
    const topUtilizers = randomInt(15, 35);
    const savingsProjected = randomInt(200000, 600000);

    const recommendations = JSON.stringify([
      {
        title: `Outreach to ${unengaged} unengaged diabetic patients`,
        description: `${unengaged} patients with HbA1c > 9 have not had an office visit in 90+ days. Targeted outreach could improve control rates and reduce downstream ER/inpatient costs.`,
        priority: 'Critical', impact: `$${(savingsProjected / 1000).toFixed(0)}K projected annual savings`, affectedPatients: unengaged,
      },
      {
        title: `MRA score trending ${mra < 1.1 ? 'down' : 'stable'} — prioritize HCC recapture`,
        description: `${hccGaps} patients have suspected HCC coding gaps based on claims history. Recapture could increase risk-adjusted revenue by $${randomInt(50, 150)}K.`,
        priority: 'High', impact: `$${randomInt(50, 150)}K revenue opportunity`, affectedPatients: hccGaps,
      },
      {
        title: `ER utilization ${erRate > 260 ? 'up' : 'stable'} — care management enrollment recommended`,
        description: `Top ${topUtilizers} frequent ER utilizers account for ${randomInt(20, 35)}% of ER costs. Enrolling in care management could reduce visits by 30-40%.`,
        priority: erRate > 260 ? 'Critical' : 'High', impact: `$${randomInt(80, 200)}K potential savings`, affectedPatients: topUtilizers,
      },
      {
        title: `Pharmacy brand-to-generic conversion opportunity`,
        description: `${randomInt(40, 90)} patients currently on brand medications have generic alternatives available. Conversion could save $${randomInt(15, 45)}K monthly.`,
        priority: 'Medium', impact: `$${randomInt(15, 45)}K monthly savings`, affectedPatients: randomInt(40, 90),
      },
      {
        title: `${randomInt(5, 15)} patients approaching high-cost threshold`,
        description: `These patients are projected to exceed $50,000 in total cost within 60 days. Early intervention with care coordination may prevent cost escalation.`,
        priority: 'High', impact: `$${randomInt(100, 300)}K cost avoidance`, affectedPatients: randomInt(5, 15),
      },
    ]);

    await prisma.aIMonthlyReport.create({
      data: {
        period, title: `${monthNames[m - 1]} 2025 AI Intelligence Report`, organizationId: org.id,
        executiveSummary: `${monthNames[m - 1]} 2025 showed a PMPM of $${pmpm.toFixed(0)} across 2,000 managed lives. ${erRate > 260 ? 'ER utilization increased significantly, requiring immediate attention.' : 'ER utilization remained within acceptable ranges.'} Readmission rate was ${readmitPct.toFixed(1)}%, ${readmitPct > 14 ? 'above' : 'within'} the target of 14%. MRA score averaged ${mra.toFixed(2)}, ${mra < 1.1 ? 'indicating potential revenue leakage from undercoding' : 'reflecting adequate risk capture'}. Pharmacy costs represented ${randomInt(24, 32)}% of total medical spend with generic dispensing rate at ${randomInt(82, 87)}%. Quality metrics showed ${randomInt(3, 8)} HEDIS measure gaps requiring attention. Overall, the practice is ${pmpm < 1400 ? 'performing well financially' : 'experiencing cost pressure'} with opportunities for improvement in ${erRate > 260 ? 'ER diversion' : 'preventive care engagement'} and ${readmitPct > 14 ? 'readmission prevention' : 'chronic disease management'}.`,
        keyMetrics: JSON.stringify({ pmpm, erRate, readmitPct, mra, totalCost: pmpm * 2000, memberCount: 2000, highRiskPct: randomFloat(15, 25) }),
        costDrivers: JSON.stringify({ topCategory: 'Inpatient', inpatientPct: randomFloat(35, 45), pharmacyPct: randomFloat(24, 32), erPct: randomFloat(12, 20), specialistPct: randomFloat(8, 15) }),
        riskAlerts: JSON.stringify({ newHighRisk: randomInt(10, 30), escalatedPatients: randomInt(5, 15), predictedAdmissions: randomInt(8, 25) }),
        qualityGaps: JSON.stringify({ hedisGaps: randomInt(3, 8), awvCompletion: randomFloat(45, 72), diabeticEyeExam: randomFloat(40, 65), mammogramRate: randomFloat(55, 75) }),
        referralPatterns: JSON.stringify({ totalReferrals: randomInt(100, 200), topSpecialty: 'Gastroenterology', avgWaitDays: randomInt(5, 20) }),
        recommendations,
      }
    });
  }

  // ── FraudIQ Seed Data ──
  console.log('Seeding FraudIQ...');
  const fraudAlertTypes = ['Upcoding', 'Unbundling', 'Duplicate Billing', 'Phantom Billing', 'Kickback Patterns'];
  const fraudSeverities = ['Critical', 'High', 'Medium', 'Low'];
  const fraudStatuses = ['Open', 'Investigating', 'Confirmed', 'Dismissed'];
  const fraudProviders = ['Miami Primary Care Associates', 'South Florida Specialists', 'Coral Gables Medical Group', 'Aventura Health Center', 'Dade County Internal Medicine', 'Kendall Family Practice', 'Hialeah Community Health', 'Doral Medical Center', 'Palmetto Bay Clinic', 'Biscayne Medical Group'];

  for (let i = 0; i < 125; i++) {
    await prisma.fraudAlert.create({
      data: {
        claimId: `CLM-2026-${String(10000 + i).slice(1)}`,
        alertType: fraudAlertTypes[i % fraudAlertTypes.length],
        severity: fraudSeverities[i % fraudSeverities.length],
        provider: fraudProviders[i % fraudProviders.length],
        estimatedOverpayment: Math.round(2000 + Math.random() * 65000),
        status: fraudStatuses[i % fraudStatuses.length],
        detectedDate: new Date(2026, (i % 3), 1 + (i % 28)),
      }
    });
  }

  const investigators = ['Sarah Mitchell', 'James Rodriguez', 'Emily Chen', 'Marcus Johnson', 'Lisa Park'];
  const invStatuses = ['Open', 'In Progress', 'Under Review', 'Closed - Confirmed', 'Closed - Dismissed'];
  for (let i = 0; i < 32; i++) {
    await prisma.fraudInvestigation.create({
      data: {
        caseNumber: `FI-2026-${String(100 + i).padStart(4, '0')}`,
        alerts: JSON.stringify([`FA-${i}`, `FA-${i + 1}`]),
        investigator: investigators[i % investigators.length],
        status: invStatuses[i % invStatuses.length],
        findings: i % 3 === 0 ? 'Pattern of systematic upcoding detected' : null,
        recoveryAmount: i % 3 === 0 ? Math.round(8000 + Math.random() * 120000) : 0,
        openDate: new Date(2026, (i % 3), 1 + (i % 28)),
        closeDate: i % 5 >= 3 ? new Date(2026, 2, 1 + (i % 10)) : null,
      }
    });
  }

  // ── ClaimIQ Seed Data ──
  console.log('Seeding ClaimIQ...');
  const claimStatuses = ['Draft', 'Scrubbed', 'Submitted', 'Accepted', 'Denied', 'Paid', 'Appealed'];
  const denialReasons = ['CO-4', 'CO-16', 'CO-97', 'PR-1', 'CO-45', 'CO-50', 'CO-18', 'CO-29'];
  for (let i = 0; i < 310; i++) {
    const status = claimStatuses[i % claimStatuses.length];
    await prisma.claimSubmission.create({
      data: {
        patient: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
        provider: pcpNames[i % pcpNames.length],
        dateOfService: new Date(2026, (i % 3), 1 + (i % 28)),
        cptCodes: JSON.stringify(['99213', '99214', '99215', '36415', '93000'][i % 5] ? [['99213', '99214'][i % 2]] : ['99213']),
        icdCodes: JSON.stringify([diagnosisCodes[i % diagnosisCodes.length]]),
        charges: Math.round(150 + Math.random() * 2500),
        payer: healthPlans[i % healthPlans.length],
        status,
        denialReason: status === 'Denied' ? denialReasons[i % denialReasons.length] : null,
        appealStatus: status === 'Appealed' ? 'Submitted' : null,
        paidAmount: status === 'Paid' ? Math.round(100 + Math.random() * 2000) : 0,
        eraData: status === 'Paid' ? JSON.stringify({ checkNumber: `CHK-${800000 + i}`, postDate: '2026-03-01' }) : null,
      }
    });
  }

  // ── AuthIQ Seed Data ──
  console.log('Seeding AuthIQ...');
  const authStatuses = ['Draft', 'Submitted', 'In Review', 'Approved', 'Denied', 'Expired'];
  const urgencies = ['Routine', 'Urgent', 'Emergent'];
  const authProcedures = ['Knee Replacement (27447)', 'MRI Brain w/wo Contrast (70553)', 'Cardiac Catheterization (93458)', 'CT Abdomen/Pelvis (74177)', 'Spinal Fusion (22633)', 'Hip Replacement (27130)', 'Colonoscopy (45378)', 'PET Scan (78815)'];
  for (let i = 0; i < 85; i++) {
    const status = authStatuses[i % authStatuses.length];
    await prisma.priorAuth.create({
      data: {
        patient: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
        provider: pcpNames[i % pcpNames.length],
        procedure: authProcedures[i % authProcedures.length],
        payer: healthPlans[i % healthPlans.length],
        clinicalJustification: 'Patient meets medical necessity criteria based on clinical evaluation and failed conservative treatment.',
        urgency: urgencies[i % urgencies.length],
        status,
        submitDate: new Date(2026, (i % 3), 1 + (i % 28)),
        decisionDate: status === 'Approved' || status === 'Denied' ? new Date(2026, 2, 1 + (i % 10)) : null,
        authNumber: status === 'Approved' ? `AUTH-${50000 + i}` : null,
        expirationDate: status === 'Approved' ? new Date(2026, 5, 1 + (i % 28)) : null,
        notes: i % 3 === 0 ? 'Peer-to-peer review may be required' : null,
      }
    });
  }

  // ── ComplianceIQ Seed Data ──
  console.log('Seeding ComplianceIQ...');
  const incidentTypes = ['Privacy Breach', 'Security Incident', 'Clinical Error', 'Patient Complaint', 'Workplace Safety', 'Documentation Error', 'Medication Error', 'Policy Violation'];
  const incStatuses = ['Open', 'Under Investigation', 'Corrective Action', 'Resolved', 'Closed'];
  for (let i = 0; i < 42; i++) {
    await prisma.complianceIncident.create({
      data: {
        type: incidentTypes[i % incidentTypes.length],
        severity: fraudSeverities[i % fraudSeverities.length],
        description: ['Unauthorized access to patient records', 'Phishing email opened by staff', 'Incorrect medication dosage', 'Patient billing complaint', 'Slip and fall in hallway', 'Missing consent form', 'Wrong chart pulled', 'Shared login credentials'][i % 8],
        reportedBy: investigators[i % investigators.length],
        reportedDate: new Date(2026, (i % 3), 1 + (i % 28)),
        status: incStatuses[i % incStatuses.length],
        correctiveAction: i % 3 === 0 ? 'Staff re-training, policy update, enhanced monitoring' : null,
        resolvedDate: i % 5 >= 3 ? new Date(2026, 2, 1 + (i % 10)) : null,
      }
    });
  }

  const trainingCategories = ['Privacy', 'Security', 'Compliance', 'Safety', 'Clinical'];
  const trainingTitles = ['HIPAA Privacy Fundamentals', 'HIPAA Security Awareness', 'Fraud, Waste & Abuse Prevention', 'OSHA Bloodborne Pathogens', 'Cultural Competency', 'Emergency Preparedness', 'Anti-Kickback Statute', 'Patient Rights', 'Cybersecurity Best Practices', 'Medicare Documentation', 'Infection Control', 'Social Determinants of Health', 'Stark Law Overview', 'Medication Safety', 'Data Privacy for Front Desk', 'Telehealth Compliance', 'Risk Management Basics', 'Coding Compliance (E/M)', 'Workplace Violence Prevention', 'Advanced HIPAA for IT'];
  for (let i = 0; i < 20; i++) {
    await prisma.complianceTraining.create({
      data: {
        title: trainingTitles[i],
        category: trainingCategories[i % trainingCategories.length],
        dueDate: new Date(2026, 2 + (i % 4), 30),
        completedBy: JSON.stringify(Array.from({ length: Math.round(20 + Math.random() * 30) }, (_, j) => `user-${j}`)),
        required: i % 3 !== 2,
      }
    });
  }

  const auditTypes = ['HIPAA Security', 'Coding Compliance', 'OSHA Workplace Safety', 'Medicare Billing', 'Clinical Quality', 'Privacy Practices', 'Credentialing', 'HIPAA Privacy', 'HEDIS Quality', 'CMS Annual', 'Fire Safety', 'DEA Controlled Substances', 'Lab CLIA', 'IT Security Penetration', 'Pharmacy Audit'];
  const auditors = ['ComplianceFirst LLC', 'MedAudit Group', 'SafeWork Consultants', 'CMS Regional Office', 'NCQA', 'Internal Team', 'CyberShield Inc'];
  for (let i = 0; i < 15; i++) {
    await prisma.complianceAudit.create({
      data: {
        type: auditTypes[i % auditTypes.length],
        date: new Date(2025 + (i > 10 ? 1 : 0), (i % 12), 15),
        auditor: auditors[i % auditors.length],
        findings: JSON.stringify(Array.from({ length: Math.round(Math.random() * 6) }, (_, j) => `Finding ${j + 1}: Minor deficiency`)),
        score: i < 12 ? 80 + Math.round(Math.random() * 20) : null,
        remediationPlan: i % 3 === 0 ? 'Implement corrective actions within 60 days' : null,
        status: i < 12 ? 'Completed' : 'Scheduled',
      }
    });
  }

  const policyCategories = ['Privacy', 'Security', 'Clinical', 'Administrative'];
  const policyTitles = ['Notice of Privacy Practices', 'Information Security Policy', 'Breach Notification Policy', 'Minimum Necessary Standard', 'Password & Access Control', 'Incident Response Plan', 'Clinical Documentation Standards', 'Medication Administration', 'Patient Consent Process', 'Employee Code of Conduct', 'BAA Template', 'Disaster Recovery Plan', 'Telehealth Service Policy', 'Social Media Policy', 'Remote Work Security', 'Whistleblower Protection', 'Hand Hygiene Protocol', 'Data Retention & Destruction', 'Anti-Fraud & Compliance', 'Infection Prevention', 'Medical Records Access', 'Vendor Risk Management', 'Patient Grievance Procedure', 'Lab Specimen Handling', 'Emergency Operations Plan'];
  for (let i = 0; i < 25; i++) {
    await prisma.compliancePolicy.create({
      data: {
        title: policyTitles[i],
        category: policyCategories[i % policyCategories.length],
        version: `${Math.floor(1 + Math.random() * 5)}.${Math.floor(Math.random() * 10)}`,
        content: `This policy establishes guidelines for ${policyTitles[i].toLowerCase()} within the organization.`,
        lastReviewed: new Date(2025, 4 + (i % 8), 15),
        nextReview: new Date(2026, 4 + (i % 8), 15),
        acknowledgedBy: JSON.stringify(Array.from({ length: Math.round(30 + Math.random() * 22) }, (_, j) => `user-${j}`)),
      }
    });
  }

  console.log('Seed complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
