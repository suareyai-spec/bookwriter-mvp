import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const claims = await prisma.claimSubmission.findMany({ orderBy: { dateOfService: 'desc' }, take: 100 });
    return NextResponse.json(claims);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const claim = await prisma.claimSubmission.create({ data });
    return NextResponse.json(claim);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
