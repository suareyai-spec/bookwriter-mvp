import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const records = await prisma.revenueRecord.findMany({ orderBy: { month: 'asc' } });
  return NextResponse.json(records);
}
