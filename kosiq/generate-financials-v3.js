const PDFDocument = require('pdfkit');
const fs = require('fs');

// Read existing v2 script and append
const v2 = fs.readFileSync('generate-financials-v2.js', 'utf8');

// Extract everything before doc.end()
const beforeEnd = v2.split('doc.end()')[0];
const afterPart = `

// ════════════════════════════════════════════════
// SLIDE 6: THE ASK — 12 Month vs 24 Month Scenarios
// ════════════════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(32).fillColor(TEXT).text('The Investment Ask', LM, 40);
doc.font('Helvetica').fontSize(16).fillColor(GRAY).text('Two scenarios — lean execution vs full acceleration', LM, 80);

// ── 12-MONTH SCENARIO ──
const col1X = LM, col2X = 980;
const colW2 = 780;

doc.save().roundedRect(col1X, 120, colW2, 850, 14).fill('#f8f9fa').restore();
doc.roundedRect(col1X, 120, colW2, 850, 14).strokeColor(BLUE).lineWidth(2).stroke();

doc.font('Helvetica-Bold').fontSize(22).fillColor(BLUE).text('Scenario A: $1.2M — 12 Months', col1X+25, 140, {width:colW2-50});
doc.font('Helvetica').fontSize(13).fillColor(GRAY).text('Prove product-market fit, sign first clients, reach breakeven', col1X+25, 168, {width:colW2-50});

const s12 = [
  ['ENGINEERING', '', ''],
  ['Lead Backend Engineer', '$160K', 'Data pipelines, FHIR, payer APIs'],
  ['Full-Stack Engineer', '$140K', 'Product features, dashboards, UI'],
  ['AI/ML Engineer (6-mo contract)', '$75K', 'Risk models, NLP, predictive analytics'],
  ['CPO (David Suarez)', '$180K', 'Product architecture, client relationships'],
  ['', '', ''],
  ['SALES & GROWTH', '', ''],
  ['VP Sales — Healthcare', '$150K', 'Existing managed care relationships in FL'],
  ['Marketing & Conferences', '$36K', 'HIMSS, AHIP FL, LinkedIn, content'],
  ['', '', ''],
  ['INFRASTRUCTURE', '', ''],
  ['AWS / Cloud (HIPAA)', '$48K', '$4K/mo — compute, storage, BAA-covered'],
  ['AI API Costs (Claude/Bedrock)', '$36K', '$3K/mo — scales with patient volume'],
  ['Third-Party Services', '$12K', 'Auth, monitoring, email, error tracking'],
  ['SOC2 Audit + HIPAA', '$40K', 'One-time compliance certification'],
  ['Legal (BAAs, MSAs)', '$25K', 'Healthcare contract negotiation'],
  ['', '', ''],
  ['CLINICAL', '', ''],
  ['Dr. JD Suarez (CMO)', 'Equity', 'Fractional — clinical credibility, payer relationships'],
  ['Advisory Board Stipends', '$15K', '2-3 physician advisors'],
  ['', '', ''],
  ['BUFFER', '', ''],
  ['Working Capital Reserve', '$103K', 'Buffer for slower-than-expected sales cycles'],
];

let sy = 200;
s12.forEach(r => {
  if (!r[0] && !r[1]) { sy += 6; return; }
  if (!r[1] && !r[2]) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor(BLUE).text(r[0], col1X+25, sy, {width:colW2-50});
    sy += 16; return;
  }
  doc.font('Helvetica').fontSize(11).fillColor(TEXT).text(r[0], col1X+25, sy, {width:280});
  doc.font('Helvetica-Bold').fontSize(11).fillColor(r[1]==='Equity'?'#059669':TEXT).text(r[1], col1X+320, sy, {width:80, align:'right'});
  doc.font('Helvetica').fontSize(10).fillColor(GRAY).text(r[2], col1X+420, sy, {width:340});
  sy += 16;
});

// 12-month totals
sy += 8;
doc.rect(col1X+25, sy, colW2-50, 1).fill('#e0e0e0'); sy += 8;
doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT).text('Total Ask', col1X+25, sy);
doc.font('Helvetica-Bold').fontSize(20).fillColor(BLUE).text('$1,200,000', col1X+320, sy-2, {width:200, align:'right'});

sy += 30;
doc.font('Helvetica-Bold').fontSize(12).fillColor(TEXT).text('12-Month Milestones:', col1X+25, sy); sy += 18;
const m12 = [
  ['5 client organizations signed', '15,000 members on platform'],
  ['$3.1M ARR run rate', 'Breakeven by month 10'],
  ['SOC2 + HIPAA certified', 'Ready for Series A raise'],
];
m12.forEach(pair => {
  pair.forEach((m, j) => {
    doc.font('Helvetica').fontSize(11).fillColor(TEXT).text('• ' + m, col1X+25 + j*370, sy, {width:350});
  });
  sy += 16;
});

sy += 12;
doc.font('Helvetica-Bold').fontSize(12).fillColor('#059669').text('Equity: 15-20% → $6-8M pre-money valuation', col1X+25, sy);

// ── 24-MONTH SCENARIO ──
doc.save().roundedRect(col2X, 120, colW2, 850, 14).fill('#f0f7ff').restore();
doc.roundedRect(col2X, 120, colW2, 850, 14).strokeColor(BLUE).lineWidth(2).stroke();

doc.font('Helvetica-Bold').fontSize(22).fillColor(BLUE).text('Scenario B: $2.5M — 24 Months', col2X+25, 140, {width:colW2-50});
doc.font('Helvetica').fontSize(13).fillColor(GRAY).text('Full team, aggressive growth, skip Series A entirely', col2X+25, 168, {width:colW2-50});

const s24 = [
  ['ENGINEERING', '', ''],
  ['Lead Backend Engineer', '$320K', '2 years — senior hire, data architecture'],
  ['Full-Stack Engineer', '$280K', '2 years — product velocity'],
  ['AI/ML Engineer', '$300K', '2 years — full-time, proprietary models'],
  ['DevOps / Infra Engineer', '$240K', '2 years — HIPAA infra, CI/CD, monitoring'],
  ['CPO (David Suarez)', '$360K', '2 years — product + client relationships'],
  ['', '', ''],
  ['SALES & GROWTH', '', ''],
  ['VP Sales — Healthcare', '$300K', '2 years — builds and manages sales team'],
  ['Account Executive', '$170K', 'Year 2 hire — second seller'],
  ['SDR / Lead Gen', '$110K', '2 years — pipeline building'],
  ['Marketing & Conferences', '$80K', 'HIMSS, AHIP, content, case studies'],
  ['', '', ''],
  ['INFRASTRUCTURE', '', ''],
  ['AWS / Cloud (HIPAA)', '$108K', '$4.5K/mo avg, scaling with members'],
  ['AI API Costs', '$84K', '$3.5K/mo avg, scales with volume'],
  ['Third-Party Services', '$24K', '$1K/mo — monitoring, auth, email'],
  ['SOC2 + HITRUST', '$65K', 'Both certifications for enterprise sales'],
  ['Legal & Compliance', '$50K', 'Ongoing BAAs, state regs, contract work'],
  ['', '', ''],
  ['CLINICAL', '', ''],
  ['Dr. JD Suarez (CMO)', 'Equity', 'Fractional CMO — clinical strategy'],
  ['Advisory Board', '$30K', '2 years, 3-4 advisors'],
  ['Clinical Validation Study', '$25K', 'Published outcomes data for credibility'],
  ['', '', ''],
  ['BUFFER', '', ''],
  ['Working Capital Reserve', '$254K', '3-month runway buffer'],
];

let sy2 = 200;
s24.forEach(r => {
  if (!r[0] && !r[1]) { sy2 += 6; return; }
  if (!r[1] && !r[2]) {
    doc.font('Helvetica-Bold').fontSize(11).fillColor(BLUE).text(r[0], col2X+25, sy2, {width:colW2-50});
    sy2 += 16; return;
  }
  doc.font('Helvetica').fontSize(11).fillColor(TEXT).text(r[0], col2X+25, sy2, {width:280});
  doc.font('Helvetica-Bold').fontSize(11).fillColor(r[1]==='Equity'?'#059669':TEXT).text(r[1], col2X+320, sy2, {width:80, align:'right'});
  doc.font('Helvetica').fontSize(10).fillColor(GRAY).text(r[2], col2X+420, sy2, {width:340});
  sy2 += 16;
});

sy2 += 8;
doc.rect(col2X+25, sy2, colW2-50, 1).fill('#e0e0e0'); sy2 += 8;
doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT).text('Total Ask', col2X+25, sy2);
doc.font('Helvetica-Bold').fontSize(20).fillColor(BLUE).text('$2,500,000', col2X+320, sy2-2, {width:200, align:'right'});

sy2 += 30;
doc.font('Helvetica-Bold').fontSize(12).fillColor(TEXT).text('24-Month Milestones:', col2X+25, sy2); sy2 += 18;
const m24 = [
  ['16 client organizations signed', '65,000 members on platform'],
  ['$18.6M ARR run rate', 'Cash-flow positive by month 10'],
  ['SOC2 + HITRUST certified', '$13.5M cumulative free cash flow'],
  ['Series A optional — self-funded growth', 'Regional market leader in SE Florida'],
];
m24.forEach(pair => {
  pair.forEach((m, j) => {
    doc.font('Helvetica').fontSize(11).fillColor(TEXT).text('• ' + m, col2X+25 + j*370, sy2, {width:350});
  });
  sy2 += 16;
});

sy2 += 12;
doc.font('Helvetica-Bold').fontSize(12).fillColor('#059669').text('Equity: 15-20% → $12.5-16.5M pre-money valuation', col2X+25, sy2);

footer(6);

doc.end();
console.log('KOSIQ-Financials-2026.pdf generated (6 slides)');
`;

// Write combined script
const combined = beforeEnd + afterPart;
fs.writeFileSync('/tmp/gen-fin-final.js', combined);
