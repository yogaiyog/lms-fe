"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Home, Calendar, Award, Bell, Moon, Sun,
  Clock, X, Menu, Star, Video, LogOut, Route,
  MessageSquareQuote
} from "lucide-react";
import { Roadmap } from "@/components/roadmap";
import type { RoadmapItem } from "@/components/roadmap";
import {
  api,
  clearSession,
  getStoredSession,
  type AuthUser,
  type Class,
  type Schedule,
  type Announcement,
  type StudentBadge,
} from "@/lib/api";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin", TUESDAY: "Selasa", WEDNESDAY: "Rabu",
  THURSDAY: "Kamis", FRIDAY: "Jumat", SATURDAY: "Sabtu", SUNDAY: "Minggu",
};

interface Theme { dark: boolean; bg: string; card: string; border: string; text: string; textMuted: string; }

function Card({ children, className = "", theme, onClick }: { children: React.ReactNode; className?: string; theme: Theme; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl border ${theme.border} ${theme.card} shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

const NAV_ITEMS = [
  { key: "overview", label: "Ringkasan", icon: Home },
  { key: "schedule", label: "Jadwal", icon: Calendar },
  { key: "roadmap", label: "Roadmap", icon: Route },
  { key: "badges", label: "Badges", icon: Award },
] as const;

const MOBILE_NAV = ["overview", "schedule", "roadmap", "badges"] as const;

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<"overview" | "schedule" | "badges" | "roadmap">("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const [myClass, setMyClass] = useState<Class | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([]);
  const [totalMeetLeft, setTotalMeetLeft] = useState(0);
  const [countdowns, setCountdowns] = useState<Record<string, { days: number; hours: number; minutes: number; seconds: number }>>({});

  const theme: Theme = {
    dark,
    bg: dark ? "bg-slate-950" : "bg-slate-50",
    card: dark ? "bg-slate-900" : "bg-white",
    border: dark ? "border-slate-800" : "border-slate-200",
    text: dark ? "text-slate-50" : "text-slate-900",
    textMuted: dark ? "text-slate-400" : "text-slate-500",
  };

  const go = (p: "overview" | "schedule" | "badges" | "roadmap") => { setSegment(p); setDrawerOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

  useEffect(() => {
    const session = getStoredSession();
    if (!session) { router.replace("/login"); return; }
    if (session.user.role !== "STUDENT") {
      if (session.user.role === "TUTOR") { router.replace("/dashboard/tutor"); return; }
      if (session.user.role === "ADMIN") { router.replace("/dashboard/admin"); return; }
      router.replace("/dashboard"); return;
    }
    (async () => {
      try {
        setUser(session.user);
        if (!session.user.studentProfile) { return; }
        const studentId = session.user.studentProfile.id;

        const [allEnrollments, allBadges] = await Promise.all([
          api.enrollments.listByStudent(studentId),
          api.studentBadges.listByStudent(studentId),
        ]);

        const activeEnrollments = allEnrollments.filter((e) => e.classId);
        if (activeEnrollments.length === 0) { setLoading(false); return; }

        setTotalMeetLeft(activeEnrollments.reduce((sum, e) => sum + (e.totalMeetLeft ?? 0), 0));

        const classes = await Promise.all(
          activeEnrollments.map((e) => api.classes.get(e.classId!).catch(() => null))
        );
        const allSchedules = await Promise.all(
          activeEnrollments.map((e) => api.schedules.listByClass(e.classId!))
        );
        const allAnnouncements = await Promise.all(
          activeEnrollments.map((e) => api.announcements.listByClass(e.classId!))
        );

        setMyClass(classes[0]);
        setSchedules(allSchedules.flat());
        setAnnouncements(allAnnouncements.flat());
        setStudentBadges(allBadges);
      } catch {
        clearSession();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const cds: Record<string, { days: number; hours: number; minutes: number; seconds: number }> = {};
      for (const s of schedules) {
        if (s.isDone) continue;
        const start = new Date(`${s.date.split("T")[0]}T${s.startTime}:00`);
        const diff = start.getTime() - now.getTime();
        if (diff > 0) {
          cds[s.id] = {
            days: Math.floor(diff / 86400000),
            hours: Math.floor((diff % 86400000) / 3600000),
            minutes: Math.floor((diff % 3600000) / 60000),
            seconds: Math.floor((diff % 60000) / 1000),
          };
        }
      }
      setCountdowns(cds);
    }, 1000);
    return () => clearInterval(timer);
  }, [schedules]);

  async function logout() {
    await api.auth.logout();
    router.push("/login");
  }

  const now = new Date();
  const todayDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][now.getDay()];
  function getWeekRange() {
    const now = new Date();
    const day = now.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diff);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { monday, sunday };
  }

  function getThisWeekSchedules() {
    const { monday, sunday } = getWeekRange();
    return schedules.filter((s) => {
      const d = new Date(s.date);
      return d >= monday && d <= sunday;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));
  }

  const weekSchedules = getThisWeekSchedules();

  const topicColors = ["#22c55e", "#6366f1", "#0ea5e9", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316"];
  const topicIcons = [<span>🌱</span>, <span>🧩</span>, <span>⚡</span>, <span>⚛️</span>, <span>🎛️</span>, <span>🏆</span>, <span>💡</span>, <span>📚</span>];

  let foundCurrent = false;
  const roadmapItems: RoadmapItem[] = [...(myClass?.curriculum?.topics ?? [])]
    .sort((a, b) => a.order - b.order)
    .map((topic, index, arr) => {
      const topicSchedules = schedules.filter((s) => s.topicId === topic.id);
      const completed = topicSchedules.length > 0 && topicSchedules.every((s) => s.isDone);
      const prevCompleted = index === 0 ? true : (() => {
        const prev = arr[index - 1];
        return schedules.filter((s) => s.topicId === prev.id).every((s) => s.isDone);
      })();
      const locked = !prevCompleted && index > 0;
      const current = !foundCurrent && !completed && !locked;
      if (current) foundCurrent = true;
      return {
        id: topic.id,
        title: topic.title,
        description: topic.goals ?? undefined,
        icon: topicIcons[index % topicIcons.length],
        color: topicColors[index % topicColors.length],
        completed,
        locked,
        current,
        lessons: topicSchedules.length,
        duration: undefined,
      };
    });

  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center ${theme.bg}`}>
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full ${theme.bg} font-sans`}>
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className={`hidden md:flex md:w-64 md:flex-col fixed inset-y-0 left-0 border-r ${theme.border} ${theme.card} px-4 py-6`}>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold">
              {user?.studentProfile?.fullName?.charAt(0) ?? "S"}
            </div>
            <div>
              <p className={`font-extrabold leading-tight ${theme.text}`}>Student</p>
              <p className={`text-xs leading-tight ${theme.textMuted}`}>Dashboard</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = segment === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => go(item.key)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30" : `${theme.text} hover:bg-blue-50 hover:text-blue-700`
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className={`mt-6 rounded-2xl p-4 ${dark ? "bg-slate-800" : "bg-blue-50"}`}>
            <p className={`text-xs font-bold ${theme.text}`}>Butuh bantuan?</p>
            <p className={`text-xs mt-1 ${theme.textMuted}`}>Hubungi tutor kamu jika ada pertanyaan.</p>
          </div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className={`absolute left-0 top-0 bottom-0 w-72 ${theme.card} p-5`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm">
                    {user?.studentProfile?.fullName?.charAt(0) ?? "S"}
                  </div>
                  <p className={`font-extrabold ${theme.text}`}>Student</p>
                </div>
                <button onClick={() => setDrawerOpen(false)} className={theme.textMuted}><X size={20} /></button>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = segment === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => go(item.key)}
                      className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                        active ? "bg-blue-600 text-white" : `${theme.text} hover:bg-blue-50 hover:text-blue-700`
                      }`}
                    >
                      <Icon size={18} /> {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="flex-1 md:ml-64 min-w-0">
          {/* Topbar */}
          <header className={`sticky top-0 z-30 flex items-center justify-between gap-3 border-b ${theme.border} ${theme.card}/90 backdrop-blur px-4 sm:px-8 py-3.5`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setDrawerOpen(true)} className={`md:hidden ${theme.text}`}>
                <Menu size={22} />
              </button>
              <p className={`font-extrabold hidden sm:block ${theme.text}`}>
                {NAV_ITEMS.find((n) => n.key === segment)?.label || "Ringkasan"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setDark((v) => !v)}
                className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className={`relative flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}>
                <Bell size={18} />
              </button>
              <button onClick={logout} className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-red-50 hover:text-red-600 transition-colors`} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="px-4 sm:px-8 py-6 pb-24 md:pb-10 max-w-6xl">
            {/* Overview Tab */}
            {segment === "overview" && (
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
                      <p className={`mt-1 text-sm ${theme.textMuted}`}>
                        Jadwal minggu ini :{" "}
                        <span className={`font-bold ${theme.text}`}>
                          {getWeekRange().monday.toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                          {" – "}
                          {getWeekRange().sunday.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </span>
                      </p>
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
                                  <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>{myClass?.name}</p>
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
                                      <div className={`flex flex-col items-center rounded-xl px-2.5 py-1.5 min-w-[44px] ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                                        <span className={`text-sm font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{cd.days}</span>
                                        <span className={`text-[9px] font-semibold ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>Hari</span>
                                      </div>
                                      <div className={`flex flex-col items-center rounded-xl px-2.5 py-1.5 min-w-[44px] ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                                        <span className={`text-sm font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{String(cd.hours).padStart(2, "0")}</span>
                                        <span className={`text-[9px] font-semibold ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>Jam</span>
                                      </div>
                                      <div className={`flex flex-col items-center rounded-xl px-2.5 py-1.5 min-w-[44px] ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                                        <span className={`text-sm font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{String(cd.minutes).padStart(2, "0")}</span>
                                        <span className={`text-[9px] font-semibold ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>Menit</span>
                                      </div>
                                      <div className={`flex flex-col items-center rounded-xl px-2.5 py-1.5 min-w-[44px] ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                                        <span className={`text-sm font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{String(cd.seconds).padStart(2, "0")}</span>
                                        <span className={`text-[9px] font-semibold ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>Detik</span>
                                      </div>
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

                {!myClass && (
                  <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
                    <span className="text-5xl mb-4">📭</span>
                    <h3 className={`font-bold ${theme.text}`}>Belum ada kelas</h3>
                    <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kamu belum terdaftar di kelas manapun.</p>
                  </Card>
                )}

                {announcements.length > 0 && (
                  <Card theme={theme} className="p-6 sm:p-7">
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquareQuote size={18} className="text-blue-600" />
                      <h3 className={`font-bold ${theme.text}`}>Pengumuman</h3>
                    </div>
                    <div className="space-y-3">
                      {announcements.map((a) => (
                        <div key={a.id} className={`rounded-2xl p-4 ${dark ? "bg-slate-800" : "bg-amber-50"}`}>
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
            )}

            {/* Schedule Tab */}
            {segment === "schedule" && (
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
                  <div className="space-y-4">
                    {schedules.map((s) => (
                      <Card key={s.id} theme={theme} className="p-5 sm:p-6">
                        <div className="flex items-start justify-between flex-wrap gap-3">
                          <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                              <Calendar size={20} className="text-blue-600" />
                            </span>
                            <div>
                              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>{DAY_LABELS[s.dayOfWeek]}</p>
                              <h3 className={`font-bold ${theme.text}`}>{s.startTime}–{s.endTime}</h3>
                              {s.topic && <p className={`text-sm mt-0.5 ${theme.textMuted}`}>Topik: {s.topic}</p>}
                            </div>
                          </div>
                          {s.meetLink && (
                            <a href={s.meetLink} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                              <Video size={16} /> Buka Meeting
                            </a>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Roadmap Tab */}
            {segment === "roadmap" && (
              <div>
                <div className="mb-6 flex items-start gap-3">
                  <div>
                    <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>Roadmap</h1>
                    <p className={`mt-1 text-sm ${theme.textMuted}`}>Perjalanan belajar kamu.</p>
                  </div>
                </div>
                {!myClass?.curriculum ? (
                  <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
                    <span className="text-5xl mb-4">🗺️</span>
                    <h3 className={`font-bold ${theme.text}`}>Belum ada roadmap</h3>
                    <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kelas kamu belum memiliki kurikulum.</p>
                  </Card>
                ) : roadmapItems.length === 0 ? (
                  <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
                    <span className="text-5xl mb-4">📭</span>
                    <h3 className={`font-bold ${theme.text}`}>Kurikulum kosong</h3>
                  </Card>
                ) : (
                  <Roadmap
                    items={roadmapItems}
                    animated
                    onStepSelect={(item) => {
                      const schedule = schedules.find((s) => s.topicId === item.id);
                      if (schedule) go("schedule");
                    }}
                  />
                )}
              </div>
            )}

            {/* Badges Tab */}
            {segment === "badges" && (
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
                        <p className={`mt-2 text-xs font-semibold text-blue-600`}>
                          +{sb.badge.xpBonus} XP
                        </p>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-30 border-t ${theme.border} ${theme.card} px-2 py-2 flex items-center justify-between`}>
        {MOBILE_NAV.map((key) => {
          const item = NAV_ITEMS.find((n) => n.key === key);
          const active = segment === key;
          return (
            <button
              key={key}
              onClick={() => go(key)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold ${
                active ? "text-blue-600" : theme.textMuted
              }`}
            >
              {item && <item.icon size={19} />}
              {item?.label.split(" ")[0]}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
