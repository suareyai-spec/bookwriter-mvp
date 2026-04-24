import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const status = req.nextUrl.searchParams.get('status') || '';
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');

  const where: any = {};
  if (search) {
    where.OR = [
      { firstName: { contains: search } },
      { lastName: { contains: search } },
      { mrn: { contains: search } },
      { phone: { contains: search } },
    ];
  }
  if (status) where.status = status;

  const [patients, total] = await Promise.all([
    prisma.corePatient.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { lastName: 'asc' },
      include: {
        _count: { select: { appointments: true, encounters: true, prescriptions: true } },
      },
    }),
    prisma.corePatient.count({ where }),
  ]);

  return NextResponse.json({ patients, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const patient = await prisma.corePatient.create({ data });
  return NextResponse.json(patient);
}
