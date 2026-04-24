const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: [1920, 1080], margin: 0 });
doc.pipe(fs.createWriteStream('KOSIQ-Financials-2026.pdf'));

const W = 1920, H = 1080;
const BLUE = '#26acf7', DARK = '#0a0a0f', WHITE = '#ffffff';
const TEXT = '#1d1d1f', GRAY = '#86868b';
const GREEN = '#10b981', ORANGE = '#f97316';
const LM = 120;

function footer(num) {
  doc.font('Helvetica').fontSize(14).fillColor(GRAY);
  doc.text('KOSIQ  ·  Confidential  ·  ' + num, 0, H - 40, { width: W, align: 'center' });
}
function lightBg() { doc.rect(0, 0, W, H).fill(WHITE); }
function darkBg() { doc.rect(0, 0, W, H).fill(DARK); }
function drawGridLines(x, y, w, h, n) {
  doc.save().strokeColor('#e5e7eb').lineWidth(0.5);
  for (let i = 0; i <= n; i++) {
    const ly = y + (h / n) * i;
    doc.moveTo(x, ly).lineTo(x + w, ly).stroke();
  }
  doc.restore();
}

// ═══════════════════════════════════════
// SLIDE 1 — BUSINESS MODEL (Light)
// ═══════════════════════════════════════
lightBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('High-Margin Enterprise SaaS Business Model', LM, 50);

// Revenue math explained
doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT).text('How Revenue Works', LM, 120);
doc.font('Helvetica').fontSize(14).fillColor(GRAY).text('PMPM pricing × members = predictable recurring revenue. Integration fees provide upfront cash.', LM, 146, { width: 460 });

// Revenue example box
doc.save().roundedRect(LM, 180, 460, 145, 10).fill('#eef6ff').restore();
doc.roundedRect(LM, 180, 460, 145, 10).strokeColor(BLUE).lineWidth(1).stroke();
doc.font('Helvetica-Bold').fontSize(13).fillColor(BLUE).text('EXAMPLE: ONE CLIENT — 30,000 MEMBER MANAGED CARE GROUP', LM + 15, 192, { width: 430 });
doc.font('Helvetica').fontSize(13).fillColor(TEXT);
doc.text('PMPM Rate: $1.25 × 30,000 members × 12 months', LM + 15, 218, { width: 280 });
doc.font('Helvetica-Bold').fontSize(13).fillColor(GREEN).text('= $450,000/yr', LM + 330, 218);
doc.font('Helvetica').fontSize(13).fillColor(TEXT).text('Integration Fee (one-time):', LM + 15, 240, { width: 280 });
doc.font('Helvetica-Bold').fontSize(13).fillColor(GREEN).text('= $15,000', LM + 330, 240);
doc.font('Helvetica').fontSize(13).fillColor(TEXT).text('Year 1 Revenue from ONE client:', LM + 15, 266, { width: 280 });
doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE).text('$465,000', LM + 330, 264);
doc.font('Helvetica-Oblique').fontSize(11).fillColor(GRAY).text('3 clients at this size = $1.4M ARR.  8 clients = $3.7M ARR.', LM + 15, 294, { width: 430 });

// PMPM tiers
doc.font('Helvetica-Bold').fontSize(16).fillColor(TEXT).text('PMPM Pricing Tiers', LM, 345);
const tiers = [['Core Analytics (60K+ members)', '$0.50'], ['Advanced + Predictions (20-60K)', '$1.25'], ['Enterprise + Custom (<20K)', '$2.24']];
let ty = 372;
tiers.forEach(([name, price]) => {
  doc.font('Helvetica').fontSize(14).fillColor(TEXT).text(name, LM, ty, { width: 320 });
  doc.font('Helvetica-Bold').fontSize(14).fillColor(BLUE).text(price + ' /member/mo', LM + 330, ty);
  ty += 28;
});

// Integration packages
doc.font('Helvetica-Bold').fontSize(16).fillColor(TEXT).text('Integration Packages', LM, ty + 15);
ty += 42;
const intPkgs = [['Standard EHR Integration', '$10,000'], ['Complex Multi-System', '$15,000'], ['Enterprise Custom', '$20,000']];
intPkgs.forEach(([name, price]) => {
  doc.font('Helvetica').fontSize(14).fillColor(TEXT).text(name, LM, ty, { width: 320 });
  doc.font('Helvetica-Bold').fontSize(14).fillColor(BLUE).text(price, LM + 330, ty);
  ty += 28;
});

// RIGHT SIDE: ARR Bar Chart
{
  const chartX = 680, chartY = 100;
  doc.rect(chartX, chartY - 6, W - chartX - LM, 4).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(TEXT);
  doc.text('Projected Annual Recurring Revenue', chartX, chartY + 10);

  const barData = [
    { label: 'Year 1', value: 1.74, display: '$1.74M' },
    { label: 'Year 2', value: 7.08, display: '$7.08M' },
    { label: 'Year 3', value: 18.6, display: '$18.6M' },
    { label: 'Year 4', value: 38.4, display: '$38.4M' },
    { label: 'Year 5', value: 62, display: '$62M' },
  ];
  const maxVal = 70;
  const bX = chartX + 60, bY = chartY + 55, bW = 920, bH = 360;

  drawGridLines(bX, bY, bW, bH, 5);

  const barW = 130;
  const barGap = (bW - barData.length * barW) / (barData.length + 1);
  barData.forEach((d, i) => {
    const x = bX + barGap + i * (barW + barGap);
    const barHeight = (d.value / maxVal) * bH;
    const y = bY + bH - barHeight;
    doc.rect(x, y, barW, barHeight).fill(BLUE);
    doc.font('Helvetica-Bold').fontSize(18).fillColor(WHITE);
    doc.text(d.display, x, y + barHeight / 2 - 10, { width: barW, align: 'center' });
    doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT);
    doc.text(d.label, x, bY + bH + 12, { width: barW, align: 'center' });
  });

  for (let i = 0; i <= 5; i++) {
    const val = Math.round((maxVal / 5) * (5 - i));
    doc.font('Helvetica').fontSize(12).fillColor(GRAY);
    doc.text('$' + val + 'M', bX - 50, bY + (bH / 5) * i - 7, { width: 44, align: 'right' });
  }
}

// Revenue mix bar
{
  const mixY = 590;
  doc.rect(LM, mixY - 4, W - LM * 2, 3).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT);
  doc.text('Revenue Mix (Year 1)', LM, mixY + 10);

  const barY = mixY + 42;
  const maxW2 = W - LM * 2 - 40;

  doc.rect(LM, barY, maxW2 * 0.82, 44).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(WHITE);
  doc.text('PMPM Revenue — 82%', LM + 20, barY + 12);

  doc.rect(LM + maxW2 * 0.82 + 4, barY, maxW2 * 0.18 - 4, 44).fill(GREEN);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(WHITE);
  doc.text('Integration — 18%', LM + maxW2 * 0.82 + 14, barY + 14);

  doc.font('Helvetica').fontSize(13).fillColor(GRAY);
  doc.text('Recurring SaaS revenue scales with lives under management. Zero per-transaction costs.', LM, barY + 55);
}

footer(1);

// ═══════════════════════════════════════
// SLIDE 2 — UNIT ECONOMICS (Light)
// ═══════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('Unit Economics', LM, 50);
doc.font('Helvetica').fontSize(18).fillColor(GRAY);
doc.text('Per-member economics that improve at scale', LM, 95);

const ueMetrics = [
  { label: 'Customer Acquisition Cost', value: '$18K', sub: 'Per organization (avg 15K members)' },
  { label: 'CAC per Member', value: '$1.20', sub: 'Drops to $0.40 at scale' },
  { label: 'LTV per Member', value: '$42.00', sub: '36-month avg contract' },
  { label: 'LTV:CAC Ratio', value: '35:1', sub: 'Target: >10:1 for SaaS' },
  { label: 'Payback Period', value: '4.2 mo', sub: 'Integration fee covers CAC' },
  { label: 'Gross Margin', value: '88%', sub: 'Software + AI infrastructure' },
];
const ueCardW = (W - LM * 2 - 50) / 3;
ueMetrics.forEach((m, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const cx = LM + col * (ueCardW + 25);
  const cy = 150 + row * 140;
  doc.save().roundedRect(cx, cy, ueCardW, 120, 12).fill('#f8f9fa').restore();
  doc.roundedRect(cx, cy, ueCardW, 120, 12).strokeColor('#e5e7eb').lineWidth(1).stroke();
  doc.font('Helvetica').fontSize(12).fillColor(GRAY).text(m.label, cx + 20, cy + 18, { width: ueCardW - 40 });
  doc.font('Helvetica-Bold').fontSize(36).fillColor(BLUE).text(m.value, cx + 20, cy + 40, { width: ueCardW - 40 });
  doc.font('Helvetica').fontSize(11).fillColor(GRAY).text(m.sub, cx + 20, cy + 88, { width: ueCardW - 40 });
});

// Margin waterfall
const wfY = 450;
doc.rect(LM, wfY - 4, W - LM * 2, 3).fill(BLUE);
doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text('Margin Structure', LM, wfY + 10);

const margins = [
  { label: 'Revenue\n(PMPM + Integration)', pct: 100, color: BLUE },
  { label: 'Infrastructure\n(Cloud + AI)', pct: 12, color: '#ef4444' },
  { label: 'Gross Profit', pct: 88, color: GREEN },
  { label: 'Sales &\nMarketing', pct: 22, color: '#f97316' },
  { label: 'R&D', pct: 18, color: '#8b5cf6' },
  { label: 'G&A', pct: 8, color: '#6b7280' },
  { label: 'EBITDA\n(Year 2+)', pct: 40, color: '#059669' },
];
const mBarW = (W - LM * 2 - margins.length * 8) / margins.length;
margins.forEach((m, i) => {
  const mx = LM + i * (mBarW + 8);
  const mH = (m.pct / 100) * 350;
  const my = wfY + 400 - mH;
  doc.rect(mx, my, mBarW, mH).fill(m.color);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(WHITE);
  doc.text(m.pct + '%', mx, my + mH / 2 - 12, { width: mBarW, align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor(TEXT);
  doc.text(m.label, mx, wfY + 410, { width: mBarW, align: 'center' });
});

doc.font('Helvetica-Oblique').fontSize(14).fillColor(GRAY);
doc.text('88% gross margins are best-in-class for healthcare SaaS. No hardware, no physical infrastructure, no per-claim processing costs.', LM, H - 80, { width: W - LM * 2 });
footer(2);

// ═══════════════════════════════════════
// SLIDE 3 — 5-YEAR FINANCIAL PROJECTIONS (Dark)
// ═══════════════════════════════════════
doc.addPage(); darkBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(WHITE);
doc.text('5-Year Financial Projections', LM, 50);

// Assumptions bar
doc.save().roundedRect(LM, 100, W - LM * 2, 28, 6).fill('#1a1a2e').restore();
doc.font('Helvetica').fontSize(11).fillColor('#8888aa');
doc.text('ASSUMPTIONS:  Avg client = 15K-30K members  |  Avg PMPM declines with scale ($1.25 to $0.75)  |  3 clients Year 1, 42 clients Year 5  |  36-month avg contract  |  12% COGS  |  No churn assumed', LM + 12, 105, { width: W - LM * 2 - 24 });

// P&L Table
const plY = 150;
const plCols = ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
const plColW = (W - LM * 2) / plCols.length;
plCols.forEach((col, i) => {
  doc.font('Helvetica-Bold').fontSize(14).fillColor(i === 0 ? '#666' : BLUE);
  doc.text(col, LM + i * plColW, plY, { width: plColW, align: i === 0 ? 'left' : 'center' });
});

const plRows = [
  { label: 'Members Under Management', values: ['8,000', '28,000', '65,000', '120,000', '200,000'], bold: false },
  { label: 'Client Organizations', values: ['3', '8', '16', '28', '42'], bold: false },
  { label: 'Avg PMPM', values: ['$1.25', '$1.15', '$1.00', '$0.85', '$0.75'], bold: false },
  { label: '', values: ['', '', '', '', ''], bold: false },
  { label: 'PMPM Revenue', values: ['$120K', '$387K', '$780K', '$1.22M', '$1.80M'], bold: false },
  { label: 'Integration Revenue', values: ['$45K', '$100K', '$200K', '$300K', '$400K'], bold: false },
  { label: 'Total ARR', values: ['$1.74M', '$7.08M', '$18.6M', '$38.4M', '$62M'], bold: true },
  { label: '', values: ['', '', '', '', ''], bold: false },
  { label: 'COGS (12%)', values: ['$209K', '$850K', '$2.2M', '$4.6M', '$7.4M'], bold: false },
  { label: 'Gross Profit', values: ['$1.53M', '$6.23M', '$16.4M', '$33.8M', '$54.6M'], bold: true },
  { label: 'Gross Margin', values: ['88%', '88%', '88%', '88%', '88%'], bold: false },
  { label: '', values: ['', '', '', '', ''], bold: false },
  { label: 'Sales & Marketing', values: ['$480K', '$1.2M', '$3.0M', '$5.8M', '$8.5M'], bold: false },
  { label: 'R&D', values: ['$600K', '$1.1M', '$2.5M', '$4.8M', '$7.2M'], bold: false },
  { label: 'G&A', values: ['$300K', '$500K', '$1.0M', '$1.8M', '$2.8M'], bold: false },
  { label: '', values: ['', '', '', '', ''], bold: false },
  { label: 'EBITDA', values: ['$150K', '$3.43M', '$9.9M', '$21.4M', '$36.1M'], bold: true },
  { label: 'EBITDA Margin', values: ['9%', '48%', '53%', '56%', '58%'], bold: true },
];

let plRY = plY + 30;
plRows.forEach((row) => {
  if (!row.label) { plRY += 8; return; }
  const isHeader = row.bold;
  if (isHeader) {
    doc.rect(LM - 10, plRY - 2, W - LM * 2 + 20, 24).fill('#1a1a2e');
  }
  doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(13).fillColor(isHeader ? WHITE : '#cccccc');
  doc.text(row.label, LM, plRY + 4, { width: plColW, align: 'left' });
  row.values.forEach((val, i) => {
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(13).fillColor(isHeader ? BLUE : '#e0e0e0');
    doc.text(val, LM + (i + 1) * plColW, plRY + 4, { width: plColW, align: 'center' });
  });
  plRY += 26;
});

// Key callouts
const coY = plRY + 30;
doc.rect(LM, coY, W - LM * 2, 3).fill(BLUE);
const callouts = [
  ['Cash-flow positive', 'Month 8'],
  ['$62M ARR', 'Year 5'],
  ['58% EBITDA margins', 'At scale'],
  ['200K lives managed', 'Year 5 target'],
];
const coW = (W - LM * 2) / callouts.length;
callouts.forEach((c, i) => {
  doc.font('Helvetica-Bold').fontSize(28).fillColor(BLUE);
  doc.text(c[1], LM + i * coW, coY + 20, { width: coW, align: 'center' });
  doc.font('Helvetica').fontSize(13).fillColor('#a1a1a6');
  doc.text(c[0], LM + i * coW, coY + 56, { width: coW, align: 'center' });
});

footer(3);

// ═══════════════════════════════════════
// SLIDE 4 — TAM / SAM / SOM (Light)
// ═══════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('Total Addressable Market', LM, 50);
doc.font('Helvetica').fontSize(18).fillColor(GRAY);
doc.text('KOSIQ operates across multiple $30B+ healthcare markets simultaneously', LM, 95);

// Concentric circles
const tCx = 480, tCy = 500;
doc.save().opacity(0.08); doc.circle(tCx, tCy, 340).fill(BLUE); doc.restore();
doc.circle(tCx, tCy, 340).strokeColor(BLUE).lineWidth(2).stroke();
doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE).text('TAM', tCx - 200, tCy - 320, { width: 400, align: 'center' });
doc.font('Helvetica-Bold').fontSize(48).fillColor(TEXT).text('$234B', tCx - 200, tCy - 295, { width: 400, align: 'center' });
doc.font('Helvetica').fontSize(13).fillColor(GRAY).text('EMR + RCM + Pop Health + VBC Analytics + Claims', tCx - 200, tCy - 248, { width: 400, align: 'center' });

doc.save().opacity(0.12); doc.circle(tCx, tCy, 220).fill(BLUE); doc.restore();
doc.circle(tCx, tCy, 220).strokeColor(BLUE).lineWidth(2).stroke();
doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE).text('SAM', tCx - 150, tCy - 190, { width: 300, align: 'center' });
doc.font('Helvetica-Bold').fontSize(42).fillColor(TEXT).text('$48B', tCx - 150, tCy - 165, { width: 300, align: 'center' });
doc.font('Helvetica').fontSize(13).fillColor(GRAY).text('Managed Care Orgs + MA Plans\nneeding VBC operations platform', tCx - 150, tCy - 125, { width: 300, align: 'center' });

doc.save().opacity(0.18); doc.circle(tCx, tCy, 110).fill(BLUE); doc.restore();
doc.circle(tCx, tCy, 110).strokeColor(BLUE).lineWidth(2).stroke();
doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE).text('SOM', tCx - 100, tCy - 60, { width: 200, align: 'center' });
doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT).text('$2.4B', tCx - 100, tCy - 35, { width: 200, align: 'center' });
doc.font('Helvetica').fontSize(12).fillColor(GRAY).text('SE US Managed Care\n20K-60K+ member groups', tCx - 100, tCy + 5, { width: 200, align: 'center' });

// Market breakdown table on the right
const msX = 860;
doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT).text('Markets KOSIQ Addresses', msX, 150, { width: 500 });
doc.rect(msX, 178, 700, 2).fill(BLUE);

doc.font('Helvetica-Bold').fontSize(11).fillColor(GRAY);
doc.text('Market', msX, 188, { width: 260 });
doc.text('Size (2026)', msX + 270, 188, { width: 100, align: 'right' });
doc.text('Growth', msX + 390, 188, { width: 100, align: 'right' });
doc.text('Source', msX + 510, 188, { width: 180 });

const mktBreakdown = [
  ['EMR/EHR Systems', '$36.2B', '6.3% CAGR', 'Straits Research 2026'],
  ['Revenue Cycle Mgmt', '$73.0B', '12.4% CAGR', 'MarketsAndMarkets 2026'],
  ['Population Health', '$35.8B', '17.2% CAGR', 'Grand View Research 2026'],
  ['Healthcare Analytics', '$21.4B', '23.5% CAGR', 'GlobeNewsWire 2026'],
  ['Claims Processing', '$18.2B', '8.1% CAGR', 'Fortune Business 2026'],
  ['VBC Enablement', '$15.4B', '14.8% CAGR', 'KLAS Research 2025'],
  ['Risk Adjustment / HCC', '$8.6B', '19.3% CAGR', 'Chilmark Research 2025'],
  ['Quality / HEDIS', '$5.2B', '11.2% CAGR', 'Gartner 2025'],
];
let mkY = 210;
mktBreakdown.forEach((m) => {
  doc.font('Helvetica').fontSize(12).fillColor(TEXT).text(m[0], msX, mkY, { width: 260 });
  doc.font('Helvetica-Bold').fontSize(12).fillColor(BLUE).text(m[1], msX + 270, mkY, { width: 100, align: 'right' });
  doc.font('Helvetica').fontSize(11).fillColor(GREEN).text(m[2], msX + 390, mkY, { width: 100, align: 'right' });
  doc.font('Helvetica-Oblique').fontSize(9).fillColor('#b0b0b0').text(m[3], msX + 510, mkY + 1, { width: 180 });
  mkY += 24;
});
doc.rect(msX, mkY, 500, 1).fill('#e0e0e0');
mkY += 8;
doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT).text('Combined TAM', msX, mkY, { width: 260 });
doc.font('Helvetica-Bold').fontSize(14).fillColor(BLUE).text('$213.8B', msX + 270, mkY, { width: 100, align: 'right' });

mkY += 40;
doc.save().roundedRect(msX, mkY, 700, 70, 10).fill('#eef6ff').restore();
doc.roundedRect(msX, mkY, 700, 70, 10).strokeColor(BLUE).lineWidth(1).stroke();
doc.font('Helvetica-Bold').fontSize(13).fillColor(BLUE).text('WHY $234B AND NOT $53B:', msX + 15, mkY + 10, { width: 670 });
doc.font('Helvetica').fontSize(12).fillColor(TEXT).text('eClinicalWorks alone generates $700M+/yr from EMR + RCM. Epic is worth $50B+. KOSIQ replaces 8 separate vendor categories with one platform. The TAM is every dollar spent on fragmented healthcare operations software.', msX + 15, mkY + 28, { width: 670 });

doc.save().roundedRect(msX, mkY + 85, 700, 60, 10).fill('#f0fdf4').restore();
doc.roundedRect(msX, mkY + 85, 700, 60, 10).strokeColor(GREEN).lineWidth(1).stroke();
doc.font('Helvetica-Bold').fontSize(22).fillColor(GREEN).text('5.2M', msX + 15, mkY + 95);
doc.font('Helvetica').fontSize(13).fillColor(TEXT).text('Medicare Advantage enrollees in Florida — the largest MA market in the US. KOSIQ starts here, then expands nationally.', msX + 85, mkY + 93, { width: 610 });

footer(4);

doc.end();
console.log('✅ KOSIQ-Financials-2026.pdf generated (4 slides)');
