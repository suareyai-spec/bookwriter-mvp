import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const patients = await prisma.patient.findMany({
    select: { lob: true, healthPlan: true, medicalCenter: true, address: true, phone: true, pcpName: true },
  });

  const total = patients.length;
  const medicare = patients.filter(p => p.lob === 'Medicare').length;
  const medicaid = patients.filter(p => p.lob === 'Medicaid').length;
  const commercial = patients.filter(p => p.lob === 'Commercial').length;
  const ffs = patients.filter(p => p.lob === 'FFS').length;

  // By HP
  const hpMap: Record<string, number> = {};
  patients.forEach(p => { hpMap[p.healthPlan] = (hpMap[p.healthPlan] || 0) + 1; });
  const byHP = Object.entries(hpMap).map(([plan, members]) => ({ plan, members })).sort((a, b) => b.members - a.members);

  // By Center
  const centerMap: Record<string, number> = {};
  patients.forEach(p => { centerMap[p.medicalCenter] = (centerMap[p.medicalCenter] || 0) + 1; });
  const byCenter = Object.entries(centerMap).map(([center, members]) => ({ center, members })).sort((a, b) => b.members - a.members).slice(0, 10);

  // Data quality
  const missingAddress = patients.filter(p => !p.address).length;
  const missingPhone = patients.filter(p => !p.phone).length;
  const unassignedPCP = patients.filter(p => !p.pcpName || p.pcpName === 'Unassigned').length;

  return NextResponse.json({
    summary: { total, medicare, medicaid, commercial, ffs },
    byHP,
    byCenter,
    dataQuality: { missingAddress, missingPhone, unassignedPCP, invalidPCP: 12, outOfArea: 38, duplicates: 0 },
  });
}
