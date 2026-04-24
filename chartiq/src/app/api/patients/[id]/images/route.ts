import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const images = await prisma.patientImage.findMany({
    where: { patientId: params.id },
    orderBy: { uploadedAt: 'desc' },
  });
  return NextResponse.json(images);
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const category = (formData.get('category') as string) || 'other';
  const description = (formData.get('description') as string) || '';
  const uploadedBy = (formData.get('uploadedBy') as string) || 'Unknown';

  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
  }

  const ext = path.extname(file.name) || '.jpg';
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
  const dir = path.join(process.cwd(), 'public', 'uploads', 'patients', params.id);
  await mkdir(dir, { recursive: true });

  const buffer = Buffer.from(await file.arrayBuffer());
  const filepath = `/uploads/patients/${params.id}/${filename}`;
  await writeFile(path.join(dir, filename), buffer);

  const image = await prisma.patientImage.create({
    data: {
      patientId: params.id,
      filename: file.name,
      filepath,
      category,
      description: description || null,
      uploadedBy,
    },
  });

  return NextResponse.json(image);
}
