"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import type { RoadmapItem } from "@/components/roadmap";
import {
  api,
  getStoredSession,
  type AuthUser,
  type Class,
} from "@/lib/api";
import { useStudentDashboard } from "@/hooks/useStudentDashboard";
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
import LearningPathView from "./_component/LearningPathView";
import BadgesTab from "./_component/BadgesTab";

export default function StudentDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<Segment>("overview");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const [myClass, setMyClass] = useState<Class | null>(null);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [countdowns, setCountdowns] = useState<Record<string, { days: number; hours: number; minutes: number; seconds: number }>>({});
  const [initialized, setInitialized] = useState(false);

  const theme: Theme = {
    dark,
    bg: dark ? "bg-slate-950" : "bg-slate-50",
    card: dark ? "bg-slate-900" : "bg-white",
    border: dark ? "border-slate-800" : "border-slate-200",
    text: dark ? "text-slate-50" : "text-slate-900",
    textMuted: dark ? "text-slate-400" : "text-slate-500",
  };

  const go = useCallback((p: Segment) => { setSegment(p); setDrawerOpen(false); setSelectedTopicId(null); window.scrollTo({ top: 0, behavior: "smooth" }); }, []);

  // Restore state from URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab") as Segment | null;
    const topic = params.get("topic");
    const cls = params.get("class");
    if (tab && ["overview", "schedule", "reports", "enrollment", "roadmap", "badges"].includes(tab)) {
      setSegment(tab);
    }
    if (topic) setSelectedTopicId(topic);
    if (cls) setSelectedClassId(cls);
    setInitialized(true);
  }, []);

  // Sync state to URL params
  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams();
    if (segment !== "overview") params.set("tab", segment);
    if (selectedTopicId) params.set("topic", selectedTopicId);
    if (selectedClassId) params.set("class", selectedClassId);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [segment, selectedTopicId, selectedClassId, initialized, router, pathname]);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) { router.replace("/login"); return; }
    if (session.user.role !== "STUDENT") {
      if (session.user.role === "TUTOR") { router.replace("/dashboard/tutor"); return; }
      if (session.user.role === "ADMIN") { router.replace("/dashboard/admin"); return; }
      router.replace("/dashboard"); return;
    }
    setUser(session.user);
    setLoading(false);
  }, [router]);

  const studentId = user?.studentProfile?.id;

  const {
    enrollments,
    studentBadges,
    attendances,
    certificates,
    allClasses,
    schedules,
    announcements,
    savedReports,
    galleries,
    totalMeetLeft,
    isLoading: dataLoading,
  } = useStudentDashboard(studentId);

  useEffect(() => {
    if (allClasses.length > 0 && !myClass) {
      setMyClass(allClasses[0]);
      setSelectedClassId(allClasses[0]?.id ?? "");
    }
  }, [allClasses, myClass]);

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
        <Sidebar theme={theme} segment={segment} onNavigate={go} user={user} />

        <MobileDrawer theme={theme} open={drawerOpen} segment={segment} onNavigate={go} onClose={() => setDrawerOpen(false)} user={user} />

        <div className="flex-1 md:ml-64 min-w-0">
          <Topbar theme={theme} segment={segment} onToggleDark={() => setDark((v) => !v)} onLogout={logout} onMenuClick={() => setDrawerOpen(true)} />

          <main className="px-4 sm:px-8 py-1 pb-24 md:pb-10 ">
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
              <ReportTab theme={theme} studentId={user?.studentProfile?.id} savedReports={savedReports} galleries={galleries} />
            )}
            {segment === "enrollment" && (
              <EnrollmentTab theme={theme} classes={allClasses} enrollments={enrollments} schedules={schedules} studentId={user?.studentProfile?.id} totalMeetLeft={totalMeetLeft} />
            )}

            {segment === "roadmap" && (
              <div className="relative overflow-hidden rounded-2xl -mx-4 sm:-mx-8">
                <div
                  className="pointer-events-none absolute inset-0 bg-repeat opacity-15"
                  style={{ backgroundImage: "url(/seamless.jpg)" }}
                />
                <div className="relative z-10 px-4 sm:px-8">
                  {!selectedTopicId ? (
                    <RoadmapTab
                      theme={theme}
                      selectedClass={selectedClass}
                      roadmapItems={roadmapItems}
                      roadmapSchedules={filteredSchedules}
                      allClasses={allClasses}
                      selectedClassId={selectedClassId}
                      onSelectClass={setSelectedClassId}
                      onTopicSelect={(topicId) => {
                        setSelectedTopicId(topicId);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  ) : studentId ? (
                    <LearningPathView
                      theme={theme}
                      studentId={studentId}
                      selectedTopicId={selectedTopicId}
                      onBack={() => setSelectedTopicId(null)}
                    />
                  ) : null}
                </div>
              </div>
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
