import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { messages } = await req.json();

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

  if (!patient) return new Response('Patient not found', { status: 404 });

  const chartContext = `
Patient: ${patient.firstName} ${patient.lastName} | MRN: ${patient.mrn}
Admitted: ${patient.admissionDate} | Dx: ${patient.admissionDiagnosis}
Allergies: ${patient.allergies || 'NKDA'} | Code: ${patient.codeStatus || 'Full Code'}

Problems: ${patient.problems.map(p => `${p.name} (${p.status})`).join(', ')}
Recent Notes: ${patient.notes.slice(0, 10).map(n => `[${n.createdAt}] ${n.authorRole} ${n.authorName}: ${n.content.slice(0, 300)}`).join('\n')}
Vitals: ${patient.vitals.slice(0, 6).map(v => `[${v.recordedAt}] HR:${v.heartRate} BP:${v.bloodPressureSys}/${v.bloodPressureDia} SpO2:${v.oxygenSat}`).join('\n')}
Meds: ${patient.medications.filter(m => m.status === 'active').map(m => `${m.name} ${m.dosage} ${m.route} ${m.frequency}`).join(', ')}
Labs: ${patient.labResults.slice(0, 15).map(l => `[${l.resultAt}] ${l.testName}: ${l.value} ${l.unit || ''} (${l.flag || 'normal'})`).join('\n')}
Orders: ${patient.orders.slice(0, 8).map(o => `${o.orderType}: ${o.description} (${o.status})`).join('\n')}
`;

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1500,
    system: `You are ChartIQ, an AI clinical assistant. Answer questions about this patient's medical chart. Be concise and clinical. Reference specific notes, lab values, and dates when relevant. Never make clinical recommendations — only summarize and analyze existing chart data.\n\nPATIENT CHART DATA:\n${chartContext}`,
    messages: messages.map((m: any) => ({ role: m.role, content: m.content })),
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`));
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(readable, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', 'Connection': 'keep-alive' },
  });
}
