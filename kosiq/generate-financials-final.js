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


// SLIDE 6: THE ASK
doc.addPage();
doc.rect(0,0,W,H).fill(WHITE);

doc.font('Helvetica-Bold').fontSize(32).fillColor(TEXT).text('The Investment Ask', LM, 40);
doc.font('Helvetica').fontSize(16).fillColor(GRAY).text('Two scenarios — lean execution vs full acceleration', LM, 80);

var col1X = LM, col2X = 980, colW2 = 800;

// 12-MONTH BOX
doc.save().roundedRect(col1X, 115, colW2, 870, 12).fill('#f8f9fa').restore();
doc.roundedRect(col1X, 115, colW2, 870, 12).strokeColor('#26acf7').lineWidth(2).stroke();

doc.font('Helvetica-Bold').fontSize(20).fillColor('#26acf7').text('12 Months — $1.2M', col1X+25, 130);
doc.font('Helvetica').fontSize(12).fillColor('#86868b').text('Prove product-market fit, sign first clients, reach breakeven', col1X+25, 155);

var items12 = [
  ['ENGINEERING ($555K)', ''],
  ['Lead Backend Engineer', '$160K — data pipelines, FHIR, payer APIs'],
  ['Full-Stack Engineer', '$140K — product features, UI, dashboards'],
  ['AI/ML Engineer (6-mo contract)', '$75K — risk models, NLP, predictive'],
  ['CPO (David Suarez)', '$180K — product architecture + clients'],
  ['', ''],
  ['SALES & GROWTH ($186K)', ''],
  ['VP Sales — Healthcare', '$150K — existing FL managed care relationships'],
  ['Marketing & Conferences', '$36K — HIMSS, AHIP FL, LinkedIn'],
  ['', ''],
  ['INFRASTRUCTURE ($161K)', ''],
  ['AWS Cloud (HIPAA)', '$48K — $4K/mo compute, storage, BAA'],
  ['AI API (Claude/Bedrock)', '$36K — $3K/mo, scales with patients'],
  ['Third-Party Services', '$12K — auth, monitoring, email'],
  ['SOC2 + HIPAA Compliance', '$40K — one-time certification'],
  ['Legal (BAAs, MSAs)', '$25K — healthcare contracts'],
  ['', ''],
  ['CLINICAL ($15K)', ''],
  ['Dr. JD Suarez (CMO)', 'Equity only — clinical credibility'],
  ['Advisory Board', '$15K — 2-3 physician advisors'],
  ['', ''],
  ['BUFFER ($103K)', ''],
  ['Working Capital Reserve', '$103K — 2-mo extra runway'],
];

var iy = 180;
items12.forEach(function(r) {
  if (!r[0] && !r[1]) { iy += 5; return; }
  if (r[0].match(/^[A-Z]/) && r[0].includes('(')) {
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#26acf7').text(r[0], col1X+25, iy, {width:750});
    iy += 14; return;
  }
  doc.font('Helvetica').fontSize(10).fillColor('#1d1d1f').text(r[0], col1X+25, iy, {width:240});
  doc.font('Helvetica').fontSize(10).fillColor(r[1].includes('Equity')?'#059669':'#86868b').text(r[1], col1X+270, iy, {width:500});
  iy += 14;
});

iy += 8;
doc.rect(col1X+25, iy, colW2-50, 1).fill('#e0e0e0'); iy += 8;
doc.font('Helvetica-Bold').fontSize(16).fillColor('#1d1d1f').text('Total:', col1X+25, iy);
doc.font('Helvetica-Bold').fontSize(20).fillColor('#26acf7').text('$1,200,000', col1X+400, iy-2, {width:350, align:'right'});
iy += 30;

doc.font('Helvetica-Bold').fontSize(11).fillColor('#1d1d1f').text('12-Month Outcomes:', col1X+25, iy); iy += 16;
['5 client organizations signed', '15,000 members on platform', '$3.1M ARR run rate', 'Breakeven by month 10', 'SOC2 + HIPAA certified', 'Ready for Series A at $40-60M valuation'].forEach(function(m) {
  doc.font('Helvetica').fontSize(10).fillColor('#1d1d1f').text('• ' + m, col1X+25, iy, {width:740}); iy += 13;
});
iy += 8;
doc.font('Helvetica-Bold').fontSize(12).fillColor('#059669').text('Equity: 15-20%  |  Pre-money: $6-8M', col1X+25, iy);

// 24-MONTH BOX
doc.save().roundedRect(col2X, 115, colW2, 870, 12).fill('#eef6ff').restore();
doc.roundedRect(col2X, 115, colW2, 870, 12).strokeColor('#26acf7').lineWidth(2).stroke();

doc.font('Helvetica-Bold').fontSize(20).fillColor('#26acf7').text('24 Months — $2.5M', col2X+25, 130);
doc.font('Helvetica').fontSize(12).fillColor('#86868b').text('Full team, aggressive growth, may skip Series A entirely', col2X+25, 155);

var items24 = [
  ['ENGINEERING ($1.5M)', ''],
  ['Lead Backend Engineer', '$320K — 2yr, senior, data architecture'],
  ['Full-Stack Engineer', '$280K — 2yr, product velocity'],
  ['AI/ML Engineer', '$300K — 2yr, proprietary risk models'],
  ['DevOps / Infra Engineer', '$240K — 2yr, HIPAA infra, CI/CD'],
  ['CPO (David Suarez)', '$360K — 2yr, product + clients'],
  ['', ''],
  ['SALES & GROWTH ($660K)', ''],
  ['VP Sales — Healthcare', '$300K — 2yr, builds sales team'],
  ['Account Executive (Y2)', '$170K — second seller, Y2 hire'],
  ['SDR / Lead Gen', '$110K — 2yr, pipeline building'],
  ['Marketing & Conferences', '$80K — HIMSS, AHIP, case studies'],
  ['', ''],
  ['INFRASTRUCTURE ($331K)', ''],
  ['AWS Cloud (HIPAA)', '$108K — $4.5K/mo avg, scaling'],
  ['AI API Costs', '$84K — $3.5K/mo avg, scales w/ volume'],
  ['Third-Party Services', '$24K — $1K/mo'],
  ['SOC2 + HITRUST', '$65K — both certs for enterprise'],
  ['Legal & Compliance', '$50K — ongoing BAAs, state regs'],
  ['', ''],
  ['CLINICAL ($55K)', ''],
  ['Dr. JD Suarez (CMO)', 'Equity only — clinical strategy'],
  ['Advisory Board', '$30K — 2yr, 3-4 advisors'],
  ['Clinical Validation Study', '$25K — published outcomes data'],
  ['', ''],
  ['BUFFER ($254K)', ''],
  ['Working Capital Reserve', '$254K — 3-mo runway buffer'],
];

var iy2 = 180;
items24.forEach(function(r) {
  if (!r[0] && !r[1]) { iy2 += 5; return; }
  if (r[0].match(/^[A-Z]/) && r[0].includes('(')) {
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#26acf7').text(r[0], col2X+25, iy2, {width:750});
    iy2 += 14; return;
  }
  doc.font('Helvetica').fontSize(10).fillColor('#1d1d1f').text(r[0], col2X+25, iy2, {width:240});
  doc.font('Helvetica').fontSize(10).fillColor(r[1].includes('Equity')?'#059669':'#86868b').text(r[1], col2X+270, iy2, {width:500});
  iy2 += 14;
});

iy2 += 8;
doc.rect(col2X+25, iy2, colW2-50, 1).fill('#e0e0e0'); iy2 += 8;
doc.font('Helvetica-Bold').fontSize(16).fillColor('#1d1d1f').text('Total:', col2X+25, iy2);
doc.font('Helvetica-Bold').fontSize(20).fillColor('#26acf7').text('$2,500,000', col2X+400, iy2-2, {width:350, align:'right'});
iy2 += 30;

doc.font('Helvetica-Bold').fontSize(11).fillColor('#1d1d1f').text('24-Month Outcomes:', col2X+25, iy2); iy2 += 16;
['16 client organizations signed', '65,000 members on platform', '$18.6M ARR run rate', 'Cash-flow positive by month 10', 'SOC2 + HITRUST certified', '$13.5M cumulative free cash flow', 'Series A optional — self-funded growth possible', 'Regional market leader, SE Florida'].forEach(function(m) {
  doc.font('Helvetica').fontSize(10).fillColor('#1d1d1f').text('• ' + m, col2X+25, iy2, {width:740}); iy2 += 13;
});
iy2 += 8;
doc.font('Helvetica-Bold').fontSize(12).fillColor('#059669').text('Equity: 15-20%  |  Pre-money: $12.5-16.5M', col2X+25, iy2);

doc.font('Helvetica').fontSize(12).fillColor('#86868b').text('KOSIQ  |  Confidential  |  Slide 6', 0, H-35, {width:W, align:'center'});

doc.end();
console.log('KOSIQ-Financials-2026.pdf generated (6 slides)');
