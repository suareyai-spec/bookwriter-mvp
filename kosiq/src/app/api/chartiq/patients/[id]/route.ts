import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const patient = await prisma.chartPatient.findUnique({
    where: { id: params.id },
    include: {
      notes: { orderBy: { createdAt: 'desc' } },
      vitals: { orderBy: { recordedAt: 'desc' } },
      medications: { orderBy: { startDate: 'desc' } },
      labResults: { orderBy: { resultAt: 'desc' } },
      orders: { orderBy: { orderedAt: 'desc' } },
      problems: true,
      images: { orderBy: { uploadedAt: 'desc' } },
    },
  });
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(patient);
}
