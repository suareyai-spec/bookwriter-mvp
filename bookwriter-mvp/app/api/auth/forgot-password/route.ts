import { NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimitByIP } from "@/lib/rate-limit";

const Body = z.object({
  email: z.string().email(),
});

export async function POST(req: Request) {
  const { blocked } = await rateLimitByIP(req, "forgot-password", 5, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const { email } = Body.parse(await req.json());
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // Always return success, whether or not the account exists — don't leak
    // which emails are registered.
    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry },
      });

      await sendPasswordResetEmail({ to: user.email, token });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
