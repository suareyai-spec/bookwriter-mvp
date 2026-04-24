const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: 'LETTER', margins: { top: 60, bottom: 40, left: 60, right: 60 }, autoFirstPage: false, bufferPages: true });
doc.pipe(fs.createWriteStream('KOSIQ-Pricing-Guide-2026.pdf'));

const BLUE = '#26acf7', DARK = '#1d1d1f', GRAY = '#86868b', WHITE = '#ffffff';
const GREEN = '#10b981', AMBER = '#f59e0b', PINK = '#ec4899', CYAN = '#06b6d4';
const PURPLE = '#8b5cf6', RED = '#ef4444', ORANGE = '#f97316', BLUE600 = '#3b82f6';
const LM = 60, W = 492; // 612 - 60*2

function np() { doc.addPage({ size: 'LETTER', margins: { top: 60, bottom: 40, left: 60, right: 60 } }); }
function logo(x, y, sz, white) {
  doc.font('Helvetica-Bold').fontSize(sz);
  doc.fillColor(white ? WHITE : '#231f20');
  const kw = doc.widthOfString('KOS');
  doc.text('KOS', x, y, { lineBreak: false });
  doc.fillColor(BLUE).text('IQ', x + kw, y, { lineBreak: false });
}
function bar(t) {
  doc.rect(0, 0, 612, 60).fill(DARK);
  logo(LM, 18, 18, true);
  if (t) doc.font('Helvetica').fontSize(10).fillColor('#aaa').text(t, 300, 22, { width: 252, align: 'right', lineBreak: false });
}
function sec(t, c, y) {
  doc.roundedRect(LM, y, W, 26, 3).fill(c);
  doc.font('Helvetica-Bold').fontSize(12).fillColor(WHITE).text(t, LM+10, y+7, { lineBreak: false });
  return y + 32;
}
function th(cs, y) {
  doc.rect(LM, y, W, 18).fill('#f0f0f5');
  cs.forEach(c => doc.font('Helvetica-Bold').fontSize(8).fillColor(GRAY).text(c.l, c.x, y+5, { width: c.w, align: c.a||'left', lineBreak: false }));
  return y + 20;
}
function tr(cs, vs, y, hl) {
  if (hl) doc.rect(LM, y, W, 18).fill('#f0fdf4');
  vs.forEach((v,i) => {
    const c = cs[i], clr = v.includes('SAVE') ? GREEN : DARK;
    doc.font(v.includes('SAVE')?'Helvetica-Bold':'Helvetica').fontSize(8).fillColor(clr).text(v, c.x, y+5, { width: c.w, align: c.a||'left', lineBreak: false });
  });
  return y + 18;
}
function ck(t, y) {
  doc.font('Helvetica').fontSize(10).fillColor(DARK).text('✓  '+t, LM+6, y, { lineBreak: false });
  return y + 16;
}

// ═══ P1 COVER ═══
np();
doc.rect(0,0,612,792).fill(DARK);
logo(LM, 80, 44, true);
doc.font('Helvetica-Bold').fontSize(30).fillColor(WHITE).text('Product & Pricing Guide', LM, 150, { lineBreak: false });
doc.font('Helvetica').fontSize(15).fillColor(GRAY).text('The Operating System for Value-Based Care', LM, 195, { lineBreak: false });
doc.fontSize(13).text('11 Integrated Products  ·  One Platform  ·  Competitive Pricing', LM, 220, { lineBreak: false });

const prods = [
  ['AtlasIQ','Population Health Intelligence',BLUE],['ClinIQ','AI Clinical Decision Trees',PURPLE],
  ['Risk Engine','HCC + ARC Risk Stratification',AMBER],['Quality','HEDIS, PCMH, Quality Measures',GREEN],
  ['Care Management','CCM, PCM, APCM, TCM, Care Plans',PINK],['RPM','Remote Patient Monitoring',CYAN],
  ['Behavioral Health','BHM + BHIS Integration','#a855f7'],['Cost Explorer','Claims Cost & Utilization',RED],
  ['Payer Analytics','Multi-Payer Dashboards',ORANGE],['BridgeIQ','Interoperability Hub',BLUE600],
  ['ChartIQ','AI Chart Summarization','#14b8a6'],
];
let py = 280;
prods.forEach(([n,d,c]) => {
  doc.rect(LM,py,8,18).fill(c);
  doc.font('Helvetica-Bold').fontSize(11).fillColor(WHITE).text(n, LM+16, py+3, { lineBreak: false });
  doc.font('Helvetica').fontSize(10).fillColor(GRAY).text(d, LM+168, py+4, { lineBreak: false });
  py += 24;
});
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('Confidential  ·  March 2026', LM, 580, { lineBreak: false });
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('david@kosiq.ai  ·  support@kosiq.ai  ·  kosiq.ai', LM, 598, { lineBreak: false });

// ═══ P2 STAND-ALONE ═══
np(); bar('Stand-Alone Product Pricing');
const c1=[{l:'Product',x:LM,w:130},{l:'Pricing',x:LM+130,w:150},{l:'Min/Mo',x:LM+280,w:70,a:'right'},{l:'Setup',x:LM+350,w:W-350,a:'right'}];
let y = 72;
y = sec('Population Health & Analytics', BLUE, y);
y = th(c1,y);
y = tr(c1,['AtlasIQ','$65/FTE provider/mo','$50/mo','Included'],y);
y = tr(c1,['ClinIQ (AI Trees)','$55/FTE provider/mo','$50/mo','Included'],y,1);
y = tr(c1,['Cost Explorer','$45/FTE provider/mo','$50/mo','Included'],y);
y = tr(c1,['Payer Analytics','$55/FTE provider/mo','$50/mo','Included'],y,1);
y += 8;
y = sec('Risk Adjustment & Quality', AMBER, y);
y = th(c1,y);
y = tr(c1,['HCC Module','$65/FTE provider/mo','$50/mo','Included'],y);
y = tr(c1,['ARC Stratification','$65/FTE provider/mo','$50/mo','Included'],y,1);
y = tr(c1,['HEDIS Analytics','$65/FTE provider/mo','$50/mo','Included'],y);
y = tr(c1,['PCMH Analytics','$65/FTE provider/mo','$50/mo','Included'],y,1);
y += 8;
y = sec('Care Management', PINK, y);
y = th(c1,y);
y = tr(c1,['CCM / PCM','$0.89/active patient/mo','$40/mo','Included'],y);
y = tr(c1,['TCM','$0.89/registered patient/mo','$40/mo','Included'],y,1);
y = tr(c1,['APCM','$0.89/active patient/mo','$40/mo','Included'],y);
y = tr(c1,['Care Plans','$40/FTE provider/mo','$40/mo','$1,500'],y,1);
y += 8;
y = sec('Specialty Modules', CYAN, y);
y = th(c1,y);
y = tr(c1,['RPM','$2.00/transaction/mo','$40/mo','Included'],y);
y = tr(c1,['Behavioral Health','$40/FTE provider/mo','$40/mo','Included'],y,1);
y = tr(c1,['BridgeIQ (Interop)','$55/FTE provider/mo','$50/mo','Included'],y);
y = tr(c1,['ChartIQ','$8 — $15/bed/mo','$250/mo','$2,500'],y,1);
y += 8;
doc.font('Helvetica').fontSize(8).fillColor(GRAY).text('All modules include standard implementation with 36-month term. Pricing is per FTE provider unless otherwise noted. Part-time providers prorated.', LM, y, { width: W, lineBreak: true });

// ═══ P3 BUNDLES ═══
np(); bar('Bundle Pricing — Save 20–40%');
y = 72;

// B1
y = sec('Bundle 1 — VBC Essentials', GREEN, y);
doc.font('Helvetica-Bold').fontSize(20).fillColor(DARK).text('$89', LM, y, { lineBreak: false });
doc.font('Helvetica').fontSize(11).fillColor(GRAY).text('/FTE provider/month', LM+42, y+6, { lineBreak: false });
doc.font('Helvetica-Bold').fontSize(10).fillColor(GREEN).text('SAVE 20%', LM+300, y+6, { lineBreak: false });
y += 26;
y = ck('AtlasIQ — Population Health Intelligence', y);
y = ck('HEDIS Analytics — Quality Measure Tracking', y);
y = ck('PCMH Analytics — Medical Home Recognition', y);
y = ck('Care Plans — Individualized Patient Care Plans', y);
doc.font('Helvetica').fontSize(7).fillColor(GRAY).text('Implementation included · $50/provider/mo bundle minimum', LM, y, { lineBreak: false }); y += 18;

// B2
y = sec('Bundle 2 — VBC Professional', BLUE, y);
doc.font('Helvetica-Bold').fontSize(20).fillColor(DARK).text('$129', LM, y, { lineBreak: false });
doc.font('Helvetica').fontSize(11).fillColor(GRAY).text('/FTE provider/month', LM+52, y+6, { lineBreak: false });
doc.font('Helvetica-Bold').fontSize(10).fillColor(GREEN).text('SAVE 30%', LM+300, y+6, { lineBreak: false });
y += 26;
y = ck('Everything in VBC Essentials, plus:', y);
y = ck('HCC Risk Adjustment — Coding gap detection & RAF scoring', y);
y = ck('ARC Risk Stratification — Morbidity-based population tiers', y);
y = ck('Cost Explorer — Claims cost analysis & utilization trends', y);
y = ck('CCM/PCM at $0.89/patient — Included in bundle minimum', y);
doc.font('Helvetica').fontSize(7).fillColor(GRAY).text('Implementation included · $50/provider/mo bundle minimum', LM, y, { lineBreak: false }); y += 18;

// B3
y = sec('Bundle 3 — VBC AI Enterprise', '#7C3AED', y);
doc.font('Helvetica-Bold').fontSize(20).fillColor(DARK).text('$179', LM, y, { lineBreak: false });
doc.font('Helvetica').fontSize(11).fillColor(GRAY).text('/FTE provider/month', LM+52, y+6, { lineBreak: false });
doc.font('Helvetica-Bold').fontSize(10).fillColor(GREEN).text('SAVE 40%', LM+300, y+6, { lineBreak: false });
y += 26;
y = ck('Everything in VBC Professional, plus:', y);
y = ck('ClinIQ — AI-powered clinical decision trees', y);
y = ck('Payer Analytics — Multi-payer performance dashboards', y);
y = ck('BridgeIQ — FHIR R4 interoperability hub', y);
y = ck('Behavioral Health — BHM + BHIS integration', y);
y = ck('TCM + APCM — Transitional & advanced primary care', y);
y = ck('AI Predictive & Prescriptive Analytics', y);
doc.font('Helvetica').fontSize(7).fillColor(GRAY).text('Implementation included · $50/provider/mo bundle minimum', LM, y, { lineBreak: false }); y += 18;

// Add-ons
y = sec('Optional Add-Ons (Any Bundle)', GRAY, y);
const a1=[{l:'Add-On',x:LM,w:150},{l:'Price',x:LM+150,w:160},{l:'Notes',x:LM+310,w:W-310}];
y = th(a1,y);
y = tr(a1,['RPM Module','$2.00/tx (volume discounts)','No extra provider min'],y);
y = tr(a1,['ChartIQ Bundle Rate','$8/bed/mo (discounted)','vs $10-15 stand-alone'],y,1);
y = tr(a1,['BH Wiley Content','$8/provider/mo','Licensed clinical library'],y);
y = tr(a1,['Custom Implementation','$800/day','Custom workflows & integrations'],y,1);

// ═══ P4 VOLUME + DETAIL ═══
np(); bar('Volume Pricing & Detail');
y = 72;

y = sec('RPM Volume Discounts', CYAN, y);
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('Legacy platforms charge a flat $2.50/transaction with no volume breaks. KOSIQ rewards scale automatically.', LM, y, { width: W }); y += 18;
const r1=[{l:'Monthly Volume',x:LM,w:140},{l:'Per Transaction',x:LM+140,w:100,a:'right'},{l:'100-Patient Est.',x:LM+240,w:110,a:'right'},{l:'vs Legacy',x:LM+350,w:W-350,a:'right'}];
y = th(r1,y);
y = tr(r1,['1 — 500 transactions','$2.00','$200/mo','SAVE 20%'],y);
y = tr(r1,['501 — 2,000','$1.75','$175/mo','SAVE 30%'],y,1);
y = tr(r1,['2,001 — 5,000','$1.50','$150/mo','SAVE 40%'],y);
y = tr(r1,['5,001+','$1.25','$125/mo','SAVE 50%'],y,1);
y += 10;

y = sec('Care Management Detail', PINK, y);
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('Activity-based pricing — pay only for patients actively enrolled in each program. No charges for inactive patients.', LM, y, { width: W }); y += 18;
const m1=[{l:'Module',x:LM,w:100},{l:'Unit',x:LM+100,w:170},{l:'Stand-Alone',x:LM+270,w:80,a:'right'},{l:'In Bundle',x:LM+350,w:W-350,a:'right'}];
y = th(m1,y);
y = tr(m1,['CCM','Per active patient/mo','$0.89','$0.89'],y);
y = tr(m1,['PCM','Per active patient/mo','$0.89','$0.89'],y,1);
y = tr(m1,['TCM','Per registered patient/mo','$0.89','$0.89'],y);
y = tr(m1,['APCM','Per active patient/mo','$0.89','$0.89'],y,1);
y = tr(m1,['Care Plans','Per FTE provider/mo','$40.00','Included B2/B3'],y);
y += 10;

y = sec('ChartIQ — AI Chart Summarization', '#14b8a6', y);
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('Replaces manual chart reading during shift handoffs. Summarizes hours of notes in seconds. Stand-alone or bundle add-on.', LM, y, { width: W }); y += 18;
const q1=[{l:'Facility Size',x:LM,w:140},{l:'Per Bed/Mo',x:LM+140,w:90,a:'right'},{l:'200-Bed Est.',x:LM+230,w:110,a:'right'},{l:'Setup',x:LM+340,w:W-340,a:'right'}];
y = th(q1,y);
y = tr(q1,['Under 100 beds','$15/bed','—','$2,500'],y);
y = tr(q1,['100 — 300 beds','$12/bed','$2,400/mo','$2,500'],y,1);
y = tr(q1,['300 — 500 beds','$10/bed','$2,000/mo','Included'],y);
y = tr(q1,['500+ beds','$8/bed','$1,600/mo','Included'],y,1);
y += 10;

y = sec('BridgeIQ — Interoperability Hub', BLUE600, y);
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('FHIR R4 native data exchange across hospitals, labs, pharmacies, payers, and wearables. Unified patient timeline.', LM, y, { width: W }); y += 18;
y = ck('Connects hospitals, labs, pharmacies, payers, and wearables in one view', y);
y = ck('FHIR R4 + HL7 v2.5 + NCPDP + 837/835 EDI support', y);
y = ck('Secure provider-to-provider messaging (HIPAA compliant)', y);
y = ck('Network directory with real-time connection status monitoring', y);
y = ck('Stand-alone: $55/FTE provider/mo  ·  Included free in Bundle 3', y);

// ═══ P5 COMPARISON ═══
np(); bar('KOSIQ vs Legacy Platforms');
y = 72;

y = sec('50-Provider Practice Comparison', RED, y);
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('Based on 50 FTE-provider managed care practice with 20,000 attributed Medicare Advantage patients.', LM, y, { width: W }); y += 18;
const v1=[{l:'Product Area',x:LM,w:155},{l:'Legacy',x:LM+155,w:95,a:'right'},{l:'KOSIQ',x:LM+250,w:90,a:'right'},{l:'You Save',x:LM+340,w:W-340,a:'right'}];
y = th(v1,y);
y = tr(v1,['PCMH + HEDIS + Care Plans','$4,950/mo','$4,450/mo','SAVE $500/mo'],y);
y = tr(v1,['+ HCC + Risk + Cost Explorer','$7,450/mo','$6,450/mo','SAVE $1,000/mo'],y,1);
y = tr(v1,['Full VBC AI Suite','$9,950/mo','$8,950/mo','SAVE $1,000/mo'],y);
y = tr(v1,['CCM (5,000 patients)','$4,950/mo','$4,450/mo','SAVE $500/mo'],y,1);
y = tr(v1,['RPM (2,000 transactions)','$5,000/mo','$3,500/mo','SAVE $1,500/mo'],y);
y += 2; doc.rect(LM,y,W,1.5).fill(DARK); y += 6;
doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text('TOTAL (Full Suite + CCM + RPM)', LM, y, { lineBreak: false });
doc.font('Helvetica-Bold').fontSize(9).fillColor(RED).text('$27,300/mo', LM+155, y, { width: 95, align: 'right', lineBreak: false });
doc.font('Helvetica-Bold').fontSize(9).fillColor(BLUE).text('$23,350/mo', LM+250, y, { width: 90, align: 'right', lineBreak: false });
doc.font('Helvetica-Bold').fontSize(9).fillColor(GREEN).text('$3,950/mo', LM+340, y, { width: W-340, align: 'right', lineBreak: false });
y += 18;
doc.roundedRect(LM,y,W,28,4).fill('#f0fdf4');
doc.font('Helvetica-Bold').fontSize(14).fillColor(GREEN).text('Annual Savings: $47,400', LM, y+6, { width: W, align: 'center', lineBreak: false });
y += 40;

y = sec('What KOSIQ Includes That Legacy Platforms Don\'t', BLUE, y);
y += 2;
y = ck('AI Predictive Analytics — hospitalization, ER, cost, and readmission risk models', y);
y = ck('AI Prescriptive Recommendations — patient-level interventions with projected ROI', y);
y = ck('ClinIQ AI Decision Trees — conversational AI for custom population analysis', y);
y = ck('ChartIQ Integration — AI chart summarization for clinical shift handoffs', y);
y = ck('BridgeIQ — native FHIR R4 interoperability hub, not bolted on after the fact', y);
y = ck('Modern Apple-Inspired UI — clean, intuitive design vs legacy 2005 interfaces', y);
y = ck('Implementation included on most modules — no surprise $1,000/day fees', y);
y = ck('Flexible terms available — no mandatory 36-month lock-in contracts required', y);
y = ck('Single vendor for 11 products — one login, one contract, one support team', y);
y = ck('AI Chat Assistant built into every screen for instant clinical insights', y);
y += 12;

y = sec('Why Practices Switch to KOSIQ', '#7C3AED', y);
y += 2;
doc.font('Helvetica').fontSize(10).fillColor(DARK);
const reasons = [
  'Lower cost: 10-20% savings across every module vs legacy platforms',
  'Better technology: AI-native architecture vs retrofitted legacy systems',
  'Faster deployment: most modules live in weeks, not months',
  'Modern interoperability: FHIR R4 native vs HL7-only legacy connectors',
  'One platform: consolidate 5-8 vendor contracts into one relationship',
  'Healthcare founders: built by a CMO and CPO who live value-based care',
];
reasons.forEach(r => { y = ck(r, y); });

// ═══ P6 ENTERPRISE ═══
np(); bar('Enterprise & Managed Care Pricing');
y = 72;

y = sec('PMPM Pricing — Full Platform Access', '#7C3AED', y);
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('For managed care organizations, ACOs, and health plans managing large populations. PMPM pricing includes all 11 KOSIQ products — no per-module charges. One rate covers everything.', LM, y, { width: W }); y += 30;
const p1=[{l:'Member Count',x:LM,w:140},{l:'PMPM',x:LM+140,w:80,a:'right'},{l:'Monthly',x:LM+220,w:110,a:'right'},{l:'Annual',x:LM+330,w:W-330,a:'right'}];
y = th(p1,y);
y = tr(p1,['60,000+ members','$0.50','$30,000+/mo','$360,000+/yr'],y,1);
y = tr(p1,['20,000 — 60,000','$1.25','$25K — $75K/mo','$300K — $900K/yr'],y);
y = tr(p1,['Under 20,000','$2.24','Up to $44,800/mo','Up to $537K/yr'],y,1);
y += 4;
doc.font('Helvetica').fontSize(8).fillColor(GRAY).text('Custom enterprise agreements for 100,000+ member organizations. Contact us.', LM, y, { lineBreak: false }); y += 16;

y = sec('Integration Services', ORANGE, y);
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('Dedicated data engineering, EHR integration, and analytics support. Required for PMPM enterprise clients.', LM, y, { width: W }); y += 18;
const i1=[{l:'Tier',x:LM,w:100},{l:'Monthly',x:LM+100,w:80,a:'right'},{l:'Includes',x:LM+190,w:W-190}];
y = th(i1,y);
y = tr(i1,['Standard','$10,000/mo','Claims ingestion, EHR feeds, reports, email support'],y);
y = tr(i1,['Professional','$15,000/mo','Real-time HL7/FHIR, custom dashboards, dedicated analyst'],y,1);
y = tr(i1,['Enterprise','$20,000/mo','Multi-site, custom AI, white-label, 24/7 priority support'],y);
y += 14;

y = sec('Example: 40,000-Member Managed Care Group', GREEN, y);
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('What a typical mid-size managed care organization would pay for full KOSIQ platform access:', LM, y, { width: W }); y += 18;
const e1=[{l:'Item',x:LM,w:220},{l:'Monthly',x:LM+220,w:100,a:'right'},{l:'Annual',x:LM+320,w:W-320,a:'right'}];
y = th(e1,y);
y = tr(e1,['KOSIQ Platform (40K × $1.25 PMPM)','$50,000','$600,000'],y);
y = tr(e1,['Professional Integration Services','$15,000','$180,000'],y,1);
y = tr(e1,['ChartIQ Add-On (200-bed hospital)','$2,400','$28,800'],y);
y += 2; doc.rect(LM,y,W,1.5).fill(DARK); y += 6;
y = tr(e1,['Total Investment','$67,400','$808,800'],y,1);
y += 4;
doc.font('Helvetica').fontSize(10).fillColor(GREEN).text('Estimated ROI: 3-5x through reduced ER visits, better risk capture, and quality bonuses.', LM, y, { width: W, lineBreak: false });
y += 20;

y = sec('Why Organizations Choose KOSIQ', BLUE, y);
y += 2;
y = ck('10-20% lower pricing than legacy platforms across every module', y);
y = ck('AI-native: predictive & prescriptive analytics built in from day one', y);
y = ck('Modern FHIR R4 interoperability vs legacy HL7-only systems', y);
y = ck('Implementation included — no hidden $1,000/day service fees', y);
y = ck('Volume discounts on RPM, Care Management, and ChartIQ', y);
y = ck('11 products, one vendor — single contract, single support team', y);
y = ck('Built by healthcare operators who understand managed care', y);
y += 14;

doc.roundedRect(LM, y, W, 50, 6).fill('#f0f9ff');
doc.font('Helvetica-Bold').fontSize(14).fillColor(DARK).text('Ready to see KOSIQ in action?', LM+14, y+8, { lineBreak: false });
doc.font('Helvetica').fontSize(10).fillColor(GRAY).text('Contact us for a personalized demo and custom pricing.', LM+14, y+26, { lineBreak: false });
doc.font('Helvetica-Bold').fontSize(10).fillColor(BLUE).text('david@kosiq.ai  ·  support@kosiq.ai  ·  kosiq.ai', LM+14, y+40, { lineBreak: false });

doc.end();
console.log('Pages:', doc.bufferedPageRange().count);
