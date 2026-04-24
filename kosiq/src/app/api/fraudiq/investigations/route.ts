import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const investigations = await prisma.fraudInvestigation.findMany({ orderBy: { openDate: 'desc' }, take: 50 });
    return NextResponse.json(investigations);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const inv = await prisma.fraudInvestigation.create({ data });
    return NextResponse.json(inv);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
