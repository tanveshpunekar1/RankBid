"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  Zap,
  TrendingUp,
  MousePointerClick,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  Tag,
} from "lucide-react";
import { RankBadge } from "./RankBadge";
import { CategoryPills } from "./CategoryPills";
import { formatINR, formatTimeAgo, formatIndianNumber } from "@/lib/utils";

export interface LeaderboardItem {
  rank: number;
  id: string;
  title: string;
  url_or_handle: string;
  normalized_key: string;
  description?: string | null;
  category_slug: string;
  category_name: string;
  category_icon: string;
  current_bid_paise: number;
  current_bid_inr: number;
  bid_created_at: string;
  clicks_count: number;
  created_at: string;
}

interface LeaderboardTableProps {
  initialCategory?: string;
}

export const LeaderboardTable: React.FC<LeaderboardTableProps> = ({
  initialCategory = "all",
}) => {
  const [category, setCategory] = useState(initialCategory);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [listings, setListings] = useState<LeaderboardItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [topBidINR, setTopBidINR] = useState(0);
  const [minBidForRank1INR, setMinBidForRank1INR] = useState(100);
  const [loading, setLoading] = useState(true);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category && category !== "all") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", page.toString());
      params.set("limit", "50");

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();

      if (data.success) {
        setListings(data.listings);
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.total);
        setTopBidINR(data.stats.topBidINR);
        setMinBidForRank1INR(data.stats.minBidForRank1INR);
      }
    } catch (err) {
      console.error("Failed to load leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [category, search, page]);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleCategoryChange = (slug: string) => {
    setCategory(slug);
    setPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search & Category Filter Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by brand, URL, or keyword..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-400">
              Showing <strong>{listings.length}</strong> of <strong>{totalCount}</strong> listings
            </span>
            <Link
              href={`/submit?bid=${minBidForRank1INR}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 hover:bg-amber-500 hover:text-slate-950 font-semibold text-xs transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Claim #1 for {formatINR(minBidForRank1INR)}</span>
            </Link>
          </div>
        </div>

        {/* Sector Pills */}
        <CategoryPills selectedSlug={category} onSelect={handleCategoryChange} />
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 overflow-hidden shadow-xl backdrop-blur-sm">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-slate-400">Fetching live rankings...</p>
          </div>
        ) : listings.length === 0 ? (
          <div className="p-16 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 mx-auto">
              <Filter className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">No listings found</h3>
              <p className="text-xs text-slate-400 mt-1">
                {search
                  ? `No placements matching "${search}".`
                  : "Be the very first brand to claim rank in this category!"}
              </p>
            </div>
            <Link
              href={`/submit?category=${category !== "all" ? category : "startups-saas"}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20"
            >
              <Zap className="w-3.5 h-3.5" /> Claim This Placement (from ₹100)
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                  <th className="py-3.5 px-4 w-16 text-center">Rank</th>
                  <th className="py-3.5 px-4">Brand / Placement</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Category</th>
                  <th className="py-3.5 px-4 text-right">Amount Paid</th>
                  <th className="py-3.5 px-4 text-center hidden sm:table-cell">Traffic</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {listings.map((item) => {
                  const isTop3 = item.rank <= 3;
                  const nextOutbidAmount = item.rank === 1 ? item.current_bid_inr + 100 : item.current_bid_inr + 1;

                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-900/50 transition-colors group ${
                        item.rank === 1
                          ? "bg-amber-500/[0.03]"
                          : item.rank === 2
                          ? "bg-slate-300/[0.02]"
                          : item.rank === 3
                          ? "bg-orange-500/[0.02]"
                          : ""
                      }`}
                    >
                      {/* Rank Badge */}
                      <td className="py-4 px-4 text-center">
                        <RankBadge rank={item.rank} size={isTop3 ? "md" : "sm"} />
                      </td>

                      {/* Brand Info */}
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <a
                              href={`/api/listings/${item.id}/click`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-bold text-sm text-white group-hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
                            >
                              <span>{item.title}</span>
                              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-emerald-400" />
                            </a>

                            {/* Persistent ASCI Paid Placement Label */}
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              Paid Placement
                            </span>
                          </div>

                          {item.description && (
                            <p className="text-slate-400 text-xs line-clamp-1 max-w-lg">
                              {item.description}
                            </p>
                          )}

                          <div className="flex items-center gap-3 text-[11px] text-slate-400">
                            <span className="font-mono text-slate-400">{item.normalized_key}</span>
                            <span>•</span>
                            <span>{formatTimeAgo(item.bid_created_at)}</span>
                            <span className="md:hidden">•</span>
                            <span className="md:hidden text-emerald-400">{item.category_name}</span>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 hidden md:table-cell">
                        <Link
                          href={`/category/${item.category_slug}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors text-xs font-medium"
                        >
                          <Tag className="w-3 h-3 text-emerald-400" />
                          <span>{item.category_name}</span>
                        </Link>
                      </td>

                      {/* Amount Paid in INR */}
                      <td className="py-4 px-4 text-right">
                        <div className="font-mono font-bold text-sm sm:text-base text-emerald-400">
                          {formatINR(item.current_bid_inr)}
                        </div>
                        <span className="text-[10px] text-slate-400">Verified Paid</span>
                      </td>

                      {/* Clicks Metric */}
                      <td className="py-4 px-4 text-center hidden sm:table-cell">
                        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-800 text-slate-400 text-[11px] font-mono">
                          <MousePointerClick className="w-3 h-3 text-slate-400" />
                          <span>{formatIndianNumber(item.clicks_count)} clicks</span>
                        </div>
                      </td>

                      {/* Quick Outbid / Raise CTA */}
                      <td className="py-4 px-4 text-right">
                        <Link
                          href={`/submit?url=${encodeURIComponent(item.url_or_handle)}&bid=${nextOutbidAmount}`}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all duration-150 active:scale-95 shadow-sm ${
                            item.rank === 1
                              ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20"
                              : "bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-slate-200 border border-slate-700"
                          }`}
                        >
                          <Zap className="w-3 h-3" />
                          <span>
                            {item.rank === 1
                              ? `Outbid for ${formatINR(nextOutbidAmount)}`
                              : `Outbid (₹${formatIndianNumber(nextOutbidAmount)})`}
                          </span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="border-t border-slate-800 bg-slate-900/60 px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-slate-400">
              Page <strong>{page}</strong> of <strong>{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
