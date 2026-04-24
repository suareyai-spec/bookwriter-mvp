import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ memberId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = (session.user as any).id as string;
  const { memberId } = await params;

  const member = await prisma.teamMember.findUnique({ where: { id: memberId } });
  if (!member || member.teamOwner !== userId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.teamMember.delete({ where: { id: memberId } });

  return NextResponse.json({ success: true });
}
