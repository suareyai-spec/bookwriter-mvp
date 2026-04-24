import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patientId = searchParams.get('patientId');
  const noteType = searchParams.get('noteType');

  const notes = await prisma.chartNote.findMany({
    where: {
      ...(patientId ? { patientId } : {}),
      ...(noteType ? { noteType } : {}),
    },
    include: { patient: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return NextResponse.json(notes);
}

export async function POST(req: Request) {
  const data = await req.json();
  const note = await prisma.chartNote.create({ data });
  return NextResponse.json(note);
}
