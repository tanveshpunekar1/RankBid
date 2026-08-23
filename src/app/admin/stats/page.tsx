"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  TrendingUp,
  ArrowLeft,
  MousePointerClick,
  DollarSign,
  Layers,
  CreditCard,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { formatINR, formatDate, formatTimeAgo, formatIndianNumber } from "@/lib/utils";

export default function AdminStatsPage() {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Admin Console
        </Link>

        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Refresh Stats
        </button>
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
          <h1 className="text-2xl font-black text-white font-mono">
            Platform Analytics & Revenue Desk
          </h1>
        </div>
        <p className="text-xs text-slate-400">
          Self-hosted event telemetry: gross placement fees, referral traffic clicks, and transaction log
        </p>
      </div>

      {loading && !data ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-400 mt-2">Computing analytics...</p>
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Gross Revenue (INR)</span>
              <div className="font-mono font-bold text-2xl text-emerald-400">
                {formatINR(data.stats.totalRevenueINR)}
              </div>
              <p className="text-[11px] text-slate-500">Total verified paid bids</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Active Placements</span>
              <div className="font-mono font-bold text-2xl text-white">
                {data.stats.activeListingsCount}
              </div>
              <p className="text-[11px] text-slate-500">Out of {data.stats.totalListingsCount} total</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Tracked Clicks</span>
              <div className="font-mono font-bold text-2xl text-blue-400">
                {formatIndianNumber(data.stats.totalClicksCount)}
              </div>
              <p className="text-[11px] text-slate-500">Outbound referral clicks</p>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
              <span className="text-xs font-mono text-slate-400 uppercase">Paid Transactions</span>
              <div className="font-mono font-bold text-2xl text-amber-400">
                {data.stats.totalPaidBidsCount}
              </div>
              <p className="text-[11px] text-slate-500">Razorpay captured orders</p>
            </div>
          </div>

          {/* Breakdown Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top 10 Most Clicked Listings */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <MousePointerClick className="w-4 h-4 text-blue-400" />
                  <span>Top Performing Placements (By Clicks)</span>
                </h3>
              </div>

              <div className="space-y-2.5">
                {data.topClickedListings.length === 0 ? (
                  <p className="text-xs text-slate-500">No clicks recorded yet.</p>
                ) : (
                  data.topClickedListings.map((item: any, idx: number) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-bold text-slate-400 w-5">#{idx + 1}</span>
                        <div>
                          <div className="font-bold text-white">{item.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{item.url_or_handle}</div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono font-bold text-blue-400">
                          {formatIndianNumber(item.clicks)} clicks
                        </div>
                        <div className="text-[10px] font-mono text-slate-400">
                          Bid: {formatINR(item.bidINR)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Category Revenue Distribution */}
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Revenue by Sector</span>
                </h3>
              </div>

              <div className="space-y-3">
                {data.categoryBreakdown.map((cat: any) => {
                  const percent =
                    data.stats.totalRevenueINR > 0
                      ? Math.round((cat.revenueINR / data.stats.totalRevenueINR) * 100)
                      : 0;

                  return (
                    <div key={cat.category} className="space-y-1 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-slate-300 capitalize">
                          {cat.category.replace(/-/g, " ")}
                        </span>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="text-slate-400">{percent}%</span>
                          <span className="font-bold text-emerald-400">{formatINR(cat.revenueINR)}</span>
                        </div>
                      </div>

                      <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Verified Transactions Table */}
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>Recent Paid Placement Transactions</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                    <th className="py-2.5 px-3">Listing Title</th>
                    <th className="py-2.5 px-3">Amount Paid</th>
                    <th className="py-2.5 px-3">Payment ID</th>
                    <th className="py-2.5 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {data.recentTransactions.map((tx: any) => (
                    <tr key={tx.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-semibold text-white">
                        {tx.title || tx.url_or_handle}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-400">
                        {formatINR(tx.amountINR)}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400">
                        {tx.paymentId || "—"}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">
                        {formatDate(tx.createdAt)} ({formatTimeAgo(tx.createdAt)})
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
