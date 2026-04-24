import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const { messages } = await req.json();

  const patients = await prisma.chartPatient.findMany({
    where: { status: { in: ['admitted', 'Admitted'] } },
    include: {
      problems: { where: { status: 'active' } },
      vitals: { orderBy: { recordedAt: 'desc' }, take: 1 },
      labResults: { orderBy: { resultAt: 'desc' }, take: 5 },
      medications: { where: { status: 'active' } },
      orders: { where: { status: { in: ['pending', 'Pending'] } } },
      notes: { orderBy: { createdAt: 'desc' }, take: 3 },
    },
  });

  const patientContext = patients.map(p => {
    const latestVital = p.vitals[0];
    const criticalLabs = p.labResults.filter(l => l.flag === 'critical' || l.flag === 'Critical' || l.flag === 'high' || l.flag === 'low');
    return `
Patient: ${p.firstName} ${p.lastName} (MRN: ${p.mrn}, Room ${p.roomNumber}/${p.bedNumber})
Admitted: ${p.admissionDate.toISOString().split('T')[0]} | Dx: ${p.admissionDiagnosis} | Code: ${p.codeStatus} | Allergies: ${p.allergies || 'NKDA'}
Active Problems: ${p.problems.map(pr => `${pr.name} (${pr.icdCode})`).join(', ')}
Latest Vitals: ${latestVital ? `T:${latestVital.temperature} HR:${latestVital.heartRate} BP:${latestVital.bloodPressureSys}/${latestVital.bloodPressureDia} RR:${latestVital.respiratoryRate} O2:${latestVital.oxygenSat}%` : 'N/A'}
Flagged Labs: ${criticalLabs.map(l => `${l.testName}: ${l.value} ${l.unit || ''} [${l.flag}]`).join(', ') || 'None'}
Active Meds: ${p.medications.map(m => `${m.name} ${m.dosage} ${m.route} ${m.frequency}`).join(', ')}
Pending Orders: ${p.orders.map(o => `${o.description} (${o.priority})`).join(', ') || 'None'}
Recent Notes: ${p.notes.map(n => `[${n.authorRole}/${n.shiftType}] ${n.content.slice(0, 200)}`).join(' | ')}
`.trim();
  }).join('\n---\n');

  const systemPrompt = `You are ChartIQ, an AI clinical assistant for hospital staff. You have access to the current census of all admitted patients and their chart data.

CURRENT PATIENT CENSUS (${patients.length} admitted patients):
${patientContext}

Instructions:
- Answer questions about any patient or the overall census
- Be concise and clinical
- Reference specific data (lab values, vitals, dates) when relevant
- Flag critical values or concerns proactively
- Never make clinical recommendations — only summarize and analyze existing chart data`;

  const apiMessages = [
    { role: 'user' as const, content: systemPrompt },
    { role: 'assistant' as const, content: 'I have the full census loaded. How can I help?' },
    ...messages.map((m: { role: string; content: string }) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    })),
  ];

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      stream: true,
      messages: apiMessages,
    }),
  });

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader();
      if (!reader) { controller.close(); return; }
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.type === 'content_block_delta' && parsed.delta?.text) {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: parsed.delta.text })}\n\n`));
              }
            } catch {}
          }
        }
      }
      controller.enqueue(encoder.encode('data: [DONE]\n\n'));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
  });
}
