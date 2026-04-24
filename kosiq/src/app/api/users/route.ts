import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('manage_users');

    const where: any = {};
    if (user.role !== 'admin' && user.organizationId) {
      where.organizationId = user.organizationId;
    }

    const users = await prisma.user.findMany({
      where,
      select: { id: true, email: true, name: true, role: true, organizationId: true, createdAt: true, lastLoginAt: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth('manage_users');
    const body = await req.json();

    if (!body.email || !body.password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) return NextResponse.json({ error: 'Email already exists' }, { status: 409 });

    const orgId = body.organizationId || user.organizationId;
    const role = body.role || 'viewer';

    // Only admins can create admins
    if (role === 'admin' && user.role !== 'admin') {
      return NextResponse.json({ error: 'Only admins can create admin users' }, { status: 403 });
    }

    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        passwordHash: await bcrypt.hash(body.password, 10),
        name: body.name || null,
        role,
        organizationId: orgId,
      },
    });

    await logAction({ userId: user.id, action: 'create_user', resource: `user:${newUser.id}`, details: { email: body.email, role }, ipAddress: getIpAddress(req) });

    return NextResponse.json({ user: { id: newUser.id, email: newUser.email, name: newUser.name, role: newUser.role } }, { status: 201 });
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    if (!body.userId || !body.role) return NextResponse.json({ error: 'userId and role required' }, { status: 400 });

    const updated = await prisma.user.update({
      where: { id: body.userId },
      data: { role: body.role },
    });

    await logAction({ userId: user.id, action: 'update_user_role', resource: `user:${body.userId}`, details: { newRole: body.role }, ipAddress: getIpAddress(req) });

    return NextResponse.json({ user: { id: updated.id, email: updated.email, role: updated.role } });
  } catch (error) {
    return handleAuthError(error);
  }
}
