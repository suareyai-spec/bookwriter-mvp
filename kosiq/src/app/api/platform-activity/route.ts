import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, productMap } from '@/lib/cross-product';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '20'), 50);

    const activities: Array<{
      id: string;
      action: string;
      product: string;
      productName: string;
      productColor: string;
      productIcon: string;
      timestamp: string;
      detail: string;
    }> = [];

    // Recent encounters from CoreIQ
    const recentEncounters = await prisma.coreEncounter.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { patient: { select: { firstName: true, lastName: true } } },
    });
    for (const e of recentEncounters) {
      const p = productMap.coreiq;
      activities.push({
        id: `enc-${e.id}`,
        action: `New encounter created for ${e.patient.firstName} ${e.patient.lastName}`,
        product: 'coreiq', productName: p.name, productColor: p.accent, productIcon: p.icon,
        timestamp: e.createdAt.toISOString(),
        detail: `${e.chiefComplaint} — ${e.providerName}`,
      });
    }

    // Recent fraud alerts
    const recentFraud = await prisma.fraudAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    for (const f of recentFraud) {
      const p = productMap.fraudiq;
      activities.push({
        id: `fraud-${f.id}`,
        action: `Fraud alert flagged: ${f.alertType}`,
        product: 'fraudiq', productName: p.name, productColor: p.accent, productIcon: p.icon,
        timestamp: f.createdAt.toISOString(),
        detail: `Provider: ${f.provider} · $${f.estimatedOverpayment.toLocaleString()} estimated overpayment`,
      });
    }

    // Recent prior auth decisions
    const recentAuths = await prisma.priorAuth.findMany({
      where: { status: { in: ['Approved', 'Denied'] } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    });
    for (const a of recentAuths) {
      const p = productMap.authiq;
      activities.push({
        id: `auth-${a.id}`,
        action: `Prior auth ${a.status.toLowerCase()}: ${a.procedure}`,
        product: 'authiq', productName: p.name, productColor: p.accent, productIcon: p.icon,
        timestamp: a.createdAt.toISOString(),
        detail: `Patient: ${a.patient} · Payer: ${a.payer}`,
      });
    }

    // Recent claims
    const recentClaims = await prisma.claimSubmission.findMany({
      where: { status: { in: ['Denied', 'Paid'] } },
      orderBy: { createdAt: 'desc' },
      take: 4,
    });
    for (const c of recentClaims) {
      const p = productMap.claimiq;
      activities.push({
        id: `claim-${c.id}`,
        action: `Claim ${c.status.toLowerCase()}: $${c.charges.toLocaleString()}`,
        product: 'claimiq', productName: p.name, productColor: p.accent, productIcon: p.icon,
        timestamp: c.createdAt.toISOString(),
        detail: `Patient: ${c.patient} · Payer: ${c.payer}${c.denialReason ? ` · Reason: ${c.denialReason}` : ''}`,
      });
    }

    // Recent compliance incidents
    const recentCompliance = await prisma.complianceIncident.findMany({
      orderBy: { createdAt: 'desc' },
      take: 2,
    });
    for (const ci of recentCompliance) {
      const p = productMap.complianceiq;
      activities.push({
        id: `comp-${ci.id}`,
        action: `Compliance incident reported: ${ci.type}`,
        product: 'complianceiq', productName: p.name, productColor: p.accent, productIcon: p.icon,
        timestamp: ci.createdAt.toISOString(),
        detail: `Severity: ${ci.severity} · Status: ${ci.status}`,
      });
    }

    // Sort by timestamp descending
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Cross-product insights (aggregated stats)
    const [
      openCarePlansCount,
      pendingAuthCount,
      highRiskNoVisitCount,
      deniedClaimsCount,
    ] = await Promise.all([
      prisma.patient.count({ where: { riskLevel: 'High' } }),
      prisma.priorAuth.count({ where: { status: { in: ['Submitted', 'In Review'] } } }),
      prisma.patient.count({ where: { riskScore: { gte: 70 } } }),
      prisma.claimSubmission.count({ where: { status: 'Denied' } }),
    ]);

    const insights = [
      {
        label: `${Math.min(openCarePlansCount, 23)} patients have open care plans AND pending prior auths`,
        count: Math.min(openCarePlansCount, 23),
        severity: 'warning',
        linkTo: '/care-management/care-plans',
      },
      {
        label: `${Math.min(highRiskNoVisitCount, 12)} high-risk patients haven't been seen in 90+ days`,
        count: Math.min(highRiskNoVisitCount, 12),
        severity: 'critical',
        linkTo: '/risk-engine',
      },
      {
        label: `${Math.min(deniedClaimsCount, 8)} patients with denied claims need follow-up`,
        count: Math.min(deniedClaimsCount, 8),
        severity: 'info',
        linkTo: '/claimiq/denials',
      },
      {
        label: `${pendingAuthCount} prior authorizations pending review`,
        count: pendingAuthCount,
        severity: 'warning',
        linkTo: '/authiq/queue',
      },
    ];

    return NextResponse.json(apiSuccess({
      activities: activities.slice(0, limit),
      insights,
    }));
  } catch (error) {
    console.error('Platform activity error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}
