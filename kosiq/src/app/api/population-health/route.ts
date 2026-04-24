import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function age(dob: Date): number {
  const now = new Date();
  let a = now.getFullYear() - dob.getFullYear();
  if (now.getMonth() < dob.getMonth() || (now.getMonth() === dob.getMonth() && now.getDate() < dob.getDate())) a--;
  return a;
}

function ageBucket(a: number): string {
  if (a < 70) return '65-69';
  if (a < 75) return '70-74';
  if (a < 80) return '75-79';
  if (a < 85) return '80-84';
  return '85+';
}

function parseConditions(c: string): string[] {
  try {
    const parsed = JSON.parse(c);
    if (Array.isArray(parsed)) return parsed.map((s: string) => s.trim()).filter(Boolean);
  } catch {}
  if (c && c.length > 0) return c.split(',').map(s => s.trim()).filter(Boolean);
  return [];
}

// Seeded random for deterministic simulation
function seededRandom(seed: number) {
  let s = seed;
  return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
}

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: { claims: true },
    });

    const totalMembers = patients.length;

    // Demographics
    const ages = patients.map(p => age(p.dob));
    const avgAge = Math.round(ages.reduce((a, b) => a + b, 0) / totalMembers);
    const genderSplit = { male: 0, female: 0, other: 0 };
    patients.forEach(p => {
      const g = p.gender.toLowerCase();
      if (g === 'male' || g === 'm') genderSplit.male++;
      else if (g === 'female' || g === 'f') genderSplit.female++;
      else genderSplit.other++;
    });

    const ageDistribution: Record<string, number> = { '65-69': 0, '70-74': 0, '75-79': 0, '80-84': 0, '85+': 0 };
    ages.forEach(a => { ageDistribution[ageBucket(a)]++; });

    // Per-patient cost
    const patientCosts = patients.map(p => ({
      ...p,
      totalCost: p.claims.reduce((s, c) => s + c.amount, 0),
      conditions: parseConditions(p.conditions),
      age: age(p.dob),
    }));

    const totalCost = patientCosts.reduce((s, p) => s + p.totalCost, 0);
    const avgRiskScore = Math.round(patientCosts.reduce((s, p) => s + p.riskScore, 0) / totalMembers);

    // Health Status Tiers
    const costSorted = [...patientCosts].sort((a, b) => b.totalCost - a.totalCost);
    const p90Cost = costSorted[Math.floor(totalMembers * 0.1)]?.totalCost || 50000;
    const p95Cost = costSorted[Math.floor(totalMembers * 0.05)]?.totalCost || 80000;

    type Tier = 'Healthy' | 'At-Risk' | 'Chronic' | 'Complex' | 'Catastrophic';
    function classifyTier(p: typeof patientCosts[0]): Tier {
      const nc = p.conditions.length;
      if (nc >= 4 && p.totalCost >= p90Cost) return 'Catastrophic';
      if (nc >= 4) return 'Complex';
      if (nc >= 2) return 'Chronic';
      if (nc === 1 || p.totalCost > p90Cost * 0.3) return 'At-Risk';
      return 'Healthy';
    }

    const tierMap: Record<Tier, typeof patientCosts> = { Healthy: [], 'At-Risk': [], Chronic: [], Complex: [], Catastrophic: [] };
    patientCosts.forEach(p => tierMap[classifyTier(p)].push(p));

    const healthStatus = (['Healthy', 'At-Risk', 'Chronic', 'Complex', 'Catastrophic'] as Tier[]).map(tier => {
      const pts = tierMap[tier];
      const count = pts.length;
      const tierCost = pts.reduce((s, p) => s + p.totalCost, 0);
      return {
        tier,
        count,
        pctPopulation: Math.round((count / totalMembers) * 1000) / 10,
        pctCost: Math.round((tierCost / totalCost) * 1000) / 10,
        avgCost: count > 0 ? Math.round(tierCost / count) : 0,
      };
    });

    // Cost concentration
    const top5pctCount = Math.ceil(totalMembers * 0.05);
    const top5pctCost = costSorted.slice(0, top5pctCount).reduce((s, p) => s + p.totalCost, 0);
    const costConcentration = Math.round((top5pctCost / totalCost) * 100);

    // Disease Prevalence
    const CONDITIONS = ['Diabetes', 'CHF', 'COPD', 'CKD', 'Hypertension', 'Depression', 'Anxiety', 'Asthma',
      'Coronary Artery Disease', 'Atrial Fibrillation', 'Obesity', 'Dementia', 'Cancer', 'HIV', 'Substance Abuse'];

    const diseasePrevalence = CONDITIONS.map(cond => {
      const affected = patientCosts.filter(p => p.conditions.some(c => c.toLowerCase().includes(cond.toLowerCase())));
      const count = affected.length;
      const condCost = affected.reduce((s, p) => s + p.totalCost, 0);
      return {
        condition: cond,
        count,
        prevalence: Math.round((count / totalMembers) * 1000) / 10,
        avgCost: count > 0 ? Math.round(condCost / count) : 0,
        costBurden: Math.round((condCost / totalCost) * 1000) / 10,
      };
    }).sort((a, b) => b.prevalence - a.prevalence);

    // Comorbidity: diabetics with hypertension
    const diabetics = patientCosts.filter(p => p.conditions.some(c => c.toLowerCase().includes('diabetes')));
    const diabeticsWithHtn = diabetics.filter(p => p.conditions.some(c => c.toLowerCase().includes('hypertension')));
    const comorbidityHighlights = [
      { text: `${diabetics.length > 0 ? Math.round((diabeticsWithHtn.length / diabetics.length) * 100) : 0}% of diabetics also have hypertension`, conditions: ['Diabetes', 'Hypertension'] },
    ];

    // CHF + CKD
    const chfPts = patientCosts.filter(p => p.conditions.some(c => c.toLowerCase().includes('chf')));
    const chfWithCkd = chfPts.filter(p => p.conditions.some(c => c.toLowerCase().includes('ckd')));
    if (chfPts.length > 0) {
      comorbidityHighlights.push({ text: `${Math.round((chfWithCkd.length / chfPts.length) * 100)}% of CHF patients also have CKD`, conditions: ['CHF', 'CKD'] });
    }

    // COPD + Depression
    const copdPts = patientCosts.filter(p => p.conditions.some(c => c.toLowerCase().includes('copd')));
    const copdWithDep = copdPts.filter(p => p.conditions.some(c => c.toLowerCase().includes('depression')));
    if (copdPts.length > 0) {
      comorbidityHighlights.push({ text: `${Math.round((copdWithDep.length / copdPts.length) * 100)}% of COPD patients also have depression`, conditions: ['COPD', 'Depression'] });
    }

    // Prevention Gaps (simulated but based on real condition counts)
    const rand = seededRandom(42);
    const diabeticCount = diabetics.length;
    const femaleCount = genderSplit.female;
    const over50 = patientCosts.filter(p => p.age >= 50).length;

    const preventionGaps = [
      { screening: 'HbA1c Testing', eligible: diabeticCount, gapPct: 32 + Math.round(rand() * 10), potentialImpact: 'Reduces complications by 25%' },
      { screening: 'Mammography', eligible: femaleCount, gapPct: 28 + Math.round(rand() * 12), potentialImpact: 'Early detection saves $45K/case' },
      { screening: 'Colonoscopy', eligible: totalMembers, gapPct: 42 + Math.round(rand() * 8), potentialImpact: 'Prevents 60% of colorectal cancers' },
      { screening: 'Annual Wellness Visit', eligible: totalMembers, gapPct: 35 + Math.round(rand() * 10), potentialImpact: 'Identifies 3.2 gaps per visit avg' },
      { screening: 'Flu Vaccine', eligible: totalMembers, gapPct: 22 + Math.round(rand() * 8), potentialImpact: 'Reduces hospitalizations by 40%' },
      { screening: 'Bone Density Scan', eligible: femaleCount, gapPct: 55 + Math.round(rand() * 10), potentialImpact: 'Prevents hip fractures ($35K avg)' },
      { screening: 'Diabetic Eye Exam', eligible: diabeticCount, gapPct: 38 + Math.round(rand() * 12), potentialImpact: 'Prevents vision loss in 90% of cases' },
      { screening: 'Diabetic Foot Exam', eligible: diabeticCount, gapPct: 45 + Math.round(rand() * 10), potentialImpact: 'Reduces amputations by 50%' },
    ].map(g => ({
      ...g,
      gapCount: Math.round(g.eligible * g.gapPct / 100),
    }));

    // SDOH (simulated deterministically)
    const sdoh = [
      { factor: 'Transportation Barriers', pctAffected: 18, erMultiplier: 1.8 },
      { factor: 'Food Insecurity', pctAffected: 14, erMultiplier: 2.1 },
      { factor: 'Housing Instability', pctAffected: 8, erMultiplier: 2.4 },
      { factor: 'Social Isolation', pctAffected: 22, erMultiplier: 1.6 },
      { factor: 'Health Literacy Barriers', pctAffected: 25, erMultiplier: 1.5 },
    ].map(s => ({
      ...s,
      affectedCount: Math.round(totalMembers * s.pctAffected / 100),
    }));

    // Provider Panels
    const pcpGroups: Record<string, typeof patientCosts> = {};
    patientCosts.forEach(p => {
      if (!pcpGroups[p.pcpName]) pcpGroups[p.pcpName] = [];
      pcpGroups[p.pcpName].push(p);
    });

    const providerPanels = Object.entries(pcpGroups).map(([pcp, pts]) => {
      const panelSize = pts.length;
      const avgRisk = Math.round(pts.reduce((s, p) => s + p.riskScore, 0) / panelSize);
      const avgA = Math.round(pts.reduce((s, p) => s + p.age, 0) / panelSize);
      const chronicPct = Math.round((pts.filter(p => p.conditions.length >= 2).length / panelSize) * 100);
      const costPerMember = Math.round(pts.reduce((s, p) => s + p.totalCost, 0) / panelSize);
      return { pcp, panelSize, avgRisk, avgAge: avgA, chronicPct, costPerMember };
    }).sort((a, b) => b.panelSize - a.panelSize);

    // 12-Month Trends (simulated with slight variations)
    const months = ['Apr 25', 'May 25', 'Jun 25', 'Jul 25', 'Aug 25', 'Sep 25', 'Oct 25', 'Nov 25', 'Dec 25', 'Jan 26', 'Feb 26', 'Mar 26'];
    const basePMPM = Math.round(totalCost / totalMembers / 12);
    const trendRand = seededRandom(99);
    const trends = months.map((month, i) => ({
      month,
      pmpm: basePMPM + Math.round((trendRand() - 0.4) * basePMPM * 0.15),
      erRate: 280 + Math.round((trendRand() - 0.5) * 60) + Math.round(i * 2),
      admissionRate: 180 + Math.round((trendRand() - 0.5) * 40),
      avgRiskScore: avgRiskScore + Math.round((trendRand() - 0.5) * 4),
      chronicPrevalence: 62 + Math.round((trendRand() - 0.5) * 6),
    }));

    return NextResponse.json({
      demographics: {
        totalMembers,
        avgAge,
        genderSplit,
        ageDistribution: Object.entries(ageDistribution).map(([bucket, count]) => ({ bucket, count })),
        avgRiskScore,
        totalAnnualCost: Math.round(totalCost),
        costPMPM: Math.round(totalCost / totalMembers / 12),
      },
      healthStatus,
      costConcentration,
      diseasePrevalence,
      comorbidityHighlights,
      preventionGaps,
      sdoh,
      providerPanels,
      trends,
    });
  } catch (error: any) {
    console.error('Population health API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
