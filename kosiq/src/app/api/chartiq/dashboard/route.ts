import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  const totalPatients = await prisma.chartPatient.count({ where: { status: { in: ['admitted', 'Admitted'] } } });
  const criticalLabs = await prisma.chartLab.findMany({
    where: { flag: { in: ['critical', 'Critical'] } },
    include: { patient: true },
    orderBy: { resultAt: 'desc' },
    take: 10,
  });
  const pendingOrders = await prisma.chartOrder.count({ where: { status: { in: ['pending', 'Pending'] } } });
  const patients = await prisma.chartPatient.findMany({ where: { status: { in: ['admitted', 'Admitted'] } } });

  const deptCounts: Record<string, number> = {};
  for (const p of patients) {
    const note = await prisma.chartNote.findFirst({ where: { patientId: p.id }, orderBy: { createdAt: 'desc' } });
    const dept = note?.department || 'Unknown';
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
