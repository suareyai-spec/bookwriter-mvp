const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: 'LETTER', margins: { top: 50, bottom: 40, left: 60, right: 60 }, autoFirstPage: false, bufferPages: true });
doc.pipe(fs.createWriteStream('KOSIQ-Revenue-Roadmap-2026.pdf'));

const BLUE = '#26acf7', DARK = '#1d1d1f', GRAY = '#86868b', WHITE = '#ffffff';
const GREEN = '#10b981', AMBER = '#f59e0b', RED = '#ef4444', PURPLE = '#7C3AED';
const LM = 60, W = 492;

function np() { doc.addPage({ size: 'LETTER', margins: { top: 50, bottom: 40, left: 60, right: 60 } }); }
function logo(x, y, sz) {
  doc.font('Helvetica-Bold').fontSize(sz);
  const kw = doc.widthOfString('KOS');
  doc.fillColor(WHITE).text('KOS', x, y, { lineBreak: false });
  doc.fillColor(BLUE).text('IQ', x + kw, y, { lineBreak: false });
}
function bar(t) {
  doc.rect(0, 0, 612, 50).fill(DARK);
  logo(LM, 15, 16);
  if (t) doc.font('Helvetica').fontSize(9).fillColor('#aaa').text(t, 320, 18, { width: 232, align: 'right', lineBreak: false });
}
function sec(t, c, y) {
  doc.roundedRect(LM, y, W, 22, 3).fill(c);
  doc.font('Helvetica-Bold').fontSize(10).fillColor(WHITE).text(t, LM + 8, y + 6, { lineBreak: false });
  return y + 28;
}
function th(cs, y) {
  doc.rect(LM, y, W, 16).fill('#f0f0f5');
  cs.forEach(c => doc.font('Helvetica-Bold').fontSize(7).fillColor(GRAY).text(c.l, c.x, y + 4, { width: c.w, align: c.a || 'left', lineBreak: false }));
  return y + 17;
}
function tr(cs, vs, y, hl) {
  if (hl) doc.rect(LM, y, W, 15).fill('#f0fdf4');
  vs.forEach((v, i) => {
    const c = cs[i];
    const clr = v.includes('SAVE') ? GREEN : (v.startsWith('-') ? RED : DARK);
    doc.font(v.includes('Total') || i === 0 ? 'Helvetica-Bold' : 'Helvetica').fontSize(7).fillColor(clr).text(v, c.x, y + 4, { width: c.w, align: c.a || 'left', lineBreak: false });
  });
  return y + 15;
}
function ck(t, y) {
  doc.font('Helvetica').fontSize(8.5).fillColor(DARK).text('✓  ' + t, LM + 4, y, { lineBreak: false });
  return y + 13;
}
function divider(y) { doc.rect(LM, y, W, 1).fill('#e0e0e0'); return y + 5; }
function bold(t, y, sz, clr) { doc.font('Helvetica-Bold').fontSize(sz || 8).fillColor(clr || DARK).text(t, LM, y, { lineBreak: false }); }
function txt(t, x, y, w, a) { doc.font('Helvetica').fontSize(7).fillColor(GRAY).text(t, x || LM, y, { width: w || W, align: a || 'left' }); }

// ═══ P1 COVER ═══
np();
doc.rect(0, 0, 612, 792).fill(DARK);
logo(LM, 70, 40);
doc.font('Helvetica-Bold').fontSize(28).fillColor(WHITE).text('Revenue Roadmap', LM, 130, { lineBreak: false });
doc.font('Helvetica').fontSize(14).fillColor(GRAY).text('12-Month & 24-Month Financial Projections', LM, 168, { lineBreak: false });
doc.font('Helvetica').fontSize(11).fillColor(GRAY).text('The Operating System for Value-Based Care', LM, 194, { lineBreak: false });

// Key numbers
const kn = [
  ['Year 1 Revenue', '$1.19M', GREEN], ['Year 1 ARR (Month 12)', '$3.1M', BLUE],
  ['Year 2 Revenue', '$7.28M', GREEN], ['Year 2 ARR (Month 24)', '$10.8M', BLUE],
  ['Gross Margin', '85 — 87%', AMBER], ['Breakeven', 'Month 10', PURPLE],
  ['Year 2 Exit Valuation', '$54M — $130M', '#e11d48'], ['Investor Return (on $1M)', '10x — 26x', '#e11d48'],
];
let py = 240;
kn.forEach(([l, v, c]) => {
  doc.roundedRect(LM, py, W, 28, 3).fill('#111128');
  doc.font('Helvetica').fontSize(9).fillColor(GRAY).text(l, LM + 12, py + 8, { lineBreak: false });
  doc.font('Helvetica-Bold').fontSize(13).fillColor(c).text(v, LM + 260, py + 7, { lineBreak: false });
  py += 34;
});

py += 10;
doc.font('Helvetica-Bold').fontSize(10).fillColor(WHITE).text('Revenue Streams', LM, py, { lineBreak: false }); py += 18;
[['PMPM Platform Fees', '60%', 'Recurring per-member from managed care groups'],
 ['Integration Services', '25%', '$10K-$20K/month per enterprise client'],
 ['Per-Provider Modules', '10%', 'Bundle subscriptions for smaller practices'],
 ['ChartIQ Add-Ons', '5%', 'Per-bed hospital pricing, cross-sold']
].forEach(([n, p, d]) => {
  doc.font('Helvetica-Bold').fontSize(9).fillColor(WHITE).text(n, LM, py, { lineBreak: false });
  doc.font('Helvetica').fontSize(9).fillColor(BLUE).text(p, LM + 170, py, { lineBreak: false });
  doc.font('Helvetica').fontSize(8).fillColor(GRAY).text(d, LM + 200, py, { lineBreak: false });
  py += 16;
});

doc.font('Helvetica').fontSize(9).fillColor(GRAY).text('Confidential  ·  March 2026  ·  david@kosiq.ai', LM, 720, { lineBreak: false });

// ═══ P2 — 12-MONTH REVENUE ═══
np(); bar('12-Month Revenue Projection');
let y = 58;

y = sec('Monthly Revenue — Year 1', BLUE, y);
const mc = [
  { l: 'Month', x: LM, w: 42 }, { l: 'New', x: LM+42, w: 30, a: 'center' }, { l: 'Total', x: LM+72, w: 32, a: 'center' },
  { l: 'Members', x: LM+104, w: 55, a: 'right' }, { l: 'Platform', x: LM+159, w: 62, a: 'right' },
  { l: 'Integration', x: LM+221, w: 62, a: 'right' }, { l: 'Other', x: LM+283, w: 48, a: 'right' },
  { l: 'Total MRR', x: LM+331, w: 62, a: 'right' }, { l: 'Cum. Rev', x: LM+393, w: W-393, a: 'right' },
];
y = th(mc, y);
const m12 = [
  ['M1','0','0','0','$0','$0','$0','$0','$0'],
  ['M2','0','0','0','$0','$0','$0','$0','$0'],
  ['M3','0','0','0','$0','$0','$0','$0','$0'],
  ['M4','1','1','25K','$31K','$10K','$2K','$44K','$44K'],
  ['M5','0','1','25K','$31K','$10K','$3K','$44K','$88K'],
  ['M6','1','2','55K','$56K','$25K','$6K','$87K','$175K'],
  ['M7','0','2','55K','$56K','$25K','$6K','$88K','$263K'],
  ['M8','1','3','90K','$81K','$40K','$9K','$130K','$393K'],
  ['M9','1','4','120K','$100K','$55K','$11K','$166K','$559K'],
  ['M10','0','4','120K','$100K','$55K','$13K','$168K','$727K'],
  ['M11','1','5','155K','$131K','$65K','$15K','$211K','$938K'],
  ['M12','1','6','190K','$163K','$75K','$18K','$256K','$1.19M'],
];
m12.forEach((r, i) => { y = tr(mc, r, y, i % 2 === 1); });
y = divider(y + 2);
bold('Year 1 Total: $1,194,000', y, 9, GREEN); y += 14;
bold('Month 12 ARR: $3,070,800', y, 9, BLUE); y += 18;

y = sec('Year 1 Assumptions', AMBER, y);
y = ck('Months 1-3: HIPAA certification + AWS infrastructure + pilot onboarding ($0 revenue)', y);
y = ck('Month 4: First paying client — 25,000 members at $1.25 PMPM + $10K integration', y);
y = ck('One new client every 6-8 weeks via Dr. JD managed care network in South Florida', y);
y = ck('Average client: 25K-35K members, Professional integration tier ($15K/mo)', y);
y = ck('ChartIQ cross-sold to 60% of clients with hospital affiliations', y);
y = ck('90% gross margin on platform, 70% on integration services', y);
y = ck('Net revenue retention: 110%+ (clients expand member count over time)', y);

// ═══ P3 — YEAR 1 P&L ═══
np(); bar('Year 1 Profit & Loss');
y = 58;

y = sec('Expense Forecast — Year 1', RED, y);
const ec = [
  { l: 'Category', x: LM, w: 160 }, { l: 'Monthly', x: LM+160, w: 80, a: 'right' },
  { l: 'Annual', x: LM+240, w: 80, a: 'right' }, { l: 'Notes', x: LM+330, w: W-330 },
];
y = th(ec, y);
y = tr(ec, ['CPO Salary (David)', '$15,000', '$180,000', 'Co-Founder'], y);
y = tr(ec, ['CMO Advisory (Dr. JD)', '$5,000', '$60,000', 'Equity + advisory fee'], y, 1);
y = tr(ec, ['Data Engineer', '$12,500', '$150,000', 'First hire, Month 1'], y);
y = tr(ec, ['AWS Infrastructure', '$3,000', '$36,000', 'HIPAA-eligible services'], y, 1);
y = tr(ec, ['Claude API (Bedrock)', '$2,000', '$24,000', 'AI features + ChartIQ'], y);
y = tr(ec, ['HIPAA/SOC 2', '$12,500', '$150,000', 'Consultant + audit'], y, 1);
y = tr(ec, ['Legal & IP', '$2,000', '$24,000', 'Trademarks, contracts'], y);
y = tr(ec, ['Insurance', '$500', '$6,000', 'Cyber + E&O'], y, 1);
y = tr(ec, ['Sales & Marketing', '$3,000', '$36,000', 'Content, conferences'], y);
y = tr(ec, ['Office & Misc', '$1,500', '$18,000', 'Tools, software'], y, 1);
y = divider(y + 2);
bold('Total Year 1 Expenses: $684,000', y, 9, RED); y += 18;

y = sec('Year 1 Summary', GREEN, y);
const sc = [{ l: 'Metric', x: LM, w: 280 }, { l: 'Amount', x: LM+280, w: W-280, a: 'right' }];
y = th(sc, y);
y = tr(sc, ['Total Revenue', '$1,194,000'], y, 1);
y = tr(sc, ['Total Expenses', '-$684,000'], y);
y = tr(sc, ['Net Income', '$510,000'], y, 1);
y = tr(sc, ['Gross Margin', '85%'], y);
y = tr(sc, ['Breakeven Month', 'Month 10'], y, 1);
y = tr(sc, ['Month 12 MRR', '$256,000'], y);
y = tr(sc, ['Month 12 ARR', '$3,070,800'], y, 1);
y = tr(sc, ['Clients at Month 12', '6'], y);
y = tr(sc, ['Members Managed', '190,000'], y, 1);
y += 12;

y = sec('Cash Flow Milestones — Year 1', PURPLE, y);
y = ck('Month 1-3: Burn phase — ~$57K/month expenses, $0 revenue. Seed capital funds this.', y);
y = ck('Month 4: First revenue — $44K MRR from first client. Still cash-negative.', y);
y = ck('Month 6: Second client — $87K MRR. Burn rate decreasing.', y);
y = ck('Month 8: Third client — $130K MRR. Approaching profitability.', y);
y = ck('Month 10: BREAKEVEN — monthly revenue exceeds monthly expenses.', y);
y = ck('Month 12: $256K MRR — generating ~$199K/month net profit.', y);
y = ck('Total seed capital needed: $500K-$750K to cover Months 1-9 burn.', y);

// ═══ P4 — 24-MONTH REVENUE ═══
np(); bar('24-Month Revenue Projection');
y = 58;

y = sec('Monthly Revenue — Year 2', BLUE, y);
const mc2 = [
  { l: 'Month', x: LM, w: 40 }, { l: 'New', x: LM+40, w: 28, a: 'center' }, { l: 'Total', x: LM+68, w: 32, a: 'center' },
  { l: 'Members', x: LM+100, w: 52, a: 'right' }, { l: 'Platform', x: LM+152, w: 60, a: 'right' },
  { l: 'Integration', x: LM+212, w: 60, a: 'right' }, { l: 'Other', x: LM+272, w: 46, a: 'right' },
  { l: 'Total MRR', x: LM+318, w: 62, a: 'right' }, { l: 'Cum. Rev', x: LM+380, w: W-380, a: 'right' },
];
y = th(mc2, y);
const yr2 = [
  ['M13','2','8','250K','$200K','$95K','$22K','$317K','$1.51M'],
  ['M14','1','9','285K','$228K','$110K','$25K','$363K','$1.87M'],
  ['M15','2','11','340K','$272K','$130K','$30K','$432K','$2.31M'],
  ['M16','1','12','375K','$300K','$140K','$33K','$473K','$2.78M'],
  ['M17','2','14','430K','$344K','$165K','$38K','$547K','$3.33M'],
  ['M18','1','15','460K','$368K','$175K','$41K','$584K','$3.91M'],
  ['M19','2','17','520K','$400K','$195K','$46K','$641K','$4.55M'],
  ['M20','1','18','550K','$420K','$205K','$49K','$674K','$5.23M'],
  ['M21','2','20','610K','$460K','$225K','$54K','$739K','$5.97M'],
  ['M22','1','21','640K','$480K','$235K','$57K','$772K','$6.74M'],
  ['M23','2','23','700K','$520K','$255K','$62K','$837K','$7.57M'],
  ['M24','2','25','760K','$560K','$275K','$67K','$902K','$8.48M'],
];
yr2.forEach((r, i) => { y = tr(mc2, r, y, i % 2 === 1); });
y = divider(y + 2);
bold('Year 2 Total: $7,281,000', y, 9, GREEN); y += 14;
bold('Month 24 ARR: $10,824,000', y, 9, BLUE); y += 18;

y = sec('Year 2 Growth Drivers', AMBER, y);
y = ck('Sales velocity doubles: 2 new clients/month (brand + case studies + sales hire)', y);
y = ck('Geographic expansion beyond South Florida to Southeast US markets', y);
y = ck('HITRUST certification (Month 18) unlocks enterprise health plan contracts', y);
y = ck('Existing clients expand member count — net revenue retention 115%+', y);
y = ck('ChartIQ upsells generating $5K-$8K/month per hospital client', y);
y = ck('Channel partnerships with EHR vendors and healthcare consulting firms', y);

y += 6;
y = sec('Year 2 Expenses', RED, y);
const e2 = [{ l: 'Category', x: LM, w: 200 }, { l: 'Annual', x: LM+200, w: 100, a: 'right' }, { l: 'Notes', x: LM+310, w: W-310 }];
y = th(e2, y);
y = tr(e2, ['Salaries (David + Dr. JD + 3 eng + sales)', '$876,000', 'Core team of 6'], y);
y = tr(e2, ['AWS + AI (Claude Bedrock)', '$168,000', 'Scaled for 25 clients'], y, 1);
y = tr(e2, ['HITRUST + Compliance', '$150,000', 'Phase 2 certification'], y);
y = tr(e2, ['Sales, Marketing, Legal, Insurance', '$120,000', 'Conferences, IP, coverage'], y, 1);
y = divider(y + 2);
bold('Total Year 2 Expenses: $1,314,000', y, 9, RED); y += 12;
bold('Year 2 Net Income: $5,967,000', y, 9, GREEN);

// ═══ P5 — EXIT VALUATION ═══
np(); bar('Exit Valuation & Investor Returns');
y = 58;

y = sec('What Is KOSIQ Worth? — Year 2 Exit Scenarios', '#e11d48', y);
doc.font('Helvetica').fontSize(8.5).fillColor(GRAY).text('Healthcare SaaS companies trade at 8-15x ARR. KOSIQ with $10.8M ARR, 85%+ margins, and 110%+ NRR commands premium multiples.', LM, y, { width: W }); y += 22;

const vc = [
  { l: 'Scenario', x: LM, w: 120 }, { l: 'ARR Multiple', x: LM+120, w: 70, a: 'right' },
  { l: 'Company Valuation', x: LM+190, w: 100, a: 'right' },
  { l: 'Investor Return (on $1M)', x: LM+290, w: W-290, a: 'right' },
];
y = th(vc, y);
y = tr(vc, ['Conservative', '5x ARR', '$54,000,000', '10.8x  ($10.8M)'], y);
y = tr(vc, ['Base Case', '8x ARR', '$86,000,000', '17.3x  ($17.3M)'], y, 1);
y = tr(vc, ['Upside', '12x ARR', '$130,000,000', '26x  ($26M)'], y);
y += 4;
doc.font('Helvetica').fontSize(7).fillColor(GRAY).text('Based on $1M seed at $4M pre-money valuation = 20% equity. Returns shown before dilution from future rounds.', LM, y, { width: W }); y += 16;

y = sec('Year 3 Projections & Exit', PURPLE, y);
doc.font('Helvetica').fontSize(8.5).fillColor(GRAY).text('If KOSIQ continues its trajectory into Year 3 with a Series A raise ($10-15M at $40-60M valuation):', LM, y, { width: W }); y += 18;

const y3 = [{ l: 'Metric', x: LM, w: 220 }, { l: 'Year 2 (Month 24)', x: LM+220, w: 130, a: 'right' }, { l: 'Year 3 (Month 36)', x: LM+350, w: W-350, a: 'right' }];
y = th(y3, y);
y = tr(y3, ['Clients', '25', '50-60'], y);
y = tr(y3, ['Members Managed', '760,000', '1.8M — 2.2M'], y, 1);
y = tr(y3, ['Monthly MRR', '$902K', '$2.0M — $2.5M'], y);
y = tr(y3, ['ARR', '$10.8M', '$24M — $30M'], y, 1);
y = tr(y3, ['Team Size', '8', '15-20'], y);
y = tr(y3, ['Gross Margin', '87%', '88-90%'], y, 1);
y = divider(y + 2);

doc.font('Helvetica-Bold').fontSize(9).fillColor(DARK).text('Year 3 Exit Valuation Range:', LM, y, { lineBreak: false }); y += 14;
const v3 = [
  { l: 'Scenario', x: LM, w: 120 }, { l: 'Multiple', x: LM+120, w: 70, a: 'right' },
  { l: 'Valuation', x: LM+190, w: 100, a: 'right' },
  { l: 'Seed Investor Return', x: LM+290, w: W-290, a: 'right' },
];
y = th(v3, y);
y = tr(v3, ['Conservative', '5x ARR', '$120M — $150M', '24x — 30x'], y);
y = tr(v3, ['Base Case', '8x ARR', '$192M — $240M', '38x — 48x'], y, 1);
y = tr(v3, ['Upside', '12x ARR', '$288M — $360M', '58x — 72x'], y);
y += 4;
doc.font('Helvetica').fontSize(7).fillColor(GRAY).text('Year 3 returns assume 15-20% dilution from Series A. Seed investor retains ~16-17% ownership.', LM, y, { width: W }); y += 16;

y = sec('Comparable Healthcare SaaS Exits', BLUE, y);
const cx = [{ l: 'Company', x: LM, w: 120 }, { l: 'What They Do', x: LM+120, w: 170 }, { l: 'Valuation/Exit', x: LM+290, w: 100, a: 'right' }, { l: 'Multiple', x: LM+390, w: W-390, a: 'right' }];
y = th(cx, y);
y = tr(cx, ['Signify Health', 'Value-based care enablement', '$8B (CVS acq.)', '~30x rev'], y);
y = tr(cx, ['Agilon Health', 'Medicare platform', '$7.4B (peak)', '~15x rev'], y, 1);
y = tr(cx, ['Evolent Health', 'VBC services + tech', '$4.2B', '~4x rev'], y);
y = tr(cx, ['Privia Health', 'Physician enablement', '$3.8B', '~5x rev'], y, 1);
y = tr(cx, ['Vim', 'Care quality middleware', '$350M (Series C)', '~20x rev'], y);
y += 4;
doc.font('Helvetica').fontSize(7).fillColor(GRAY).text('KOSIQ sits in the same category as these companies — AI-powered value-based care technology for managed care organizations.', LM, y, { width: W }); y += 16;

y = sec('Why KOSIQ Commands Premium Multiples', GREEN, y);
y = ck('AI-native platform (not retrofitted) — predictive + prescriptive analytics built in', y);
y = ck('85%+ gross margins with net revenue retention above 110%', y);
y = ck('Land-and-expand model: PMPM grows as clients add members', y);
y = ck('11 products = massive cross-sell opportunity within existing clients', y);
y = ck('Healthcare data moat deepens with every client onboarded', y);
y = ck('Regulatory compliance (HIPAA/SOC2/HITRUST) = high switching costs', y);

// ═══ P6 — MILESTONES + SUMMARY ═══
np(); bar('Key Milestones & Summary');
y = 58;

y = sec('24-Month Milestone Timeline', AMBER, y);
const ml = [
  { l: 'Milestone', x: LM, w: 220 }, { l: 'When', x: LM+220, w: 80, a: 'center' }, { l: 'Impact', x: LM+300, w: W-300 },
];
y = th(ml, y);
y = tr(ml, ['HIPAA Certified', 'Month 3', 'Can handle real PHI'], y);
y = tr(ml, ['First Paying Client', 'Month 4', '$44K MRR'], y, 1);
y = tr(ml, ['SOC 2 Type I', 'Month 6', 'Enterprise sales ready'], y);
y = tr(ml, ['$100K MRR', 'Month 8', 'Growth trajectory proven'], y, 1);
y = tr(ml, ['Breakeven', 'Month 10', 'Self-sustaining business'], y);
y = tr(ml, ['$250K MRR / 6 Clients', 'Month 12', '$3.1M ARR'], y, 1);
y = tr(ml, ['10 Clients', 'Month 15', 'Product-market fit confirmed'], y);
y = tr(ml, ['HITRUST Certified', 'Month 18', 'Enterprise health plans open'], y, 1);
y = tr(ml, ['$500K MRR', 'Month 19', '$6M ARR'], y);
y = tr(ml, ['Series A Raise', 'Month 20-22', '$10-15M at $40-60M val'], y, 1);
y = tr(ml, ['25 Clients / 760K Members', 'Month 24', '$10.8M ARR'], y);
y = tr(ml, ['50+ Clients / 2M Members', 'Month 36', '$24-30M ARR'], y, 1);
y += 8;

y = sec('Cumulative 24-Month Summary', GREEN, y);
const s2 = [{ l: 'Metric', x: LM, w: 180 }, { l: 'Year 1', x: LM+180, w: 100, a: 'right' }, { l: 'Year 2', x: LM+280, w: 100, a: 'right' }, { l: 'Cumulative', x: LM+380, w: W-380, a: 'right' }];
y = th(s2, y);
y = tr(s2, ['Revenue', '$1.19M', '$7.28M', '$8.47M'], y, 1);
y = tr(s2, ['Expenses', '$684K', '$1.31M', '$1.99M'], y);
y = tr(s2, ['Net Income', '$510K', '$5.97M', '$6.48M'], y, 1);
y = tr(s2, ['ARR (ending)', '$3.1M', '$10.8M', '—'], y);
y = tr(s2, ['Clients', '6', '25', '—'], y, 1);
y = tr(s2, ['Members', '190K', '760K', '—'], y);
y += 8;

y = sec('The Opportunity', PURPLE, y);
y = ck('$500K-$1M seed investment → company worth $54M-$130M by Year 2', y);
y = ck('Year 3 trajectory: $120M-$360M valuation with Series A expansion', y);
y = ck('Comparable exits in VBC space: $350M (Vim) to $8B (Signify Health)', y);
y = ck('AI is the differentiator — legacy platforms can\'t compete on technology', y);
y = ck('Dr. JD\'s network provides warm intros to first 10 clients', y);
y = ck('KOSIQ is ready TODAY — 11 products built, demo live at kosiq.ai', y);
y = ck('First real client can be live within 4 months of funding', y);
y += 10;

doc.roundedRect(LM, y, W, 44, 6).fill('#f0f9ff');
doc.font('Helvetica-Bold').fontSize(12).fillColor(DARK).text('Ready to invest in the future of value-based care?', LM + 12, y + 8, { lineBreak: false });
doc.font('Helvetica-Bold').fontSize(9).fillColor(BLUE).text('David Suarez, CPO  ·  david@kosiq.ai  ·  kosiq.ai', LM + 12, y + 26, { lineBreak: false });

doc.end();
console.log('Pages:', doc.bufferedPageRange().count);
