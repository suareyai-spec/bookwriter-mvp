import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ bookId: string; number: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId, number } = await params;
  const userId = (session.user as any).id;

  const book = await prisma.book.findFirst({ where: { id: bookId, userId }, select: { id: true } });
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const chapter = await prisma.chapter.findUnique({ where: { bookId_number: { bookId, number: parseInt(number) } } });
  if (!chapter) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ chapter });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ bookId: string; number: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId, number } = await params;
  const userId = (session.user as any).id;

  const book = await prisma.book.findFirst({ where: { id: bookId, userId }, select: { id: true } });
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const { content, title } = await req.json();
  const wordCount = content ? content.split(/\s+/).filter(Boolean).length : undefined;

  const chapter = await prisma.chapter.update({
    where: { bookId_number: { bookId, number: parseInt(number) } },
    data: { ...(content && { content, wordCount }), ...(title && { title }) },
  });

  // Regenerate the full BookVersion from all chapters
  const allChapters = await prisma.chapter.findMany({ where: { bookId }, orderBy: { number: 'asc' } });
  const bookRecord = await prisma.book.findUnique({ where: { id: bookId }, select: { outline: true } });
  const fullBook = `${bookRecord?.outline || ''}\n\n${'━'.repeat(50)}\n\n${allChapters.map(c => c.content).join('\n\n' + '━'.repeat(50) + '\n\n')}`;
  const totalWords = fullBook.split(/\s+/).filter(Boolean).length;

  // Update latest BookVersion
  const latestVersion = await prisma.bookVersion.findFirst({ where: { bookId }, orderBy: { version: 'desc' } });
  if (latestVersion) {
    await prisma.bookVersion.update({ where: { id: latestVersion.id }, data: { content: fullBook, wordCount: totalWords } });
  }

  return NextResponse.json({ chapter, wordCount: totalWords });
}
