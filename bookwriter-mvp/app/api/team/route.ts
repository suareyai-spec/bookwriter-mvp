import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.subscriptionPlan !== "studio" || user.subscriptionStatus !== "active") {
    return NextResponse.json({ error: "Studio subscription required" }, { status: 403 });
  }

  const members = await prisma.teamMember.findMany({
    where: { teamOwner: userId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ members });
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.subscriptionPlan !== "studio" || user.subscriptionStatus !== "active") {
    return NextResponse.json({ error: "Studio subscription required" }, { status: 403 });
  }

  const { email } = await req.json();
  if (!email || typeof email !== "string") {
    return NextResponse.json({ error: "Email required" }, { status: 400 });
  }

  // Check if already a team member
  const existing = await prisma.teamMember.findFirst({
    where: { teamOwner: userId, email: email.toLowerCase() },
  });
  if (existing) {
    return NextResponse.json({ error: "Already a team member" }, { status: 400 });
  }

  // Check if the invited user has an account
  const invitedUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

  const member = await prisma.teamMember.create({
    data: {
      teamOwner: userId,
      email: email.toLowerCase(),
      userId: invitedUser?.id || null,
    },
  });

  return NextResponse.json({ member });
}
