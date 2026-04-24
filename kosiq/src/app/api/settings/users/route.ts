import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

const SUPERADMIN_EMAILS = ['suarey@gmail.com', 'suareyai@gmail.com'];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !SUPERADMIN_EMAILS.includes(session.user.email)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    select: {
      id: true, email: true, name: true, role: true, systemRole: true,
      organizationId: true, lastLoginAt: true, createdAt: true,
      organization: { select: { name: true } },
      orgMemberships: { select: { role: true, productAccess: true, organization: { select: { name: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(users);
}
