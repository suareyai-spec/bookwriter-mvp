"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
      } else {
        setSuccess(true);
        setTimeout(() => router.push("/auth/login"), 2500);
      }
    } catch {
      setError("Connection error. Please try again.");
    }
    setLoading(false);
  }

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-red-400 text-sm">This reset link is missing its token. Please request a new one.</p>
        <Link href="/auth/forgot-password" className="inline-block text-blue-400 hover:text-blue-300 transition-colors text-sm">
          Request a new link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <div className="text-4xl">✓</div>
        <p className="text-white font-medium">Password reset</p>
        <p className="text-gray-400 text-sm">Your password has been updated. Redirecting you to sign in...</p>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-4 bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">New password</label>
          <input
            type="password"
            required
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Confirm new password</label>
          <input
            type="password"
            required
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl p-3.5 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
            placeholder="Re-enter your new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl p-4 transition-all shadow-lg shadow-blue-500/20"
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
          <p className="mt-2 text-gray-400">Choose a new password</p>
        </div>

        <div className="bg-white/[0.03] backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 sm:p-8">
          <Suspense fallback={<div className="text-center text-gray-400 text-sm">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
