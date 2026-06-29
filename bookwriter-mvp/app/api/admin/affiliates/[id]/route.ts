import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/config';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin((session.user as any).email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();
  const affiliate = await prisma.affiliate.update({
    where: { id },
    data: {
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.commissionPercent !== undefined && { commissionPercent: body.commissionPercent }),
      ...(body.payoutStatus !== undefined && { payoutStatus: body.payoutStatus }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });
  return NextResponse.json({ affiliate });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin((session.user as any).email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params;
  await prisma.affiliate.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
