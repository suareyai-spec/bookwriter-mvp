import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const incidents = await prisma.complianceIncident.findMany({ orderBy: { reportedDate: 'desc' }, take: 50 });
    return NextResponse.json(incidents);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const incident = await prisma.complianceIncident.create({ data });
    return NextResponse.json(incident);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
