import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const status = req.nextUrl.searchParams.get('status') || '';

  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { tests: { contains: search } },
      { patient: { OR: [{ firstName: { contains: search } }, { lastName: { contains: search } }] } },
    ];
  }

  const labs = await prisma.coreLabOrder.findMany({
    where,
    include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
    orderBy: { orderDate: 'desc' },
    take: 200,
  });
  return NextResponse.json(labs);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const lab = await prisma.coreLabOrder.create({ data });
  return NextResponse.json(lab);
}
