import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { name, title, company, industry, type } = await req.json();
    if (!type || !['tagline', 'cta'].includes(type)) {
      return NextResponse.json({ error: 'Type must be "tagline" or "cta"' }, { status: 400 });
    }

    const context = [name, title, company, industry].filter(Boolean).join(', ') || 'a professional';

    const prompt = type === 'tagline'
      ? `Generate 5 professional email signature taglines for: ${context}. Short, memorable, under 60 characters each. Mix of inspirational, descriptive, and value-proposition styles.`
      : `Generate 5 call-to-action button texts for an email signature for: ${context}. Action-oriented, specific to their role/industry, 2-5 words each.`;

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `${prompt}\n\nReturn ONLY valid JSON (no markdown): { "suggestions": ["string", "string", "string", "string", "string"] }`
      }]
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (error: unknown) {
    console.error('AI taglines error:', error);
    return NextResponse.json({ error: 'Failed to generate suggestions' }, { status: 500 });
  }
}
