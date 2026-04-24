import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';
import { exportClaims } from '@/lib/excel-export';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('export_data');
    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const filters = {
      from: searchParams.get('from') || undefined,
      to: searchParams.get('to') || undefined,
      payer: searchParams.get('payer') || undefined,
    };

    const { buffer, filename } = await exportClaims(user.organizationId, filters);
    await logAction({ userId: user.id, action: 'export_claims', details: filters, ipAddress: getIpAddress(req) });

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
