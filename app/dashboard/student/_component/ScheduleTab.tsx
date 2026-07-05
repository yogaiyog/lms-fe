"use client";

import { Calendar, Clock, Video, Users, BookOpen } from "lucide-react";
import Card from "./Card";
import { DAY_LABELS } from "./types";
import type { Theme } from "./types";
import type { Schedule, Class } from "@/lib/api";

type Props = {
  theme: Theme;
  schedules: Schedule[];
  classes: Class[];
};

export default function ScheduleTab({ theme, schedules, classes }: Props) {
  const todayStr = new Date().toISOString().split("T")[0];

  function classFor(schedule: Schedule) {
    return classes.find((c) => c.id === schedule.classId);
  }

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>Jadwal</h1>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>Semua jadwal kelas kamu.</p>
        </div>
      </div>

      {schedules.length === 0 ? (
        <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-5xl mb-4">📅</span>
          <h3 className={`font-bold ${theme.text}`}>Belum ada jadwal</h3>
        </Card>
      ) : (
        <div className="space-y-2">
          {[...schedules]
            .sort((a, b) => a.date.localeCompare(b.date))
            .map((schedule) => {
              const isPast = !!schedule.date && schedule.date < todayStr;
              const cls = classFor(schedule);
              return (
                <div key={schedule.id}
                  className={`rounded-2xl border ${theme.border} ${theme.card} px-4 py-3 flex items-center justify-between gap-3 ${isPast ? "opacity-50" : ""}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isPast ? "bg-slate-200" : "bg-blue-100"}`}>
                      <Calendar size={18} className={isPast ? "text-slate-400" : "text-blue-600"} />
                    </div>
                    <div className="min-w-0">
                      <p className={`text-sm font-semibold ${isPast ? theme.textMuted : theme.text}`}>
                        {DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek}
                      </p>
                      <p className={`text-xs ${theme.textMuted}`}>
                        {schedule.date && new Date(schedule.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        {schedule.date ? " · " : ""}{schedule.startTime}–{schedule.endTime}
                      </p>
                      {schedule.topic && (
                        <p className={`text-xs font-semibold mt-0.5 ${isPast ? "text-slate-400" : "text-blue-600"}`}>{schedule.topic}</p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {cls && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                            <BookOpen size={10} />
                            {cls.name}
                          </span>
                        )}
                        {cls?.enrollments && cls.enrollments.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                            <Users size={10} />
                            {cls.enrollments.length} siswa
                          </span>
                        )}
                        {isPast && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                            <Clock size={10} /> Selesai
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {schedule.meetLink && !isPast && (
                    <a href={schedule.meetLink} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-xl bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition-colors shrink-0">
                      <Video size={14} /> Meet
                    </a>
                  )}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
