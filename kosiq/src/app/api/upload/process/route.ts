import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';
import { parseFile, processRows } from '@/lib/claims-parser';
import prisma from '@/lib/prisma';
import { readFile } from 'fs/promises';

export async function POST(req: Request) {
  try {
    const user = await requireAuth('upload_claims');
    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const { uploadId, mappings } = await req.json();
    const upload = await prisma.dataUpload.findUnique({ where: { id: uploadId } });
    if (!upload || upload.organizationId !== user.organizationId) {
      return NextResponse.json({ error: 'Upload not found' }, { status: 404 });
    }

    await prisma.dataUpload.update({ where: { id: uploadId }, data: { status: 'processing', mappings: JSON.stringify(mappings) } });

    const buffer = await readFile(upload.filePath!);
    const { rows } = parseFile(buffer, upload.fileName);
    const { claims, patients, errors } = processRows(rows, mappings);

    let recordsParsed = 0;
    const recordsFailed = errors.length;

    // Upsert patients
    const patientIdMap = new Map<string, string>();
    for (const [extId, pData] of patients) {
      const existing = await prisma.patient.findUnique({ where: { externalId: extId } });
      if (existing) {
        patientIdMap.set(extId, existing.id);
      } else {
        const created = await prisma.patient.create({
          data: {
            ...pData,
            pcpName: 'Unassigned',
            riskScore: 0,
            riskLevel: 'Low',
            conditions: '[]',
            organizationId: user.organizationId!,
          },
        });
        patientIdMap.set(extId, created.id);
      }
    }

    // Insert claims
    const claimData = claims.map(c => {
      const patientId = patientIdMap.get(c.externalPatientId);
      if (!patientId) return null;
      const { externalPatientId, ...rest } = c;
      return { ...rest, patientId, organizationId: user.organizationId! };
    }).filter(Boolean);

    if (claimData.length > 0) {
      await prisma.claim.createMany({ data: claimData as any[] });
      recordsParsed = claimData.length;
    }

    await prisma.dataUpload.update({
      where: { id: uploadId },
      data: { status: 'completed', recordsParsed, recordsFailed, errors: JSON.stringify(errors.slice(0, 100)), completedAt: new Date() },
    });

    await logAction({ userId: user.id, action: 'upload_claims', resource: `upload:${uploadId}`, details: { recordsParsed, recordsFailed }, ipAddress: getIpAddress(req) });

    return NextResponse.json({ recordsParsed, recordsFailed, errors: errors.slice(0, 50) });
  } catch (error) {
    return handleAuthError(error);
  }
}
