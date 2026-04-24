import * as XLSX from 'xlsx';
import prisma from './prisma';

function createWorkbook(): XLSX.WorkBook {
  return XLSX.utils.book_new();
}

function toBuffer(wb: XLSX.WorkBook): Uint8Array {
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  return new Uint8Array(buf);
}

export async function exportPatients(orgId: string): Promise<{ buffer: Uint8Array; filename: string }> {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const patients = await prisma.patient.findMany({
    where: { organizationId: orgId },
    include: { claims: true },
    orderBy: { riskScore: 'desc' },
  });

  const rows = patients.map(p => ({
    'External ID': p.externalId,
    'First Name': p.firstName,
    'Last Name': p.lastName,
    'DOB': new Date(p.dob).toLocaleDateString(),
    'Gender': p.gender,
    'Primary Payer': p.primaryPayer,
    'PCP': p.pcpName,
    'Risk Score': p.riskScore,
    'Risk Level': p.riskLevel,
    'Conditions': (() => { try { return JSON.parse(p.conditions).join(', '); } catch { return p.conditions; } })(),
    'Total Claims': p.claims.length,
    'Total Cost': Math.round(p.claims.reduce((s, c) => s + c.amount, 0)),
  }));

  const wb = createWorkbook();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Patients');
  const date = new Date().toISOString().slice(0, 10);
  return { buffer: toBuffer(wb), filename: `${org?.name || 'KOSIQ'}_Patients_${date}.xlsx` };
}

export async function exportClaims(orgId: string, filters: { from?: string; to?: string; payer?: string }): Promise<{ buffer: Uint8Array; filename: string }> {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const where: any = { patient: { organizationId: orgId } };

  if (filters.from || filters.to) {
    where.claimDate = {};
    if (filters.from) {
      const [y, m] = filters.from.split('-').map(Number);
      where.claimDate.gte = new Date(y, m - 1, 1);
    }
    if (filters.to) {
      const [y, m] = filters.to.split('-').map(Number);
      where.claimDate.lt = new Date(y, m, 1);
    }
  }
  if (filters.payer) where.payer = filters.payer;

  const claims = await prisma.claim.findMany({
    where,
    include: { patient: { select: { firstName: true, lastName: true, externalId: true } } },
    orderBy: { claimDate: 'desc' },
  });

  const rows = claims.map(c => ({
    'Claim ID': c.id,
    'Patient ID': c.patient.externalId,
    'Patient Name': `${c.patient.firstName} ${c.patient.lastName}`,
    'Claim Date': new Date(c.claimDate).toLocaleDateString(),
    'Type': c.claimType,
    'Provider': c.providerName,
    'Payer': c.payer,
    'Amount': c.amount,
    'Diagnosis Code': c.diagnosisCode || '',
    'Procedure Code': c.procedureCode || '',
    'Status': c.status,
  }));

  const wb = createWorkbook();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Claims');
  const date = new Date().toISOString().slice(0, 10);
  return { buffer: toBuffer(wb), filename: `${org?.name || 'KOSIQ'}_Claims_${date}.xlsx` };
}

export async function exportAnalytics(orgId: string): Promise<{ buffer: Uint8Array; filename: string }> {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const claims = await prisma.claim.findMany({
    where: { patient: { organizationId: orgId } },
    include: { patient: { select: { id: true } } },
  });

  const byType: Record<string, { count: number; total: number }> = {};
  claims.forEach(c => {
    if (!byType[c.claimType]) byType[c.claimType] = { count: 0, total: 0 };
    byType[c.claimType].count++;
    byType[c.claimType].total += c.amount;
  });

  const totalCost = claims.reduce((s, c) => s + c.amount, 0);
  const patientCount = new Set(claims.map(c => c.patient.id)).size;

  const summaryRows = Object.entries(byType).map(([type, { count, total }]) => ({
    'Category': type,
    'Claim Count': count,
    'Total Cost': Math.round(total),
    '% of Total': `${Math.round((total / (totalCost || 1)) * 100)}%`,
    'Avg per Claim': Math.round(total / (count || 1)),
  }));

  const overviewRows = [
    { Metric: 'Total Cost', Value: `$${Math.round(totalCost).toLocaleString()}` },
    { Metric: 'Total Patients', Value: String(patientCount) },
    { Metric: 'PMPM', Value: `$${Math.round(totalCost / (patientCount || 1)).toLocaleString()}` },
    { Metric: 'Total Claims', Value: String(claims.length) },
  ];

  const wb = createWorkbook();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(overviewRows), 'Overview');
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryRows), 'Cost by Category');
  const date = new Date().toISOString().slice(0, 10);
  return { buffer: toBuffer(wb), filename: `${org?.name || 'KOSIQ'}_Analytics_${date}.xlsx` };
}

export async function exportENSEvents(orgId: string): Promise<{ buffer: Uint8Array; filename: string }> {
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  const events = await prisma.eNSEvent.findMany({
    where: { patient: { organizationId: orgId } },
    include: { patient: { select: { firstName: true, lastName: true, externalId: true, riskScore: true } } },
    orderBy: { admitDate: 'desc' },
  });

  const rows = events.map(e => ({
    'Event ID': e.id,
    'Patient ID': e.patient.externalId,
    'Patient Name': `${e.patient.firstName} ${e.patient.lastName}`,
    'Risk Score': e.patient.riskScore,
    'Hospital': e.hospitalName,
    'Admission Type': e.admissionType,
    'Admit Date': new Date(e.admitDate).toLocaleDateString(),
    'Discharge Date': e.dischargeDate ? new Date(e.dischargeDate).toLocaleDateString() : '',
    'Diagnosis': e.diagnosis || '',
    'Status': e.status,
  }));

  const wb = createWorkbook();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'ENS Events');
  const date = new Date().toISOString().slice(0, 10);
  return { buffer: toBuffer(wb), filename: `${org?.name || 'KOSIQ'}_ENS_Events_${date}.xlsx` };
}
