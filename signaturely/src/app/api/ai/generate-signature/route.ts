import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();
    if (!prompt || typeof prompt !== 'string') {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const msg = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [{
        role: 'user',
        content: `You are a professional email signature designer. Based on this one-sentence description, generate a complete email signature data JSON.

Description: "${prompt}"

Infer the person's name, job title, company, industry, and suggest appropriate values. If details aren't explicit, make reasonable professional guesses.

Return ONLY valid JSON (no markdown, no explanation) matching this exact structure:
{
  "personal": {
    "fullName": "string",
    "jobTitle": "string",
    "company": "string",
    "department": "string",
    "email": "string (suggest based on name/company)",
    "phone": "",
    "mobile": "",
    "website": "string (suggest based on company)",
    "address": ""
  },
  "images": {
    "photo": "",
    "logo": "",
    "photoShape": "circle",
    "photoSize": 80,
    "logoSize": 100
  },
  "social": [
    { "platform": "string", "url": "" }
  ],
  "design": {
    "template": "string (one of: classic, modern, bold, elegant, compact, creative, corporate, startup, legal, realestate, medical, minimal)",
    "primaryColor": "string (hex, matched to industry: real estate=#1B365D, tech=#6366f1, medical=#0D9488, legal=#1E3A5F, creative=#8B5CF6, finance=#0F172A, marketing=#EC4899)",
    "secondaryColor": "string (hex, complementary)",
    "textColor": "#1f2937",
    "fontFamily": "string (Arial, Helvetica, Georgia, Verdana, Inter)",
    "fontSize": { "name": 16, "title": 13, "company": 13, "info": 12 },
    "separator": "pipe",
    "layout": "horizontal",
    "iconStyle": "colored",
    "iconSize": "medium",
    "iconShape": "circle"
  },
  "addons": {
    "cta": { "enabled": true, "text": "string (industry-appropriate CTA)", "url": "", "color": "string (match primary)" },
    "banner": { "enabled": false, "image": "", "url": "" },
    "disclaimer": { "enabled": false, "text": "" },
    "meeting": { "enabled": false, "url": "", "platform": "calendly" },
    "tagline": { "enabled": true, "text": "string (industry-appropriate tagline)" }
  }
}

Include 2-4 relevant social platforms for the industry (just the platform names, leave urls empty).
Choose the template that best fits the industry.
Make the CTA and tagline compelling and specific to their role.`
      }]
    });

    const text = msg.content[0].type === 'text' ? msg.content[0].text : '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
    }

    const signatureData = JSON.parse(jsonMatch[0]);
    return NextResponse.json(signatureData);
  } catch (error: unknown) {
    console.error('AI generate error:', error);
    return NextResponse.json({ error: 'Failed to generate signature' }, { status: 500 });
  }
}
