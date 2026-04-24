import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('view_reports');
    const where: any = {};
    if (user.organizationId) where.organizationId = user.organizationId;

    // Also include reports with no org (legacy)
    const reports = await prisma.report.findMany({
      where: { OR: [where, { organizationId: null }] },
      orderBy: { period: 'desc' },
    });

    await logAction({ userId: user.id, action: 'view_reports', ipAddress: getIpAddress(req) });

    return NextResponse.json({ reports: reports.map(r => ({ ...r, summary: JSON.parse(r.summary) })) });
  } catch (error) {
    return handleAuthError(error);
  }
}
