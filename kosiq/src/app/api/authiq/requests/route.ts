import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const auths = await prisma.priorAuth.findMany({ orderBy: { submitDate: 'desc' }, take: 100 });
    return NextResponse.json(auths);
  } catch { return NextResponse.json([]); }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const auth = await prisma.priorAuth.create({ data });
    return NextResponse.json(auth);
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 400 }); }
}
