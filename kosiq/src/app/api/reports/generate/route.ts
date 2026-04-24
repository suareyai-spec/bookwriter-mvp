import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';
import { generateMonthlyReport } from '@/lib/ai-engine';

export async function POST(req: Request) {
  try {
    const user = await requireAuth('generate_reports');
    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const now = new Date();
    const month = body.month || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    const [y, m] = month.split('-').map(Number);

    const reportData = await generateMonthlyReport(user.organizationId, month);

    const report = await prisma.report.create({
      data: {
        period: month,
        title: `${months[m - 1]} ${y} Monthly Report`,
        summary: JSON.stringify(reportData),
        organizationId: user.organizationId,
        generatedBy: user.id,
        aiAnalysis: JSON.stringify(reportData),
      },
    });

    await logAction({ userId: user.id, action: 'generate_report', resource: `report:${report.id}`, ipAddress: getIpAddress(req) });

    return NextResponse.json({ success: true, reportId: report.id, report: { ...report, summary: reportData } });
  } catch (error) {
    return handleAuthError(error);
  }
}
