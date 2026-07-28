"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { ADMIN_EMAILS } from "@/lib/config";
import { useCredits } from "@/lib/useCredits";
import LowCreditBanner from "@/components/LowCreditBanner";

const PLAN_BADGES: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  author: { label: "Author", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  pro: { label: "Pro", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

const CREATE_GROUPS = [
  {
    group: "Books",
    items: [{ label: "Books & Series", href: "/create" }],
  },
  {
    group: "Courses",
    items: [
      { label: "University Course", href: "/special/university-course" },
      { label: "Influencer Course", href: "/special/influencer-course" },
    ],
  },
  {
    group: "Content",
    items: [
      { label: "Newsletters & Articles", href: "/newsletter" },
      { label: "White Papers & Reports", href: "/special/whitepaper" },
    ],
  },
  {
    group: "Academic",
    items: [
      { label: "Research & Thesis", href: "/special/thesis" },
      { label: "Translation", href: "/translate" },
    ],
  },
];

export default function Navbar() {
  const { data: session } = useSession();
  const { totalCredits, isAdmin: isUnlimitedAdmin, subscriptionPlan, subscriptionStatus } = useCredits();
  const [menuOpen, setMenuOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const createRef = useRef<HTMLDivElement>(null);

  const plan = isUnlimitedAdmin ? "admin" : (subscriptionPlan && subscriptionStatus === "active" ? subscriptionPlan : null);

  // Close the Create dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (createRef.current && !createRef.current.contains(e.target as Node)) {
        setCreateOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close menu on route change (clicking a link)
  const closeMenu = () => { setMenuOpen(false); setCreateOpen(false); };

  const badge = plan === "admin"
    ? { label: "Admin", color: "bg-amber-500/20 text-amber-400 border-amber-500/30" }
    : plan ? PLAN_BADGES[plan] : null;

  const accountLinks = (
    <>
      {session ? (
        <>
          <Link href="/library" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
            Library
          </Link>
          {session.user?.email && ADMIN_EMAILS.includes(session.user.email) && (
            <Link href="/admin/subscriptions" onClick={closeMenu} className="text-amber-400 hover:text-amber-300 transition-colors py-2">
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
            {isUnlimitedAdmin ? (
              <span className="text-xs bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-full px-2.5 py-1">
                &#8734;
              </span>
            ) : totalCredits !== null && (
              <Link href="/credits" className="text-xs bg-white/[0.05] border border-white/[0.08] text-gray-300 rounded-full px-3 py-1 hover:text-white hover:border-white/[0.15] transition-colors font-medium">
                {totalCredits} credits
              </Link>
            )}
            <Link href="/credits" className="text-xs text-gray-500 hover:text-blue-400 transition-colors">
              Buy Credits
            </Link>
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
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg px-4 py-2 font-medium transition-all text-center whitespace-nowrap"
          >
            Get Started Free →
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      {session && !isUnlimitedAdmin && <LowCreditBanner totalCredits={totalCredits} />}
      <nav className="relative px-4 sm:px-6 py-4 sm:py-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <img src="/logo.svg" alt="PlotGhost" className="h-8 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-4 text-sm">
          <div className="relative" ref={createRef}>
            <button
              onClick={() => setCreateOpen((v) => !v)}
              className="flex items-center gap-1 text-gray-400 hover:text-white transition-colors py-2"
              aria-haspopup="true"
              aria-expanded={createOpen}
            >
              Create
              <svg className={`w-3.5 h-3.5 transition-transform ${createOpen ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {createOpen && (
              <div className="absolute top-full left-0 mt-1 w-60 bg-[#12121a] border border-white/[0.08] rounded-xl shadow-2xl py-2 z-50">
                {CREATE_GROUPS.map((g, gi) => (
                  <div key={g.group} className={gi > 0 ? "mt-1 pt-1 border-t border-white/[0.06]" : ""}>
                    <div className="px-4 pt-1.5 pb-1 text-[10px] font-semibold uppercase tracking-wide text-gray-600">{g.group}</div>
                    {g.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={closeMenu}
                        className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/[0.06] transition-colors"
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {!session && (
            <Link href="/pricing" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
              Pricing
            </Link>
          )}

          {accountLinks}
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
            <div className="text-xs font-semibold uppercase tracking-wide text-gray-600 pt-2 pb-1">Create</div>
            {CREATE_GROUPS.map((g) => (
              <div key={g.group}>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-gray-700 pt-2 pb-0.5 pl-1">{g.group}</div>
                {g.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={closeMenu}
                    className="block text-gray-400 hover:text-white transition-colors py-2 pl-1"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}

            {!session && (
              <Link href="/pricing" onClick={closeMenu} className="text-gray-400 hover:text-white transition-colors py-2">
                Pricing
              </Link>
            )}

            {accountLinks}
          </div>
        </div>
      )}
      </nav>
    </>
  );
}
