import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const department = searchParams.get('department') || '';
  const status = searchParams.get('status') || '';

  const patients = await prisma.patient.findMany({
    where: {
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { mrn: { contains: search } },
        ],
      } : {}),
    },
    include: {
      notes: { take: 1, orderBy: { createdAt: 'desc' } },
      problems: { where: { status: 'active' }, take: 3 },
    },
    orderBy: { lastName: 'asc' },
  });

  let filtered = patients;
  if (department) {
    filtered = patients.filter((p) => p.notes.some((n) => n.department === department));
  }

  return NextResponse.json(filtered);
}
