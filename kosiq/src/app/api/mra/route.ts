import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const patients = await prisma.patient.findMany({
    where: { mraScore: { gt: 0 } },
    select: {
      firstName: true, lastName: true, externalId: true, dob: true,
      healthPlan: true, medicalCenter: true, mraScore: true,
    },
  });

  // MRA trend from revenue records
  const revenue = await prisma.revenueRecord.findMany({ orderBy: { month: 'asc' } });
  const mraTrend = revenue.map(r => ({
    month: r.month.replace('2025-0', '').replace('2025-1', '1').replace('2026-0', ''),
    mra: r.mraScore,
  }));

  // By HP
  const hpMap: Record<string, { members: number; totalMRA: number }> = {};
  patients.forEach(p => {
    if (!hpMap[p.healthPlan]) hpMap[p.healthPlan] = { members: 0, totalMRA: 0 };
    hpMap[p.healthPlan].members++;
    hpMap[p.healthPlan].totalMRA += p.mraScore;
  });
  const byHP = Object.entries(hpMap).map(([plan, d]) => ({
    plan, members: d.members, avgMRA: Math.round((d.totalMRA / d.members) * 100) / 100,
  }));

  // By Brand/Center
  const brandMap: Record<string, { members: number; totalMRA: number }> = {};
  patients.forEach(p => {
    if (!brandMap[p.medicalCenter]) brandMap[p.medicalCenter] = { members: 0, totalMRA: 0 };
    brandMap[p.medicalCenter].members++;
    brandMap[p.medicalCenter].totalMRA += p.mraScore;
  });
  const byBrand = Object.entries(brandMap).map(([brand, d]) => ({
    brand, members: d.members, avgMRA: Math.round((d.totalMRA / d.members) * 100) / 100,
  }));

  // Patient-level top 20
  const topPatients = patients
    .sort((a, b) => b.mraScore - a.mraScore)
    .slice(0, 20)
    .map(p => ({
      name: `${p.firstName} ${p.lastName}`,
      id: p.externalId,
      dob: p.dob.toISOString().split('T')[0],
      plan: p.healthPlan,
      mra: Math.round(p.mraScore * 100) / 100,
    }));

  return NextResponse.json({
    totalWithReports: patients.length,
    mraTrend,
    byHP,
    byBrand,
    topPatients,
  });
}
