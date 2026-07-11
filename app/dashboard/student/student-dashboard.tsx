"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { RoadmapItem } from "@/components/roadmap";
import {
  api,
  clearSession,
  getStoredSession,
  type AuthUser,
  type Class,
  type Schedule,
  type Attendance,
  type Enrollment,
  type Announcement,
  type StudentBadge,
  type Certificate,
} from "@/lib/api";
import type { Theme, Segment } from "./_component/types";
import Sidebar from "./_component/Sidebar";
import MobileDrawer from "./_component/MobileDrawer";
import Topbar from "./_component/Topbar";
import MobileBottomNav from "./_component/MobileBottomNav";
import OverviewTab from "./_component/OverviewTab";
import ScheduleTab from "./_component/ScheduleTab";
import ReportTab from "./_component/ReportTab";
import EnrollmentTab from "./_component/EnrollmentTab";
import RoadmapTab from "./_component/RoadmapTab";
import BadgesTab from "./_component/BadgesTab";

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<Segment>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const [myClass, setMyClass] = useState<Class | null>(null);
  const [allClasses, setAllClasses] = useState<Class[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
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

  const go = (p: Segment) => { setSegment(p); setDrawerOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };

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

        const [allEnrollments, allBadges, allAttendances, allCertificates] = await Promise.all([
          api.enrollments.listByStudent(studentId),
          api.studentBadges.listByStudent(studentId),
          api.attendances.listByStudent(studentId),
          api.certificates.listByStudent(studentId),
        ]);

        setEnrollments(allEnrollments);
        setCertificates(allCertificates);

        const activeEnrollments = allEnrollments.filter((e) => e.classId);
        if (activeEnrollments.length === 0) { setLoading(false); return; }

        setTotalMeetLeft(activeEnrollments.reduce((sum, e) => sum + (e.totalMeetLeft ?? 0), 0));

        const classes = await Promise.all(
          activeEnrollments.map((e) => api.classes.get(e.classId!).catch(() => null))
        );
        const validClasses = classes.filter(Boolean) as Class[];
        const allSchedules = await Promise.all(
          activeEnrollments.map((e) => api.schedules.listByClass(e.classId!))
        );
        const allAnnouncements = await Promise.all(
          activeEnrollments.map((e) => api.announcements.listByClass(e.classId!))
        );

        setAllClasses(validClasses);
        setMyClass(validClasses[0]);
        setSelectedClassId(validClasses[0]?.id ?? "");
        setSchedules(allSchedules.flat());
        setAttendances(allAttendances);
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

  const selectedClass = useMemo(() => allClasses.find((c) => c.id === selectedClassId) ?? myClass, [allClasses, selectedClassId, myClass]);
  const filteredSchedules = useMemo(
    () => (selectedClassId ? schedules.filter((s) => s.classId === selectedClassId) : schedules),
    [schedules, selectedClassId]
  );

  const topicColors = ["#22c55e", "#6366f1", "#0ea5e9", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316"];

  const sortedTopics = [...(selectedClass?.curriculum?.topics ?? [])].sort((a, b) => a.order - b.order);
  const firstIncompleteIndex = sortedTopics.findIndex((topic) => {
    const topicSchedules = filteredSchedules.filter((s) => s.topicId === topic.id);
    const completed = topicSchedules.length > 0 && topicSchedules.every((s) => s.isDone);
    const prevCompleted = (() => {
      const idx = sortedTopics.indexOf(topic);
      if (idx === 0) return true;
      const prev = sortedTopics[idx - 1];
      return filteredSchedules.filter((s) => s.topicId === prev.id).every((s) => s.isDone);
    })();
    return !completed && prevCompleted;
  });

  const roadmapItems: RoadmapItem[] = sortedTopics.map((topic, index) => {
    const topicSchedules = filteredSchedules.filter((s) => s.topicId === topic.id);
    const completed = topicSchedules.length > 0 && topicSchedules.every((s) => s.isDone);
    const prevCompleted = index === 0 ? true : (() => {
      const prev = sortedTopics[index - 1];
      return filteredSchedules.filter((s) => s.topicId === prev.id).every((s) => s.isDone);
    })();
    const locked = !prevCompleted && index > 0;
    const current = index === firstIncompleteIndex;
    return {
        id: topic.id,
        title: topic.title,
        description: topic.goals ?? undefined,
        imageUrl: topic.imageUrl ?? null,
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
        <Sidebar theme={theme} segment={segment} onNavigate={go} user={user} />

        <MobileDrawer theme={theme} open={drawerOpen} segment={segment} onNavigate={go} onClose={() => setDrawerOpen(false)} user={user} />

        <div className="flex-1 md:ml-64 min-w-0">
          <Topbar theme={theme} segment={segment} onToggleDark={() => setDark((v) => !v)} onLogout={logout} onMenuClick={() => setDrawerOpen(true)} />

          <main className="px-4 sm:px-8 py-6 pb-24 md:pb-10 max-w-6xl">
            {segment === "overview" && (
              <OverviewTab
                theme={theme}
                user={user}
                totalMeetLeft={totalMeetLeft}
                weekSchedules={weekSchedules}
                countdowns={countdowns}
                allClasses={allClasses}
                announcements={announcements}
              />
            )}

            {segment === "schedule" && (
              <ScheduleTab theme={theme} schedules={schedules} classes={allClasses} attendances={attendances} />
            )}
            {segment === "reports" && (
              <ReportTab theme={theme} studentId={user?.studentProfile?.id} />
            )}
            {segment === "enrollment" && (
              <EnrollmentTab theme={theme} classes={allClasses} enrollments={enrollments} schedules={schedules} studentId={user?.studentProfile?.id} totalMeetLeft={totalMeetLeft} />
            )}

            {segment === "roadmap" && (
              <RoadmapTab
                theme={theme}
                selectedClass={selectedClass}
                roadmapItems={roadmapItems}
                roadmapSchedules={filteredSchedules}
                allClasses={allClasses}
                selectedClassId={selectedClassId}
                onSelectClass={setSelectedClassId}
                onGoSchedule={() => go("schedule")}
              />
            )}

            {segment === "badges" && (
              <BadgesTab theme={theme} studentBadges={studentBadges} certificates={certificates} enrollments={enrollments} />
            )}
          </main>
        </div>
      </div>

      <MobileBottomNav theme={theme} segment={segment} onNavigate={go} />
    </div>
  );
}
