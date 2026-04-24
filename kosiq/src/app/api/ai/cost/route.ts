import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';
import { generateCostAnalysis } from '@/lib/ai-engine';

export async function POST(req: Request) {
  try {
    const user = await requireAuth('view_analytics');
    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });

    const body = await req.json().catch(() => ({}));
    const analysis = await generateCostAnalysis(user.organizationId, body.period);

    await logAction({ userId: user.id, action: 'ai_cost_analysis', details: { period: body.period }, ipAddress: getIpAddress(req) });

    return NextResponse.json(analysis);
  } catch (error) {
    return handleAuthError(error);
  }
}
