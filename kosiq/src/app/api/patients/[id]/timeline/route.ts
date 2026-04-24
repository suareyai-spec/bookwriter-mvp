import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError, TimelineEvent, productMap } from '@/lib/cross-product';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 200);
    const offset = parseInt(url.searchParams.get('offset') || '0');

    const corePatient = await prisma.corePatient.findUnique({
      where: { id },
      include: {
        encounters: { orderBy: { date: 'desc' } },
        prescriptions: { orderBy: { prescribedDate: 'desc' } },
        labOrders: { orderBy: { orderDate: 'desc' } },
        claims: { orderBy: { dateOfService: 'desc' } },
      },
    });

    if (!corePatient) {
      return NextResponse.json(apiError('Patient not found'), { status: 404 });
    }

    const events: TimelineEvent[] = [];
    const p = (key: string) => productMap[key];

    // CoreIQ Encounters
    for (const e of corePatient.encounters) {
      events.push({
        id: `enc-${e.id}`,
        date: e.date.toISOString(),
        type: 'encounter',
        title: `${e.visitType || 'Office Visit'}: ${e.chiefComplaint}`,
        description: `Provider: ${e.providerName} · Status: ${e.status}`,
        product: 'coreiq',
        productName: p('coreiq').name,
        productColor: p('coreiq').accent,
        productIcon: p('coreiq').icon,
        linkTo: `/coreiq/encounters`,
      });
    }

    // CoreIQ Prescriptions
    for (const rx of corePatient.prescriptions) {
      events.push({
        id: `rx-${rx.id}`,
        date: rx.prescribedDate.toISOString(),
        type: 'prescription',
        title: `Prescribed: ${rx.medication} ${rx.dosage}`,
        description: `${rx.frequency} · Provider: ${rx.providerName} · Status: ${rx.status}`,
        product: 'coreiq',
        productName: p('coreiq').name,
        productColor: p('coreiq').accent,
        productIcon: p('coreiq').icon,
        linkTo: `/coreiq/prescriptions`,
      });
    }

    // CoreIQ Lab Orders
    for (const lab of corePatient.labOrders) {
      const testInfo = (() => { try { return JSON.parse(lab.tests); } catch { return { panelName: 'Lab Order' }; } })();
      events.push({
        id: `lab-${lab.id}`,
        date: lab.orderDate.toISOString(),
        type: lab.status === 'Results Available' ? 'lab_result' : 'lab_order',
        title: `${lab.status === 'Results Available' ? 'Lab Results' : 'Lab Ordered'}: ${testInfo.panelName || 'Lab Panel'}`,
        description: `Provider: ${lab.providerName} · Status: ${lab.status}`,
        product: 'coreiq',
        productName: p('coreiq').name,
        productColor: p('coreiq').accent,
        productIcon: p('coreiq').icon,
        linkTo: `/coreiq/labs`,
      });
    }

    // CoreIQ Claims -> billing events
    for (const c of corePatient.claims) {
      events.push({
        id: `claim-${c.id}`,
        date: c.dateOfService.toISOString(),
        type: 'claim',
        title: `Claim ${c.status}: $${c.totalCharge.toFixed(2)}`,
        description: `Payer: ${c.payer} · Paid: $${c.paidAmount.toFixed(2)} · Balance: $${c.patientBalance.toFixed(2)}`,
        product: 'claimiq',
        productName: p('claimiq').name,
        productColor: p('claimiq').accent,
        productIcon: p('claimiq').icon,
        linkTo: `/claimiq/queue`,
      });
    }

    // Find matching population health patient
    const popPatient = await prisma.patient.findFirst({
      where: { firstName: corePatient.firstName, lastName: corePatient.lastName },
      include: {
        riskScores: { orderBy: { calculatedAt: 'desc' } },
        hospitalizationEvents: { orderBy: { admitDate: 'desc' } },
        referrals: { orderBy: { referralDate: 'desc' } },
        pharmacyRecords: { orderBy: { fillDate: 'desc' }, take: 10 },
      },
    });

    if (popPatient) {
      // Risk scores
      for (const rs of popPatient.riskScores) {
        events.push({
          id: `risk-${rs.id}`,
          date: rs.calculatedAt.toISOString(),
          type: 'risk_score',
          title: `Risk Score Updated: ${rs.score} (${rs.level})`,
          description: `Factors: ${rs.factors}`,
          product: 'riskEngine',
          productName: p('riskEngine').name,
          productColor: p('riskEngine').accent,
          productIcon: p('riskEngine').icon,
          linkTo: `/risk-engine`,
        });
      }

      // Hospitalizations
      for (const h of popPatient.hospitalizationEvents) {
        events.push({
          id: `hosp-${h.id}`,
          date: h.admitDate.toISOString(),
          type: 'hospitalization',
          title: `${h.eventType}: ${h.diagnosis}`,
          description: `Facility: ${h.facility} · LOS: ${h.los} days`,
          product: 'coreiq',
          productName: p('coreiq').name,
          productColor: p('coreiq').accent,
          productIcon: p('coreiq').icon,
          linkTo: `/hospitalization`,
        });
      }

      // Referrals
      for (const r of popPatient.referrals) {
        events.push({
          id: `ref-${r.id}`,
          date: r.referralDate.toISOString(),
          type: 'referral',
          title: `Referral: ${r.specialty}`,
          description: `To: ${r.toFacility} · From: ${r.fromProvider} · Status: ${r.status}`,
          product: 'coreiq',
          productName: p('coreiq').name,
          productColor: p('coreiq').accent,
          productIcon: p('coreiq').icon,
          linkTo: `/referrals`,
        });
      }

      // Pharmacy fills
      for (const rx of popPatient.pharmacyRecords) {
        events.push({
          id: `pharm-${rx.id}`,
          date: rx.fillDate.toISOString(),
          type: 'pharmacy_fill',
          title: `Rx Filled: ${rx.drugName}`,
          description: `Cost: $${rx.totalCost.toFixed(2)} · Type: ${rx.drugType} · Prescriber: ${rx.prescriberName}`,
          product: 'pharmacy',
          productName: 'Pharmacy',
          productColor: '#F97316',
          productIcon: '💊',
          linkTo: `/pharmacy`,
        });
      }
    }

    // ClaimIQ submissions
    const claimSubs = await prisma.claimSubmission.findMany({
      where: { patient: { contains: corePatient.lastName } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    for (const cs of claimSubs) {
      events.push({
        id: `claimsub-${cs.id}`,
        date: cs.dateOfService.toISOString(),
        type: 'claim_submission',
        title: `ClaimIQ: ${cs.status} · $${cs.charges.toFixed(2)}`,
        description: `Payer: ${cs.payer}${cs.denialReason ? ` · Denial: ${cs.denialReason}` : ''}`,
        product: 'claimiq',
        productName: p('claimiq').name,
        productColor: p('claimiq').accent,
        productIcon: p('claimiq').icon,
        linkTo: `/claimiq/queue`,
      });
    }

    // AuthIQ
    const auths = await prisma.priorAuth.findMany({
      where: { patient: { contains: corePatient.lastName } },
      orderBy: { submitDate: 'desc' },
      take: 5,
    });
    for (const a of auths) {
      events.push({
        id: `auth-${a.id}`,
        date: a.submitDate.toISOString(),
        type: 'prior_auth',
        title: `Prior Auth: ${a.procedure}`,
        description: `Payer: ${a.payer} · Status: ${a.status} · Urgency: ${a.urgency}`,
        product: 'authiq',
        productName: p('authiq').name,
        productColor: p('authiq').accent,
        productIcon: p('authiq').icon,
        linkTo: `/authiq/tracking`,
      });
    }

    // Sort all events by date descending
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const total = events.length;
    const paginated = events.slice(offset, offset + limit);

    return NextResponse.json(apiSuccess(paginated, { total, page: Math.floor(offset / limit) + 1, limit }));
  } catch (error) {
    console.error('Timeline API error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}
