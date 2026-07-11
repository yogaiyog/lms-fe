"use client";

import { BookOpen } from "lucide-react";
import type { Theme, ClassWithEnrollments } from "./types";
import { CATEGORY_LABELS, Card } from "./components";

export default function ClassListSection({
  theme, classes, studentId,
}: {
  theme: Theme;
  classes: ClassWithEnrollments[];
  studentId: string;
}) {
  if (classes.length === 0) return null;

  return (
    <Card theme={theme} className="p-6">
      <h3 className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${theme.text}`}>
        <BookOpen size={14} /> Kelas
      </h3>
      <div className="space-y-2">
        {classes.map((cls) => {
          const enrollment = (cls.enrollments ?? []).find((e) => e.studentId === studentId);
          return (
            <div key={cls.id}>
              <div className={`rounded-xl px-3 py-2.5 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-bold ${theme.text}`}>{cls.name}</p>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {(cls.category && typeof cls.category === "object" ? cls.category.label : CATEGORY_LABELS[cls.category as string]) ?? "-"}
                  </span>
                </div>
                {enrollment && (
                  <p className={`text-xs mt-1 ${theme.textMuted}`}>
                    Sisa pertemuan: {enrollment.totalMeetLeft ?? "?"} / {enrollment.totalMeetPurchased ?? "?"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
