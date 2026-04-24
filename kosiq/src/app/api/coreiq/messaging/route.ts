import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const messages = await prisma.clinicalMessage.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json(messages);
}

export async function PUT(req: Request) {
  const { id, isRead, folder } = await req.json();
  const data: any = {};
  if (isRead !== undefined) data.isRead = isRead;
  if (folder !== undefined) data.folder = folder;
  const updated = await prisma.clinicalMessage.update({ where: { id }, data });
  return NextResponse.json(updated);
}
