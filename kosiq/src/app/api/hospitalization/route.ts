import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const events = await prisma.hospitalizationEvent.findMany({
    include: { patient: { select: { firstName: true, lastName: true, externalId: true, primaryPayer: true, pcpName: true } } },
  });

  const totalUtil = events.length;
  const readmissions = events.filter(e => e.isReadmission).length;
  const avoidable = events.filter(e => e.isAvoidable).length;
  const avgLOS = events.reduce((s, e) => s + e.los, 0) / (totalUtil || 1);
  const memberCount = 2000;
  const utilPer1K = Math.round((totalUtil / memberCount) * 1000);
  const bedDaysPer1K = Math.round((events.reduce((s, e) => s + e.los, 0) / memberCount) * 1000 * 100) / 100;

  // YTD trend by month
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const y2025: Record<string, number> = {};
  events.forEach(e => {
    const m = monthNames[e.admitDate.getMonth()];
    y2025[m] = (y2025[m] || 0) + 1;
  });
  const ytdTrend = monthNames.map(m => ({
    month: m,
    y2024: Math.round(60 + Math.random() * 40),
    y2025: y2025[m] || 0,
  }));

  // Top utilizers
  const patientMap: Record<string, any> = {};
  events.forEach(e => {
    const pid = e.patientId;
    if (!patientMap[pid]) patientMap[pid] = {
      name: `${e.patient.firstName} ${e.patient.lastName}`,
      id: e.patient.externalId,
      admissions: 0, erVisits: 0, los: 0, avoidable: false,
      payer: e.patient.primaryPayer, facility: e.facility,
    };
    patientMap[pid].admissions++;
    if (e.eventType === 'ER') patientMap[pid].erVisits++;
    patientMap[pid].los += e.los;
    if (e.isAvoidable) patientMap[pid].avoidable = true;
  });
  const topUtilizers = Object.values(patientMap)
    .sort((a: any, b: any) => b.admissions - a.admissions)
    .slice(0, 15);

  return NextResponse.json({
    kpis: {
      utilPer1K,
      rollingUtilPer1K: Math.round(utilPer1K * 2.3),
      totalUtil,
      totalReadmissions: readmissions,
      readmissionPct: Math.round((readmissions / (totalUtil || 1)) * 1000) / 10,
      avgLOS: Math.round(avgLOS * 100) / 100,
      bedDaysPer1K,
    },
    ytdTrend,
    topUtilizers,
  });
}
