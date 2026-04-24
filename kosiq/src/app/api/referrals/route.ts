import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const referrals = await prisma.referral.findMany({
    take: 100,
    orderBy: { referralDate: 'desc' },
    include: { patient: { select: { firstName: true, lastName: true, dob: true, externalId: true } } },
  });
  return NextResponse.json(referrals);
}
