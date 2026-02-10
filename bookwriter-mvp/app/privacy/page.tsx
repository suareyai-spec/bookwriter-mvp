import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors">&larr; Back to Home</Link>

        <h1 className="text-4xl font-bold mt-8 mb-2" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>
          Privacy Policy
        </h1>
        <p className="text-gray-400 mb-10">Last updated: February 10, 2026</p>

        <div className="prose prose-invert max-w-none space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>1. Information We Collect</h2>
            <p>When you create an account, we collect your name, email address, and a securely hashed version of your password. When you use our service to generate books, we store the book content, titles, descriptions, and associated metadata in your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>2. How We Use Your Information</h2>
            <p>We use your information solely to provide and improve the My Book service. This includes authenticating your account, storing and displaying your generated books, and enabling export functionality. We do not use your data for advertising or marketing purposes.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>3. Third-Party Services</h2>
            <p>We use Anthropic&apos;s Claude API to generate book content. When you generate a book, your title, description, and preferences are sent to Anthropic for processing. Anthropic&apos;s data handling is governed by their own privacy policy. We do not sell, rent, or share your personal data with any other third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>4. Cookies</h2>
            <p>We use cookies strictly for authentication purposes. These are session cookies that allow you to stay logged in. We do not use tracking cookies, analytics cookies, or any third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>5. Data Security</h2>
            <p>Passwords are hashed using bcrypt with industry-standard salt rounds. Authentication tokens are managed via secure, HttpOnly JWT cookies. All data is transmitted over HTTPS. We implement standard security headers to protect against common web vulnerabilities.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>6. Data Retention and Deletion</h2>
            <p>Your data is retained for as long as you maintain an active account. You may delete individual books at any time from your library. To delete your entire account and all associated data, please contact us at support@mybookapp.com.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>7. Your Rights (GDPR and CCPA)</h2>
            <p>Regardless of your location, you have the right to access, correct, or delete your personal data. You may request a copy of all data we hold about you. You may opt out of any future data collection by deleting your account. California residents have additional rights under the CCPA, including the right to know what personal information is collected and the right to request deletion.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>8. Changes to This Policy</h2>
            <p>We may update this privacy policy from time to time. We will notify registered users of significant changes via email. Continued use of the service after changes constitutes acceptance of the updated policy.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}>9. Contact</h2>
            <p>For questions or concerns about this privacy policy or your data, contact us at support@mybookapp.com.</p>
          </section>
        </div>
      </div>
    </main>
  );
}
