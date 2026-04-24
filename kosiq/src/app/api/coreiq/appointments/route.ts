import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const status = req.nextUrl.searchParams.get('status') || '';
  const type = req.nextUrl.searchParams.get('type') || '';
  const dateFrom = req.nextUrl.searchParams.get('dateFrom');
  const dateTo = req.nextUrl.searchParams.get('dateTo');
  const provider = req.nextUrl.searchParams.get('provider') || '';

  const where: any = {};
  if (status) where.status = status;
  if (type) where.type = type;
  if (provider) where.providerName = provider;
  if (dateFrom || dateTo) {
    where.date = {};
    if (dateFrom) where.date.gte = new Date(dateFrom);
    if (dateTo) where.date.lte = new Date(dateTo);
  }
  if (search) {
    where.patient = {
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { mrn: { contains: search } },
      ],
    };
  }

  const appointments = await prisma.coreAppointment.findMany({
    where,
    include: { patient: { select: { firstName: true, lastName: true, mrn: true, phone: true } } },
    orderBy: [{ date: 'desc' }, { time: 'asc' }],
    take: 200,
  });

  return NextResponse.json(appointments);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const appt = await prisma.coreAppointment.create({
    data,
    include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
  });
  return NextResponse.json(appt);
}
