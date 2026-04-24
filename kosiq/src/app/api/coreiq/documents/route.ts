import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const docs = await prisma.clinicalDocument.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(docs);
}
