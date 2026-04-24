import prisma from '@/lib/prisma';
import Anthropic from '@anthropic-ai/sdk';

interface ChatResponse {
  response: string;
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

async function gatherContext(msg: string): Promise<string> {
  const lower = msg.toLowerCase();
  const sections: string[] = [];

  // Always provide summary stats
  const totalPatients = await prisma.patient.count();
  const avgRisk = await prisma.patient.aggregate({ _avg: { riskScore: true } });
  const totalClaims = await prisma.claim.count();
  const totalClaimAmt = await prisma.claim.aggregate({ _sum: { amount: true } });
  sections.push(`POPULATION SUMMARY: ${totalPatients} total patients, avg risk score ${avgRisk._avg.riskScore?.toFixed(1)}, ${totalClaims} total claims worth $${(totalClaimAmt._sum.amount || 0).toLocaleString()}`);

  // Patient name search - check if message contains potential names
  const words = msg.split(/\s+/).filter(w => w.length > 2 && /^[A-Za-z]+$/.test(w));
  const skipWords = new Set(['tell','about','show','find','what','who','how','many','patients','patient','the','and','for','with','are','has','have','their','risk','score','high','low','medium','critical','cost','total','average','above','below','more','less','than','all','list','give','get','from','this','that','can','you','please','thanks','does','medications','drugs','claims','history','referrals','recent','last','first','name','admissions','hospitalization','hospital','diagnosed','condition','conditions','diabetes','hypertension','copd','asthma','ckd','chf','esrd','hiv','obesity','our','any','some','every','each','most','top','highest','lowest','which','when','where','why','would','like','see','look','into','detail','details','full','information','info','data','report','analysis','summary','assessment','evaluate','check']);
  
  const nameWords = words.filter(w => !skipWords.has(w.toLowerCase()));
  if (nameWords.length > 0) {
    for (const w of nameWords.slice(0, 3)) {
      const patients = await prisma.patient.findMany({
        where: {
          OR: [
            { firstName: { contains: w } },
            { lastName: { contains: w } },
          ]
        },
        include: {
          claims: { take: 10, orderBy: { claimDate: 'desc' } },
          hospitalizationEvents: { take: 5, orderBy: { admitDate: 'desc' } },
          pharmacyRecords: { take: 10 },
          referrals: { take: 5, orderBy: { referralDate: 'desc' } },
        },
        take: 5,
      });
      for (const p of patients) {
        const totalCost = p.claims.reduce((s, c) => s + c.amount, 0);
        const meds = p.pharmacyRecords.map(r => `${r.drugName} ($${r.totalCost.toFixed(0)})`).join(', ');
        const hospitalizations = p.hospitalizationEvents.map(h => 
          `${h.admitDate.toLocaleDateString()}: ${h.eventType}, LOS ${h.los} days, ${h.isAvoidable ? 'AVOIDABLE' : 'not avoidable'}${h.isReadmission ? ', READMISSION' : ''}`
        ).join('; ');
        const refs = p.referrals.map(r => `${r.referralDate.toLocaleDateString()}: ${r.specialty} at ${r.toFacility} (${r.status})`).join('; ');
        const claims = p.claims.map(c => `${c.claimDate.toLocaleDateString()}: ${c.claimType} $${c.amount.toFixed(0)} (${c.diagnosisCode || 'N/A'})`).join('; ');
        
        sections.push(`PATIENT: ${p.firstName} ${p.lastName} (${p.externalId}) | Gender: ${p.gender} | DOB: ${p.dob.toLocaleDateString()} | Health Plan: ${p.healthPlan} | LOB: ${p.lob} | PCP: ${p.pcpName} | Center: ${p.medicalCenter} | Risk Score: ${p.riskScore} | LACE: ${p.laceScore} | MRA: ${p.mraScore} | 30-day Risk: ${(p.predictiveRisk30*100).toFixed(0)}% | 60-day Risk: ${(p.predictiveRisk60*100).toFixed(0)}% | 90-day Risk: ${(p.predictiveRisk90*100).toFixed(0)}% | Cost Forecast 6mo: $${p.costForecast6mo} | Conditions: ${p.conditions} | Total Claims Cost: $${totalCost.toFixed(0)} | Medications: ${meds || 'None'} | Hospitalizations: ${hospitalizations || 'None'} | Referrals: ${refs || 'None'} | Recent Claims: ${claims || 'None'}`);
      }
    }
  }

  // High risk patients
  if (lower.match(/risk|critical|high.?risk|danger|alert|flag/)) {
    const highRisk = await prisma.patient.findMany({
      where: { riskScore: { gte: 80 } },
      orderBy: { riskScore: 'desc' },
      take: 15,
    });
    sections.push(`HIGH RISK PATIENTS (score 80+, showing top 15):\n${highRisk.map(p => `${p.firstName} ${p.lastName} (${p.externalId}): Risk ${p.riskScore}, LACE ${p.laceScore}, Conditions: ${p.conditions}, 30d Risk: ${(p.predictiveRisk30*100).toFixed(0)}%, Cost Forecast: $${p.costForecast6mo}`).join('\n')}`);
  }

  // Conditions / diseases
  if (lower.match(/diabet|hba1c|sugar|glucose/)) {
    const diabetics = await prisma.patient.findMany({
      where: { conditions: { contains: 'Diabetes' } },
      orderBy: { riskScore: 'desc' },
      take: 15,
    });
    sections.push(`DIABETIC PATIENTS (top 15 by risk):\n${diabetics.map(p => `${p.firstName} ${p.lastName}: Risk ${p.riskScore}, Conditions: ${p.conditions}`).join('\n')}\nTotal diabetic patients: ${diabetics.length}+`);
  }

  if (lower.match(/hypertension|blood.?pressure|htn/)) {
    const htn = await prisma.patient.findMany({
      where: { conditions: { contains: 'Hypertension' } },
      orderBy: { riskScore: 'desc' },
      take: 15,
    });
    sections.push(`HYPERTENSION PATIENTS (top 15): ${htn.length}+ patients\n${htn.map(p => `${p.firstName} ${p.lastName}: Risk ${p.riskScore}`).join('\n')}`);
  }

  if (lower.match(/ckd|kidney|renal|esrd/)) {
    const ckd = await prisma.patient.findMany({
      where: { OR: [{ conditions: { contains: 'CKD' } }, { conditions: { contains: 'Kidney' } }, { conditions: { contains: 'ESRD' } }] },
      orderBy: { riskScore: 'desc' },
      take: 15,
    });
    sections.push(`CKD/KIDNEY PATIENTS: ${ckd.length}+ patients\n${ckd.map(p => `${p.firstName} ${p.lastName}: Risk ${p.riskScore}, Conditions: ${p.conditions}`).join('\n')}`);
  }

  if (lower.match(/chf|heart.?failure|cardiac/)) {
    const chf = await prisma.patient.findMany({
      where: { OR: [{ conditions: { contains: 'CHF' } }, { conditions: { contains: 'Heart Failure' } }] },
      orderBy: { riskScore: 'desc' },
      take: 15,
    });
    sections.push(`CHF/HEART FAILURE PATIENTS: ${chf.length}+ patients\n${chf.map(p => `${p.firstName} ${p.lastName}: Risk ${p.riskScore}, Conditions: ${p.conditions}`).join('\n')}`);
  }

  if (lower.match(/copd|asthma|pulmon|lung|breath/)) {
    const resp = await prisma.patient.findMany({
      where: { OR: [{ conditions: { contains: 'COPD' } }, { conditions: { contains: 'Asthma' } }] },
      orderBy: { riskScore: 'desc' },
      take: 15,
    });
    sections.push(`COPD/ASTHMA PATIENTS: ${resp.length}+ patients\n${resp.map(p => `${p.firstName} ${p.lastName}: Risk ${p.riskScore}, Conditions: ${p.conditions}`).join('\n')}`);
  }

  // Cost queries
  if (lower.match(/cost|expensive|spend|pmpm|high.?cost|dollar|money|\$/)) {
    const expensive = await prisma.patient.findMany({
      include: { claims: true },
      take: 500,
    });
    const withCost = expensive.map(p => ({ ...p, totalCost: p.claims.reduce((s, c) => s + c.amount, 0) }))
      .sort((a, b) => b.totalCost - a.totalCost)
      .slice(0, 15);
    sections.push(`HIGHEST COST PATIENTS (top 15):\n${withCost.map(p => `${p.firstName} ${p.lastName}: Total Cost $${p.totalCost.toLocaleString()}, Risk ${p.riskScore}, Conditions: ${p.conditions}`).join('\n')}`);
  }

  // Pharmacy
  if (lower.match(/pharma|drug|medication|med|prescri|rx|eliquis|ozempic|metformin|insulin/)) {
    const topDrugs = await prisma.pharmacyRecord.groupBy({
      by: ['drugName', 'drugType'],
      _sum: { totalCost: true, rxCount: true },
      orderBy: { _sum: { totalCost: 'desc' } },
      take: 15,
    });
    sections.push(`TOP DRUGS BY COST:\n${topDrugs.map(d => `${d.drugName} (${d.drugType}): Total Cost $${(d._sum.totalCost || 0).toLocaleString()}, Rx Count: ${d._sum.rxCount || 0}`).join('\n')}`);
  }

  // Hospitalizations
  if (lower.match(/hospital|admission|admit|readmis|discharge|inpatient|er\b|emergency|lace/)) {
    const totalHosp = await prisma.hospitalizationEvent.count();
    const readmissions = await prisma.hospitalizationEvent.count({ where: { isReadmission: true } });
    const avoidable = await prisma.hospitalizationEvent.count({ where: { isAvoidable: true } });
    const avgLos = await prisma.hospitalizationEvent.aggregate({ _avg: { los: true } });
    const recentAdmissions = await prisma.hospitalizationEvent.findMany({
      include: { patient: true },
      orderBy: { admitDate: 'desc' },
      take: 10,
    });
    sections.push(`HOSPITALIZATION SUMMARY: ${totalHosp} total events, ${readmissions} readmissions (${totalHosp > 0 ? ((readmissions/totalHosp)*100).toFixed(1) : 0}%), ${avoidable} avoidable, Avg LOS: ${avgLos._avg.los?.toFixed(1)} days`);
    sections.push(`RECENT ADMISSIONS:\n${recentAdmissions.map(h => `${h.patient.firstName} ${h.patient.lastName}: ${h.admitDate.toLocaleDateString()} at ${h.facility}, LOS ${h.los}d, ${h.eventType}${h.isReadmission ? ' [READMISSION]' : ''}${h.isAvoidable ? ' [AVOIDABLE]' : ''}`).join('\n')}`);
  }

  // LACE scores
  if (lower.match(/lace/)) {
    const highLace = await prisma.patient.findMany({
      where: { laceScore: { gte: 10 } },
      orderBy: { laceScore: 'desc' },
      take: 15,
    });
    sections.push(`HIGHEST LACE SCORES (10+):\n${highLace.map(p => `${p.firstName} ${p.lastName}: LACE ${p.laceScore}, Risk ${p.riskScore}, 30d Risk: ${(p.predictiveRisk30*100).toFixed(0)}%`).join('\n')}`);
  }

  // Referrals
  if (lower.match(/referral|refer|specialty|specialist/)) {
    const totalRefs = await prisma.referral.count();
    const pending = await prisma.referral.count({ where: { status: 'Pending' } });
    const bySpecialty = await prisma.referral.groupBy({
      by: ['specialty'],
      _count: true,
      orderBy: { _count: { specialty: 'desc' } },
      take: 10,
    });
    sections.push(`REFERRAL SUMMARY: ${totalRefs} total, ${pending} pending\nBy Specialty: ${bySpecialty.map(s => `${s.specialty}: ${s._count}`).join(', ')}`);
  }

  // Predictive
  if (lower.match(/predict|forecast|future|project|likely|probab/)) {
    const highRisk30 = await prisma.patient.findMany({
      where: { predictiveRisk30: { gte: 0.5 } },
      orderBy: { predictiveRisk30: 'desc' },
      take: 15,
    });
    sections.push(`PATIENTS MOST LIKELY HOSPITALIZED IN 30 DAYS (50%+ risk):\n${highRisk30.map(p => `${p.firstName} ${p.lastName}: 30d Risk ${(p.predictiveRisk30*100).toFixed(0)}%, 90d Risk ${(p.predictiveRisk90*100).toFixed(0)}%, LACE ${p.laceScore}, Conditions: ${p.conditions}`).join('\n')}`);
  }

  // Unengaged - patients with no recent claims as proxy
  if (lower.match(/unengag|no.?show|haven.?t.?seen|missing|not.?seen|pcp.?visit/)) {
    const sixMonthsAgo = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
    const unengaged = await prisma.patient.findMany({
      where: {
        claims: { none: { claimDate: { gte: sixMonthsAgo } } }
      },
      orderBy: { riskScore: 'desc' },
      take: 15,
    });
    sections.push(`UNENGAGED PATIENTS (no claims in 6+ months, top 15 by risk):\n${unengaged.map(p => `${p.firstName} ${p.lastName}: Risk ${p.riskScore}, Conditions: ${p.conditions}`).join('\n')}`);
  }

  // Membership / health plan
  if (lower.match(/member|enrollment|health.?plan|payer|sunshine|simply|humana|wellcare|medicaid|medicare/)) {
    const byPlan = await prisma.patient.groupBy({
      by: ['healthPlan'],
      _count: true,
      orderBy: { _count: { healthPlan: 'desc' } },
    });
    const byLob = await prisma.patient.groupBy({
      by: ['lob'],
      _count: true,
    });
    sections.push(`MEMBERSHIP BY HEALTH PLAN:\n${byPlan.map(p => `${p.healthPlan}: ${p._count}`).join('\n')}\n\nBY LINE OF BUSINESS:\n${byLob.map(l => `${l.lob}: ${l._count}`).join('\n')}`);
  }

  return sections.join('\n\n---\n\n');
}

export async function processChat(message: string, history: { role: string; content: string }[] = []): Promise<ChatResponse> {
  try {
    // Gather relevant DB context
    const dbContext = await gatherContext(message);

    // Build conversation for Claude
    const systemPrompt = `You are KOSIQ AI Assistant, a clinical intelligence assistant for a Medicare Advantage managed care practice in South Florida. You help care managers, CMOs, and practice administrators query patient data and make clinical/financial decisions.

CURRENT DATABASE CONTEXT:
${dbContext}

INSTRUCTIONS:
- Answer questions using ONLY the data provided above. Do not make up patient names or numbers.
- Be concise but thorough. Use bullet points and bold formatting (**text**) for readability.
- ALWAYS refer to patients by their FULL NAME and Patient ID in parentheses. Example: **Aaron Johnson (MRN-0042)**. NEVER use first name only. With thousands of patients, precision is critical.
- When suggesting next steps, always include the full patient name and ID. Example: "Immediate outreach for **Aaron Johnson (MRN-0042)** — schedule follow-up within 48 hours."
- Include specific numbers, risk scores, and costs when relevant.
- When discussing risk: Critical (80+), High (60-79), Medium (40-59), Low (<40).
- Suggest actionable next steps when appropriate (outreach, care management enrollment, coding review, etc.).
- If asked about something not in the data, say so honestly and suggest what they can ask about.
- Format currency with $ and commas. Format percentages with %.
- Keep responses focused and clinical. This is a healthcare analytics tool.
- Do NOT use emojis.`;

    const messages: { role: 'user' | 'assistant'; content: string }[] = [];
    
    // Include recent history for context (last 6 messages)
    const recentHistory = history.slice(-6);
    for (const h of recentHistory) {
      messages.push({ role: h.role === 'user' ? 'user' : 'assistant', content: h.content });
    }
    messages.push({ role: 'user', content: message });

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: systemPrompt,
      messages,
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : 'Unable to generate response.';
    return { response: text };
  } catch (error) {
    console.error('Chat AI error:', error);
    return { response: 'Sorry, I encountered an error processing your request. Please try again.' };
  }
}
