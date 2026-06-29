import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: Promise<{ bookId: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { bookId } = await params;
  const userId = (session.user as any).id;

  const book = await prisma.book.findFirst({ where: { id: bookId, userId }, select: { id: true } });
  if (!book) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const chapters = await prisma.chapter.findMany({
    where: { bookId },
    orderBy: { number: 'asc' },
  });

  return NextResponse.json({ chapters });
}
