import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const enc = await prisma.coreEncounter.findUnique({
    where: { id },
    include: { patient: true },
  });
  if (!enc) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(enc);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const enc = await prisma.coreEncounter.update({ where: { id }, data });
  return NextResponse.json(enc);
}
