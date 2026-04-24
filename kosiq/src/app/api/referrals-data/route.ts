import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const referrals = await prisma.referral.findMany({
    include: { patient: { select: { firstName: true, lastName: true, externalId: true, pcpName: true, medicalCenter: true } } },
  });

  // By center
  const centerMap: Record<string, number> = {};
  referrals.forEach(r => {
    const c = r.fromFacility;
    centerMap[c] = (centerMap[c] || 0) + 1;
  });
  const byCenter = Object.entries(centerMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // By PCP
  const pcpMap: Record<string, number> = {};
  referrals.forEach(r => { pcpMap[r.fromProvider] = (pcpMap[r.fromProvider] || 0) + 1; });
  const byPCP = Object.entries(pcpMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  // By specialty
  const specMap: Record<string, number> = {};
  referrals.forEach(r => { specMap[r.specialty] = (specMap[r.specialty] || 0) + 1; });
  const bySpecialty = Object.entries(specMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  // Daily count (last 28 days of data)
  const dayMap: Record<number, number> = {};
  referrals.forEach(r => {
    const d = r.referralDate.getDate();
    dayMap[d] = (dayMap[d] || 0) + 1;
  });
  const dailyCount = Array.from({ length: 28 }, (_, i) => ({
    day: `${i + 1}`,
    count: dayMap[i + 1] || 0,
  }));

  return NextResponse.json({ byCenter, byPCP, bySpecialty, dailyCount, total: referrals.length });
}
