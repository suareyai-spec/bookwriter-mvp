import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const genre = url.searchParams.get("genre") || "";
  const size = url.searchParams.get("size") || "";
  const status = url.searchParams.get("status") || "";
  const search = url.searchParams.get("search") || "";
  const page = parseInt(url.searchParams.get("page") || "1");
  const limit = 25;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (genre) where.genre = genre;
  if (size) where.bookLength = size;
  if (status) where.status = status;
  if (search) {
    where.OR = [{ title: { contains: search } }];
  }

  const [books, total, genreBreakdown, sizeBreakdown, statusBreakdown] = await Promise.all([
    prisma.book.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        versions: { select: { wordCount: true }, take: 1, orderBy: { version: "desc" } },
      },
    }),
    prisma.book.count({ where }),
    prisma.book.groupBy({ by: ["genre"], _count: true, orderBy: { _count: { genre: "desc" } } }),
    prisma.book.groupBy({ by: ["bookLength"], _count: true }),
    prisma.book.groupBy({ by: ["status"], _count: true }),
  ]);

  return NextResponse.json({
    books: books.map((b) => ({
      id: b.id,
      title: b.title,
      author: b.user.name || b.user.email,
      authorEmail: b.user.email,
      genre: b.genre,
      bookLength: b.bookLength,
      status: b.status,
      contentType: b.contentType,
      wordCount: b.versions[0]?.wordCount || null,
      createdAt: b.createdAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: {
      totalBooks: total,
      byGenre: genreBreakdown.map((g) => ({ genre: g.genre || "Unknown", count: g._count })),
      bySize: sizeBreakdown.map((s) => ({ size: s.bookLength || "Unknown", count: s._count })),
      byStatus: statusBreakdown.map((s) => ({ status: s.status, count: s._count })),
    },
  });
}
