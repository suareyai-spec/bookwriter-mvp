import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const policies = await prisma.compliancePolicy.findMany({ orderBy: { lastReviewed: 'desc' } });
    return NextResponse.json(policies);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const policy = await prisma.compliancePolicy.create({ data });
    return NextResponse.json(policy);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
