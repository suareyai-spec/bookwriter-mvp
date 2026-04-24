import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const templates = await prisma.noteTemplate.findMany({ orderBy: { category: 'asc' } });
  return NextResponse.json(templates);
}
