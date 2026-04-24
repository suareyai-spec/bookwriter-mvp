import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt, industry } = await req.json();
    if (!prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `Generate a styled HTML email banner based on this description: "${prompt}"${industry ? ` (Industry: ${industry})` : ''}

Return ONLY valid JSON (no markdown):
{
  "headline": "string (short, impactful, max 6 words)",
  "subtext": "string (details, max 60 chars)",
  "ctaText": "string (action button text, max 3 words)",
  "url": "",
  "bgColor": "string (hex)",
  "bgGradient": "string (CSS gradient)",
  "textColor": "string (hex, ensure contrast)",
  "accentColor": "string (hex, for CTA button)",
  "style": "string (modern|bold|elegant|minimal)"
}`
      }]
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to generate banner' }, { status: 500 });
    }

    const bannerData = JSON.parse(jsonMatch[0]);
    return NextResponse.json(bannerData);
  } catch (error: unknown) {
    console.error('AI banner error:', error);
    return NextResponse.json({ error: 'Failed to generate banner' }, { status: 500 });
  }
}
