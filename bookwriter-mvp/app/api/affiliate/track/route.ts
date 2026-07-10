import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();
    if (!code || !/^[a-zA-Z0-9_-]{3,30}$/.test(code)) {
      return NextResponse.json({ ok: false });
    }
    const affiliate = await prisma.affiliate.findFirst({ where: { code, isActive: true }, select: { id: true } });
    if (!affiliate) return NextResponse.json({ ok: false });

    await Promise.all([
      prisma.affiliate.update({ where: { id: affiliate.id }, data: { totalClicks: { increment: 1 } } }),
      prisma.affiliateClick.create({ data: { affiliateId: affiliate.id } }),
    ]);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false });
  }
}
