import { NextResponse } from "next/server";
import crypto from "crypto";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { rateLimitByUser } from "@/lib/rate-limit";

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  const { blocked } = await rateLimitByUser("resend-verification", 3, 60 * 60 * 1000);
  if (blocked) return blocked;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ success: true, alreadyVerified: true });

  const verifyToken = crypto.randomBytes(32).toString("hex");
  await prisma.user.update({ where: { id: userId }, data: { verifyToken } });
  await sendVerificationEmail({ to: user.email, token: verifyToken });

  return NextResponse.json({ success: true });
}
