import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  Zap,
  Globe2,
  Lock,
  Sparkles,
  ArrowRight,
  Layers,
} from "lucide-react";

export const metadata = {
  title: "About RankBid — India's Transparent Placement Platform",
  description: "Learn how RankBid provides transparent, high-visibility paid placement rankings for Indian brands and builders.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Bharat Growth Directory</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono">
          What is RankBid?
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          RankBid is a public, real-time leaderboard where Indian startups, D2C brands, SaaS tools, and creators compete for premier placement through verified INR advertising bids.
        </p>
      </div>

      {/* Core Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">100% Transparent Hierarchy</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Traditional advertising platforms hide your placement behind mysterious bidding algorithms, quality scores, and opaque ad auctions. RankBid makes ranking completely transparent: your rank is determined strictly by how much you have paid in INR.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">Pay Only The Difference</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            When you re-bid on your listing to move up the ranks or reclaim #1, you never pay the full new amount again. You only pay the exact difference between your existing standing bid and your new target bid.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Globe2 className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">India-First & UPI Powered</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Built specifically for Bharat&apos;s fast-paced digital economy. Native INR pricing (starting at just ₹100), Indian number formatting (₹1,00,000), and instantaneous activation via Razorpay UPI and cards.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-white">ASCI Sponsored Placement</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            RankBid is strictly a paid placement advertising directory, not a game of chance or gambling platform. Every listing carries a prominent &ldquo;Paid Placement&rdquo; badge in compliance with ASCI norms.
          </p>
        </div>
      </div>

      {/* Target Audience */}
      <div className="p-8 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 space-y-6">
        <h2 className="text-xl font-bold text-white">Who is RankBid for?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <span className="font-bold text-emerald-400">🚀 Startups & SaaS</span>
            <p className="text-slate-400">
              Get immediate eyes, early adopters, and direct referral traffic from tech enthusiasts.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <span className="font-bold text-amber-400">🛍️ D2C Brands</span>
            <p className="text-slate-400">
              Showcase apparel, food, or lifestyle products to high-intent Indian consumers.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1.5">
            <span className="font-bold text-blue-400">🎙️ Creators & Agencies</span>
            <p className="text-slate-400">
              Grow your social handle, portfolio views, and attract prospective clients.
            </p>
          </div>
        </div>

        <div className="pt-4 text-center">
          <Link
            href="/submit"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
          >
            <span>Claim Your Rank Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
