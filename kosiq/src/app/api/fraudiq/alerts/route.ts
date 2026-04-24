import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const alerts = await prisma.fraudAlert.findMany({ orderBy: { detectedDate: 'desc' }, take: 100 });
    return NextResponse.json(alerts);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const alert = await prisma.fraudAlert.create({ data });
    return NextResponse.json(alert);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
