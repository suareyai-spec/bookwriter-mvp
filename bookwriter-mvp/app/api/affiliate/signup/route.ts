import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const Body = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  code: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_-]+$/).optional(),
  website: z.string().url().optional().or(z.literal('')),
  audience: z.string().max(500).optional(),
});

function generateCode(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 12) || 'partner';
}

export async function POST(req: NextRequest) {
  try {
    const body = Body.parse(await req.json());
    let code = body.code || generateCode(body.name);

    // Ensure uniqueness
    let attempt = 0;
    while (attempt < 10) {
      const exists = await prisma.affiliate.findUnique({ where: { code } });
      if (!exists) break;
      attempt++;
      code = generateCode(body.name) + attempt;
    }

    const affiliate = await prisma.affiliate.create({
      data: {
        code,
        ownerName: body.name,
        ownerEmail: body.email,
        notes: [body.website, body.audience].filter(Boolean).join(' | '),
      },
    });

    return NextResponse.json({ ok: true, code: affiliate.code });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
