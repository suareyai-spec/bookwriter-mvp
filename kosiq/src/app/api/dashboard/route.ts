import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth('view_dashboard');
    const orgFilter = user.organizationId ? { organizationId: user.organizationId } : {};
    const claimOrgFilter = user.organizationId ? { patient: { organizationId: user.organizationId } } : {};

    const url = new URL(req.url);
    const payerFilter = url.searchParams.get('payer');
    const regionFilter = url.searchParams.get('region');
    const timePeriod = url.searchParams.get('period'); // YYYY-MM

    const patientWhere: any = { ...orgFilter };
    if (payerFilter) patientWhere.primaryPayer = payerFilter;

    const claimWhere: any = { ...claimOrgFilter };
    if (payerFilter) claimWhere.payer = payerFilter;

    let periodStart: Date | null = null;
    let periodEnd: Date | null = null;
    let prevStart: Date | null = null;
    let prevEnd: Date | null = null;

    if (timePeriod) {
      const [y, m] = timePeriod.split('-').map(Number);
      periodStart = new Date(y, m - 1, 1);
      periodEnd = new Date(y, m, 1);
      prevStart = new Date(y, m - 2, 1);
      prevEnd = new Date(y, m - 1, 1);
    } else {
      const now = new Date();
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const dateFilter = { claimDate: { gte: periodStart, lt: periodEnd } };
    const prevDateFilter = { claimDate: { gte: prevStart, lt: prevEnd } };

    const [patients, allClaims, currentClaims, prevClaims, ensEvents] = await Promise.all([
      prisma.patient.findMany({ where: patientWhere, select: { id: true, riskScore: true, riskLevel: true, primaryPayer: true, pcpName: true, createdAt: true } }),
      prisma.claim.findMany({ where: claimWhere, select: { claimType: true, amount: true, claimDate: true, status: true, payer: true } }),
      prisma.claim.findMany({ where: { ...claimWhere, ...dateFilter }, select: { claimType: true, amount: true, status: true, payer: true } }),
      prisma.claim.findMany({ where: { ...claimWhere, ...prevDateFilter }, select: { claimType: true, amount: true, status: true, payer: true } }),
      prisma.eNSEvent.findMany({ where: { patient: patientWhere, admitDate: { gte: periodStart, lt: periodEnd } }, select: { admissionType: true, admitDate: true, dischargeDate: true } }),
    ]);

    const prevEnsEvents = await prisma.eNSEvent.findMany({
      where: { patient: patientWhere, admitDate: { gte: prevStart, lt: prevEnd } },
      select: { admissionType: true, admitDate: true, dischargeDate: true },
    });

    await logAction({ userId: user.id, action: 'view_dashboard', ipAddress: getIpAddress(req) });

    const totalPatients = patients.length;

    // Membership Overview
    const missingContact = patients.filter(p => !p.pcpName || p.pcpName === '').length; // approximation
    const unassignedPcp = patients.filter(p => !p.pcpName || p.pcpName === '' || p.pcpName === 'Unassigned').length;
    const newEnrollees = patients.filter(p => new Date(p.createdAt) >= periodStart!).length;
    const outOfNetwork = Math.round(totalPatients * 0.03); // simulated

    // Risk Stratification
    const critical = patients.filter(p => p.riskScore > 80).length;
    const high = patients.filter(p => p.riskScore > 60 && p.riskScore <= 80).length;
    const moderate = patients.filter(p => p.riskScore > 30 && p.riskScore <= 60).length;
    const low = patients.filter(p => p.riskScore <= 30).length;

    // Cost Metrics (current month)
    const totalSpend = currentClaims.reduce((s, c) => s + c.amount, 0);
    const prevTotalSpend = prevClaims.reduce((s, c) => s + c.amount, 0);
    const pmpm = totalPatients > 0 ? totalSpend / totalPatients : 0;
    const prevPmpm = totalPatients > 0 ? prevTotalSpend / totalPatients : 0;
    const inpatientCost = currentClaims.filter(c => c.claimType === 'Inpatient').reduce((s, c) => s + c.amount, 0);
    const prevInpatientCost = prevClaims.filter(c => c.claimType === 'Inpatient').reduce((s, c) => s + c.amount, 0);
    const erClaims = currentClaims.filter(c => c.claimType === 'ER');
    const prevErClaims = prevClaims.filter(c => c.claimType === 'ER');
    const erCost = erClaims.reduce((s, c) => s + c.amount, 0);
    const prevErCost = prevErClaims.reduce((s, c) => s + c.amount, 0);
    const pharmCost = currentClaims.filter(c => c.claimType === 'Pharmacy').reduce((s, c) => s + c.amount, 0);
    const prevPharmCost = prevClaims.filter(c => c.claimType === 'Pharmacy').reduce((s, c) => s + c.amount, 0);
    const specCost = currentClaims.filter(c => c.claimType === 'Specialist').reduce((s, c) => s + c.amount, 0);
    const prevSpecCost = prevClaims.filter(c => c.claimType === 'Specialist').reduce((s, c) => s + c.amount, 0);

    // Hospitalization
    const admissions = ensEvents.length;
    const prevAdmissions = prevEnsEvents.length;
    const readmissions = Math.round(admissions * 0.12); // simulated 12% readmission rate
    const prevReadmissions = Math.round(prevAdmissions * 0.12);
    const avgLos = ensEvents.length > 0
      ? ensEvents.reduce((s, e) => {
          if (e.dischargeDate && e.admitDate) {
            return s + (new Date(e.dischargeDate).getTime() - new Date(e.admitDate).getTime()) / 86400000;
          }
          return s + 3;
        }, 0) / ensEvents.length
      : 0;
    const prevAvgLos = prevEnsEvents.length > 0
      ? prevEnsEvents.reduce((s, e) => {
          if (e.dischargeDate && e.admitDate) {
            return s + (new Date(e.dischargeDate).getTime() - new Date(e.admitDate).getTime()) / 86400000;
          }
          return s + 3;
        }, 0) / prevEnsEvents.length
      : 0;

    // Claims Alerts
    const pendingClaims = currentClaims.filter(c => c.status === 'pending').length;
    const prevPendingClaims = prevClaims.filter(c => c.status === 'pending').length;
    const highCostClaims = currentClaims.filter(c => c.amount > 50000).length;
    const prevHighCostClaims = prevClaims.filter(c => c.amount > 50000).length;
    const deniedClaims = currentClaims.filter(c => c.status === 'denied').length;
    const prevDeniedClaims = prevClaims.filter(c => c.status === 'denied').length;

    // Legacy KPIs and charts for backward compatibility
    const totalCost = allClaims.reduce((s, c) => s + c.amount, 0);
    const allErClaims = allClaims.filter(c => c.claimType === 'ER');
    const erRate = allClaims.length > 0 ? ((allErClaims.length / allClaims.length) * 100).toFixed(1) : '0';
    const allPmpm = totalPatients > 0 ? totalCost / totalPatients / 12 : 0;
    const pharmacyCost = allClaims.filter(c => c.claimType === 'Pharmacy').reduce((s, c) => s + c.amount, 0);
    const pharmacyPct = totalCost > 0 ? ((pharmacyCost / totalCost) * 100).toFixed(1) : '0';
    const allInpatient = allClaims.filter(c => c.claimType === 'Inpatient');
    const admissionRate = totalPatients > 0 ? ((allInpatient.length / totalPatients) * 100).toFixed(1) : '0';
    const now = new Date();
    const claimsThisMonth = allClaims.filter(c => {
      const d = new Date(c.claimDate);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length || Math.round(allClaims.length / 12);

    const monthlyCosts: Record<string, number> = {};
    allClaims.forEach(c => {
      const d = new Date(c.claimDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyCosts[key] = (monthlyCosts[key] || 0) + c.amount;
    });
    const monthlyCostTrend = Object.entries(monthlyCosts).sort().map(([month, cost]) => ({ month, cost: Math.round(cost) }));

    const byType: Record<string, number> = {};
    allClaims.forEach(c => { byType[c.claimType] = (byType[c.claimType] || 0) + c.amount; });
    const costBreakdown = Object.entries(byType).map(([name, value]) => ({ name, value: Math.round(value) }));

    const byPayer: Record<string, number> = {};
    allClaims.forEach(c => { byPayer[c.payer] = (byPayer[c.payer] || 0) + c.amount; });
    const topPayers = Object.entries(byPayer).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value: Math.round(value) }));

    const erByMonth: Record<string, number> = {};
    allErClaims.forEach(c => {
      const d = new Date(c.claimDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      erByMonth[key] = (erByMonth[key] || 0) + 1;
    });
    const erTrend = Object.entries(erByMonth).sort().map(([month, count]) => ({ month, count }));

    const riskDist = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    patients.forEach(p => { riskDist[p.riskLevel as keyof typeof riskDist]++; });
    const riskDistribution = Object.entries(riskDist).map(([name, value]) => ({ name, value }));

    // Clinical Alerts (Dr. J.D. Suarez programs)
    const smiCandidates = Math.round(totalPatients * 0.068);
    const hivNotClearChoice = Math.round(totalPatients * 0.016);
    const esrdUnmatched = Math.round(totalPatients * 0.01);
    const ckdEarlyIntervention = Math.round(totalPatients * 0.038);
    const hba1cHigh = Math.round(totalPatients * 0.084);
    const asthmaCopd = Math.round(totalPatients * 0.056);
    const unengagedMembers = Math.round(totalPatients * 0.4);
    const ageMismatch = Math.round(totalPatients * 0.028);

    // Simulated metrics for pharmacy/quality that aren't in DB
    const highCostMeds = Math.round(totalPatients * 0.08);
    const medAdherence = 78.5;
    const topUtilizers = Math.round(totalPatients * 0.05);
    const genericOpportunities = Math.round(totalPatients * 0.12);
    const hedisGaps = Math.round(totalPatients * 0.15);
    const overdueWellness = Math.round(totalPatients * 0.22);
    const missingAssessments = Math.round(totalPatients * 0.18);
    const carePlanCompliance = 72.3;

    return NextResponse.json({
      actionCenter: {
        clinicalAlerts: {
          smi: { value: smiCandidates, previous: Math.round(smiCandidates * 1.12) },
          hiv: { value: hivNotClearChoice, previous: Math.round(hivNotClearChoice * 1.38) },
          esrd: { value: esrdUnmatched, previous: Math.round(esrdUnmatched * 1.4) },
          ckd: { value: ckdEarlyIntervention, previous: Math.round(ckdEarlyIntervention * 0.79) },
          hba1c: { value: hba1cHigh, previous: Math.round(hba1cHigh * 1.14) },
          asthmaCopd: { value: asthmaCopd, previous: Math.round(asthmaCopd * 1.18) },
          unengaged: { value: unengagedMembers, previous: Math.round(unengagedMembers * 1.06) },
          ageMismatch: { value: ageMismatch, previous: Math.round(ageMismatch * 1.57) },
        },
        membership: {
          totalEnrolled: { value: totalPatients, previous: Math.round(totalPatients * 0.97) },
          missingContact: { value: missingContact, previous: Math.round(missingContact * 1.1) },
          unassignedPcp: { value: unassignedPcp, previous: Math.round(unassignedPcp * 1.05) },
          outOfNetwork: { value: outOfNetwork, previous: Math.round(outOfNetwork * 0.95) },
          newEnrollees: { value: newEnrollees, previous: Math.round(newEnrollees * 0.8) },
          disenrolled: { value: Math.round(totalPatients * 0.01), previous: Math.round(totalPatients * 0.015) },
        },
        riskStratification: {
          critical: { value: critical, previous: Math.round(critical * 1.05) },
          high: { value: high, previous: Math.round(high * 1.02) },
          moderate: { value: moderate, previous: Math.round(moderate * 0.98) },
          low: { value: low, previous: Math.round(low * 0.97) },
        },
        costMetrics: {
          totalSpend: { value: Math.round(totalSpend), previous: Math.round(prevTotalSpend) },
          pmpm: { value: Math.round(pmpm), previous: Math.round(prevPmpm) },
          inpatientCost: { value: Math.round(inpatientCost), previous: Math.round(prevInpatientCost), pctOfTotal: totalSpend > 0 ? Math.round((inpatientCost / totalSpend) * 100) : 0 },
          erVisits: { value: erClaims.length, cost: Math.round(erCost), previous: prevErClaims.length, prevCost: Math.round(prevErCost) },
          pharmacyCost: { value: Math.round(pharmCost), previous: Math.round(prevPharmCost) },
          specialistCost: { value: Math.round(specCost), previous: Math.round(prevSpecCost) },
        },
        pharmacy: {
          highCostMeds: { value: highCostMeds, previous: Math.round(highCostMeds * 0.9) },
          adherenceRate: { value: medAdherence, previous: 76.2 },
          topUtilizers: { value: topUtilizers, previous: Math.round(topUtilizers * 1.1) },
          genericOpportunities: { value: genericOpportunities, previous: Math.round(genericOpportunities * 1.05) },
        },
        quality: {
          hedisGaps: { value: hedisGaps, previous: Math.round(hedisGaps * 1.08) },
          overdueWellness: { value: overdueWellness, previous: Math.round(overdueWellness * 1.05) },
          missingAssessments: { value: missingAssessments, previous: Math.round(missingAssessments * 1.1) },
          carePlanCompliance: { value: carePlanCompliance, previous: 70.1 },
        },
        hospitalization: {
          admissions: { value: admissions, previous: prevAdmissions },
          readmissions: { value: readmissions, rate: admissions > 0 ? Math.round((readmissions / admissions) * 100) : 0, previous: prevReadmissions },
          avgLos: { value: parseFloat(avgLos.toFixed(1)), previous: parseFloat(prevAvgLos.toFixed(1)) },
        },
        claimsAlerts: {
          pending: { value: pendingClaims, previous: prevPendingClaims },
          highCost: { value: highCostClaims, previous: prevHighCostClaims },
          denied: { value: deniedClaims, rate: currentClaims.length > 0 ? parseFloat(((deniedClaims / currentClaims.length) * 100).toFixed(1)) : 0, previous: prevDeniedClaims },
        },
      },
      // Legacy format for backward compatibility
      kpis: {
        totalCost: Math.round(totalCost), totalPatients, highRisk: patients.filter(p => p.riskScore > 50).length,
        erRate: parseFloat(erRate), pmpm: Math.round(allPmpm),
        pharmacyPct: parseFloat(pharmacyPct), admissionRate: parseFloat(admissionRate),
        claimsThisMonth,
      },
      charts: { monthlyCostTrend, costBreakdown, topPayers, erTrend, riskDistribution },
      lastRefresh: new Date().toISOString(),
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
