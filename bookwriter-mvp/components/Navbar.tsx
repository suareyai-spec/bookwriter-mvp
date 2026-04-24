"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const ADMIN_EMAILS = ["suarey@gmail.com", "suareyai@gmail.com"];

const PLAN_BADGES: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  author: { label: "Author", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  pro: { label: "Pro", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

export default function Navbar() {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/user/usage")
        .then((r) => r.json())
        .then((d) => {
          if (d.subscriptionPlan && d.subscriptionStatus === "active") {
            setPlan(d.subscriptionPlan);
          }
        })
        .catch(() => {});
    }
  }, [session]);

  // Close menu on route change (clicking a link)
  const closeMenu = () => setMenuOpen(false);

  const badge = plan === "admin"
    ? { label: "Admin", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" }
    : plan ? PLAN_BADGES[plan] : null;

  const navLinks = (
    <>
      <Link href="/create" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
        Create
      </Link>
      <Link href="/special" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
        Special
      </Link>
      <Link href="/translate" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
        Translate
      </Link>
      <Link href="/newsletter" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
        Newsletter
      </Link>
      <Link href="/articles" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
        Articles
      </Link>
      {!session && (
        <Link href="/pricing" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
          Pricing
        </Link>
      )}
      {session ? (
        <>
          <Link href="/library" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
            Library
          </Link>
          {session.user?.email && ADMIN_EMAILS.includes(session.user.email) && (
            <Link href="/admin" onClick={closeMenu} className="text-amber-400 hover:text-amber-300 transition-colors py-2">
              Admin
            </Link>
          )}
          <Link href="/account" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
            Account
          </Link>
          <div className="flex items-center gap-2 py-2">
            <span className="text-gray-500 text-sm truncate max-w-[150px]">{session.user?.name || session.user?.email}</span>
            {badge && (
              <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${badge.color}`}>
                {badge.label}
              </span>
            )}
          </div>
          <button
            onClick={() => { closeMenu(); signOut({ callbackUrl: "/" }); }}
            className="text-gray-400 hover:text-white transition-colors py-2 text-left"
          >
            Sign Out
          </button>
        </>
      ) : (
        <>
          <Link href="/auth/login" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
            Login
          </Link>
          <Link
            href="/auth/signup"
            onClick={closeMenu}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg px-4 py-2 font-medium transition-all text-center"
          >
            Sign Up
          </Link>
        </>
      )}
    </>
  );

  return (
    <nav className="relative px-4 sm:px-6 py-4 sm:py-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="Plot Ghost" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          {navLinks}
        </div>

        {/* Mobile hamburger button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden flex flex-col justify-center items-center w-10 h-10 rounded-lg hover:bg-white/[0.06] transition-colors"
          aria-label="Toggle menu"
        >
          <span className={`block w-5 h-0.5 bg-gray-300 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[3px]" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-300 mt-1 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block w-5 h-0.5 bg-gray-300 mt-1 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl">
          <div className="flex flex-col gap-1 px-4 py-4 text-sm">
            {navLinks}
          </div>
        </div>
      )}
    </nav>
  );
}
