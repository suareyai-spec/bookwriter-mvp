import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { bookId } = await params;
  const userId = (session.user as any).id;

  const book = await prisma.book.findFirst({
    where: { id: bookId, userId },
    select: {
      status: true,
      progress: true,
      currentChapter: true,
      totalChapters: true,
      outline: true,
      title: true,
      chapters: {
        select: { number: true, title: true, wordCount: true },
        orderBy: { number: 'asc' },
      },
    },
  });

  if (!book) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let progressObj: any = null;
  if (book.progress) {
    try { progressObj = JSON.parse(book.progress); } catch {}
  }

  const currentTitle = progressObj?.currentTitle || (book.chapters.length > 0 ? book.chapters[book.chapters.length - 1].title : null);
  const percentComplete = book.totalChapters > 0 ? Math.round((book.currentChapter / book.totalChapters) * 100) : 0;

  return NextResponse.json({
    status: book.status,
    currentChapter: book.currentChapter,
    totalChapters: book.totalChapters,
    currentTitle,
    percentComplete,
    chapters: book.chapters,
    outline: book.outline,
    progressStatus: progressObj?.status || null,
  });
}
