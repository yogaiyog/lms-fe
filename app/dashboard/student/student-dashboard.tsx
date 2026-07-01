"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  clearSession,
  getStoredSession,
  type AuthUser,
  type Class,
  type Schedule,
  type Attendance,
  type Announcement,
  type StudentBadge,
  type Enrollment,
} from "@/lib/api";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
  SUNDAY: "Minggu",
};

const STATUS_LABELS: Record<string, string> = {
  PRESENT: "Hadir",
  ABSENT: "Tidak Hadir",
  LATE: "Terlambat",
  SICK: "Sakit",
  PERMISSION: "Izin",
};

const STATUS_COLORS: Record<string, string> = {
  PRESENT: "bg-tea-green-100 text-tea-green-700",
  ABSENT: "bg-berry-lipstick-100 text-berry-lipstick-700",
  LATE: "bg-amber-100 text-amber-700",
  SICK: "bg-frosted-blue-100 text-frosted-blue-700",
  PERMISSION: "bg-gray-100 text-gray-600",
};

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<"overview" | "schedule" | "badges">("overview");

  const [myClass, setMyClass] = useState<Class | null>(null);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [studentBadges, setStudentBadges] = useState<StudentBadge[]>([]);
  const [totalMeetLeft, setTotalMeetLeft] = useState(0);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) { router.replace("/login"); return; }
    if (session.user.role !== "STUDENT") {
      if (session.user.role === "TUTOR") { router.replace("/dashboard/tutor"); return; }
      if (session.user.role === "ADMIN") { router.replace("/dashboard/admin"); return; }
      router.replace("/dashboard"); return;
    }
    setUser(session.user);
    loadData(session.user);
  }, [router]);

  async function loadData(u: AuthUser) {
    try {
      if (!u.studentProfile) { return; }
      const studentId = u.studentProfile.id;

      const [allEnrollments, allAttendances, allBadges] = await Promise.all([
        api.enrollments.listByStudent(studentId),
        api.attendances.listByStudent(studentId),
        api.studentBadges.listByStudent(studentId),
      ]);

      const enrollment = allEnrollments[0];
      if (!enrollment) { setLoading(false); return; }

      setTotalMeetLeft(enrollment.totalMeetLeft ?? 0);

      const [cls, schs, anns] = await Promise.all([
        api.classes.get(enrollment.classId).catch(() => null),
        api.schedules.listByClass(enrollment.classId),
        api.announcements.listByClass(enrollment.classId),
      ]);

      setMyClass(cls);
      setSchedules(schs);
      setAttendances(allAttendances);
      setAnnouncements(anns);
      setStudentBadges(allBadges);
    } catch {
      clearSession();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await api.auth.logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)" }}>
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  const now = new Date();
  const todayDay = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"][now.getDay()];
  const todaySchedule = schedules.find((s) => s.dayOfWeek === todayDay);
  const nextSchedules = schedules
    .filter((s) => {
      const dayOrder = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
      return dayOrder.indexOf(s.dayOfWeek) >= dayOrder.indexOf(todayDay);
    })
    .slice(0, 3);

  const recentAttendances = attendances.slice(-5).reverse();
  const presentCount = attendances.filter((a) => a.status === "PRESENT").length;

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)" }}>
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
              {user?.studentProfile?.fullName?.charAt(0) ?? "S"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">
                {user?.studentProfile?.fullName ?? "Student"}
              </h1>
              <p className="text-xs text-white/70">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="rounded-lg p-2 text-white/80 transition hover:bg-white/10">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>

        {/* XP & Streak Card */}
        <div className="mb-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
          <div className="flex items-center justify-around text-center text-white">
            <div>
              <p className="text-2xl font-bold">{user?.studentProfile?.totalXp ?? 0}</p>
              <p className="text-[10px] text-white/70">Total XP</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold">{user?.studentProfile?.currentStreak ?? 0}</p>
              <p className="text-[10px] text-white/70">Streak Hari</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold">{totalMeetLeft}</p>
              <p className="text-[10px] text-white/70">Sisa Pertemuan</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <div className="rounded-2xl bg-white p-2 shadow-md">
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {(["overview", "schedule", "badges"] as const).map((seg) => (
              <button key={seg} onClick={() => setSegment(seg)}
                className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  segment === seg ? "bg-white text-dark-amethyst-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {seg === "overview" ? "Ringkasan" : seg === "schedule" ? "Jadwal" : "Badges"}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {segment === "overview" && (
          <div className="mt-4 space-y-4">
            {/* Today's class */}
            {todaySchedule && (
              <div className="rounded-2xl bg-gradient-to-r from-tea-green-400 to-tea-green-500 p-4 shadow-md">
                <p className="mb-1 text-xs font-semibold uppercase text-white/80">Kelas Hari Ini</p>
                <p className="text-lg font-bold text-white">{myClass?.name}</p>
                <p className="text-sm text-white/90">
                  {todaySchedule.startTime}–{todaySchedule.endTime}
                  {todaySchedule.meetLink && (
                    <a href={todaySchedule.meetLink} target="_blank" rel="noopener noreferrer"
                      className="ml-2 rounded-lg bg-white/20 px-2 py-0.5 text-xs font-semibold hover:bg-white/30">
                      Buka Meeting
                    </a>
                  )}
                </p>
                {todaySchedule.topic && <p className="mt-1 text-xs text-white/70">Topik: {todaySchedule.topic}</p>}
              </div>
            )}

            {/* No class / no enrollment */}
            {!myClass && (
              <div className="rounded-2xl bg-white p-6 text-center shadow-md">
                <p className="text-gray-500">Kamu belum terdaftar di kelas manapun.</p>
              </div>
            )}

            {/* My Class Card */}
            {myClass && (
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <h3 className="mb-2 font-bold text-gray-800">{myClass.name}</h3>
                <div className="space-y-1 text-sm text-gray-600">
                  <p>Tutor: {myClass.tutor?.fullName ?? "-"}</p>
                  <p>Jadwal tersisa: {schedules.length} jadwal</p>
                  {myClass.schedules?.slice(0, 3).map((s) => (
                    <p key={s.id} className="text-xs text-gray-500">
                      {DAY_LABELS[s.dayOfWeek]} {s.startTime}–{s.endTime}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Attendances */}
            {recentAttendances.length > 0 && (
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <h3 className="mb-3 font-bold text-gray-800">Riwayat Kehadiran</h3>
                <div className="space-y-2">
                  {recentAttendances.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                      <div>
                        <p className="text-xs text-gray-500">
                          {new Date(a.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                        </p>
                        {a.notes && <p className="text-[10px] text-gray-400">{a.notes}</p>}
                      </div>
                      <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[a.status] ?? "bg-gray-100 text-gray-500"}`}>
                        {STATUS_LABELS[a.status] ?? a.status}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="mt-2 text-center text-xs text-gray-400">
                  Kehadiran: {presentCount}/{attendances.length} ({attendances.length ? Math.round((presentCount / attendances.length) * 100) : 0}%)
                </p>
              </div>
            )}

            {/* Announcements */}
            {announcements.length > 0 && (
              <div className="rounded-2xl bg-white p-4 shadow-md">
                <h3 className="mb-3 font-bold text-gray-800">Pengumuman</h3>
                <div className="space-y-2">
                  {announcements.map((a) => (
                    <div key={a.id} className="rounded-lg bg-amber-50 px-3 py-2">
                      <p className="text-xs font-semibold text-amber-800">{a.title}</p>
                      <p className="mt-0.5 text-xs text-amber-700">{a.content}</p>
                      <p className="mt-1 text-[10px] text-amber-500">
                        {a.tutor?.fullName ?? "Tutor"} — {new Date(a.createdAt).toLocaleDateString("id-ID")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {segment === "schedule" && (
          <div className="mt-4 space-y-3">
            {schedules.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center shadow-md">
                <p className="text-gray-500">Belum ada jadwal</p>
              </div>
            ) : (
              schedules.map((s) => (
                <div key={s.id} className="rounded-2xl bg-white p-4 shadow-md">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-gray-800">{DAY_LABELS[s.dayOfWeek]}</p>
                      <p className="text-sm text-gray-600">{s.startTime}–{s.endTime}</p>
                      {s.topic && <p className="mt-1 text-xs text-gray-500">Topik: {s.topic}</p>}
                    </div>
                    {s.meetLink && (
                      <a href={s.meetLink} target="_blank" rel="noopener noreferrer"
                        className="rounded-lg bg-dark-amethyst-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-dark-amethyst-600">
                        Buka Meeting
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Badges Tab */}
        {segment === "badges" && (
          <div className="mt-4">
            {studentBadges.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center shadow-md">
                <p className="text-gray-500">Belum ada badge. Ikuti kelas dan raih badge!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {studentBadges.map((sb) => (
                  <div key={sb.id} className="rounded-2xl bg-white p-4 text-center shadow-md">
                    <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
                      🏆
                    </div>
                    <p className="text-sm font-bold text-gray-800">{sb.badge.title}</p>
                    <p className="mt-0.5 text-[10px] text-gray-500">{sb.badge.description}</p>
                    <p className="mt-1 text-[10px] text-gray-400">
                      +{sb.badge.xpBonus} XP
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
