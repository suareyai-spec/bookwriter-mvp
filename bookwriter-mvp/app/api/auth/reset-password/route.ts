import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimitByIP } from "@/lib/rate-limit";

const Body = z.object({
  token: z.string().min(1),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const { blocked } = await rateLimitByIP(req, "reset-password", 10, 60 * 60 * 1000);
  if (blocked) return blocked;

  try {
    const { token, password } = Body.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { resetToken: token } });
    if (!user || !user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired. Please request a new one." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, resetToken: null, resetTokenExpiry: null },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
