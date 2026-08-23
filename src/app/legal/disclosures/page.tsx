import React from "react";
import Link from "next/link";
import { ShieldCheck, FileText, AlertTriangle, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "ASCI Advertising & Sponsored Placement Disclosures — RankBid India",
  description: "Official legal and regulatory disclosures for paid advertising placement on RankBid.",
};

export default function DisclosuresPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Leaderboard
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Advertising Standards Council of India (ASCI) Alignment</span>
        </div>
        <h1 className="text-3xl font-black text-white font-mono">
          Advertising & Paid Placement Disclosures
        </h1>
        <p className="text-xs text-slate-400">
          Last Updated: February 2026 • Compliant with Indian Digital Media & Advertising Norms
        </p>
      </div>

      {/* Primary Statement Box */}
      <div className="p-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 text-amber-200">
        <div className="flex items-center gap-2 font-bold text-base text-amber-300">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>Critical Regulatory Statement</span>
        </div>
        <p className="text-xs sm:text-sm leading-relaxed text-amber-100/90 font-medium">
          RankBid is exclusively a <strong>paid advertising and commercial placement platform</strong>. The numerical ranking of listings on this website reflects solely the amount of advertising fee paid by the submitter for sponsored placement.
        </p>
        <p className="text-xs leading-relaxed text-amber-200/80">
          RankBid is <strong>NOT</strong> a game of chance, wagering platform, gambling service, prize competition, or financial auction. No user earns a return on capital or monetary prize.
        </p>
      </div>

      {/* Disclosure Articles */}
      <div className="space-y-8 text-xs text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white font-mono">
            1. Nature of the Service
          </h2>
          <p>
            RankBid provides digital advertising visibility and outbound web directory placement for commercial entities, SaaS developers, creators, and brands. By submitting a bid, the submitter is purchasing featured digital advertising space on our domain.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white font-mono">
            2. Labeling of Sponsored Content
          </h2>
          <p>
            In compliance with the ASCI Guidelines for Influencer and Digital Advertising, every individual listing displayed on the RankBid leaderboard is prominently tagged with a persistent &ldquo;Paid Placement&rdquo; badge. Consumers visiting this platform are thereby explicitly notified that rank ordering is a direct function of commercial consideration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white font-mono">
            3. Deterministic Hierarchy (No Chance Element)
          </h2>
          <p>
            Position on the leaderboard is determined strictly by a deterministic mathematical formula: highest valid INR advertising payment takes the higher rank. In case of identical bid amounts, time priority applies. There is zero element of chance, drawing, or lottery.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white font-mono">
            4. Prohibited Content & Editorial Discretion
          </h2>
          <p>
            We enforce strict standards regarding content that may appear on our platform. Submissions linking to online gambling, betting, unauthorized financial schemes, adult content, hate speech, or deceptive services will be rejected or permanently removed without compensation.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white font-mono">
            5. Payments, Taxes & Invoicing
          </h2>
          <p>
            All placement fees are collected in Indian Rupees (INR) via regulated payment gateways (Razorpay). Prices are inclusive of applicable Goods and Services Tax (GST) as governed by the laws of India. Payments for confirmed digital placement are non-refundable once published.
          </p>
        </section>
      </div>

      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-3">
        <FileText className="w-6 h-6 text-emerald-400 mx-auto" />
        <h3 className="text-sm font-bold text-white">Questions or Compliance Inquiries?</h3>
        <p className="text-xs text-slate-400">
          Contact our legal and compliance desk at <strong className="text-slate-200">legal@rankbid.in</strong>
        </p>
      </div>
    </div>
  );
}
