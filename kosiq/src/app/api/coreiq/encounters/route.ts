import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const status = req.nextUrl.searchParams.get('status') || '';
  const provider = req.nextUrl.searchParams.get('provider') || '';

  const where: any = {};
  if (status) where.status = status;
  if (provider) where.providerName = provider;
  if (search) {
    where.OR = [
      { chiefComplaint: { contains: search } },
      { patient: { OR: [{ firstName: { contains: search } }, { lastName: { contains: search } }, { mrn: { contains: search } }] } },
    ];
  }

  const encounters = await prisma.coreEncounter.findMany({
    where,
    include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
    orderBy: { date: 'desc' },
    take: 100,
  });
  return NextResponse.json(encounters);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const enc = await prisma.coreEncounter.create({ data });
  return NextResponse.json(enc);
}
