import { NextRequest, NextResponse } from 'next/server';
import { processChat } from '@/lib/chat-query-parser';

export async function POST(req: NextRequest) {
  try {
    const { message, history } = await req.json();
    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }
    const result = await processChat(message, history || []);
    return NextResponse.json(result);
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
