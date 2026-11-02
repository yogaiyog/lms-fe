"use client";

import { BookOpen, Calendar, CalendarX2, Clock, Flame, Star, Ticket, Video } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { motion } from "framer-motion";
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
  onTopicClick?: (schedule: Schedule) => void;
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" as const } },
};

export default function OverviewTab({ theme, user, totalMeetLeft, weekSchedules, countdowns, allClasses, announcements, onTopicClick }: Props) {
  const now = new Date();
  const todayDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][now.getDay()];
  const activeClassIds = new Set(allClasses.filter((c) => c.isActive !== false).map((c) => c.id));
  const activeWeekSchedules = weekSchedules.filter((s) => activeClassIds.has(s.classId));

  return (
    <motion.div className="space-y-6" variants={container} initial="hidden" animate="show">

      {/* Hero Greeting */}
      <motion.div variants={item}>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-primary-800 to-primary-950 p-6 text-white shadow-lg shadow-primary-900/20 sm:p-8">
          {/* Motif medali dari logo */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-accent-300/25 blur-2xl" aria-hidden />
          <div className="pointer-events-none absolute -bottom-16 right-24 h-40 w-40 rounded-full bg-primary-400/30 blur-3xl" aria-hidden />
          <img src="/logo.png" alt="" aria-hidden className="pointer-events-none absolute right-8 top-1/2 hidden h-28 w-auto -translate-y-1/2 rotate-12 drop-shadow-xl sm:block" />
          <div className="relative z-10 max-w-xl">
            <p className="text-sm font-medium text-primary-100">Selamat datang kembali 👋</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Halo, {user?.studentProfile?.fullName ?? "Juara"}!
            </h1>
            <p className="mt-1 text-sm text-primary-100/90">Yuk lanjutkan petualangan coding-mu hari ini.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15 backdrop-blur">
                <Star size={14} className="text-accent-300" /> {user?.studentProfile?.totalXp ?? 0} XP
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15 backdrop-blur">
                <Flame size={14} className="text-orange-300" /> {user?.studentProfile?.currentStreak ?? 0} hari beruntun
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold ring-1 ring-white/15 backdrop-blur">
                <Ticket size={14} className="text-primary-200" /> Sisa {totalMeetLeft} pertemuan
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Announcements */}
      {announcements.length > 0 && (
        <motion.div variants={item}>
          <Card theme={theme} className="p-4 sm:p-6">
            <h2 className={`font-bold text-sm sm:text-base mb-3 ${theme.text}`}>Pengumuman</h2>
            <div className="space-y-2">
              {announcements.map((a) => (
                <div key={a.id} className={`rounded-xl p-3 ${theme.dark ? "bg-slate-800" : "bg-gradient-to-r from-berry-lipstick-50 to-amber-50"}`}>
                  <h3 className={`text-xs font-bold ${theme.text}`}>{a.title}</h3>
                  <p className={`mt-0.5 text-xs sm:text-sm ${theme.textMuted}`}>{a.content}</p>
                  <p className={`mt-1.5 text-[10px] ${theme.textMuted}`}>
                    {allClasses.find((c) => c.id === a.classId)?.name ?? "Kelas"} — {a.tutor?.fullName ?? "Tutor"} — {new Date(a.createdAt).toLocaleDateString("id-ID")}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Schedule */}
      <motion.div variants={item}>
        <h2 className={`mb-3 text-base font-semibold ${theme.text}`}>Jadwal minggu ini</h2>

        {activeWeekSchedules.length === 0 ? (
          <EmptyState
            icon={CalendarX2}
            title="Tidak ada jadwal minggu ini"
            description="Jadwal kelasmu akan muncul di sini. Sambil menunggu, coba lanjutkan Roadmap belajarmu."
          />
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
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isOngoing ? "bg-tea-green-100" : isSoon ? "bg-amber-100" : schedule.isDone ? "bg-slate-100" : cd ? "bg-primary-100" : "bg-slate-100"}`}>
                        <Calendar size={18} className={isOngoing ? "text-tea-green-700" : isSoon ? "text-amber-600" : schedule.isDone ? "text-slate-400" : cd ? "text-primary-600" : "text-slate-400"} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className={`text-[10px] font-semibold uppercase tracking-wide ${theme.textMuted}`}>{allClasses.find((c) => c.id === schedule.classId)?.name ?? "Kelas"}</p>
                        <h3 className={`text-sm font-bold ${theme.text}`}>
                          {DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek}, {new Date(schedule.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </h3>
                        <p className={`text-xs ${theme.textMuted}`}>{schedule.startTime}–{schedule.endTime}</p>
                        {schedule.topic && (
                          schedule.topicId ? (
                            <button
                              type="button"
                              onClick={() => onTopicClick?.(schedule)}
                              className={`mt-0.5 text-left text-[11px] font-semibold underline-offset-2 transition hover:underline ${
                                isOngoing ? "text-tea-green-600" : "text-primary-600"
                              }`}
                            >
                              {schedule.topic}
                            </button>
                          ) : (
                            <p className={`text-[11px] mt-0.5 font-semibold ${isOngoing ? "text-tea-green-600" : "text-primary-600"}`}>{schedule.topic}</p>
                          )
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 pl-13 sm:pl-0">
                      {schedule.isDone ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500 cursor-default">
                          <Clock size={10} /> Selesai
                        </span>
                      ) : isOngoing ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-tea-green-100 px-2.5 py-1 text-[11px] font-semibold text-tea-green-700 animate-pulse">
                          Berlangsung
                        </span>
                      ) : cd && !isCountdownZero ? (
                        <div className="flex items-center gap-1.5">
                          {cd.days > 0 && (
                            <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-1 ${cd.days === 0 ? "bg-red-100" : "bg-primary-100"}`}>
                              <span className={`text-xs font-extrabold ${cd.days === 0 ? "text-red-700" : "text-primary-700"}`}>{cd.days}</span>
                              <span className={`text-[9px] ${cd.days === 0 ? "text-red-500" : "text-primary-500"}`}>h</span>
                            </div>
                          )}
                          <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-1 ${cd.days === 0 ? "bg-red-100" : "bg-primary-100"}`}>
                            <span className={`text-xs font-extrabold ${cd.days === 0 ? "text-red-700" : "text-primary-700"}`}>{String(cd.hours).padStart(2, "0")}</span>
                            <span className={`text-[9px] ${cd.days === 0 ? "text-red-500" : "text-primary-500"}`}>j</span>
                          </div>
                          <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-1 ${cd.days === 0 ? "bg-red-100" : "bg-primary-100"}`}>
                            <span className={`text-xs font-extrabold ${cd.days === 0 ? "text-red-700" : "text-primary-700"}`}>{String(cd.minutes).padStart(2, "0")}</span>
                            <span className={`text-[9px] ${cd.days === 0 ? "text-red-500" : "text-primary-500"}`}>m</span>
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
                          className="inline-flex items-center gap-1.5 rounded-xl bg-primary-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-primary-700 transition-colors">
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
      </motion.div>

      {allClasses.length === 0 && (
        <motion.div variants={item}>
          <EmptyState
            icon={BookOpen}
            title="Belum ada kelas"
            description="Kamu belum terdaftar di kelas mana pun. Minta orang tua atau admin untuk mendaftarkanmu."
          />
        </motion.div>
      )}

    </motion.div>
  );
}
