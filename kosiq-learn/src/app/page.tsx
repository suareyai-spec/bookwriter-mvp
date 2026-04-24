'use client'

import Link from 'next/link'
import { useState } from 'react'
import Footer from '@/components/Footer'
import { MedalIcon, UserIcon, PencilIcon, CertificateIcon } from '@/components/Icons'

const modules = [
  { title: 'Introduction to Value-Based Care', desc: 'MACRA/MIPS, APMs, ACOs, and the shift from fee-for-service' },
  { title: 'Risk Adjustment & HCC Coding', desc: 'HCC model, RAF scores, V28 changes, MEAT documentation' },
  { title: 'Quality Metrics: HEDIS & Star Ratings', desc: 'HEDIS measures, Star Rating methodology, CAHPS, quality bonuses' },
  { title: 'Care Management & Population Health', desc: 'CCM billing, TCM, wellness visits, SDOH, care gap closure' },
  { title: 'Technology & Data Analytics in VBC', desc: 'CDS systems, predictive analytics, FHIR, telehealth, RPM' },
  { title: 'Financial Models & Contract Negotiation', desc: 'PMPM, shared savings, capitation, stop-loss, MLR benchmarks' },
]

const steps = [
  { icon: <svg className="w-7 h-7" fill="none" stroke="url(#navyGold)" strokeWidth={1.8} viewBox="0 0 24 24"><defs><linearGradient id="navyGold" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#1B365D"/><stop offset="100%" stopColor="#C5960C"/></linearGradient></defs><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>, title: 'Enroll', desc: 'Purchase the course and create your account in minutes' },
  { icon: <svg className="w-7 h-7" fill="none" stroke="url(#navyGold2)" strokeWidth={1.8} viewBox="0 0 24 24"><defs><linearGradient id="navyGold2" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#1B365D"/><stop offset="100%" stopColor="#C5960C"/></linearGradient></defs><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, title: 'Learn', desc: 'Watch 6 hours of expert-led video across 6 comprehensive modules' },
  { icon: <svg className="w-7 h-7" fill="none" stroke="url(#navyGold3)" strokeWidth={1.8} viewBox="0 0 24 24"><defs><linearGradient id="navyGold3" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#1B365D"/><stop offset="100%" stopColor="#C5960C"/></linearGradient></defs><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>, title: 'Pass', desc: 'Complete board-level assessments with 80% or higher to advance' },
  { icon: <svg className="w-7 h-7" fill="none" stroke="url(#navyGold4)" strokeWidth={1.8} viewBox="0 0 24 24"><defs><linearGradient id="navyGold4" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#1B365D"/><stop offset="100%" stopColor="#C5960C"/></linearGradient></defs><path d="M12 14l9-5-9-5-9 5 9 5z"/><path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"/></svg>, title: 'Certify', desc: 'Earn 6.0 AMA PRA Category 1 Credits™ and your digital certificate' },
]

const testimonials = [
  { name: 'Dr. Sarah Chen, MD', role: 'Internal Medicine — Boston, MA', text: 'This course transformed how I approach value-based contracts. The module on risk adjustment alone saved our practice over $200K in recaptured RAF scores. Worth every penny of the investment.' },
  { name: 'Dr. Michael Torres, DO', role: 'Family Medicine — Houston, TX', text: 'Board-level questions that actually test clinical application, not rote memorization. The financial models module gave me the confidence to negotiate our first shared savings contract.' },
  { name: 'Jennifer Park, NP', role: 'Primary Care — Seattle, WA', text: 'Beautifully structured and incredibly practical. I completed all six modules in a week and immediately applied the HEDIS strategies to close care gaps in our patient panel.' },
]

const faqs = [
  { q: 'How long do I have to complete the course?', a: 'You have lifetime access once enrolled. Most physicians complete the course within 2-4 weeks, but you can take as long as you need.' },
  { q: 'What type of CME credits are offered?', a: 'This course offers 6.0 AMA PRA Category 1 Credits™, which are accepted by all major medical boards and state licensing authorities.' },
  { q: 'What happens if I fail a module quiz?', a: 'You need 80% to pass each module quiz. If you don\'t pass, you can retake the quiz immediately. There\'s no limit on retakes.' },
  { q: 'Is there a refund policy?', a: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with the course for any reason, contact us within 30 days of purchase for a full refund.' },
  { q: 'Can I access the course on mobile devices?', a: 'Yes, the entire platform is fully responsive. You can learn on your desktop, tablet, or smartphone.' },
  { q: 'Do I receive a certificate?', a: 'Yes, upon successful completion of all six modules, you\'ll receive an instant digital certificate with your AMA PRA Category 1 Credits™ that you can download immediately.' },
]

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <main>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-surface to-white" />
        <div className="relative max-w-4xl mx-auto px-4 pt-32 pb-24 text-center">
          <h1 className="font-bold tracking-tight text-gray-900 leading-[1.1] mb-6 text-center">
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl whitespace-nowrap">Population Health Education.</span>
            <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary/70 pb-2">For Everyone.</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-500 font-light max-w-2xl mx-auto mb-10 leading-relaxed">
            Premium, evidence-based CME designed by board-certified physicians. Master value-based care and earn your credits.
          </p>
          <Link href="/courses/value-based-care-essentials" className="inline-flex items-center bg-accent hover:bg-accent/90 text-white px-10 py-4 rounded-full text-lg font-semibold transition-all hover:shadow-lg hover:shadow-accent/25 hover:-translate-y-0.5">
            Explore Our Program
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </Link>
        </div>
      </section>

      {/* Course Spotlight */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2">
              <div className="aspect-[4/3] lg:aspect-auto bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 flex items-center justify-center p-12">
                <div className="text-center">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-12 h-12" fill="none" stroke="url(#spotGrad)" strokeWidth={1.5} viewBox="0 0 24 24"><defs><linearGradient id="spotGrad" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#1B365D"/><stop offset="100%" stopColor="#C5960C"/></linearGradient></defs><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"/></svg>
                  </div>
                  <p className="text-sm font-medium text-primary/60 tracking-widest uppercase">Flagship Course</p>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xs font-semibold text-accent bg-accent/10 px-3 py-1 rounded-full">6.0 AMA PRA Category 1 Credits™</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">Value-Based Care Essentials for Primary Care Physicians</h2>
                <p className="text-gray-500 mb-6 leading-relaxed">A comprehensive, 6-hour premium CME course covering the complete transition to value-based care — from risk adjustment to contract negotiation.</p>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-6">
                  <span>Dr. JD Suarez, MD, FACP</span>
                  <span>6 hours</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-3xl font-bold text-gray-900">$1,500</div>
                  <Link href="/courses/value-based-care-essentials" className="bg-primary text-white px-8 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all hover:-translate-y-0.5">
                    Learn More
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-24 bg-surface">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">What You&apos;ll Learn</h2>
          <p className="text-gray-500 text-center mb-16 max-w-2xl mx-auto">Six comprehensive modules covering every aspect of value-based care delivery</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modules.map((m, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-lg hover:shadow-gray-100/50 transition-all hover:-translate-y-1">
                <div className="w-10 h-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary font-bold text-sm mb-4">{i + 1}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{m.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instructor Spotlight */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-center">
            <div className="flex justify-center">
              <div className="w-48 h-48 rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10 flex items-center justify-center">
                <svg className="w-20 h-20" fill="none" stroke="url(#instrGrad)" strokeWidth={1.2} viewBox="0 0 24 24"><defs><linearGradient id="instrGrad" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#1B365D"/><stop offset="100%" stopColor="#C5960C"/></linearGradient></defs><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"/></svg>
              </div>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm font-semibold text-accent tracking-widest uppercase mb-3">Your Instructor</p>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Dr. JD Suarez, MD, FACP</h2>
              <p className="text-gray-500 leading-relaxed mb-4">
                Board-certified internist and Fellow of the American College of Physicians with over 15 years of experience in value-based care delivery, healthcare innovation, and population health management.
              </p>
              <p className="text-gray-500 leading-relaxed">
                Dr. Suarez has led multiple ACO transformation initiatives across large health systems and is a nationally recognized thought leader in VBC strategy, risk adjustment optimization, and healthcare technology integration.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                {['Board Certified', 'FACP', '15+ Years VBC', 'ACO Leadership'].map(tag => (
                  <span key={tag} className="text-xs font-medium text-primary bg-primary/5 px-3 py-1.5 rounded-full">{tag}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-surface">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">How It Works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-gray-100 flex items-center justify-center mx-auto mb-5">{s.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                {i < 3 && <div className="hidden lg:block text-gray-300 text-2xl mt-4">→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">What Physicians Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <div key={i} className="bg-surface rounded-2xl p-8 border border-gray-100">
                <div className="flex items-center text-accent text-sm mb-4">★★★★★</div>
                <p className="text-gray-600 leading-relaxed mb-6">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 bg-surface">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50/50 transition">
                  <span className="font-medium text-gray-900 pr-4">{faq.q}</span>
                  <svg className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-gray-500 leading-relaxed">{faq.a}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: <MedalIcon className="w-8 h-8" />, label: 'AMA PRA Category 1 Credits™' },
              { icon: <UserIcon className="w-8 h-8" />, label: 'Board-Certified Faculty' },
              { icon: <PencilIcon className="w-8 h-8" />, label: 'Interactive Assessments' },
              { icon: <CertificateIcon className="w-8 h-8" />, label: 'Instant Digital Certificate' },
            ].map((t, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="mb-2">{t.icon}</div>
                <p className="text-sm font-medium text-gray-600">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
