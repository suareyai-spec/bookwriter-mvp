import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  let dbStatus = 'disconnected';
  try {
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch {}

  return NextResponse.json({
    status: 'ok',
    version: '1.0.0',
    database: dbStatus,
    timestamp: new Date().toISOString(),
  });
}
