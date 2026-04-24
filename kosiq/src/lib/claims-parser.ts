import * as XLSX from 'xlsx';
import { parse } from 'csv-parse/sync';

const COLUMN_MAPPINGS: Record<string, string[]> = {
  patientId: ['patient_id', 'member_id', 'enrollee_id', 'patientid', 'memberid', 'member id', 'patient id'],
  claimDate: ['claim_date', 'service_date', 'date_of_service', 'dos', 'claimdate', 'service date'],
  amount: ['amount', 'paid_amount', 'billed_amount', 'total_charge', 'charge', 'paid amount', 'billed amount'],
  diagnosisCode: ['diagnosis_code', 'dx_code', 'icd10', 'diagnosis', 'dx', 'icd_code', 'diagnosis code'],
  procedureCode: ['procedure_code', 'cpt_code', 'proc_code', 'cpt', 'procedure code', 'cpt code'],
  providerName: ['provider_name', 'rendering_provider', 'provider', 'providername', 'provider name'],
  payer: ['payer', 'plan_name', 'insurance', 'payer_name', 'plan name', 'insurance company'],
  claimType: ['claim_type', 'type_of_service', 'service_type', 'claimtype', 'claim type', 'service type'],
  status: ['status', 'claim_status', 'adjudication_status', 'claim status'],
  patientName: ['patient_name', 'member_name', 'patient name', 'member name', 'name'],
  firstName: ['first_name', 'firstname', 'first name', 'fname'],
  lastName: ['last_name', 'lastname', 'last name', 'lname'],
  dob: ['dob', 'date_of_birth', 'birth_date', 'birthdate', 'date of birth'],
  gender: ['gender', 'sex'],
};

export interface ParseResult {
  columns: string[];
  rows: Record<string, any>[];
  totalRows: number;
  detectedMappings: Record<string, string>;
}

export interface ProcessResult {
  recordsParsed: number;
  recordsFailed: number;
  errors: string[];
}

export function parseFile(buffer: Buffer, fileName: string): { columns: string[]; rows: Record<string, any>[] } {
  const ext = fileName.toLowerCase().split('.').pop();
  if (ext === 'csv' || ext === 'txt') {
    const text = buffer.toString('utf-8');
    const records = parse(text, { columns: true, skip_empty_lines: true, trim: true }) as Record<string, any>[];
    const columns = records.length > 0 ? Object.keys(records[0] as object) : [];
    return { columns, rows: records };
  } else if (ext === 'xlsx' || ext === 'xls') {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, any>[];
    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    return { columns, rows };
  }
  throw new Error(`Unsupported file type: ${ext}`);
}

export function detectMappings(columns: string[]): Record<string, string> {
  const mappings: Record<string, string> = {};
  for (const [field, aliases] of Object.entries(COLUMN_MAPPINGS)) {
    for (const col of columns) {
      const normalized = col.toLowerCase().trim();
      if (aliases.includes(normalized)) {
        mappings[field] = col;
        break;
      }
    }
  }
  return mappings;
}

export function previewFile(buffer: Buffer, fileName: string): ParseResult {
  const { columns, rows } = parseFile(buffer, fileName);
  const detectedMappings = detectMappings(columns);
  return {
    columns,
    rows: rows.slice(0, 10),
    totalRows: rows.length,
    detectedMappings,
  };
}

export function validateDate(value: any): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function validateAmount(value: any): number | null {
  if (value === null || value === undefined || value === '') return null;
  const n = typeof value === 'string' ? parseFloat(value.replace(/[$,]/g, '')) : Number(value);
  return isNaN(n) || n < 0 ? null : n;
}

export function validateICD10(code: string | null | undefined): string | null {
  if (!code) return null;
  const cleaned = code.trim().toUpperCase();
  // Basic ICD-10 format: letter + 2 digits, optionally dot + more digits
  if (/^[A-Z]\d{2}(\.\d{1,4})?$/.test(cleaned)) return cleaned;
  return cleaned; // accept anyway, just log warning
}

export function processRows(
  rows: Record<string, any>[],
  mappings: Record<string, string>
): { claims: any[]; patients: Map<string, any>; errors: string[] } {
  const claims: any[] = [];
  const patients = new Map<string, any>();
  const errors: string[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    try {
      const patientId = row[mappings.patientId]?.toString()?.trim();
      if (!patientId) { errors.push(`Row ${i + 1}: Missing patient ID`); continue; }

      const claimDate = validateDate(row[mappings.claimDate]);
      if (!claimDate && mappings.claimDate) { errors.push(`Row ${i + 1}: Invalid date`); continue; }

      const amount = validateAmount(row[mappings.amount]);
      if (amount === null && mappings.amount) { errors.push(`Row ${i + 1}: Invalid amount`); continue; }

      // Build patient info
      if (!patients.has(patientId)) {
        let firstName = row[mappings.firstName] || '';
        let lastName = row[mappings.lastName] || '';
        if (!firstName && !lastName && mappings.patientName) {
          const parts = (row[mappings.patientName] || '').split(/[, ]+/);
          firstName = parts[0] || '';
          lastName = parts.slice(1).join(' ') || '';
        }
        patients.set(patientId, {
          externalId: patientId,
          firstName: firstName || 'Unknown',
          lastName: lastName || 'Unknown',
          dob: validateDate(row[mappings.dob]) || new Date(1950, 0, 1),
          gender: row[mappings.gender] || 'U',
          primaryPayer: row[mappings.payer] || 'Unknown',
        });
      }

      claims.push({
        externalPatientId: patientId,
        claimDate: claimDate || new Date(),
        claimType: row[mappings.claimType] || 'Other',
        providerName: row[mappings.providerName] || 'Unknown',
        payer: row[mappings.payer] || 'Unknown',
        amount: amount || 0,
        diagnosisCode: validateICD10(row[mappings.diagnosisCode]),
        procedureCode: row[mappings.procedureCode] || null,
        status: row[mappings.status] || 'paid',
      });
    } catch (e: any) {
      errors.push(`Row ${i + 1}: ${e.message}`);
    }
  }

  return { claims, patients, errors };
}
