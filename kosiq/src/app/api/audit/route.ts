import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const action = searchParams.get('action') || '';
    const userFilter = searchParams.get('user') || '';
    const from = searchParams.get('from') || '';
    const to = searchParams.get('to') || '';

    const where: any = {};
    if (action) where.action = { contains: action };
    if (userFilter) {
      where.user = { OR: [{ name: { contains: userFilter } }, { email: { contains: userFilter } }] };
    }
    if (from || to) {
      where.createdAt = {};
      if (from) where.createdAt.gte = new Date(from);
      if (to) where.createdAt.lte = new Date(to + 'T23:59:59Z');
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: { user: { select: { name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      logs: logs.map(l => ({
        id: l.id,
        userId: l.userId,
        userName: l.user.name || l.user.email,
        action: l.action,
        resource: l.resource,
        details: l.details,
        ipAddress: l.ipAddress,
        createdAt: l.createdAt,
      })),
      total,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
