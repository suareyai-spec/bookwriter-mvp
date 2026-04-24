import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const appeals = await prisma.claimSubmission.findMany({ where: { appealStatus: { not: null } }, orderBy: { dateOfService: 'desc' }, take: 50 });
    return NextResponse.json(appeals);
  } catch { return NextResponse.json([]); }
}
