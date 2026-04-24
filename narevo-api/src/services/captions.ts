import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

interface CaptionRequest {
  topic: string;
  platform: string;
  tone: 'professional' | 'casual' | 'funny' | 'engaging';
  length: 'short' | 'medium' | 'long';
  count: number;
}

interface Caption {
  text: string;
  hashtags: string[];
}

const platformGuidelines: Record<string, string> = {
  instagram: 'Instagram captions should be engaging, use emojis, and include 15-30 relevant hashtags. Max 2200 chars.',
  facebook: 'Facebook posts should be conversational, use 2-5 hashtags max, and encourage engagement with questions.',
  youtube: 'YouTube descriptions should be SEO-optimized, include timestamps if applicable, and use 3-5 hashtags.',
  tiktok: 'TikTok captions should be short, trendy, use popular sounds references, and include 3-8 trending hashtags.',
};

const lengthGuide: Record<string, string> = {
  short: '1-2 sentences',
  medium: '3-5 sentences',
  long: '1-2 paragraphs',
};

export async function generateCaptions(req: CaptionRequest): Promise<Caption[]> {
  const prompt = `Generate ${req.count} ${req.tone} social media captions about "${req.topic}" for ${req.platform}.

Guidelines:
- ${platformGuidelines[req.platform] || 'Write an engaging social media caption.'}
- Length: ${lengthGuide[req.length]}
- Tone: ${req.tone}

Return a JSON array with objects having "text" (the caption) and "hashtags" (array of hashtag strings without #).
Return ONLY the JSON array, no other text.`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: prompt }],
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  
  try {
    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch {
    // Fallback if parsing fails
    return [{ text, hashtags: [] }];
  }
}
