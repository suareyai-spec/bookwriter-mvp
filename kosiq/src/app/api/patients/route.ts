import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('view_patients');
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const riskLevel = searchParams.get('riskLevel') || '';
    const payer = searchParams.get('payer') || '';
    const sort = searchParams.get('sort') || 'riskScore';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const where: any = {};
    if (user.organizationId) where.organizationId = user.organizationId;
    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { externalId: { contains: search } },
      ];
    }
    if (riskLevel) where.riskLevel = riskLevel;
    if (payer) where.primaryPayer = payer;

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: {
          claims: { select: { claimType: true, amount: true } },
          ensEvents: { select: { admitDate: true, admissionType: true }, orderBy: { admitDate: 'desc' }, take: 1 },
        },
        orderBy: { [sort]: order },
        take: limit,
        skip: offset,
      }),
      prisma.patient.count({ where }),
    ]);

    await logAction({ userId: user.id, action: 'view_patients', details: { search, riskLevel, total }, ipAddress: getIpAddress(req) });

    const result = patients.map(p => {
      const totalCost = p.claims.reduce((s, c) => s + c.amount, 0);
      const pharmacy = p.claims.filter(c => c.claimType === 'Pharmacy').reduce((s, c) => s + c.amount, 0);
      const inpatient = p.claims.filter(c => c.claimType === 'Inpatient').reduce((s, c) => s + c.amount, 0);
      const erVisits = p.claims.filter(c => c.claimType === 'ER').length;
      const specialist = p.claims.filter(c => c.claimType === 'Specialist').reduce((s, c) => s + c.amount, 0);
      const lastER = p.ensEvents[0]?.admitDate || null;
      return {
        id: p.id, externalId: p.externalId, firstName: p.firstName, lastName: p.lastName,
        dob: p.dob, gender: p.gender, pcpName: p.pcpName,
        riskScore: p.riskScore, riskLevel: p.riskLevel, primaryPayer: p.primaryPayer,
        lob: p.lob, healthPlan: p.healthPlan, medicalCenter: p.medicalCenter,
        mraScore: p.mraScore, address: p.address, phone: p.phone,
        totalCost: Math.round(totalCost), pharmacy: Math.round(pharmacy),
        inpatient: Math.round(inpatient), erVisits, specialist: Math.round(specialist), lastER,
      };
    });

    return NextResponse.json({ patients: result, total });
  } catch (error) {
    return handleAuthError(error);
  }
}
