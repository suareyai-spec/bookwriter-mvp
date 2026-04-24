import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(_req: Request, { params }: { params: { id: string; imageId: string } }) {
  const image = await prisma.chartPatientImage.findUnique({ where: { id: params.imageId } });
  if (!image || image.patientId !== params.id) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try { await unlink(path.join(process.cwd(), 'public', image.filepath)); } catch {}

  await prisma.chartPatientImage.delete({ where: { id: params.imageId } });
  return NextResponse.json({ success: true });
}
