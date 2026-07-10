import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const Body = z.object({
  name: z.string().min(2).max(100),
  payPalEmail: z.string().email(),
});

function generateCode(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 12) || "partner";
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Please sign in to join the affiliate program." }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  try {
    const body = Body.parse(await req.json());

    const existing = await prisma.affiliate.findUnique({ where: { userId } });
    if (existing) {
      return NextResponse.json({ ok: true, code: existing.code, alreadyExists: true });
    }

    let code = generateCode(body.name);
    let attempt = 0;
    while (attempt < 10) {
      const taken = await prisma.affiliate.findUnique({ where: { code } });
      if (!taken) break;
      attempt++;
      code = generateCode(body.name) + attempt;
    }

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true } });

    const affiliate = await prisma.affiliate.create({
      data: {
        userId,
        code,
        ownerName: body.name,
        ownerEmail: user?.email || "",
        payPalEmail: body.payPalEmail,
        isActive: true,
        isApproved: false,
      },
    });

    return NextResponse.json({ ok: true, code: affiliate.code });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
