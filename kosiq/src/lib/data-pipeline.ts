import prisma from './prisma';
import { calculateRiskScore, generateCostAnalysis, generateMonthlyReport } from './ai-engine';

export interface RefreshResult {
  patientsScored: number;
  reportGenerated: boolean;
  alertsCreated: number;
}

export async function processMonthlyRefresh(orgId: string): Promise<RefreshResult> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];

  // 1. Recalculate risk scores for all patients
  const patients = await prisma.patient.findMany({ where: { organizationId: orgId }, select: { id: true } });
  let scored = 0;
  for (const p of patients) {
    try {
      const result = await calculateRiskScore(p.id);
      await prisma.patient.update({
        where: { id: p.id },
        data: { riskScore: Math.round(result.score), riskLevel: result.level },
      });
      scored++;
    } catch (e) {
      console.error(`Failed to score patient ${p.id}:`, e);
    }
  }

  // 2. Generate cost analytics
  await generateCostAnalysis(orgId, month);

  // 3. Generate monthly report
  let reportGenerated = false;
  try {
    const [y, m] = month.split('-').map(Number);
    const reportData = await generateMonthlyReport(orgId, month);
    await prisma.report.create({
      data: {
        period: month,
        title: `${months[m - 1]} ${y} Monthly Report`,
        summary: JSON.stringify(reportData),
        organizationId: orgId,
        generatedBy: 'system-pipeline',
        aiAnalysis: JSON.stringify(reportData),
      },
    });
    reportGenerated = true;
  } catch (e) {
    console.error('Report generation failed:', e);
  }

  // 4. Identify newly high-risk patients
  const highRisk = await prisma.patient.findMany({
    where: { organizationId: orgId, riskScore: { gte: 70 } },
    select: { id: true },
  });

  return { patientsScored: scored, reportGenerated, alertsCreated: highRisk.length };
}

export async function scheduleRefresh(orgId: string, day: number): Promise<void> {
  await prisma.organization.update({
    where: { id: orgId },
    data: { reportDay: day },
  });
}
