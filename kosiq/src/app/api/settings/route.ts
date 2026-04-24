import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('view_dashboard');
    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const [org, users] = await Promise.all([
      prisma.organization.findUnique({ where: { id: user.organizationId } }),
      prisma.user.findMany({
        where: { organizationId: user.organizationId },
        select: { id: true, email: true, name: true, role: true, createdAt: true, lastLoginAt: true },
      }),
    ]);

    return NextResponse.json({ organization: org, users, currentUser: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin' && user.role !== 'cmo') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const body = await req.json();
    const org = await prisma.organization.update({
      where: { id: user.organizationId },
      data: {
        name: body.name,
        type: body.type,
        npi: body.npi,
        taxId: body.taxId,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip,
        phone: body.phone,
      },
    });

    await logAction({ userId: user.id, action: 'update_org_settings', resource: `org:${org.id}`, ipAddress: getIpAddress(req) });

    return NextResponse.json({ organization: org });
  } catch (error) {
    return handleAuthError(error);
  }
}
