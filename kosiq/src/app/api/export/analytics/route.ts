import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';
import { exportAnalytics } from '@/lib/excel-export';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('export_data');
    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const { buffer, filename } = await exportAnalytics(user.organizationId);
    await logAction({ userId: user.id, action: 'export_analytics', ipAddress: getIpAddress(req) });

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
