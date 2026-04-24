import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const status = req.nextUrl.searchParams.get('status') || '';

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { payer: { contains: search } },
      { patient: { OR: [{ firstName: { contains: search } }, { lastName: { contains: search } }] } },
    ];
  }

  const claims = await prisma.coreClaim.findMany({
    where,
    include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
    orderBy: { dateOfService: 'desc' },
    take: 200,
  });
  return NextResponse.json(claims);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const claim = await prisma.coreClaim.create({ data });
  return NextResponse.json(claim);
}
