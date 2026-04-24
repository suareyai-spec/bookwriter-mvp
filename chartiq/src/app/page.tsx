import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-4 max-w-7xl mx-auto">
        <Logo size="md" />
        <div className="flex gap-4">
          <Link href="/auth/login" className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Sign In
          </Link>
          <Link href="/auth/signup" className="px-4 py-2 text-sm font-medium bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 py-24 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-dark mb-6">
          AI-Powered Clinical<br />
          <span className="text-brand">Chart Summarization</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          ChartIQ uses artificial intelligence to summarize patient charts, generate shift handoffs, and help clinicians focus on what matters most.
        </p>
        <Link href="/auth/signup" className="inline-block px-8 py-3 bg-brand text-white font-medium rounded-xl text-lg hover:bg-brand/90 transition-colors shadow-lg shadow-brand/20">
          Start Free Trial
        </Link>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: '🤖', title: 'AI Shift Summaries', desc: 'Automatically generate organized summaries of what happened during each shift, grouped by active problems.' },
            { icon: '📋', title: 'SBAR Handoffs', desc: 'AI-generated Situation-Background-Assessment-Recommendation handoff reports for every patient on the unit.' },
            { icon: '💬', title: 'Chart Chat', desc: 'Ask questions about any patient\'s chart and get instant, evidence-based answers from the clinical AI assistant.' },
            { icon: '📈', title: 'Vitals Trending', desc: 'Interactive vital sign charts with trend analysis and automatic flagging of critical or deteriorating values.' },
            { icon: '🔬', title: 'Lab Intelligence', desc: 'Lab results organized by panel with automatic flagging of abnormal and critical values.' },
            { icon: '🏥', title: 'Census Dashboard', desc: 'Real-time patient census with department breakdowns, critical alerts, and pending order tracking.' },
          ].map((f) => (
            <div key={f.title} className="bg-surface rounded-2xl p-6 hover:shadow-lg transition-shadow">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold text-dark mb-2">{f.title}</h3>
              <p className="text-sm text-gray-500">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-400">
        © 2024 ChartIQ. AI-powered clinical intelligence.
      </footer>
    </div>
  );
}
