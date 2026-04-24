import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const reports = await prisma.aIMonthlyReport.findMany({
    orderBy: { period: 'desc' },
  });

  const formatted = reports.map(r => ({
    id: r.id,
    period: r.period,
    title: r.title,
    executiveSummary: r.executiveSummary,
    keyMetrics: JSON.parse(r.keyMetrics),
    costDrivers: JSON.parse(r.costDrivers),
    riskAlerts: JSON.parse(r.riskAlerts),
    qualityGaps: JSON.parse(r.qualityGaps),
    referralPatterns: JSON.parse(r.referralPatterns),
    recommendations: JSON.parse(r.recommendations),
    generatedAt: r.generatedAt.toISOString(),
  }));

  return NextResponse.json(formatted);
}
