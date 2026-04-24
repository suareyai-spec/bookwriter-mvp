import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const { allergies, dietaryRestrictions, codeStatus } = body;

  const patient = await prisma.chartPatient.update({
    where: { id: params.id },
    data: {
      ...(allergies !== undefined && { allergies }),
      ...(dietaryRestrictions !== undefined && { dietaryRestrictions }),
      ...(codeStatus !== undefined && { codeStatus }),
    },
  });

  return NextResponse.json(patient);
}
