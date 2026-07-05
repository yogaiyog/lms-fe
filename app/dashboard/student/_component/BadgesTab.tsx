"use client";

import { Star } from "lucide-react";
import Card from "./Card";
import type { Theme } from "./types";
import type { StudentBadge } from "@/lib/api";

type Props = {
  theme: Theme;
  studentBadges: StudentBadge[];
};

export default function BadgesTab({ theme, studentBadges }: Props) {
  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>Badges</h1>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>Pencapaian kamu selama belajar.</p>
        </div>
      </div>
      {studentBadges.length === 0 ? (
        <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-5xl mb-4">🏆</span>
          <h3 className={`font-bold ${theme.text}`}>Belum ada badge</h3>
          <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Ikuti kelas dan raih badge!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {studentBadges.map((sb) => (
            <Card key={sb.id} theme={theme} className="p-5 text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
                <Star size={24} className="text-amber-500" fill="currentColor" />
              </div>
              <p className={`text-sm font-bold ${theme.text}`}>{sb.badge.title}</p>
              <p className={`mt-0.5 text-[10px] ${theme.textMuted}`}>{sb.badge.description}</p>
              <p className={`mt-2 text-xs font-semibold text-blue-600`}>+{sb.badge.xpBonus} XP</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
