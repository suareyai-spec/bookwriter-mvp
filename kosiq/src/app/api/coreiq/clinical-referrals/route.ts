import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const referrals = await prisma.clinicalReferral.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(referrals);
}

export async function PUT(req: Request) {
  const { id, status } = await req.json();
  const updated = await prisma.clinicalReferral.update({ where: { id }, data: { status } });
  return NextResponse.json(updated);
}
