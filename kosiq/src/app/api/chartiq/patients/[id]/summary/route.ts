import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const patient = await prisma.chartPatient.findUnique({
    where: { id: params.id },
    include: {
      notes: { orderBy: { createdAt: 'desc' }, take: 20 },
      vitals: { orderBy: { recordedAt: 'desc' }, take: 12 },
      medications: true,
      labResults: { orderBy: { resultAt: 'desc' }, take: 30 },
      orders: { orderBy: { orderedAt: 'desc' }, take: 15 },
      problems: true,
    },
  });
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const chartData = `
PATIENT: ${patient.firstName} ${patient.lastName} | MRN: ${patient.mrn} | DOB: ${patient.dateOfBirth}
Admission: ${patient.admissionDate} | Dx: ${patient.admissionDiagnosis}
Allergies: ${patient.allergies || 'NKDA'} | Code Status: ${patient.codeStatus || 'Full Code'}

ACTIVE PROBLEMS:
${patient.problems.filter(p => p.status === 'active').map(p => `- ${p.name} (${p.icdCode || 'no ICD'}): ${p.notes || ''}`).join('\n')}

RECENT NOTES:
${patient.notes.map(n => `[${n.createdAt} | ${n.authorRole} ${n.authorName} | ${n.noteType} | ${n.shiftType} shift]\n${n.content}`).join('\n---\n')}

LATEST VITALS:
${patient.vitals.slice(0, 6).map(v => `[${v.recordedAt}] T:${v.temperature} HR:${v.heartRate} BP:${v.bloodPressureSys}/${v.bloodPressureDia} RR:${v.respiratoryRate} SpO2:${v.oxygenSat}% Pain:${v.painLevel}/10`).join('\n')}

MEDICATIONS:
${patient.medications.filter(m => m.status === 'active').map(m => `- ${m.name} ${m.dosage} ${m.route} ${m.frequency}`).join('\n')}

RECENT LABS:
${patient.labResults.slice(0, 20).map(l => `[${l.resultAt}] ${l.testName}: ${l.value} ${l.unit || ''} (${l.normalRange || ''}) ${l.flag === 'critical' || l.flag === 'Critical' ? '⚠️ CRITICAL' : l.flag === 'high' || l.flag === 'low' ? '⚡ ABNORMAL' : ''}`).join('\n')}

RECENT ORDERS:
${patient.orders.slice(0, 10).map(o => `[${o.orderedAt}] ${o.orderType}: ${o.description} (${o.status}, ${o.priority})`).join('\n')}
`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: 'You are a clinical AI assistant. Summarize this patient\'s chart for a physician doing shift handoff. Organize by active problem. Highlight what changed in the last 12 hours. Use concise medical language. Flag any critical values or concerns. Format in sections: SHIFT SUMMARY, WHAT\'S NEW (last 12h), ACTIVE PROBLEMS (each with status + plan), KEY NUMBERS. Use markdown formatting.',
      messages: [{ role: 'user', content: `Summarize this patient chart:\n\n${chartData}` }],
    });
    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return NextResponse.json({ summary: text, generatedAt: new Date().toISOString() });
  } catch (e: any) {
    return NextResponse.json({ error: 'AI summary failed', details: e.message }, { status: 500 });
  }
}
