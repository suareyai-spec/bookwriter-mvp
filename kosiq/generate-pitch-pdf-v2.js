const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: [1920, 1080], margin: 0 });
doc.pipe(fs.createWriteStream('KOSIQ-Investor-Pitch-2026.pdf'));

const W = 1920, H = 1080;
const BLUE = '#26acf7', DARK = '#0a0a0f', WHITE = '#ffffff';
const TEXT = '#1d1d1f', GRAY = '#86868b';
const GREEN = '#10b981', ORANGE = '#f97316', LIGHT_ORANGE = '#fff7ed';
const LM = 120;

// ─── Helpers ───

function footer(num, dark = false) {
  doc.font('Helvetica').fontSize(14).fillColor(dark ? '#555555' : GRAY);
  doc.text(`KOSIQ  ·  Confidential  ·  ${num}`, 0, H - 40, { width: W, align: 'center' });
}

function drawLogo(x, y, size, dark) {
  doc.font('Helvetica-Bold').fontSize(size);
  const kosW = doc.widthOfString('KOS');
  const iqW = doc.widthOfString('IQ');
  const totalW = kosW + iqW;
  const lx = x - totalW / 2;
  doc.fillColor(dark ? WHITE : '#231f20').text('KOS', lx, y, { continued: true, lineBreak: false });
  doc.fillColor(BLUE).text('IQ', { lineBreak: false });
}

function drawLogoAt(cx, y, size, onDark) {
  doc.font('Helvetica-Bold').fontSize(size);
  const kosW = doc.widthOfString('KOS');
  const iqW = doc.widthOfString('IQ');
  const lx = cx - (kosW + iqW) / 2;
  doc.fillColor(onDark ? WHITE : '#231f20').text('KOS', lx, y, { continued: true, lineBreak: false });
  doc.fillColor(BLUE).text('IQ');
}

function darkBg() { doc.rect(0, 0, W, H).fill(DARK); }
function lightBg() { doc.rect(0, 0, W, H).fill(WHITE); }

function blueHeaderBar(y, h) {
  doc.rect(0, y, W, h || 6).fill(BLUE);
}

function darkFooterBar(y, text) {
  doc.rect(0, y, W, H - y).fill('#111118');
  doc.font('Helvetica-Oblique').fontSize(16).fillColor('#aaaaaa');
  doc.text(text, LM, y + 20, { width: W - LM * 2, align: 'center' });
}

function orangeIcon(cx, cy, r, drawInner) {
  doc.circle(cx, cy, r).fill(ORANGE);
  doc.save();
  if (drawInner) drawInner(cx, cy, r);
  doc.restore();
}

// Simple geometric icon drawers (white strokes inside orange circles)
function iconGrid(cx, cy, r) {
  const s = r * 0.5;
  doc.save().strokeColor(WHITE).lineWidth(2);
  doc.rect(cx - s, cy - s, s * 2, s * 2).stroke();
  doc.moveTo(cx, cy - s).lineTo(cx, cy + s).stroke();
  doc.moveTo(cx - s, cy).lineTo(cx + s, cy).stroke();
  doc.restore();
}

function iconChart(cx, cy) {
  doc.save().fillColor(WHITE);
  doc.rect(cx - 10, cy - 2, 6, 14).fill();
  doc.rect(cx - 2, cy - 10, 6, 22).fill();
  doc.rect(cx + 6, cy - 6, 6, 18).fill();
  doc.restore();
}

function iconPerson(cx, cy) {
  doc.save().fillColor(WHITE);
  doc.circle(cx, cy - 8, 6).fill();
  doc.moveTo(cx - 10, cy + 12).lineTo(cx, cy).lineTo(cx + 10, cy + 12).closePath().fill();
  doc.restore();
}

function iconShield(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2.5);
  doc.moveTo(cx, cy - 14).lineTo(cx + 12, cy - 8).lineTo(cx + 10, cy + 6).lineTo(cx, cy + 14).lineTo(cx - 10, cy + 6).lineTo(cx - 12, cy - 8).closePath().stroke();
  doc.restore();
}

function iconGlobe(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2);
  doc.circle(cx, cy, 12).stroke();
  doc.moveTo(cx - 12, cy).lineTo(cx + 12, cy).stroke();
  doc.moveTo(cx, cy - 12).lineTo(cx, cy + 12).stroke();
  doc.restore();
}

function iconGear(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2);
  doc.circle(cx, cy, 7).stroke();
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i;
    doc.moveTo(cx + Math.cos(a) * 9, cy + Math.sin(a) * 9)
       .lineTo(cx + Math.cos(a) * 14, cy + Math.sin(a) * 14).stroke();
  }
  doc.restore();
}

function iconArrows(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2.5);
  doc.moveTo(cx - 12, cy).lineTo(cx + 12, cy).stroke();
  doc.moveTo(cx + 8, cy - 5).lineTo(cx + 12, cy).lineTo(cx + 8, cy + 5).stroke();
  doc.moveTo(cx, cy - 12).lineTo(cx, cy + 12).stroke();
  doc.moveTo(cx - 5, cy + 8).lineTo(cx, cy + 12).lineTo(cx + 5, cy + 8).stroke();
  doc.restore();
}

function iconLightbulb(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2);
  doc.circle(cx, cy - 4, 10).stroke();
  doc.rect(cx - 5, cy + 6, 10, 6).stroke();
  doc.restore();
}

function iconLink(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2.5);
  doc.moveTo(cx - 6, cy - 6).lineTo(cx + 6, cy + 6).stroke();
  doc.circle(cx - 8, cy - 8, 5).stroke();
  doc.circle(cx + 8, cy + 8, 5).stroke();
  doc.restore();
}

function iconCheckmark(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(3);
  doc.moveTo(cx - 8, cy).lineTo(cx - 2, cy + 8).lineTo(cx + 10, cy - 6).stroke();
  doc.restore();
}

function iconTarget(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2);
  doc.circle(cx, cy, 12).stroke();
  doc.circle(cx, cy, 6).stroke();
  doc.circle(cx, cy, 2).fill(WHITE);
  doc.restore();
}

function iconLock(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2);
  doc.rect(cx - 8, cy - 2, 16, 12).stroke();
  doc.moveTo(cx - 5, cy - 2).lineTo(cx - 5, cy - 8).bezierCurveTo(cx - 5, cy - 14, cx + 5, cy - 14, cx + 5, cy - 8).lineTo(cx + 5, cy - 2).stroke();
  doc.restore();
}

function iconRocket(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2);
  doc.moveTo(cx, cy - 14).lineTo(cx + 8, cy + 6).lineTo(cx - 8, cy + 6).closePath().stroke();
  doc.moveTo(cx - 5, cy + 6).lineTo(cx - 8, cy + 12).stroke();
  doc.moveTo(cx + 5, cy + 6).lineTo(cx + 8, cy + 12).stroke();
  doc.restore();
}

function iconDollar(cx, cy) {
  doc.save().fillColor(WHITE).font('Helvetica-Bold').fontSize(22);
  doc.text('$', cx - 7, cy - 12);
  doc.restore();
}

function iconBrain(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2);
  doc.circle(cx - 5, cy - 3, 8).stroke();
  doc.circle(cx + 5, cy - 3, 8).stroke();
  doc.moveTo(cx, cy - 11).lineTo(cx, cy + 12).stroke();
  doc.restore();
}

function iconDatabase(cx, cy) {
  doc.save().strokeColor(WHITE).lineWidth(2);
  doc.ellipse(cx, cy - 8, 12, 5).stroke();
  doc.moveTo(cx - 12, cy - 8).lineTo(cx - 12, cy + 8).stroke();
  doc.moveTo(cx + 12, cy - 8).lineTo(cx + 12, cy + 8).stroke();
  doc.ellipse(cx, cy + 8, 12, 5).stroke();
  doc.restore();
}

const iconFns = [iconGrid, iconChart, iconPerson, iconShield, iconGlobe, iconGear, iconArrows, iconLightbulb, iconLink, iconCheckmark, iconTarget, iconLock, iconRocket, iconDollar, iconBrain, iconDatabase];

function drawCardGrid(cards, startX, startY, cols, cardW, cardH, iconFnList) {
  const gapX = 40, gapY = 30;
  cards.forEach((card, i) => {
    const col = i % cols, row = Math.floor(i / cols);
    const cx = startX + col * (cardW + gapX);
    const cy = startY + row * (cardH + gapY);
    // Card bg
    doc.save().roundedRect(cx, cy, cardW, cardH, 12).fill(LIGHT_ORANGE);
    doc.restore();
    // Icon
    const iconFn = iconFnList[i % iconFnList.length];
    orangeIcon(cx + 36, cy + 36, 24, iconFn);
    // Title
    doc.font('Helvetica-Bold').fontSize(16).fillColor(TEXT);
    doc.text(card[0], cx + 72, cy + 18, { width: cardW - 88 });
    // Desc
    doc.font('Helvetica').fontSize(13).fillColor(GRAY);
    doc.text(card[1], cx + 72, cy + 42, { width: cardW - 88 });
  });
}

function drawGridLines(x, y, w, h, count, color = '#e5e5e5') {
  doc.save().strokeColor(color).lineWidth(0.5);
  for (let i = 0; i <= count; i++) {
    const ly = y + (h / count) * i;
    doc.moveTo(x, ly).lineTo(x + w, ly).stroke();
  }
  doc.restore();
}

// ═══════════════════════════════════════
// SLIDE 1 — TITLE (Dark)
// ═══════════════════════════════════════
darkBg();

// Subtle gradient band
const grad = doc.linearGradient(0, H * 0.6, W, H * 0.6);
grad.stop(0, DARK).stop(0.5, '#0d1a2a').stop(1, DARK);
doc.rect(0, H * 0.35, W, H * 0.3).fill(grad);

doc.rect(W / 2 - 80, 300, 160, 2).fill(BLUE);

drawLogoAt(W / 2, 330, 96, true);

doc.font('Helvetica-Bold').fontSize(34).fillColor('#cccccc');
doc.text('The Operating System for Value-Based Care', 0, 460, { width: W, align: 'center' });

doc.font('Helvetica').fontSize(20).fillColor('#888888');
doc.text('16 integrated products powering clinical operations, population health,\nmedical economics, and compliance — from a single AI-native platform.', 0, 520, { width: W, align: 'center' });

doc.font('Helvetica').fontSize(18).fillColor(GRAY);
doc.text('Investor Presentation · 2026', 0, H - 110, { width: W, align: 'center' });
doc.font('Helvetica').fontSize(16).fillColor(BLUE);
doc.text('kosiq.ai', 0, H - 80, { width: W, align: 'center' });
footer(1, true);

// ═══════════════════════════════════════
// SLIDE 2 — THE PROBLEM (Light)
// ═══════════════════════════════════════
doc.addPage(); lightBg();
blueHeaderBar(0, 8);

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('The Problem: Value-Based Care Is Growing — Execution Is Broken', LM, 50, { width: W - LM * 2 });

doc.font('Helvetica-Oblique').fontSize(18).fillColor(GRAY);
doc.text('"Without appropriate data analytics, you don\'t have a value-based care company. Value-based care depends on data — clean data, accurate data, and real-time data available within minutes."', LM, 120, { width: W - LM * 2 });

const painCards = [
  ['Fragmented Systems & Siloed Data', 'Providers struggle with operating across disconnected systems and disparate data sources.'],
  ['Analytics Fail to Drive Action', 'Current analytics tools provide reports but do not translate into actionable insights or behavioral changes.'],
  ['Missed Risk Adjustment & Quality Opportunities', 'Opportunities to optimize risk adjustments and improve quality metrics are frequently overlooked.'],
  ['Increasing Administrative Burden', 'The administrative workload continues to grow, impacting efficiency and resources.']
];

const pcW = (W - LM * 2 - 50) / 2, pcH = 140;
painCards.forEach((card, i) => {
  const col = i % 2, row = Math.floor(i / 2);
  const cx = LM + col * (pcW + 50);
  const cy = 220 + row * (pcH + 30);
  doc.save().roundedRect(cx, cy, pcW, pcH, 10).fill('#f8f9fb').restore();
  orangeIcon(cx + 36, cy + 36, 24, iconFns[i]);
  doc.font('Helvetica-Bold').fontSize(17).fillColor(TEXT).text(card[0], cx + 72, cy + 16, { width: pcW - 88 });
  doc.font('Helvetica').fontSize(14).fillColor(GRAY).text(card[1], cx + 72, cy + 42, { width: pcW - 88 });
});

darkFooterBar(H - 80, 'The healthcare industry\'s challenge is not a lack of data, but a failure in execution.');
footer(2);

// ═══════════════════════════════════════
// SLIDE 3 — MARKET TIMING (Dark)
// ═══════════════════════════════════════
doc.addPage(); darkBg();

doc.font('Helvetica-Bold').fontSize(40).fillColor(WHITE);
doc.text('Market Timing: The Macro Shift', LM, 60, { width: W - LM * 2 });
doc.font('Helvetica').fontSize(22).fillColor('#888888');
doc.text('Structural and Inevitable', LM, 115);

const timingCards = [
  ['Expansion of Managed Care', 'Medicare Advantage enrollment has surpassed 33 million lives. Medicaid managed care now covers over 70% of beneficiaries. This structural shift creates massive demand for operational platforms.'],
  ['Regulatory Pressure', 'CMS quality programs, HEDIS reporting mandates, and state-level accountability standards are tightening. Regulators and payers demand measurable outcomes with financial penalties for non-compliance.'],
  ['Provider Risk Contracts', 'Healthcare providers are assuming full financial risk tied to patient outcomes. Capitated and shared-savings models now represent over $1 trillion in annual healthcare spending.'],
  ['Demand for Operational Intelligence', 'Legacy reporting tells you what happened last quarter. Providers need real-time, actionable intelligence that drives decisions at the point of care — not retrospective dashboards.']
];

const tcW = (W - LM * 2 - 120) / 4;
timingCards.forEach((card, i) => {
  const cx = LM + i * (tcW + 40);
  const cy = 200;
  orangeIcon(cx + tcW / 2, cy, 32, iconFns[i + 4]);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(WHITE).text(card[0], cx, cy + 50, { width: tcW, align: 'center' });
  doc.font('Helvetica').fontSize(13).fillColor('#aaaaaa').text(card[1], cx, cy + 90, { width: tcW, align: 'center' });
});

// Bottom blue bar
doc.rect(0, H - 100, W, 60).fill(BLUE);
doc.font('Helvetica').fontSize(16).fillColor(WHITE);
doc.text('Billions in value-based contracts hinge on operationalizing data for real-time decisions. Successful execution will lead to market share consolidation.', LM, H - 88, { width: W - LM * 2, align: 'center' });
footer(3, true);

// ═══════════════════════════════════════
// SLIDE 4 — THE SOLUTION (Dark top, light bottom)
// ═══════════════════════════════════════
doc.addPage();
doc.rect(0, 0, W, H * 0.45).fill(DARK);
doc.rect(0, H * 0.45, W, H * 0.55).fill(WHITE);

doc.font('Helvetica-Bold').fontSize(38).fillColor(WHITE);
doc.text('Financial Performance Happens in Workflow, Not Dashboards', LM, 60, { width: W - LM * 2 });
doc.font('Helvetica').fontSize(20).fillColor('#888888');
doc.text('The Missing Layer in Healthcare Technology is Execution Infrastructure', LM, 130);

const solPillars = [
  ['Real-time Action', 'Surface the right intervention at the right moment. KOSIQ delivers clinical and financial alerts directly into provider workflows — flagging high-risk patients, missed quality gaps, and cost optimization opportunities before they become write-offs.'],
  ['Alignment', 'Bridge the gap between clinical and financial decision-making. When a physician sees a patient, they see both the clinical picture and the financial implications — risk scores, care gaps, utilization patterns — unified in a single view.'],
  ['Behavior Change', 'Technology alone doesn\'t improve outcomes — workflow design does. KOSIQ embeds intelligence into daily routines, nudging behavior changes that compound into millions in savings and measurably better patient outcomes.']
];

const spW = (W - LM * 2 - 80) / 3;
solPillars.forEach(([title, desc], i) => {
  const cx = LM + i * (spW + 40);
  const cy = H * 0.45 + 40;
  doc.save().roundedRect(cx, cy, spW, 300, 12).fill(LIGHT_ORANGE).restore();
  orangeIcon(cx + spW / 2, cy + 40, 28, iconFns[i + 6]);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text(title, cx + 20, cy + 80, { width: spW - 40, align: 'center' });
  doc.font('Helvetica').fontSize(15).fillColor(GRAY).text(desc, cx + 20, cy + 115, { width: spW - 40, align: 'center' });
});

darkFooterBar(H - 70, 'Existing solutions are heavily focused on analytics. True value-based success requires integrated workflow design and execution infrastructure.');
footer(4);

// ═══════════════════════════════════════
// SLIDE 5 — WHAT IS KOSIQ (Split layout)
// ═══════════════════════════════════════
doc.addPage();
doc.rect(0, 0, W * 0.55, H).fill(WHITE);
doc.rect(W * 0.55, 0, W * 0.45, H).fill(DARK);

// Left side
doc.font('Helvetica-Bold').fontSize(14).fillColor(BLUE);
doc.text('KosIQ Overview', LM, 80);
doc.font('Helvetica-Bold').fontSize(40).fillColor(TEXT);
doc.text('What is KosIQ?', LM, 120, { width: W * 0.55 - LM - 60 });
doc.font('Helvetica').fontSize(18).fillColor(GRAY);
doc.text('KosIQ is an AI-native platform with 16 integrated products designed to operationalize value-based care. CoreIQ EMR serves as the clinical backbone, while Patient 360 provides a unified cross-product view of every patient. It serves as the operating system for integrated healthcare delivery by:', LM, 200, { width: W * 0.55 - LM - 60 });

const bullets5 = [
  'Combining clinical and claims data in real-time — ingesting data from EHRs, payers, labs, and pharmacies into a single unified view',
  'Delivering actionable insights directly into provider workflows — not in a separate dashboard, but embedded where decisions are made',
  'Aligning population health, medical economics, and care delivery — connecting clinical quality with financial performance in every workflow',
  'Identifying high-risk patients before costly events — predictive models flag members likely to incur avoidable ER visits, readmissions, or gaps in care',
  'Automating quality reporting and compliance — HEDIS, risk adjustment, and regulatory submissions generated continuously, not quarterly'
];
let by5 = 320;
bullets5.forEach(b => {
  doc.circle(LM + 8, by5 + 8, 4).fill(BLUE);
  doc.font('Helvetica').fontSize(17).fillColor(TEXT).text(b, LM + 24, by5, { width: W * 0.55 - LM - 80 });
  by5 += 45;
});

// Right side: brain-like network
const netCX = W * 0.55 + (W * 0.45) / 2, netCY = H / 2 - 40;
const nodes = [];
for (let i = 0; i < 8; i++) {
  const a = (Math.PI * 2 / 8) * i;
  nodes.push({ x: netCX + Math.cos(a) * 160, y: netCY + Math.sin(a) * 140 });
}
nodes.push({ x: netCX, y: netCY });
// Draw connections
doc.save().strokeColor(BLUE).lineWidth(1).opacity(0.4);
nodes.forEach((n, i) => {
  nodes.forEach((m, j) => {
    if (j > i && Math.random() > 0.3) {
      doc.moveTo(n.x, n.y).lineTo(m.x, m.y).stroke();
    }
  });
});
doc.restore();
// Draw nodes
nodes.forEach((n, i) => {
  const r = i === nodes.length - 1 ? 24 : 14;
  doc.circle(n.x, n.y, r).fill(i === nodes.length - 1 ? BLUE : ORANGE);
});
// Center label
doc.font('Helvetica-Bold').fontSize(13).fillColor(WHITE);
doc.text('KOSIQ', netCX - 24, netCY - 7, { width: 48, align: 'center' });

// Bottom bar
doc.rect(0, H - 70, W, 70).fill('#111118');
doc.font('Helvetica-Oblique').fontSize(15).fillColor('#aaaaaa');
doc.text('KosIQ enables organizations to improve outcomes, reduce cost, and drive predictable financial performance.', LM, H - 52, { width: W - LM * 2, align: 'center' });
footer(5);

// ═══════════════════════════════════════
// SLIDE 6 — EXECUTIVE SUMMARY (Light)
// ═══════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('Executive Summary', LM, 60);
doc.font('Helvetica').fontSize(20).fillColor(GRAY);
doc.text('KosIQ: Provider-Centric Platform for Risk-Bearing Organizations', LM, 110);

const execCards = [
  ['EHR-agnostic Bi-directional Integration', 'Seamless data flow between eCW, Epic, Cerner, athenahealth, and other EHR systems via FHIR/HL7. No vendor lock-in.'],
  ['Multi-Payer, Multi-Line-of-Business Support', 'Single platform for Medicare Advantage, Medicaid, ACA, and commercial lines. Manage all payer contracts in one view.'],
  ['Real-time Actionable Analytics', 'Predictive and prescriptive analytics that surface interventions at the point of care — not reports reviewed weeks later.'],
  ['NCQA DAV-Aligned Quality Intelligence', 'Quality metrics aligned with NCQA Data Aggregation and Validation standards. Continuous HEDIS gap closure tracking.'],
  ['Health Equity and SDOH Integration', 'Incorporates social determinants of health, ZIP-code level risk factors, and health equity metrics for holistic population management.'],
  ['Operational Alignment for VBC Programs', 'Workflow-native tools that align clinical, financial, and administrative teams around shared VBC goals and KPIs.']
];

const ecW = (W - LM * 2 - 40) / 3, ecH = 130;
execCards.forEach((card, i) => {
  const col = i % 3, row = Math.floor(i / 3);
  const cx = LM + col * (ecW + 20);
  const cy = 180 + row * (ecH + 25);
  doc.save().roundedRect(cx, cy, ecW, ecH, 10).fill(LIGHT_ORANGE).restore();
  orangeIcon(cx + 32, cy + 32, 22, iconFns[i]);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(TEXT).text(card[0], cx + 64, cy + 14, { width: ecW - 80 });
  doc.font('Helvetica').fontSize(13).fillColor(GRAY).text(card[1], cx + 64, cy + 38, { width: ecW - 80 });
});

doc.font('Helvetica-Bold').fontSize(20).fillColor(BLUE);
doc.text('Data becomes execution — not just reporting.', 0, H - 120, { width: W, align: 'center' });
footer(6);

// ═══════════════════════════════════════
// SLIDE 7 — 11-PRODUCT SHOWCASE (Light, blue header)
// ═══════════════════════════════════════
doc.addPage(); lightBg();
blueHeaderBar(0, 8);

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('The KOSIQ Platform', LM, 40);
doc.font('Helvetica').fontSize(20).fillColor(GRAY);
doc.text('16 Integrated Products — One Unified Operating System', LM, 86);

const products = [
  ['AtlasIQ', '#26acf7', 'Population health command center'],
  ['ClinIQ', '#8B5CF6', 'Clinical intelligence & decision trees'],
  ['CoreIQ', '#059669', 'Full EMR: scheduling, encounters, e-Rx, labs, billing'],
  ['ChartIQ', '#14B8A6', 'AI-powered chart summarization'],
  ['Risk Engine', '#F59E0B', 'HCC risk scoring & RAF optimization'],
  ['Quality', '#10B981', 'HEDIS measures & Star Ratings'],
  ['Care Management', '#EC4899', 'Care plans & chronic disease mgmt'],
  ['Cost Explorer', '#EF4444', 'Medical economics & utilization review'],
  ['RPM', '#06B6D4', 'Remote patient monitoring & alerts'],
  ['Behavioral Health', '#A855F7', 'Mental health screening & SDOH'],
  ['Payer Analytics', '#F97316', 'Real-time payer data & contract perf'],
  ['BridgeIQ', '#3B82F6', 'Interoperability hub (FHIR/HL7)'],
  ['FraudIQ', '#DC2626', 'Fraud/waste/abuse detection'],
  ['ClaimIQ', '#7C3AED', 'Claims processing & denial mgmt'],
  ['AuthIQ', '#0891B2', 'Prior auth automation & CMS compliance'],
  ['ComplianceIQ', '#065F46', 'HIPAA compliance & risk assessment'],
];

// Grid: 4 cols x 4 rows (16 items)
const prodCols = 4, prodGapX = 20, prodGapY = 14;
const prodW = (W - LM * 2 - prodGapX * (prodCols - 1)) / prodCols;
const prodH = 62;
const prodStartY = 130;
products.forEach(([name, color, desc], i) => {
  const col = i % prodCols, row = Math.floor(i / prodCols);
  const px = LM + col * (prodW + prodGapX);
  const py = prodStartY + row * (prodH + prodGapY);
  // Card
  doc.save().roundedRect(px, py, prodW, prodH, 10).fill('#f8f9fb').restore();
  // Color accent bar
  doc.rect(px, py, 6, prodH).fill(color);
  // Dot
  doc.circle(px + 28, py + prodH / 2, 8).fill(color);
  // Name
  doc.font('Helvetica-Bold').fontSize(16).fillColor(TEXT).text(name, px + 46, py + 14, { width: prodW - 56 });
  // Desc
  doc.font('Helvetica').fontSize(12).fillColor(GRAY).text(desc, px + 46, py + 36, { width: prodW - 56 });
});

// Bottom banner
doc.rect(LM, prodStartY + 4 * (prodH + prodGapY) + 16, W - LM * 2, 46).fill(BLUE);
doc.font('Helvetica-Bold').fontSize(15).fillColor(WHITE);
doc.text('Every product shares one database, one login, one patient record. Clients pick what they need — bundle or à la carte.', LM + 20, prodStartY + 4 * (prodH + prodGapY) + 28, { width: W - LM * 2 - 40, align: 'center' });

// AI callout
doc.font('Helvetica-Bold').fontSize(17).fillColor(TEXT);
doc.text('AI-Native Architecture  •  Patient 360 Cross-Product View  •  199 Clinical Note Templates', LM, prodStartY + 4 * (prodH + prodGapY) + 78);
doc.font('Helvetica').fontSize(14).fillColor(GRAY);
doc.text('Claude AI chat assistant on every page  •  AI clinical decision trees  •  Predictive + prescriptive analytics  •  CoreIQ EMR as clinical backbone', LM, prodStartY + 4 * (prodH + prodGapY) + 102, { width: W - LM * 2 });

footer(7);

// ═══════════════════════════════════════
// SLIDE 8 — PRODUCT DIFFERENTIATION (Light)
// ═══════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('Why KosIQ Wins: 5 Structural Advantages', LM, 50);

const diffCards2 = [
  ['Modular Add-On Model', '#26acf7', 'Clients pick exactly the products they need. Start with one, expand to sixteen. Bundle pricing rewards platform adoption — no bloatware, no shelfware.'],
  ['Full EMR Built In', '#059669', 'CoreIQ replaces legacy EMRs with 199 clinical templates, patient flow tracking, document management, and integrated prescribing. No separate EMR needed.'],
  ['Patient 360 View', '#10B981', 'Every patient\'s complete story across all 16 products on one screen. Claims, prescriptions, labs, risk scores, care plans — unified.'],
  ['AI-Native Architecture', '#F59E0B', 'Claude AI assistant on every page. AI clinical decision trees. Predictive and prescriptive analytics built into every workflow — not bolted on.'],
  ['ChartIQ: The Trojan Horse', '#14B8A6', 'AI chart summarization is the easy entry point into hospitals. Once inside, cross-sell the full 16-product platform. Low friction adoption, massive expansion potential.'],
];

const dcW2 = (W - LM * 2 - 80) / 3, dcH2 = 200;
diffCards2.forEach((card, i) => {
  const cols = i < 3 ? 3 : 2;
  const col = i < 3 ? i : i - 3;
  const row = i < 3 ? 0 : 1;
  const rowOffset = row === 1 ? (dcW2 + 40) / 2 : 0;
  const cx = LM + rowOffset + col * (dcW2 + 40);
  const cy = 120 + row * (dcH2 + 24);
  doc.save().roundedRect(cx, cy, dcW2, dcH2, 10).fill('#f8f9fb').restore();
  // Color accent top bar
  doc.rect(cx, cy, dcW2, 5).fill(card[1]);
  doc.font('Helvetica-Bold').fontSize(17).fillColor(TEXT).text(card[0], cx + 20, cy + 22, { width: dcW2 - 40 });
  doc.font('Helvetica').fontSize(13).fillColor(GRAY).text(card[2], cx + 20, cy + 50, { width: dcW2 - 40 });
});

doc.font('Helvetica-Bold').fontSize(20).fillColor(BLUE);
doc.text('16 products. One platform. Every workflow covered.', 0, H - 100, { width: W, align: 'center' });
footer(8);

// ═══════════════════════════════════════
// SLIDE 9 — PLATFORM ARCHITECTURE (Dark)
// ═══════════════════════════════════════
doc.addPage(); darkBg();

doc.font('Helvetica-Bold').fontSize(40).fillColor(WHITE);
doc.text('Platform Architecture', LM, 50);
doc.font('Helvetica').fontSize(22).fillColor('#888888');
doc.text('How 16 Products Become One Platform', LM, 105);

// Architecture layers (bottom-up)
const archLayers = [
  { label: 'Unified Data Layer', desc: 'Single database — Claims, Clinical, EHR, Labs, Rx, SDOH', color: '#333344', accent: BLUE },
  { label: 'AI & Analytics Engine', desc: 'Claude AI  •  Predictive Models  •  Risk Scoring  •  NLP', color: '#2a2a3a', accent: '#8B5CF6' },
  { label: 'Product Modules', desc: 'CoreIQ EMR  •  AtlasIQ  •  ClinIQ  •  ChartIQ  •  Risk Engine  •  Quality  •  Care Mgmt  •  RPM  •  BH  •  Cost  •  Payer  •  BridgeIQ  •  FraudIQ  •  ClaimIQ  •  AuthIQ  •  ComplianceIQ', color: '#222233', accent: ORANGE },
  { label: 'Access & Identity Layer', desc: 'SSO  •  Role-Based Access  •  Org Management  •  Product Switcher  •  Patient 360', color: '#1d1d2e', accent: GREEN },
  { label: 'User Experience', desc: 'Provider View  •  Payer View  •  Enterprise View  •  AI Chat on Every Page  •  Cross-Product Timeline  •  199 Note Templates', color: '#181828', accent: '#EC4899' },
];

const layerH = 90, layerGap = 12;
const layerStartY = 170;
const layerW = W - LM * 2;

archLayers.forEach(({ label, desc, color, accent }, i) => {
  const ly = layerStartY + i * (layerH + layerGap);
  doc.save().roundedRect(LM, ly, layerW, layerH, 8).fill(color).restore();
  // Accent left bar
  doc.rect(LM, ly, 6, layerH).fill(accent);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(WHITE).text(label, LM + 30, ly + 18, { width: layerW - 60 });
  doc.font('Helvetica').fontSize(15).fillColor('#aaaaaa').text(desc, LM + 30, ly + 48, { width: layerW - 60 });
});

// Connecting arrows
doc.save().strokeColor(BLUE).lineWidth(2).opacity(0.5);
for (let i = 0; i < archLayers.length - 1; i++) {
  const y1 = layerStartY + i * (layerH + layerGap) + layerH;
  const y2 = y1 + layerGap;
  doc.moveTo(W / 2, y1).lineTo(W / 2, y2).stroke();
}
doc.restore();

// Key callouts
const archCallY = layerStartY + archLayers.length * (layerH + layerGap) + 20;
const archCallouts = [
  ['Single Sign-On', 'One login for all 16 products'],
  ['Product Switcher', 'Navigate between modules instantly'],
  ['Org-Level Control', 'Admins configure per-org access'],
  ['Patient Drill-Down', 'Every metric links to patient list'],
];
const acW = (layerW - 60) / 4;
archCallouts.forEach(([title, desc], i) => {
  const ax = LM + i * (acW + 20);
  doc.font('Helvetica-Bold').fontSize(15).fillColor(BLUE).text(title, ax, archCallY, { width: acW });
  doc.font('Helvetica').fontSize(13).fillColor('#aaaaaa').text(desc, ax, archCallY + 22, { width: acW });
});

footer(9, true);

// ═══════════════════════════════════════
// SLIDE 9 — ECONOMIC FLYWHEEL (Dark)
// ═══════════════════════════════════════
doc.addPage(); darkBg();

doc.font('Helvetica-Bold').fontSize(40).fillColor(WHITE);
doc.text('Economic Flywheel', LM, 50);
doc.font('Helvetica').fontSize(22).fillColor('#888888');
doc.text('A Virtuous Growth Loop', LM, 105);

// Flywheel nodes in a circle
const fwNodes = [
  'Data\nIntegration',
  'Real-time\nInsights',
  'Performance\nImprovement',
  'Outcome\nOptimization',
  'Customer\nValue',
  'Growth &\nRetention'
];

const fwCX = W / 2, fwCY = H / 2 - 20, fwR = 250;
const fwPositions = fwNodes.map((_, i) => {
  const a = -Math.PI / 2 + (Math.PI * 2 / fwNodes.length) * i;
  return { x: fwCX + Math.cos(a) * fwR, y: fwCY + Math.sin(a) * fwR };
});

// Draw arrows between nodes
doc.save().strokeColor(BLUE).lineWidth(2.5);
fwPositions.forEach((p, i) => {
  const next = fwPositions[(i + 1) % fwPositions.length];
  const dx = next.x - p.x, dy = next.y - p.y;
  const len = Math.sqrt(dx * dx + dy * dy);
  const nx = dx / len, ny = dy / len;
  const sx = p.x + nx * 45, sy = p.y + ny * 45;
  const ex = next.x - nx * 45, ey = next.y - ny * 45;
  doc.moveTo(sx, sy).lineTo(ex, ey).stroke();
  // Arrowhead
  const ax = ex - nx * 10 + ny * 5, ay = ey - ny * 10 - nx * 5;
  const bx = ex - nx * 10 - ny * 5, by = ey - ny * 10 + nx * 5;
  doc.moveTo(ex, ey).lineTo(ax, ay).moveTo(ex, ey).lineTo(bx, by).stroke();
});
doc.restore();

// Draw nodes
fwPositions.forEach((p, i) => {
  orangeIcon(p.x, p.y, 36, iconFns[i]);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(WHITE);
  doc.text(fwNodes[i], p.x - 55, p.y + 42, { width: 110, align: 'center' });
});

doc.font('Helvetica-Oblique').fontSize(17).fillColor('#aaaaaa');
doc.text('Each cycle amplifies platform dependency and defensibility, creating a virtuous growth engine.', 0, H - 100, { width: W, align: 'center' });
footer(10, true);

// ═══════════════════════════════════════
// SLIDE 10 — BUSINESS MODEL (Light) — reuses chart code
// ═══════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('High-Margin Enterprise SaaS Business Model', LM, 50);

// Left column — Revenue math explained
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
doc.font('Helvetica-Bold').fontSize(16).fillColor(TEXT).text('PMPM Pricing Tiers', LM, 370);
const tiers = [['Core Analytics', '$0.50'], ['Advanced + Predictions', '$1.25'], ['Enterprise + Custom', '$2.24']];
let ty = 400;
tiers.forEach(([name, price]) => {
  doc.font('Helvetica').fontSize(15).fillColor(TEXT).text(name, LM, ty, { width: 300 });
  doc.font('Helvetica-Bold').fontSize(15).fillColor(BLUE).text(price, LM + 310, ty);
  ty += 30;
});

// Integration packages
doc.font('Helvetica-Bold').fontSize(16).fillColor(TEXT).text('Integration Packages', LM, ty + 15);
ty += 45;
const intPkgs = [['Standard EHR', '$10K'], ['Complex Multi-System', '$15K'], ['Enterprise Custom', '$20K']];
intPkgs.forEach(([name, price]) => {
  doc.font('Helvetica').fontSize(15).fillColor(TEXT).text(name, LM, ty, { width: 300 });
  doc.font('Helvetica-Bold').fontSize(15).fillColor(BLUE).text(price, LM + 310, ty);
  ty += 30;
});

// RIGHT SIDE: ARR Bar Chart (from existing script)
{
  const chartX = 680, chartY = 100;
  doc.rect(chartX, chartY - 6, W - chartX - LM, 4).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(TEXT);
  doc.text('Projected Annual Recurring Revenue', chartX, chartY + 10);

  const barData = [
    { label: 'Year 1', value: 1.74, display: '$1.74M' },
    { label: 'Year 2', value: 7.08, display: '$7.08M' },
    { label: 'Year 3', value: 18.6, display: '$18.6M+' },
  ];
  const maxVal = 20;
  const bX = chartX + 20, bY = chartY + 60, bW = 700, bH = 380;

  drawGridLines(bX, bY, bW, bH, 5);

  const barW = 160;
  const barGap = (bW - barData.length * barW) / (barData.length + 1);
  barData.forEach((d, i) => {
    const x = bX + barGap + i * (barW + barGap);
    const barHeight = (d.value / maxVal) * bH;
    const y = bY + bH - barHeight;

    doc.save().opacity(0.2);
    doc.rect(x - 4, y - 4, barW + 8, barHeight + 4).fill(BLUE);
    doc.restore();
    doc.rect(x, y, barW, barHeight).fill(BLUE);

    doc.font('Helvetica-Bold').fontSize(24).fillColor(WHITE);
    doc.text(d.display, x, y + barHeight / 2 - 14, { width: barW, align: 'center' });

    doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT);
    doc.text(d.label, x, bY + bH + 15, { width: barW, align: 'center' });
  });

  for (let i = 0; i <= 5; i++) {
    const val = Math.round((maxVal / 5) * (5 - i));
    doc.font('Helvetica').fontSize(13).fillColor(GRAY);
    doc.text(`$${val}M`, bX - 55, bY + (bH / 5) * i - 8, { width: 48, align: 'right' });
  }
}

// Revenue mix bar (from existing script)
{
  const mixY = 600;
  doc.rect(LM, mixY - 4, W - LM * 2, 3).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT);
  doc.text('Revenue Mix (Year 1)', LM, mixY + 10);

  const barY = mixY + 45;
  const maxW2 = W - LM * 2 - 40;
  const pmpmPct = 0.82, intPct2 = 0.18;

  doc.rect(LM, barY, maxW2 * pmpmPct, 44).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(16).fillColor(WHITE);
  doc.text('PMPM Revenue — 82%', LM + 20, barY + 12);

  doc.rect(LM + maxW2 * pmpmPct + 4, barY, maxW2 * intPct2 - 4, 44).fill(GREEN);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(WHITE);
  doc.text('Integration — 18%', LM + maxW2 * pmpmPct + 14, barY + 14);

  doc.font('Helvetica').fontSize(14).fillColor(GRAY);
  doc.text('Recurring SaaS revenue scales with lives under management', LM, barY + 55);
}

doc.font('Helvetica-Oblique').fontSize(14).fillColor(GRAY);
doc.text('All projections intentionally conservative — assumes slow ramp, modest deal sizes, zero viral/referral growth.', LM, H - 80, { width: W - LM * 2 });
footer(11);

// ═══════════════════════════════════════
// SLIDE 10B — UNIT ECONOMICS DEEP DIVE (Light)
// ═══════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('Unit Economics', LM, 50);
doc.font('Helvetica').fontSize(18).fillColor(GRAY);
doc.text('Per-member economics that improve at scale', LM, 95);

// Key metric cards row
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
  { label: 'Sales & Marketing', pct: 22, color: '#f97316' },
  { label: 'R&D', pct: 18, color: '#8b5cf6' },
  { label: 'G&A', pct: 8, color: '#6b7280' },
  { label: 'EBITDA (Year 2+)', pct: 40, color: '#059669' },
];
const mBarW = (W - LM * 2 - margins.length * 8) / margins.length;
margins.forEach((m, i) => {
  const mx = LM + i * (mBarW + 8);
  const mH = (m.pct / 100) * 350;
  const my = wfY + 400 - mH;
  doc.rect(mx, my, mBarW, mH).fill(m.color);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(WHITE);
  doc.text(`${m.pct}%`, mx, my + mH / 2 - 12, { width: mBarW, align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor(TEXT);
  doc.text(m.label, mx, wfY + 410, { width: mBarW, align: 'center' });
});

doc.font('Helvetica-Oblique').fontSize(14).fillColor(GRAY);
doc.text('88% gross margins are best-in-class for healthcare SaaS. No hardware, no physical infrastructure, no per-claim processing costs.', LM, H - 80, { width: W - LM * 2 });
footer('11b');

// ═══════════════════════════════════════
// SLIDE 10C — 5-YEAR FINANCIAL PROJECTIONS (Dark)
// ═══════════════════════════════════════
doc.addPage(); darkBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(WHITE);
doc.text('5-Year Financial Projections', LM, 50);
doc.font('Helvetica').fontSize(16).fillColor('#a1a1a6');
doc.text('Conservative base case — no viral growth, modest contract sizes', LM, 95);

// Assumptions bar
doc.save().roundedRect(LM, 125, W - LM * 2, 28, 6).fill('#1a1a2e').restore();
doc.font('Helvetica').fontSize(11).fillColor('#8888aa');
doc.text('ASSUMPTIONS:  Avg client = 15K-30K members  |  Avg PMPM declines with scale ($1.25→$0.75)  |  3 clients Year 1 → 42 clients Year 5  |  36-month avg contract  |  12% COGS  |  No churn assumed', LM + 12, 130, { width: W - LM * 2 - 24 });

// P&L Table
const plY = 150;
const plCols = ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
const plColW = (W - LM * 2) / plCols.length;
// Header
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

footer('11c', false);

// ═══════════════════════════════════════
// SLIDE 10D — TAM / SAM / SOM (Light)
// ═══════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('Total Addressable Market', LM, 50);
doc.font('Helvetica').fontSize(18).fillColor(GRAY);
doc.text('KOSIQ operates across multiple $30B+ healthcare markets simultaneously', LM, 95);

// Concentric circles for TAM/SAM/SOM
const tCx = 480, tCy = 500;
// TAM
doc.save().opacity(0.08); doc.circle(tCx, tCy, 340).fill(BLUE); doc.restore();
doc.circle(tCx, tCy, 340).strokeColor(BLUE).lineWidth(2).stroke();
doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE).text('TAM', tCx - 200, tCy - 320, { width: 400, align: 'center' });
doc.font('Helvetica-Bold').fontSize(48).fillColor(TEXT).text('$234B', tCx - 200, tCy - 295, { width: 400, align: 'center' });
doc.font('Helvetica').fontSize(13).fillColor(GRAY).text('EMR + RCM + Pop Health + VBC Analytics + Claims', tCx - 200, tCy - 248, { width: 400, align: 'center' });

// SAM
doc.save().opacity(0.12); doc.circle(tCx, tCy, 220).fill(BLUE); doc.restore();
doc.circle(tCx, tCy, 220).strokeColor(BLUE).lineWidth(2).stroke();
doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE).text('SAM', tCx - 150, tCy - 190, { width: 300, align: 'center' });
doc.font('Helvetica-Bold').fontSize(42).fillColor(TEXT).text('$48B', tCx - 150, tCy - 165, { width: 300, align: 'center' });
doc.font('Helvetica').fontSize(13).fillColor(GRAY).text('Managed Care Orgs + MA Plans\nneeding VBC operations platform', tCx - 150, tCy - 125, { width: 300, align: 'center' });

// SOM
doc.save().opacity(0.18); doc.circle(tCx, tCy, 110).fill(BLUE); doc.restore();
doc.circle(tCx, tCy, 110).strokeColor(BLUE).lineWidth(2).stroke();
doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE).text('SOM', tCx - 100, tCy - 60, { width: 200, align: 'center' });
doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT).text('$2.4B', tCx - 100, tCy - 35, { width: 200, align: 'center' });
doc.font('Helvetica').fontSize(12).fillColor(GRAY).text('SE US Managed Care\n20K-60K+ member groups', tCx - 100, tCy + 5, { width: 200, align: 'center' });

// Market breakdown on the right
const msX = 860;
doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT).text('Markets KOSIQ Addresses', msX, 150, { width: 500 });

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
doc.rect(msX, 178, 700, 2).fill(BLUE);
let mkY = 188;
// Header
doc.font('Helvetica-Bold').fontSize(11).fillColor(GRAY);
doc.text('Market', msX, mkY, { width: 260 });
doc.text('Size (2026)', msX + 270, mkY, { width: 100, align: 'right' });
doc.text('Growth', msX + 390, mkY, { width: 100, align: 'right' });
doc.text('Source', msX + 510, mkY, { width: 180 });
mkY += 22;

let totalMkt = 0;
mktBreakdown.forEach((m) => {
  const val = parseFloat(m[1].replace('$',''));
  totalMkt += val;
  doc.font('Helvetica').fontSize(12).fillColor(TEXT).text(m[0], msX, mkY, { width: 260 });
  doc.font('Helvetica-Bold').fontSize(12).fillColor(BLUE).text(m[1], msX + 270, mkY, { width: 100, align: 'right' });
  doc.font('Helvetica').fontSize(11).fillColor(GREEN).text(m[2], msX + 390, mkY, { width: 100, align: 'right' });
  doc.font('Helvetica-Oblique').fontSize(9).fillColor('#b0b0b0').text(m[3], msX + 510, mkY + 1, { width: 180 });
  mkY += 24;
});
doc.rect(msX, mkY, 500, 1).fill('#e0e0e0');
mkY += 8;
doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT).text('Combined TAM', msX, mkY, { width: 260 });
doc.font('Helvetica-Bold').fontSize(14).fillColor(BLUE).text(`$${totalMkt.toFixed(1)}B`, msX + 270, mkY, { width: 100, align: 'right' });

// Key insight box
mkY += 40;
doc.save().roundedRect(msX, mkY, 700, 70, 10).fill('#eef6ff').restore();
doc.roundedRect(msX, mkY, 700, 70, 10).strokeColor(BLUE).lineWidth(1).stroke();
doc.font('Helvetica-Bold').fontSize(13).fillColor(BLUE).text('WHY $234B AND NOT $53B:', msX + 15, mkY + 10, { width: 670 });
doc.font('Helvetica').fontSize(12).fillColor(TEXT).text('eClinicalWorks alone generates $700M+/yr from EMR + RCM. Epic is worth $50B+. KOSIQ replaces 8 separate vendor categories with one platform. The TAM is every dollar spent on fragmented healthcare operations software.', msX + 15, mkY + 28, { width: 670 });

// Florida callout
doc.save().roundedRect(msX, mkY + 85, 700, 60, 10).fill('#f0fdf4').restore();
doc.roundedRect(msX, mkY + 85, 700, 60, 10).strokeColor(GREEN).lineWidth(1).stroke();
doc.font('Helvetica-Bold').fontSize(22).fillColor(GREEN).text('5.2M', msX + 15, mkY + 95);
doc.font('Helvetica').fontSize(13).fillColor(TEXT).text('Medicare Advantage enrollees in Florida — the largest MA market in the US. KOSIQ starts here, then expands nationally.', msX + 85, mkY + 93, { width: 610 });

footer('11d');

// ═══════════════════════════════════════
// SLIDE 11 — MARKET OPPORTUNITY (Light) — reuses chart code
// ═══════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('Market Opportunity', LM, 50);
doc.font('Helvetica').fontSize(20).fillColor(GRAY);
doc.text('Leveraging Key Healthcare Trends', LM, 100);

const mktCards = [
  ['Population Health Management', 'Proactively managing health outcomes for defined patient groups.'],
  ['Medical Economics Optimization', 'Enhancing financial performance through efficient resource allocation.'],
  ['Value-Based Care Enablement', 'Facilitating the shift to outcomes-based reimbursement models.'],
  ['Target Addressable Market', 'Includes MSOs, ACOs, Risk-bearing Provider Groups, Integrated Health Systems, and Health Plans.']
];

const mkW = (W - LM * 2 - 60) / 4;
mktCards.forEach((card, i) => {
  const cx = LM + i * (mkW + 20);
  const cy = 150;
  doc.save().roundedRect(cx, cy, mkW, 140, 10).fill(LIGHT_ORANGE).restore();
  orangeIcon(cx + mkW / 2, cy + 30, 22, iconFns[i + 10]);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT).text(card[0], cx + 10, cy + 62, { width: mkW - 20, align: 'center' });
  doc.font('Helvetica').fontSize(12).fillColor(GRAY).text(card[1], cx + 10, cy + 88, { width: mkW - 20, align: 'center' });
});

// VBC Market Growth Curve (from existing script)
{
  const chartX = LM, chartY = 330, chartW = W - LM * 2;

  doc.rect(chartX, chartY - 4, chartW, 3).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT);
  doc.text('VBC Market Growth', chartX, chartY + 10);

  const gX = chartX + 80, gY = chartY + 50, gW = chartW - 120, gH = 350;
  drawGridLines(gX, gY, gW, gH, 5);

  const maxVal = 60;
  for (let i = 0; i <= 5; i++) {
    const val = Math.round((maxVal / 5) * (5 - i));
    doc.font('Helvetica').fontSize(14).fillColor(GRAY);
    doc.text(`$${val}B`, gX - 60, gY + (gH / 5) * i - 8, { width: 50, align: 'right' });
  }

  const dataPoints = [15, 18, 22, 27, 33, 42, 53];
  const years = ['2024', '2025', '2026', '2027', '2028', '2029', '2030'];

  doc.save().opacity(0.15);
  doc.moveTo(gX, gY + gH);
  dataPoints.forEach((val, i) => {
    const px = gX + (gW / (dataPoints.length - 1)) * i;
    const pyy = gY + gH - (val / maxVal) * gH;
    doc.lineTo(px, pyy);
  });
  doc.lineTo(gX + gW, gY + gH).closePath().fill(BLUE);
  doc.restore();

  doc.save().strokeColor(BLUE).lineWidth(4);
  dataPoints.forEach((val, i) => {
    const px = gX + (gW / (dataPoints.length - 1)) * i;
    const pyy = gY + gH - (val / maxVal) * gH;
    if (i === 0) doc.moveTo(px, pyy);
    else doc.lineTo(px, pyy);
  });
  doc.stroke().restore();

  dataPoints.forEach((val, i) => {
    const px = gX + (gW / (dataPoints.length - 1)) * i;
    const pyy = gY + gH - (val / maxVal) * gH;
    doc.circle(px, pyy, 6).fill(BLUE);
    doc.font('Helvetica-Bold').fontSize(16).fillColor(TEXT);
    doc.text(`$${val}B`, px - 30, pyy - 26, { width: 60, align: 'center' });
    doc.font('Helvetica').fontSize(14).fillColor(GRAY);
    doc.text(years[i], px - 30, gY + gH + 10, { width: 60, align: 'center' });
  });
}

doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE);
doc.text('This convergence presents a multi-billion dollar infrastructure opportunity for innovative solutions like KosIQ.', 0, H - 80, { width: W, align: 'center' });
footer(12);

// ═══════════════════════════════════════
// SLIDE 12 — COMPETITIVE POSITIONING (Light top, dark bottom)
// ═══════════════════════════════════════
doc.addPage();
doc.rect(0, 0, W, H * 0.42).fill(WHITE);
doc.rect(0, H * 0.42, W, H * 0.58).fill(DARK);

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('Competitive Positioning', LM, 40);
doc.font('Helvetica').fontSize(20).fillColor(GRAY);
doc.text('Traditional Solutions vs. KosIQ', LM, 85);

// Two-column comparison
const compW = (W - LM * 2 - 80) / 2;
// Left
doc.save().roundedRect(LM, 130, compW, 280, 10).fill('#f5f5f7').restore();
doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text('Traditional Solutions', LM + 24, 150);
['Analytics dashboards', 'Care management tools', 'Point solutions'].forEach((t, i) => {
  doc.font('Helvetica').fontSize(16).fillColor(GRAY).text('• ' + t, LM + 24, 190 + i * 32);
});
// Right
doc.save().roundedRect(LM + compW + 80, 130, compW, 280, 10).fill('#e8f7ff').restore();
doc.font('Helvetica-Bold').fontSize(20).fillColor(BLUE).text('KosIQ: Value-Based Care OS', LM + compW + 104, 150);
['Execution infrastructure', 'Workflow integration', 'Unified performance across domains'].forEach((t, i) => {
  doc.font('Helvetica').fontSize(16).fillColor(TEXT).text('• ' + t, LM + compW + 104, 190 + i * 32);
});

// Comparison table on dark area
const tableX = LM, tableY2 = H * 0.42 + 30;
const rowH = 44;
const col0W = 280;
const featureCols = ['Real-time\nAction', 'AI-Powered', 'Workflow\nIntegration', 'Affordable for\nMid-Market'];
const fcW = 180;
const tableW = col0W + featureCols.length * fcW;

doc.rect(tableX, tableY2, tableW, rowH).fill(BLUE);
doc.font('Helvetica-Bold').fontSize(14).fillColor(WHITE);
doc.text('Company', tableX + 16, tableY2 + 14, { width: col0W });
featureCols.forEach((col, i) => {
  doc.text(col, tableX + col0W + i * fcW, tableY2 + 8, { width: fcW, align: 'center' });
});

const competitors = [
  { name: 'KOSIQ', checks: [true, true, true, true] },
  { name: 'Persivia', checks: [false, true, false, false] },
  { name: 'Arcadia', checks: [false, false, false, false] },
  { name: 'Health Catalyst', checks: [false, true, false, false] },
  { name: 'Datavant', checks: [false, false, false, true] },
  { name: 'Optum (Analytics)', checks: [false, true, false, false] },
];

competitors.forEach((comp, ri) => {
  const ry = tableY2 + rowH + ri * rowH;
  if (ri === 0) doc.rect(tableX, ry, tableW, rowH).fill('#1a2a3a');
  else if (ri % 2 === 0) doc.rect(tableX, ry, tableW, rowH).fill('#141420');

  const isKosiq = ri === 0;
  doc.font(isKosiq ? 'Helvetica-Bold' : 'Helvetica').fontSize(15).fillColor(isKosiq ? BLUE : '#cccccc');
  doc.text(comp.name, tableX + 16, ry + 14, { width: col0W });

  comp.checks.forEach((checked, ci) => {
    const ccx = tableX + col0W + ci * fcW + fcW / 2;
    const ccy = ry + rowH / 2;
    if (checked) {
      doc.circle(ccx, ccy, 10).fill(BLUE);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(WHITE);
      doc.text('✓', ccx - 6, ccy - 8, { width: 12, align: 'center' });
    } else {
      doc.save().strokeColor('#555555').lineWidth(1.5);
      doc.circle(ccx, ccy, 10).stroke();
      doc.restore();
    }
  });

  doc.save().strokeColor('#333333').lineWidth(0.5);
  doc.moveTo(tableX, ry + rowH).lineTo(tableX + tableW, ry + rowH).stroke();
  doc.restore();
});

footer(13, true);

// ═══════════════════════════════════════
// SLIDE 13 — OUR FOUNDERS (Dark)
// ═══════════════════════════════════════
doc.addPage(); darkBg();

doc.font('Helvetica-Bold').fontSize(40).fillColor(WHITE);
doc.text('Our Founders', LM, 50);
doc.font('Helvetica').fontSize(22).fillColor('#888888');
doc.text('Driving Innovation in Value-Based Care', LM, 105);

// Left founder
const fColW = (W - LM * 2 - 100) / 2;
const fLX = LM, fRX = LM + fColW + 100;

// Avatar placeholder
doc.circle(fLX + 60, 210, 50).fill(BLUE);
doc.font('Helvetica-Bold').fontSize(24).fillColor(WHITE).text('JDS', fLX + 32, 198, { width: 56, align: 'center' });

doc.font('Helvetica-Bold').fontSize(26).fillColor(WHITE).text('Jose David Suarez, MD', fLX + 130, 185);
doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE).text('Founder', fLX + 130, 220);

const jdBullets = [
  'Chief Medical Officer of a value-based healthcare organization',
  '25+ years of managed care leadership',
  'Academic medicine & research leadership',
  'Former President, Dade County Medical Association'
];
let jdY = 270;
jdBullets.forEach(b => {
  doc.font('Helvetica').fontSize(15).fillColor('#cccccc').text('• ' + b, fLX, jdY, { width: fColW });
  jdY += 30;
});
doc.font('Helvetica-Oblique').fontSize(14).fillColor('#888888');
doc.text('Experience: Witnessed firsthand the critical need for clean, actionable data to improve financial outcomes.', fLX, jdY + 10, { width: fColW });
doc.text('Belief: Clean, actionable analytics are fundamental to success in value-based care.', fLX, jdY + 55, { width: fColW });

// Right founder
doc.circle(fRX + 60, 210, 50).fill(ORANGE);
doc.font('Helvetica-Bold').fontSize(24).fillColor(WHITE).text('DS', fRX + 38, 198, { width: 44, align: 'center' });

doc.font('Helvetica-Bold').fontSize(26).fillColor(WHITE).text('David Suarez', fRX + 130, 185);
doc.font('Helvetica-Bold').fontSize(16).fillColor(ORANGE).text('Co-Founder & Chief Product Officer', fRX + 130, 220);

const dsBullets = [
  'Technology entrepreneur',
  'AI-powered SaaS platform architect',
  'Expertise in automation, infrastructure, and scalable software systems',
  'Leads development of a real-time, intelligent platform to transform data into operational execution'
];
let dsY = 270;
dsBullets.forEach(b => {
  doc.font('Helvetica').fontSize(15).fillColor('#cccccc').text('• ' + b, fRX, dsY, { width: fColW });
  dsY += 30;
});

footer(14, true);

// ═══════════════════════════════════════
// SLIDE 14 — WHY THIS TEAM WINS (Dark)
// ═══════════════════════════════════════
doc.addPage(); darkBg();

doc.font('Helvetica-Bold').fontSize(40).fillColor(WHITE);
doc.text('Why This Team Wins', LM, 60);
doc.font('Helvetica').fontSize(22).fillColor('#888888');
doc.text('A Rare Combination of Expertise', LM, 115);

const teamCards = [
  ['Clinical Leadership', 'Deeply embedded in Value-Based Care (VBC) execution, ensuring practical and impactful strategies.'],
  ['Operational Experience', 'Proven ability to manage risk in real-world healthcare settings.'],
  ['Advanced Technology', 'Cutting-edge AI and SaaS engineering capabilities driving innovation.']
];

const twW = (W - LM * 2 - 80) / 3;
teamCards.forEach(([title, desc], i) => {
  const cx = LM + i * (twW + 40);
  const cy = 220;
  doc.save().roundedRect(cx, cy, twW, 300, 12).lineWidth(1).strokeColor('#333333').stroke().restore();
  orangeIcon(cx + twW / 2, cy + 60, 34, iconFns[i + 2]);
  doc.font('Helvetica-Bold').fontSize(22).fillColor(WHITE).text(title, cx + 20, cy + 120, { width: twW - 40, align: 'center' });
  doc.font('Helvetica').fontSize(15).fillColor('#aaaaaa').text(desc, cx + 20, cy + 160, { width: twW - 40, align: 'center' });
});

doc.font('Helvetica-Oblique').fontSize(18).fillColor('#aaaaaa');
doc.text('Built by operators, for operators. This team has faced these challenges firsthand, developing solutions based on practical experience rather than theoretical concepts.', LM, H - 120, { width: W - LM * 2, align: 'center' });
footer(15, true);

// ═══════════════════════════════════════
// SLIDE 15 — STRATEGIC COMPARABLES (Dark)
// ═══════════════════════════════════════
doc.addPage(); darkBg();

doc.font('Helvetica-Bold').fontSize(40).fillColor(WHITE);
doc.text('Strategic Comparables', LM, 60);
doc.font('Helvetica').fontSize(22).fillColor('#888888');
doc.text('How investors understand this space', LM, 115);

const comps = [
  ['Oak Street Health', 'Care model execution', 'Acquired by CVS Health for $10.6B. Built a vertically integrated primary care platform for Medicare patients. Proved that execution-layer VBC companies command premium valuations.'],
  ['agilon health', 'Physician enablement under risk', 'IPO valued at $10B+. Enables physician groups to enter full-risk Medicare Advantage contracts. Revenue tripled in 2 years.'],
  ['Evolent', 'Value-based infrastructure', 'Market cap ~$3B+. Provides technology and services to health systems transitioning to VBC. Validates that infrastructure plays win long-term.'],
  ['Privia', 'Provider alignment platforms', 'IPO, revenue $1.6B+. Physician practice management platform optimizing performance under value-based contracts across 4,000+ providers.']
];

const scW = (W - LM * 2 - 120) / 4;
comps.forEach(([name, desc, note], i) => {
  const cx = LM + i * (scW + 40);
  const cy = 200;
  doc.save().roundedRect(cx, cy, scW, 340, 12).lineWidth(1).strokeColor('#333333').stroke().restore();
  doc.rect(cx, cy, scW, 60).fill(BLUE);
  // Cover bottom corners
  doc.rect(cx, cy + 48, scW, 12).fill(BLUE);
  doc.save().roundedRect(cx, cy, scW, 60, 12).clip();
  doc.rect(cx, cy, scW, 60).fill(BLUE);
  doc.restore();
  doc.font('Helvetica-Bold').fontSize(20).fillColor(WHITE).text(name, cx + 16, cy + 18, { width: scW - 32, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(16).fillColor(ORANGE).text(desc, cx + 16, cy + 90, { width: scW - 32, align: 'center' });
  doc.font('Helvetica').fontSize(14).fillColor('#aaaaaa').text(note, cx + 16, cy + 140, { width: scW - 32, align: 'center' });
});

doc.font('Helvetica-Oblique').fontSize(17).fillColor('#aaaaaa');
doc.text('KosIQ sits at the intersection of these proven models — combining clinical execution with financial intelligence infrastructure.', LM, H - 110, { width: W - LM * 2, align: 'center' });
footer(16, true);

// ═══════════════════════════════════════
// SLIDE 16 — LONG-TERM VISION (Light)
// ═══════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT);
doc.text('Long-Term Vision', LM, 60);
doc.font('Helvetica').fontSize(18).fillColor(GRAY);
doc.text('KosIQ: The Default Operating Infrastructure for Value-Based Healthcare Organizations', LM, 110, { width: W - LM * 2 });

const ltCards = [
  ['Embedded Integration', 'Seamlessly integrated across all clinical workflows. KOSIQ becomes the invisible operating layer that powers every patient interaction, quality review, and financial decision.'],
  ['Scalability', 'Managing millions of covered lives across hundreds of provider organizations. Platform economics improve with each new customer — marginal cost per additional member approaches zero.'],
  ['Financial Predictability', 'Driving predictable financial outcomes under risk-sharing arrangements. Organizations using KOSIQ can forecast revenue, costs, and quality metrics with confidence quarters in advance.'],
  ['Strategic Defensibility', 'Creating high switching costs and a durable competitive moat. Once KOSIQ is embedded in workflows and connected to data sources, replacement becomes operationally unthinkable.']
];

const ltW = (W - LM * 2 - 60) / 4, ltH = 320;
ltCards.forEach(([title, desc], i) => {
  const cx = LM + i * (ltW + 20);
  const cy = 200;
  doc.save().roundedRect(cx, cy, ltW, ltH, 12).fill(LIGHT_ORANGE).restore();
  orangeIcon(cx + ltW / 2, cy + 50, 30, iconFns[i + 9]);
  doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text(title, cx + 16, cy + 100, { width: ltW - 32, align: 'center' });
  doc.font('Helvetica').fontSize(14).fillColor(GRAY).text(desc, cx + 16, cy + 140, { width: ltW - 32, align: 'center' });
});

footer(17);

// ═══════════════════════════════════════
// SLIDE 17 — CLOSING (Dark, dramatic)
// ═══════════════════════════════════════
doc.addPage(); darkBg();

// Decorative geometric elements
doc.save().strokeColor(BLUE).lineWidth(0.8).opacity(0.2);
for (let i = 0; i < 12; i++) {
  const a = (Math.PI * 2 / 12) * i;
  const r1 = 200, r2 = 400;
  doc.moveTo(W / 2 + Math.cos(a) * r1, H / 2 + Math.sin(a) * r1)
     .lineTo(W / 2 + Math.cos(a) * r2, H / 2 + Math.sin(a) * r2).stroke();
}
doc.circle(W / 2, H / 2, 200).stroke();
doc.circle(W / 2, H / 2, 300).stroke();
doc.circle(W / 2, H / 2, 400).stroke();
doc.restore();

// Decorative dots
doc.save().opacity(0.15);
for (let i = 0; i < 30; i++) {
  const dx = 200 + Math.random() * (W - 400);
  const dy = 200 + Math.random() * (H - 400);
  doc.circle(dx, dy, 2 + Math.random() * 4).fill(BLUE);
}
doc.restore();

drawLogoAt(W / 2, 300, 64, true);

doc.font('Helvetica-Bold').fontSize(34).fillColor(WHITE);
doc.text('KosIQ is building the execution infrastructure\nthat turns value-based care into a scalable,\nfinancially predictable operating model.', 0, 420, { width: W, align: 'center' });

doc.rect(W / 2 - 60, 590, 120, 3).fill(BLUE);

footer(18, true);

// ═══════════════════════════════════════
// SLIDE 18 — THE ASK (Light)
// ═══════════════════════════════════════
doc.addPage(); lightBg();

doc.font('Helvetica-Bold').fontSize(42).fillColor(TEXT);
doc.text('The Ask', 0, 50, { width: W, align: 'center' });
doc.font('Helvetica').fontSize(22).fillColor(GRAY);
doc.text('Raising: $500K–$1.5M Seed', 0, 105, { width: W, align: 'center' });

// Two columns: Use of Funds + Goals
const askColW = (W - LM * 2 - 100) / 2;

doc.save().roundedRect(LM, 160, askColW, 200, 10).fill('#f8f9fb').restore();
doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text('Use of Funds', LM + 24, 175);
const fundItems = [
  'Product development — engineering team, AI/ML pipeline, platform hardening',
  'Enterprise integrations — EHR connectors (Epic, eCW, Cerner, athena)',
  'Go-to-market expansion — sales team, pilot partnerships, conferences',
  'AI intelligence layer — predictive models, NLP for clinical notes, automation'
];
fundItems.forEach((t, i) => {
  doc.font('Helvetica').fontSize(14).fillColor(GRAY).text('• ' + t, LM + 24, 208 + i * 32, { width: askColW - 48 });
});

doc.save().roundedRect(LM + askColW + 100, 160, askColW, 200, 10).fill('#f8f9fb').restore();
doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text('Goals', LM + askColW + 124, 175);
const goalItems = [
  'Scale to 15+ enterprise deployments within 12 months',
  'Expand covered lives under management to 100K+',
  'Achieve SOC 2 Type II + HIPAA certification',
  'Build repeatable sales motion with <90 day sales cycle'
];
goalItems.forEach((t, i) => {
  doc.font('Helvetica').fontSize(14).fillColor(GRAY).text('• ' + t, LM + askColW + 124, 208 + i * 32, { width: askColW - 48 });
});

// Investment options
doc.rect(LM, 320, W - LM * 2, 3).fill(BLUE);

const optW = (W - LM * 2 - 60) / 2;

// Lean
doc.save().roundedRect(LM, 340, optW, 220, 10).fill('#f8f9fb').restore();
doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text('Lean Option', LM + 24, 355);
doc.font('Helvetica-Bold').fontSize(30).fillColor(BLUE).text('$500K – $750K', LM + 24, 385);
['12-month runway', 'Core team (4-5 people)', 'MVP → Product-market fit', '10-15 customers by Mo 12'].forEach((t, i) => {
  doc.font('Helvetica').fontSize(15).fillColor(GRAY).text('— ' + t, LM + 24, 430 + i * 28);
});

// Sweet Spot
doc.save().roundedRect(LM + optW + 60, 340, optW, 220, 10).fill('#e8f7ff').restore();
doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text('Sweet Spot', LM + optW + 84, 355);
doc.font('Helvetica-Bold').fontSize(30).fillColor(GREEN).text('$1M – $1.5M', LM + optW + 84, 385);
['18-month runway', 'Full team (7-8 people)', 'Aggressive market capture', '25+ customers, $1.74M ARR'].forEach((t, i) => {
  doc.font('Helvetica').fontSize(15).fillColor(GRAY).text('— ' + t, LM + optW + 84, 430 + i * 28);
});

// Valuation
doc.font('Helvetica-Bold').fontSize(16).fillColor(GRAY).text('PRE-MONEY VALUATION', LM, 590);
doc.font('Helvetica-Bold').fontSize(48).fillColor(BLUE).text('$15–20M', LM, 615);

// Key Milestones
doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT).text('Key Milestones', LM + optW + 60, 590);
const milestones = ['First paying customer (Mo 4)', '3 EHR integrations live (Mo 10)', 'SOC 2 + HIPAA certified (Mo 10)', '15+ customers / $1M+ ARR (Mo 12)', 'Series A ready (Mo 12-18)'];
milestones.forEach((m, i) => {
  doc.font('Helvetica').fontSize(15).fillColor(TEXT).text('✓  ' + m, LM + optW + 60, 620 + i * 28);
});

// Contact
doc.rect(LM, H - 120, W - LM * 2, 1).fill('#e5e5e5');
doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT).text('David Suarez', LM, H - 100);
doc.font('Helvetica').fontSize(16).fillColor(GRAY).text('Chief Product Officer', LM, H - 78);
doc.font('Helvetica').fontSize(16).fillColor(BLUE).text('david@iamdivid.com', LM + 260, H - 78);

doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT).text('Dr. JD Suarez', LM + 600, H - 100);
doc.font('Helvetica').fontSize(16).fillColor(GRAY).text('CMO', LM + 600, H - 78);
doc.font('Helvetica').fontSize(16).fillColor(BLUE).text('drjdsuarez@gmail.com', LM + 680, H - 78);

footer(19);

// ─── Done ───
doc.end();
console.log('✅ KOSIQ-Investor-Pitch-2026.pdf generated (19 slides)');
