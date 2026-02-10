import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;
  const userId = (session.user as any).id;

  const book = await prisma.book.findFirst({
    where: { id: bookId, userId },
    include: {
      versions: { orderBy: { version: "asc" } },
      references: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!book) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ book });
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;
  const userId = (session.user as any).id;

  const book = await prisma.book.findFirst({ where: { id: bookId, userId } });
  if (!book) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.book.delete({ where: { id: bookId } });
  return NextResponse.json({ success: true });
}
