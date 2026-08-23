import React from "react";
import { Trophy, Medal, Award } from "lucide-react";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
  rank: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const RankBadge: React.FC<RankBadgeProps> = ({ rank, size = "md", className }) => {
  if (rank === 1) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center font-bold font-mono rounded-lg shadow-lg border transition-all duration-300",
          "bg-gradient-to-br from-amber-300 via-yellow-500 to-amber-600 text-slate-950 border-yellow-300 shadow-yellow-500/20",
          size === "sm" && "px-2 py-0.5 text-xs gap-1",
          size === "md" && "px-3 py-1 text-sm gap-1.5",
          size === "lg" && "px-4 py-1.5 text-base gap-2",
          className
        )}
      >
        <Trophy className={size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"} />
        <span>#1</span>
      </div>
    );
  }

  if (rank === 2) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center font-bold font-mono rounded-lg shadow-md border transition-all duration-300",
          "bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-900 border-slate-200 shadow-slate-400/20",
          size === "sm" && "px-2 py-0.5 text-xs gap-1",
          size === "md" && "px-3 py-1 text-sm gap-1.5",
          size === "lg" && "px-4 py-1.5 text-base gap-2",
          className
        )}
      >
        <Medal className={size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"} />
        <span>#2</span>
      </div>
    );
  }

  if (rank === 3) {
    return (
      <div
        className={cn(
          "inline-flex items-center justify-center font-bold font-mono rounded-lg shadow-md border transition-all duration-300",
          "bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 text-amber-50 border-amber-500/40 shadow-orange-700/20",
          size === "sm" && "px-2 py-0.5 text-xs gap-1",
          size === "md" && "px-3 py-1 text-sm gap-1.5",
          size === "lg" && "px-4 py-1.5 text-base gap-2",
          className
        )}
      >
        <Award className={size === "sm" ? "w-3 h-3" : size === "md" ? "w-4 h-4" : "w-5 h-5"} />
        <span>#3</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center font-mono font-semibold rounded-md border",
        "bg-slate-800/80 text-slate-300 border-slate-700/60",
        size === "sm" && "px-1.5 py-0.5 text-xs min-w-[28px]",
        size === "md" && "px-2.5 py-1 text-xs min-w-[36px]",
        size === "lg" && "px-3 py-1.5 text-sm min-w-[44px]",
        className
      )}
    >
      #{rank}
    </div>
  );
};
