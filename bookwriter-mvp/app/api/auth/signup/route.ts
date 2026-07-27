import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";

const SignupSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    const body = SignupSchema.parse(await req.json());

    const existing = await prisma.user.findUnique({
      where: { email: body.email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(body.password, 12);

    const ref = req.headers.get("cookie")?.match(/(?:^|;\s*)plotghost_ref=([^;]+)/)?.[1];
    const verifyToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        name: body.name.trim(),
        email: body.email.toLowerCase().trim(),
        passwordHash,
        referredBy: ref ? decodeURIComponent(ref) : undefined,
        verifyToken,
      },
    });

    await sendVerificationEmail({ to: user.email, token: verifyToken });

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
