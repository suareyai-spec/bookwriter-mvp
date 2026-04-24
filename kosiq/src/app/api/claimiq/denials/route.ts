import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const denials = await prisma.claimSubmission.findMany({ where: { status: 'Denied' }, orderBy: { dateOfService: 'desc' }, take: 50 });
    return NextResponse.json(denials);
  } catch { return NextResponse.json([]); }
}
