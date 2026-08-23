"use client";

import React from "react";
import Link from "next/link";
import { Zap, ArrowUpRight, TrendingUp, Sparkles } from "lucide-react";
import { formatINR } from "@/lib/utils";

interface TickerBarProps {
  topListing?: {
    title: string;
    current_bid_inr: number;
    category_name: string;
  };
  minBidForRank1INR?: number;
  totalListings?: number;
}

export const TickerBar: React.FC<TickerBarProps> = ({
  topListing,
  minBidForRank1INR = 100,
  totalListings = 17,
}) => {
  const topTitle = topListing?.title || "Zerodha";
  const topBid = topListing?.current_bid_inr || 75000;
  const outbidAmount = minBidForRank1INR || topBid + 100;

  const tickerItems = [
    {
      icon: TrophyIcon,
      text: (
        <span>
          👑 <strong>Rank #1:</strong> {topTitle} ({formatINR(topBid)})
        </span>
      ),
      cta: {
        text: `Take #1 for ${formatINR(outbidAmount)}`,
        href: `/submit?bid=${outbidAmount}`,
      },
    },
    {
      icon: TrendingUp,
      text: (
        <span>
          ⚡ <strong>Live Board:</strong> {totalListings} Active Paid Placements
        </span>
      ),
      cta: null,
    },
    {
      icon: Zap,
      text: (
        <span>
          🚀 <strong>Instant UPI:</strong> Re-bidding only charges the differential!
        </span>
      ),
      cta: {
        text: "Submit Listing",
        href: "/submit",
      },
    },
    {
      icon: Sparkles,
      text: (
        <span>
          🛡️ <strong>ASCI Compliant:</strong> Transparent Sponsored Placement Leaderboard
        </span>
      ),
      cta: {
        text: "View Rules",
        href: "/rules",
      },
    },
  ];

  return (
    <div className="w-full bg-slate-900/95 border-b border-emerald-500/20 py-2 overflow-hidden select-none">
      <div className="flex animate-ticker whitespace-nowrap items-center gap-12 text-xs text-slate-300">
        {/* Render twice for continuous loop */}
        {[...tickerItems, ...tickerItems].map((item, idx) => (
          <div key={idx} className="inline-flex items-center gap-3">
            <span className="flex items-center gap-1.5">{item.text}</span>
            {item.cta && (
              <Link
                href={item.cta.href}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500 hover:text-slate-950 font-semibold text-[11px] transition-colors border border-emerald-500/30"
              >
                {item.cta.text}
                <ArrowUpRight className="w-3 h-3" />
              </Link>
            )}
            <span className="text-slate-700 mx-2">•</span>
          </div>
        ))}
      </div>
    </div>
  );
};

function TrophyIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-3.5 h-3.5 text-amber-400 inline"
    >
      <path d="M19 4h-2V3a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v1H5a3 3 0 0 0-3 3v2a5 5 0 0 0 4.1 4.9A7.002 7.002 0 0 0 11 17.93V20H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A7.002 7.002 0 0 0 17.9 13.9 5 5 0 0 0 22 9V7a3 3 0 0 0-3-3Zm-15 5V7a1 1 0 0 1 1-1h1v4.83A3.003 3.003 0 0 1 4 9Zm16 0a3.003 3.003 0 0 1-2 1.83V6h1a1 1 0 0 1 1 1v2Z" />
    </svg>
  );
}
