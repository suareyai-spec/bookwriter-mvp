import Anthropic from '@anthropic-ai/sdk';
import prisma from './prisma';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function askClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  });
  const block = response.content[0];
  return block.type === 'text' ? block.text : '';
}

export interface RiskScoreResult {
  score: number;
  level: string;
  factors: Record<string, any>;
}

export async function calculateRiskScore(patientId: string): Promise<RiskScoreResult> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    include: { claims: true, ensEvents: true },
  });
  if (!patient) throw new Error('Patient not found');

  const totalCost = patient.claims.reduce((s, c) => s + c.amount, 0);
  const erVisits = patient.claims.filter(c => c.claimType === 'ER').length;
  const inpatientClaims = patient.claims.filter(c => c.claimType === 'Inpatient');
  const conditions = JSON.parse(patient.conditions);
  const diagCounts: Record<string, number> = {};
  patient.claims.forEach(c => {
    if (c.diagnosisCode) diagCounts[c.diagnosisCode] = (diagCounts[c.diagnosisCode] || 0) + 1;
  });

  const summary = `Patient: ${patient.firstName} ${patient.lastName}, Age: ${Math.floor((Date.now() - new Date(patient.dob).getTime()) / 31557600000)}, Gender: ${patient.gender}
Conditions: ${conditions.join(', ')}
Total claims: ${patient.claims.length}, Total cost: $${totalCost.toFixed(2)}
ER visits: ${erVisits}, Inpatient stays: ${inpatientClaims.length}
ENS events: ${patient.ensEvents.length}
Top diagnoses: ${Object.entries(diagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => `${k}(${v})`).join(', ')}`;

  const result = await askClaude(
    'You are a healthcare risk scoring AI. Analyze patient data and return ONLY valid JSON with: {"score": 0-100, "level": "low"|"moderate"|"high"|"critical", "factors": {"key": "description"}}',
    summary
  );

  try {
    const parsed = JSON.parse(result.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
    await prisma.riskScore.create({
      data: { patientId, score: parsed.score, level: parsed.level, factors: JSON.stringify(parsed.factors) },
    });
    return parsed;
  } catch {
    return { score: patient.riskScore, level: patient.riskLevel.toLowerCase(), factors: { note: 'AI parse failed, using existing score' } };
  }
}

export interface CostAnalysis {
  pmpm: number;
  totalCost: number;
  costDrivers: { category: string; amount: number; pct: number }[];
  outliers: { patientId: string; name: string; cost: number }[];
  aiInsights: string;
}

export async function generateCostAnalysis(orgId: string, period?: string): Promise<CostAnalysis> {
  const where: any = { patient: { organizationId: orgId } };
  if (period) {
    const [year, month] = period.split('-').map(Number);
    where.claimDate = {
      gte: new Date(year, month - 1, 1),
      lt: new Date(year, month, 1),
    };
  }

  const claims = await prisma.claim.findMany({ where, include: { patient: { select: { id: true, firstName: true, lastName: true } } } });
  const patientCount = new Set(claims.map(c => c.patientId)).size;
  const totalCost = claims.reduce((s, c) => s + c.amount, 0);
  const pmpm = patientCount > 0 ? totalCost / patientCount : 0;

  const byType: Record<string, number> = {};
  claims.forEach(c => { byType[c.claimType] = (byType[c.claimType] || 0) + c.amount; });
  const costDrivers = Object.entries(byType)
    .map(([category, amount]) => ({ category, amount: Math.round(amount), pct: Math.round((amount / totalCost) * 100) }))
    .sort((a, b) => b.amount - a.amount);

  const perPatient: Record<string, { cost: number; name: string }> = {};
  claims.forEach(c => {
    if (!perPatient[c.patientId]) perPatient[c.patientId] = { cost: 0, name: `${c.patient.firstName} ${c.patient.lastName}` };
    perPatient[c.patientId].cost += c.amount;
  });
  const outliers = Object.entries(perPatient)
    .map(([patientId, { cost, name }]) => ({ patientId, name, cost: Math.round(cost) }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  const summary = `Organization cost analysis${period ? ` for ${period}` : ''}:
Total cost: $${totalCost.toFixed(0)}, Patients: ${patientCount}, PMPM: $${pmpm.toFixed(0)}
Cost by type: ${costDrivers.map(d => `${d.category}: $${d.amount} (${d.pct}%)`).join(', ')}
Top 5 costliest patients: ${outliers.slice(0, 5).map(o => `${o.name}: $${o.cost}`).join(', ')}`;

  let aiInsights = '';
  try {
    aiInsights = await askClaude(
      'You are a healthcare cost analyst. Provide 3-5 actionable insights based on the data. Be specific and data-driven. Keep it concise.',
      summary
    );
  } catch { aiInsights = 'AI analysis unavailable'; }

  return { pmpm: Math.round(pmpm), totalCost: Math.round(totalCost), costDrivers, outliers, aiInsights };
}

export interface MonthlyReportData {
  executiveSummary: string;
  keyMetrics: Record<string, any>;
  riskAlerts: string[];
  costTrends: any[];
  recommendations: string[];
}

export async function generateMonthlyReport(orgId: string, month: string): Promise<MonthlyReportData> {
  const [year, m] = month.split('-').map(Number);
  const start = new Date(year, m - 1, 1);
  const end = new Date(year, m, 1);

  const [claims, patients, ensEvents] = await Promise.all([
    prisma.claim.findMany({ where: { patient: { organizationId: orgId }, claimDate: { gte: start, lt: end } } }),
    prisma.patient.findMany({ where: { organizationId: orgId }, select: { id: true, riskScore: true, riskLevel: true, firstName: true, lastName: true } }),
    prisma.eNSEvent.findMany({ where: { patient: { organizationId: orgId }, admitDate: { gte: start, lt: end } } }),
  ]);

  const totalCost = claims.reduce((s, c) => s + c.amount, 0);
  const highRisk = patients.filter(p => p.riskScore > 50).length;
  const erClaims = claims.filter(c => c.claimType === 'ER').length;
  const inpatientClaims = claims.filter(c => c.claimType === 'Inpatient').length;

  const summary = `Monthly report for ${month}:
Patients: ${patients.length}, High risk: ${highRisk}
Total claims: ${claims.length}, Total cost: $${totalCost.toFixed(0)}
ER visits: ${erClaims}, Inpatient: ${inpatientClaims}, ENS events: ${ensEvents.length}
PMPM: $${(totalCost / Math.max(patients.length, 1)).toFixed(0)}`;

  let aiResult: any = {};
  try {
    const raw = await askClaude(
      'You are a healthcare analytics AI generating a monthly report. Return ONLY valid JSON: {"executiveSummary": "...", "riskAlerts": ["..."], "recommendations": ["..."]}',
      summary
    );
    aiResult = JSON.parse(raw.replace(/```json?\n?/g, '').replace(/```/g, '').trim());
  } catch { /* use defaults */ }

  return {
    executiveSummary: aiResult.executiveSummary || `In ${month}, total cost of care was $${(totalCost / 1e6).toFixed(1)}M across ${patients.length} patients.`,
    keyMetrics: { totalCost: Math.round(totalCost), totalPatients: patients.length, highRisk, erVisits: erClaims, inpatient: inpatientClaims, ensEvents: ensEvents.length, pmpm: Math.round(totalCost / Math.max(patients.length, 1)) },
    riskAlerts: aiResult.riskAlerts || [],
    costTrends: [],
    recommendations: aiResult.recommendations || [],
  };
}

export interface HighRiskAlert {
  patientId: string;
  patientName: string;
  riskScore: number;
  reason: string;
  recommendedIntervention: string;
}

export async function identifyHighRiskPatients(orgId: string): Promise<HighRiskAlert[]> {
  const patients = await prisma.patient.findMany({
    where: { organizationId: orgId, riskScore: { gte: 60 } },
    include: { claims: { orderBy: { claimDate: 'desc' }, take: 50 }, ensEvents: { orderBy: { admitDate: 'desc' }, take: 5 } },
    orderBy: { riskScore: 'desc' },
    take: 25,
  });

  const alerts: HighRiskAlert[] = [];
  for (const p of patients) {
    const totalCost = p.claims.reduce((s, c) => s + c.amount, 0);
    const erVisits = p.claims.filter(c => c.claimType === 'ER').length;
    const conditions = JSON.parse(p.conditions);
    const recentENS = p.ensEvents.length;

    let reason = '';
    let intervention = '';

    if (p.riskScore >= 80) {
      reason = `Critical risk (${p.riskScore}/100). ${conditions.length} conditions, $${Math.round(totalCost)} total cost, ${erVisits} ER visits.`;
      intervention = 'Immediate care management enrollment. Assign dedicated care coordinator.';
    } else {
      reason = `High risk (${p.riskScore}/100). ${erVisits} ER visits, ${recentENS} recent hospital events.`;
      intervention = 'Proactive outreach and care plan review recommended.';
    }

    alerts.push({
      patientId: p.id,
      patientName: `${p.firstName} ${p.lastName}`,
      riskScore: p.riskScore,
      reason,
      recommendedIntervention: intervention,
    });
  }

  return alerts;
}
