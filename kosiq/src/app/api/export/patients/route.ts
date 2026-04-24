import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';
import { exportPatients } from '@/lib/excel-export';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('export_data');
    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const { buffer, filename } = await exportPatients(user.organizationId);
    await logAction({ userId: user.id, action: 'export_patients', ipAddress: getIpAddress(req) });

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
