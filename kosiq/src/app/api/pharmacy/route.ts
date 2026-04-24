import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const records = await prisma.pharmacyRecord.findMany({
    include: { patient: { select: { firstName: true, lastName: true, externalId: true, pcpName: true } } },
  });

  // Brand vs Generic by count
  const brandCount = records.filter(r => r.drugType === 'Brand').length;
  const genericCount = records.filter(r => r.drugType === 'Generic').length;

  // Brand vs Generic by cost
  const brandCost = records.filter(r => r.drugType === 'Brand').reduce((s, r) => s + r.totalCost, 0);
  const genericCost = records.filter(r => r.drugType === 'Generic').reduce((s, r) => s + r.totalCost, 0);

  // Rx Cost by Month
  const monthMap: Record<string, { brand: number; generic: number }> = {};
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  records.forEach(r => {
    const m = monthNames[r.fillDate.getMonth()];
    if (!monthMap[m]) monthMap[m] = { brand: 0, generic: 0 };
    if (r.drugType === 'Brand') monthMap[m].brand += r.totalCost;
    else monthMap[m].generic += r.totalCost;
  });
  const rxCostByMonth = monthNames.map(m => ({
    month: m,
    brand: Math.round((monthMap[m]?.brand || 0) / 1000),
    generic: Math.round((monthMap[m]?.generic || 0) / 1000),
  }));

  // Rx Count by Month
  const countMap: Record<string, number> = {};
  records.forEach(r => {
    const m = monthNames[r.fillDate.getMonth()];
    countMap[m] = (countMap[m] || 0) + r.rxCount;
  });
  const rxCountByMonth = monthNames.map(m => ({ month: m, count: countMap[m] || 0 }));

  // Top Rx by cost
  const drugCostMap: Record<string, { totalCost: number; rxCount: number; drugType: string }> = {};
  records.forEach(r => {
    if (!drugCostMap[r.drugName]) drugCostMap[r.drugName] = { totalCost: 0, rxCount: 0, drugType: r.drugType };
    drugCostMap[r.drugName].totalCost += r.totalCost;
    drugCostMap[r.drugName].rxCount += r.rxCount;
  });
  const topRx = Object.entries(drugCostMap)
    .map(([name, d]) => ({ drugName: name, totalCost: d.totalCost, rxCount: d.rxCount, drugType: d.drugType }))
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 25);

  // Top Utilizers
  const patientCostMap: Record<string, { name: string; id: string; pcp: string; totalCost: number; rxCount: number; brandCount: number; genericCount: number }> = {};
  records.forEach(r => {
    const pid = r.patientId;
    if (!patientCostMap[pid]) patientCostMap[pid] = {
      name: `${r.patient.lastName}, ${r.patient.firstName}`,
      id: r.patient.externalId,
      pcp: r.patient.pcpName,
      totalCost: 0, rxCount: 0, brandCount: 0, genericCount: 0,
    };
    patientCostMap[pid].totalCost += r.totalCost;
    patientCostMap[pid].rxCount += r.rxCount;
    if (r.drugType === 'Brand') patientCostMap[pid].brandCount++;
    else patientCostMap[pid].genericCount++;
  });
  const topUtilizers = Object.values(patientCostMap)
    .sort((a, b) => b.totalCost - a.totalCost)
    .slice(0, 20);

  return NextResponse.json({
    brandVsGeneric: { count: [{ name: 'Brand', value: brandCount }, { name: 'Generic', value: genericCount }], cost: [{ name: 'Brand', value: Math.round(brandCost) }, { name: 'Generic', value: Math.round(genericCost) }] },
    rxCostByMonth,
    rxCountByMonth,
    topRx,
    topUtilizers,
    totalRecords: records.length,
  });
}
