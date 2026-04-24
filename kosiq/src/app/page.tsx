import Link from 'next/link';
import Image from 'next/image';

const products = [
  { name: 'CoreIQ', desc: 'Electronic Medical Records', detail: 'Full EMR with scheduling, SOAP notes, e-prescribing, lab orders, billing, and patient portal — all in one system.', color: '#059669', icon: '🏥' },
  { name: 'AtlasIQ', desc: 'Population Health Analytics', detail: 'AI-powered population insights, high-risk patient identification, cost driver analysis, and actionable care recommendations.', color: '#26acf7', icon: '🌐' },
  { name: 'ClinIQ', desc: 'Clinical Intelligence', detail: 'Clinical decision trees, treatment protocol management, outcomes tracking, and evidence-based care pathway optimization.', color: '#8B5CF6', icon: '🧬' },
  { name: 'ChartIQ', desc: 'AI Chart Summarization', detail: 'Summarize complex patient charts in seconds. AI extracts key findings, medications, diagnoses, and care gaps instantly.', color: '#14B8A6', icon: '📋' },
  { name: 'Risk Engine', desc: 'Adaptive Risk Classification', detail: 'Proprietary ARC risk scoring, HCC optimization, risk adjustment factor analysis, and prospective risk trending.', color: '#F59E0B', icon: '⚡' },
  { name: 'Quality', desc: 'Quality & Star Ratings', detail: 'HEDIS measure tracking, PCMH compliance, provider scorecards, and gap closure workflows tied to reimbursement.', color: '#10B981', icon: '⭐' },
  { name: 'Care Management', desc: 'Care Coordination', detail: 'Case management workflows, care plan tracking, transitional care, and chronic disease management programs.', color: '#EC4899', icon: '💊' },
  { name: 'Cost Explorer', desc: 'Cost of Care Analytics', detail: 'PMPM tracking, payer performance comparison, pharmacy spend analysis, and cost trend forecasting across populations.', color: '#EF4444', icon: '📊' },
  { name: 'RPM', desc: 'Remote Patient Monitoring', detail: 'Device management, real-time vitals dashboard, automated alerts, and work queue for clinical intervention.', color: '#06B6D4', icon: '📡' },
  { name: 'Behavioral Health', desc: 'Mental Health Integration', detail: 'PHQ-9/GAD-7 screening, substance use tracking, integrated care plans, and behavioral-medical comorbidity analysis.', color: '#A855F7', icon: '🧠' },
  { name: 'Payer Analytics', desc: 'Contract Intelligence', detail: 'Payer-to-payer benchmarking, contract performance tracking, denial analysis, reimbursement optimization, and Payer Portal simulation.', color: '#F97316', icon: '🏦' },
  { name: 'BridgeIQ', desc: 'Interoperability Hub', detail: 'HL7 FHIR integration, ADT feeds, lab interfaces, pharmacy connections, and real-time ENS notifications.', color: '#3B82F6', icon: '🔗' },
  { name: 'FraudIQ', desc: 'Fraud, Waste & Abuse Detection', detail: 'AI-powered anomaly detection, provider outlier analysis, investigation case management, and FWA compliance reporting.', color: '#DC2626', icon: '🛡️' },
  { name: 'ClaimIQ', desc: 'Claims Processing Engine', detail: 'End-to-end claims lifecycle — scrubbing, submission, denial management, appeals tracking, and ERA posting automation.', color: '#7C3AED', icon: '📄' },
  { name: 'AuthIQ', desc: 'Prior Authorization', detail: 'Streamlined prior auth requests, payer tracking, auto-escalation rules, and approval analytics by payer and procedure.', color: '#0891B2', icon: '🔐' },
  { name: 'ComplianceIQ', desc: 'Regulatory Compliance', detail: 'HIPAA management, staff training tracking, incident reporting, audit management, and policy library with version control.', color: '#065F46', icon: '⚖️' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#fafafa]" style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-black/[0.06]">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between px-8 h-16">
          <div className="flex items-center gap-3">
            <Image src="/logo.svg" alt="KOSIQ" width={140} height={32} className="h-8 w-auto" />
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#424245]">
            <a href="#platform" className="hover:text-[#1d1d1f] transition-colors">Platform</a>
            <a href="#products" className="hover:text-[#1d1d1f] transition-colors">Products</a>
            <a href="#emr" className="hover:text-[#1d1d1f] transition-colors">EMR</a>
            <a href="#analytics" className="hover:text-[#1d1d1f] transition-colors">Analytics</a>
            <a href="#integrations" className="hover:text-[#1d1d1f] transition-colors">Integrations</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-[13px] text-[#424245] hover:text-[#1d1d1f] transition-colors px-4 py-2 font-medium">Sign In</Link>
            <Link href="/auth/signup" className="text-[13px] bg-[#1d1d1f] text-white px-5 py-2 rounded-full font-medium hover:bg-[#000] transition-colors">Request Demo</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-white relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[55%] h-full pointer-events-none hidden md:block" aria-hidden="true">
          <div className="absolute w-[500px] h-[500px] top-[5%] right-[10%]" style={{
            background: 'radial-gradient(ellipse at center, rgba(38,172,247,0.07) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="300" y1="100" x2="460" y2="180" stroke="rgba(38,172,247,0.18)" strokeWidth="1.2"/>
            <line x1="460" y1="180" x2="370" y2="310" stroke="rgba(38,172,247,0.15)" strokeWidth="1.2"/>
            <line x1="370" y1="310" x2="510" y2="390" stroke="rgba(38,172,247,0.12)" strokeWidth="1"/>
            <line x1="300" y1="100" x2="170" y2="210" stroke="rgba(38,172,247,0.15)" strokeWidth="1.2"/>
            <line x1="170" y1="210" x2="370" y2="310" stroke="rgba(38,172,247,0.1)" strokeWidth="1"/>
            <circle cx="300" cy="100" r="30" fill="rgba(38,172,247,0.08)" stroke="rgba(38,172,247,0.18)" strokeWidth="1"/>
            <circle cx="300" cy="100" r="5" fill="#26acf7"/>
            <circle cx="370" cy="310" r="38" fill="rgba(0,113,227,0.06)" stroke="rgba(0,113,227,0.14)" strokeWidth="1"/>
            <circle cx="370" cy="310" r="6" fill="#0071e3"/>
            <circle cx="460" cy="180" r="24" fill="rgba(38,172,247,0.08)" stroke="rgba(38,172,247,0.16)" strokeWidth="1"/>
            <circle cx="460" cy="180" r="4" fill="#26acf7"/>
            <circle cx="170" cy="210" r="18" fill="rgba(38,172,247,0.07)" stroke="rgba(38,172,247,0.14)" strokeWidth="0.8"/>
            <circle cx="170" cy="210" r="3" fill="#26acf7"/>
            <circle cx="510" cy="390" r="16" fill="rgba(124,58,237,0.07)" stroke="rgba(124,58,237,0.14)" strokeWidth="0.8"/>
            <circle cx="510" cy="390" r="2.5" fill="#7C3AED"/>
            <circle cx="550" cy="110" r="13" fill="rgba(5,150,105,0.06)" stroke="rgba(5,150,105,0.12)" strokeWidth="0.8"/>
            <circle cx="550" cy="110" r="2" fill="#059669"/>
            <circle cx="110" cy="350" r="8" fill="rgba(239,68,68,0.08)"/>
            <circle cx="110" cy="350" r="3" fill="rgba(239,68,68,0.2)"/>
            <circle cx="250" cy="430" r="7" fill="rgba(236,72,153,0.07)"/>
            <circle cx="250" cy="430" r="2.5" fill="rgba(236,72,153,0.2)"/>
            <path d="M60,160 Q170,70 300,100 Q400,60 550,110" stroke="rgba(38,172,247,0.15)" strokeWidth="1.8" fill="none" strokeLinecap="round"/>
            <path d="M50,370 Q110,350 170,210 Q280,270 370,310 Q440,350 510,390" stroke="rgba(0,113,227,0.1)" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
          </svg>
        </div>

        <div className="max-w-[1200px] mx-auto px-8 pt-24 pb-20 relative z-10">
          <div className="max-w-3xl">
            <p className="text-[13px] font-semibold text-[#0071e3] tracking-wide uppercase mb-5">The Operating System for Value-Based Care</p>
            <h1 className="text-[56px] md:text-[72px] font-bold leading-[1.04] tracking-[-0.03em] text-[#1d1d1f] mb-6">
              One platform.<br />
              Every workflow.
            </h1>
            <p className="text-[21px] text-[#6e6e73] leading-[1.5] max-w-xl mb-10" style={{ fontWeight: 400 }}>
              KOSIQ is a unified healthcare platform with 16 integrated products — from EMR and 
              e-prescribing to AI-powered analytics, risk stratification, claims processing, fraud detection, 
              and care management. Everything connected. Nothing siloed.
            </p>
            <div className="flex items-center gap-4">
              <Link href="/auth/signup" className="bg-[#0071e3] text-white text-[15px] px-8 py-3.5 rounded-full font-semibold hover:bg-[#0077ed] transition-colors">
                Request a Demo
              </Link>
              <a href="#products" className="text-[15px] text-[#0071e3] font-semibold hover:underline">
                Explore 16 products →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Bar */}
      <section className="bg-[#e8f4fd]/60 border-y border-[#26acf7]/[0.08]">
        <div className="max-w-[1200px] mx-auto px-8 py-10">
          <p className="text-[12px] text-[#86868b] uppercase tracking-widest font-semibold text-center mb-8">Designed for Managed Care</p>
          <div className="flex flex-wrap items-center justify-center gap-x-14 gap-y-6">
            {[
              { name: 'Simply Healthcare', weight: 700 },
              { name: 'Sunshine Health', weight: 700 },
              { name: 'Humana', weight: 800, family: 'Georgia, serif' },
              { name: 'Aetna', weight: 700 },
              { name: 'Molina Healthcare', weight: 700 },
              { name: 'WellCare', weight: 700 },
            ].map((brand, i) => (
              <div key={i} className="opacity-40 hover:opacity-80 transition-opacity duration-300" style={{ fontSize: '22px', fontWeight: brand.weight, fontFamily: brand.family || "'Inter', sans-serif", color: '#1d1d1f', letterSpacing: '-0.01em' }}>
                {brand.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 12 Products Grid */}
      <section id="products" className="bg-white">
        <div className="max-w-[1200px] mx-auto px-8 py-28">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-[#0071e3] tracking-wide uppercase mb-4">16 Integrated Products</p>
            <h2 className="text-[44px] md:text-[52px] font-bold tracking-[-0.025em] text-[#1d1d1f] leading-tight">
              A complete healthcare<br className="hidden md:block" /> operating system.
            </h2>
            <p className="text-[17px] text-[#6e6e73] mt-4 max-w-2xl mx-auto">
              Every product shares the same patient data. No exports, no integrations, no delays. 
              Your EMR data automatically powers analytics, risk scoring, quality tracking, and care management in real time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <div key={i} className="bg-[#f5f5f7] rounded-2xl p-6 hover:shadow-md transition-shadow group">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg" style={{ backgroundColor: `${p.color}15` }}>
                    {p.icon}
                  </div>
                  <div>
                    <div className="text-[16px] font-bold text-[#1d1d1f]" style={{ color: p.color }}>{p.name}</div>
                    <div className="text-[12px] text-[#86868b] font-medium">{p.desc}</div>
                  </div>
                </div>
                <p className="text-[14px] text-[#6e6e73] leading-[1.6]">{p.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CoreIQ EMR Feature Section */}
      <section id="emr" className="bg-[#f5f5f7]">
        <div className="max-w-[1200px] mx-auto px-8 py-28">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#059669]/10 mb-6">
                <span className="text-[13px] font-semibold" style={{ color: '#059669' }}>CoreIQ</span>
                <span className="text-[12px] text-[#6e6e73]">Electronic Medical Records</span>
              </div>
              <h2 className="text-[40px] md:text-[48px] font-bold tracking-[-0.025em] text-[#1d1d1f] leading-tight mb-6">
                An EMR that feeds<br />your intelligence layer.
              </h2>
              <p className="text-[17px] text-[#6e6e73] leading-[1.6] mb-8">
                Most healthcare platforms bolt analytics onto a third-party EMR. KOSIQ built the EMR 
                from the ground up — so every encounter, prescription, and lab result instantly powers 
                risk scoring, quality tracking, and cost analysis. No data silos. No middleware.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  'Patient Scheduling',
                  'SOAP Note Documentation',
                  'E-Prescribing',
                  'Lab Orders & Results',
                  'Claims & Billing',
                  'Patient Portal',
                  'Drug Interaction Alerts',
                  'ICD-10 / CPT Coding',
                ].map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-[14px] text-[#424245]">
                    <svg className="w-4 h-4 flex-shrink-0" style={{ color: '#059669' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-3xl p-8 shadow-sm">
              <div className="space-y-4">
                <div className="border border-[#e5e5e5] rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[14px] font-semibold text-[#1d1d1f]">Today&apos;s Schedule</span>
                    <span className="text-[12px] px-2 py-0.5 rounded-full bg-[#059669]/10 text-[#059669] font-semibold">12 patients</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: '9:00 AM', name: 'Maria Santos, 72', type: 'Follow-up', status: 'Checked In' },
                      { time: '9:30 AM', name: 'Robert Chen, 68', type: 'New Patient', status: 'Scheduled' },
                      { time: '10:00 AM', name: 'James Williams, 81', type: 'Urgent', status: 'In Progress' },
                    ].map((apt, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-[#f0f0f0] last:border-0">
                        <span className="text-[12px] text-[#86868b] w-16">{apt.time}</span>
                        <span className="text-[13px] font-medium text-[#1d1d1f] flex-1">{apt.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#f5f5f7] text-[#6e6e73]">{apt.type}</span>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                          apt.status === 'In Progress' ? 'bg-[#059669]/10 text-[#059669]' :
                          apt.status === 'Checked In' ? 'bg-[#0071e3]/10 text-[#0071e3]' :
                          'bg-[#f5f5f7] text-[#86868b]'
                        }`}>{apt.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="border border-[#e5e5e5] rounded-xl p-3 text-center">
                    <div className="text-[22px] font-bold text-[#1d1d1f]">847</div>
                    <div className="text-[11px] text-[#86868b]">Active Patients</div>
                  </div>
                  <div className="border border-[#e5e5e5] rounded-xl p-3 text-center">
                    <div className="text-[22px] font-bold text-[#059669]">23</div>
                    <div className="text-[11px] text-[#86868b]">Pending Labs</div>
                  </div>
                  <div className="border border-[#e5e5e5] rounded-xl p-3 text-center">
                    <div className="text-[22px] font-bold text-[#F59E0B]">8</div>
                    <div className="text-[11px] text-[#86868b]">Rx Refills</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Data Flow Section */}
      <section id="analytics" className="bg-white">
        <div className="max-w-[1200px] mx-auto px-8 py-28">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-[#0071e3] tracking-wide uppercase mb-4">Connected Intelligence</p>
            <h2 className="text-[40px] md:text-[48px] font-bold tracking-[-0.025em] text-[#1d1d1f] leading-tight">
              Every product feeds<br className="hidden md:block" /> every other product.
            </h2>
            <p className="text-[17px] text-[#6e6e73] mt-4 max-w-2xl mx-auto">
              When a provider documents an encounter in CoreIQ, the Risk Engine recalculates scores, 
              Quality updates HEDIS gaps, Care Management triggers workflows, and Cost Explorer 
              recalibrates PMPM — all automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Capture',
                desc: 'CoreIQ captures every patient interaction — visits, prescriptions, labs, referrals, vitals. Structured data from day one.',
                products: ['CoreIQ', 'ChartIQ', 'RPM'],
                color: '#059669',
              },
              {
                title: 'Analyze',
                desc: 'AI processes patient data in real time — risk scoring, cost trending, quality gap detection, predictive modeling, clinical decision support.',
                products: ['AtlasIQ', 'Risk Engine', 'ClinIQ', 'Cost Explorer'],
                color: '#0071e3',
              },
              {
                title: 'Act',
                desc: 'Actionable insights trigger automated workflows — care plans, follow-up reminders, payer negotiations, population interventions.',
                products: ['Care Management', 'Quality', 'Payer Analytics', 'Behavioral Health'],
                color: '#8B5CF6',
              },
            ].map((step, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl mx-auto mb-6 flex items-center justify-center" style={{ backgroundColor: `${step.color}10` }}>
                  <span className="text-[28px] font-bold" style={{ color: step.color }}>{i + 1}</span>
                </div>
                <h3 className="text-[24px] font-bold text-[#1d1d1f] mb-3">{step.title}</h3>
                <p className="text-[15px] text-[#6e6e73] leading-[1.6] mb-4">{step.desc}</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {step.products.map((p, j) => (
                    <span key={j} className="text-[12px] px-3 py-1 rounded-full font-medium" style={{ backgroundColor: `${step.color}10`, color: step.color }}>{p}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Numbers Section */}
      <section className="bg-[#1d1d1f]">
        <div className="max-w-[1200px] mx-auto px-8 py-24">
          <div className="text-center mb-16">
            <h2 className="text-[40px] md:text-[48px] font-bold tracking-tight text-white">Built for scale.</h2>
            <p className="text-[17px] text-[#a1a1a6] mt-4">From single practices to 60,000+ member managed care organizations.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              ['16', 'Integrated products'],
              ['99.7%', 'Data accuracy rate'],
              ['< 2s', 'Average processing time'],
              ['$2.4M', 'Avg cost savings / year'],
            ].map(([val, label], i) => (
              <div key={i}>
                <div className="text-[44px] font-bold text-white">{val}</div>
                <div className="text-[14px] text-[#a1a1a6] mt-2">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who It's For */}
      <section className="bg-white">
        <div className="max-w-[1200px] mx-auto px-8 py-28">
          <div className="text-center mb-16">
            <p className="text-[13px] font-semibold text-[#0071e3] tracking-wide uppercase mb-4">Built for Everyone in Healthcare</p>
            <h2 className="text-[40px] md:text-[48px] font-bold tracking-[-0.025em] text-[#1d1d1f] leading-tight">
              One platform, many roles.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                role: 'Providers',
                desc: 'Full EMR, scheduling, e-prescribing, and clinical intelligence. Document encounters, manage patients, and get AI-powered treatment recommendations.',
                products: 'CoreIQ, ClinIQ, ChartIQ, RPM',
              },
              {
                role: 'Health Plans & Payers',
                desc: 'Population analytics, risk adjustment optimization, quality reporting, and cost containment. Understand your membership and control medical loss ratios.',
                products: 'AtlasIQ, Risk Engine, Payer Analytics, Cost Explorer',
              },
              {
                role: 'Practice Administrators',
                desc: 'Revenue cycle management, claims tracking, provider productivity, and operational dashboards. Run your practice like a business.',
                products: 'Cost Explorer, Quality, Care Management, BridgeIQ',
              },
            ].map((r, i) => (
              <div key={i} className="bg-[#f5f5f7] rounded-2xl p-8">
                <h3 className="text-[24px] font-bold text-[#1d1d1f] mb-3">{r.role}</h3>
                <p className="text-[15px] text-[#6e6e73] leading-[1.6] mb-4">{r.desc}</p>
                <div className="text-[13px] text-[#86868b]">
                  <span className="font-semibold text-[#424245]">Key products: </span>{r.products}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section id="integrations" className="bg-[#f5f5f7]">
        <div className="max-w-[1200px] mx-auto px-8 py-24 text-center">
          <p className="text-[13px] font-semibold text-[#0071e3] tracking-wide uppercase mb-4">Integrations</p>
          <h2 className="text-[40px] md:text-[48px] font-bold tracking-[-0.025em] text-[#1d1d1f] leading-tight mb-6">
            Connects with your<br />existing systems.
          </h2>
          <p className="text-[17px] text-[#6e6e73] max-w-2xl mx-auto mb-16">
            KOSIQ integrates with payer portals, lab systems, pharmacies, health information exchanges, 
            and standard healthcare data formats via BridgeIQ.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {[
              { name: 'HL7 FHIR', desc: 'Interoperability' },
              { name: 'EDI 835/837', desc: 'Claims files' },
              { name: 'Florida ENS', desc: 'ER notifications' },
              { name: 'E-Prescribing', desc: 'Surescripts' },
              { name: 'Lab Interfaces', desc: 'Quest / LabCorp' },
              { name: 'CSV / Excel', desc: 'Data upload' },
              { name: 'PDF Export', desc: 'Reports' },
              { name: 'API Access', desc: 'Custom integrations' },
            ].map((int, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="text-[16px] font-semibold text-[#1d1d1f] mb-1">{int.name}</div>
                <div className="text-[13px] text-[#86868b]">{int.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-white">
        <div className="max-w-[800px] mx-auto px-8 py-28 text-center">
          <h2 className="text-[44px] md:text-[52px] font-bold tracking-[-0.025em] text-[#1d1d1f] leading-tight mb-6">
            Ready to unify your<br />healthcare operations?
          </h2>
          <p className="text-[17px] text-[#6e6e73] mb-10 max-w-xl mx-auto leading-relaxed">
            See how KOSIQ replaces fragmented systems with one intelligent platform — 
            from patient intake to payer negotiation.
          </p>
          <Link href="/auth/signup" className="inline-block bg-[#0071e3] text-white text-[17px] px-10 py-4 rounded-full font-semibold hover:bg-[#0077ed] transition-colors">
            Request a Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f5f5f7] border-t border-black/[0.04]">
        <div className="max-w-[1200px] mx-auto px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image src="/logo.svg" alt="KOSIQ" width={100} height={24} className="h-6 w-auto" />
              <span className="text-[13px] text-[#86868b]">The Operating System for Value-Based Care</span>
            </div>
            <div className="flex items-center gap-8 text-[13px] text-[#86868b]">
              <span>© 2026 KOSIQ. All rights reserved.</span>
              <a href="#" className="hover:text-[#424245] transition-colors">Privacy</a>
              <a href="#" className="hover:text-[#424245] transition-colors">Terms</a>
              <a href="mailto:support@iamdivid.com" className="hover:text-[#424245] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
