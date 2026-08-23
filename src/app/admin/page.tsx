"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Lock,
  BarChart3,
  Shield,
  Eye,
  EyeOff,
  Trash2,
  Edit2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Search,
  Tag,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { formatINR, formatDate } from "@/lib/utils";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pin, setPin] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Listings State
  const [listings, setListings] = useState<any[]>([]);
  const [stats, setStats] = useState<any | null>(null);
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Check auth session
  const fetchListings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/listings");
      if (res.status === 401) {
        setIsAuthenticated(false);
        return;
      }
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        setListings(data.listings);
      }
    } catch {
      // Not logged in
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch {}
  };

  useEffect(() => {
    fetchListings();
    fetchStats();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      });

      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        fetchListings();
        fetchStats();
      } else {
        setLoginError(data.error || "Invalid PIN");
      }
    } catch {
      setLoginError("Login request failed");
    } finally {
      setLoading(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      // Try PATCH
      const patchRes = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_active: !currentStatus }),
      });
      if (patchRes.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, is_active: !currentStatus } : l))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Update Category Override
  const handleCategoryOverride = async (id: string, newSlug: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/listings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, category_slug: newSlug }),
      });
      if (res.ok) {
        setListings((prev) =>
          prev.map((l) => (l.id === id ? { ...l, category_slug: newSlug } : l))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  // Delete Listing
  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/listings?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto px-4 py-20">
        <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto">
            <Lock className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <h1 className="text-xl font-bold text-white">Admin Authentication</h1>
            <p className="text-xs text-slate-400">
              Enter your master PIN to access the moderation console
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-400">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Admin PIN / Password (Default: 8888)
              </label>
              <input
                type="password"
                required
                placeholder="Enter PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                autoFocus
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all"
            >
              {loading ? "Authenticating..." : "Unlock Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const filteredListings = listings.filter((l) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      l.title.toLowerCase().includes(q) ||
      l.normalized_key.toLowerCase().includes(q) ||
      l.submitter_phone.includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h1 className="text-2xl font-black text-white font-mono">
              RankBid Admin Dashboard
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Manage listings, moderate submissions, and override categories
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/stats"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 hover:text-white hover:border-slate-600 text-xs font-semibold transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span>Revenue & Stats</span>
          </Link>

          <button
            onClick={() => {
              fetchListings();
              fetchStats();
            }}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Gross Revenue</span>
            <div className="font-mono font-bold text-xl text-emerald-400">
              {formatINR(stats.totalRevenueINR)}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Placements</span>
            <div className="font-mono font-bold text-xl text-white">
              {stats.totalListingsCount}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Clicks Tracked</span>
            <div className="font-mono font-bold text-xl text-blue-400">
              {stats.totalClicksCount}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Total Paid Transactions</span>
            <div className="font-mono font-bold text-xl text-amber-400">
              {stats.totalPaidBidsCount}
            </div>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by brand, key, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-400">
          {filteredListings.length} listings loaded
        </span>
      </div>

      {/* Listings Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-950/70 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/80 text-[11px] font-mono uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Brand / URL</th>
                <th className="py-3 px-4">Category Override</th>
                <th className="py-3 px-4">Current Paid Bid</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredListings.map((l) => (
                <tr key={l.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{l.title}</span>
                        <a
                          href={l.url_or_handle}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-500 hover:text-emerald-400"
                        >
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">{l.normalized_key}</div>
                      {l.description && (
                        <div className="text-[11px] text-slate-500 line-clamp-1">{l.description}</div>
                      )}
                    </div>
                  </td>

                  {/* Category Override */}
                  <td className="py-3.5 px-4">
                    <select
                      value={l.category_slug}
                      onChange={(e) => handleCategoryOverride(l.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      {CATEGORIES.map((cat) => (
                        <option key={cat.slug} value={cat.slug}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </td>

                  {/* Current Bid */}
                  <td className="py-3.5 px-4">
                    <div className="font-mono font-bold text-emerald-400">
                      {formatINR(l.current_bid_inr)}
                    </div>
                    <span className="text-[10px] text-slate-500">
                      {l.total_paid_bids_count} payments • {l.clicks_count} clicks
                    </span>
                  </td>

                  {/* Submitter Phone */}
                  <td className="py-3.5 px-4 font-mono text-slate-300">
                    {l.submitter_phone || "—"}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    {l.is_active ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        <EyeOff className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleActive(l.id, l.is_active)}
                        disabled={updatingId === l.id}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          l.is_active
                            ? "bg-slate-900 border-slate-700 text-slate-300 hover:text-red-400"
                            : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                        title={l.is_active ? "Hide Listing" : "Unhide Listing"}
                      >
                        {l.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => handleDelete(l.id, l.title)}
                        disabled={updatingId === l.id}
                        className="p-1.5 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                        title="Delete Listing"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
