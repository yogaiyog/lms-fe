"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Home, BookOpen, Clock, Moon, Sun,
  LogOut, X, Menu, FileText, User, Route,
} from "lucide-react";
import {
  api,
  clearSession,
  getStoredSession,
  type AuthUser,
  type Schedule,
  type Topic,
  type Attendance,
  type AssessmentAspect,
} from "@/lib/api";
import { useTutorDashboard } from "@/hooks/useTutorDashboard";
import Link from "next/link";
import TutorHomeSegment from "./tutor-home-segment";
import TutorClassesSegment from "./tutor-classes-segment";
import TutorStudentsSegment from "./tutor-students-segment";
import TutorAttendanceSegment from "./tutor-attendance-segment";
import TutorRoadmapSegment from "./tutor-roadmap-segment";
import TutorScheduleDetailModal from "./tutor-schedule-detail-modal";

const NAV_ITEMS = [
  { key: "home", label: "Beranda", icon: Home },
  { key: "classes", label: "Kelas", icon: BookOpen },
  { key: "roadmap", label: "Roadmap", icon: Route },
  { key: "students", label: "Siswa", icon: User },
  { key: "attendance", label: "Absensi", icon: BookOpen },
] as const;

const MOBILE_NAV = ["home", "classes", "roadmap", "students", "attendance"] as const;

export default function TutorDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<"home" | "classes" | "students" | "attendance" | "roadmap">("home");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [countdowns, setCountdowns] = useState<Record<string, { days: number; hours: number; minutes: number; seconds: number }>>({});
  const [attendanceForm, setAttendanceForm] = useState<{ scheduleId: string; studentId: string; status: string }[]>([]);
  const [submittingAttendance, setSubmittingAttendance] = useState(false);
  const [attendanceFilledIds, setAttendanceFilledIds] = useState<Set<string>>(new Set());
  const [initialized, setInitialized] = useState(false);

  const theme = {
    dark,
    bg: dark ? "bg-slate-950" : "bg-slate-50",
    card: dark ? "bg-slate-900" : "bg-white",
    border: dark ? "border-slate-800" : "border-slate-200",
    text: dark ? "text-slate-50" : "text-slate-900",
    textMuted: dark ? "text-slate-400" : "text-slate-500",
  };

  const go = useCallback((p: "home" | "classes" | "students" | "attendance" | "roadmap") => { setSegment(p); setDrawerOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  // Restore state from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as "home" | "classes" | "students" | "attendance" | "roadmap" | null;
    if (tab && ["home", "classes", "students", "attendance", "roadmap"].includes(tab)) {
      setSegment(tab);
    }
    setInitialized(true);
  }, []);

  // Sync state to URL params
  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams(window.location.search);
    if (segment !== "home") params.set("tab", segment);
    else params.delete("tab");
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [segment, initialized, router, pathname]);

  // Schedule edit
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editScheduleClassId, setEditScheduleClassId] = useState<string>("");
  const [editTopicId, setEditTopicId] = useState<string>("");
  const [editMeetLink, setEditMeetLink] = useState("");
  const [forceOngoing, setForceOngoing] = useState(false);
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState("");
  const [forceOngoingIds, setForceOngoingIds] = useState<Set<string>>(new Set());

  // Announcement
  const [announceClass, setAnnounceClass] = useState<string | null>(null);
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceContent, setAnnounceContent] = useState("");
  const [announceSaving, setAnnounceSaving] = useState(false);
  const [announceError, setAnnounceError] = useState("");

  // Schedule detail
  const [detailSchedule, setDetailSchedule] = useState<Schedule | null>(null);
  const [detailAttendances, setDetailAttendances] = useState<Attendance[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  // Assessment form
  const [assessingAttendance, setAssessingAttendance] = useState<string | null>(null);
  const [assessmentScores, setAssessmentScores] = useState<Record<string, number>>({});
  const [mentorComment, setMentorComment] = useState("");
  const [projectLink, setProjectLink] = useState("");
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [formAspects, setFormAspects] = useState<AssessmentAspect[]>([]);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) { router.replace("/login"); return; }
    (async () => {
      try {
        const me = await api.auth.me();
        setUser(me);
        if (me.role !== "TUTOR" || !me.tutorProfile) {
          router.replace("/dashboard");
          return;
        }
      } catch {
        clearSession();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  const tutorProfileId = user?.tutorProfile?.id;

  const { classes, students, isLoading: dataLoading } = useTutorDashboard(tutorProfileId);

  async function logout() {
    await api.auth.logout();
    router.push("/login");
  }

  function startEditSchedule(schedule: Schedule, classId: string) {
    setEditingSchedule(schedule);
    setEditScheduleClassId(classId);
    setEditTopicId(schedule.topicId ?? "");
    setEditMeetLink(schedule.meetLink);
    setForceOngoing(forceOngoingIds.has(schedule.id));
    setScheduleError("");
  }

  async function markScheduleDone(schedule: Schedule) {
    try {
      await api.schedules.update(schedule.id, { isDone: true });
      queryClient.invalidateQueries({ queryKey: ["tutor-schedules", tutorProfileId] });
      setDetailSchedule(null);
    } catch (e) {
      console.error("Failed to mark schedule done", e);
    }
  }

  async function openScheduleDetail(schedule: Schedule) {
    setDetailSchedule(schedule);
    setLoadingDetail(true);
    setDetailAttendances([]);
    setExpandedStudent(null);
    setAssessingAttendance(null);
    setFormAspects([]);
    try {
      const attendances = await api.attendances.listBySchedule(schedule.id);
      setDetailAttendances(attendances);
    } catch (e) {
      console.error("Failed to load attendances", e);
    } finally {
      setLoadingDetail(false);
    }
  }

  async function loadScheduleAspects(schedule: Schedule): Promise<AssessmentAspect[]> {
    const fromState = classes.find((c) => c.id === schedule.classId)?.curriculum?.assessmentSet?.aspects;
    if (fromState && fromState.length > 0) return fromState;
    try {
      const cls = await api.classes.get(schedule.classId);
      return cls?.curriculum?.assessmentSet?.aspects ?? [];
    } catch {
      return [];
    }
  }

  async function startAssessment(attendanceId: string, _schedule: Schedule) {
    const att = detailAttendances.find((a) => a.id === attendanceId);
    const aspects = await loadScheduleAspects(_schedule);
    setFormAspects(aspects);
    if (att?.assessment) {
      const scores: Record<string, number> = {};
      for (const sc of att.assessment.scores ?? []) {
        scores[sc.aspectId] = sc.score;
      }
      for (const asp of aspects) {
        if (!(asp.id in scores)) scores[asp.id] = asp.minScore;
      }
      setAssessmentScores(scores);
      setMentorComment(att.assessment.mentorComment ?? "");
      setProjectLink(att.assessment.projectLink ?? "");
    } else {
      const defaults: Record<string, number> = {};
      for (const asp of aspects) defaults[asp.id] = asp.minScore;
      setAssessmentScores(defaults);
      setMentorComment("");
      setProjectLink("");
    }
    setAssessingAttendance(attendanceId);
    setExpandedStudent(null);
  }

  async function saveAssessment(attendanceId: string) {
    const aspects = formAspects;
    if (aspects.length === 0) return;
    setSavingAssessment(true);
    try {
      const totalPossible = aspects.reduce((s, a) => s + a.maxScore, 0);
      const totalObtained = Object.entries(assessmentScores).reduce((sum, [, score]) => sum + score, 0);
      const percentage = Math.round((totalObtained / totalPossible) * 100);
      const att = detailAttendances.find((a) => a.id === attendanceId);
      if (att?.assessment) {
        const existingScores = att.assessment.scores ?? [];
        await api.attendanceAssessments.update(att.assessment.id, {
          totalScore: totalObtained, percentage, mentorComment: mentorComment || null, projectLink: projectLink || null,
        });
        await Promise.all(
          Object.entries(assessmentScores).map(([aspectId, score]) => {
            const existing = existingScores.find((s) => s.aspectId === aspectId);
            if (existing) {
              return api.attendanceAssessmentScores.update(existing.id, { score });
            }
            return api.attendanceAssessmentScores.create({ assessmentId: att.assessment!.id, aspectId, score });
          }),
        );
      } else {
        const assessment = await api.attendanceAssessments.create({
          attendanceId, totalScore: totalObtained, percentage, mentorComment: mentorComment || null, projectLink: projectLink || null,
        });
        await Promise.all(
          Object.entries(assessmentScores).map(([aspectId, score]) =>
            api.attendanceAssessmentScores.create({ assessmentId: assessment.id, aspectId, score })
          ),
        );
      }
      setAssessingAttendance(null);
      setFormAspects([]);
      const attendances = await api.attendances.listBySchedule(detailSchedule!.id);
      setDetailAttendances(attendances);
    } catch (e) {
      console.error("Failed to save assessment", e);
    } finally {
      setSavingAssessment(false);
    }
  }

  async function saveSchedule(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingSchedule) return;
    setSavingSchedule(true);
    setScheduleError("");
    try {
      const payload: Record<string, string | null> = {};
      const selectedTopicId = editTopicId || null;
      if (selectedTopicId !== (editingSchedule.topicId ?? null)) {
        payload.topicId = selectedTopicId;
        const topic = getClassTopics(editScheduleClassId).find((t) => t.id === selectedTopicId);
        payload.topic = topic ? topic.title : null;
      }
      if (editMeetLink !== editingSchedule.meetLink) payload.meetLink = editMeetLink;
      if (Object.keys(payload).length > 0) {
        await api.schedules.update(editingSchedule.id, payload);
        queryClient.invalidateQueries({ queryKey: ["tutor-schedules", tutorProfileId] });
      }
      setForceOngoingIds((prev) => {
        const next = new Set(prev);
        if (forceOngoing) next.add(editingSchedule.id);
        else next.delete(editingSchedule.id);
        return next;
      });
      setEditingSchedule(null);
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSavingSchedule(false);
    }
  }

  async function createAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!announceClass || !user?.tutorProfile) return;
    setAnnounceSaving(true);
    setAnnounceError("");
    try {
      await api.announcements.create({
        classId: announceClass, tutorId: user.tutorProfile.id, title: announceTitle, content: announceContent,
      });
      queryClient.invalidateQueries({ queryKey: ["tutor-announcements", tutorProfileId] });
      setAnnounceClass(null);
      setAnnounceTitle("");
      setAnnounceContent("");
    } catch (err) {
      setAnnounceError(err instanceof Error ? err.message : "Gagal membuat pengumuman");
    } finally {
      setAnnounceSaving(false);
    }
  }

  function getClassTopics(classId: string): Topic[] {
    return classes.find((c) => c.id === classId)?.curriculum?.topics ?? [];
  }

  function getScheduleStart(schedule: Schedule) {
    const d = new Date(schedule.date);
    const [h, m] = schedule.startTime.split(":").map(Number);
    d.setHours(h, m, 0, 0);
    return d;
  }

  useEffect(() => {
    const interval = setInterval(() => {
      const newCountdowns: Record<string, { days: number; hours: number; minutes: number; seconds: number }> = {};
      for (const cls of classes) {
        for (const s of cls.schedules) {
          if (s.isDone) continue;
          const start = getScheduleStart(s);
          const diff = start.getTime() - Date.now();
          newCountdowns[s.id] = !isFinite(diff) || diff <= 0
            ? { days: 0, hours: 0, minutes: 0, seconds: 0 }
            : {
                days: Math.floor(diff / 86400000),
                hours: Math.floor((diff % 86400000) / 3600000),
                minutes: Math.floor((diff % 3600000) / 60000),
                seconds: Math.floor((diff % 60000) / 1000),
              };
        }
      }
      setCountdowns(newCountdowns);
    }, 1000);
    return () => clearInterval(interval);
  }, [classes]);

  async function initAttendanceForm(scheduleId: string, classId: string) {
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return;
    const enrollments = cls.enrollments ?? [];
    if (enrollments.length === 0) return;
    try {
      const existingAttendances = await api.attendances.listBySchedule(scheduleId);
      const existingIds = new Set(existingAttendances.map((a) => a.studentId));
      const missing = enrollments.filter((e) => !existingIds.has(e.studentId));
      if (missing.length === 0) {
        setAttendanceFilledIds((prev) => new Set([...prev, scheduleId]));
        const schedule = cls.schedules.find((s) => s.id === scheduleId);
        if (schedule) openScheduleDetail(schedule);
        return;
      }
      setAttendanceForm(missing.map((e) => ({ scheduleId, studentId: e.studentId, status: "PRESENT" })));
    } catch {
      setAttendanceForm(enrollments.map((e) => ({ scheduleId, studentId: e.studentId, status: "PRESENT" })));
    }
  }

  function setAttendanceStatus(studentId: string, status: string) {
    setAttendanceForm((prev) => prev.map((a) => (a.studentId === studentId ? { ...a, status } : a)));
  }

  async function submitAttendanceForm() {
    setSubmittingAttendance(true);
    try {
      const scheduleIds = new Set<string>();
      const results = await Promise.allSettled(
        attendanceForm.map(async (item) => {
          const cls = classes.find((c) => c.schedules.some((s) => s.id === item.scheduleId));
          if (!cls) return;
          const schedule = cls.schedules.find((s) => s.id === item.scheduleId);
          if (!schedule) return;
          await api.attendances.create({ scheduleId: item.scheduleId, studentId: item.studentId, date: schedule.date, status: item.status, teachedBy: user?.tutorProfile?.id });
          scheduleIds.add(item.scheduleId);
        })
      );
      const rejected = results.filter((r) => r.status === "rejected");
      for (const r of rejected) {
        const err = (r as PromiseRejectedResult).reason;
        if (err?.message?.toLowerCase().includes("unique") || err?.message?.toLowerCase().includes("duplicate")) continue;
        throw err;
      }
      setAttendanceForm([]);
      setAttendanceFilledIds((prev) => new Set([...prev, ...scheduleIds]));
      for (const sid of scheduleIds) {
        const cls = classes.find((c) => c.schedules.some((s) => s.id === sid));
        if (!cls) continue;
        const schedule = cls.schedules.find((s) => s.id === sid);
        if (!schedule) continue;
        openScheduleDetail(schedule);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menyimpan absensi");
    } finally {
      setSubmittingAttendance(false);
    }
  }

  if (loading || dataLoading) {
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
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold">T</div>
            <div>
              <p className={`font-extrabold leading-tight ${theme.text}`}>{user?.tutorProfile?.fullName ?? user?.tutorProfile?.fullName}</p>
              <p className={`text-xs leading-tight ${theme.textMuted}`}>Dashboard</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = segment === item.key;
              return (
                <button key={item.key} onClick={() => go(item.key)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${active ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30" : `${theme.text} hover:bg-blue-50 hover:text-blue-700`}`}>
                  <Icon size={18} /> {item.label}
                </button>
              );
            })}
          </nav>
          <div className="space-y-1 mt-2">
            <Link href="/dashboard/tutor/jadwal-slot"
              className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}>
              <Clock size={18} /> Slot
            </Link>
            <Link href="/dashboard/tutor/kurikulum"
              className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}>
              <FileText size={18} /> Kurikulum
            </Link>
          </div>
          <div className={`mt-6 rounded-2xl p-4 ${dark ? "bg-slate-800" : "bg-blue-50"}`}>
            <p className={`text-xs font-bold ${theme.text}`}>{user?.tutorProfile?.fullName ?? user?.email}</p>
            <p className={`text-xs mt-1 ${theme.textMuted}`}>Tutor Dashboard</p>
          </div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className={`absolute left-0 top-0 bottom-0 w-72 ${theme.card} p-5`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm">T</div>
                  <p className={`font-extrabold ${theme.text}`}>{user?.tutorProfile?.fullName || "Tutor"} </p>
                </div>
                <button onClick={() => setDrawerOpen(false)} className={theme.textMuted}><X size={20} /></button>
              </div>
              <nav className="space-y-1">
                {[{ key: "home", label: "Beranda", icon: Home }, { key: "classes", label: "Kelas", icon: BookOpen }, { key: "students", label: "Siswa", icon: User }, ...[{ key: "slot", label: "Slot", icon: Clock, href: "/dashboard/tutor/jadwal-slot" as const }, { key: "kurikulum", label: "Kurikulum", icon: FileText, href: "/dashboard/tutor/kurikulum" as const }]].map((item) => {
                  const Icon = item.icon;
                  const active = segment === item.key;
                  if (item.href) {
                    return (
                      <Link key={item.key} href={item.href}
                        className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${theme.text} hover:bg-blue-50 hover:text-blue-700`}>
                        <Icon size={18} /> {item.label}
                      </Link>
                    );
                  }
                  return (
                    <button key={item.key} onClick={() => go(item.key as "home" | "classes" | "students" | "attendance" | "roadmap")}
                      className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${active ? "bg-blue-600 text-white" : `${theme.text} hover:bg-blue-50 hover:text-blue-700`}`}>
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
          <header className={`sticky top-0 z-30 flex items-center justify-between gap-3 border-b ${theme.border} ${theme.card}/90 backdrop-blur px-4 sm:px-8 py-3.5`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setDrawerOpen(true)} className={`md:hidden ${theme.text}`}>
                <Menu size={22} />
              </button>
              <p className={`font-extrabold hidden sm:block ${theme.text}`}>
                {NAV_ITEMS.find((n) => n.key === segment)?.label || "Dashboard"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button onClick={() => setDark((v) => !v)}
                className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}>
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button onClick={logout} className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-red-50 hover:text-red-600 transition-colors`} title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          </header>

          <main className="px-4 sm:px-8 py-6 pb-24 md:pb-10 max-w-6xl">
            {segment === "classes" && (
              <TutorClassesSegment
                theme={theme}
                classes={classes}
                onOpenScheduleDetail={openScheduleDetail}
                onStartEditSchedule={startEditSchedule}
                onOpenAnnounceForm={(classId) => { setAnnounceClass(classId); setAnnounceTitle(""); setAnnounceContent(""); setAnnounceError(""); }}
              />
            )}
            {segment === "students" && (
              <TutorStudentsSegment
                theme={theme}
                classes={classes}
                students={students}
              />
            )}
            {segment === "roadmap" && (
              <TutorRoadmapSegment theme={theme} />
            )}
            {segment === "attendance" && user?.tutorProfile?.id && (
              <TutorAttendanceSegment
                theme={theme}
                tutorId={user.tutorProfile.id}
              />
            )}
            {segment === "home" && (
              <TutorHomeSegment
                theme={theme}
                classes={classes}
                students={students}
                countdowns={countdowns}
                forceOngoingIds={forceOngoingIds}
                attendanceForm={attendanceForm}
                submittingAttendance={submittingAttendance}
                onInitAttendanceForm={initAttendanceForm}
                onSubmitAttendance={submitAttendanceForm}
                onSetAttendanceStatus={setAttendanceStatus}
                onCancelAttendance={() => setAttendanceForm([])}
                onEditSchedule={startEditSchedule}
                onOpenScheduleDetail={openScheduleDetail}
                tutorName={user?.tutorProfile?.fullName}
                attendanceFilledIds={attendanceFilledIds}
              />
            )}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-30 border-t ${theme.border} ${theme.card} px-2 py-2 flex items-center justify-between`}>
        {MOBILE_NAV.map((key) => {
          const item = NAV_ITEMS.find((n) => n.key === key);
          if (!item) return null;
          const Icon = item.icon;
          const active = segment === key;
          return (
            <button key={key} onClick={() => go(key)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold ${active ? "text-blue-600" : theme.textMuted}`}>
              <Icon size={19} />
              {item.label.split(" ")[0]}
            </button>
          );
        })}
        <Link href="/dashboard/tutor/jadwal-slot"
          className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold ${theme.textMuted}`}>
          <Clock size={19} /> Slot
        </Link>
        <Link href="/dashboard/tutor/kurikulum"
          className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold ${theme.textMuted}`}>
          <FileText size={19} /> Kurikulum
        </Link>
      </nav>

      {/* Modal Edit Schedule */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setEditingSchedule(null)} />
          <div className={`relative w-full max-w-md rounded-t-3xl ${theme.card} p-6 shadow-2xl sm:rounded-3xl`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-lg font-extrabold ${theme.text}`}>Edit Jadwal</h2>
              <button onClick={() => setEditingSchedule(null)} className={`rounded-xl p-1.5 ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={saveSchedule}>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Topic (dari Kurikulum)</label>
                <select value={editTopicId} onChange={(e) => { setEditTopicId(e.target.value); }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option value="">-- Pilih topic --</option>
                  {getClassTopics(editScheduleClassId).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Meet Link</label>
                <input value={editMeetLink} onChange={(e) => setEditMeetLink(e.target.value)} placeholder="https://meet.google.com/xxx"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <label className="mb-4 flex items-center gap-3 cursor-pointer">
                <div onClick={(e) => { e.preventDefault(); setForceOngoing((v) => !v); }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${forceOngoing ? "bg-emerald-500" : "bg-slate-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${forceOngoing ? "translate-x-6" : "translate-x-1"}`} />
                </div>
                <span className="text-sm font-semibold text-slate-700">Force Ongoing (aktifkan absensi)</span>
              </label>
              {scheduleError && <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{scheduleError}</div>}
              <button type="submit" disabled={savingSchedule}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {savingSchedule ? <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Menyimpan...</span> : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Announcement */}
      {announceClass && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setAnnounceClass(null)} />
          <div className={`relative w-full max-w-md rounded-t-3xl ${theme.card} p-6 shadow-2xl sm:rounded-3xl`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-lg font-extrabold ${theme.text}`}>Buat Pengumuman</h2>
              <button onClick={() => setAnnounceClass(null)} className={`rounded-xl p-1.5 ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={createAnnouncement}>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Judul</label>
                <input value={announceTitle} onChange={(e) => setAnnounceTitle(e.target.value)} placeholder="Judul pengumuman"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required />
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Isi Pengumuman</label>
                <textarea value={announceContent} onChange={(e) => setAnnounceContent(e.target.value)} placeholder="Tulis isi pengumuman..." rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required />
              </div>
              {announceError && <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{announceError}</div>}
              <button type="submit" disabled={announceSaving}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {announceSaving ? <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Mengirim...</span> : "Kirim Pengumuman"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Detail Modal */}
      {detailSchedule && (
        <TutorScheduleDetailModal
          theme={theme}
          detailSchedule={detailSchedule}
          detailAttendances={detailAttendances}
          loadingDetail={loadingDetail}
          expandedStudent={expandedStudent}
          assessingAttendance={assessingAttendance}
          formAspects={formAspects}
          assessmentScores={assessmentScores}
          mentorComment={mentorComment}
          projectLink={projectLink}
          savingAssessment={savingAssessment}
          onClose={() => setDetailSchedule(null)}
          onToggleExpand={(studentId) => setExpandedStudent((prev) => prev === studentId ? null : studentId)}
          onStartAssessment={(attendanceId) => {
            const schedule = detailSchedule;
            startAssessment(attendanceId, schedule);
          }}
          onCancelAssessment={() => setAssessingAttendance(null)}
          onScoreChange={(aspectId, value) => setAssessmentScores((prev) => ({ ...prev, [aspectId]: value }))}
          onMentorCommentChange={setMentorComment}
          onProjectLinkChange={setProjectLink}
          onSaveAssessment={saveAssessment}
          onMarkDone={markScheduleDone}
          onUpdateAttendance={async (attendanceId, status) => {
            const deletingStatuses = ["ABSENT", "PERMISSION", "SICK"];
            if (deletingStatuses.includes(status)) {
              const att = detailAttendances.find((a) => a.id === attendanceId);
              if (att?.assessment?.id) {
                const scores = att.assessment.scores ?? [];
                await Promise.all(scores.map((s) => api.attendanceAssessmentScores.delete(s.id).catch(() => {})));
                await api.attendanceAssessments.delete(att.assessment.id).catch(() => {});
              }
            }
            await api.attendances.update(attendanceId, { status });
            const attendances = await api.attendances.listBySchedule(detailSchedule!.id);
            setDetailAttendances(attendances);
          }}
        />
      )}
    </div>
  );
}
