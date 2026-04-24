const PDFDocument = require('pdfkit');
const fs = require('fs');
const doc = new PDFDocument({ bufferPages: true, size: 'letter', margins: { top: 50, bottom: 50, left: 55, right: 55 } });
doc.pipe(fs.createWriteStream('KOSIQ-Cost-Analysis-2026.pdf'));

const W = 612, LM = 55, CW = W - 110;
const BLUE = '#26acf7', TEXT = '#1d1d1f', GRAY = '#6e6e73', GREEN = '#059669', RED = '#dc2626';

function heading(t) { doc.moveDown(0.5); doc.font('Helvetica-Bold').fontSize(22).fillColor(BLUE).text(t, LM); doc.moveDown(0.3); }
function subhead(t) { doc.font('Helvetica-Bold').fontSize(16).fillColor(TEXT).text(t, LM); doc.moveDown(0.2); }
function body(t) { doc.font('Helvetica').fontSize(14).fillColor(TEXT).text(t, LM, undefined, { width: CW }); }
function bodyGray(t) { doc.font('Helvetica').fontSize(14).fillColor(GRAY).text(t, LM, undefined, { width: CW }); }
function spacer() { doc.moveDown(0.4); }
function line() { doc.moveDown(0.3); doc.rect(LM, doc.y, CW, 1).fill('#e0e0e0'); doc.moveDown(0.4); }

function table(headers, rows, opts = {}) {
  const colW = opts.colWidths || headers.map(() => CW / headers.length);
  const startX = LM;
  let y = doc.y;
  
  // Header
  doc.font('Helvetica-Bold').fontSize(12).fillColor(GRAY);
  headers.forEach((h, i) => {
    let x = startX;
    for (let j = 0; j < i; j++) x += colW[j];
    doc.text(h, x, y, { width: colW[i], align: i === 0 ? 'left' : 'right' });
  });
  y += 18;
  doc.rect(startX, y, CW, 0.5).fill('#d0d0d0');
  y += 6;
  
  // Rows
  rows.forEach(row => {
    if (y > 700) { doc.addPage(); y = 50; }
    const isBold = row._bold;
    const color = row._color || TEXT;
    doc.font(isBold ? 'Helvetica-Bold' : 'Helvetica').fontSize(14).fillColor(color);
    row.cells.forEach((cell, i) => {
      let x = startX;
      for (let j = 0; j < i; j++) x += colW[j];
      doc.text(cell, x, y, { width: colW[i], align: i === 0 ? 'left' : 'right' });
    });
    y += 20;
  });
  doc.y = y + 4;
}

// ═══════════════════════════════════════
// PAGE 1: TITLE + PER PROVIDER COST
// ═══════════════════════════════════════
doc.font('Helvetica-Bold').fontSize(28).fillColor(TEXT).text('KOSIQ', LM, 50);
doc.font('Helvetica-Bold').fontSize(28).fillColor(BLUE).text('Cost Analysis & Investment Model', LM);
doc.moveDown(0.3);
doc.font('Helvetica').fontSize(14).fillColor(GRAY).text('Confidential — April 2026', LM);
doc.moveDown(0.5);
doc.rect(LM, doc.y, CW, 2).fill(BLUE);
doc.moveDown(1);

heading('What One Provider Costs Us');
bodyGray('Infrastructure + AI + support costs per provider served');
spacer();

table(
  ['Cost Component', 'Per Provider/Mo', 'Notes'],
  [
    { cells: ['Cloud hosting (AWS HIPAA)', '$8.00', 'Compute, DB, storage, CDN'] },
    { cells: ['AI processing (Claude/Bedrock)', '$12.00', '~15 AI calls/provider/month'] },
    { cells: ['Data pipeline / ETL', '$3.00', 'Claims, labs, ADT feeds'] },
    { cells: ['HIPAA security infrastructure', '$2.00', 'Encryption, audit logs, WAF'] },
    { cells: ['Third-party services', '$4.00', 'Auth0, email, monitoring'] },
    { cells: ['Customer support (pro-rated)', '$6.00', 'Tickets, onboarding, docs'] },
    { cells: ['Total Cost Per Provider', '$35/month', ''], _bold: true, _color: BLUE },
  ],
  { colWidths: [220, 110, 172] }
);

spacer();
heading('Margin Analysis at Our Pricing');

table(
  ['Tier', 'Price', 'Our Cost', 'Gross Profit', 'Margin'],
  [
    { cells: ['Essentials', '$400/mo', '$35/mo', '$365/mo', '91%'] },
    { cells: ['Professional', '$500/mo', '$35/mo', '$465/mo', '93%'] },
    { cells: ['Enterprise', '$600/mo', '$35/mo', '$565/mo', '94%'] },
  ],
  { colWidths: [110, 90, 90, 100, 112] }
);

spacer();
bodyGray('Per-provider costs are low because it is software. The expensive part is the team that builds and sells it, not serving each additional user.');

// ═══════════════════════════════════════
// PAGE 2: TEAM COSTS
// ═══════════════════════════════════════
doc.addPage();
heading('Full Team — Engineering');

table(
  ['Role', 'Annual Salary', 'Start', 'Monthly'],
  [
    { cells: ['David Suarez — CPO', '$180,000', 'Day 1', '$15,000'] },
    { cells: ['VP of Engineering', '$200,000', 'Day 1', '$16,667'] },
    { cells: ['Senior Backend Engineer', '$170,000', 'Day 1', '$14,167'] },
    { cells: ['Full-Stack Engineer', '$150,000', 'Day 1', '$12,500'] },
    { cells: ['AI/ML Engineer', '$160,000', 'Month 3', '$13,333'] },
    { cells: ['DevOps / Security Engineer', '$140,000', 'Month 6', '$11,667'] },
    { cells: ['Engineering Total (loaded +20%)', '$1,200,000/yr', '', '$100,000'], _bold: true, _color: BLUE },
  ],
  { colWidths: [200, 120, 80, 102] }
);

spacer();
subhead('Sales Team');

table(
  ['Role', 'Annual', 'Start', 'Monthly'],
  [
    { cells: ['VP Sales — Healthcare', '$180,000 + comm', 'Day 1', '$15,000+'] },
    { cells: ['Account Executive', '$110,000', 'Month 6', '$9,167'] },
    { cells: ['SDR / Lead Gen', '$55,000', 'Month 3', '$4,583'] },
    { cells: ['Sales Total (loaded)', '', '', '$34,500'], _bold: true, _color: BLUE },
  ],
  { colWidths: [200, 120, 80, 102] }
);

spacer();
subhead('Clinical & Admin');

table(
  ['Role', 'Annual', 'Start', 'Monthly'],
  [
    { cells: ['Dr. JD Suarez — CMO', 'Equity only', 'Day 1', '$0'] },
    { cells: ['HIPAA Compliance Officer', '$48,000', 'Day 1', '$4,000'] },
    { cells: ['Customer Success Manager', '$70,000', 'Month 6', '$5,833'] },
    { cells: ['Subtotal', '', '', '$9,833'], _bold: true, _color: BLUE },
  ],
  { colWidths: [200, 120, 80, 102] }
);

// ═══════════════════════════════════════
// PAGE 3: INFRASTRUCTURE + COMPLIANCE
// ═══════════════════════════════════════
doc.addPage();
heading('Infrastructure Costs');

table(
  ['Item', 'Monthly', 'Notes'],
  [
    { cells: ['AWS (HIPAA/BAA environment)', '$5,000', 'Scales — this covers ~200 providers'] },
    { cells: ['AI APIs (Bedrock/Claude)', '$4,000', 'Scales with usage, BAA-covered'] },
    { cells: ['Third-party SaaS', '$1,500', 'Auth0, Sentry, Klaviyo, Stripe'] },
    { cells: ['Monitoring & security tools', '$800', 'Datadog, CloudWatch, pen testing'] },
    { cells: ['Infrastructure Total', '$11,300/mo', ''], _bold: true, _color: BLUE },
  ],
  { colWidths: [220, 110, 172] }
);

spacer();
subhead('Compliance & Legal');

table(
  ['Item', 'Cost', 'Type'],
  [
    { cells: ['SOC2 Type II audit', '$50,000', 'One-time + $15K annual renewal'] },
    { cells: ['HITRUST certification', '$65,000', 'One-time (for enterprise clients)'] },
    { cells: ['Legal counsel', '$4,000/mo', 'Ongoing — BAAs, MSAs, contracts'] },
    { cells: ['D&O / E&O Insurance', '$1,500/mo', 'Required for enterprise + investors'] },
    { cells: ['Year 1 Compliance Total', '~$185,000', ''], _bold: true, _color: BLUE },
  ],
  { colWidths: [220, 120, 162] }
);

spacer();
subhead('Marketing & Sales Operations');

table(
  ['Item', 'Monthly'],
  [
    { cells: ['Conferences (HIMSS, AHIP)', '$3,000 (amortized)'] },
    { cells: ['Content / LinkedIn / SEO', '$2,000'] },
    { cells: ['Sales tools (CRM, outreach)', '$500'] },
    { cells: ['Travel to client sites', '$2,000'] },
    { cells: ['Marketing Total', '$7,500/mo'], _bold: true, _color: BLUE },
  ],
  { colWidths: [260, 242] }
);

// ═══════════════════════════════════════
// PAGE 4: TOTAL BURN + INVESTMENT
// ═══════════════════════════════════════
doc.addPage();
heading('Total Monthly Burn');

subhead('Months 1-6 (Smaller Team)');
table(
  ['Category', 'Monthly'],
  [
    { cells: ['Engineering (4 people + CPO)', '$75,000'] },
    { cells: ['Sales (VP + SDR)', '$22,000'] },
    { cells: ['Clinical / Admin', '$4,000'] },
    { cells: ['Infrastructure', '$8,000'] },
    { cells: ['Legal / Compliance', '$6,000'] },
    { cells: ['Marketing', '$5,000'] },
    { cells: ['Office / Misc', '$2,000'] },
    { cells: ['Monthly Burn (M1-6)', '$122,000'], _bold: true, _color: RED },
  ],
  { colWidths: [300, 202] }
);

spacer();
subhead('Months 7-24 (Full Team)');
table(
  ['Category', 'Monthly'],
  [
    { cells: ['Engineering (6 people + CPO)', '$100,000'] },
    { cells: ['Sales (VP + AE + SDR)', '$34,500'] },
    { cells: ['Clinical / Admin (+ CSM)', '$10,000'] },
    { cells: ['Infrastructure (scaling)', '$14,000'] },
    { cells: ['Legal / Compliance', '$5,500'] },
    { cells: ['Marketing', '$7,500'] },
    { cells: ['Office / Misc', '$2,500'] },
    { cells: ['Monthly Burn (M7-24)', '$174,000'], _bold: true, _color: RED },
  ],
  { colWidths: [300, 202] }
);

spacer();
heading('Total Investment Needed');

table(
  ['Period', 'Calculation', 'Total'],
  [
    { cells: ['Months 1-6', '6 months x $122K', '$732,000'] },
    { cells: ['Months 7-24', '18 months x $174K', '$3,132,000'] },
    { cells: ['One-time costs', 'SOC2 + HITRUST + training', '$170,000'] },
    { cells: ['Revenue offset (starts M6)', 'Estimated early revenue', '-$300,000'] },
    { cells: ['Net Investment Needed', '', '$3,734,000'], _bold: true, _color: BLUE },
    { cells: ['Round Up for Buffer', '', '$4,000,000'], _bold: true, _color: GREEN },
  ],
  { colWidths: [200, 170, 132] }
);

// ═══════════════════════════════════════
// PAGE 5: BREAKEVEN + SUMMARY
// ═══════════════════════════════════════
doc.addPage();
heading('Path to Breakeven');
bodyGray('Assumes avg $475/provider/month blended across tiers, avg 12-15 providers per client organization.');
spacer();

table(
  ['Month', 'Providers', 'Monthly Revenue', 'Monthly Burn', 'Net'],
  [
    { cells: ['Month 3', '10', '$4,500', '$122,000', '-$117,500'] },
    { cells: ['Month 6', '40', '$19,000', '$122,000', '-$103,000'] },
    { cells: ['Month 9', '80', '$38,000', '$174,000', '-$136,000'] },
    { cells: ['Month 12', '150', '$72,000', '$174,000', '-$102,000'] },
    { cells: ['Month 15', '250', '$122,000', '$174,000', '-$52,000'] },
    { cells: ['Month 18', '360', '$176,000', '$174,000', '+$2,000'], _bold: true, _color: GREEN },
    { cells: ['Month 24', '550', '$270,000', '$174,000', '+$96,000'], _bold: true, _color: GREEN },
  ],
  { colWidths: [80, 90, 120, 110, 102] }
);

spacer();
body('Breakeven at approximately 360 providers (month 18). That is about 25-30 client organizations averaging 12-15 providers each.');
spacer();

line();
heading('Executive Summary');
spacer();

const summary = [
  ['Cost per provider (to us)', '$35/month'],
  ['Gross margin at $400 tier', '91%'],
  ['Gross margin at $600 tier', '94%'],
  ['Monthly burn (full team)', '$174,000'],
  ['Total investment needed', '$4,000,000'],
  ['Team size at full build', '10 people'],
  ['Breakeven', 'Month 18 (~360 providers)'],
  ['Revenue at breakeven', '$176K/month ($2.1M ARR)'],
  ['Year 3 projection (600 providers)', '$3.78M ARR'],
  ['Year 5 projection (1,500 providers)', '$9.9M ARR'],
];

table(
  ['Metric', 'Value'],
  summary.map(s => ({ cells: s, _bold: true })),
  { colWidths: [300, 202] }
);

spacer();
doc.font('Helvetica-Oblique').fontSize(14).fillColor(GRAY).text('Your dad\'s pricing works. The margins are excellent. Free migration removes the last barrier to switching. At $400/provider for 5+ analytics products, volume will not be the problem.', LM, undefined, { width: CW });

// Footer on each page
const pages = doc.bufferedPageRange();
for (let i = 0; i < pages.count; i++) {
  doc.switchToPage(i);
  doc.font('Helvetica').fontSize(10).fillColor(GRAY);
  doc.text('KOSIQ  |  Confidential  |  Page ' + (i + 1), LM, 740, { width: CW, align: 'center' });
}

doc.end();
console.log('KOSIQ-Cost-Analysis-2026.pdf generated');
