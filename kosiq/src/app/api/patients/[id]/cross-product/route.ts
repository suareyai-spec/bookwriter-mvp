import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { apiSuccess, apiError } from '@/lib/cross-product';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    // Find the CoreIQ patient
    const corePatient = await prisma.corePatient.findUnique({
      where: { id },
      include: {
        encounters: { orderBy: { date: 'desc' }, take: 5 },
        prescriptions: { where: { status: 'Active' }, take: 10 },
        labOrders: { orderBy: { orderDate: 'desc' }, take: 5 },
        claims: { orderBy: { dateOfService: 'desc' }, take: 10 },
      },
    });

    if (!corePatient) {
      return NextResponse.json(apiError('Patient not found'), { status: 404 });
    }

    const fullName = `${corePatient.firstName} ${corePatient.lastName}`;

    // Find matching Patient in population health (by name match)
    const popPatient = await prisma.patient.findFirst({
      where: { firstName: corePatient.firstName, lastName: corePatient.lastName },
      include: {
        riskScores: { orderBy: { calculatedAt: 'desc' }, take: 1 },
        claims: { orderBy: { claimDate: 'desc' }, take: 5 },
        pharmacyRecords: { orderBy: { fillDate: 'desc' }, take: 5 },
        referrals: { orderBy: { referralDate: 'desc' }, take: 3 },
        hospitalizationEvents: { orderBy: { admitDate: 'desc' }, take: 3 },
      },
    });

    // Find ClaimIQ claims (by patient name)
    const claimSubmissions = await prisma.claimSubmission.findMany({
      where: { patient: { contains: corePatient.lastName } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Find AuthIQ prior auths
    const priorAuths = await prisma.priorAuth.findMany({
      where: { patient: { contains: corePatient.lastName } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Find Fraud alerts related to claims
    const fraudAlerts = await prisma.fraudAlert.findMany({
      where: { status: { in: ['Open', 'Investigating'] } },
      take: 3,
      orderBy: { detectedDate: 'desc' },
    });

    // Find compliance incidents
    const complianceNotes = await prisma.complianceIncident.findMany({
      where: { status: { in: ['Open', 'Under Investigation'] } },
      take: 3,
      orderBy: { reportedDate: 'desc' },
    });

    // Build cross-product summary
    const summary = {
      patient: {
        id: corePatient.id,
        name: fullName,
        mrn: corePatient.mrn,
        dob: corePatient.dateOfBirth,
        gender: corePatient.gender,
        status: corePatient.status,
      },
      coreiq: {
        recentEncounters: corePatient.encounters.map(e => ({
          id: e.id,
          date: e.date,
          chiefComplaint: e.chiefComplaint,
          provider: e.providerName,
          status: e.status,
        })),
        activePrescriptions: corePatient.prescriptions.map(rx => ({
          id: rx.id,
          medication: rx.medication,
          dosage: rx.dosage,
          frequency: rx.frequency,
          status: rx.status,
        })),
        pendingLabs: corePatient.labOrders.filter(l => l.status !== 'Results Available').map(l => ({
          id: l.id,
          tests: l.tests,
          orderDate: l.orderDate,
          status: l.status,
        })),
        completedLabs: corePatient.labOrders.filter(l => l.status === 'Results Available').map(l => ({
          id: l.id,
          tests: l.tests,
          orderDate: l.orderDate,
          results: l.results,
        })),
      },
      riskEngine: popPatient ? {
        riskScore: popPatient.riskScore,
        riskLevel: popPatient.riskLevel,
        conditions: popPatient.conditions,
        mraScore: popPatient.mraScore,
        predictiveRisk30: popPatient.predictiveRisk30,
        predictiveRisk60: popPatient.predictiveRisk60,
        predictiveRisk90: popPatient.predictiveRisk90,
        latestScore: popPatient.riskScores[0] || null,
      } : null,
      quality: {
        // Simulated quality gaps based on patient conditions
        gaps: popPatient ? generateQualityGaps(popPatient.conditions, popPatient.riskLevel) : [],
      },
      careManagement: {
        // Simulated care plan data
        carePlans: popPatient && popPatient.riskLevel === 'High' ? [{
          id: `cp-${id}`,
          program: 'CCM',
          status: 'Active',
          startDate: new Date(Date.now() - 90 * 86400000).toISOString(),
          goals: ['Reduce HbA1c below 7%', 'Blood pressure < 130/80', 'Monthly check-in adherence'],
          nextReview: new Date(Date.now() + 14 * 86400000).toISOString(),
        }] : [],
      },
      claimiq: {
        claims: claimSubmissions.map(c => ({
          id: c.id,
          dateOfService: c.dateOfService,
          charges: c.charges,
          payer: c.payer,
          status: c.status,
          denialReason: c.denialReason,
          paidAmount: c.paidAmount,
        })),
        totalClaims: claimSubmissions.length,
        deniedCount: claimSubmissions.filter(c => c.status === 'Denied').length,
      },
      authiq: {
        priorAuths: priorAuths.map(a => ({
          id: a.id,
          procedure: a.procedure,
          payer: a.payer,
          status: a.status,
          urgency: a.urgency,
          submitDate: a.submitDate,
          authNumber: a.authNumber,
        })),
        pendingCount: priorAuths.filter(a => ['Submitted', 'In Review'].includes(a.status)).length,
      },
      rpm: {
        // Simulated RPM data for high-risk patients
        vitals: popPatient && popPatient.riskScore > 60 ? [
          { type: 'Blood Pressure', value: '138/88', date: new Date(Date.now() - 86400000).toISOString(), status: 'Elevated' },
          { type: 'Heart Rate', value: '82 bpm', date: new Date(Date.now() - 86400000).toISOString(), status: 'Normal' },
          { type: 'Blood Glucose', value: '165 mg/dL', date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'High' },
          { type: 'Weight', value: '198 lbs', date: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'Stable' },
          { type: 'SpO2', value: '96%', date: new Date(Date.now() - 86400000).toISOString(), status: 'Normal' },
        ] : [],
        hasDevice: popPatient ? popPatient.riskScore > 60 : false,
      },
      behavioralHealth: {
        screenings: popPatient && popPatient.conditions.includes('Depression') ? [{
          type: 'PHQ-9',
          score: 14,
          severity: 'Moderate',
          date: new Date(Date.now() - 30 * 86400000).toISOString(),
        }] : [],
        flags: popPatient && popPatient.conditions.includes('Depression') ? ['Active depression diagnosis', 'PHQ-9 > 10'] : [],
      },
      compliance: {
        notes: complianceNotes.slice(0, 2).map(c => ({
          id: c.id,
          type: c.type,
          severity: c.severity,
          status: c.status,
        })),
      },
      fraud: {
        alerts: fraudAlerts.slice(0, 2).map(f => ({
          id: f.id,
          alertType: f.alertType,
          severity: f.severity,
          status: f.status,
        })),
      },
      hospitalizations: popPatient ? {
        events: popPatient.hospitalizationEvents.map(h => ({
          id: h.id,
          facility: h.facility,
          admitDate: h.admitDate,
          dischargeDate: h.dischargeDate,
          diagnosis: h.diagnosis,
          eventType: h.eventType,
        })),
      } : null,
    };

    return NextResponse.json(apiSuccess(summary));
  } catch (error) {
    console.error('Cross-product API error:', error);
    return NextResponse.json(apiError('Internal server error'), { status: 500 });
  }
}

function generateQualityGaps(conditions: string, riskLevel: string): Array<{ measure: string; status: string; dueDate: string }> {
  const gaps: Array<{ measure: string; status: string; dueDate: string }> = [];
  if (conditions.includes('Diabetes')) {
    gaps.push({ measure: 'HbA1c Test', status: 'Overdue', dueDate: new Date(Date.now() - 30 * 86400000).toISOString() });
    gaps.push({ measure: 'Diabetic Eye Exam', status: 'Due Soon', dueDate: new Date(Date.now() + 30 * 86400000).toISOString() });
  }
  if (conditions.includes('Hypertension') || riskLevel === 'High') {
    gaps.push({ measure: 'Blood Pressure Control', status: 'Open', dueDate: new Date(Date.now() + 14 * 86400000).toISOString() });
  }
  if (riskLevel === 'High') {
    gaps.push({ measure: 'Annual Wellness Visit', status: 'Overdue', dueDate: new Date(Date.now() - 60 * 86400000).toISOString() });
  }
  return gaps;
}
