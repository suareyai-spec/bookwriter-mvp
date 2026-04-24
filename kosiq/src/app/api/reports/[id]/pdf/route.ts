import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';
import { generateReportPDF } from '@/lib/pdf-generator';

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth('view_reports');
    const { id } = await params;
    const buffer = await generateReportPDF(id);

    await logAction({ userId: user.id, action: 'download_report_pdf', resource: `report:${id}`, ipAddress: getIpAddress(req) });

    return new Response(buffer as unknown as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="KOSIQ_Report_${id}.pdf"`,
      },
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
