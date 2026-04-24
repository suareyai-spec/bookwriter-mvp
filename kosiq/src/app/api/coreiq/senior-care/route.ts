import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const patients = await prisma.seniorCarePatient.findMany({ orderBy: { riskScore: 'desc' } });
  return NextResponse.json(patients);
}
