import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] mt-auto bg-[#070710]">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <Link href="/">
              <span
                className="text-xl font-bold tracking-wide text-white"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", letterSpacing: "0.08em" }}
              >
                Plot Ghost
              </span>
            </Link>
            <p className="mt-3 text-sm text-gray-500 leading-relaxed">
              AI-powered book generation. Write, revise, and export professional books in minutes.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Product</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/create" className="text-gray-500 hover:text-white transition-colors">Create Book</Link></li>
              <li><Link href="/library" className="text-gray-500 hover:text-white transition-colors">Library</Link></li>
              <li><Link href="/pricing" className="text-gray-500 hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Account</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/auth/login" className="text-gray-500 hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/auth/signup" className="text-gray-500 hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Legal</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacy" className="text-gray-500 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-500 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-600">
          <span>&copy; {new Date().getFullYear()} Plot Ghost. All rights reserved.</span>
          <span>Powered by AI — Your content stays private</span>
        </div>
      </div>
    </footer>
  );
}
