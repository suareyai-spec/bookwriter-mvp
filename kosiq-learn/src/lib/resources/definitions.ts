// Static resource definitions keyed by module order (1-6), plus bonus (0)
export interface ResourceDef {
  id: string
  moduleOrder: number // 1-6, 0 = bonus
  title: string
  description: string
  filename: string
  order: number
}

export const RESOURCES: ResourceDef[] = [
  // Module 1
  { id: 'res-01', moduleOrder: 1, title: 'VBC vs Fee-for-Service Comparison Guide', description: 'Side-by-side comparison of reimbursement models, incentive structures, quality focus, risk sharing, and documentation requirements.', filename: 'vbc-vs-ffs-comparison-guide.pdf', order: 1 },
  { id: 'res-02', moduleOrder: 1, title: 'MACRA/MIPS Quick Reference Guide', description: 'MIPS categories, weights, scoring thresholds, payment adjustments, and reporting timeline at a glance.', filename: 'macra-mips-quick-reference.pdf', order: 2 },
  { id: 'res-03', moduleOrder: 1, title: 'APM Participation Decision Tree', description: 'Flowchart-style guide to assess APM readiness including revenue thresholds and risk tolerance.', filename: 'apm-decision-tree.pdf', order: 3 },
  // Module 2
  { id: 'res-04', moduleOrder: 2, title: 'Top 50 HCC Codes Reference Card', description: 'HCC categories, RAF weights, common ICD-10 codes, and documentation tips for the most impactful conditions.', filename: 'top-50-hcc-codes.pdf', order: 1 },
  { id: 'res-05', moduleOrder: 2, title: 'MEAT Documentation Checklist', description: 'Monitor, Evaluate, Assess, Treat framework checklist with examples of qualifying and non-qualifying documentation.', filename: 'meat-documentation-checklist.pdf', order: 2 },
  { id: 'res-06', moduleOrder: 2, title: 'CMS-HCC V28 Changes Summary', description: 'Key changes from V24 to V28 including dropped/new HCCs, RAF weight changes, and revenue impact analysis.', filename: 'cms-hcc-v28-changes.pdf', order: 3 },
  { id: 'res-07', moduleOrder: 2, title: 'Risk Adjustment Audit Template', description: 'Pre-audit checklist, chart review worksheet, documentation gaps tracker, and remediation action plan.', filename: 'risk-adjustment-audit-template.pdf', order: 4 },
  // Module 3
  { id: 'res-08', moduleOrder: 3, title: 'HEDIS Measures Master Reference', description: 'Key primary care HEDIS measures with numerator/denominator criteria, data sources, and gap closure tips.', filename: 'hedis-measures-master-reference.pdf', order: 1 },
  { id: 'res-09', moduleOrder: 3, title: 'Star Rating Calculation Worksheet', description: 'How Stars are calculated, measure weights, cut points, CAI, and quality bonus payment thresholds.', filename: 'star-rating-worksheet.pdf', order: 2 },
  { id: 'res-10', moduleOrder: 3, title: 'Quality Gap Closure Tracking Template', description: 'Patient-level tracking layout with outreach dates, closure status, and summary dashboard section.', filename: 'quality-gap-tracking-template.pdf', order: 3 },
  // Module 4
  { id: 'res-11', moduleOrder: 4, title: 'CCM/TCM Billing Code Reference', description: 'CPT codes for Chronic Care Management and Transitional Care Management with requirements and reimbursement rates.', filename: 'ccm-tcm-billing-reference.pdf', order: 1 },
  { id: 'res-12', moduleOrder: 4, title: 'Comprehensive Care Plan Template', description: 'Complete care plan template with problem list, SMART goals, interventions, and patient agreement section.', filename: 'comprehensive-care-plan.pdf', order: 2 },
  { id: 'res-13', moduleOrder: 4, title: 'SDOH Screening Tool', description: 'Validated screening questions for food insecurity, housing, transportation, financial strain, and social isolation.', filename: 'sdoh-screening-tool.pdf', order: 3 },
  { id: 'res-14', moduleOrder: 4, title: 'Patient Outreach Script Templates', description: 'Phone scripts for AWV scheduling, care gap closure, medication adherence, and post-discharge follow-up.', filename: 'patient-outreach-scripts.pdf', order: 4 },
  // Module 5
  { id: 'res-15', moduleOrder: 5, title: 'Health IT Vendor Evaluation Checklist', description: 'Evaluation criteria for interoperability, analytics, CDS, patient engagement, and pricing models.', filename: 'health-it-vendor-checklist.pdf', order: 1 },
  { id: 'res-16', moduleOrder: 5, title: 'Data Governance Policy Template', description: 'Complete policy template covering data stewardship, quality standards, PHI handling, and audit procedures.', filename: 'data-governance-policy.pdf', order: 2 },
  { id: 'res-17', moduleOrder: 5, title: 'Telehealth Workflow Setup Guide', description: 'Technology requirements, scheduling workflow, billing codes, consent template, and QA checklist.', filename: 'telehealth-workflow-guide.pdf', order: 3 },
  // Module 6
  { id: 'res-18', moduleOrder: 6, title: 'PMPM Calculator Guide', description: 'Step-by-step PMPM calculation with medical expense categories, pharmacy costs, and trend factor adjustments.', filename: 'pmpm-calculator-guide.pdf', order: 1 },
  { id: 'res-19', moduleOrder: 6, title: 'Shared Savings Contract Term Sheet Template', description: 'Key contract terms including benchmark methodology, quality gates, sharing percentages, and sample language.', filename: 'shared-savings-term-sheet.pdf', order: 2 },
  { id: 'res-20', moduleOrder: 6, title: 'Payer Negotiation Preparation Checklist', description: 'Pre-negotiation data gathering, SWOT analysis, negotiation priorities, and counter-offer strategies.', filename: 'payer-negotiation-checklist.pdf', order: 3 },
  { id: 'res-21', moduleOrder: 6, title: 'Total Cost of Care Benchmarking Worksheet', description: 'TCOC calculation methodology, benchmark sources, service category breakdown, and variance analysis.', filename: 'tcoc-benchmarking-worksheet.pdf', order: 4 },
  // Bonus
  { id: 'res-22', moduleOrder: 0, title: 'Complete VBC Implementation Toolkit', description: 'Combined highlights from all modules: executive summary, 90-day action plan, key metrics dashboard, and resource directory.', filename: 'vbc-implementation-toolkit.pdf', order: 1 },
]

export function getResourcesForModuleOrder(moduleOrder: number): ResourceDef[] {
  return RESOURCES.filter(r => r.moduleOrder === moduleOrder).sort((a, b) => a.order - b.order)
}

export function getResourceById(id: string): ResourceDef | undefined {
  return RESOURCES.find(r => r.id === id)
}
