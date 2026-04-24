import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin users
  const adminPassword = await bcrypt.hash('admin123', 10)
  
  for (const email of ['suareyai@gmail.com', 'suarey@gmail.com', 'drjdsuarez@gmail.com']) {
    await prisma.user.upsert({
      where: { email },
      update: { role: 'admin' },
      create: {
        email,
        password: adminPassword,
        name: 'Dr. JD Suarez',
        credentials: 'MD',
        specialty: 'Internal Medicine',
        role: 'admin',
      },
    })
  }

  // Flagship course
  const course = await prisma.course.upsert({
    where: { slug: 'value-based-care-essentials' },
    update: {
      price: 1500,
      credits: 6.0,
      duration: '6 hours',
      enrollmentCount: 127,
      rating: 4.8,
      longDescription: 'This comprehensive, premium CME course provides primary care physicians with the essential knowledge and skills needed to thrive in value-based care environments. Across six in-depth modules totaling 6 hours of instruction, you will master HCC coding and risk adjustment, quality metrics including HEDIS and Star Ratings, population health strategies, healthcare technology and data analytics, and financial models including shared savings and capitation. Each module features rigorous board-level assessment questions designed to test clinical application, not just rote memorization. Upon successful completion of all modules, you will earn 6.0 AMA PRA Category 1 Credits™ and receive an instant digital certificate.',
    },
    create: {
      title: 'Value-Based Care Essentials for Primary Care Physicians',
      slug: 'value-based-care-essentials',
      description: 'A comprehensive, premium CME course covering the complete transition from fee-for-service to value-based care — risk adjustment, quality metrics, population health, technology, and financial models.',
      longDescription: 'This comprehensive, premium CME course provides primary care physicians with the essential knowledge and skills needed to thrive in value-based care environments. Across six in-depth modules totaling 6 hours of instruction, you will master HCC coding and risk adjustment, quality metrics including HEDIS and Star Ratings, population health strategies, healthcare technology and data analytics, and financial models including shared savings and capitation. Each module features rigorous board-level assessment questions designed to test clinical application, not just rote memorization. Upon successful completion of all modules, you will earn 6.0 AMA PRA Category 1 Credits™ and receive an instant digital certificate.',
      instructor: 'Dr. JD Suarez, MD, FACP',
      instructorBio: 'Dr. JD Suarez is a board-certified internist and Fellow of the American College of Physicians with over 15 years of experience in value-based care delivery, healthcare innovation, and population health management. He has led multiple ACO transformation initiatives across large health systems and serves as a nationally recognized thought leader in VBC strategy, risk adjustment optimization, and healthcare technology integration. Dr. Suarez combines deep clinical expertise with practical business acumen to deliver education that physicians can immediately apply to their practices.',
      price: 1500,
      credits: 6.0,
      creditType: 'AMA PRA Category 1',
      specialty: 'Internal Medicine',
      duration: '6 hours',
      rating: 4.8,
      enrollmentCount: 127,
    },
  })

  // Delete existing modules and questions for this course
  const existingModules = await prisma.module.findMany({ where: { courseId: course.id } })
  for (const m of existingModules) {
    await prisma.question.deleteMany({ where: { moduleId: m.id } })
  }
  await prisma.moduleCompletion.deleteMany({ where: { module: { courseId: course.id } } })
  await prisma.module.deleteMany({ where: { courseId: course.id } })

  // ============ MODULE 1: Introduction to Value-Based Care (10 questions) ============
  const m1 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Introduction to Value-Based Care',
      order: 1,
      videoDuration: '60:00',
      description: 'Understanding the paradigm shift from fee-for-service to value-based care models, including MACRA/MIPS, APMs, ACOs, and bundled payments.',
      content: 'This module provides a comprehensive foundation in value-based care (VBC), exploring the historical context of healthcare payment reform, the key legislative drivers including MACRA and MIPS, and the various alternative payment models transforming American healthcare delivery.',
    },
  })
  await prisma.question.createMany({
    data: [
      {
        moduleId: m1.id, order: 1,
        text: 'Under MACRA, the Merit-based Incentive Payment System (MIPS) adjusts Medicare Part B payments based on performance in four categories. Which of the following is NOT one of the four MIPS performance categories?',
        options: JSON.stringify(['Quality', 'Cost', 'Patient Volume', 'Promoting Interoperability']),
        correctIndex: 2,
        explanation: 'The four MIPS performance categories are Quality (30%), Cost (30%), Improvement Activities (15%), and Promoting Interoperability (25%). Patient volume is not a MIPS category — in fact, MIPS specifically moves away from volume-based metrics.'
      },
      {
        moduleId: m1.id, order: 2,
        text: 'A primary care physician participating in an ACO generates $2.8 million in total cost of care for their attributed panel against a benchmark of $3.0 million. Under a one-sided shared savings model with a 50% sharing rate, what is the maximum shared savings the physician\'s ACO could receive?',
        options: JSON.stringify(['$200,000', '$100,000', '$150,000', '$50,000']),
        correctIndex: 1,
        explanation: 'The savings are $3.0M - $2.8M = $200,000. With a 50% sharing rate in a one-sided model, the ACO would receive up to $100,000. However, actual distributions may be subject to a minimum savings rate (MSR) threshold.'
      },
      {
        moduleId: m1.id, order: 3,
        text: 'Which of the following best describes the Quadruple Aim, which expanded upon the IHI Triple Aim framework?',
        options: JSON.stringify([
          'Better outcomes, lower costs, improved experience, and increased revenue',
          'Better health, better care, lower per capita costs, and improved clinician well-being',
          'Quality metrics, cost reduction, patient satisfaction, and regulatory compliance',
          'Population health, individual care, financial sustainability, and market expansion'
        ]),
        correctIndex: 1,
        explanation: 'The Quadruple Aim adds clinician well-being/work-life balance as the fourth aim to the original Triple Aim (improving patient experience, improving population health, and reducing per capita costs). Clinician burnout was recognized as a critical barrier to achieving the other three aims.'
      },
      {
        moduleId: m1.id, order: 4,
        text: 'In a bundled payment arrangement for total knee replacement, which of the following costs would typically be INCLUDED in the episode-based bundle?',
        options: JSON.stringify([
          'Only the surgeon\'s fee for the procedure',
          'Hospital stay, surgeon fees, anesthesia, rehabilitation, and post-acute care for 90 days',
          'Only inpatient hospital costs during the index admission',
          'The surgeon\'s fee and a single post-operative visit'
        ]),
        correctIndex: 1,
        explanation: 'Bundled payments (e.g., BPCI Advanced) typically encompass all services during a defined episode — including the index hospitalization, physician services, post-acute care (SNF, home health, IRF), and related readmissions within a 90-day episode window.'
      },
      {
        moduleId: m1.id, order: 5,
        text: 'Which statement best distinguishes an Advanced Alternative Payment Model (Advanced APM) from a standard APM under MACRA?',
        options: JSON.stringify([
          'Advanced APMs require participants to use certified EHR technology, bear more than nominal financial risk, and base payment on quality measures',
          'Advanced APMs only apply to hospital-based physicians',
          'Advanced APMs eliminate all fee-for-service payments immediately',
          'Advanced APMs do not require quality reporting'
        ]),
        correctIndex: 0,
        explanation: 'Advanced APMs must meet three criteria: (1) require use of certified EHR technology, (2) provide payment based on quality measures comparable to MIPS, and (3) require participants to bear more than nominal financial risk or be a Medical Home Model. Qualifying participants receive a 5% incentive payment and are exempt from MIPS.'
      },
      {
        moduleId: m1.id, order: 6,
        text: 'A Medicare Shared Savings Program (MSSP) ACO is considering moving from a BASIC track (one-sided risk) to an ENHANCED track (two-sided risk). What is the primary financial implication of this transition?',
        options: JSON.stringify([
          'The ACO will only receive bonus payments with no downside risk',
          'The ACO accepts potential financial losses if spending exceeds the benchmark, but receives a higher sharing rate for savings',
          'The ACO will receive capitated payments instead of fee-for-service',
          'The ACO must reduce its attributed beneficiary count by 50%'
        ]),
        correctIndex: 1,
        explanation: 'Moving to a two-sided risk model means the ACO accepts downside risk — if total cost of care exceeds the benchmark, the ACO must repay a portion of the losses. In return, the sharing rate for savings increases (up to 75% in ENHANCED track vs. up to 50% in one-sided BASIC).'
      },
      {
        moduleId: m1.id, order: 7,
        text: 'Which of the following is the most accurate description of "total cost of care" (TCOC) in a value-based care context?',
        options: JSON.stringify([
          'The sum of all charges billed by a single provider',
          'All allowed amounts for all covered services for an attributed population over a defined period',
          'Only inpatient hospital expenditures for a patient panel',
          'The amount a patient pays out of pocket annually'
        ]),
        correctIndex: 1,
        explanation: 'Total cost of care encompasses all allowed amounts (not charges) for all covered medical and pharmacy services for an attributed patient population over a specific time period. It includes inpatient, outpatient, professional, pharmacy, and post-acute services.'
      },
      {
        moduleId: m1.id, order: 8,
        text: 'In the context of MIPS, a physician receives a final score of 45 out of 100. What is the most likely payment adjustment consequence?',
        options: JSON.stringify([
          'A positive payment adjustment of 45%',
          'No payment adjustment (neutral)',
          'A negative payment adjustment to their Medicare Part B reimbursement',
          'Automatic qualification as an Advanced APM participant'
        ]),
        correctIndex: 2,
        explanation: 'MIPS scores below the performance threshold (which has been set at 75 points in recent years) result in a negative payment adjustment. A score of 45 would be well below this threshold, resulting in a reduction to Medicare Part B payments in the applicable payment year (two years after the performance year).'
      },
      {
        moduleId: m1.id, order: 9,
        text: 'Which of the following care delivery models is characterized by a single organization accepting full financial and clinical accountability for a defined patient population across the entire continuum of care?',
        options: JSON.stringify([
          'Patient-Centered Medical Home (PCMH)',
          'Independent Practice Association (IPA)',
          'Integrated Delivery System / Full-Risk ACO',
          'Preferred Provider Organization (PPO)'
        ]),
        correctIndex: 2,
        explanation: 'An Integrated Delivery System or Full-Risk ACO accepts comprehensive financial and clinical accountability for a population across all care settings. While a PCMH focuses on primary care coordination and an IPA is a physician network structure, the integrated/full-risk model encompasses the complete continuum of care with full downside risk.'
      },
      {
        moduleId: m1.id, order: 10,
        text: 'Under MACRA, what is the primary purpose of the "Improvement Activities" performance category in MIPS?',
        options: JSON.stringify([
          'To measure the volume of procedures performed',
          'To assess clinical practice improvement activities such as care coordination, patient engagement, and population health management',
          'To calculate the total revenue generated per physician',
          'To determine the number of EHR system upgrades completed'
        ]),
        correctIndex: 1,
        explanation: 'The Improvement Activities category (15% of MIPS score) evaluates participation in clinical practice improvement activities across subcategories including expanded practice access, population management, care coordination, beneficiary engagement, patient safety, and participation in an APM.'
      },
    ],
  })

  // ============ MODULE 2: Risk Adjustment & HCC Coding (10 questions) ============
  const m2 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Risk Adjustment & HCC Coding',
      order: 2,
      videoDuration: '60:00',
      description: 'Deep dive into the HCC risk adjustment model, RAF scores, CMS-HCC V28 changes, documentation requirements, and MEAT criteria for accurate coding.',
      content: 'This module covers the critical role of risk adjustment in value-based care, including how HCC coding impacts capitated payments, the transition to CMS-HCC V28, and best practices for accurate clinical documentation.',
    },
  })
  await prisma.question.createMany({
    data: [
      {
        moduleId: m2.id, order: 1,
        text: 'A patient has documented Type 2 diabetes mellitus with diabetic chronic kidney disease, stage 3. Under the CMS-HCC model, which coding principle most accurately captures this clinical scenario?',
        options: JSON.stringify([
          'Code only E11.9 (Type 2 diabetes without complications) since it is the primary diagnosis',
          'Code E11.22 (Type 2 DM with diabetic CKD) and N18.3 (CKD stage 3) to capture both the etiology and manifestation',
          'Code only N18.3 since the kidney disease is the most expensive condition',
          'Code E11.65 (Type 2 DM with hyperglycemia) as it has the highest RAF value'
        ]),
        correctIndex: 1,
        explanation: 'Proper HCC coding requires capturing the full clinical picture with specificity. Coding both the diabetes with CKD complication (E11.22) and the CKD stage (N18.3) accurately reflects the patient\'s condition complexity and maps to appropriate HCC categories, resulting in an accurate RAF score.'
      },
      {
        moduleId: m2.id, order: 2,
        text: 'What does the acronym MEAT stand for in the context of HCC documentation requirements?',
        options: JSON.stringify([
          'Medical Evidence, Assessment, and Treatment',
          'Monitor, Evaluate, Assess, and Treat',
          'Medication, Examination, Analysis, and Therapy',
          'Measure, Educate, Administer, and Track'
        ]),
        correctIndex: 1,
        explanation: 'MEAT stands for Monitor, Evaluate, Assess, and Treat. For an HCC condition to be validly captured for risk adjustment, the clinical documentation must demonstrate that the provider is actively managing the condition through at least one of these four activities during the encounter.'
      },
      {
        moduleId: m2.id, order: 3,
        text: 'Under the CMS-HCC V28 model, which of the following represents a significant change from the V24 model?',
        options: JSON.stringify([
          'All conditions now carry the same RAF weight',
          'Several HCC categories were removed, consolidated, or re-weighted, and new categories for substance use disorders and dementia subtypes were added',
          'RAF scores are no longer used for Medicare Advantage payments',
          'Only inpatient diagnoses count toward risk adjustment'
        ]),
        correctIndex: 1,
        explanation: 'CMS-HCC V28 introduced major changes including removal of some HCCs, consolidation of others, addition of new categories (e.g., substance use disorders, dementia subtypes), and re-weighting of many existing HCCs. The transition from V24 to V28 is being phased in over three years (2024-2026).'
      },
      {
        moduleId: m2.id, order: 4,
        text: 'A Medicare Advantage plan has an attributed member with a RAF score of 1.45. If the county baseline rate is $900 PMPM, what is the approximate expected monthly payment for this member?',
        options: JSON.stringify(['$900', '$1,305', '$621', '$1,800']),
        correctIndex: 1,
        explanation: 'The expected payment is calculated as: County baseline rate × RAF score = $900 × 1.45 = $1,305 PMPM. The RAF score acts as a multiplier on the baseline rate, adjusting payment based on the member\'s documented health status and predicted cost.'
      },
      {
        moduleId: m2.id, order: 5,
        text: 'Which of the following documentation practices would be considered a risk adjustment compliance violation?',
        options: JSON.stringify([
          'Documenting all active chronic conditions with current status at each visit',
          'Adding diagnosis codes to a claim based on historical chart data without a face-to-face encounter addressing the condition',
          'Using the MEAT framework to document chronic condition management',
          'Coding to the highest specificity supported by clinical documentation'
        ]),
        correctIndex: 1,
        explanation: 'Adding diagnosis codes based solely on historical data without addressing the condition during a face-to-face encounter is a compliance violation. Risk adjustment requires that conditions be documented during a valid encounter where the provider monitors, evaluates, assesses, or treats the condition.'
      },
      {
        moduleId: m2.id, order: 6,
        text: 'A patient has both major depression (HCC 59) and congestive heart failure (HCC 85). Under the CMS-HCC model, how are these conditions treated for RAF calculation?',
        options: JSON.stringify([
          'Only the condition with the higher RAF value is counted',
          'Both conditions contribute independently to the RAF score, plus potential disease interaction factors',
          'The two conditions cancel each other out',
          'Only the most recently documented condition counts'
        ]),
        correctIndex: 1,
        explanation: 'The CMS-HCC model is additive — each mapped HCC contributes its coefficient to the RAF score independently. Additionally, certain combinations of conditions trigger disease interaction factors that add further to the RAF score, reflecting the increased complexity and cost of managing multiple comorbidities.'
      },
      {
        moduleId: m2.id, order: 7,
        text: 'In the hierarchical structure of the CMS-HCC model, what happens when a patient has both diabetes with acute complications (HCC 17) and diabetes without complication (HCC 19)?',
        options: JSON.stringify([
          'Both HCCs are counted and their RAF values are summed',
          'Only HCC 17 (higher severity) is counted; HCC 19 is superseded by the hierarchy',
          'Only HCC 19 is counted as the more common condition',
          'The provider must choose which one to report'
        ]),
        correctIndex: 1,
        explanation: 'The "hierarchical" in HCC means that within a disease hierarchy, only the most severe manifestation is counted. HCC 17 (diabetes with acute complications) supersedes HCC 19 (diabetes without complication) in the diabetes hierarchy. This prevents double-counting within the same disease group while ensuring the most severe condition is captured.'
      },
      {
        moduleId: m2.id, order: 8,
        text: 'Which encounter type is NOT acceptable for CMS risk adjustment data submission in Medicare Advantage?',
        options: JSON.stringify([
          'Office visit with face-to-face examination',
          'Inpatient hospital encounter',
          'Telehealth visit with audio-video interaction',
          'Lab result reviewed without a provider-patient encounter'
        ]),
        correctIndex: 3,
        explanation: 'Risk adjustment requires a face-to-face encounter (in-person or via telehealth with audio-video) between the provider and patient. Lab results alone, even if reviewed by a provider, do not constitute an acceptable encounter for risk adjustment data submission. Phone-only encounters are also generally not acceptable.'
      },
      {
        moduleId: m2.id, order: 9,
        text: 'A practice is conducting a retrospective chart review and finds that 35% of patients with documented COPD were coded as J44.1 (COPD with acute exacerbation) during visits where only stable COPD was discussed. What is the appropriate action?',
        options: JSON.stringify([
          'Leave the codes as they generate higher RAF scores',
          'Correct the codes to J44.9 (COPD, unspecified) or appropriate stable COPD code and implement prospective coding education',
          'Delete all COPD codes from affected claims',
          'Report only J44.1 going forward to maintain consistency'
        ]),
        correctIndex: 1,
        explanation: 'Overcoding conditions at higher severity than supported by documentation is a compliance risk. The appropriate action is to correct the codes to match the clinical documentation, implement provider education on accurate coding, and potentially submit corrected data to CMS. Maintaining inaccurate codes constitutes potential fraud.'
      },
      {
        moduleId: m2.id, order: 10,
        text: 'Which of the following patient populations typically has the highest RAF score adjustment under the CMS-HCC model?',
        options: JSON.stringify([
          'A healthy 45-year-old with no chronic conditions',
          'A 78-year-old dual-eligible (Medicare/Medicaid) beneficiary with CHF, COPD, diabetes with complications, and CKD stage 4',
          'A 50-year-old with controlled hypertension only',
          'A 65-year-old newly enrolled in Medicare with no claims history'
        ]),
        correctIndex: 1,
        explanation: 'RAF scores are driven by age, gender, dual-eligible status, and the number/severity of HCC-mapped conditions. A dual-eligible beneficiary receives a higher demographic adjustment, and multiple serious chronic conditions (CHF, COPD, complicated diabetes, advanced CKD) each add significant RAF weight, often with disease interaction bonuses.'
      },
    ],
  })

  // ============ MODULE 3: Quality Metrics: HEDIS & Star Ratings (8 questions) ============
  const m3 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Quality Metrics: HEDIS & Star Ratings',
      order: 3,
      videoDuration: '60:00',
      description: 'Mastering HEDIS measures, Medicare Star Rating methodology, quality bonus payments, CAHPS surveys, and key clinical quality measures.',
      content: 'This module explores the quality measurement landscape in value-based care, with deep focus on HEDIS measures, Star Rating calculation methodology, the financial impact of quality bonuses, and strategies for improving performance.',
    },
  })
  await prisma.question.createMany({
    data: [
      {
        moduleId: m3.id, order: 1,
        text: 'A Medicare Advantage plan achieves an overall Star Rating of 4.5 stars. What is the primary financial benefit this plan receives from CMS?',
        options: JSON.stringify([
          'No financial benefit — Star Ratings are informational only',
          'A quality bonus payment (QBP) of approximately 5% added to the plan\'s benchmark, which can be used for supplemental benefits or premium reduction',
          'A one-time $1 million grant',
          'Exemption from all CMS audits for 3 years'
        ]),
        correctIndex: 1,
        explanation: 'Plans rated 4 stars or above receive a Quality Bonus Payment (QBP) from CMS — approximately 5% added to their county benchmark. This additional revenue can be used to fund supplemental benefits (dental, vision, hearing), reduce member premiums, or improve provider reimbursement. This creates a powerful financial incentive for quality improvement.'
      },
      {
        moduleId: m3.id, order: 2,
        text: 'The HEDIS measure "Controlling High Blood Pressure (CBP)" requires that patients aged 18-85 with a diagnosis of hypertension have their blood pressure adequately controlled. What is the current HEDIS threshold for adequate control in patients under 60?',
        options: JSON.stringify([
          'Less than 120/80 mmHg',
          'Less than 140/90 mmHg',
          'Less than 150/90 mmHg',
          'Less than 130/80 mmHg'
        ]),
        correctIndex: 1,
        explanation: 'The HEDIS CBP measure defines adequate blood pressure control as <140/90 mmHg for most patients. This aligns with guideline-concordant care while being achievable across diverse patient populations. Note that clinical guidelines (e.g., ACC/AHA) may recommend lower targets for certain patients, but HEDIS uses the 140/90 threshold for measurement purposes.'
      },
      {
        moduleId: m3.id, order: 3,
        text: 'CAHPS (Consumer Assessment of Healthcare Providers and Systems) surveys contribute to Medicare Star Ratings. Which of the following domains is assessed by CAHPS in the Medicare Advantage context?',
        options: JSON.stringify([
          'Provider surgical complication rates',
          'Getting needed care, getting appointments quickly, customer service, and overall rating of plan',
          'Hospital readmission rates only',
          'Pharmacy drug pricing and availability'
        ]),
        correctIndex: 1,
        explanation: 'CAHPS surveys in Medicare Advantage assess patient experience across multiple domains including: getting needed care, getting appointments and care quickly, doctors who communicate well, customer service, overall rating of health care and health plan, and care coordination. These patient experience measures account for a significant portion of the overall Star Rating.'
      },
      {
        moduleId: m3.id, order: 4,
        text: 'The HEDIS medication adherence measures (Proportion of Days Covered — PDC) for the "Statin Therapy for Patients with Cardiovascular Disease" measure require a PDC threshold of at least what percentage?',
        options: JSON.stringify(['60%', '70%', '80%', '90%']),
        correctIndex: 2,
        explanation: 'HEDIS medication adherence measures use a Proportion of Days Covered (PDC) threshold of ≥80% to define adherence. This applies to the three Triple-Weighted medication adherence measures: diabetes medications (PDC-DR), RAS antagonists for hypertension (PDC-RASA), and statins (PDC-STA). These measures are triple-weighted in Star Ratings, making them among the most impactful measures.'
      },
      {
        moduleId: m3.id, order: 5,
        text: 'Which of the following HEDIS measures is triple-weighted in the Medicare Advantage Star Rating calculation, making it disproportionately influential on the overall rating?',
        options: JSON.stringify([
          'Breast Cancer Screening (BCS)',
          'Medication Adherence for Diabetes Medications (PDC-DR)',
          'Adult BMI Assessment',
          'Flu Vaccinations for Adults Ages 18-64'
        ]),
        correctIndex: 1,
        explanation: 'Medication adherence measures (PDC-DR, PDC-RASA, PDC-STA) and the CAHPS patient experience measure are triple-weighted in Star Ratings. A plan\'s performance on PDC-DR alone can shift the overall Star Rating significantly. This is why medication adherence programs are among the highest-ROI quality improvement investments for MA plans.'
      },
      {
        moduleId: m3.id, order: 6,
        text: 'A primary care practice is underperforming on the HEDIS Colorectal Cancer Screening (COL) measure. Which of the following interventions would most effectively improve the screening rate?',
        options: JSON.stringify([
          'Sending patients a letter recommending they discuss screening at their next scheduled visit',
          'Implementing a multi-modal outreach strategy including mailed FIT kits, patient reminders, care gap alerts in EHR, and standing orders for screening',
          'Waiting for patients to request screening on their own',
          'Only screening patients who specifically ask for colonoscopy'
        ]),
        correctIndex: 1,
        explanation: 'Evidence shows that multi-modal outreach strategies are most effective for improving colorectal cancer screening rates. Mailed FIT kits (fecal immunochemical test) remove access barriers, EHR-based care gap alerts prompt providers at the point of care, and systematic outreach catches patients who may not have regular visits. Standing orders enable nurses and staff to initiate screening workflows.'
      },
      {
        moduleId: m3.id, order: 7,
        text: 'In the Star Rating methodology, what is the purpose of the "clustering" algorithm used by CMS to determine cut points between star levels?',
        options: JSON.stringify([
          'To ensure exactly 20% of plans receive each star level',
          'To group plan performance into natural clusters using a statistical method, so cut points reflect actual distribution of plan performance',
          'To randomly assign star levels to plans',
          'To ensure all plans receive at least 3 stars'
        ]),
        correctIndex: 1,
        explanation: 'CMS uses a clustering algorithm (based on the method of k-means or similar approach) that identifies natural groupings in the distribution of plan performance scores. This data-driven approach means cut points shift each year based on actual performance, creating a relative ranking system where plans must continuously improve to maintain their Star Rating.'
      },
      {
        moduleId: m3.id, order: 8,
        text: 'A Medicare Advantage plan is evaluating its performance on the HEDIS Comprehensive Diabetes Care (CDC) measure composite. Which component would NOT be included in this measure set?',
        options: JSON.stringify([
          'HbA1c testing',
          'Eye exam (retinal) performed',
          'Colonoscopy screening',
          'Blood pressure control (<140/90)'
        ]),
        correctIndex: 2,
        explanation: 'The HEDIS Comprehensive Diabetes Care measure includes HbA1c testing, HbA1c poor control (>9.0%), eye exam (retinal exam), medical attention for nephropathy, and blood pressure control. Colonoscopy screening is tracked under the separate Colorectal Cancer Screening (COL) measure and is not part of the diabetes care composite.'
      },
    ],
  })

  // ============ MODULE 4: Care Management & Population Health (8 questions) ============
  const m4 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Care Management & Population Health',
      order: 4,
      videoDuration: '60:00',
      description: 'Comprehensive coverage of chronic care management billing, transitional care, annual wellness visits, care gap closure, and social determinants of health.',
      content: 'This module covers the practical implementation of care management strategies in a value-based care environment, including billing for CCM and TCM services, population health stratification methods, and addressing social determinants of health.',
    },
  })
  await prisma.question.createMany({
    data: [
      {
        moduleId: m4.id, order: 1,
        text: 'Chronic Care Management (CCM) under CPT 99490 requires a minimum of 20 minutes of clinical staff time per calendar month for patients with how many chronic conditions expected to last at least 12 months?',
        options: JSON.stringify([
          'One chronic condition',
          'Two or more chronic conditions',
          'Three or more chronic conditions',
          'Five or more chronic conditions'
        ]),
        correctIndex: 1,
        explanation: 'CPT 99490 (basic CCM) requires at least 20 minutes of clinical staff time per month for patients with two or more chronic conditions expected to last at least 12 months or until death, and that place the patient at significant risk of death, acute exacerbation, or functional decline.'
      },
      {
        moduleId: m4.id, order: 2,
        text: 'A patient is discharged from the hospital on Monday. Under Transitional Care Management (TCM), what is the required timeline for the initial interactive contact and the face-to-face visit?',
        options: JSON.stringify([
          'Initial contact within 7 days, face-to-face within 30 days',
          'Initial interactive contact within 2 business days of discharge, face-to-face visit within 7 or 14 calendar days depending on complexity',
          'Contact within 48 hours, face-to-face within 24 hours',
          'No specific timeline requirements — any visit within 60 days qualifies'
        ]),
        correctIndex: 1,
        explanation: 'TCM requires interactive contact (phone call, not just a message) within 2 business days of discharge. The face-to-face visit must occur within 7 calendar days for high-complexity patients (CPT 99496) or within 14 calendar days for moderate-complexity patients (CPT 99495). TCM covers the 30-day post-discharge period.'
      },
      {
        moduleId: m4.id, order: 3,
        text: 'When conducting a Medicare Annual Wellness Visit (AWV), which of the following elements is required for the initial AWV (G0438) but NOT for a routine physical exam?',
        options: JSON.stringify([
          'Blood pressure measurement',
          'A personalized prevention plan including health risk assessment, cognitive screening, and advance directive discussion',
          'Complete blood count (CBC) lab work',
          'Cardiac stress testing'
        ]),
        correctIndex: 1,
        explanation: 'The initial AWV (G0438) requires a health risk assessment, review of medical/family history, establishment of a screening schedule, cognitive assessment, personalized health advice, and advance care planning discussion. Unlike a routine physical, it focuses on prevention planning rather than acute complaint evaluation. Labs and diagnostic tests are billed separately.'
      },
      {
        moduleId: m4.id, order: 4,
        text: 'A population health team is stratifying a panel of 5,000 patients. Using a standard risk stratification pyramid, approximately what percentage of the population would be classified as "rising risk" (moderate complexity, 2-3 chronic conditions, some utilization)?',
        options: JSON.stringify(['5-10%', '15-25%', '50-60%', '80-90%']),
        correctIndex: 1,
        explanation: 'In the standard risk stratification pyramid: approximately 5% are high-risk/complex, 15-25% are rising risk (moderate complexity with multiple chronic conditions), and the remaining 70-80% are low-risk/healthy. The rising risk segment is often the most impactful target for care management interventions, as they can be prevented from becoming high-cost patients.'
      },
      {
        moduleId: m4.id, order: 5,
        text: 'A primary care practice discovers through SDOH screening that 22% of their patients report food insecurity. Which validated screening tool is most commonly used to assess food insecurity in clinical settings?',
        options: JSON.stringify([
          'PHQ-9',
          'The Hunger Vital Sign (2-item food security screener)',
          'AUDIT-C',
          'Montreal Cognitive Assessment (MoCA)'
        ]),
        correctIndex: 1,
        explanation: 'The Hunger Vital Sign is a validated 2-item food security screener derived from the USDA Household Food Security Survey. It asks about food running out and inability to afford balanced meals. PHQ-9 screens for depression, AUDIT-C for alcohol use, and MoCA for cognitive impairment. SDOH screening tools like the Hunger Vital Sign enable systematic identification and referral.'
      },
      {
        moduleId: m4.id, order: 6,
        text: 'Which of the following best describes the concept of "care gap closure" in population health management?',
        options: JSON.stringify([
          'Firing underperforming care managers',
          'Systematically identifying patients overdue for evidence-based preventive services or chronic disease management actions and completing those services',
          'Closing underutilized clinic locations',
          'Reducing the time between patient phone calls'
        ]),
        correctIndex: 1,
        explanation: 'Care gap closure involves using data analytics to identify patients who are overdue for recommended services (e.g., HbA1c testing, cancer screenings, annual wellness visits) and implementing systematic outreach to ensure those services are completed. Closing care gaps directly improves quality measure performance and patient outcomes.'
      },
      {
        moduleId: m4.id, order: 7,
        text: 'A patient with COPD, CHF, and diabetes is discharged from the hospital and readmitted within 15 days. Under a VBC arrangement, which care management intervention has the strongest evidence for reducing 30-day readmissions?',
        options: JSON.stringify([
          'Scheduling a follow-up visit in 60 days',
          'Comprehensive transitional care including medication reconciliation within 24 hours, follow-up call within 2 days, PCP visit within 7 days, and home health assessment',
          'Sending a patient satisfaction survey',
          'Referring the patient to a specialist for each condition separately'
        ]),
        correctIndex: 1,
        explanation: 'Evidence strongly supports comprehensive transitional care programs that include prompt medication reconciliation, early post-discharge contact, timely PCP follow-up, and assessment of home support needs. The Coleman Care Transitions and Naylor Transitional Care models demonstrate significant readmission reductions through these multi-component interventions.'
      },
      {
        moduleId: m4.id, order: 8,
        text: 'Complex Care Management (CCM) programs for the highest-risk 5% of patients typically include which combination of services?',
        options: JSON.stringify([
          'Annual wellness visit only',
          'Dedicated care manager, individualized care plan, frequent touchpoints, behavioral health integration, pharmacy review, and SDOH resource connection',
          'Referral to emergency department for all concerns',
          'Monthly newsletter and group education classes only'
        ]),
        correctIndex: 1,
        explanation: 'Comprehensive complex care management for high-risk patients requires a multi-disciplinary approach: a dedicated care manager (often an RN or social worker), individualized care plans, frequent patient touchpoints (weekly or biweekly), integration of behavioral health, pharmacy medication management, and connections to community resources addressing SDOH needs.'
      },
    ],
  })

  // ============ MODULE 5: Technology & Data Analytics in VBC (8 questions) ============
  const m5 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Technology & Data Analytics in VBC',
      order: 5,
      videoDuration: '60:00',
      description: 'Exploring clinical decision support, predictive analytics, risk stratification tools, FHIR/HL7 interoperability, telehealth, and data governance in value-based care.',
      content: 'This module examines how technology and data analytics are transforming value-based care delivery, from predictive modeling and clinical decision support to interoperability standards and telehealth integration.',
    },
  })
  await prisma.question.createMany({
    data: [
      {
        moduleId: m5.id, order: 1,
        text: 'A health system implements a predictive analytics model to identify patients at risk for hospital readmission within 30 days. The model has a C-statistic (AUC) of 0.78. What does this indicate about the model\'s performance?',
        options: JSON.stringify([
          'The model is 78% accurate in all predictions',
          'The model has a 78% probability of correctly ranking a randomly chosen readmitted patient higher than a randomly chosen non-readmitted patient',
          'The model will prevent 78% of readmissions',
          '78% of patients will be readmitted'
        ]),
        correctIndex: 1,
        explanation: 'A C-statistic (AUC-ROC) of 0.78 means there is a 78% probability that the model will correctly discriminate between a randomly selected patient who is readmitted and one who is not. Values of 0.7-0.8 are considered acceptable, 0.8-0.9 excellent, and >0.9 outstanding for clinical prediction models.'
      },
      {
        moduleId: m5.id, order: 2,
        text: 'HL7 FHIR (Fast Healthcare Interoperability Resources) uses which underlying web technology standard for data exchange?',
        options: JSON.stringify([
          'SOAP-based XML messaging only',
          'RESTful APIs with JSON and/or XML resources',
          'FTP file transfer',
          'Direct database-to-database connections'
        ]),
        correctIndex: 1,
        explanation: 'FHIR is built on modern web standards using RESTful APIs (HTTP-based) with resources represented in JSON or XML format. This makes FHIR significantly easier to implement than older HL7 standards (v2, v3, CDA) and enables app-based integrations through frameworks like SMART on FHIR.'
      },
      {
        moduleId: m5.id, order: 3,
        text: 'A clinical decision support (CDS) system fires an alert recommending A1c testing for a diabetic patient overdue for monitoring. This type of CDS is classified as:',
        options: JSON.stringify([
          'Passive CDS that requires the clinician to actively search for recommendations',
          'Active CDS that delivers context-specific guidance at the point of care without clinician initiation',
          'Retrospective CDS that reviews cases after discharge',
          'Administrative CDS that only supports billing'
        ]),
        correctIndex: 1,
        explanation: 'Active (or "push") CDS delivers recommendations proactively at the point of care based on patient context — the clinician doesn\'t need to seek it out. This contrasts with passive ("pull") CDS where the clinician must actively query the system. Active CDS is more effective for care gap closure but must be carefully designed to avoid alert fatigue.'
      },
      {
        moduleId: m5.id, order: 4,
        text: 'The 21st Century Cures Act includes provisions related to "information blocking." Which of the following actions would constitute information blocking under this legislation?',
        options: JSON.stringify([
          'Sharing patient data through a certified health information exchange',
          'A health IT developer intentionally restricting the export of patient data to a competing EHR system without a legitimate justification',
          'Implementing appropriate cybersecurity measures to protect patient data',
          'Requiring patient authorization before sharing mental health records'
        ]),
        correctIndex: 1,
        explanation: 'Information blocking refers to practices by health IT developers, health information exchanges, or healthcare providers that interfere with the access, exchange, or use of electronic health information, except where an exception applies. Intentionally restricting data portability between EHR systems without legitimate justification is a clear violation. The Cures Act established penalties for information blocking.'
      },
      {
        moduleId: m5.id, order: 5,
        text: 'A telehealth program for chronic disease management in a VBC model shows improved outcomes. Which of the following telehealth applications has the strongest evidence for reducing total cost of care?',
        options: JSON.stringify([
          'Using telehealth exclusively for acute urgent care visits',
          'Remote patient monitoring (RPM) with daily vitals transmission for high-risk CHF and COPD patients combined with proactive nurse outreach',
          'Telehealth visits that simply replicate in-person visits without additional monitoring',
          'Asynchronous messaging for prescription refills only'
        ]),
        correctIndex: 1,
        explanation: 'Remote patient monitoring (RPM) for high-risk chronic disease patients has the strongest evidence for TCOC reduction. Daily vitals transmission (weight, BP, SpO2, glucose) with algorithm-driven alerts and proactive nurse outreach enables early intervention for clinical deterioration, reducing ED visits and hospitalizations — the primary drivers of total cost of care.'
      },
      {
        moduleId: m5.id, order: 6,
        text: 'A health system is evaluating population health analytics platforms. Which capability is MOST critical for effective risk stratification in a value-based care environment?',
        options: JSON.stringify([
          'Attractive data visualization dashboards',
          'Ability to integrate claims data, clinical EHR data, SDOH data, and pharmacy data into a unified patient view with predictive modeling',
          'Basic appointment scheduling functionality',
          'Ability to generate marketing reports'
        ]),
        correctIndex: 1,
        explanation: 'Effective risk stratification requires integration of multiple data sources: claims data (utilization patterns, costs), clinical EHR data (labs, vitals, diagnoses), SDOH data (housing, food security, transportation), and pharmacy data (medication adherence, polypharmacy). Predictive models built on this comprehensive data produce more accurate risk scores than any single data source.'
      },
      {
        moduleId: m5.id, order: 7,
        text: 'Under the CMS Interoperability and Patient Access Final Rule, Medicare Advantage plans are required to implement which type of API for patient data access?',
        options: JSON.stringify([
          'A proprietary API unique to each plan',
          'A Patient Access API based on HL7 FHIR standards allowing patients to access their claims and clinical data through third-party apps',
          'An API exclusively for provider use',
          'No API requirement exists'
        ]),
        correctIndex: 1,
        explanation: 'The CMS Interoperability and Patient Access Rule requires MA plans (and other CMS-regulated payers) to implement a Patient Access API built on HL7 FHIR standards. This API must allow patients to access their claims data, encounter information, and clinical data through third-party applications of their choice, promoting patient empowerment and data liquidity.'
      },
      {
        moduleId: m5.id, order: 8,
        text: 'A practice implements a data governance framework for its VBC analytics program. Which element is MOST essential for maintaining data quality and integrity?',
        options: JSON.stringify([
          'Purchasing the most expensive analytics software available',
          'Establishing clear data ownership, standardized definitions, validation rules, and regular data quality audits',
          'Allowing all staff unrestricted access to all data',
          'Outsourcing all data management to a third party without oversight'
        ]),
        correctIndex: 1,
        explanation: 'Effective data governance requires: clear data ownership and stewardship roles, standardized data definitions (e.g., what counts as a "completed" screening), validation rules to catch errors, regular data quality audits, and documented processes for data correction. Without strong governance, analytics outputs are unreliable and clinical decisions based on them may be inappropriate.'
      },
    ],
  })

  // ============ MODULE 6: Financial Models & Contract Negotiation (8 questions) ============
  const m6 = await prisma.module.create({
    data: {
      courseId: course.id,
      title: 'Financial Models & Contract Negotiation',
      order: 6,
      videoDuration: '60:00',
      description: 'Understanding PMPM calculations, shared savings models, capitation, downside risk, stop-loss provisions, medical loss ratio, and contract negotiation strategies.',
      content: 'This final module covers the financial architecture of value-based care, from understanding PMPM economics and shared savings calculations to evaluating capitation contracts, stop-loss provisions, and negotiation strategies for sustainable VBC partnerships.',
    },
  })
  await prisma.question.createMany({
    data: [
      {
        moduleId: m6.id, order: 1,
        text: 'A primary care group is offered a capitated contract with a PMPM rate of $45 for a panel of 8,000 attributed members. What is the group\'s total annual capitated revenue?',
        options: JSON.stringify(['$360,000', '$4,320,000', '$540,000', '$2,160,000']),
        correctIndex: 1,
        explanation: 'Annual capitated revenue = PMPM × members × 12 months = $45 × 8,000 × 12 = $4,320,000. This is the total annual revenue the group receives regardless of actual service utilization. The group must manage its costs within this budget while maintaining quality standards.'
      },
      {
        moduleId: m6.id, order: 2,
        text: 'In a shared savings contract with a 2% minimum savings rate (MSR) and a total cost benchmark of $50 million, what is the minimum savings the ACO must achieve before any shared savings are distributed?',
        options: JSON.stringify(['$500,000', '$1,000,000', '$2,000,000', '$5,000,000']),
        correctIndex: 1,
        explanation: 'The minimum savings rate (MSR) of 2% applied to a $50 million benchmark means the ACO must achieve at least $50M × 0.02 = $1,000,000 in savings before any shared savings distribution occurs. The MSR serves as a statistical threshold to ensure savings are real and not due to random variation.'
      },
      {
        moduleId: m6.id, order: 3,
        text: 'A Medicare Advantage plan has total premium revenue of $100 million and spends $82 million on clinical services and quality improvement. What is the plan\'s Medical Loss Ratio (MLR), and does it meet the ACA minimum requirement?',
        options: JSON.stringify([
          'MLR = 82%; yes, it meets the 85% minimum requirement',
          'MLR = 82%; no, it does not meet the 85% minimum requirement for large group/MA plans',
          'MLR = 18%; yes, it meets requirements',
          'MLR = 82%; there is no minimum MLR requirement'
        ]),
        correctIndex: 1,
        explanation: 'MLR = Clinical services + Quality improvement / Premium revenue = $82M / $100M = 82%. The ACA requires Medicare Advantage plans to maintain an MLR of at least 85%. At 82%, this plan falls short and would be required to issue rebates to enrollees for the difference. Plans consistently below 85% may face enrollment sanctions.'
      },
      {
        moduleId: m6.id, order: 4,
        text: 'When evaluating a two-sided risk VBC contract, what is the purpose of a "stop-loss" provision?',
        options: JSON.stringify([
          'To stop providers from seeing patients once a spending limit is reached',
          'To cap the maximum financial loss a provider can incur by providing reinsurance above a specified per-member or aggregate threshold',
          'To prevent patients from changing their primary care provider',
          'To limit the number of referrals to specialists'
        ]),
        correctIndex: 1,
        explanation: 'Stop-loss (or reinsurance) provisions protect providers from catastrophic financial losses in risk-bearing arrangements. Individual stop-loss triggers when a single member\'s costs exceed a threshold (e.g., $100,000), while aggregate stop-loss triggers when total costs exceed a percentage of expected costs (e.g., 115%). These provisions are essential for financially sustainable risk-bearing.'
      },
      {
        moduleId: m6.id, order: 5,
        text: 'A provider group is negotiating a VBC contract and the payer proposes using "prospective attribution" for assigning patients. What is the key difference between prospective and retrospective attribution?',
        options: JSON.stringify([
          'There is no meaningful difference between the two methods',
          'Prospective attribution assigns patients at the beginning of a performance period based on historical utilization, while retrospective assigns patients at the end based on actual utilization during the period',
          'Prospective attribution only counts specialist visits',
          'Retrospective attribution is illegal under MACRA'
        ]),
        correctIndex: 1,
        explanation: 'Prospective attribution assigns beneficiaries at the start of a period based on historical claims data, giving providers a known panel to manage. Retrospective attribution assigns at period end based on where patients actually received care. Prospective attribution provides more predictability for population health management, while retrospective can lead to unexpected panel changes.'
      },
      {
        moduleId: m6.id, order: 6,
        text: 'In evaluating a value-based contract, a provider group should analyze the "total cost of care benchmark." Which factor would most likely cause the benchmark to be set unfavorably for the provider?',
        options: JSON.stringify([
          'Having a healthy, well-managed patient population in the baseline period',
          'High historical utilization in the baseline period that has already been reduced',
          'Accurate and complete HCC documentation in the baseline period',
          'Including pharmacy costs in the total cost calculation'
        ]),
        correctIndex: 0,
        explanation: 'If the baseline period already reflects a healthy, well-managed population with low utilization, the resulting benchmark will be low — leaving little room for further cost reduction. Conversely, if historical costs were high (inflated baseline), there\'s more room for "savings." This is why understanding the benchmark methodology and baseline period selection is critical in contract negotiation.'
      },
      {
        moduleId: m6.id, order: 7,
        text: 'A payer offers a "global capitation" arrangement at $450 PMPM covering all medical services. The provider group\'s actuarial analysis shows expected total cost of care at $420 PMPM. What is the expected margin, and what key risk should the group evaluate before accepting?',
        options: JSON.stringify([
          'Expected margin of $30 PMPM (6.7%); key risk is whether the actuarial estimate accounts for catastrophic claims, new high-cost drugs, and pandemic-related utilization shifts',
          'Expected margin of $30 PMPM; there are no significant risks to evaluate',
          'Expected loss of $30 PMPM; the group should decline immediately',
          'Expected margin of $450 PMPM; the contract guarantees profit'
        ]),
        correctIndex: 0,
        explanation: 'Expected margin = $450 - $420 = $30 PMPM (6.7%), which seems favorable. However, the group must evaluate actuarial adequacy: does the $420 estimate include a margin for catastrophic claims, new specialty drugs (e.g., GLP-1 agonists), utilization trends, and stop-loss adequacy? A $30 margin can evaporate quickly if even a few members incur high-cost events without adequate reinsurance.'
      },
      {
        moduleId: m6.id, order: 8,
        text: 'When negotiating a value-based contract, which of the following terms should a provider group prioritize to protect against adverse selection and ensure fair performance evaluation?',
        options: JSON.stringify([
          'Higher fee-for-service rates for all procedures',
          'Risk adjustment methodology, outlier exclusion policy, minimum panel size requirements, and mid-year benchmark recalibration triggers',
          'Guaranteed annual payment increases regardless of performance',
          'Exclusion of all patients with chronic diseases from the attributed panel'
        ]),
        correctIndex: 1,
        explanation: 'Key protective terms include: (1) adequate risk adjustment so the benchmark reflects actual patient acuity, (2) outlier exclusion policies for catastrophic cases, (3) minimum panel size to ensure statistical validity, and (4) benchmark recalibration triggers for significant panel changes. These provisions protect against adverse selection and ensure the contract fairly evaluates performance.'
      },
    ],
  })

  // Mark other courses as "Coming Soon" by keeping them but we won't show modules
  await prisma.course.updateMany({
    where: { slug: { not: 'value-based-care-essentials' } },
    data: { isPublished: true },
  })

  // Seed dummy students
  const studentPassword = await bcrypt.hash('student123', 10)
  const students = [
    { email: 'sarah.chen@example.com', name: 'Dr. Sarah Chen', credentials: 'MD', specialty: 'Internal Medicine' },
    { email: 'michael.torres@example.com', name: 'Dr. Michael Torres', credentials: 'DO', specialty: 'Family Medicine' },
    { email: 'jennifer.park@example.com', name: 'Jennifer Park', credentials: 'NP', specialty: 'Primary Care' },
    { email: 'david.kim@example.com', name: 'David Kim', credentials: 'PA', specialty: 'Internal Medicine' },
    { email: 'lisa.johnson@example.com', name: 'Lisa Johnson', credentials: 'RN', specialty: 'Family Medicine' },
  ]

  const modules = await prisma.module.findMany({ where: { courseId: course.id }, orderBy: { order: 'asc' } })

  for (let i = 0; i < students.length; i++) {
    const s = students[i]
    const user = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { ...s, password: studentPassword, role: 'student' },
    })

    const progressLevels = [100, 83, 50, 33, 17]
    const completedModules = Math.floor((progressLevels[i] / 100) * modules.length)
    const isComplete = progressLevels[i] >= 100

    const enrollment = await prisma.enrollment.upsert({
      where: { userId_courseId: { userId: user.id, courseId: course.id } },
      update: { progress: progressLevels[i], status: isComplete ? 'completed' : 'active' },
      create: {
        userId: user.id,
        courseId: course.id,
        progress: progressLevels[i],
        status: isComplete ? 'completed' : 'active',
        completedAt: isComplete ? new Date() : null,
      },
    })

    for (let j = 0; j < completedModules; j++) {
      await prisma.moduleCompletion.upsert({
        where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId: modules[j].id } },
        update: {},
        create: {
          enrollmentId: enrollment.id,
          moduleId: modules[j].id,
          quizPassed: true,
          quizScore: 80 + Math.floor(Math.random() * 20),
        },
      })
    }

    if (isComplete) {
      const certNumber = `AICE-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`
      await prisma.certificate.upsert({
        where: { certificateNumber: certNumber },
        update: {},
        create: { userId: user.id, courseId: course.id, certificateNumber: certNumber },
      })
    }
  }

  // Seed resources
  await prisma.resource.deleteMany()
  const resourceData = [
    { id: 'res-01', moduleOrder: 1, title: 'VBC vs Fee-for-Service Comparison Guide', description: 'Side-by-side comparison of reimbursement models, incentive structures, quality focus, risk sharing, and documentation requirements.', filename: 'vbc-vs-ffs-comparison-guide.pdf', order: 1 },
    { id: 'res-02', moduleOrder: 1, title: 'MACRA/MIPS Quick Reference Guide', description: 'MIPS categories, weights, scoring thresholds, payment adjustments, and reporting timeline at a glance.', filename: 'macra-mips-quick-reference.pdf', order: 2 },
    { id: 'res-03', moduleOrder: 1, title: 'APM Participation Decision Tree', description: 'Flowchart-style guide to assess APM readiness including revenue thresholds and risk tolerance.', filename: 'apm-decision-tree.pdf', order: 3 },
    { id: 'res-04', moduleOrder: 2, title: 'Top 50 HCC Codes Reference Card', description: 'HCC categories, RAF weights, common ICD-10 codes, and documentation tips.', filename: 'top-50-hcc-codes.pdf', order: 1 },
    { id: 'res-05', moduleOrder: 2, title: 'MEAT Documentation Checklist', description: 'Monitor, Evaluate, Assess, Treat framework checklist with examples.', filename: 'meat-documentation-checklist.pdf', order: 2 },
    { id: 'res-06', moduleOrder: 2, title: 'CMS-HCC V28 Changes Summary', description: 'Key changes from V24 to V28 including dropped/new HCCs and RAF weight changes.', filename: 'cms-hcc-v28-changes.pdf', order: 3 },
    { id: 'res-07', moduleOrder: 2, title: 'Risk Adjustment Audit Template', description: 'Pre-audit checklist, chart review worksheet, and remediation action plan.', filename: 'risk-adjustment-audit-template.pdf', order: 4 },
    { id: 'res-08', moduleOrder: 3, title: 'HEDIS Measures Master Reference', description: 'Key primary care HEDIS measures with criteria and gap closure tips.', filename: 'hedis-measures-master-reference.pdf', order: 1 },
    { id: 'res-09', moduleOrder: 3, title: 'Star Rating Calculation Worksheet', description: 'Star calculation methodology, measure weights, and improvement strategies.', filename: 'star-rating-worksheet.pdf', order: 2 },
    { id: 'res-10', moduleOrder: 3, title: 'Quality Gap Closure Tracking Template', description: 'Patient-level tracking with outreach dates and summary dashboard.', filename: 'quality-gap-tracking-template.pdf', order: 3 },
    { id: 'res-11', moduleOrder: 4, title: 'CCM/TCM Billing Code Reference', description: 'CPT codes for CCM and TCM with requirements and reimbursement rates.', filename: 'ccm-tcm-billing-reference.pdf', order: 1 },
    { id: 'res-12', moduleOrder: 4, title: 'Comprehensive Care Plan Template', description: 'Care plan template with SMART goals, interventions, and patient agreement.', filename: 'comprehensive-care-plan.pdf', order: 2 },
    { id: 'res-13', moduleOrder: 4, title: 'SDOH Screening Tool', description: 'Validated screening questions for social determinants of health.', filename: 'sdoh-screening-tool.pdf', order: 3 },
    { id: 'res-14', moduleOrder: 4, title: 'Patient Outreach Script Templates', description: 'Phone scripts for AWV scheduling, care gap closure, and follow-up.', filename: 'patient-outreach-scripts.pdf', order: 4 },
    { id: 'res-15', moduleOrder: 5, title: 'Health IT Vendor Evaluation Checklist', description: 'Evaluation criteria for interoperability, analytics, and pricing.', filename: 'health-it-vendor-checklist.pdf', order: 1 },
    { id: 'res-16', moduleOrder: 5, title: 'Data Governance Policy Template', description: 'Policy template for data stewardship, quality standards, and PHI handling.', filename: 'data-governance-policy.pdf', order: 2 },
    { id: 'res-17', moduleOrder: 5, title: 'Telehealth Workflow Setup Guide', description: 'Technology requirements, billing codes, and QA checklist.', filename: 'telehealth-workflow-guide.pdf', order: 3 },
    { id: 'res-18', moduleOrder: 6, title: 'PMPM Calculator Guide', description: 'Step-by-step PMPM calculation with cost categories and benchmarks.', filename: 'pmpm-calculator-guide.pdf', order: 1 },
    { id: 'res-19', moduleOrder: 6, title: 'Shared Savings Contract Term Sheet Template', description: 'Key contract terms including benchmark methodology and quality gates.', filename: 'shared-savings-term-sheet.pdf', order: 2 },
    { id: 'res-20', moduleOrder: 6, title: 'Payer Negotiation Preparation Checklist', description: 'Pre-negotiation data gathering, SWOT analysis, and strategies.', filename: 'payer-negotiation-checklist.pdf', order: 3 },
    { id: 'res-21', moduleOrder: 6, title: 'Total Cost of Care Benchmarking Worksheet', description: 'TCOC calculation methodology and variance analysis.', filename: 'tcoc-benchmarking-worksheet.pdf', order: 4 },
    { id: 'res-22', moduleOrder: 0, title: 'Complete VBC Implementation Toolkit', description: 'Executive summary, 90-day action plan, key metrics dashboard, and resource directory.', filename: 'vbc-implementation-toolkit.pdf', order: 1 },
  ]
  // Use moduleOrder to find the actual moduleId
  const allModules = await prisma.module.findMany({ where: { courseId: course.id }, orderBy: { order: 'asc' } })
  for (const r of resourceData) {
    const mod = allModules.find(m => m.order === r.moduleOrder)
    await prisma.resource.create({
      data: {
        id: r.id,
        moduleId: mod?.id || `module-order-${r.moduleOrder}`,
        title: r.title,
        description: r.description,
        filename: r.filename,
        type: 'pdf',
        order: r.order,
      },
    })
  }

  // ============ SEED EMAIL TEMPLATES ============
  const emailTemplates = [
    {
      name: 'Welcome Email',
      slug: 'welcome',
      subject: 'Welcome to {{courseName}} - AICE',
      body: '<h2>Welcome, {{studentName}}!</h2><p>Thank you for enrolling in <strong>{{courseName}}</strong>.</p><p>You now have full access to all course modules, resources, and assessments. Log in to your dashboard to begin.</p><p>Best regards,<br/>American Institute of Clinical Education</p>',
      variables: '["{{studentName}}", "{{courseName}}"]',
    },
    {
      name: 'Module Completion',
      slug: 'module-complete',
      subject: 'Module Completed: {{moduleName}} - AICE',
      body: '<h2>Congratulations, {{studentName}}!</h2><p>You have successfully completed <strong>{{moduleName}}</strong> with a score of <strong>{{score}}%</strong>.</p><p>Keep up the great work! Continue to the next module in your dashboard.</p><p>Best regards,<br/>AICE Team</p>',
      variables: '["{{studentName}}", "{{moduleName}}", "{{score}}", "{{courseName}}"]',
    },
    {
      name: 'Course Completion',
      slug: 'course-complete',
      subject: 'Certificate Earned: {{courseName}} - AICE',
      body: '<h2>Congratulations, {{studentName}}!</h2><p>You have successfully completed <strong>{{courseName}}</strong> and earned your certificate.</p><p>Your certificate number is: <strong>{{certificateNumber}}</strong></p><p>You can verify your certificate anytime at our verification portal.</p><p>Best regards,<br/>AICE Team</p>',
      variables: '["{{studentName}}", "{{courseName}}", "{{certificateNumber}}"]',
    },
    {
      name: 'Reminder: Incomplete Course',
      slug: 'reminder-incomplete',
      subject: 'Continue Your CME Journey - AICE',
      body: '<h2>Hi {{studentName}},</h2><p>We noticed you haven\'t logged in recently. You still have progress to make in <strong>{{courseName}}</strong>.</p><p>Don\'t let your CME credits slip away - log in today and pick up where you left off!</p><p>Best regards,<br/>AICE Team</p>',
      variables: '["{{studentName}}", "{{courseName}}"]',
    },
    {
      name: 'Announcement',
      slug: 'announcement',
      subject: 'Important Update from AICE',
      body: '<h2>Dear {{studentName}},</h2><p>We have an important announcement to share with you.</p><p>[Your announcement content here]</p><p>Best regards,<br/>AICE Team</p>',
      variables: '["{{studentName}}"]',
    },
  ]

  for (const tmpl of emailTemplates) {
    await prisma.emailTemplate.upsert({
      where: { slug: tmpl.slug },
      update: { ...tmpl },
      create: { ...tmpl },
    })
  }

  // ============ SEED COUPONS ============
  const couponsData = [
    { code: 'WELCOME20', discountType: 'percentage', discountValue: 20, maxUses: 100, currentUses: 12, isActive: true },
    { code: 'VBC500', discountType: 'fixed', discountValue: 500, maxUses: 50, currentUses: 3, isActive: true },
    { code: 'FREECME', discountType: 'percentage', discountValue: 100, maxUses: 10, currentUses: 1, isActive: true },
  ]

  for (const cp of couponsData) {
    await prisma.coupon.upsert({
      where: { code: cp.code },
      update: { currentUses: cp.currentUses },
      create: cp,
    })
  }

  // ============ SEED TRANSACTIONS ============
  const allUsers = await prisma.user.findMany({ where: { role: 'student' } })
  if (allUsers.length > 0) {
    // Clear existing transactions
    await prisma.transaction.deleteMany()

    const txData = []
    for (let i = 0; i < 10; i++) {
      const user = allUsers[i % allUsers.length]
      const monthsAgo = Math.floor(Math.random() * 6)
      const d = new Date()
      d.setMonth(d.getMonth() - monthsAgo)
      d.setDate(Math.floor(Math.random() * 28) + 1)
      txData.push({
        userId: user.id,
        courseId: course.id,
        amount: i === 3 ? 1200 : i === 7 ? 1000 : 1500,
        currency: 'usd',
        status: i === 5 ? 'refunded' : 'paid',
        stripePaymentId: `pi_${Math.random().toString(36).substring(2, 15)}`,
        couponId: i === 3 ? 'VBC500' : i === 7 ? 'WELCOME20' : null,
        refundedAt: i === 5 ? new Date() : null,
        refundAmount: i === 5 ? 1500 : null,
        createdAt: d,
      })
    }
    for (const tx of txData) {
      await prisma.transaction.create({ data: tx })
    }
  }

  // ============ SEED EMAIL LOGS ============
  await prisma.emailLog.deleteMany()
  const sampleEmails = [
    { recipient: 'sarah.chen@example.com', subject: 'Welcome to Value-Based Care Essentials - AICE', status: 'sent', sentAt: new Date() },
    { recipient: 'michael.torres@example.com', subject: 'Welcome to Value-Based Care Essentials - AICE', status: 'sent', sentAt: new Date() },
    { recipient: 'jennifer.park@example.com', subject: 'Module Completed: Introduction to VBC - AICE', status: 'sent', sentAt: new Date() },
    { recipient: 'david.kim@example.com', subject: 'Continue Your CME Journey - AICE', status: 'pending' },
  ]
  for (const em of sampleEmails) {
    await prisma.emailLog.create({ data: em })
  }

  console.log('Seed completed successfully!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
