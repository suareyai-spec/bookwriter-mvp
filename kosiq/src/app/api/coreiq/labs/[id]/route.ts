import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lab = await prisma.coreLabOrder.findUnique({
    where: { id },
    include: { patient: true },
  });
  if (!lab) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(lab);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await req.json();
  const lab = await prisma.coreLabOrder.update({ where: { id }, data });
  return NextResponse.json(lab);
}
