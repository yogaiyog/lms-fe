"use client";

import { Calendar, Clock, Video, Users, BookOpen, CheckCircle2, AlertTriangle, Bed, FileX } from "lucide-react";
import Card from "./Card";
import { DAY_LABELS } from "./types";
import type { Theme } from "./types";
import type { Schedule, Class, Attendance } from "@/lib/api";

type Props = {
  theme: Theme;
  schedules: Schedule[];
  classes: Class[];
  attendances: Attendance[];
};

export default function ScheduleTab({ theme, schedules, classes, attendances }: Props) {
  const todayStr = new Date().toISOString().split("T")[0];

  const attendanceByScheduleId = new Map<string, Attendance>();
  for (const a of attendances) {
    if (!attendanceByScheduleId.has(a.scheduleId)) {
      attendanceByScheduleId.set(a.scheduleId, a);
    }
  }

  const STATUS_BADGE: Record<string, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
    PRESENT: { label: "Masuk", bg: "bg-emerald-100", text: "text-emerald-700", icon: <CheckCircle2 size={10} /> },
    LATE: { label: "Terlambat", bg: "bg-amber-100", text: "text-amber-700", icon: <Clock size={10} /> },
    SICK: { label: "Sakit", bg: "bg-red-100", text: "text-red-700", icon: <Bed size={10} /> },
    PERMISSION: { label: "Izin", bg: "bg-orange-100", text: "text-orange-700", icon: <FileX size={10} /> },
    ABSENT: { label: "Tidak Hadir", bg: "bg-red-100", text: "text-red-700", icon: <AlertTriangle size={10} /> },
  };

  function classFor(schedule: Schedule) {
    return classes.find((c) => c.id === schedule.classId);
  }

  const activeClassIds = new Set(classes.filter((c) => c.isActive !== false).map((c) => c.id));

  const sorted = [...schedules].filter((s) => activeClassIds.has(s.classId)).sort((a, b) => a.date.localeCompare(b.date));

  const grouped: Record<string, Schedule[]> = {};
  for (const s of sorted) {
    const cId = s.classId;
    if (!grouped[cId]) grouped[cId] = [];
    grouped[cId].push(s);
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
          <h2 className={`font-bold ${theme.text}`}>Belum ada jadwal</h2>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(grouped).map(([classId, classSchedules]) => {
            const cls = classes.find((c) => c.id === classId);
            return (
              <div key={classId}>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen size={16} className="text-indigo-500" />
                  <h2 className={`text-base font-extrabold ${theme.text}`}>{cls?.name ?? "Kelas"}</h2>
                  {cls?.enrollments && cls.enrollments.length > 0 && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                      <Users size={10} />
                      {cls.enrollments.length} siswa
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {classSchedules.map((schedule) => {
                    const isPast = !!schedule.date && schedule.date < todayStr;
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
                              {isPast && (() => {
                                const att = attendanceByScheduleId.get(schedule.id);
                                const b = att ? STATUS_BADGE[att.status] : null;
                                return b ? (
                                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${b.bg} ${b.text}`}>
                                    {b.icon} {b.label}
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                                    <Clock size={10} /> Selesai
                                  </span>
                                );
                              })()}
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
