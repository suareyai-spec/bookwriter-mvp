import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const department = searchParams.get('department') || '';

  const patients = await prisma.patient.findMany({
    where: { status: 'admitted' },
    include: {
      notes: { orderBy: { createdAt: 'desc' }, take: 5 },
      vitals: { orderBy: { recordedAt: 'desc' }, take: 3 },
      medications: { where: { status: 'active' } },
      labResults: { orderBy: { resultAt: 'desc' }, take: 5 },
      problems: { where: { status: 'active' } },
      orders: { where: { status: 'pending' } },
    },
  });

  const filtered = department
    ? patients.filter(p => p.notes.some(n => n.department === department))
    : patients;

  const patientSummaries = filtered.map(p => `
Patient: ${p.firstName} ${p.lastName} | Room: ${p.roomNumber}-${p.bedNumber} | MRN: ${p.mrn}
Dx: ${p.admissionDiagnosis} | Code: ${p.codeStatus || 'Full Code'} | Allergies: ${p.allergies || 'NKDA'}
Problems: ${p.problems.map(pr => pr.name).join(', ')}
Latest Vitals: ${p.vitals[0] ? `HR:${p.vitals[0].heartRate} BP:${p.vitals[0].bloodPressureSys}/${p.vitals[0].bloodPressureDia} SpO2:${p.vitals[0].oxygenSat}` : 'N/A'}
Active Meds: ${p.medications.map(m => `${m.name} ${m.dosage}`).join(', ')}
Recent Labs: ${p.labResults.slice(0, 3).map(l => `${l.testName}:${l.value}${l.flag === 'critical' ? ' ⚠️' : ''}`).join(', ')}
Pending Orders: ${p.orders.map(o => o.description).join(', ') || 'None'}
Recent Notes: ${p.notes.slice(0, 2).map(n => `[${n.authorRole}] ${n.content.slice(0, 200)}`).join(' | ')}
`).join('\n---\n');

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: 'You are a clinical AI assistant generating shift handoff reports. For each patient, create an SBAR format summary:\n- **S (Situation):** One-line current status\n- **B (Background):** Key history and context\n- **A (Assessment):** Current clinical assessment\n- **R (Recommendation):** Pending actions and things to watch\n\nFlag critical items with ⚠️. Use concise medical language. Format with markdown.',
      messages: [{ role: 'user', content: `Generate SBAR handoff summaries for these patients:\n\n${patientSummaries}` }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ handoff: text, generatedAt: new Date().toISOString(), patientCount: filtered.length });
  } catch (e: any) {
    return NextResponse.json({ error: 'AI handoff failed', details: e.message }, { status: 500 });
  }
}
