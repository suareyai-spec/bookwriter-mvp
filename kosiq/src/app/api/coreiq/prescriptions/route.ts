import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const status = req.nextUrl.searchParams.get('status') || '';
  const controlled = req.nextUrl.searchParams.get('controlled');

  const where: any = {};
  if (status) where.status = status;
  if (controlled === 'true') where.controlledSubstance = true;
  if (search) {
    where.OR = [
      { medication: { contains: search } },
      { patient: { OR: [{ firstName: { contains: search } }, { lastName: { contains: search } }] } },
    ];
  }

  const prescriptions = await prisma.corePrescription.findMany({
    where,
    include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
    orderBy: { prescribedDate: 'desc' },
    take: 200,
  });
  return NextResponse.json(prescriptions);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const rx = await prisma.corePrescription.create({ data });
  return NextResponse.json(rx);
}
