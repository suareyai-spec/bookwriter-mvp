import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const eras = await prisma.claimSubmission.findMany({ where: { eraData: { not: null } }, orderBy: { dateOfService: 'desc' }, take: 50 });
    return NextResponse.json(eras);
  } catch { return NextResponse.json([]); }
}
