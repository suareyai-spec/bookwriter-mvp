import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isAdmin } from '@/lib/config';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin((session.user as any).email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const affiliates = await prisma.affiliate.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      conversions: { orderBy: { createdAt: 'desc' }, take: 5 },
    },
  });
  return NextResponse.json({ affiliates });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !isAdmin((session.user as any).email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const affiliate = await prisma.affiliate.create({
    data: {
      code: body.code,
      ownerName: body.ownerName,
      ownerEmail: body.ownerEmail,
      commissionPercent: body.commissionPercent ?? 20,
      isActive: body.isActive ?? true,
    },
  });
  return NextResponse.json({ affiliate });
}
