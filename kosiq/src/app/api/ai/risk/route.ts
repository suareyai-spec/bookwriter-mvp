import { NextResponse } from 'next/server';
import { requireAuth, handleAuthError } from '@/lib/roles';
import { logAction, getIpAddress } from '@/lib/audit';
import { calculateRiskScore, identifyHighRiskPatients } from '@/lib/ai-engine';

export async function POST(req: Request) {
  try {
    const user = await requireAuth('view_patients');
    const body = await req.json();

    if (body.patientId) {
      const result = await calculateRiskScore(body.patientId);
      await logAction({ userId: user.id, action: 'ai_risk_score', resource: `patient:${body.patientId}`, ipAddress: getIpAddress(req) });
      return NextResponse.json(result);
    }

    if (!user.organizationId) return NextResponse.json({ error: 'No organization' }, { status: 400 });
    const alerts = await identifyHighRiskPatients(user.organizationId);
    await logAction({ userId: user.id, action: 'ai_high_risk_scan', ipAddress: getIpAddress(req) });
    return NextResponse.json({ alerts });
  } catch (error) {
    return handleAuthError(error);
  }
}
