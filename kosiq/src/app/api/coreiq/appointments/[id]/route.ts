import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const appt = await prisma.coreAppointment.update({ where: { id }, data });
  return NextResponse.json(appt);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await prisma.coreAppointment.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
