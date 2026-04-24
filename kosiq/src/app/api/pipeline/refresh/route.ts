import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';
import { processMonthlyRefresh } from '@/lib/data-pipeline';

export async function POST(req: Request) {
  try {
    const user = await requireAuth('generate_reports');
    if (!['admin', 'cmo'].includes(user.role)) {
      return NextResponse.json({ error: 'Admin or CMO role required' }, { status: 403 });
    }
    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const result = await processMonthlyRefresh(user.organizationId);

    await logAction({
      userId: user.id,
      action: 'pipeline_refresh',
      resource: `org:${user.organizationId}`,
      details: result as any,
      ipAddress: getIpAddress(req),
    });

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return handleAuthError(error);
  }
}
