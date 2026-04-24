import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('search') || '';
  const unreadOnly = req.nextUrl.searchParams.get('unreadOnly') === 'true';

  const where: any = {};
  if (unreadOnly) where.read = false;
  if (search) {
    where.OR = [
      { subject: { contains: search } },
      { fromName: { contains: search } },
      { toName: { contains: search } },
    ];
  }

  const messages = await prisma.coreMessage.findMany({
    where,
    include: { patient: { select: { firstName: true, lastName: true, mrn: true } } },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });
  return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const msg = await prisma.coreMessage.create({ data });
  return NextResponse.json(msg);
}
