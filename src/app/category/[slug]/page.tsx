import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/categories";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import { ArrowLeft, Zap, Sparkles } from "lucide-react";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = CATEGORIES.find((c) => c.slug === slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Breadcrumbs & Header */}
      <div className="space-y-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Sectors
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-slate-950 border border-slate-800">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
                Sector Leaderboard
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white font-mono">
              {category.name}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl">
              {category.description}
            </p>
          </div>

          <Link
            href={`/submit?category=${category.slug}`}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 self-start sm:self-auto"
          >
            <Zap className="w-4 h-4" />
            <span>List in {category.name}</span>
          </Link>
        </div>
      </div>

      {/* Filtered Leaderboard Table */}
      <LeaderboardTable initialCategory={category.slug} />
    </div>
  );
}
