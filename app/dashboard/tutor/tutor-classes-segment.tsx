"use client";

import { BookOpen, Calendar, Clock, User, Video, ChevronRight } from "lucide-react";
import Link from "next/link";
import type { Schedule, Topic, Announcement } from "@/lib/api";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin", TUESDAY: "Selasa", WEDNESDAY: "Rabu",
  THURSDAY: "Kamis", FRIDAY: "Jumat", SATURDAY: "Sabtu", SUNDAY: "Minggu",
};

const CATEGORY_LABELS: Record<string, string> = {
  KIDS: "Kelas 1-3 SD",
  JUNIOR_I: "Kelas 4-6 SD",
  JUNIOR_II: "Kelas 7-9 SMP",
};

type Theme = {
  dark: boolean;
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
};

type ClassWithDetails = {
  id: string;
  name: string;
  category: string;
  enrollments?: { id: string; studentId: string }[];
  schedules: Schedule[];
  announcements: Announcement[];
  curriculum?: {
    id: string;
    name: string;
    topics: Topic[];
  } | null;
};

function Card({ children, className = "", theme }: { children: React.ReactNode; className?: string; theme: Theme }) {
  return (
    <div className={`rounded-3xl border ${theme.border} ${theme.card} shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export default function TutorClassesSegment({
  theme,
  classes,
  onOpenScheduleDetail,
  onStartEditSchedule,
  onOpenAnnounceForm,
}: {
  theme: Theme;
  classes: ClassWithDetails[];
  onOpenScheduleDetail: (schedule: Schedule) => void;
  onStartEditSchedule: (schedule: Schedule, classId: string) => void;
  onOpenAnnounceForm: (classId: string) => void;
}) {
  if (classes.length === 0) {
    return (
      <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
        <span className="text-5xl mb-4">📚</span>
        <h3 className={`font-bold ${theme.text}`}>Belum ada kelas</h3>
        <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kamu belum mengajar kelas apapun</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {classes.map((cls) => (
        <Card key={cls.id} theme={theme} className="p-6 sm:p-7">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                <BookOpen size={20} className="text-blue-600" />
              </span>
              <div>
                <h3 className={`text-lg font-extrabold ${theme.text}`}>{cls.name}</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                  {CATEGORY_LABELS[cls.category] ?? cls.category}
                </span>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <User size={13} />
              {cls.enrollments?.length ?? 0} siswa
            </span>
          </div>

              <div className={`border-t ${theme.border} pt-5 mb-5`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${theme.text}`}>Pengumuman</h3>
              <button onClick={() => onOpenAnnounceForm(cls.id)}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors">
                + Pengumuman
              </button>
            </div>
            {cls.announcements.length > 0 ? (
              <div className="space-y-2">
                {cls.announcements.map((ann) => (
                  <div key={ann.id} className={`rounded-xl px-3 py-2.5 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                    <p className={`text-sm font-bold ${theme.text}`}>{ann.title}</p>
                    <p className={`mt-0.5 text-xs ${theme.textMuted}`}>{ann.content}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className={`text-sm ${theme.textMuted}`}>Belum ada pengumuman</p>
            )}
          </div>

          {cls.schedules.length > 0 && (
            <div className="mb-5">
              <p className={`mb-3 text-sm font-bold ${theme.text}`}>Jadwal:</p>
              <div className="space-y-2">
                {[...cls.schedules].sort((b, a) => b.date.localeCompare(a.date)).map((schedule) => {
                  const todayStr = new Date().toISOString().split("T")[0];
                  const isPast = !!schedule.date && schedule.date < todayStr;
                  return (
                    <div key={schedule.id} onClick={() => isPast && onOpenScheduleDetail(schedule)}
                      className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${isPast ? "opacity-50 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors" : ""} ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${isPast ? "bg-slate-200" : "bg-blue-100"}`}>
                          <Calendar size={18} className={isPast ? "text-slate-400" : "text-blue-600"} />
                        </div>
                        <div>
                          <p className={`text-sm font-semibold ${isPast ? theme.textMuted : theme.text}`}>
                            {DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek}
                          </p>
                          <p className={`text-xs ${theme.textMuted}`}>
                            {schedule.date && new Date(schedule.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                            {schedule.date ? " · " : ""}{schedule.startTime}–{schedule.endTime}
                          </p>
                          {schedule.topic && (
                            <p className={`text-xs font-semibold ${isPast ? "text-slate-400" : "text-blue-600"}`}>{schedule.topic}</p>
                          )}
                          {isPast && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-500 mt-1">
                              <Clock size={10} /> Selesai
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {schedule.meetLink && !isPast && (
                          <a href={schedule.meetLink} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition-colors">
                            <Video size={14} /> Meet
                          </a>
                        )}
                        <button
                          onClick={(e) => { e.stopPropagation(); if (!isPast) onStartEditSchedule(schedule, cls.id); }}
                          disabled={isPast}
                          className={`rounded-xl border p-2 transition-colors ${isPast ? "border-slate-200 text-slate-300 cursor-not-allowed" : "border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600"}`}>
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {cls.schedules.length === 0 && (
            <p className={`mb-5 text-sm ${theme.textMuted}`}>Belum ada jadwal untuk kelas ini</p>
          )}

      

          {cls.curriculum && (
            <div className={`border-t ${theme.border} pt-5 mt-5`}>
              <div className="flex items-center justify-between mb-3">
                {/* <h3 className={`font-bold ${theme.text}`}>Kurikulum</h3> */}
                  <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${theme.text}`}>{cls.curriculum.name}</span>
                <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  {cls.curriculum.topics.length} topik
                </span>
              </div>
                <Link href={`/dashboard/tutor/kurikulum/${cls.curriculum.id}`}
                  className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 transition-colors">
                  Lihat Kurikulum  <ChevronRight size={14} />
                </Link>
              </div>
            
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
