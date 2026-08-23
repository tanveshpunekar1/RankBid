"use client";

import React from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";
import { cn } from "@/lib/utils";
import {
  Layers,
  Rocket,
  Sparkles,
  ShoppingBag,
  Utensils,
  Building2,
  GraduationCap,
  Briefcase,
  Activity,
  Shirt,
  Wrench,
  Video,
  PartyPopper,
  Landmark,
  Plane,
  Globe,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Sparkles,
  ShoppingBag,
  Utensils,
  Building2,
  GraduationCap,
  Briefcase,
  Activity,
  Shirt,
  Wrench,
  Video,
  PartyPopper,
  Landmark,
  Plane,
  Globe,
};

interface CategoryPillsProps {
  selectedSlug?: string;
  onSelect?: (slug: string) => void;
  isLink?: boolean;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  selectedSlug = "all",
  onSelect,
  isLink = false,
}) => {
  const allCategories = [
    { slug: "all", name: "All Placements", icon: "Layers" },
    ...CATEGORIES.map((c) => ({ slug: c.slug, name: c.name, icon: c.icon })),
  ];

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2">
      <div className="flex items-center gap-2 min-w-max px-1">
        {allCategories.map((cat) => {
          const isSelected = selectedSlug === cat.slug;
          const Icon = ICON_MAP[cat.icon] || Layers;

          const content = (
            <div className="flex items-center gap-1.5">
              <Icon className={cn("w-3.5 h-3.5", isSelected ? "text-emerald-400" : "text-slate-400")} />
              <span>{cat.name}</span>
            </div>
          );

          const className = cn(
            "px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 select-none whitespace-nowrap border",
            isSelected
              ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/40 shadow-sm shadow-emerald-500/20 font-semibold"
              : "bg-slate-900/80 text-slate-300 border-slate-800 hover:bg-slate-800 hover:text-white"
          );

          if (isLink) {
            return (
              <Link
                key={cat.slug}
                href={cat.slug === "all" ? "/" : `/category/${cat.slug}`}
                className={className}
              >
                {content}
              </Link>
            );
          }

          return (
            <button
              key={cat.slug}
              type="button"
              onClick={() => onSelect && onSelect(cat.slug)}
              className={className}
            >
              {content}
            </button>
          );
        })}
      </div>
    </div>
  );
};
