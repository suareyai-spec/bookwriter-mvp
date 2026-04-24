const PDFDocument = require('pdfkit');
const fs = require('fs');
const doc = new PDFDocument({ size: [1920, 1080], margin: 0 });
doc.pipe(fs.createWriteStream('KOSIQ-Financials-2026.pdf'));
const W = 1920, H = 1080, BLUE = '#26acf7', DARK = '#0a0a0f', WHITE = '#fff', TEXT = '#1d1d1f', GRAY = '#86868b', GREEN = '#10b981', LM = 100, RM = 100;
const CW = W - LM - RM;

function footer(n) { doc.font('Helvetica').fontSize(12).fillColor(GRAY).text('KOSIQ  |  Confidential  |  Slide '+n, 0, H-35, {width:W, align:'center'}); }
function lightBg() { doc.rect(0,0,W,H).fill(WHITE); }
function darkBg() { doc.rect(0,0,W,H).fill(DARK); }
function heading(t, y) { doc.font('Helvetica-Bold').fontSize(32).fillColor(TEXT).text(t, LM, y || 45); }
function subhead(t, y) { doc.font('Helvetica').fontSize(16).fillColor(GRAY).text(t, LM, y || 85, {width: CW}); }
function sectionLine(y) { doc.rect(LM, y, CW, 2).fill(BLUE); }
function label(t,x,y,w) { doc.font('Helvetica').fontSize(11).fillColor(GRAY).text(t,x,y,{width:w||200}); }
function val(t,x,y,w,c) { doc.font('Helvetica-Bold').fontSize(13).fillColor(c||TEXT).text(t,x,y,{width:w||200}); }

// ════════════════════════════════════════════════
// SLIDE 1: COST STRUCTURE — What It Costs to Run KOSIQ
// ════════════════════════════════════════════════
lightBg();
heading('Cost Structure: What It Costs to Run KOSIQ');
subhead('Every dollar explained — from infrastructure to customer acquisition');

// SECTION A: Cost Per Patient
sectionLine(130);
doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text('A. Cost Per Member (Patient)', LM, 145);

const cpmData = [
  ['Cloud Hosting (AWS/Vercel)', '$0.008/mo', 'Database storage, compute, CDN for one patient record'],
  ['AI Processing (Claude API)', '$0.022/mo', 'Risk scoring, chart summarization, clinical alerts — avg 3 AI calls/patient/mo'],
  ['Data Pipeline & ETL', '$0.005/mo', 'Ingesting claims feeds, lab results, ADT notifications per patient'],
  ['Security & Compliance (HIPAA)', '$0.003/mo', 'Encryption, audit logs, access controls, SOC2 infrastructure'],
  ['Support & Maintenance', '$0.007/mo', 'Pro-rated customer support, bug fixes, uptime monitoring'],
];
let cy = 180;
doc.font('Helvetica-Bold').fontSize(11).fillColor(GRAY);
doc.text('Cost Component', LM, cy, {width:280}); doc.text('Cost/Member/Mo', LM+300, cy, {width:130}); doc.text('What This Covers', LM+450, cy, {width:600});
cy += 20; doc.rect(LM, cy-2, 1050, 1).fill('#e0e0e0');
let totalCPM = 0;
cpmData.forEach(r => {
  const v = parseFloat(r[1].replace('$',''));
  totalCPM += v;
  doc.font('Helvetica').fontSize(12).fillColor(TEXT).text(r[0], LM, cy+2, {width:280});
  doc.font('Helvetica-Bold').fontSize(12).fillColor(BLUE).text(r[1], LM+300, cy+2, {width:130});
  doc.font('Helvetica').fontSize(11).fillColor(GRAY).text(r[2], LM+450, cy+2, {width:600});
  cy += 24;
});
doc.rect(LM, cy, 1050, 1).fill('#e0e0e0'); cy += 6;
doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT).text('Total Cost Per Member', LM, cy, {width:280});
doc.font('Helvetica-Bold').fontSize(14).fillColor('#059669').text('$0.045/mo ($0.54/yr)', LM+300, cy, {width:300});
cy += 20;
doc.font('Helvetica').fontSize(12).fillColor(TEXT).text('Revenue per member: $1.25/mo  |  Cost per member: $0.045/mo  |  ', LM, cy, {width:600, continued:true});
doc.font('Helvetica-Bold').fontSize(12).fillColor(GREEN).text('Gross margin per member: 96.4%');

// SECTION B: Monthly Operating Costs
cy += 50;
sectionLine(cy); cy += 15;
doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text('B. Monthly Operating Costs (Year 1 — Pre-Scale)', LM, cy); cy += 35;

const opCosts = [
  ['Infrastructure & Hosting', '$1,800/mo', 'AWS (EC2, RDS, S3), Vercel, monitoring tools, SSL certs'],
  ['AI/ML API Costs', '$2,400/mo', 'Anthropic Claude for risk scoring, chart summarization, clinical AI — scales with patients'],
  ['Third-Party Services', '$800/mo', 'Auth0, Stripe, email (Klaviyo), error tracking (Sentry), analytics'],
  ['Engineering Salaries', '$35,000/mo', '2 full-stack engineers at $180K/yr avg + CPO (David) at $180K/yr'],
  ['Sales & BD', '$8,000/mo', '1 sales rep ($96K/yr) focused on South FL managed care groups'],
  ['Legal & Compliance', '$2,000/mo', 'HIPAA compliance officer (fractional), legal counsel retainer'],
  ['Office & Misc', '$1,500/mo', 'Co-working space, travel to client sites, software subscriptions'],
];
doc.font('Helvetica-Bold').fontSize(11).fillColor(GRAY);
doc.text('Category', LM, cy, {width:250}); doc.text('Monthly Cost', LM+270, cy, {width:130}); doc.text('Details', LM+420, cy, {width:650});
cy += 18; doc.rect(LM, cy-2, 1100, 1).fill('#e0e0e0');
let totalOp = 0;
opCosts.forEach(r => {
  const v = parseInt(r[1].replace(/[\$,\/mo]/g,''));
  totalOp += v;
  doc.font('Helvetica').fontSize(12).fillColor(TEXT).text(r[0], LM, cy+2, {width:250});
  doc.font('Helvetica-Bold').fontSize(12).fillColor(BLUE).text(r[1], LM+270, cy+2, {width:130});
  doc.font('Helvetica').fontSize(11).fillColor(GRAY).text(r[2], LM+420, cy+2, {width:650});
  cy += 22;
});
doc.rect(LM, cy, 1100, 1).fill('#e0e0e0'); cy += 6;
doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT).text('Total Monthly Burn', LM, cy, {width:250});
doc.font('Helvetica-Bold').fontSize(14).fillColor('#ef4444').text('$51,500/mo ($618K/yr)', LM+270, cy, {width:300});
cy += 22;
doc.font('Helvetica-Bold').fontSize(13).fillColor(GREEN).text('Breakeven: ~4,300 members at $1.25 PMPM ($5,375/mo revenue covers $51.5K burn → need 9.6 clients avg 450 members or 1 client with 4,300 members)', LM, cy, {width: CW});

// SECTION C: right side — burn vs revenue chart concept
const rX = 1200;
doc.save().roundedRect(rX, 130, 600, 220, 12).fill('#f8f9fa').restore();
doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT).text('Year 1 Cash Flow Summary', rX+20, 145, {width:560});
const cfRows = [
  ['Total Revenue (Year 1)', '$1.74M', GREEN],
  ['Total Operating Costs', '-$618K', '#ef4444'],
  ['Customer Acquisition', '-$54K', '#ef4444'],
  ['Net Cash Flow', '+$1.07M', GREEN],
  ['Cash on Hand (if $500K raise)', '$1.57M', BLUE],
];
let cfy = 172;
cfRows.forEach(r => {
  doc.font(r[0].includes('Net')||r[0].includes('Cash on') ? 'Helvetica-Bold' : 'Helvetica').fontSize(13).fillColor(TEXT).text(r[0], rX+20, cfy, {width:350});
  doc.font('Helvetica-Bold').fontSize(13).fillColor(r[2]).text(r[1], rX+380, cfy, {width:180, align:'right'});
  cfy += 24;
  if (r[0].includes('Acquisition')) { doc.rect(rX+20, cfy-4, 560, 1).fill('#e0e0e0'); cfy += 4; }
});

footer(1);

// ════════════════════════════════════════════════
// SLIDE 2: CAC BREAKDOWN — Why $18K and How It Drops
// ════════════════════════════════════════════════
doc.addPage(); lightBg();
heading('Customer Acquisition: The $18K Explained');
subhead('CAC is front-loaded and drops dramatically at scale. Here is exactly where every dollar goes.');

sectionLine(125);
doc.font('Helvetica-Bold').fontSize(20).fillColor(TEXT).text('Breaking Down the $18K CAC (Per Organization)', LM, 140);

const cacBreakdown = [
  ['Sales Rep Time (3-month cycle)', '$6,200', 'Healthcare sales cycles avg 90 days. Includes demos, security review, legal/procurement. 1 rep closes ~5 deals/yr.'],
  ['Integration & Onboarding', '$4,800', 'Data migration from existing EMR/analytics. Claims feed setup. SFTP configuration. Staff training (2-3 sessions).'],
  ['Technical Setup', '$2,500', 'Custom dashboards, role-based access, org-specific quality measures, payer contract mapping.'],
  ['Marketing & Lead Gen', '$2,000', 'Conference attendance (HIMSS, AHIP), content marketing, LinkedIn outreach. Pro-rated per closed deal.'],
  ['Legal & Contracting', '$1,500', 'BAA execution, MSA negotiation, security questionnaire completion. Healthcare procurement is complex.'],
  ['Travel & Client Visits', '$1,000', 'On-site visits during sales cycle and implementation. South FL focused = low travel costs.'],
];
let cacY = 175;
doc.font('Helvetica-Bold').fontSize(11).fillColor(GRAY);
doc.text('Component', LM, cacY, {width:280}); doc.text('Cost', LM+300, cacY, {width:100}); doc.text('Why This Costs What It Does', LM+420, cacY, {width:700});
cacY += 18; doc.rect(LM, cacY-2, 1200, 1).fill('#e0e0e0');
let totalCAC = 0;
cacBreakdown.forEach(r => {
  totalCAC += parseInt(r[1].replace(/[\$,]/g,''));
  doc.font('Helvetica').fontSize(12).fillColor(TEXT).text(r[0], LM, cacY+2, {width:280});
  doc.font('Helvetica-Bold').fontSize(12).fillColor(BLUE).text(r[1], LM+300, cacY+2, {width:100});
  doc.font('Helvetica').fontSize(11).fillColor(GRAY).text(r[2], LM+420, cacY+2, {width:700});
  cacY += 28;
});
doc.rect(LM, cacY, 1200, 1).fill('#e0e0e0'); cacY += 6;
doc.font('Helvetica-Bold').fontSize(14).fillColor(TEXT).text('Total CAC Per Organization', LM, cacY, {width:280});
doc.font('Helvetica-Bold').fontSize(14).fillColor('#ef4444').text('$18,000', LM+300, cacY, {width:100});

// CAC per member math
cacY += 40;
sectionLine(cacY); cacY += 15;
doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT).text('CAC Per Member Depends on Client Size', LM, cacY); cacY += 30;

const cacPerMember = [
  ['Small practice (5,000 members)', '$18,000 / 5,000', '$3.60', 'Higher CAC per member but still profitable at $1.25+ PMPM'],
  ['Mid-size group (20,000 members)', '$18,000 / 20,000', '$0.90', 'Sweet spot — high volume, same sales effort'],
  ['Large MCO (60,000+ members)', '$18,000 / 60,000', '$0.30', 'Enterprise deal — same CAC, massive member base'],
];
doc.font('Helvetica-Bold').fontSize(11).fillColor(GRAY);
doc.text('Client Type', LM, cacY, {width:280}); doc.text('Math', LM+300, cacY, {width:200}); doc.text('CAC/Member', LM+520, cacY, {width:100}); doc.text('Note', LM+640, cacY, {width:500});
cacY += 18; doc.rect(LM, cacY-2, 1200, 1).fill('#e0e0e0');
cacPerMember.forEach(r => {
  doc.font('Helvetica').fontSize(12).fillColor(TEXT).text(r[0], LM, cacY+2, {width:280});
  doc.font('Helvetica').fontSize(11).fillColor(GRAY).text(r[1], LM+300, cacY+2, {width:200});
  doc.font('Helvetica-Bold').fontSize(13).fillColor(GREEN).text(r[2], LM+520, cacY+2, {width:100});
  doc.font('Helvetica').fontSize(11).fillColor(GRAY).text(r[3], LM+640, cacY+2, {width:500});
  cacY += 26;
});

// How CAC drops at scale
cacY += 30;
sectionLine(cacY); cacY += 15;
doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT).text('How CAC Drops Over Time', LM, cacY); cacY += 30;

const cacScale = [
  ['Year 1', '$18,000', '3 clients', 'Cold outreach, building brand, first references'],
  ['Year 2', '$14,000', '8 clients', 'Referrals start. Case studies from Year 1 clients reduce sales cycle.'],
  ['Year 3', '$10,000', '16 clients', 'Inbound leads from conference presence. Brand recognition in SE FL market.'],
  ['Year 4', '$7,000', '28 clients', 'Network effects. Clients refer peers. Marketing spend per deal drops 60%.'],
  ['Year 5', '$5,000', '42 clients', 'Category leader in region. Most deals inbound. Sales cycle drops to 45 days.'],
];
doc.font('Helvetica-Bold').fontSize(11).fillColor(GRAY);
doc.text('Year', LM, cacY, {width:80}); doc.text('CAC/Org', LM+100, cacY, {width:100}); doc.text('Clients', LM+220, cacY, {width:80}); doc.text('Why It Drops', LM+320, cacY, {width:800});
cacY += 18; doc.rect(LM, cacY-2, 1200, 1).fill('#e0e0e0');
cacScale.forEach(r => {
  doc.font('Helvetica-Bold').fontSize(12).fillColor(TEXT).text(r[0], LM, cacY+2, {width:80});
  doc.font('Helvetica-Bold').fontSize(12).fillColor(BLUE).text(r[1], LM+100, cacY+2, {width:100});
  doc.font('Helvetica').fontSize(12).fillColor(TEXT).text(r[2], LM+220, cacY+2, {width:80});
  doc.font('Helvetica').fontSize(11).fillColor(GRAY).text(r[3], LM+320, cacY+2, {width:800});
  cacY += 24;
});

footer(2);

// ════════════════════════════════════════════════
// SLIDE 3: UNIT ECONOMICS + MARGINS (Light)
// ════════════════════════════════════════════════
doc.addPage(); lightBg();
heading('Unit Economics & Margin Structure');
subhead('Per-member profitability and how margins expand at scale');

// Cards
const ueCards = [
  {label:'Revenue/Member/Mo', value:'$1.25', sub:'Blended avg across tiers'},
  {label:'Cost/Member/Mo', value:'$0.045', sub:'Infrastructure + AI + support'},
  {label:'Gross Profit/Member', value:'$1.205', sub:'96.4% gross margin per member'},
  {label:'LTV (36 months)', value:'$43.38', sub:'$1.205 × 36 months'},
  {label:'CAC/Member (avg)', value:'$1.20', sub:'$18K org / 15K avg members'},
  {label:'LTV:CAC', value:'36:1', sub:'Exceptional for enterprise SaaS'},
  {label:'Payback Period', value:'1 month', sub:'First PMPM payment > CAC/member'},
  {label:'Net Revenue Retention', value:'115%+', sub:'Members grow within existing clients'},
];
const cardW = (CW - 70) / 4;
ueCards.forEach((c,i) => {
  const col = i%4, row = Math.floor(i/4);
  const cx = LM + col*(cardW+23), cy2 = 130 + row*130;
  doc.save().roundedRect(cx, cy2, cardW, 110, 10).fill('#f8f9fa').restore();
  doc.roundedRect(cx, cy2, cardW, 110, 10).strokeColor('#e5e7eb').lineWidth(1).stroke();
  doc.font('Helvetica').fontSize(11).fillColor(GRAY).text(c.label, cx+16, cy2+14, {width:cardW-32});
  doc.font('Helvetica-Bold').fontSize(32).fillColor(BLUE).text(c.value, cx+16, cy2+34, {width:cardW-32});
  doc.font('Helvetica').fontSize(10).fillColor(GRAY).text(c.sub, cx+16, cy2+78, {width:cardW-32});
});

// Margin waterfall
const mwY = 410;
sectionLine(mwY);
doc.font('Helvetica-Bold').fontSize(18).fillColor(TEXT).text('Margin Waterfall — From Revenue to EBITDA', LM, mwY+12);

const mBars = [
  {label:'Revenue', pct:100, color:BLUE, note:'$1.25 PMPM × members'},
  {label:'COGS', pct:3.6, color:'#ef4444', note:'Cloud + AI = $0.045'},
  {label:'Gross Profit', pct:96.4, color:GREEN, note:'$1.205/member'},
  {label:'S&M', pct:22, color:'#f97316', note:'Sales reps, conferences'},
  {label:'R&D', pct:18, color:'#8b5cf6', note:'Engineering team'},
  {label:'G&A', pct:8, color:'#6b7280', note:'Legal, admin, office'},
  {label:'EBITDA', pct:48, color:'#059669', note:'Year 2+ target'},
];
const mbW = (CW - mBars.length*10) / mBars.length;
mBars.forEach((m,i) => {
  const mx = LM + i*(mbW+10);
  const maxH = 380;
  const mH = (m.pct/100)*maxH;
  const my = mwY + 50 + maxH - mH;
  doc.rect(mx, my, mbW, mH).fill(m.color);
  doc.font('Helvetica-Bold').fontSize(18).fillColor(WHITE).text(m.pct+'%', mx, my + mH/2 - 14, {width:mbW, align:'center'});
  doc.font('Helvetica-Bold').fontSize(11).fillColor(TEXT).text(m.label, mx, mwY+50+maxH+8, {width:mbW, align:'center'});
  doc.font('Helvetica').fontSize(9).fillColor(GRAY).text(m.note, mx, mwY+50+maxH+24, {width:mbW, align:'center'});
});

footer(3);

// ════════════════════════════════════════════════
// SLIDE 4: 5-YEAR P&L (Dark)
// ════════════════════════════════════════════════
doc.addPage(); darkBg();
doc.font('Helvetica-Bold').fontSize(32).fillColor(WHITE).text('5-Year Financial Projections', LM, 40);

doc.save().roundedRect(LM, 82, CW, 26, 4).fill('#1a1a2e').restore();
doc.font('Helvetica').fontSize(10).fillColor('#8888aa');
doc.text('ASSUMPTIONS: Avg client 15-30K members | PMPM declines at scale ($1.25 to $0.75) | 3 clients Y1, 42 Y5 | 36-mo contracts | 12% blended COGS | Zero churn | Integration fee per new client', LM+10, 86, {width:CW-20});

const tY = 120;
const cols = ['', 'Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'];
const colW = CW / cols.length;
cols.forEach((c,i) => {
  doc.font('Helvetica-Bold').fontSize(13).fillColor(i===0?'#666':BLUE).text(c, LM+i*colW, tY, {width:colW, align:i===0?'left':'center'});
});

const rows = [
  {l:'Members Under Management', v:['8,000','28,000','65,000','120,000','200,000'], b:false},
  {l:'Client Organizations', v:['3','8','16','28','42'], b:false},
  {l:'Avg PMPM Rate', v:['$1.25','$1.15','$1.00','$0.85','$0.75'], b:false},
  {l:'', v:['','','','',''], b:false},
  {l:'PMPM Revenue (annual)', v:['$120K','$3.86M','$7.80M','$12.2M','$18.0M'], b:false},
  {l:'Integration Fees', v:['$45K','$80K','$160K','$240K','$280K'], b:false},
  {l:'Total Revenue', v:['$1.74M','$7.08M','$18.6M','$38.4M','$62.0M'], b:true},
  {l:'', v:['','','','',''], b:false},
  {l:'Infrastructure (Cloud+AI)', v:['$43K','$151K','$351K','$648K','$1.08M'], b:false},
  {l:'Data & Third-Party', v:['$21K','$74K','$172K','$317K','$528K'], b:false},
  {l:'Total COGS', v:['$209K','$850K','$2.23M','$4.61M','$7.44M'], b:false},
  {l:'Gross Profit', v:['$1.53M','$6.23M','$16.4M','$33.8M','$54.6M'], b:true},
  {l:'Gross Margin', v:['88%','88%','88%','88%','88%'], b:false},
  {l:'', v:['','','','',''], b:false},
  {l:'Engineering (R&D)', v:['$600K','$1.1M','$2.5M','$4.8M','$7.2M'], b:false},
  {l:'Sales & Marketing', v:['$480K','$1.2M','$3.0M','$5.8M','$8.5M'], b:false},
  {l:'G&A (Legal, Admin, CPO)', v:['$300K','$500K','$1.0M','$1.8M','$2.8M'], b:false},
  {l:'Total OpEx', v:['$1.38M','$2.80M','$6.5M','$12.4M','$18.5M'], b:false},
  {l:'', v:['','','','',''], b:false},
  {l:'EBITDA', v:['$150K','$3.43M','$9.9M','$21.4M','$36.1M'], b:true},
  {l:'EBITDA Margin', v:['9%','48%','53%','56%','58%'], b:true},
  {l:'Cumulative Free Cash Flow', v:['$150K','$3.58M','$13.5M','$34.9M','$71.0M'], b:true},
];

let rY = tY + 26;
rows.forEach(row => {
  if (!row.l) { rY += 6; return; }
  if (row.b) doc.rect(LM-8, rY-1, CW+16, 22).fill('#1a1a2e');
  doc.font(row.b?'Helvetica-Bold':'Helvetica').fontSize(12).fillColor(row.b?WHITE:'#ccc').text(row.l, LM, rY+3, {width:colW});
  row.v.forEach((v,i) => {
    doc.font(row.b?'Helvetica-Bold':'Helvetica').fontSize(12).fillColor(row.b?BLUE:'#ddd').text(v, LM+(i+1)*colW, rY+3, {width:colW, align:'center'});
  });
  rY += 22;
});

// Bottom callouts
rY += 15;
doc.rect(LM, rY, CW, 2).fill(BLUE);
const bCalls = [['Month 8','Cash-flow positive'],['$62M','Year 5 ARR'],['58%','EBITDA margin at scale'],['$71M','Cumulative FCF by Y5'],['200K','Lives managed']];
const bW = CW/bCalls.length;
bCalls.forEach((c,i) => {
  doc.font('Helvetica-Bold').fontSize(24).fillColor(BLUE).text(c[0], LM+i*bW, rY+12, {width:bW, align:'center'});
  doc.font('Helvetica').fontSize(11).fillColor('#a1a1a6').text(c[1], LM+i*bW, rY+42, {width:bW, align:'center'});
});

footer(4);

// ════════════════════════════════════════════════
// SLIDE 5: TAM/SAM/SOM (Light)
// ════════════════════════════════════════════════
doc.addPage(); lightBg();
heading('Total Addressable Market');
subhead('KOSIQ operates across multiple $30B+ healthcare markets simultaneously');

const tCx = 460, tCy = 520;
doc.save().opacity(0.06); doc.circle(tCx, tCy, 360).fill(BLUE); doc.restore();
doc.circle(tCx, tCy, 360).strokeColor(BLUE).lineWidth(2).stroke();
doc.font('Helvetica-Bold').fontSize(14).fillColor(BLUE).text('TAM', tCx-200, tCy-340, {width:400, align:'center'});
doc.font('Helvetica-Bold').fontSize(52).fillColor(TEXT).text('$234B', tCx-200, tCy-315, {width:400, align:'center'});
doc.font('Helvetica').fontSize(12).fillColor(GRAY).text('EMR + RCM + Pop Health + VBC + Claims + Analytics', tCx-200, tCy-265, {width:400, align:'center'});

doc.save().opacity(0.10); doc.circle(tCx, tCy, 230).fill(BLUE); doc.restore();
doc.circle(tCx, tCy, 230).strokeColor(BLUE).lineWidth(2).stroke();
doc.font('Helvetica-Bold').fontSize(14).fillColor(BLUE).text('SAM', tCx-160, tCy-200, {width:320, align:'center'});
doc.font('Helvetica-Bold').fontSize(44).fillColor(TEXT).text('$48B', tCx-160, tCy-175, {width:320, align:'center'});
doc.font('Helvetica').fontSize(12).fillColor(GRAY).text('Managed Care + MA Plans\nneeding unified VBC platform', tCx-160, tCy-130, {width:320, align:'center'});

doc.save().opacity(0.16); doc.circle(tCx, tCy, 110).fill(BLUE); doc.restore();
doc.circle(tCx, tCy, 110).strokeColor(BLUE).lineWidth(2).stroke();
doc.font('Helvetica-Bold').fontSize(14).fillColor(BLUE).text('SOM', tCx-90, tCy-55, {width:180, align:'center'});
doc.font('Helvetica-Bold').fontSize(36).fillColor(TEXT).text('$2.4B', tCx-90, tCy-30, {width:180, align:'center'});
doc.font('Helvetica').fontSize(11).fillColor(GRAY).text('SE US 20-60K+\nmember groups', tCx-90, tCy+10, {width:180, align:'center'});

// Right side table
const mX = 880;
doc.font('Helvetica-Bold').fontSize(16).fillColor(TEXT).text('Markets KOSIQ Replaces', mX, 140);
doc.rect(mX, 165, 680, 2).fill(BLUE);

const mkts = [
  ['EMR/EHR Systems','$36.2B','6.3%','Straits Research'],
  ['Revenue Cycle Mgmt','$73.0B','12.4%','MarketsAndMarkets'],
  ['Population Health','$35.8B','17.2%','Grand View Research'],
  ['Healthcare Analytics','$21.4B','23.5%','GlobeNewsWire'],
  ['Claims Processing','$18.2B','8.1%','Fortune Business'],
  ['VBC Enablement','$15.4B','14.8%','KLAS Research'],
  ['Risk Adjustment/HCC','$8.6B','19.3%','Chilmark Research'],
  ['Quality/HEDIS Tracking','$5.2B','11.2%','Gartner'],
];
doc.font('Helvetica-Bold').fontSize(10).fillColor(GRAY);
doc.text('Market', mX, 175, {width:220}); doc.text('Size', mX+230, 175, {width:80, align:'right'}); doc.text('CAGR', mX+330, 175, {width:80, align:'right'}); doc.text('Source', mX+430, 175, {width:200});
let mY = 195;
mkts.forEach(m => {
  doc.font('Helvetica').fontSize(12).fillColor(TEXT).text(m[0], mX, mY, {width:220});
  doc.font('Helvetica-Bold').fontSize(12).fillColor(BLUE).text(m[1], mX+230, mY, {width:80, align:'right'});
  doc.font('Helvetica').fontSize(11).fillColor(GREEN).text(m[2], mX+330, mY, {width:80, align:'right'});
  doc.font('Helvetica-Oblique').fontSize(9).fillColor('#b0b0b0').text(m[3], mX+430, mY, {width:200});
  mY += 22;
});
doc.rect(mX, mY+2, 500, 1).fill('#e0e0e0');
doc.font('Helvetica-Bold').fontSize(13).fillColor(TEXT).text('Combined', mX, mY+10, {width:220});
doc.font('Helvetica-Bold').fontSize(13).fillColor(BLUE).text('$213.8B', mX+230, mY+10, {width:80, align:'right'});

mY += 45;
doc.save().roundedRect(mX, mY, 680, 65, 8).fill('#eef6ff').restore();
doc.font('Helvetica-Bold').fontSize(12).fillColor(BLUE).text('WHY $234B:', mX+12, mY+10);
doc.font('Helvetica').fontSize(11).fillColor(TEXT).text('eClinicalWorks generates $700M+/yr. Epic is worth $50B+. Optum/UnitedHealth: $100B+ revenue. KOSIQ replaces 8 vendor categories with one platform — the TAM is every dollar organizations spend on fragmented healthcare operations software.', mX+12, mY+26, {width:656});

mY += 80;
doc.save().roundedRect(mX, mY, 680, 55, 8).fill('#f0fdf4').restore();
doc.font('Helvetica-Bold').fontSize(20).fillColor(GREEN).text('5.2M', mX+12, mY+10);
doc.font('Helvetica').fontSize(12).fillColor(TEXT).text('Medicare Advantage enrollees in Florida alone — the largest MA market in the US. KOSIQ starts here.', mX+80, mY+10, {width:600});

footer(5);

// SLIDE 6: THE ASK — $4M
doc.addPage();
doc.rect(0,0,W,H).fill(WHITE);

doc.font('Helvetica-Bold').fontSize(32).fillColor(TEXT).text('The Ask: $4,000,000', LM, 40);
doc.font('Helvetica').fontSize(16).fillColor(GRAY).text('24 months of runway with room to execute aggressively and never be strapped for cash', LM, 80);

// Left side — detailed breakdown
var bx = LM, bw = 1050;

doc.save().roundedRect(bx, 120, bw, 820, 12).fill('#f8f9fa').restore();
doc.roundedRect(bx, 120, bw, 820, 12).strokeColor('#26acf7').lineWidth(1).stroke();

var sections = [
  { title: 'ENGINEERING TEAM — $1,920,000 (48%)', items: [
    ['VP of Engineering', '$400K', '2yr — Built healthcare platforms before. Owns architecture, HIPAA infra, team management.'],
    ['Senior Backend Engineer', '$340K', '2yr — Data pipelines, FHIR/HL7, payer API integrations, claims processing.'],
    ['Full-Stack Engineer', '$300K', '2yr — Product features, client dashboards, real-time analytics UI.'],
    ['AI/ML Engineer', '$320K', '2yr — Proprietary risk models, NLP chart summarization, predictive analytics.'],
    ['DevOps / Security Engineer', '$280K', '2yr — HIPAA infrastructure, CI/CD, penetration testing, uptime.'],
    ['CPO (David Suarez)', '$280K', '2yr — Product vision, client relationships, investor relations.'],
  ]},
  { title: 'SALES & GROWTH — $920,000 (23%)', items: [
    ['VP of Sales — Healthcare', '$400K', '2yr — Must have existing MCO/MSO relationships in FL. Base + commission.'],
    ['Account Executive', '$280K', '2yr — Second seller, starts month 6. Enterprise healthcare sales experience.'],
    ['SDR / Pipeline Builder', '$120K', '2yr — Outbound prospecting, demo scheduling, CRM management.'],
    ['Marketing & Brand', '$120K', '2yr — HIMSS/AHIP conferences, case studies, LinkedIn, thought leadership content.'],
  ]},
  { title: 'INFRASTRUCTURE & COMPLIANCE — $480,000 (12%)', items: [
    ['AWS Cloud (HIPAA/BAA)', '$120K', '2yr — $5K/mo avg, auto-scales. EC2, RDS, S3, CloudWatch, WAF.'],
    ['AI API Costs (AWS Bedrock)', '$96K', '2yr — $4K/mo avg. Claude via Bedrock for HIPAA compliance (BAA covered).'],
    ['Third-Party Services', '$36K', '2yr — Auth0, Sentry, Klaviyo, analytics, monitoring.'],
    ['SOC2 Type II Audit', '$50K', 'One-time + annual renewal. Required by every enterprise client.'],
    ['HITRUST Certification', '$65K', 'Gold standard for healthcare. Opens doors to larger health systems.'],
    ['Legal & Compliance', '$80K', '2yr — BAA execution, MSA templates, state regs, outside counsel.'],
    ['D&O / E&O Insurance', '$33K', '2yr — Required for enterprise contracts and investor protection.'],
  ]},
  { title: 'CLINICAL & ADVISORY — $80,000 (2%)', items: [
    ['Dr. JD Suarez — CMO', 'EQUITY', 'Fractional. Clinical credibility, payer relationships, product validation.'],
    ['Clinical Advisory Board', '$40K', '2yr — 3-4 physicians, quarterly meetings, product input.'],
    ['Outcomes Validation Study', '$30K', 'Published data proving KOSIQ improves quality scores + reduces costs.'],
    ['Conference Speaking Slots', '$10K', 'Travel + fees to present at VBC / managed care industry events.'],
  ]},
  { title: 'WORKING CAPITAL & CONTINGENCY — $600,000 (15%)', items: [
    ['Cash Reserve (4 months)', '$400K', 'If sales cycle takes 9 months instead of 6, we do not die.'],
    ['Unexpected Regulatory Costs', '$100K', 'Healthcare regs change. State-level requirements emerge. We are covered.'],
    ['Opportunistic Hiring / M&A', '$100K', 'If a perfect hire or small acquisition appears, we can move fast.'],
  ]},
];

var sy = 138;
sections.forEach(function(sec) {
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#26acf7').text(sec.title, bx+20, sy, {width:bw-40});
  sy += 16;
  sec.items.forEach(function(item) {
    doc.font('Helvetica').fontSize(10).fillColor('#1d1d1f').text(item[0], bx+20, sy, {width:210});
    doc.font('Helvetica-Bold').fontSize(10).fillColor(item[1]==='EQUITY'?'#059669':'#1d1d1f').text(item[1], bx+235, sy, {width:70, align:'right'});
    doc.font('Helvetica').fontSize(9).fillColor('#86868b').text(item[2], bx+320, sy, {width:710});
    sy += 14;
  });
  sy += 10;
});

// Total
doc.rect(bx+20, sy-4, bw-40, 1).fill('#e0e0e0');
doc.font('Helvetica-Bold').fontSize(16).fillColor('#1d1d1f').text('TOTAL', bx+20, sy+4);
doc.font('Helvetica-Bold').fontSize(22).fillColor('#26acf7').text('$4,000,000', bx+700, sy, {width:300, align:'right'});

// Right side — outcomes & terms
var rx = 1200, rw = 600;

doc.save().roundedRect(rx, 120, rw, 400, 12).fill('#eef6ff').restore();
doc.roundedRect(rx, 120, rw, 400, 12).strokeColor('#26acf7').lineWidth(1).stroke();

doc.font('Helvetica-Bold').fontSize(16).fillColor('#26acf7').text('24-Month Outcomes', rx+20, 138, {width:rw-40});

var outcomes = [
  ['20+', 'Client organizations signed'],
  ['80,000+', 'Members on platform'],
  ['$22M+', 'ARR run rate'],
  ['Month 10', 'Cash-flow positive'],
  ['$15M+', 'Cumulative free cash flow'],
  ['SOC2 + HITRUST', 'Enterprise-ready certifications'],
  ['8', 'Full-time team members'],
  ['Never', 'Need another raise (Series A optional)'],
];

var oy = 168;
outcomes.forEach(function(o) {
  doc.font('Helvetica-Bold').fontSize(18).fillColor('#26acf7').text(o[0], rx+20, oy, {width:130});
  doc.font('Helvetica').fontSize(12).fillColor('#1d1d1f').text(o[1], rx+160, oy+3, {width:400});
  oy += 28;
});

// Terms box
doc.save().roundedRect(rx, 540, rw, 200, 12).fill('#f0fdf4').restore();
doc.roundedRect(rx, 540, rw, 200, 12).strokeColor('#059669').lineWidth(1).stroke();

doc.font('Helvetica-Bold').fontSize(16).fillColor('#059669').text('Proposed Terms', rx+20, 558, {width:rw-40});

var terms = [
  ['Raise Amount', '$4,000,000'],
  ['Equity', '15-20%'],
  ['Pre-Money Valuation', '$20-26.5M'],
  ['Structure', 'Priced equity round (SAFE or Series Seed)'],
  ['Board', 'Investor gets board observer seat'],
  ['Pro-Rata', 'Yes — right to maintain ownership in Series A'],
];

var ty = 585;
terms.forEach(function(t) {
  doc.font('Helvetica').fontSize(11).fillColor('#1d1d1f').text(t[0], rx+20, ty, {width:200});
  doc.font('Helvetica-Bold').fontSize(11).fillColor('#059669').text(t[1], rx+230, ty, {width:340});
  ty += 18;
});

// Why $4M box
doc.save().roundedRect(rx, 760, rw, 180, 12).fill('#fff7ed').restore();
doc.roundedRect(rx, 760, rw, 180, 12).strokeColor('#f97316').lineWidth(1).stroke();

doc.font('Helvetica-Bold').fontSize(14).fillColor('#f97316').text('Why $4M, Not Less?', rx+20, 778);
doc.font('Helvetica').fontSize(10).fillColor('#1d1d1f');
doc.text('Healthcare sales cycles are 6-9 months. Under-funded startups die waiting for procurement committees to sign. $4M gives us:', rx+20, 800, {width:rw-40});
var reasons = [
  '24 months of runway with zero revenue dependency',
  'Ability to hire credibility people (VP Eng, VP Sales)',
  'SOC2 + HITRUST before we need them, not after',
  '4-month cash buffer for the unexpected',
  'Negotiating leverage — we are never desperate',
];
var ry = 838;
reasons.forEach(function(r) {
  doc.font('Helvetica').fontSize(9).fillColor('#1d1d1f').text('• ' + r, rx+20, ry, {width:rw-40});
  ry += 13;
});

doc.font('Helvetica').fontSize(12).fillColor('#86868b').text('KOSIQ  |  Confidential  |  Slide 6', 0, H-35, {width:W, align:'center'});

doc.end();
console.log('KOSIQ-Financials-2026.pdf generated (6 slides)');
