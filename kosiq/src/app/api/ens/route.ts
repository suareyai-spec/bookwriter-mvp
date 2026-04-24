import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('view_ens');
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const hospital = searchParams.get('hospital') || '';

    const where: any = {};
    if (user.organizationId) where.patient = { organizationId: user.organizationId };
    if (status) where.status = status;
    if (hospital) where.hospitalName = hospital;

    const events = await prisma.eNSEvent.findMany({
      where,
      include: { patient: { select: { firstName: true, lastName: true, dob: true, riskScore: true, riskLevel: true, primaryPayer: true } } },
      orderBy: { admitDate: 'desc' },
      take: 100,
    });

    await logAction({ userId: user.id, action: 'view_ens', ipAddress: getIpAddress(req) });

    return NextResponse.json({
      events: events.map(e => ({
        id: e.id, patientId: e.patientId,
        patientName: `${e.patient.firstName} ${e.patient.lastName}`,
        patientDob: e.patient.dob, riskScore: e.patient.riskScore, riskLevel: e.patient.riskLevel,
        payer: e.patient.primaryPayer, hospital: e.hospitalName, admissionType: e.admissionType,
        admitDate: e.admitDate, dischargeDate: e.dischargeDate, diagnosis: e.diagnosis, status: e.status,
      })),
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
