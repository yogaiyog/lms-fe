"use client";

import { Calendar, Clock, Video } from "lucide-react";
import Card from "./Card";
import { DAY_LABELS } from "./types";
import type { Theme } from "./types";
import type { Schedule, Announcement, Class } from "@/lib/api";

type Props = {
  theme: Theme;
  user: { studentProfile?: { fullName?: string; totalXp?: number; currentStreak?: number } | null } | null;
  totalMeetLeft: number;
  weekSchedules: Schedule[];
  countdowns: Record<string, { days: number; hours: number; minutes: number; seconds: number }>;
  allClasses: Class[];
  announcements: Announcement[];
};

export default function OverviewTab({ theme, user, totalMeetLeft, weekSchedules, countdowns, allClasses, announcements }: Props) {
  const now = new Date();
  const todayDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][now.getDay()];
  const activeClassIds = new Set(allClasses.filter((c) => c.isActive !== false).map((c) => c.id));
  const activeWeekSchedules = weekSchedules.filter((s) => activeClassIds.has(s.classId));

  return (
    <div className="space-y-6">

      
      <div>
        <h1 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${theme.text}`}>
          Halo, {user?.studentProfile?.fullName ?? "Student"}! 👋
        </h1>
        <p className={`mt-0.5 text-xs sm:text-sm ${theme.textMuted}`}>Selamat datang kembali di dashboard kamu.</p>
      </div>

            {announcements.length > 0 && (
        <Card theme={theme} className="p-4 sm:p-6">
          <h2 className={`font-bold text-sm sm:text-base mb-3 ${theme.text}`}>Pengumuman</h2>
          <div className="space-y-2">
            {announcements.map((a) => (
              <div key={a.id} className={`rounded-xl p-3 ${theme.dark ? "bg-slate-800" : "bg-amber-50"}`}>
                <h3 className={`text-xs font-bold ${theme.text}`}>{a.title}</h3>
                <p className={`mt-0.5 text-xs sm:text-sm ${theme.textMuted}`}>{a.content}</p>
                <p className={`mt-1.5 text-[10px] ${theme.textMuted}`}>
                  {allClasses.find((c) => c.id === a.classId)?.name ?? "Kelas"} — {a.tutor?.fullName ?? "Tutor"} — {new Date(a.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div>
        <h2 className={`mb-3 text-xs sm:text-sm font-semibold ${theme.textMuted}`}>Jadwal minggu ini</h2>

        {activeWeekSchedules.length === 0 ? (
          <Card theme={theme} className="p-8 sm:p-12 flex flex-col items-center text-center border-dashed">
            <span className="text-4xl sm:text-5xl mb-3">📅</span>
            <h3 className={`font-bold text-sm sm:text-base ${theme.text}`}>Tidak ada jadwal minggu ini</h3>
            <p className={`text-xs sm:text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kamu tidak memiliki jadwal minggu ini</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {activeWeekSchedules.map((schedule) => {
              const cd = countdowns[schedule.id];
              const isCountdownZero = cd && cd.days === 0 && cd.hours === 0 && cd.minutes === 0 && cd.seconds === 0;
              const isOngoing = isCountdownZero && !schedule.isDone;
              const isSoon = cd && !isCountdownZero && cd.days === 0 && cd.hours < 2;
              const showMeetLink = schedule.dayOfWeek === todayDay && schedule.meetLink;
              return (
                <Card key={schedule.id} theme={theme} className="p-4 sm:p-5">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isOngoing ? "bg-emerald-100" : isSoon ? "bg-amber-100" : schedule.isDone ? "bg-slate-100" : cd ? "bg-blue-100" : "bg-slate-100"}`}>
                        <Calendar size={18} className={isOngoing ? "text-emerald-600" : isSoon ? "text-amber-600" : schedule.isDone ? "text-slate-400" : cd ? "text-blue-600" : "text-slate-400"} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[10px] font-semibold uppercase tracking-wide ${theme.textMuted}`}>{allClasses.find((c) => c.id === schedule.classId)?.name ?? "Kelas"}</p>
                        <h3 className={`text-sm font-bold ${theme.text}`}>
                          {DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek}, {new Date(schedule.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </h3>
                        <p className={`text-xs ${theme.textMuted}`}>{schedule.startTime}–{schedule.endTime}</p>
                        {schedule.topic && (
                          <p className={`text-[11px] mt-0.5 font-semibold ${isOngoing ? "text-emerald-600" : "text-blue-600"}`}>{schedule.topic}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-13 sm:pl-0">
                      {schedule.isDone ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500 cursor-default">
                          <Clock size={10} /> Selesai
                        </span>
                      ) : isOngoing ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 animate-pulse">
                          Berlangsung
                        </span>
                      ) : cd && !isCountdownZero ? (
                        <div className="flex items-center gap-1.5">
                          {cd.days > 0 && (
                            <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-1 ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                              <span className={`text-xs font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{cd.days}</span>
                              <span className={`text-[9px] ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>h</span>
                            </div>
                          )}
                          <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-1 ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                            <span className={`text-xs font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{String(cd.hours).padStart(2, "0")}</span>
                            <span className={`text-[9px] ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>j</span>
                          </div>
                          <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-1 ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                            <span className={`text-xs font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{String(cd.minutes).padStart(2, "0")}</span>
                            <span className={`text-[9px] ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>m</span>
                          </div>
                          {cd.days === 0 && (
                            <div className="flex items-center gap-0.5 rounded-lg px-1.5 py-1 bg-red-100">
                              <span className="text-xs font-extrabold text-red-700">{String(cd.seconds).padStart(2, "0")}</span>
                              <span className="text-[9px] text-red-500">d</span>
                            </div>
                          )}
                        </div>
                      ) : null}

                      {showMeetLink && (
                        <a href={schedule.meetLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors">
                          <Video size={12} /> Meet
                        </a>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {allClasses.length === 0 && (
        <Card theme={theme} className="p-8 sm:p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-4xl sm:text-5xl mb-3">📭</span>
          <h2 className={`font-bold text-sm sm:text-base ${theme.text}`}>Belum ada kelas</h2>
          <p className={`text-xs sm:text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kamu belum terdaftar di kelas manapun.</p>
        </Card>
      )}


    </div>
  );
}
