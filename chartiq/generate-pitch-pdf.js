const PDFDocument = require('/home/suareyai/.openclaw/workspace/kosiq/node_modules/pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: 'letter', margin: 0 });
doc.pipe(fs.createWriteStream('/home/suareyai/.openclaw/workspace/chartiq/ChartIQ-Pitch-Deck-2026.pdf'));

const W = 612, H = 792;
const BLUE = '#26acf7', TEAL = '#10b981', DARK1 = '#0a0a0f', DARK2 = '#111118';
const LIGHT1 = '#ffffff', LIGHT2 = '#f5f5f7', LOGO_DARK = '#231f20';

function newSlide(bg) {
  doc.addPage();
  doc.rect(0, 0, W, H).fill(bg);
}

// Safe centered logo — no continued, manual positioning
function drawCenteredLogo(y, size, darkBg) {
  doc.font('Helvetica-Bold').fontSize(size);
  const cW = doc.widthOfString('Chart');
  const iW = doc.widthOfString('IQ');
  const startX = (W - cW - iW) / 2;
  doc.fillColor(darkBg ? '#ffffff' : LOGO_DARK).text('Chart', startX, y, { lineBreak: false });
  doc.fillColor(BLUE).text('IQ', startX + cW, y, { lineBreak: false });
}

function slideLabel(text, color, y) {
  doc.font('Helvetica').fontSize(11).fillColor(color).text(text, 60, y || 50, { lineBreak: false });
}

function slideTitle(text, color, y) {
  doc.font('Helvetica-Bold').fontSize(26).fillColor(color).text(text, 60, y || 70, { width: W - 120 });
}

// ═══════════════════════════════════════════════════
// SLIDE 1: TITLE
// ═══════════════════════════════════════════════════
doc.rect(0, 0, W, H).fill(DARK1);
doc.save(); doc.opacity(0.03);
doc.circle(W - 100, 150, 200).fill(BLUE);
doc.circle(100, H - 150, 180).fill(TEAL);
doc.restore();

doc.rect(W/2 - 40, 230, 80, 3).fill(BLUE);
drawCenteredLogo(260, 72, true);
doc.rect(W/2 - 40, 345, 80, 3).fill(BLUE);

doc.font('Helvetica').fontSize(20).fillColor('#dddddd');
doc.text('AI-Powered Clinical Chart Intelligence', 60, 375, { width: W - 120, align: 'center' });

doc.font('Helvetica').fontSize(13).fillColor('#888888');
doc.text('Transforming how hospitals read, summarize,', 60, 420, { width: W - 120, align: 'center' });
doc.text('and act on patient data', 60, 438, { width: W - 120, align: 'center' });

doc.roundedRect(80, 690, W - 160, 45, 8).lineWidth(1).stroke('#333333');
doc.font('Helvetica').fontSize(10).fillColor('#666666');
doc.text('Confidential', 100, 706, { lineBreak: false });
doc.text('chartiq.kosiq.ai', 240, 706, { width: 132, align: 'center', lineBreak: false });
doc.text('March 2026', 392, 706, { width: 120, align: 'right', lineBreak: false });

// ═══════════════════════════════════════════════════
// SLIDE 2: THE PROBLEM
// ═══════════════════════════════════════════════════
newSlide(LIGHT1);
slideLabel('THE PROBLEM', BLUE);
slideTitle('Every Shift Change Is a\nPatient Safety Risk', DARK1);

const problems = [
  { stat: '30-60', label: 'Min/Handoff', body: 'Nurses spend 30-60 min reading charts, notes, labs, and orders from multiple providers before safely taking over care.' },
  { stat: '2-3', label: 'Hrs/Day Lost', body: 'Hospitalists covering 15-20 patients waste 2-3 hours daily on chart review — 25-35% of their shift not seeing patients.' },
  { stat: '80%', label: 'Error Rate', body: 'Joint Commission: 80% of serious medical errors involve miscommunication during care transitions and handoffs.' },
  { stat: '$1.7B', label: 'Annual Cost', body: 'US hospitals lose $1.7B annually to preventable errors during shift transitions: malpractice, readmissions, extended stays.' }
];

let py = 155;
problems.forEach((p, i) => {
  doc.roundedRect(60, py, W - 120, 75, 8).fill(i % 2 === 0 ? '#f8fafc' : '#ffffff');
  doc.roundedRect(72, py + 10, 75, 55, 6).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#ffffff').text(p.stat, 72, py + 16, { width: 75, align: 'center' });
  doc.font('Helvetica').fontSize(7.5).fillColor('#cce8fd').text(p.label, 72, py + 40, { width: 75, align: 'center' });
  doc.font('Helvetica').fontSize(10).fillColor('#333333').text(p.body, 165, py + 18, { width: 370 });
  py += 85;
});

doc.roundedRect(60, py + 10, W - 120, 48, 10).fill('#fef2f2');
doc.font('Helvetica-Bold').fontSize(11).fillColor('#dc2626').text('The status quo is unsustainable.', 80, py + 18, { width: W - 160 });
doc.font('Helvetica').fontSize(9).fillColor('#991b1b').text('63% of physicians report burnout. Documentation is the #1 cause of hospital staff turnover.', 80, py + 34, { width: W - 160 });

// ═══════════════════════════════════════════════════
// SLIDE 3: THE SOLUTION
// ═══════════════════════════════════════════════════
newSlide(DARK1);
slideLabel('THE SOLUTION', TEAL);
slideTitle('AI That Reads Every Chart\nSo Your Team Doesn\'t Have To', '#ffffff');

const solutions = [
  { num: '1', title: 'Instant Shift Summaries', body: 'AI ingests every note from every provider: attending physicians, residents, nurses, specialists, therapists. Produces organized, problem-based summaries in seconds. Flags critical changes, new orders, and trending labs. What took 45 minutes now takes 10 seconds.', color: BLUE },
  { num: '2', title: 'Smart SBAR Handoffs', body: 'One-click generation of SBAR-formatted handoff reports for your entire patient census. Meets Joint Commission standards. Standardizes quality whether the outgoing nurse is meticulous or rushed. Printable and shareable across units.', color: TEAL },
  { num: '3', title: 'Clinical Intelligence Chat', body: 'Natural language interface to every patient chart. "When was the last potassium check?" "Summarize the surgery note from Tuesday." "What antibiotics has she been on?" Instant answers from the full chart, zero chart diving.', color: '#8b5cf6' }
];

let sy = 150;
solutions.forEach((s, i) => {
  doc.roundedRect(60, sy, W - 120, 120, 10).fill(DARK2);
  doc.roundedRect(60, sy, 5, 120, 2).fill(s.color);
  doc.circle(90, sy + 25, 14).fill(s.color);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#ffffff').text(s.num, 84, sy + 18, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff').text(s.title, 118, sy + 16, { width: 380 });
  doc.font('Helvetica').fontSize(10).fillColor('#aaaaaa').text(s.body, 118, sy + 36, { width: 400 });
  sy += 135;
});

doc.roundedRect(60, sy + 10, W - 120, 40, 8).fill(BLUE).opacity(0.12);
doc.opacity(1);
doc.font('Helvetica-Bold').fontSize(12).fillColor(BLUE).text('45 minutes  →  10 seconds', 80, sy + 16, { lineBreak: false });
doc.font('Helvetica').fontSize(10).fillColor('#888').text('Average chart review time: before vs. after ChartIQ', 300, sy + 18, { lineBreak: false });

// ═══════════════════════════════════════════════════
// SLIDE 4: WHO BENEFITS
// ═══════════════════════════════════════════════════
newSlide(LIGHT2);
slideLabel('WHO BENEFITS', BLUE);
slideTitle('Built for Every Stakeholder', DARK1);

const benefits = [
  { title: 'Nurses', body: 'Save 30-60 minutes per shift change. Focus on patient care instead of reading dozens of notes. Reduces cognitive overload during critical transitions. Less burnout, better retention.' },
  { title: 'Hospitalists & Physicians', body: 'Cover 15-20 patients efficiently without drowning in documentation. Instant summaries when called to consult on unfamiliar patients. Night and weekend coverage becomes manageable.' },
  { title: 'Hospital Administrators', body: 'Reduce documentation-related overtime costs. Improve patient safety scores and CMS Star Ratings. Meet Joint Commission handoff requirements. Reduce malpractice exposure.' },
  { title: 'Health Systems & Networks', body: 'Standardize handoff quality across all facilities. Aggregate clinical intelligence. Reduce average length of stay through faster clinical decisions. Benchmark across hospitals.' }
];

const cw = 232, ch = 155, gap = 18;
benefits.forEach((b, i) => {
  let cx = 60 + (i % 2) * (cw + gap);
  let cy = 140 + Math.floor(i / 2) * (ch + gap);
  doc.roundedRect(cx, cy, cw, ch, 8).fill('#ffffff');
  doc.roundedRect(cx, cy, cw, 4, 2).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK1).text(b.title, cx + 16, cy + 18, { width: cw - 32 });
  doc.font('Helvetica').fontSize(9.5).fillColor('#555555').text(b.body, cx + 16, cy + 38, { width: cw - 32 });
});

doc.roundedRect(60, 490, W - 120, 70, 8).fill('#eff6ff');
doc.font('Helvetica-Bold').fontSize(12).fillColor(BLUE).text('Priority Targets', 80, 500);
doc.font('Helvetica').fontSize(9.5).fillColor('#444');
doc.text('Community hospitals (50-200 beds) — fastest sales cycle', 80, 518, { width: 220 });
doc.text('Academic medical centers — larger contracts', 80, 533, { width: 220 });
doc.text('HCA (186 hospitals), Tenet (60), CommonSpirit (140)', 320, 518, { width: 230 });
doc.text('Baptist Health, Memorial Healthcare, Jackson Health', 320, 533, { width: 230 });

// ═══════════════════════════════════════════════════
// SLIDE 5: PRODUCT FEATURES
// ═══════════════════════════════════════════════════
newSlide(DARK2);
slideLabel('PRODUCT', TEAL);
slideTitle('Core Feature Set', '#ffffff');

const features = [
  { title: 'AI Shift Summary', body: 'Reads all notes from all providers. Organizes by active problem. Flags critical lab trends, new orders, medication changes, and code status updates.', accent: BLUE },
  { title: 'SBAR Handoff Generator', body: 'One-click Joint Commission-compliant SBAR handoff for entire census. Situation, Background, Assessment, Recommendation for each patient.', accent: TEAL },
  { title: 'Patient Clinical Chat', body: 'Natural language interface to any patient chart. Ask any question, get instant answers from the full medical record. Available per-patient and globally.', accent: '#8b5cf6' },
  { title: 'Voice Dictation Notes', body: 'Speak notes directly into the system. Real-time transcription. Multiple note types: progress, assessments, procedures. Hands-free at bedside.', accent: '#f59e0b' },
  { title: 'Vitals & Labs Dashboard', body: 'Real-time vitals charts with Q4H trending. Lab results with automatic flagging. CBC, BMP, cardiac markers, coagulation panels. Medication reconciliation.', accent: '#ec4899' },
  { title: 'Medical Image Gallery', body: 'Upload and organize X-rays, MRIs, CTs, ultrasounds. Category badges, drag-and-drop upload, lightbox viewing. Attach images to handoff reports.', accent: '#06b6d4' }
];

const fw = 232, fh = 115, fgap = 18;
features.forEach((f, i) => {
  let fx = 60 + (i % 2) * (fw + fgap);
  let fy = 135 + Math.floor(i / 2) * (fh + fgap);
  doc.roundedRect(fx, fy, fw, fh, 8).fill('#1a1a24');
  doc.roundedRect(fx, fy, fw, 4, 2).fill(f.accent);
  doc.font('Helvetica-Bold').fontSize(12).fillColor('#ffffff').text(f.title, fx + 14, fy + 16, { width: fw - 28 });
  doc.font('Helvetica').fontSize(9.5).fillColor('#999999').text(f.body, fx + 14, fy + 36, { width: fw - 28 });
});

// ═══════════════════════════════════════════════════
// SLIDE 6: MARKET OPPORTUNITY
// ═══════════════════════════════════════════════════
newSlide(LIGHT1);
slideLabel('MARKET OPPORTUNITY', BLUE);
slideTitle('Massive Addressable Market', DARK1);

const stats = [
  { num: '6,090', label: 'US Hospitals', sub: 'Community, academic,\nand critical access' },
  { num: '924K', label: 'Staffed Beds', sub: 'Each bed = monthly\nrecurring subscription' },
  { num: '$110M', label: 'ChartIQ TAM/yr', sub: 'At $10/bed/month\nacross all US hospitals' },
  { num: '$500M+', label: 'Combined TAM', sub: 'ChartIQ + KOSIQ\npopulation health' }
];
stats.forEach((s, i) => {
  let mx = 60 + i * 128;
  doc.roundedRect(mx, 140, 118, 95, 8).fill('#f8fafc');
  doc.font('Helvetica-Bold').fontSize(24).fillColor(BLUE).text(s.num, mx + 10, 150, { width: 98, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK1).text(s.label, mx + 10, 180, { width: 98, align: 'center' });
  doc.font('Helvetica').fontSize(8).fillColor('#888').text(s.sub, mx + 10, 195, { width: 98, align: 'center' });
});

doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK1).text('Why Now?', 60, 255);

const drivers = [
  { title: 'Physician Burnout Crisis', body: '63% of physicians report burnout. Documentation is the #1 cited cause. Hospitals are desperate for solutions.' },
  { title: 'Joint Commission Mandates', body: 'Accreditation requires standardized handoff communication. Most hospitals still use paper or verbal handoffs.' },
  { title: 'AI Acceptance in Healthcare', body: 'Hospital IT spending on AI grew 47% in 2025. Epic, Cerner, MEDITECH all building AI ecosystems.' },
  { title: 'Staffing Shortages', body: 'US nursing shortage projected at 1.2M by 2030. Every minute saved on documentation goes to patient care.' }
];

drivers.forEach((d, i) => {
  let dx = 60 + (i % 2) * 252;
  let dy = 280 + Math.floor(i / 2) * 85;
  doc.roundedRect(dx, dy, 240, 72, 6).fill('#f8fafc');
  doc.font('Helvetica-Bold').fontSize(10).fillColor(BLUE).text(d.title, dx + 12, dy + 10, { width: 216 });
  doc.font('Helvetica').fontSize(9).fillColor('#555').text(d.body, dx + 12, dy + 26, { width: 216 });
});

// Growth curve
doc.moveTo(80, 580).lineTo(80, 470).lineWidth(1).stroke('#ddd');
doc.moveTo(80, 580).lineTo(530, 580).lineWidth(1).stroke('#ddd');
doc.moveTo(100, 570).bezierCurveTo(200, 565, 300, 535, 380, 500).bezierCurveTo(420, 485, 470, 470, 510, 455).lineWidth(3).stroke(BLUE);
doc.save(); doc.opacity(0.06);
doc.moveTo(100, 570).bezierCurveTo(200, 565, 300, 535, 380, 500).bezierCurveTo(420, 485, 470, 470, 510, 455).lineTo(510, 580).lineTo(100, 580).closePath().fill(BLUE);
doc.restore();
doc.font('Helvetica').fontSize(8).fillColor('#999');
doc.text('2026', 90, 588, { lineBreak: false }); doc.text('2027', 230, 588, { lineBreak: false });
doc.text('2028', 370, 588, { lineBreak: false }); doc.text('2029+', 490, 588, { lineBreak: false });
doc.font('Helvetica').fontSize(9).fillColor(BLUE).text('Hospital AI Adoption Curve', 380, 445, { lineBreak: false });

// ═══════════════════════════════════════════════════
// SLIDE 7: BUSINESS MODEL
// ═══════════════════════════════════════════════════
newSlide(LIGHT2);
slideLabel('BUSINESS MODEL', BLUE);
slideTitle('Per-Bed, Per-Month SaaS', DARK1);

const tiers = [
  { label: 'Small Hospitals (under 100 beds)', price: '$15', annual: '$18K-$180K/yr per hospital', examples: 'Community hospitals, critical access, rural', color: TEAL },
  { label: 'Medium Hospitals (100-300 beds)', price: '$12', annual: '$144K-$432K/yr per hospital', examples: 'Regional medical centers, teaching hospitals', color: BLUE },
  { label: 'Large Hospitals (300+ beds)', price: '$8', annual: '$288K+ per hospital', examples: 'Academic medical centers, HCA/Tenet facilities', color: '#8b5cf6' }
];

tiers.forEach((t, i) => {
  let ty = 140 + i * 95;
  doc.roundedRect(60, ty, W - 120, 82, 8).fill('#ffffff');
  doc.roundedRect(72, ty + 10, 85, 60, 6).fill(t.color);
  doc.font('Helvetica-Bold').fontSize(26).fillColor('#ffffff').text(t.price, 72, ty + 16, { width: 85, align: 'center' });
  doc.font('Helvetica').fontSize(8).fillColor('#ddd').text('/bed/month', 72, ty + 46, { width: 85, align: 'center' });
  doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK1).text(t.label, 175, ty + 14, { width: 360 });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(t.color).text(t.annual, 175, ty + 34, { width: 360 });
  doc.font('Helvetica').fontSize(9).fillColor('#999').text(t.examples, 175, ty + 50, { width: 360 });
});

doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK1).text('Additional Revenue', 60, 440);

const addRev = [
  { val: '$5K-$25K', label: 'Implementation Fees', body: 'One-time setup, EHR integration, training' },
  { val: '90%+', label: 'Gross Margins', body: 'AI inference ~$0.02/summary, minimal infra' },
  { val: '120%+', label: 'Net Revenue Retention', body: 'Expand from pilot units to full facility' },
  { val: '60-90 days', label: 'Sales Cycle', body: 'Low-risk pilot, prove ROI, then expand' }
];

addRev.forEach((r, i) => {
  let rx = 60 + (i % 2) * 252;
  let ry = 465 + Math.floor(i / 2) * 75;
  doc.roundedRect(rx, ry, 240, 62, 6).fill('#ffffff');
  doc.font('Helvetica-Bold').fontSize(18).fillColor(BLUE).text(r.val, rx + 12, ry + 8, { width: 216 });
  doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK1).text(r.label, rx + 12, ry + 30, { width: 216 });
  doc.font('Helvetica').fontSize(8.5).fillColor('#777').text(r.body, rx + 12, ry + 44, { width: 216 });
});

// ═══════════════════════════════════════════════════
// SLIDE 8: REVENUE PROJECTIONS
// ═══════════════════════════════════════════════════
newSlide(DARK1);
slideLabel('REVENUE PROJECTIONS', TEAL);
slideTitle('Three-Year Growth Path', '#ffffff');

// Table
const colWidths = [120, 115, 115, 115];
const projHeaders = ['', 'Conservative', 'Moderate', 'Aggressive'];
const projColors = [null, TEAL, BLUE, '#8b5cf6'];
const projRows = [
  ['Hospitals', '5', '10', '15'],
  ['Avg Beds', '150', '150', '200'],
  ['Avg Price', '$10/bed', '$12/bed', '$12/bed'],
  ['Monthly Rev', '$7,500', '$18,000', '$36,000'],
  ['Setup Fees', '$25K', '$75K', '$150K'],
  ['Year 1 Total', '$115K', '$291K', '$582K'],
];

let tableY = 140;
let tableX = 60;

projHeaders.forEach((h, i) => {
  let hx = tableX;
  for (let j = 0; j < i; j++) hx += colWidths[j];
  if (i > 0) doc.roundedRect(hx - 2, tableY, colWidths[i], 22, 4).fill(projColors[i]);
  doc.font('Helvetica-Bold').fontSize(9.5).fillColor(i === 0 ? '#666' : '#ffffff').text(h, hx + 8, tableY + 5, { width: colWidths[i] - 16, lineBreak: false });
});

tableY += 30;
projRows.forEach((row, ri) => {
  let isLast = ri === projRows.length - 1;
  if (isLast) doc.roundedRect(tableX - 2, tableY - 2, 467, 24, 4).fill(DARK2);
  row.forEach((cell, ci) => {
    let cx = tableX;
    for (let j = 0; j < ci; j++) cx += colWidths[j];
    let color = ci === 0 ? '#888' : (isLast ? '#ffffff' : '#cccccc');
    doc.font(ci === 0 || isLast ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor(color).text(cell, cx + 8, tableY + 3, { width: colWidths[ci] - 16, lineBreak: false });
  });
  tableY += 26;
});

// Year 2 & 3
doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff').text('Growth Trajectory', 60, tableY + 20);

const yearData = [
  { year: 'Year 2', revenue: '$650K - $3.15M', hospitals: '25-100 hospitals', note: 'Regional expansion, enterprise contracts', color: BLUE },
  { year: 'Year 3', revenue: '$3.7M - $6.1M', hospitals: '100-200 hospitals', note: 'National scale + KOSIQ upsell revenue', color: TEAL }
];

yearData.forEach((y, i) => {
  let yy = tableY + 45 + i * 70;
  doc.roundedRect(60, yy, W - 120, 58, 8).fill(DARK2);
  doc.roundedRect(60, yy, 5, 58, 2).fill(y.color);
  doc.font('Helvetica-Bold').fontSize(14).fillColor(y.color).text(y.year, 80, yy + 8, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(20).fillColor('#ffffff').text(y.revenue, 80, yy + 28, { lineBreak: false });
  doc.font('Helvetica').fontSize(9).fillColor('#888').text(y.hospitals + ' — ' + y.note, 310, yy + 32, { width: 220 });
});

// ═══════════════════════════════════════════════════
// SLIDE 9: TROJAN HORSE
// ═══════════════════════════════════════════════════
newSlide(LIGHT1);
slideLabel('GO-TO-MARKET', BLUE);
slideTitle('The Trojan Horse Strategy', DARK1);

doc.font('Helvetica').fontSize(11).fillColor('#555').text('ChartIQ is the wedge. KOSIQ is the platform.', 60, 110, { width: W - 120 });

const steps = [
  { num: '1', title: 'Enter', body: 'ChartIQ solves an urgent daily pain. Low-risk pilot, fast adoption. Every nurse uses it every shift.', color: BLUE },
  { num: '2', title: 'Prove', body: 'Demonstrate ROI: time saved, errors reduced, staff satisfaction. Collect outcome data for case studies.', color: TEAL },
  { num: '3', title: 'Expand', body: 'Grow from pilot unit to full hospital. Add departments and specialties. Become embedded in workflow.', color: '#8b5cf6' },
  { num: '4', title: 'Upsell', body: 'Introduce KOSIQ population health. Same AI platform, same trust, 10x larger contract value.', color: '#f59e0b' }
];

// Connecting line
doc.rect(95, 175, W - 190, 3).fill('#e5e7eb');

steps.forEach((s, i) => {
  let sx = 55 + i * 132;
  doc.circle(sx + 40, 176, 16).fill(s.color);
  doc.font('Helvetica-Bold').fontSize(14).fillColor('#ffffff').text(s.num, sx + 34, 169, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(12).fillColor(DARK1).text(s.title, sx, 205, { width: 125, align: 'center' });
  doc.font('Helvetica').fontSize(8.5).fillColor('#666').text(s.body, sx, 222, { width: 125, align: 'center' });
});

// Revenue math
doc.roundedRect(60, 310, W - 120, 175, 10).fill('#f0f8ff');
doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK1).text('The Math: One Hospital, Two Products', 80, 325);

doc.roundedRect(80, 355, 200, 55, 6).fill('#ffffff');
doc.font('Helvetica-Bold').fontSize(11).fillColor(BLUE).text('ChartIQ Revenue', 92, 362);
doc.font('Helvetica').fontSize(10).fillColor('#555').text('300 beds x $10/mo = $36K/year', 92, 380);

doc.font('Helvetica-Bold').fontSize(22).fillColor(DARK1).text('+', 293, 370, { lineBreak: false });

doc.roundedRect(320, 355, 210, 55, 6).fill('#ffffff');
doc.font('Helvetica-Bold').fontSize(11).fillColor(TEAL).text('KOSIQ Revenue', 332, 362);
doc.font('Helvetica').fontSize(10).fillColor('#555').text('20K lives x $1 PMPM = $240K/year', 332, 380);

doc.roundedRect(80, 425, 450, 40, 8).fill(BLUE);
doc.font('Helvetica-Bold').fontSize(16).fillColor('#ffffff').text('$276K - $516K per hospital per year', 100, 435, { width: 410, align: 'center' });

doc.font('Helvetica').fontSize(9.5).fillColor('#888').text('At 50 hospitals with 10 KOSIQ conversions: $1.3M + $2.4M = $3.7M+ ARR', 60, 500, { width: W - 120, align: 'center' });

// ═══════════════════════════════════════════════════
// SLIDE 10: COMPETITIVE LANDSCAPE
// ═══════════════════════════════════════════════════
newSlide(DARK2);
slideLabel('COMPETITIVE LANDSCAPE', TEAL);
slideTitle('We Read Charts.\nThey Create Notes.', '#ffffff');

doc.roundedRect(60, 140, W - 120, 35, 8).fill(BLUE).opacity(0.12);
doc.opacity(1);
doc.font('Helvetica').fontSize(9.5).fillColor(BLUE).text('Every competitor focuses on creating new documentation. Nobody solves reading and synthesizing existing notes across providers.', 80, 150, { width: W - 160 });

const competitors = [
  { name: 'ChartIQ', raised: 'Seed', caps: [1,1,1,1,1] },
  { name: 'Abridge', raised: '$212M', caps: [1,0,0,0,0] },
  { name: 'Suki', raised: '$400M+', caps: [0,0,0,1,0] },
  { name: 'DeepScribe', raised: '$60M+', caps: [0,0,0,0,0] },
  { name: 'Nabla', raised: '$44M', caps: [0,0,0,0,0] }
];
const capLabels = ['Chart\nSummary', 'Cross-Provider\nIntel', 'Handoff\nGeneration', 'Clinical\nChat', 'Population\nHealth'];

let compY = 195;
capLabels.forEach((c, i) => {
  doc.font('Helvetica').fontSize(8).fillColor('#666').text(c, 190 + i * 78, compY, { width: 72, align: 'center' });
});

compY += 35;
competitors.forEach((comp, ri) => {
  let ry = compY + ri * 38;
  if (ri === 0) doc.roundedRect(58, ry - 4, W - 116, 32, 4).fill(BLUE).opacity(0.1);
  doc.opacity(1);
  doc.font(ri === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(10).fillColor(ri === 0 ? BLUE : '#aaa').text(comp.name, 68, ry + 5, { width: 70, lineBreak: false });
  doc.font('Helvetica').fontSize(8.5).fillColor('#666').text(comp.raised, 140, ry + 7, { width: 45, lineBreak: false });
  comp.caps.forEach((v, ci) => {
    let dotX = 190 + ci * 78 + 36;
    let dotY = ry + 10;
    if (v) {
      doc.circle(dotX, dotY, 7).fill(ri === 0 ? BLUE : TEAL);
    } else {
      doc.circle(dotX, dotY, 7).lineWidth(1.5).stroke('#444');
    }
  });
});

// Comparison boxes
let boxY = compY + 5 * 38 + 20;
doc.roundedRect(60, boxY, 235, 75, 8).fill('#1a1a24');
doc.roundedRect(60, boxY, 235, 4, 2).fill('#dc2626');
doc.font('Helvetica-Bold').fontSize(10).fillColor('#dc2626').text('Competitors: Note CREATION', 76, boxY + 14);
doc.font('Helvetica').fontSize(9).fillColor('#999').text('Ambient listening during patient encounters. Generates new notes from conversations. Solves documentation input.', 76, boxY + 30, { width: 205 });

doc.roundedRect(315, boxY, 237, 75, 8).fill('#1a1a24');
doc.roundedRect(315, boxY, 237, 4, 2).fill(BLUE);
doc.font('Helvetica-Bold').fontSize(10).fillColor(BLUE).text('ChartIQ: Chart INTELLIGENCE', 331, boxY + 14);
doc.font('Helvetica').fontSize(9).fillColor('#999').text('Reads and synthesizes ALL existing notes from ALL providers. Summaries, handoffs, chat. Solves information consumption.', 331, boxY + 30, { width: 207 });

// ═══════════════════════════════════════════════════
// SLIDE 11: 12-MONTH ROADMAP
// ═══════════════════════════════════════════════════
newSlide(LIGHT1);
slideLabel('ROADMAP', BLUE);
slideTitle('12-Month Execution Plan', DARK1);

const phases = [
  { months: 'Months 1-3', title: 'Foundation', body: 'HIPAA compliance certification (shared with KOSIQ, ~$75K). SOC 2 Type I. Build EHR integration layer for Epic FHIR, Cerner HealtheIntent, MEDITECH Expanse. Hire healthcare sales rep for South Florida.', color: BLUE },
  { months: 'Months 4-6', title: 'Pilot & Prove', body: 'Launch pilots at 2-3 South Florida hospitals. Targets: Baptist Health (11 hospitals, 2,500 beds), Memorial Healthcare (6 hospitals, 1,900 beds). Price at $10/bed to minimize friction. Collect ROI metrics.', color: TEAL },
  { months: 'Months 7-9', title: 'Validate & Expand', body: 'Publish case studies ("Nurses saved 45 min/shift, zero handoff errors in 90 days"). Expand within pilot systems. Sign 2-3 additional hospitals. Add voice summarization feature.', color: '#8b5cf6' },
  { months: 'Months 10-12', title: 'Scale', body: 'Reach 8-12 hospitals across South Florida. Present at HIMSS Global Health Conference. Begin enterprise conversations with HCA, Tenet, CommonSpirit. List on EHR app marketplaces.', color: '#f59e0b' }
];

doc.rect(88, 145, 4, 510).fill('#e5e7eb');
phases.forEach((p, i) => {
  let phy = 145 + i * 130;
  doc.circle(90, phy + 12, 14).fill(p.color);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff').text(String(i + 1), 84, phy + 5, { lineBreak: false });
  doc.font('Helvetica').fontSize(9).fillColor(p.color).text(p.months, 118, phy);
  doc.font('Helvetica-Bold').fontSize(13).fillColor(DARK1).text(p.title, 118, phy + 14);
  doc.font('Helvetica').fontSize(9.5).fillColor('#555').text(p.body, 118, phy + 34, { width: W - 195 });
});

// ═══════════════════════════════════════════════════
// SLIDE 12: 24-MONTH VISION
// ═══════════════════════════════════════════════════
newSlide(DARK1);
slideLabel('LONG-TERM VISION', TEAL);
slideTitle('24-Month Growth Plan', '#ffffff');

const visions = [
  { title: 'Regional Expansion', body: 'Expand into Atlanta, Houston, Dallas, broader Southeast. 3 regional sales reps. Target 50+ hospitals. Establish ChartIQ as standard-of-care for shift handoffs in community hospitals.', color: BLUE },
  { title: 'Predictive Clinical Alerts', body: 'AI-powered patient deterioration detection. Analyze vitals, labs, and nursing notes to flag patients likely to code or transfer to ICU within 6-12 hours. Predictive intelligence.', color: TEAL },
  { title: 'Enterprise Health Systems', body: 'HCA: 186 hospitals, 46K beds = $4.4M/yr. Tenet: 60 hospitals = $1.5M/yr. CommonSpirit: 140 hospitals = $3.2M/yr. One enterprise deal replaces 20+ individual sales.', color: '#8b5cf6' },
  { title: 'KOSIQ + ChartIQ Bundle', body: 'Unified healthcare AI platform. Clinical operations + population health analytics. Single contract, single compliance stack. Two revenue streams per customer. Avg deal: $300-500K/yr.', color: '#f59e0b' }
];

visions.forEach((v, i) => {
  let vx = 60 + (i % 2) * 250;
  let vy = 135 + Math.floor(i / 2) * 170;
  doc.roundedRect(vx, vy, 238, 155, 10).fill(DARK2);
  doc.roundedRect(vx, vy, 5, 155, 2).fill(v.color);
  doc.font('Helvetica-Bold').fontSize(13).fillColor('#ffffff').text(v.title, vx + 18, vy + 16, { width: 205 });
  doc.font('Helvetica').fontSize(9.5).fillColor('#aaa').text(v.body, vx + 18, vy + 38, { width: 205 });
});

doc.roundedRect(60, 490, W - 120, 48, 8).fill(TEAL).opacity(0.1);
doc.opacity(1);
doc.font('Helvetica-Bold').fontSize(16).fillColor(TEAL).text('$6M+ ARR by Month 24', 80, 498);
doc.font('Helvetica').fontSize(9.5).fillColor('#888').text('100+ hospitals, national footprint, enterprise contracts, bundled platform revenue', 80, 518);

// ═══════════════════════════════════════════════════
// SLIDE 13: OUR TEAM
// ═══════════════════════════════════════════════════
newSlide(LIGHT2);
slideLabel('THE TEAM', BLUE);
slideTitle('Clinical Expertise Meets\nAI Execution', DARK1);

// Dr. JD
doc.roundedRect(60, 160, W - 120, 175, 10).fill('#ffffff');
doc.circle(120, 240, 38).fill(BLUE);
doc.font('Helvetica-Bold').fontSize(24).fillColor('#ffffff').text('JD', 101, 228);
doc.font('Helvetica-Bold').fontSize(17).fillColor(DARK1).text('Dr. JD Suarez', 180, 175);
doc.font('Helvetica-Bold').fontSize(11).fillColor(BLUE).text('Founder & Chief Medical Officer', 180, 196);
doc.font('Helvetica').fontSize(10).fillColor('#555').text(
  '30+ years in managed care medicine. Chief Medical Officer of a healthcare group in South Florida managing thousands of Medicare Advantage patients. Deep clinical credibility and relationships with hospital administrators, health system executives, and payer organizations across the region.',
  180, 218, { width: 360 }
);
doc.font('Helvetica').fontSize(10).fillColor('#555').text(
  'Dr. JD brings domain expertise, clinical validation, and industry relationships that make ChartIQ credible to hospital buyers from day one.',
  180, 280, { width: 360 }
);

// David
doc.roundedRect(60, 360, W - 120, 175, 10).fill('#ffffff');
doc.circle(120, 440, 38).fill(TEAL);
doc.font('Helvetica-Bold').fontSize(24).fillColor('#ffffff').text('DS', 102, 428);
doc.font('Helvetica-Bold').fontSize(17).fillColor(DARK1).text('David Suarez', 180, 375);
doc.font('Helvetica-Bold').fontSize(11).fillColor(TEAL).text('Co-Founder & Chief Product Officer', 180, 396);
doc.font('Helvetica').fontSize(10).fillColor('#555').text(
  'AI product builder who took both KOSIQ and ChartIQ from concept to working product in weeks. Combines technical AI expertise with deep understanding of healthcare workflows learned directly from clinical stakeholders.',
  180, 418, { width: 360 }
);
doc.font('Helvetica').fontSize(10).fillColor('#555').text(
  'David brings product vision, rapid execution, and the technical infrastructure that turns clinical insight into software hospitals actually use.',
  180, 478, { width: 360 }
);

// Team note
doc.roundedRect(60, 560, W - 120, 50, 8).fill('#eff6ff');
doc.font('Helvetica-Bold').fontSize(11).fillColor(BLUE).text('Father-Son Founding Team', 80, 568);
doc.font('Helvetica').fontSize(9.5).fillColor('#555').text('A practicing CMO who lives the problem daily + an AI product builder who ships solutions in days, not months.', 80, 585, { width: W - 160 });

// ═══════════════════════════════════════════════════
// SLIDE 14: THE ASK
// ═══════════════════════════════════════════════════
newSlide(DARK1);

doc.save(); doc.opacity(0.03);
doc.circle(W - 80, 100, 160).fill(BLUE);
doc.circle(80, H - 100, 140).fill(TEAL);
doc.restore();

doc.rect(W/2 - 40, 195, 80, 2).fill(BLUE);
drawCenteredLogo(220, 52, true);
doc.rect(W/2 - 40, 285, 80, 2).fill(BLUE);

doc.font('Helvetica').fontSize(14).fillColor('#cccccc');
doc.text('Part of the KOSIQ Family of Healthcare AI Products', 60, 310, { width: W - 120, align: 'center' });

const askMsgs = [
  'Shared infrastructure and compliance stack — one investment covers both products',
  'Two distinct revenue streams: clinical operations + population health analytics',
  'Two paths into every hospital: daily workflow tool opens the door for enterprise analytics',
  'Combined TAM: $500M+ across 6,000+ US hospitals'
];

askMsgs.forEach((msg, i) => {
  let ay = 355 + i * 50;
  doc.roundedRect(80, ay, W - 160, 38, 8).fill(DARK2);
  doc.circle(100, ay + 19, 10).fill(BLUE);
  doc.font('Helvetica-Bold').fontSize(10).fillColor('#ffffff').text(String(i + 1), 95, ay + 13, { lineBreak: false });
  doc.font('Helvetica').fontSize(10.5).fillColor('#cccccc').text(msg, 120, ay + 11, { width: W - 230 });
});

doc.rect(W/2 - 40, 575, 80, 2).fill(TEAL);
doc.font('Helvetica').fontSize(12).fillColor('#888').text("Let's talk", 0, 598, { width: W, align: 'center' });
doc.font('Helvetica-Bold').fontSize(17).fillColor(BLUE).text('david@iamdivid.com', 0, 620, { width: W, align: 'center' });
doc.font('Helvetica').fontSize(11).fillColor('#666').text('chartiq.kosiq.ai', 0, 648, { width: W, align: 'center' });

doc.roundedRect(80, 710, W - 160, 35, 8).lineWidth(1).stroke('#333');
doc.font('Helvetica').fontSize(9).fillColor('#555');
doc.text('Confidential', 100, 722, { lineBreak: false });
doc.text('March 2026', 400, 722, { width: 112, align: 'right', lineBreak: false });

doc.rect(W/2 - 25, 760, 50, 3).fill(BLUE);

doc.end();
console.log('ChartIQ Pitch Deck PDF generated!');
