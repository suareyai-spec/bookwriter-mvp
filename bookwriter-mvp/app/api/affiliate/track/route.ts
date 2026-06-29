import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || !/^[a-zA-Z0-9_-]{3,30}$/.test(code)) {
      return NextResponse.json({ ok: false });
    }
    await prisma.affiliate.updateMany({
      where: { code, isActive: true },
      data: { totalClicks: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
