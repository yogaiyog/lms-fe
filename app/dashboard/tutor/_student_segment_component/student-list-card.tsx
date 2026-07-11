"use client";

import { User, Star, Zap } from "lucide-react";
import type { StudentProfile } from "@/lib/api";
import type { Theme, ClassWithEnrollments } from "./types";
import { CATEGORY_LABELS } from "./components";

export default function StudentListCard({
  student, theme, classes, onClick,
}: {
  student: StudentProfile;
  theme: Theme;
  classes: ClassWithEnrollments[];
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl border ${theme.border} ${theme.card} shadow-sm p-4 sm:p-5 cursor-pointer hover:shadow-md transition-all`}
    >
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${theme.dark ? "bg-slate-800" : "bg-blue-50"}`}>
          <User size={22} className="text-blue-600" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`font-extrabold ${theme.text}`}>{student.nickname || student.fullName}</h3>
            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
              {student.category?.label ?? "-"}
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${theme.textMuted}`}>
            {student.fullName}
            {classes.length > 0 && ` · ${classes.length} kelas`}
          </p>
          <div className="flex items-center gap-4 mt-1.5">
            {/* <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600">
              <Star size={12} /> {student.totalXp} XP
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <Zap size={12} /> Streak {student.currentStreak ?? 0}
            </span> */}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {classes.map((c) => (
            <span key={c.id} className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              {c.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
