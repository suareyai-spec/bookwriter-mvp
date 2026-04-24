import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const totalPatients = await prisma.patient.count({ where: { status: 'admitted' } });
  const criticalLabs = await prisma.labResult.findMany({
    where: { flag: 'critical' },
    include: { patient: true },
    orderBy: { resultAt: 'desc' },
    take: 10,
  });
  const pendingOrders = await prisma.order.count({ where: { status: 'pending' } });
  const patients = await prisma.patient.findMany({ where: { status: 'admitted' } });

  const deptCounts: Record<string, number> = {};
  for (const p of patients) {
    const notes = await prisma.chartNote.findFirst({ where: { patientId: p.id }, orderBy: { createdAt: 'desc' } });
    const dept = notes?.department || 'Unknown';
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  }

  return NextResponse.json({
    totalPatients,
    criticalAlerts: criticalLabs.length,
    pendingOrders,
    departmentCensus: Object.entries(deptCounts).map(([name, count]) => ({ name, count })),
    criticalLabs: criticalLabs.map((l) => ({
      id: l.id,
      patientName: `${l.patient.firstName} ${l.patient.lastName}`,
      patientId: l.patient.id,
      testName: l.testName,
      value: l.value,
      unit: l.unit,
      normalRange: l.normalRange,
      resultAt: l.resultAt,
    })),
  });
}
