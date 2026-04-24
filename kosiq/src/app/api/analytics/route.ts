import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('view_analytics');
    const orgFilter = user.organizationId ? { patient: { organizationId: user.organizationId } } : {};

    const claims = await prisma.claim.findMany({
      where: orgFilter,
      select: { claimType: true, amount: true, claimDate: true, payer: true, diagnosisCode: true, procedureCode: true, patientId: true },
    });

    await logAction({ userId: user.id, action: 'view_analytics', ipAddress: getIpAddress(req) });

    // Cost by category over time
    const byCatMonth: Record<string, Record<string, number>> = {};
    claims.forEach(c => {
      const d = new Date(c.claimDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!byCatMonth[key]) byCatMonth[key] = {};
      byCatMonth[key][c.claimType] = (byCatMonth[key][c.claimType] || 0) + c.amount;
    });
    const costByCategory = Object.entries(byCatMonth).sort().map(([month, cats]) => ({ month, ...Object.fromEntries(Object.entries(cats).map(([k, v]) => [k, Math.round(v)])) }));

    const diagLabels: Record<string, string> = {
      'E11.9': 'Type 2 Diabetes', 'I10': 'Hypertension', 'I50.9': 'Heart Failure',
      'J44.1': 'COPD w/ Exacerbation', 'N18.3': 'CKD Stage 3', 'E66.01': 'Morbid Obesity',
      'F32.1': 'Major Depression', 'I48.91': 'Atrial Fibrillation', 'I25.10': 'Coronary Artery Disease',
      'J45.20': 'Mild Persistent Asthma', 'E78.5': 'Hyperlipidemia', 'M17.11': 'Osteoarthritis Knee',
      'F41.1': 'Generalized Anxiety', 'E03.9': 'Hypothyroidism', 'K21.0': 'GERD w/ Esophagitis',
      'G89.29': 'Chronic Pain', 'G47.33': 'Obstructive Sleep Apnea', 'G62.9': 'Polyneuropathy',
      'D64.9': 'Anemia', 'M81.0': 'Osteoporosis',
    };

    const byDiag: Record<string, number> = {};
    claims.forEach(c => { if (c.diagnosisCode) byDiag[c.diagnosisCode] = (byDiag[c.diagnosisCode] || 0) + c.amount; });
    const topDiagnoses = Object.entries(byDiag).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([code, cost]) => ({ code, name: diagLabels[code] || code, cost: Math.round(cost) }));

    const procLabels: Record<string, string> = {
      '99213': 'Office Visit L3', '99214': 'Office Visit L4', '99215': 'Office Visit L5',
      '99283': 'ER Visit L3', '99284': 'ER Visit L4', '99285': 'ER Visit L5',
      '99291': 'Critical Care', '99232': 'Hospital Visit L2', '99233': 'Hospital Visit L3',
      '99238': 'Hospital Discharge', '90834': 'Psychotherapy 45min', '90837': 'Psychotherapy 60min',
      '97110': 'Therapeutic Exercise', '97140': 'Manual Therapy', '70553': 'Brain MRI',
      '71046': 'Chest X-ray', '73721': 'MRI Lower Extremity', '74177': 'CT Abdomen/Pelvis',
      '80053': 'Comprehensive Panel', '85025': 'CBC with Diff',
    };

    const byProc: Record<string, number> = {};
    claims.forEach(c => { if (c.procedureCode) byProc[c.procedureCode] = (byProc[c.procedureCode] || 0) + c.amount; });
    const topProcedures = Object.entries(byProc).sort((a, b) => b[1] - a[1]).slice(0, 10)
      .map(([code, cost]) => ({ code, name: procLabels[code] || code, cost: Math.round(cost) }));

    // Payer comparison
    const patients = await prisma.patient.findMany({
      where: user.organizationId ? { organizationId: user.organizationId } : {},
      select: { id: true, primaryPayer: true },
    });
    const payerPatients: Record<string, Set<string>> = {};
    patients.forEach(p => {
      if (!payerPatients[p.primaryPayer]) payerPatients[p.primaryPayer] = new Set();
      payerPatients[p.primaryPayer].add(p.id);
    });
    const payerCosts: Record<string, number> = {};
    claims.forEach(c => { payerCosts[c.payer] = (payerCosts[c.payer] || 0) + c.amount; });
    const payerComparison = Object.entries(payerCosts).map(([name, total]) => ({
      name, avgCost: Math.round(total / (payerPatients[name]?.size || 1)),
      totalCost: Math.round(total), patients: payerPatients[name]?.size || 0,
    })).sort((a, b) => b.avgCost - a.avgCost);

    // Cost distribution histogram
    const perPatient: Record<string, number> = {};
    claims.forEach(c => { perPatient[c.patientId] = (perPatient[c.patientId] || 0) + c.amount; });
    const buckets = [0, 10000, 25000, 50000, 100000, 200000, 500000, 1000000];
    const histogram = buckets.map((min, i) => {
      const max = buckets[i + 1] || Infinity;
      const count = Object.values(perPatient).filter(v => v >= min && v < max).length;
      return { range: max === Infinity ? `$${(min / 1000)}k+` : `$${(min / 1000)}k-$${(max / 1000)}k`, count };
    });

    return NextResponse.json({ costByCategory, topDiagnoses, topProcedures, payerComparison, histogram });
  } catch (error) {
    return handleAuthError(error);
  }
}
