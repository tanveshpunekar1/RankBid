import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  TrendingUp,
  ShieldCheck,
  Zap,
  DollarSign,
  ArrowRight,
} from "lucide-react";

export const metadata = {
  title: "Bidding & Placement Rules — RankBid India",
  description: "Official bidding rules, ranking mechanics, and submission guidelines for RankBid.",
};

export default function RulesPage() {
  const rules = [
    {
      num: "01",
      title: "Minimum & Maximum Bid Limits",
      desc: "New listings require a minimum bid of ₹100 (in whole rupee amounts, with ₹1 increments). The maximum allowable bid placement cap is ₹10,00,000 (10 Lakhs INR).",
    },
    {
      num: "02",
      title: "Claiming Rank #1",
      desc: "To capture the coveted #1 top position on the public leaderboard, your bid must be at least ₹100 higher than the current standing #1 bid.",
    },
    {
      num: "03",
      title: "Any Bid Gets Listed",
      desc: "You don't have to aim for #1. Any valid bid above ₹100 is immediately published on the leaderboard, ranked wherever that amount places you in the hierarchy.",
    },
    {
      num: "04",
      title: "Tie-Breaking Policy (Time Priority)",
      desc: "If two listings have the exact same bid amount, the earlier listing retains the higher rank. New bidders must bid at least ₹1 higher to surpass an existing rank.",
    },
    {
      num: "05",
      title: "Pay Only The Difference on Re-bidding",
      desc: "When raising an existing listing, you only pay (New Desired Bid - Previous Paid Bid). Your previous payments are permanently credited toward your listing's total standing.",
    },
    {
      num: "06",
      title: "URL Canonicalization & Normalization",
      desc: "All submitted URLs are sanitized: tracking tags (utm_*, fbclid) and link shorteners are resolved to canonical destinations. App Store, Play Store, and GitHub repositories are keyed by app path so duplicate submissions consolidate rank.",
    },
    {
      num: "07",
      title: "Prohibited & Disallowed Content",
      desc: "We strictly prohibit WhatsApp/Telegram/Discord invite links, gambling/wagering platforms, and adult/NSFW content. Violating submissions are blocked at submission.",
    },
    {
      num: "08",
      title: "Payment Confirmation Required for Ranking",
      desc: "Ranks are never modified until a Razorpay payment signature or webhook confirmation is cryptographically verified by the server.",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Fair & Deterministic</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white font-mono">
          Bidding & Ranking Rules
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          RankBid operates on clear, deterministic mathematical rules. Here is everything you need to know about how placement works.
        </p>
      </div>

      {/* Rules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {rules.map((r) => (
          <div
            key={r.num}
            className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-emerald-400 font-bold text-sm">
                Rule {r.num}
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <h3 className="font-bold text-base text-white">{r.title}</h3>
            <p className="text-xs text-slate-400 leading-relaxed">{r.desc}</p>
          </div>
        ))}
      </div>

      {/* Prohibited Checklist Box */}
      <div className="p-6 sm:p-8 rounded-2xl bg-red-500/[0.04] border border-red-500/20 space-y-4">
        <div className="flex items-center gap-2 text-red-400 font-bold text-base">
          <XCircle className="w-5 h-5" />
          <span>Strictly Prohibited Listings</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <strong>🚫 Chat / Invite Links:</strong> Direct WhatsApp group, Telegram channel, Discord, or Signal invite links.
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <strong>🚫 Gambling & Wagering:</strong> Real-money betting, casino, lottery, or betting tips sites.
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <strong>🚫 Adult & NSFW:</strong> Pornographic, sexually explicit, or non-compliant content.
          </div>
        </div>
      </div>

      {/* Call to action */}
      <div className="text-center pt-4">
        <Link
          href="/submit"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
        >
          <Zap className="w-4 h-4" />
          <span>Ready to Bid? Submit Your Listing</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
