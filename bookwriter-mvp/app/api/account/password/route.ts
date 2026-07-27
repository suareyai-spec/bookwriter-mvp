import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const Body = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = (session.user as any).id as string;

  try {
    const { currentPassword, newPassword } = Body.parse(await req.json());

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
