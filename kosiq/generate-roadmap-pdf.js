const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: [1920, 1080], margin: 0 });
doc.pipe(fs.createWriteStream('KOSIQ-Roadmap-2026.pdf'));

const W = 1920, H = 1080;
const BLUE = '#26acf7', DARK = '#0a0a0f', DARK2 = '#111118';
const TEXT = '#1d1d1f', GRAY = '#86868b', DIVIDER = '#e5e5e5';
const GREEN = '#10b981', AMBER = '#f59e0b', PURPLE = '#8b5cf6';
const LM = 120;

function footer(num) {
  doc.font('Helvetica').fontSize(14).fillColor(GRAY);
  doc.text(`KOSIQ  ·  Confidential  ·  ${num}`, 0, H - 40, { width: W, align: 'center' });
}

function hairline(y, x1 = LM, x2 = W - LM) {
  doc.save().strokeColor(DIVIDER).lineWidth(0.5).moveTo(x1, y).lineTo(x2, y).stroke().restore();
}

function sectionBar(y) {
  doc.rect(LM, y, W - LM * 2, 4).fill(BLUE);
}

function drawGridLines(x, y, w, h, count) {
  doc.save().strokeColor('#e5e5e5').lineWidth(0.5);
  for (let i = 0; i <= count; i++) {
    const ly = y + (h / count) * i;
    doc.moveTo(x, ly).lineTo(x + w, ly).stroke();
  }
  doc.restore();
}

// ============ PAGE 1: TITLE ============
doc.rect(0, 0, W, H).fill(DARK);
const grad = doc.linearGradient(0, H * 0.6, W, H * 0.6);
grad.stop(0, DARK).stop(0.5, '#0d1a2a').stop(1, DARK);
doc.rect(0, H * 0.5, W, H * 0.3).fill(grad);

doc.rect(W / 2 - 80, 360, 160, 2).fill(BLUE);

// KOSIQ logo - KOS white, IQ blue (dark bg)
doc.font('Helvetica-Bold').fontSize(96);
const kosW = doc.widthOfString('KOS');
const iqW = doc.widthOfString('IQ');
const logoX = (W - kosW - iqW) / 2;
doc.fillColor('#ffffff').text('KOS', logoX, 420, { continued: true });
doc.fillColor(BLUE).text('IQ');

doc.font('Helvetica').fontSize(32).fillColor('#cccccc');
doc.text('Product & Go-to-Market Roadmap', 0, 540, { width: W, align: 'center' });

doc.font('Helvetica').fontSize(24).fillColor(GRAY);
doc.text('From Funded to Revenue in 18 Months', 0, 600, { width: W, align: 'center' });

doc.font('Helvetica').fontSize(18).fillColor(GRAY);
doc.text('2026', 0, H - 80, { width: W, align: 'center' });
footer(1);

// ============ PAGE 2: TIMELINE ============
doc.addPage();
doc.rect(0, 0, W, H).fill('#ffffff');

doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE);
doc.text('ROADMAP', LM, 80);
hairline(110);

doc.font('Helvetica-Bold').fontSize(48).fillColor(TEXT);
doc.text('18-Month Timeline', LM, 140);

const phases = [
  { name: 'Foundation', mo: '1–3', color: BLUE, deliverables: ['HIPAA/SOC 2 controls implementation', 'Backend engineer hire — EHR integration specialist', 'FHIR/HL7 data pipeline for eCW and Epic', 'AWS Bedrock environment with BAA', 'Security pen testing and compliance audit'] },
  { name: 'Launch', mo: '4–8', color: GREEN, deliverables: ['First pilot customer live on real claims data', 'Sales Rep #1 — South Florida managed care networks', 'Iterate product based on clinical feedback', '5 paying clients generating $3.7–9.4K/mo', 'QA engineer (3-month contract) for compliance'] },
  { name: 'Scale', mo: '9–14', color: AMBER, deliverables: ['SOC 2 Type I certification complete', '3 EHR integrations live (eCW, Epic, athenahealth)', 'Frontend engineer + CSM + Sales Rep #2', '12 customers, $12.5–15K/mo revenue', 'Conference presence: HIMSS, AHIP'] },
  { name: 'Expand', mo: '15–18', color: PURPLE, deliverables: ['25 paying customers across multiple states', '$145K/mo revenue ($1.74M ARR)', 'SOC 2 Type II + HIPAA certification', 'National enterprise sales pipeline built', 'Series A preparation at $150–200M target'] }
];

// Timeline line
const tlY = 280;
const tlStart = LM + 60;
const tlEnd = W - LM - 60;
doc.save().strokeColor(DIVIDER).lineWidth(2).moveTo(tlStart, tlY).lineTo(tlEnd, tlY).stroke().restore();

const phaseW = (tlEnd - tlStart) / 4;
const colPad = 20; // padding between columns
phases.forEach((p, i) => {
  const cx = tlStart + phaseW * i + phaseW / 2;
  const colX = tlStart + phaseW * i + colPad;
  const colWidth = phaseW - colPad * 2;
  
  doc.circle(cx, tlY, 10).fill(p.color);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(p.color);
  doc.text(p.name, colX, tlY - 50, { width: colWidth, align: 'center' });
  doc.font('Helvetica').fontSize(16).fillColor(GRAY);
  doc.text(`Mo ${p.mo}`, colX, tlY + 20, { width: colWidth, align: 'center' });

  let dy = tlY + 60;
  p.deliverables.forEach(d => {
    doc.font('Helvetica').fontSize(15).fillColor(TEXT);
    doc.text('•  ' + d, colX, dy, { width: colWidth });
    const lines = Math.ceil(doc.widthOfString(d) / (colWidth - 20));
    dy += Math.max(lines, 1) * 18 + 10;
  });
});

footer(2);

// ============ PAGE 3: HIRES & COSTS ============
doc.addPage();
doc.rect(0, 0, W, H).fill('#ffffff');

doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE);
doc.text('HIRES & COSTS', LM, 80);
hairline(110);

doc.font('Helvetica-Bold').fontSize(48).fillColor(TEXT);
doc.text('Building the Team', LM, 140);

const hires = [
  { role: 'David Suarez — CTO', salary: '$180K/yr ($270K/18mo)', desc: 'Co-founder. Leads all engineering, AI/ML architecture, and product development. Built the entire KOSIQ platform from data pipelines to predictive analytics.', when: 'Day 1', color: BLUE },
  { role: 'Backend Engineer', salary: '$120–150K/yr', desc: 'EHR integration specialist. Builds and maintains FHIR/HL7 data pipelines, real-time claims ingestion, and API infrastructure. Critical hire for connecting to eCW, Epic, and athenahealth.', when: 'Month 1', color: BLUE },
  { role: 'Sales Rep #1', salary: '$100–150K + commission', desc: 'First revenue hire with healthcare SaaS sales experience. Targets South Florida managed care networks, builds pilot relationships, and establishes the enterprise sales playbook.', when: 'Month 4', color: GREEN },
  { role: 'QA Engineer (contract)', salary: '$40–60K (3-month contract)', desc: 'Security testing, compliance validation, and SOC 2 Type I audit preparation. Ensures platform meets HIPAA technical safeguards before first client goes live on production data.', when: 'Month 6', color: GREEN },
  { role: 'Frontend Engineer', salary: '$100–130K/yr', desc: 'Owns the customer-facing experience — dashboards, analytics visualizations, reporting interfaces, and workflow tools. Ensures the platform is intuitive for non-technical clinical staff.', when: 'Month 9', color: AMBER },
  { role: 'Sales Rep #2', salary: '$100–150K + commission', desc: 'Scales the sales motion nationally. Focuses on larger managed care groups (20K–60K+ members) and payer partnerships while Rep #1 manages existing accounts and regional pipeline.', when: 'Month 9', color: AMBER },
  { role: 'Customer Success Manager', salary: '$80–100K/yr', desc: 'Owns onboarding, training, retention, and expansion revenue. Ensures customers achieve measurable outcomes — reduced PMPM, improved Star Ratings, and higher quality bonuses.', when: 'Month 9', color: AMBER },
];

let hy = 230;
hires.forEach(h => {
  doc.font('Helvetica-Bold').fontSize(24).fillColor(TEXT).text(h.role, LM, hy, { width: 600 });
  doc.font('Helvetica-Bold').fontSize(20).fillColor(BLUE).text(h.salary, LM + 650, hy);
  doc.font('Helvetica').fontSize(18).fillColor(GRAY).text(h.desc, LM, hy + 32, { width: 900 });
  doc.font('Helvetica').fontSize(16).fillColor(h.color).text(h.when, W - LM - 150, hy + 6, { width: 150, align: 'right' });
  hy += 80;
  if (hy < H - 100) hairline(hy - 10);
});

footer(3);

// ============ PAGE 4: BUDGET with PIE CHART ============
doc.addPage();
doc.rect(0, 0, W, H).fill('#ffffff');

doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE);
doc.text('BUDGET', LM, 80);
hairline(110);

doc.font('Helvetica-Bold').fontSize(48).fillColor(TEXT);
doc.text('18-Month Budget', LM, 140);

// Left: budget categories (compact)
const categories = [
  ['PEOPLE', [
    ['David Suarez (CTO)', '$270K'],
    ['Backend Engineer', '$180–225K'],
    ['Frontend Engineer (Mo 9+)', '$75–100K'],
    ['QA Engineer (contract)', '$40–60K'],
    ['Sales Rep ×2', '$200–300K + commission'],
    ['Customer Success Mgr (Mo 9+)', '$60–75K'],
  ]],
  ['INFRASTRUCTURE', [
    ['Cloud (AWS/GCP)', '$54–90K'],
    ['Security & Compliance', '$25–40K'],
    ['Dev Tools & Licenses', '$18–27K'],
  ]],
  ['GO-TO-MARKET', [
    ['Marketing & Content', '$36–54K'],
    ['Conferences & Events', '$22–38K'],
    ['Legal & Professional', '$20–30K'],
  ]]
];

let by = 220;
categories.forEach(([cat, items]) => {
  doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE).text(cat, LM, by);
  by += 30;
  items.forEach(([name, cost]) => {
    doc.font('Helvetica').fontSize(18).fillColor(TEXT).text(name, LM + 30, by, { width: 420 });
    doc.font('Helvetica').fontSize(18).fillColor(GRAY).text(cost, LM + 460, by, { width: 220, align: 'right' });
    by += 30;
  });
  by += 14;
});

hairline(by + 5);
by += 25;
doc.font('Helvetica').fontSize(18).fillColor(GRAY).text('18-MONTH TOTAL', LM, by);
doc.font('Helvetica-Bold').fontSize(56).fillColor(TEXT);
doc.text('$1.36 – $1.90M', LM, by + 24);

// RIGHT: Budget Allocation Donut Chart
{
  const cx = 1350, cy = 480, outerR = 220, innerR = 120;
  sectionBar(220);
  doc.font('Helvetica-Bold').fontSize(24).fillColor(TEXT);
  doc.text('Budget Allocation', 1100, 230, { width: 500, align: 'center' });

  const slices = [
    { label: 'People', pct: 0.70, color: BLUE },
    { label: 'GTM', pct: 0.15, color: GREEN },
    { label: 'Infrastructure', pct: 0.10, color: AMBER },
    { label: 'Legal', pct: 0.05, color: PURPLE },
  ];

  // Draw donut using small arc segments
  let startAngle = -Math.PI / 2;
  slices.forEach(s => {
    const endAngle = startAngle + s.pct * Math.PI * 2;
    const steps = Math.max(Math.ceil(s.pct * 60), 8);
    const angleStep = (endAngle - startAngle) / steps;

    // Outer arc path
    doc.save();
    doc.moveTo(cx, cy);
    for (let i = 0; i <= steps; i++) {
      const a = startAngle + angleStep * i;
      doc.lineTo(cx + Math.cos(a) * outerR, cy + Math.sin(a) * outerR);
    }
    doc.closePath().fill(s.color);
    doc.restore();

    // Label position (midpoint of arc)
    const midAngle = startAngle + (endAngle - startAngle) / 2;
    const labelR = outerR + 40;
    const lx = cx + Math.cos(midAngle) * labelR;
    const ly2 = cy + Math.sin(midAngle) * labelR;
    doc.font('Helvetica-Bold').fontSize(18).fillColor(s.color);
    doc.text(`${s.label} ${Math.round(s.pct * 100)}%`, lx - 60, ly2 - 10, { width: 120, align: 'center' });

    startAngle = endAngle;
  });

  // Inner circle (donut hole)
  doc.circle(cx, cy, innerR).fill('#ffffff');
  // Center label
  doc.font('Helvetica-Bold').fontSize(24).fillColor(TEXT);
  doc.text('~$1.6M', cx - 50, cy - 15, { width: 100, align: 'center' });
}

footer(4);

// ============ PAGE 5: REVENUE with BAR CHART ============
doc.addPage();
doc.rect(0, 0, W, H).fill('#ffffff');

doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE);
doc.text('REVENUE', LM, 80);
hairline(110);

doc.font('Helvetica-Bold').fontSize(44).fillColor(TEXT);
doc.text('Revenue Milestones', LM, 130);

// HERO: Large stepped bar chart
{
  const gX = LM + 80, gY = 220, gW = W - LM * 2 - 120, gH = 480;
  sectionBar(gY - 10);

  const revData = [
    { mo: 'Mo 4', val: 2, display: '$0–2K', color: '#7dd3fc' },
    { mo: 'Mo 8', val: 9.4, display: '$3.7–9.4K', color: '#38bdf8' },
    { mo: 'Mo 12', val: 15, display: '$12.5–15K', color: '#26acf7' },
    { mo: 'Mo 15', val: 25, display: '$22.5–25K', color: '#0ea5e9' },
    { mo: 'Mo 18', val: 145, display: '$145K', color: '#0284c7' },
  ];
  const maxVal = 160;

  // Grid
  drawGridLines(gX, gY, gW, gH, 8);

  // Y-axis
  for (let i = 0; i <= 8; i++) {
    const val = Math.round((maxVal / 8) * (8 - i));
    doc.font('Helvetica').fontSize(14).fillColor(GRAY);
    doc.text(`$${val}K`, gX - 65, gY + (gH / 8) * i - 8, { width: 55, align: 'right' });
  }

  // Bars
  const barW = gW / revData.length - 40;
  const gap = 40;
  revData.forEach((d, i) => {
    const x = gX + i * (barW + gap) + gap / 2;
    const barH = (d.val / maxVal) * gH;
    const y = gY + gH - barH;

    // Shadow/glow
    doc.save().opacity(0.15);
    doc.rect(x - 3, y - 3, barW + 6, barH + 3).fill(d.color);
    doc.restore();

    // Bar
    doc.rect(x, y, barW, barH).fill(d.color);

    // Value label
    const labelY = barH > 60 ? y + 15 : y - 30;
    const labelColor = barH > 60 ? '#ffffff' : TEXT;
    doc.font('Helvetica-Bold').fontSize(22).fillColor(labelColor);
    doc.text(d.display, x, labelY, { width: barW, align: 'center' });

    // Month label
    doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT);
    doc.text(d.mo, x, gY + gH + 15, { width: barW, align: 'center' });
  });
}

// Hero ARR callout
doc.font('Helvetica').fontSize(18).fillColor(GRAY).text('MONTH 18 ANNUAL RUN RATE', LM, H - 170, { width: W - LM * 2 });
doc.font('Helvetica-Bold').fontSize(64).fillColor(BLUE);
doc.text('$1.74M ARR', LM, H - 145);
doc.font('Helvetica').fontSize(17).fillColor(GRAY);
doc.text('Revenue driven by 25 customers across PMPM subscriptions ($0.50–$2.24/member/month) and integration services ($10K–$20K/month). 98%+ gross margins. Projections are intentionally conservative.', W / 2 + 40, H - 155, { width: W / 2 - LM - 60 });

footer(5);

// ============ PAGE 6: CASH RUNWAY with AREA CHART ============
doc.addPage();
doc.rect(0, 0, W, H).fill('#ffffff');

doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE);
doc.text('CASH RUNWAY', LM, 80);
hairline(110);

doc.font('Helvetica-Bold').fontSize(44).fillColor(TEXT);
doc.text('Path to Cash-Flow Positive', LM, 130);

// Large area chart: cash position declining, revenue rising
{
  const gX = LM + 80, gY = 220, gW = W - LM * 2 - 120, gH = 480;
  sectionBar(gY - 10);

  const months = 18;
  const maxCash = 2800; // $2.8M scale

  // Cash position (declining from $2.5M seed, ~$80-100K/mo burn early, improving later)
  const cashPos = [2500, 2400, 2300, 2180, 2060, 1930, 1790, 1640, 1500, 1370, 1250, 1140, 1050, 970, 910, 870, 860, 880];
  // Cumulative revenue
  const cumRev = [0, 0, 0, 2, 5, 10, 16, 25, 35, 47, 60, 75, 93, 113, 138, 178, 258, 403];

  // Grid
  drawGridLines(gX, gY, gW, gH, 7);

  // Y-axis
  for (let i = 0; i <= 7; i++) {
    const val = ((maxCash / 7) * (7 - i) / 1000).toFixed(1);
    doc.font('Helvetica').fontSize(14).fillColor(GRAY);
    doc.text(`$${val}M`, gX - 65, gY + (gH / 7) * i - 8, { width: 55, align: 'right' });
  }

  // X-axis
  for (let i = 0; i < months; i += 3) {
    const px = gX + (gW / (months - 1)) * i;
    doc.font('Helvetica').fontSize(14).fillColor(GRAY);
    doc.text(`Mo ${i + 1}`, px - 20, gY + gH + 12, { width: 50, align: 'center' });
  }
  // Mo 18
  {
    const px = gX + gW;
    doc.font('Helvetica').fontSize(14).fillColor(GRAY);
    doc.text('Mo 18', px - 25, gY + gH + 12, { width: 50, align: 'center' });
  }

  // Cash position area (blue, declining)
  doc.save().opacity(0.15);
  doc.moveTo(gX, gY + gH);
  cashPos.forEach((val, i) => {
    const px = gX + (gW / (months - 1)) * i;
    const py = gY + gH - (val / maxCash) * gH;
    doc.lineTo(px, py);
  });
  doc.lineTo(gX + gW, gY + gH).closePath().fill(BLUE);
  doc.restore();

  // Cash line
  doc.save().strokeColor(BLUE).lineWidth(3);
  cashPos.forEach((val, i) => {
    const px = gX + (gW / (months - 1)) * i;
    const py = gY + gH - (val / maxCash) * gH;
    if (i === 0) doc.moveTo(px, py); else doc.lineTo(px, py);
  });
  doc.stroke().restore();

  // Revenue area (green, rising)
  doc.save().opacity(0.15);
  doc.moveTo(gX, gY + gH);
  cumRev.forEach((val, i) => {
    const px = gX + (gW / (months - 1)) * i;
    const py = gY + gH - (val / maxCash) * gH;
    doc.lineTo(px, py);
  });
  doc.lineTo(gX + gW, gY + gH).closePath().fill(GREEN);
  doc.restore();

  // Revenue line
  doc.save().strokeColor(GREEN).lineWidth(3);
  cumRev.forEach((val, i) => {
    const px = gX + (gW / (months - 1)) * i;
    const py = gY + gH - (val / maxCash) * gH;
    if (i === 0) doc.moveTo(px, py); else doc.lineTo(px, py);
  });
  doc.stroke().restore();

  // Legend
  doc.rect(gX + gW - 350, gY + 15, 16, 16).fill(BLUE);
  doc.font('Helvetica').fontSize(16).fillColor(TEXT).text('Cash Position', gX + gW - 328, gY + 15);
  doc.rect(gX + gW - 180, gY + 15, 16, 16).fill(GREEN);
  doc.font('Helvetica').fontSize(16).fillColor(TEXT).text('Cumulative Revenue', gX + gW - 158, gY + 15);

  // Callout: seed amount
  doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE);
  const seedPy = gY + gH - (2500 / maxCash) * gH;
  doc.text('$2.5M Seed', gX + 10, seedPy - 28);

  // Callout: ending cash
  const endCashPy = gY + gH - (880 / maxCash) * gH;
  doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE);
  doc.text('$880K remaining', gX + gW - 180, endCashPy - 28);
}

// Bottom text
doc.font('Helvetica-Bold').fontSize(22).fillColor(TEXT);
doc.text('18+ months of runway on $2.5M seed', LM, H - 150, { width: W - LM * 2 });
doc.font('Helvetica').fontSize(18).fillColor(GRAY);
doc.text('Conservative burn assumptions with revenue accelerating through months 12–18. Cash position stabilizes as customer revenue offsets operating costs. Series A pursued from a position of strength — with proven product-market fit, paying customers, and a clear path to profitability — not desperation.', LM, H - 120, { width: W - LM * 2 });

footer(6);

// ============ PAGE 7: TEAM AT 18 ============
doc.addPage();
doc.rect(0, 0, W, H).fill('#ffffff');

doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE);
doc.text('MONTH 18', LM, 80);
hairline(110);

doc.font('Helvetica-Bold').fontSize(48).fillColor(TEXT);
doc.text('Ready for Series A', LM, 140);

// Hero metrics
const heroMetrics = [
  ['25', 'Customers', BLUE],
  ['$1.74M', 'ARR', GREEN],
  ['3', 'EHR Integrations', AMBER],
  ['7–8', 'Team Members', PURPLE]
];

const mW = (W - LM * 2) / 4;
heroMetrics.forEach(([val, label, color], i) => {
  const x = LM + mW * i;
  doc.font('Helvetica-Bold').fontSize(72).fillColor(color);
  doc.text(val, x, 240, { width: mW });
  doc.font('Helvetica').fontSize(20).fillColor(GRAY);
  doc.text(label, x, 320, { width: mW });
});

hairline(380);

// Team roster
doc.font('Helvetica-Bold').fontSize(24).fillColor(TEXT);
doc.text('Full Team', LM, 410);

const roster = [
  ['David Suarez', 'CTO / Co-Founder — Engineering, AI/ML, product strategy'],
  ['Dr. JD Suarez', 'CMO / Co-Founder — Clinical strategy, payer relationships, medical economics'],
  ['Backend Engineer', 'EHR integrations, data pipelines, API infrastructure'],
  ['Frontend Engineer', 'Dashboards, analytics UI, customer experience'],
  ['Sales Rep ×2', 'Enterprise sales, pipeline development, payer partnerships'],
  ['Customer Success Manager', 'Onboarding, retention, expansion revenue, client outcomes']
];

let ty = 450;
roster.forEach(([name, desc]) => {
  doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text('—  ' + name, LM, ty, { width: 500 });
  doc.font('Helvetica').fontSize(17).fillColor(GRAY).text(desc, LM + 520, ty, { width: W - LM - 520 - LM });
  ty += 40;
});

hairline(ty + 10);
ty += 40;

doc.font('Helvetica').fontSize(20).fillColor(GRAY).text('SERIES A TARGET VALUATION', LM, ty);
doc.font('Helvetica-Bold').fontSize(48).fillColor(BLUE);
doc.text('$150–200M', LM, ty + 30);

doc.font('Helvetica').fontSize(18).fillColor(GRAY);
doc.text('25 customers  ·  $1.74M ARR  ·  3 EHR integrations  ·  SOC 2 + HIPAA certified', LM, ty + 90);

footer(7);

doc.end();
console.log('✅ KOSIQ-Roadmap-2026.pdf generated');
