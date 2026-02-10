"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const PLAN_BADGES: Record<string, { label: string; color: string }> = {
  starter: { label: "Starter", color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  author: { label: "Author", color: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  pro: { label: "Pro", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
};

export default function Navbar() {
  const { data: session } = useSession();
  const [plan, setPlan] = useState<string | null>(null);

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

  const badge = plan ? PLAN_BADGES[plan] : null;

  return (
    <nav className="flex items-center justify-between px-6 py-5 max-w-5xl mx-auto">
      <Link href="/" className="flex items-center">
        <span
          className="text-2xl font-bold tracking-wide text-white"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif", letterSpacing: "0.08em" }}
        >
          My Book
        </span>
      </Link>
      <div className="flex items-center gap-4 text-sm">
        <Link href="/pricing" className="text-gray-400 hover:text-white transition-colors">
          Pricing
        </Link>
        {session ? (
          <>
            <Link href="/library" className="text-gray-400 hover:text-white transition-colors">
              Library
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">{session.user?.name || session.user?.email}</span>
              {badge && (
                <span className={`text-xs font-semibold border rounded-full px-2 py-0.5 ${badge.color}`}>
                  {badge.label}
                </span>
              )}
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/auth/login"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              href="/auth/signup"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg px-4 py-1.5 font-medium transition-all"
            >
              Sign Up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
