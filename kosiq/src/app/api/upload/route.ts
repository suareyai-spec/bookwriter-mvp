import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('upload_claims');
    if (!user.organizationId) return NextResponse.json({ uploads: [] });

    const uploads = await prisma.dataUpload.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ uploads });
  } catch (error) {
    return handleAuthError(error);
  }
}

// Legacy POST — redirect to preview flow
export async function POST() {
  return NextResponse.json({ error: 'Use /api/upload/preview and /api/upload/process instead' }, { status: 400 });
}
