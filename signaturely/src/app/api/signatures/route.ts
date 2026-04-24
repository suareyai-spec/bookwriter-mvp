import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const signatures = await prisma.signature.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json(signatures);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session.user as any).id;
  const plan = (session.user as any).plan;

  if (plan === 'free') {
    const count = await prisma.signature.count({ where: { userId } });
    if (count >= 1) return NextResponse.json({ error: 'Free plan allows only 1 signature. Upgrade to Pro!' }, { status: 403 });
  }

  const body = await req.json();
  const signature = await prisma.signature.create({
    data: {
      userId,
      name: body.name || 'My Signature',
      template: body.template || 'classic',
      data: typeof body.data === 'string' ? body.data : JSON.stringify(body.data),
      isDefault: body.isDefault || false,
    },
  });
  return NextResponse.json(signature);
}
