"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { Home, BookOpen, Clock, Users, Route, ClipboardCheck } from "lucide-react";
import { DashboardShell, type ShellNavSection } from "@/components/dashboard/DashboardShell";
import { useDarkMode } from "@/components/dashboard/use-dark-mode";
import { Button, Input, Modal, PageLoader, Select, Textarea } from "@/components/ui";
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
import TutorHomeSegment from "./tutor-home-segment";
import TutorClassesSegment from "./tutor-classes-segment";
import TutorStudentsSegment from "./tutor-students-segment";
import TutorAttendanceSegment from "./tutor-attendance-segment";
import TutorRoadmapSegment from "./tutor-roadmap-segment";
import TutorScheduleDetailModal from "./tutor-schedule-detail-modal";

type TutorSegmentKey = "home" | "classes" | "students" | "attendance" | "roadmap";

const NAV_ITEMS: { key: TutorSegmentKey; label: string }[] = [
  { key: "home", label: "Beranda" },
  { key: "classes", label: "Kelas" },
  { key: "roadmap", label: "Roadmap" },
  { key: "students", label: "Siswa" },
  { key: "attendance", label: "Absensi" },
];

const TUTOR_NAV: ShellNavSection[] = [
  {
    title: "Mengajar",
    items: [
      { key: "home", label: "Beranda", icon: Home },
      { key: "classes", label: "Kelas", icon: BookOpen },
      { key: "attendance", label: "Absensi", icon: ClipboardCheck },
      { key: "roadmap", label: "Roadmap", icon: Route },
      { key: "students", label: "Siswa", icon: Users },
    ],
  },
  {
    title: "Pengaturan",
    items: [{ key: "slot", label: "Slot Mengajar", icon: Clock, href: "/dashboard/tutor/jadwal-slot" }],
  },
];

const MOBILE_NAV = ["home", "classes", "attendance", "roadmap", "students"];

export default function TutorDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<"home" | "classes" | "students" | "attendance" | "roadmap">("home");
  const { dark, toggle: toggleDark } = useDarkMode();
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

  const go = useCallback((p: "home" | "classes" | "students" | "attendance" | "roadmap") => { setSegment(p); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

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
    if (segment !== "roadmap") {
      params.delete("curriculum");
      params.delete("topic");
    }
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

  const [pendingRoadmapCurriculum, setPendingRoadmapCurriculum] = useState<string | null>(null);
  const [pendingRoadmapTopic, setPendingRoadmapTopic] = useState<string | null>(null);

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

  const openRoadmapForSchedule = useCallback((schedule: Schedule) => {
    const cls = classes.find((c) => c.id === schedule.classId);
    const curriculumId = cls?.curriculum?.id;
    if (!curriculumId || !schedule.topicId) return;
    setPendingRoadmapCurriculum(curriculumId);
    setPendingRoadmapTopic(schedule.topicId);
    setSegment("roadmap");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [classes]);

  const openRoadmapForCurriculum = useCallback((curriculumId: string) => {
    setPendingRoadmapCurriculum(curriculumId);
    setPendingRoadmapTopic(null);
    setSegment("roadmap");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

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
    return <PageLoader />;
  }

  return (
    <DashboardShell
      roleLabel="Tutor"
      sections={TUTOR_NAV}
      activeKey={segment}
      onNavigate={(key) => go(key as TutorSegmentKey)}
      title={NAV_ITEMS.find((n) => n.key === segment)?.label ?? "Dashboard"}
      subtitle={segment === "home" ? `Selamat datang, ${user?.tutorProfile?.fullName ?? "Tutor"}` : undefined}
      user={{ name: user?.tutorProfile?.fullName, email: user?.email, avatarUrl: user?.tutorProfile?.avatarUrl }}
      onLogout={logout}
      dark={dark}
      onToggleDark={toggleDark}
      mobileNav={MOBILE_NAV}
      contentClassName="max-w-6xl"
    >
          <div>
            {segment === "classes" && (
              <TutorClassesSegment
                theme={theme}
                classes={classes}
                onOpenScheduleDetail={openScheduleDetail}
                onStartEditSchedule={startEditSchedule}
                onOpenAnnounceForm={(classId) => { setAnnounceClass(classId); setAnnounceTitle(""); setAnnounceContent(""); setAnnounceError(""); }}
                onOpenRoadmap={openRoadmapForCurriculum}
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
              <TutorRoadmapSegment
                theme={theme}
                initialCurriculumId={pendingRoadmapCurriculum}
                initialTopicId={pendingRoadmapTopic}
              />
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
                onTopicClick={openRoadmapForSchedule}
                tutorName={user?.tutorProfile?.fullName}
                attendanceFilledIds={attendanceFilledIds}
              />
            )}
          </div>

      {/* Modal Edit Schedule */}
      {editingSchedule && (
        <Modal open onClose={() => setEditingSchedule(null)} title="Edit Jadwal" size="md">
            <form onSubmit={saveSchedule}>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Topic (dari Kurikulum)</label>
                <Select value={editTopicId} onChange={(e) => { setEditTopicId(e.target.value); }}>
                  <option value="">-- Pilih topic --</option>
                  {getClassTopics(editScheduleClassId).map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                  ))}
                </Select>
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Meet Link</label>
                <Input value={editMeetLink} onChange={(e) => setEditMeetLink(e.target.value)} placeholder="https://meet.google.com/xxx" />
              </div>
              <label className="mb-4 flex items-center gap-3 cursor-pointer">
                <div onClick={(e) => { e.preventDefault(); setForceOngoing((v) => !v); }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${forceOngoing ? "bg-emerald-500" : "bg-slate-300"}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${forceOngoing ? "translate-x-6" : "translate-x-1"}`} />
                </div>
                <span className="text-sm font-semibold text-slate-700">Force Ongoing (aktifkan absensi)</span>
              </label>
              {scheduleError && <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{scheduleError}</div>}
              <Button type="submit" disabled={savingSchedule} className="w-full">
                {savingSchedule ? <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Menyimpan...</span> : "Simpan"}
              </Button>
            </form>
        </Modal>
      )}

      {/* Modal Create Announcement */}
      {announceClass && (
        <Modal open onClose={() => setAnnounceClass(null)} title="Buat Pengumuman" size="md">
            <form onSubmit={createAnnouncement}>
              <div className="mb-3">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Judul</label>
                <Input value={announceTitle} onChange={(e) => setAnnounceTitle(e.target.value)} placeholder="Judul pengumuman" required />
              </div>
              <div className="mb-4">
                <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Isi Pengumuman</label>
                <Textarea value={announceContent} onChange={(e) => setAnnounceContent(e.target.value)} placeholder="Tulis isi pengumuman..." rows={4} className="resize-none" required />
              </div>
              {announceError && <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{announceError}</div>}
              <Button type="submit" disabled={announceSaving} className="w-full">
                {announceSaving ? <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Mengirim...</span> : "Kirim Pengumuman"}
              </Button>
            </form>
        </Modal>
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
    </DashboardShell>
  );
}
