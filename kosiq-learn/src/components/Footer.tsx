import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-5xl mx-auto px-4 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Platform</h3>
            <div className="space-y-2.5 text-sm">
              <Link href="/courses" className="block hover:text-white transition">Courses</Link>
              <Link href="/auth/signup" className="block hover:text-white transition">Get Started</Link>
              <Link href="/dashboard" className="block hover:text-white transition">Dashboard</Link>
            </div>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Specialties</h3>
            <div className="space-y-2.5 text-sm">
              <p>Internal Medicine</p>
              <p>Family Medicine</p>
              <p>Primary Care</p>
            </div>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Support</h3>
            <div className="space-y-2.5 text-sm">
              <p>Help Center</p>
              <a href="mailto:support@aice.edu" className="block hover:text-white transition">Contact Us</a>
              <p>FAQ</p>
            </div>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold mb-4">Legal</h3>
            <div className="space-y-2.5 text-sm">
              <p>Privacy Policy</p>
              <p>Terms of Service</p>
              <p>Accreditation</p>
            </div>
          </div>
        </div>
        <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">PHA</span>
            </div>
            <span className="text-white text-sm font-semibold">Pop Health Academy</span>
          </div>
          <p className="text-xs text-gray-500">© 2026 Pop Health Academy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
