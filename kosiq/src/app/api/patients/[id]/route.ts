import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth('view_patients');
    const { id } = await params;

    const where: any = { id };
    if (user.organizationId) where.organizationId = user.organizationId;

    const patient = await prisma.patient.findFirst({
      where,
      include: {
        claims: { orderBy: { claimDate: 'desc' } },
        ensEvents: { orderBy: { admitDate: 'desc' } },
      },
    });

    if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await logAction({ userId: user.id, action: 'view_patient', resource: `patient:${id}`, ipAddress: getIpAddress(req) });

    const monthlyCosts: Record<string, Record<string, number>> = {};
    patient.claims.forEach(c => {
      const d = new Date(c.claimDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyCosts[key]) monthlyCosts[key] = {};
      monthlyCosts[key][c.claimType] = (monthlyCosts[key][c.claimType] || 0) + c.amount;
      monthlyCosts[key]['total'] = (monthlyCosts[key]['total'] || 0) + c.amount;
    });
    const costTimeline = Object.entries(monthlyCosts).sort().map(([month, costs]) => ({ month, ...costs }));

    const byCategory: Record<string, number> = {};
    patient.claims.forEach(c => { byCategory[c.claimType] = (byCategory[c.claimType] || 0) + c.amount; });
    const costByCategory = Object.entries(byCategory).map(([name, value]) => ({ name, value: Math.round(value) }));

    const totalCost = patient.claims.reduce((s, c) => s + c.amount, 0);
    const pharmacyCost = byCategory['Pharmacy'] || 0;
    const erCount = patient.claims.filter(c => c.claimType === 'ER').length;
    const conditions = JSON.parse(patient.conditions as string);

    const insights = [
      pharmacyCost > totalCost * 0.3
        ? `Pharmacy costs represent ${((pharmacyCost / totalCost) * 100).toFixed(0)}% of total spend ($${Math.round(pharmacyCost).toLocaleString()}). Review medication management.`
        : `Pharmacy spend within normal range at ${((pharmacyCost / totalCost) * 100).toFixed(0)}% of total cost.`,
      erCount > 6
        ? `${erCount} ER visits — significantly above average. Recommend care coordination.`
        : `ER utilization ${erCount > 3 ? 'moderately elevated' : 'acceptable'} with ${erCount} visits.`,
      conditions.includes('Type 2 Diabetes') && conditions.includes('Hypertension')
        ? 'Comorbid diabetes and hypertension. Recommend integrated care management.'
        : conditions.includes('Congestive Heart Failure')
        ? 'CHF diagnosis requires telemonitoring and post-discharge follow-up.'
        : `${conditions.length} active conditions. Standard protocols recommended.`,
      patient.riskScore > 75
        ? `CRITICAL RISK: Score ${patient.riskScore}/100. Immediate intervention recommended.`
        : patient.riskScore > 50
        ? `HIGH RISK: Score ${patient.riskScore}/100. Proactive management recommended.`
        : `Risk score ${patient.riskScore}/100 — routine monitoring.`,
    ];

    return NextResponse.json({
      patient: {
        id: patient.id, externalId: patient.externalId, firstName: patient.firstName,
        lastName: patient.lastName, dob: patient.dob, gender: patient.gender,
        primaryPayer: patient.primaryPayer, pcpName: patient.pcpName,
        riskScore: patient.riskScore, riskLevel: patient.riskLevel,
        conditions, totalCost: Math.round(totalCost),
      },
      costTimeline, costByCategory, insights,
      claims: patient.claims.slice(0, 100).map(c => ({
        id: c.id, date: c.claimDate, type: c.claimType, provider: c.providerName,
        amount: c.amount, status: c.status, diagnosis: c.diagnosisCode,
      })),
      ensEvents: patient.ensEvents.map(e => ({
        id: e.id, hospital: e.hospitalName, type: e.admissionType,
        admitDate: e.admitDate, dischargeDate: e.dischargeDate,
        diagnosis: e.diagnosis, status: e.status,
      })),
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
