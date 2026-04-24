import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const training = await prisma.complianceTraining.findMany({ orderBy: { dueDate: 'asc' } });
    return NextResponse.json(training);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const module = await prisma.complianceTraining.create({ data });
    return NextResponse.json(module);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
