"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const { data: session } = useSession();

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
        {session ? (
          <>
            <Link href="/library" className="text-gray-400 hover:text-white transition-colors">
              Library
            </Link>
            <span className="text-gray-500">{session.user?.name || session.user?.email}</span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-gray-400 hover:text-white transition-colors"
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <span className="hidden sm:inline text-gray-500">AI-Powered Book Generator</span>
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
