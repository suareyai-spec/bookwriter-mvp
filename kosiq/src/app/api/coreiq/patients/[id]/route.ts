import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await prisma.corePatient.findUnique({
    where: { id },
    include: {
      appointments: { orderBy: { date: 'desc' }, take: 20 },
      encounters: { orderBy: { date: 'desc' }, take: 20 },
      prescriptions: { orderBy: { prescribedDate: 'desc' } },
      labOrders: { orderBy: { orderDate: 'desc' } },
      claims: { orderBy: { dateOfService: 'desc' } },
      messagesAbout: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
  });
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(patient);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const patient = await prisma.corePatient.update({ where: { id }, data });
  return NextResponse.json(patient);
}
