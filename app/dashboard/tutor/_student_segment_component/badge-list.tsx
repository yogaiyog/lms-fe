"use client";

import { Award } from "lucide-react";
import type { Theme } from "./types";
import type { StudentBadge } from "@/lib/api";

export default function BadgeList({
  theme, badges,
}: {
  theme: Theme;
  badges: StudentBadge[];
}) {
  if (badges.length === 0) return null;

  return (
    <div>
      <h3 className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${theme.text}`}>
        <Award size={14} /> Badge ({badges.length})
      </h3>
      <div className="flex flex-wrap gap-2">
        {badges.map((sb) => (
          <div
            key={sb.id}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${theme.dark ? "bg-slate-800 text-amber-400" : "bg-amber-50 text-amber-700"}`}
          >
            <Award size={12} /> {sb.badge.title}
          </div>
        ))}
      </div>
    </div>
  );
}
