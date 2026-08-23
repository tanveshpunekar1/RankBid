import React from "react";
import Link from "next/link";
import { Zap, Trophy, ShieldCheck, ArrowRight, Sparkles, TrendingUp } from "lucide-react";
import { TickerBar } from "@/components/TickerBar";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { prisma } from "@/lib/prisma";
import { formatINR } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function getInitialMetadata() {
  try {
    const topBid = await prisma.bid.findFirst({
      where: { is_current: true, status: "PAID" },
      orderBy: [{ amount_paise: "desc" }, { created_at: "asc" }],
      include: {
        listing: {
          include: { category: true },
        },
      },
    });

    const totalListings = await prisma.listing.count({ where: { is_active: true } });

    const topBidINR = topBid ? Math.floor(topBid.amount_paise / 100) : 75000;
    const minBidForRank1INR = topBidINR + 100;

    return {
      topListing: topBid
        ? {
            title: topBid.listing.title,
            current_bid_inr: topBidINR,
            category_name: topBid.listing.category?.name || "Startups",
          }
        : undefined,
      minBidForRank1INR,
      totalListings,
    };
  } catch {
    return {
      topListing: { title: "Zerodha", current_bid_inr: 75000, category_name: "Finance & Fintech" },
      minBidForRank1INR: 75100,
      totalListings: 17,
    };
  }
}

export default async function HomePage() {
  const { topListing, minBidForRank1INR, totalListings } = await getInitialMetadata();

  return (
    <div className="space-y-8 pb-12">
      {/* Live Ticker Strip */}
      <TickerBar
        topListing={topListing}
        minBidForRank1INR={minBidForRank1INR}
        totalListings={totalListings}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 pt-4">
        {/* Hero Section */}
        <section className="text-center space-y-5 max-w-3xl mx-auto pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-emerald-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>India&apos;s Public Pay-To-Rank Featured Leaderboard</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white font-mono">
            Pay To Rank. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Claim Your Spot in Bharat.
            </span>
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
            A 100% transparent paid placement advertising directory for Indian startups, SaaS, D2C brands, local businesses, and creators. Rank is determined purely by verified INR placement bids.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/submit"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/25 transition-all duration-200 active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>List Your Brand (from ₹100)</span>
            </Link>

            <Link
              href={`/submit?bid=${minBidForRank1INR}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-300 font-bold text-sm transition-all"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Claim Rank #1 for {formatINR(minBidForRank1INR)}</span>
            </Link>
          </div>

          {/* Value Stats Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-4 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
              <span className="text-[10px] uppercase font-mono text-slate-400">Current Top Bid</span>
              <div className="font-mono font-bold text-emerald-400 text-sm sm:text-base">
                {formatINR(topListing?.current_bid_inr || 75000)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
              <span className="text-[10px] uppercase font-mono text-slate-400">Min to Claim #1</span>
              <div className="font-mono font-bold text-amber-400 text-sm sm:text-base">
                {formatINR(minBidForRank1INR)}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
              <span className="text-[10px] uppercase font-mono text-slate-400">Active Listings</span>
              <div className="font-mono font-bold text-slate-200 text-sm sm:text-base">
                {totalListings} Brands
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-left">
              <span className="text-[10px] uppercase font-mono text-slate-400">Payment Gateway</span>
              <div className="font-mono font-bold text-teal-400 text-sm sm:text-base">
                Razorpay UPI / Cards
              </div>
            </div>
          </div>
        </section>

        {/* Live Leaderboard Table Section */}
        <section className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
              <h2 className="text-lg sm:text-xl font-mono font-bold text-white tracking-tight">
                Live Public Leaderboard
              </h2>
            </div>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Sorted by verified bid amount (INR)
            </span>
          </div>

          <LeaderboardTable initialCategory="all" />
        </section>

        {/* How it Works / 3 Step Explanation */}
        <section className="p-6 sm:p-8 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 font-bold">
              Simple & Transparent
            </span>
            <h3 className="text-xl font-bold text-white">How Placement on RankBid Works</h3>
            <p className="text-xs text-slate-400">
              No hidden algorithms. Guaranteed placement based entirely on your advertising bid.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center font-bold font-mono text-emerald-400 text-sm">
                01
              </div>
              <h4 className="font-bold text-sm text-white">Submit URL or Handle</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Enter your startup website, app store link, or Instagram/X @handle. We normalize all URLs and filter tracking tags.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center font-bold font-mono text-amber-400 text-sm">
                02
              </div>
              <h4 className="font-bold text-sm text-white">Set Your INR Bid</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Choose your placement amount (from ₹100). Re-bidding on an existing listing only charges the difference!
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center font-bold font-mono text-blue-400 text-sm">
                03
              </div>
              <h4 className="font-bold text-sm text-white">Instant UPI Activation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pay seamlessly with UPI/Cards via Razorpay. Your rank is updated live on the board the instant payment confirms.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
