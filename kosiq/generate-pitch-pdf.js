const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: [1920, 1080], margin: 0 });
doc.pipe(fs.createWriteStream('public/KOSIQ-Investor-Pitch-2026.pdf'));

const BLUE = '#26acf7';
const DARK = '#231f20';
const GRAY = '#86868b';
const LIGHT_BG = '#f5f5f7';
const WHITE = '#ffffff';

function logo(x, y, size) {
  doc.font('Helvetica-Bold').fontSize(size).fillColor(DARK).text('KOS', x, y, { continued: true }).fillColor(BLUE).text('IQ', { continued: false });
}

function slideNum(n, total) {
  doc.font('Helvetica').fontSize(14).fillColor(GRAY).text(`${n} / ${total}`, 1820, 1040, { width: 80, align: 'right' });
}

function heading(text, y = 80) {
  doc.font('Helvetica-Bold').fontSize(48).fillColor(DARK).text(text, 120, y, { width: 1680 });
}

function subheading(text, y) {
  doc.font('Helvetica').fontSize(24).fillColor(GRAY).text(text, 120, y, { width: 1680 });
}

function bullet(text, x, y, opts = {}) {
  const size = opts.size || 22;
  const color = opts.color || '#1d1d1f';
  doc.font('Helvetica').fontSize(size).fillColor(color).text(`•  ${text}`, x, y, { width: opts.width || 1600 });
}

function boldBullet(bold, rest, x, y, opts = {}) {
  const size = opts.size || 22;
  doc.font('Helvetica-Bold').fontSize(size).fillColor('#1d1d1f').text(`•  ${bold}`, x, y, { width: opts.width || 1600, continued: true });
  doc.font('Helvetica').text(rest, { continued: false });
}

const TOTAL = 16;

// --- SLIDE 1: Title ---
doc.rect(0, 0, 1920, 1080).fill(WHITE);
logo(760, 300, 96);
doc.font('Helvetica').fontSize(32).fillColor(GRAY).text('AI-Powered Medical Economics Intelligence', 0, 430, { width: 1920, align: 'center' });
doc.font('Helvetica').fontSize(20).fillColor(GRAY).text('Investor Presentation  |  2026', 0, 500, { width: 1920, align: 'center' });
doc.rect(860, 560, 200, 4).fill(BLUE);
slideNum(1, TOTAL);

// --- SLIDE 2: The Problem ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('The Problem');
subheading('Healthcare analytics is stuck in the past', 140);
let py = 220;
const problems = [
  'Managed care practices manage thousands of patients across multiple payers with fragmented data',
  'Current tools (Nuvia/Virtu, eClinicalWorks) are outdated, manual, and purely retrospective',
  'No AI-powered insights, no predictive analytics, no actionable recommendations',
  'CMOs spend hours manually reviewing static reports to identify at-risk patients',
  'Missed interventions cost practices millions in avoidable hospitalizations and penalties',
];
problems.forEach(p => { bullet(p, 120, py); py += 65; });
doc.rect(120, py + 40, 600, 120).fillAndStroke(LIGHT_BG, LIGHT_BG);
doc.font('Helvetica-Bold').fontSize(42).fillColor(BLUE).text('$53B+', 160, py + 55);
doc.font('Helvetica').fontSize(18).fillColor(GRAY).text('Healthcare analytics market, growing 21%+ CAGR', 370, py + 70);
slideNum(2, TOTAL);

// --- SLIDE 3: The Solution ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('The Solution');
logo(120, 160, 56);
doc.font('Helvetica').fontSize(26).fillColor(GRAY).text('AI Medical Economics Platform', 350, 170);
subheading('Ingest claims data from any payer. AI cleans and normalizes. Actionable intelligence.', 260);
// Three pillars
const pillars = [
  { title: 'Predictive Analytics', desc: '30/60/90-day hospitalization risk,\nLACE scoring, cost forecasting' },
  { title: 'AI Recommendations', desc: 'Monthly reports with prioritized\nactions and financial impact' },
  { title: 'Clinical Alert Programs', desc: '8 evidence-based protocols\ndesigned by practicing CMO' },
];
pillars.forEach((p, i) => {
  const bx = 120 + i * 580;
  doc.rect(bx, 380, 540, 280).fillAndStroke(LIGHT_BG, LIGHT_BG);
  doc.roundedRect(bx, 380, 540, 280, 12).stroke('#e0e0e0');
  doc.rect(bx, 380, 540, 6).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(26).fillColor(DARK).text(p.title, bx + 40, 420, { width: 460 });
  doc.font('Helvetica').fontSize(20).fillColor(GRAY).text(p.desc, bx + 40, 470, { width: 460 });
});
slideNum(3, TOTAL);

// --- SLIDE 4: Product ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('Product');
subheading('20+ analytics dashboards, AI chat, predictive models — all in one platform', 140);
const screens = ['Dashboard Action Center', 'Predictive Analytics', 'AI Recommendations', 'AI Chat Assistant'];
screens.forEach((s, i) => {
  const sx = 120 + i * 430;
  doc.rect(sx, 260, 400, 500).fillAndStroke(LIGHT_BG, '#e0e0e0');
  doc.font('Helvetica-Bold').fontSize(20).fillColor(DARK).text(s, sx + 20, 280, { width: 360 });
  doc.rect(sx + 20, 320, 360, 400).fillAndStroke('#e8e8ed', '#d0d0d5');
  doc.font('Helvetica').fontSize(16).fillColor(GRAY).text('[Live Screenshot]', sx + 100, 500, { width: 200 });
});
doc.font('Helvetica-Bold').fontSize(22).fillColor(BLUE).text('Live Demo: kosiq.ai', 120, 820);
slideNum(4, TOTAL);

// --- SLIDE 5: How It Works ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('How It Works');
const steps = [
  { num: '01', title: 'Connect', desc: 'Upload payer claims data\n(claims, eligibility, pharmacy)' },
  { num: '02', title: 'Process', desc: 'AI cleans, normalizes,\nand enriches data' },
  { num: '03', title: 'Analyze', desc: 'Real-time dashboards,\npredictive models, risk scores' },
  { num: '04', title: 'Act', desc: 'AI recommendations,\nautomated monthly reports' },
];
steps.forEach((s, i) => {
  const sx = 120 + i * 450;
  doc.font('Helvetica-Bold').fontSize(72).fillColor(BLUE).text(s.num, sx, 240);
  doc.font('Helvetica-Bold').fontSize(28).fillColor(DARK).text(s.title, sx, 340);
  doc.font('Helvetica').fontSize(20).fillColor(GRAY).text(s.desc, sx, 390, { width: 380 });
  if (i < 3) {
    doc.font('Helvetica').fontSize(48).fillColor('#d0d0d5').text('>', sx + 390, 300);
  }
});
slideNum(5, TOTAL);

// --- SLIDE 6: Key Features ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('Key Features');
const features = [
  ['20+ Analytics Dashboards', 'Membership, pharmacy, hospitalization, claims, finance, referrals, billing/MRA'],
  ['Predictive Analytics', '30/60/90-day hospitalization risk, LACE scoring, cost forecasting'],
  ['AI Recommendations', 'Monthly reports with prioritized actions and financial impact estimates'],
  ['AI Chat Assistant', 'Natural language queries on any patient data — ask in plain English'],
  ['Clinical Alert Programs', '8 high-risk identification protocols designed by practicing CMO'],
  ['Enterprise Security', 'Role-based access, audit logging, session management, HIPAA-ready'],
];
features.forEach((f, i) => {
  const fy = 180 + i * 120;
  const col = i % 2 === 0 ? 120 : 960;
  const row = Math.floor(i / 2);
  const ry = 180 + row * 160;
  doc.rect(col, ry, 800, 140).fillAndStroke(LIGHT_BG, LIGHT_BG);
  doc.roundedRect(col, ry, 800, 140, 8).stroke('#e0e0e0');
  doc.rect(col, ry, 6, 140).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(DARK).text(f[0], col + 30, ry + 20, { width: 740 });
  doc.font('Helvetica').fontSize(18).fillColor(GRAY).text(f[1], col + 30, ry + 55, { width: 740 });
});
slideNum(6, TOTAL);

// --- SLIDE 7: Competitive Landscape ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('Competitive Landscape');
const compCols = ['KOSIQ', 'Nuvia/Virtu', 'eClinicalWorks', 'Arcadia', 'Innovaccer'];
const compRows = ['AI-Powered Analytics', 'Predictive Models', 'AI Recommendations', 'Natural Language Chat', 'Clinical Alerts', 'Modern UI/UX', 'Ease of Setup', 'Price Point'];
const vals = [
  ['Yes', 'No', 'No', 'Partial', 'Partial'],
  ['Yes', 'No', 'No', 'Partial', 'No'],
  ['Yes', 'No', 'No', 'No', 'No'],
  ['Yes', 'No', 'No', 'No', 'No'],
  ['8 Programs', 'No', 'Basic', 'No', 'No'],
  ['Modern', 'Dated', 'Dated', 'OK', 'OK'],
  ['Days', 'Weeks', 'Months', 'Weeks', 'Months'],
  ['$$', '$$', '$$$', '$$$$', '$$$$'],
];
// Header
const tw = 280; const th = 50; const tx0 = 120; const ty0 = 180;
doc.rect(tx0, ty0, tw, th).fill(DARK);
doc.font('Helvetica-Bold').fontSize(16).fillColor(WHITE).text('Feature', tx0 + 15, ty0 + 15, { width: tw - 30 });
compCols.forEach((c, i) => {
  const cx = tx0 + tw + i * 280;
  doc.rect(cx, ty0, 280, th).fill(i === 0 ? BLUE : '#e8e8ed');
  doc.font('Helvetica-Bold').fontSize(16).fillColor(i === 0 ? WHITE : DARK).text(c, cx + 15, ty0 + 15, { width: 250 });
});
compRows.forEach((r, ri) => {
  const ry = ty0 + th + ri * 72;
  const bg = ri % 2 === 0 ? WHITE : LIGHT_BG;
  doc.rect(tx0, ry, tw, 72).fill(bg);
  doc.font('Helvetica').fontSize(16).fillColor(DARK).text(r, tx0 + 15, ry + 25, { width: tw - 30 });
  vals[ri].forEach((v, vi) => {
    const vx = tx0 + tw + vi * 280;
    doc.rect(vx, ry, 280, 72).fill(bg);
    const vc = v === 'Yes' || v === '8 Programs' || v === 'Modern' || v === 'Days' || v === '$$' ? '#34c759' : v === 'No' || v === 'Dated' || v === 'Months' || v === '$$$$' ? '#ff3b30' : '#ff9500';
    const fc = vi === 0 ? '#34c759' : (v === 'No' || v === 'Dated' || v === 'Months' || v === '$$$$' ? '#ff3b30' : (v === 'Yes' ? '#34c759' : '#ff9500'));
    doc.font('Helvetica-Bold').fontSize(16).fillColor(fc).text(v, vx + 15, ry + 25, { width: 250, align: 'center' });
  });
});
slideNum(7, TOTAL);

// --- SLIDE 8: Market Opportunity ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('Market Opportunity');
const metrics = [
  { val: '$19.65B', label: 'US Healthcare Analytics\nMarket (2025)', sub: '24.9% CAGR to $59.68B by 2030' },
  { val: '33M+', label: 'Medicare Advantage\nEnrollees', sub: '8% enrollment CAGR through 2034' },
  { val: '$456.6B', label: 'Medicare Advantage\nMarket Size', sub: 'Growing to $758.5B by 2032' },
];
metrics.forEach((m, i) => {
  const mx = 120 + i * 580;
  doc.rect(mx, 200, 540, 200).fillAndStroke(LIGHT_BG, LIGHT_BG);
  doc.font('Helvetica-Bold').fontSize(52).fillColor(BLUE).text(m.val, mx + 40, 220, { width: 460 });
  doc.font('Helvetica-Bold').fontSize(20).fillColor(DARK).text(m.label, mx + 40, 290, { width: 460 });
  doc.font('Helvetica').fontSize(16).fillColor(GRAY).text(m.sub, mx + 40, 350, { width: 460 });
});
// TAM SAM SOM
doc.font('Helvetica-Bold').fontSize(28).fillColor(DARK).text('Addressable Market', 120, 470);
const tams = [
  { label: 'TAM', val: '~15,000', desc: 'managed care practices in the US' },
  { label: 'SAM', val: '~5,000', desc: 'practices with 1,000+ MA patients' },
  { label: 'SOM', val: '500', desc: 'practices in Year 3 = $60M ARR' },
];
tams.forEach((t, i) => {
  const ty = 530 + i * 90;
  doc.font('Helvetica-Bold').fontSize(24).fillColor(BLUE).text(t.label, 160, ty, { width: 100 });
  doc.font('Helvetica-Bold').fontSize(24).fillColor(DARK).text(t.val, 300, ty, { width: 200 });
  doc.font('Helvetica').fontSize(20).fillColor(GRAY).text(t.desc, 550, ty, { width: 600 });
});
slideNum(8, TOTAL);

// --- SLIDE 9: Business Model ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('Business Model');
subheading('SaaS subscription priced per practice, tiered by patient volume', 140);
const tiers = [
  { name: 'Starter', patients: '1,000 - 5,000', price: '$2,000/mo', impl: '$5,000' },
  { name: 'Growth', patients: '5,000 - 20,000', price: '$5,000/mo', impl: '$10,000' },
  { name: 'Enterprise', patients: '20,000+', price: '$10,000+/mo', impl: '$25,000' },
];
tiers.forEach((t, i) => {
  const tx = 120 + i * 580;
  doc.rect(tx, 250, 540, 340).fillAndStroke(WHITE, '#e0e0e0');
  doc.rect(tx, 250, 540, 6).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(32).fillColor(DARK).text(t.name, tx + 40, 290, { width: 460 });
  doc.font('Helvetica').fontSize(20).fillColor(GRAY).text(t.patients + ' patients', tx + 40, 340, { width: 460 });
  doc.font('Helvetica-Bold').fontSize(44).fillColor(BLUE).text(t.price, tx + 40, 400, { width: 460 });
  doc.font('Helvetica').fontSize(18).fillColor(GRAY).text('Implementation: ' + t.impl, tx + 40, 470, { width: 460 });
});
// Key metrics
const bm = [
  { val: '90%+', label: 'Gross Margins' },
  { val: '130%+', label: 'Net Revenue Retention' },
  { val: '~$500/mo', label: 'AI Infrastructure Cost' },
];
bm.forEach((b, i) => {
  const bx = 120 + i * 580;
  doc.font('Helvetica-Bold').fontSize(36).fillColor(BLUE).text(b.val, bx, 680);
  doc.font('Helvetica').fontSize(18).fillColor(GRAY).text(b.label, bx, 730);
});
slideNum(9, TOTAL);

// --- SLIDE 10: Traction ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('Traction & Validation');
const tractions = [
  'Working product with 20+ functional analytics pages',
  'Live demo at kosiq.ai with comprehensive data',
  'AI chat assistant powered by Claude for natural language patient queries',
  'Dr. J.D. Suarez (CMO) actively manages 40,000+ patients — product designed from his workflows',
  '8 clinical alert programs designed by practicing CMO from real-world needs',
  'Architecture validated against Nuvia Medical, the incumbent used by Dr. J.D.\'s practice',
  'Full role-based access control, audit logging, and HIPAA-ready security model',
];
tractions.forEach((t, i) => { bullet(t, 120, 200 + i * 70); });
doc.rect(120, 750, 1680, 4).fill(LIGHT_BG);
doc.font('Helvetica-Bold').fontSize(24).fillColor(BLUE).text('kosiq.ai', 120, 790);
doc.font('Helvetica').fontSize(20).fillColor(GRAY).text('   —   See the live product demo', 280, 792);
slideNum(10, TOTAL);

// --- SLIDE 11: Dr. J.D. ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('Clinical Advisory');
doc.font('Helvetica-Bold').fontSize(36).fillColor(DARK).text('Dr. J.D. Suarez, CMO', 120, 200);
doc.font('Helvetica').fontSize(22).fillColor(GRAY).text('Chief Medical Officer  |  Healthcare Group, South Florida', 120, 250);
const jd = [
  'CMO of managed care healthcare group in South Florida',
  'Manages Medicare Advantage, Medicaid, and Commercial populations',
  '40,000+ patients under management across multiple payers',
  'Designed all 8 clinical alert programs from real-world clinical practice',
  'Domain expert ensuring clinical accuracy, regulatory compliance, and relevance',
  'Decades of experience in managed care economics and value-based care',
];
jd.forEach((j, i) => { bullet(j, 120, 330 + i * 60); });
doc.rect(120, 720, 1200, 120).fillAndStroke(LIGHT_BG, LIGHT_BG);
doc.font('Helvetica-BoldOblique').fontSize(24).fillColor(DARK).text('"Current tools show me what happened. KOSIQ tells me what to do about it."', 160, 755, { width: 1120 });
doc.font('Helvetica').fontSize(18).fillColor(GRAY).text('— Dr. J.D. Suarez', 160, 810);
slideNum(11, TOTAL);

// --- SLIDE 12: Go-To-Market ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('Go-To-Market Strategy');
const phases = [
  { phase: 'Phase 1', time: 'Q1-Q2 2026', title: 'Beta Launch', items: ['3-5 South Florida practices', "Through Dr. J.D.'s network", 'Validate product-market fit'] },
  { phase: 'Phase 2', time: 'Q3-Q4 2026', title: 'Florida Expansion', items: ['Target 1,200+ FL managed care practices', 'Hire first sales rep', 'Conference presence (HIMSS, AHIP)'] },
  { phase: 'Phase 3', time: '2027', title: 'National Scale', items: ['Top MA markets: FL, CA, TX, NY, PA', 'Channel partnerships', 'Enterprise tier launch'] },
];
phases.forEach((p, i) => {
  const px = 120 + i * 580;
  doc.rect(px, 200, 540, 420).fillAndStroke(WHITE, '#e0e0e0');
  doc.rect(px, 200, 540, 70).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(WHITE).text(`${p.phase}  |  ${p.time}`, px + 30, 220, { width: 480 });
  doc.font('Helvetica-Bold').fontSize(26).fillColor(DARK).text(p.title, px + 30, 300, { width: 480 });
  p.items.forEach((item, j) => {
    doc.font('Helvetica').fontSize(20).fillColor(GRAY).text(`•  ${item}`, px + 30, 360 + j * 50, { width: 480 });
  });
});
slideNum(12, TOTAL);

// --- SLIDE 13: Technology ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('Technology & Security');
const tech = [
  ['HIPAA-Ready Architecture', 'AWS with Business Associate Agreement, encryption at rest and in transit'],
  ['AI Engine', 'Claude (Anthropic) via AWS Bedrock for full HIPAA compliance'],
  ['Modern Stack', 'Next.js, TypeScript, PostgreSQL, Prisma ORM'],
  ['SOC 2 Type II', 'Certification roadmap for enterprise customers'],
  ['Access Control', 'Role-based permissions, full audit logging, 30-minute session timeouts'],
  ['Data Ingestion', 'Payer-agnostic — accepts any claims format, AI normalizes automatically'],
];
tech.forEach((t, i) => {
  const ty = 180 + i * 110;
  doc.rect(120, ty, 6, 80).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(DARK).text(t[0], 150, ty + 10, { width: 600 });
  doc.font('Helvetica').fontSize(18).fillColor(GRAY).text(t[1], 150, ty + 45, { width: 1600 });
});
slideNum(13, TOTAL);

// --- SLIDE 14: Financial Projections ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('Financial Projections');
const years = [
  { year: 'Year 1', practices: '10', arr: '$720K', bar: 120 },
  { year: 'Year 2', practices: '75', arr: '$5.4M', bar: 450 },
  { year: 'Year 3', practices: '500', arr: '$60M', bar: 700 },
];
years.forEach((y, i) => {
  const yx = 200 + i * 550;
  // Bar
  doc.rect(yx, 650 - y.bar, 300, y.bar).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(36).fillColor(DARK).text(y.arr, yx, 660, { width: 300, align: 'center' });
  doc.font('Helvetica').fontSize(18).fillColor(GRAY).text(`${y.practices} practices`, yx, 710, { width: 300, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(22).fillColor(DARK).text(y.year, yx, 750, { width: 300, align: 'center' });
});
// Key metrics
const fm = [
  { val: '90%+', label: 'Gross Margin' },
  { val: '<6 months', label: 'CAC Payback' },
  { val: '10:1+', label: 'LTV:CAC Target' },
];
fm.forEach((f, i) => {
  const fx = 120 + i * 600;
  doc.font('Helvetica-Bold').fontSize(32).fillColor(BLUE).text(f.val, fx, 850);
  doc.font('Helvetica').fontSize(18).fillColor(GRAY).text(f.label, fx, 895);
});
slideNum(14, TOTAL);

// --- SLIDE 15: The Ask ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
heading('The Ask');
doc.font('Helvetica-Bold').fontSize(64).fillColor(BLUE).text('$2M Seed Round', 120, 200);
subheading('Use of Funds', 310);
const funds = [
  { pct: '50%', label: 'Engineering', desc: 'Expand team, HIPAA hardening, enterprise features' },
  { pct: '30%', label: 'Sales & Marketing', desc: '2 sales reps, conference presence, content marketing' },
  { pct: '20%', label: 'Operations', desc: 'AWS infrastructure, SOC 2 audit, legal/compliance' },
];
funds.forEach((f, i) => {
  const fy = 380 + i * 120;
  doc.rect(120, fy, 80, 80).fillAndStroke(BLUE, BLUE);
  doc.font('Helvetica-Bold').fontSize(24).fillColor(WHITE).text(f.pct, 125, fy + 25, { width: 70, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(24).fillColor(DARK).text(f.label, 230, fy + 10, { width: 400 });
  doc.font('Helvetica').fontSize(18).fillColor(GRAY).text(f.desc, 230, fy + 45, { width: 800 });
});
doc.font('Helvetica-Bold').fontSize(28).fillColor(DARK).text('18-Month Milestones', 120, 780);
const milestones = ['25 paying customers', '$1.5M ARR', 'SOC 2 Type II certification'];
milestones.forEach((m, i) => {
  doc.font('Helvetica-Bold').fontSize(22).fillColor(BLUE).text(`${i + 1}.`, 120 + i * 550, 840);
  doc.font('Helvetica').fontSize(22).fillColor(DARK).text(m, 160 + i * 550, 840);
});
slideNum(15, TOTAL);

// --- SLIDE 16: Thank You ---
doc.addPage({ size: [1920, 1080], margin: 0 });
doc.rect(0, 0, 1920, 1080).fill(WHITE);
logo(760, 280, 96);
doc.font('Helvetica').fontSize(28).fillColor(GRAY).text('The future of managed care intelligence', 0, 410, { width: 1920, align: 'center' });
doc.rect(860, 470, 200, 4).fill(BLUE);
doc.font('Helvetica-Bold').fontSize(22).fillColor(DARK).text('David Suarez, CEO', 0, 530, { width: 1920, align: 'center' });
doc.font('Helvetica').fontSize(18).fillColor(GRAY).text('suarey@gmail.com', 0, 565, { width: 1920, align: 'center' });
doc.font('Helvetica-Bold').fontSize(22).fillColor(DARK).text('Dr. J.D. Suarez, CMO', 0, 620, { width: 1920, align: 'center' });
doc.font('Helvetica').fontSize(18).fillColor(GRAY).text('drjdsuarez@gmail.com', 0, 655, { width: 1920, align: 'center' });
doc.font('Helvetica-Bold').fontSize(24).fillColor(BLUE).text('Live Demo: kosiq.ai', 0, 730, { width: 1920, align: 'center' });
slideNum(16, TOTAL);

doc.end();
console.log('PDF generated: public/KOSIQ-Investor-Pitch-2026.pdf');
