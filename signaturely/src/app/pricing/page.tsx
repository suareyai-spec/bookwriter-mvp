import Link from 'next/link';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out AutoSig',
    features: ['1 email signature', '6 basic templates', '3 AI generations/month', 'Basic social media icons', 'Copy to clipboard', 'Small "Made with AutoSig" link'],
    cta: 'Get Started',
    href: '/auth/signup',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$9',
    period: '/month',
    description: 'For professionals who want the best',
    features: ['Unlimited signatures', 'All 12+ templates', 'Unlimited AI generations', 'Photo enhancement sliders', 'AI banner creator', 'AI tagline & CTA writer', 'Brand color extraction from logo', 'No branding watermark', 'Priority support'],
    cta: 'Upgrade to Pro',
    href: '/auth/signup',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations at scale',
    features: ['Everything in Pro', 'Custom integrations', 'Dedicated support', 'Volume pricing', 'SSO (coming soon)'],
    cta: 'Contact Sales',
    href: '/auth/signup',
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-medium text-indigo-600 mb-4">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"/></svg>
            AI-Powered Plans
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Simple, transparent pricing</h1>
          <p className="text-gray-500 mt-4">Start free with 3 AI generations. Upgrade for unlimited AI power.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map(plan => (
            <div key={plan.name} className={`rounded-2xl border p-8 transition-shadow hover:shadow-lg ${plan.highlight ? 'border-indigo-500 shadow-lg shadow-indigo-500/10 relative' : 'border-gray-200'}`}>
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-xs font-medium rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                {plan.period && <span className="text-sm text-gray-500">{plan.period}</span>}
              </div>
              <p className="text-sm text-gray-500 mt-3">{plan.description}</p>
              <ul className="mt-6 space-y-3">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                    <svg className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}
                className={`mt-8 block text-center py-2.5 rounded-lg text-sm font-medium transition ${plan.highlight ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white hover:from-indigo-600 hover:to-violet-600' : 'bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100'}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
