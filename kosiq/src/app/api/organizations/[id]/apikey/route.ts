import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import prisma from '@/lib/prisma';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const { id } = await params;
    const apiKey = `kosiq_org_${randomBytes(16).toString('hex')}`;

    await prisma.organization.update({
      where: { id },
      data: { apiKey },
    });

    await logAction({ userId: user.id, action: 'generate_api_key', resource: `org:${id}`, ipAddress: getIpAddress(req) });

    return NextResponse.json({ success: true, apiKey });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    const { id } = await params;
    await prisma.organization.update({
      where: { id },
      data: { apiKey: null },
    });

    await logAction({ userId: user.id, action: 'revoke_api_key', resource: `org:${id}`, ipAddress: getIpAddress(req) });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
