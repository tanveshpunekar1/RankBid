import React from "react";
import Link from "next/link";
import { ShieldCheck, ArrowUpRight, Heart } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";

export const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 mt-20">
      {/* Persistent Regulatory & ASCI Compliance Banner */}
      <div className="border-b border-slate-800/60 bg-amber-500/5 px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-amber-200/90">
          <div className="flex items-center gap-2 text-center sm:text-left">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              <strong>Regulatory Notice:</strong> Rank reflects amount paid for placement. This is a paid advertising product, not a game of chance or wagering platform.
            </span>
          </div>
          <Link
            href="/legal/disclosures"
            className="inline-flex items-center gap-1 font-semibold text-amber-400 hover:text-amber-300 underline underline-offset-2 shrink-0"
          >
            Read ASCI Disclosures <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-black text-slate-950">
                <span>₹</span>
              </div>
              <span className="font-mono font-bold text-lg text-white">
                Rank<span className="text-emerald-400">Bid</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s premier transparent paid-placement leaderboard. Direct, verifiable advertising visibility for high-growth startups, D2C brands, creators, and businesses across Bharat.
            </p>
            <div className="text-xs text-slate-400 flex items-center gap-1">
              Built with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> for Indian Builders 🇮🇳
            </div>
          </div>

          {/* Col 2: Categories quick links */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
              Popular Sectors
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(0, 6).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: More Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
              More Sectors
            </h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(6, 12).map((cat) => (
                <li key={cat.slug}>
                  <Link
                    href={`/category/${cat.slug}`}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Platform & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider font-semibold text-slate-200">
              Transparency & Legal
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/about" className="hover:text-emerald-400 transition-colors">
                  How RankBid Works
                </Link>
              </li>
              <li>
                <Link href="/rules" className="hover:text-emerald-400 transition-colors">
                  Bidding & Placement Rules
                </Link>
              </li>
              <li>
                <Link href="/legal/disclosures" className="hover:text-emerald-400 transition-colors">
                  ASCI Advertising Disclosures
                </Link>
              </li>
              <li>
                <Link href="/submit" className="hover:text-emerald-400 transition-colors">
                  Submit or Raise a Listing
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-emerald-400 transition-colors">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div>
            &copy; {new Date().getFullYear()} RankBid India. All rights reserved. Razorpay Secured UPI & Cards.
          </div>
          <div className="flex items-center gap-4">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-[11px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Dynamic Leaderboard
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
