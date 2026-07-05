"use client";

import { Calendar, Clock, Video } from "lucide-react";
import Card from "./Card";
import { DAY_LABELS } from "./types";
import type { Theme } from "./types";
import type { Schedule, Announcement } from "@/lib/api";

type Props = {
  theme: Theme;
  user: { studentProfile?: { fullName?: string; totalXp?: number; currentStreak?: number } | null } | null;
  totalMeetLeft: number;
  weekSchedules: Schedule[];
  countdowns: Record<string, { days: number; hours: number; minutes: number; seconds: number }>;
  selectedClass: { name?: string } | null;
  announcements: Announcement[];
};

export default function OverviewTab({ theme, user, totalMeetLeft, weekSchedules, countdowns, selectedClass, announcements }: Props) {
  const now = new Date();
  const todayDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][now.getDay()];

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>
            Halo, {user?.studentProfile?.fullName ?? "Student"}! 👋
          </h1>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>Selamat datang kembali di dashboard kamu.</p>
        </div>
      </div>

      <Card theme={theme} className="p-6 sm:p-7 bg-gradient-to-br from-blue-600 to-blue-700 border-0">
        <div className="flex items-center justify-around text-center text-white">
          <div>
            <p className="text-2xl font-extrabold">{user?.studentProfile?.totalXp ?? 0}</p>
            <p className="text-[10px] text-blue-100 font-semibold uppercase tracking-wide">Total XP</p>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div>
            <p className="text-2xl font-extrabold">{user?.studentProfile?.currentStreak ?? 0}</p>
            <p className="text-[10px] text-blue-100 font-semibold uppercase tracking-wide">Streak</p>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div>
            <p className="text-2xl font-extrabold">{totalMeetLeft}</p>
            <p className="text-[10px] text-blue-100 font-semibold uppercase tracking-wide">Sisa Pertemuan</p>
          </div>
        </div>
      </Card>

      <div>
        <div className="mb-4 flex items-start gap-3">
          <div>
            <p className={`mt-1 text-sm ${theme.textMuted}`}>Jadwal minggu ini</p>
          </div>
        </div>

        {weekSchedules.length === 0 ? (
          <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
            <span className="text-5xl mb-4">📅</span>
            <h3 className={`font-bold ${theme.text}`}>Tidak ada jadwal minggu ini</h3>
            <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kamu tidak memiliki jadwal minggu ini</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {weekSchedules.map((schedule) => {
              const cd = countdowns[schedule.id];
              const isCountdownZero = cd && cd.days === 0 && cd.hours === 0 && cd.minutes === 0 && cd.seconds === 0;
              const isOngoing = isCountdownZero && !schedule.isDone;
              const isSoon = cd && !isCountdownZero && cd.days === 0 && cd.hours < 2;
              const showMeetLink = schedule.dayOfWeek === todayDay && schedule.meetLink;
              return (
                <Card key={schedule.id} theme={theme} className="p-5 sm:p-6">
                  <div className="flex items-start gap-4 flex-wrap">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${isOngoing ? "bg-emerald-100" : isSoon ? "bg-amber-100" : schedule.isDone ? "bg-slate-100" : cd ? "bg-blue-100" : "bg-slate-100"}`}>
                        <Calendar size={22} className={isOngoing ? "text-emerald-600" : isSoon ? "text-amber-600" : schedule.isDone ? "text-slate-400" : cd ? "text-blue-600" : "text-slate-400"} />
                      </span>
                      <div className="min-w-0">
                        <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>{selectedClass?.name}</p>
                        <h3 className={`font-bold ${theme.text}`}>
                          {DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek}, {new Date(schedule.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </h3>
                        <p className={`text-sm ${theme.textMuted}`}>{schedule.startTime}–{schedule.endTime}</p>
                        {schedule.topic && (
                          <p className={`text-xs mt-0.5 font-semibold ${isOngoing ? "text-emerald-600" : "text-blue-600"}`}>{schedule.topic}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {schedule.isDone ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-500 cursor-default">
                          <Clock size={12} /> Selesai
                        </span>
                      ) : isOngoing ? (
                        <div className="text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-700 animate-pulse">
                            Sedang Berlangsung
                          </span>
                        </div>
                      ) : cd && !isCountdownZero ? (
                        <div className="text-right">
                          <p className={`text-xs font-semibold ${theme.textMuted}`}>Mulai dalam</p>
                          <div className="flex items-center gap-1.5 mt-1">
                            {[
                              { val: cd.days, label: "Hari", warn: cd.days === 0 },
                              { val: cd.hours, label: "Jam", warn: cd.days === 0 },
                              { val: cd.minutes, label: "Menit", warn: cd.days === 0 },
                              { val: cd.seconds, label: "Detik", warn: cd.days === 0 },
                            ].map((unit) => (
                              <div key={unit.label} className={`flex flex-col items-center rounded-xl px-2.5 py-1.5 min-w-[44px] ${unit.warn ? "bg-red-100" : "bg-blue-100"}`}>
                                <span className={`text-sm font-extrabold ${unit.warn ? "text-red-700" : "text-blue-700"}`}>{String(unit.val).padStart(2, "0")}</span>
                                <span className={`text-[9px] font-semibold ${unit.warn ? "text-red-500" : "text-blue-500"}`}>{unit.label}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {showMeetLink && (
                        <a href={schedule.meetLink} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                          <Video size={16} /> Meet
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

      {!selectedClass && (
        <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-5xl mb-4">📭</span>
          <h3 className={`font-bold ${theme.text}`}>Belum ada kelas</h3>
          <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kamu belum terdaftar di kelas manapun.</p>
        </Card>
      )}

      {announcements.length > 0 && (
        <Card theme={theme} className="p-6 sm:p-7">
          <h3 className={`font-bold mb-4 ${theme.text}`}>Pengumuman</h3>
          <div className="space-y-3">
            {announcements.map((a) => (
              <div key={a.id} className={`rounded-2xl p-4 ${theme.dark ? "bg-slate-800" : "bg-amber-50"}`}>
                <p className={`text-xs font-bold ${theme.text}`}>{a.title}</p>
                <p className={`mt-0.5 text-sm ${theme.textMuted}`}>{a.content}</p>
                <p className={`mt-2 text-[10px] ${theme.textMuted}`}>
                  {a.tutor?.fullName ?? "Tutor"} — {new Date(a.createdAt).toLocaleDateString("id-ID")}
                </p>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
