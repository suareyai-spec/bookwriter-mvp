import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const flows = await prisma.patientFlow.findMany({ orderBy: { appointmentTime: 'asc' } });
  return NextResponse.json(flows);
}

export async function PUT(req: Request) {
  const { id, status, roomNumber } = await req.json();
  const now = new Date();
  const updateData: any = { status };
  if (roomNumber !== undefined) updateData.roomNumber = roomNumber;
  if (status === 'vitals') updateData.vitalsAt = now;
  if (status === 'exam-room') updateData.examRoomAt = now;
  if (status === 'with-provider') updateData.providerAt = now;
  if (status === 'checkout') updateData.checkoutAt = now;
  if (status === 'completed') updateData.completedAt = now;
  const updated = await prisma.patientFlow.update({ where: { id }, data: updateData });
  return NextResponse.json(updated);
}
