import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';
import { previewFile } from '@/lib/claims-parser';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const user = await requireAuth('upload_claims');
    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split('.').pop()?.toLowerCase();
    const fileType = ext === 'csv' ? 'claims_csv' : ext === 'xlsx' || ext === 'xls' ? 'claims_excel' : 'unknown';

    // Save file temporarily
    const uploadsDir = path.join(process.cwd(), 'uploads');
    await mkdir(uploadsDir, { recursive: true });
    const filePath = path.join(uploadsDir, `${Date.now()}_${file.name}`);
    await writeFile(filePath, buffer);

    const preview = previewFile(buffer, file.name);

    const upload = await prisma.dataUpload.create({
      data: {
        organizationId: user.organizationId,
        uploadedBy: user.id,
        fileName: file.name,
        fileType,
        status: 'preview',
        recordsTotal: preview.totalRows,
        filePath,
      },
    });

    await logAction({ userId: user.id, action: 'upload_preview', resource: `upload:${upload.id}`, ipAddress: getIpAddress(req) });

    return NextResponse.json({
      uploadId: upload.id,
      columns: preview.columns,
      sampleRows: preview.rows,
      detectedMappings: preview.detectedMappings,
      totalRows: preview.totalRows,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
