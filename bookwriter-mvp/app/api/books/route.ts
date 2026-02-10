import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as any).id;

  const books = await prisma.book.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { versions: true } },
      versions: {
        orderBy: { version: "desc" },
        take: 1,
        select: { wordCount: true },
      },
    },
  });

  const formatted = books.map((b) => ({
    ...b,
    latestVersion: b.versions[0] || null,
    versions: undefined,
  }));

  return NextResponse.json({ books: formatted });
}
