import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const audits = await prisma.complianceAudit.findMany({ orderBy: { date: 'desc' } });
    return NextResponse.json(audits);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const audit = await prisma.complianceAudit.create({ data });
    return NextResponse.json(audit);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
