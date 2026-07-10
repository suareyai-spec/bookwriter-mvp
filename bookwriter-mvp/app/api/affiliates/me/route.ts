import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const affiliate = await prisma.affiliate.findUnique({ where: { userId } });
  if (!affiliate) {
    return NextResponse.json({ affiliate: null });
  }

  const [clicks, conversions] = await Promise.all([
    prisma.affiliateClick.count({ where: { affiliateId: affiliate.id } }),
    prisma.affiliateConversion.count({ where: { affiliateId: affiliate.id } }),
  ]);

  return NextResponse.json({
    affiliate: {
      code: affiliate.code,
      isApproved: affiliate.isApproved,
      commissionRate: affiliate.commissionRate,
      totalEarnings: affiliate.totalEarnings,
      pendingPayout: affiliate.pendingPayout,
      clicks,
      conversions,
    },
  });
}
