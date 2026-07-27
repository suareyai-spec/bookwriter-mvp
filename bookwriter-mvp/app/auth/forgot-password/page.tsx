"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSubmitted(true);
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center px-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <img src="/logo.svg" alt="PlotGhost" className="h-10 mx-auto mb-3" />
          </Link>
          <p className="mt-2 text-gray-400">Reset your password</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 sm:p-8">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">✓</div>
              <p className="text-white font-medium">Check your email</p>
              <p className="text-gray-400 text-sm">
                If an account exists for <span className="text-gray-300">{email}</span>, we&apos;ve sent a link to reset your password. It expires in 1 hour.
              </p>
              <Link href="/auth/login" className="inline-block text-blue-400 hover:text-blue-300 transition-colors text-sm mt-2">
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
                  {error}
                </div>
              )}

              <p className="text-sm text-gray-400 mb-5">
                Enter the email address associated with your account and we&apos;ll send you a link to reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl p-4 transition-all shadow-lg shadow-blue-500/20"
                >
                  {loading ? "Sending..." : "Send reset link"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-400">
                Remembered your password?{" "}
                <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
