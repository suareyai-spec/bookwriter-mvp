import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const organizations = await prisma.organization.findMany({
      include: { _count: { select: { users: true, patients: true } } },
      orderBy: { name: 'asc' },
    });

    await logAction({ userId: user.id, action: 'list_organizations', ipAddress: getIpAddress(req) });

    return NextResponse.json({ organizations });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const org = await prisma.organization.create({
      data: {
        name: body.name,
        type: body.type || null,
        npi: body.npi || null,
        taxId: body.taxId || null,
        address: body.address || null,
        city: body.city || null,
        state: body.state || null,
        zip: body.zip || null,
        phone: body.phone || null,
      },
    });

    await logAction({ userId: user.id, action: 'create_organization', resource: `org:${org.id}`, ipAddress: getIpAddress(req) });

    return NextResponse.json({ organization: org }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}
