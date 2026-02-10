import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">&larr; Back to Home</Link>

        <h1 className="text-4xl font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Terms of Service
        </h1>
        <p className="text-gray-400 mb-10">Last updated: February 10, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>1. Service Description</h2>
            <p>My Book is an AI-powered book generation service. Users provide a title, description, and preferences, and the service generates full-length book content using artificial intelligence. Users can store, manage, and export their generated books.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>2. User Responsibilities</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information when creating your account. You are responsible for all activity that occurs under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>3. Intellectual Property</h2>
            <p>You retain full ownership of all content generated through the service. Books created using My Book are yours to use, publish, distribute, or modify as you see fit. We claim no ownership or license over your generated content. The My Book platform, its design, code, and branding remain our intellectual property.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>4. Acceptable Use</h2>
            <p>You agree not to use the service to generate content that is illegal, defamatory, or infringes on the rights of others. You agree not to attempt to reverse-engineer, disrupt, or compromise the security of the service. You agree not to use automated tools to access the service beyond normal usage patterns.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>5. Limitation of Liability</h2>
            <p>The service is provided &quot;as is&quot; without warranties of any kind, express or implied. We do not guarantee the accuracy, completeness, or quality of generated content. We are not liable for any damages arising from the use of the service, including but not limited to direct, indirect, incidental, or consequential damages. Our total liability shall not exceed the amount you have paid for the service in the preceding twelve months.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>6. Service Modifications</h2>
            <p>We reserve the right to modify, suspend, or discontinue the service at any time, with or without notice. We may update features, pricing, or availability. We will make reasonable efforts to notify users of significant changes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>7. Termination</h2>
            <p>We may terminate or suspend your account at our discretion if you violate these terms. You may terminate your account at any time by contacting us. Upon termination, your data will be deleted in accordance with our privacy policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>8. Governing Law</h2>
            <p>These terms are governed by the laws of the United States. Any disputes arising from these terms or the service shall be resolved in the courts of the State of Delaware.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>9. Contact</h2>
            <p>For questions about these terms, contact us at support@mybookapp.com.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
