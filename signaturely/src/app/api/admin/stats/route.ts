import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || !(session.user as any).isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const [totalUsers, totalSignatures, proUsers, recentUsers] = await Promise.all([
    prisma.user.count(),
    prisma.signature.count(),
    prisma.user.count({ where: { plan: 'pro' } }),
    prisma.user.findMany({ orderBy: { createdAt: 'desc' }, take: 10, select: { id: true, name: true, email: true, plan: true, createdAt: true } }),
  ]);
  return NextResponse.json({ totalUsers, totalSignatures, proUsers, recentUsers });
}
