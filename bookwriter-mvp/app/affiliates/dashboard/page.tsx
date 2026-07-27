"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface AffiliateData {
  code: string;
  isApproved: boolean;
  commissionRate: number;
  totalEarnings: number;
  pendingPayout: number;
  clicks: number;
  conversions: number;
}

export default function AffiliateDashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login?callbackUrl=/affiliates/dashboard");
      return;
    }
    if (status === "authenticated") {
      fetch("/api/affiliates/me")
        .then((r) => r.json())
        .then((d) => { setAffiliate(d.affiliate); setLoading(false); })
        .catch(() => setLoading(false));
    }
  }, [status, router]);

  const copyLink = () => {
    if (!affiliate) return;
    navigator.clipboard.writeText(`https://www.plotghost.ai/?ref=${affiliate.code}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (status === "loading" || loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </main>
    );
  }

  if (!affiliate) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="max-w-lg mx-auto px-6 py-24 text-center">
          <h1 className="text-2xl font-bold mb-3">You&apos;re not an affiliate yet</h1>
          <p className="text-gray-400 mb-6">Apply to the program to get your referral link and start earning 30% recurring commission.</p>
          <Link
            href="/affiliates"
            className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold rounded-xl transition-all"
          >
            Apply now
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Affiliate Dashboard</h1>
        <p className="text-gray-400 mb-8">
          {affiliate.isApproved ? (
            <span className="text-green-400">Approved — your commissions are being tracked and paid out.</span>
          ) : (
            <span className="text-yellow-400">Pending approval — clicks are tracked, but payouts start once you&apos;re approved.</span>
          )}
        </p>

        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-5 mb-8 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-400 mb-1">Your referral link</p>
            <p className="font-mono text-blue-400 text-sm break-all">https://www.plotghost.ai/?ref={affiliate.code}</p>
          </div>
          <button
            onClick={copyLink}
            className="px-4 py-2 bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.1] rounded-lg text-sm transition-colors whitespace-nowrap"
          >
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat label="Clicks" value={affiliate.clicks.toLocaleString()} />
          <Stat label="Conversions" value={affiliate.conversions.toLocaleString()} />
          <Stat label="Total Earnings" value={`$${affiliate.totalEarnings.toFixed(2)}`} />
          <Stat label="Pending Payout" value={`$${affiliate.pendingPayout.toFixed(2)}`} />
        </div>

        <p className="text-xs text-gray-600 mt-8">
          Commission rate: {(affiliate.commissionRate * 100).toFixed(0)}% recurring, credited on every payment your referrals make.
        </p>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-5">
      <p className="text-gray-500 text-xs uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  );
}
