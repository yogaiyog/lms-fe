"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  clearSession,
  getStoredSession,
  type AuthUser,
  type StudentProfile,
  type Enrollment,
  type Schedule,
  type Attendance,
} from "@/lib/api";

type StudentWithDetails = StudentProfile & {
  enrollments: Enrollment[];
  schedules: Schedule[];
  attendances: Attendance[];
};

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
  SUNDAY: "Minggu",
};

const CATEGORY_LABELS: Record<string, string> = {
  JUNIOR_I: "Kelas 1-3 SD",
  JUNIOR_II: "Kelas 4-6 SD",
  JUNIOR_III: "Kelas 7-9 SMP",
};

export default function DashboardContent() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [segment, setSegment] = useState<"children" | "schedule">("children");

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    phone: "",
    nickname: "",
    birthDate: "",
    category: "JUNIOR_I" as "JUNIOR_I" | "JUNIOR_II" | "JUNIOR_III",
  });

  async function loadData() {
    try {
      const me = await api.auth.me();
      setUser(me);

      const studentList = await api.studentProfiles.list();
      const studentsWithDetails = await Promise.all(
        studentList.map(async (student) => {
          const [enrollments, attendances] = await Promise.all([
            api.enrollments.listByStudent(student.id),
            api.attendances.listByStudent(student.id),
          ]);

          const schedules: Schedule[] = [];
          for (const enrollment of enrollments) {
            if (!enrollment.classId) continue;
            const classSchedules = await api.schedules.listByClass(enrollment.classId);
            schedules.push(...classSchedules);
          }

          return { ...student, enrollments, schedules, attendances };
        })
      );

      setStudents(studentsWithDetails);
    } catch {
      clearSession();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.user.role === "TUTOR") {
      router.replace("/dashboard/tutor");
      return;
    }
    if (session.user.role === "ADMIN") {
      router.replace("/dashboard/admin");
      return;
    }
    if (session.user.role === "STUDENT") {
      router.replace("/dashboard/student");
      return;
    }
    loadData();
  }, [router]);

  async function onAddStudent(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const parentId = user?.parentProfile?.id;
      if (!parentId) throw new Error("Parent profile tidak ditemukan");

      await api.studentProfiles.create({
        parentId,
        email: form.email,
        password: form.password,
        fullName: form.fullName,
        phone: form.phone,
        nickname: form.nickname,
        birthDate: new Date(form.birthDate).toISOString(),
        category: form.category,
      });

      setShowAddStudent(false);
      setForm({ email: "", password: "", fullName: "", phone: "", nickname: "", birthDate: "", category: "JUNIOR_I" });
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah anak");
    } finally {
      setSaving(false);
    }
  }

  async function logout() {
    await api.auth.logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)",
        }}
      >
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)",
      }}
    >
      <div className="mx-auto max-w-2xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-white/80">
              {user?.parentProfile?.fullName ?? user?.email}
            </p>
          </div>
          <button
            onClick={logout}
            className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
            </svg>
          </button>
        </div>

        {/* Segment */}
        <div className="rounded-2xl bg-white p-2 shadow-md">
          <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
            <button
              onClick={() => setSegment("children")}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                segment === "children"
                  ? "bg-white text-dark-amethyst-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Anak
            </button>
            <button
              onClick={() => setSegment("schedule")}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                segment === "schedule"
                  ? "bg-white text-dark-amethyst-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Jadwal
            </button>
          </div>
        </div>

        {/* Children Tab */}
        {segment === "children" && (
          <div className="mt-4 space-y-4">
            {students.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center shadow-md">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Belum ada anak</h3>
                <p className="mt-1 text-sm text-gray-500">Tambahkan anak untuk mulai belajar</p>
                <button
                  onClick={() => setShowAddStudent(true)}
                  className="mt-4 rounded-xl bg-dark-amethyst-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-dark-amethyst-600"
                >
                  + Tambah Anak
                </button>
              </div>
            ) : (
              students.map((student) => (
                <div key={student.id} className="rounded-2xl bg-white p-5 shadow-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-dark-amethyst-100">
                        <svg className="h-6 w-6 text-dark-amethyst-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-[1.1rem] font-bold text-gray-800">{student.nickname}</h3>
                        <p className="text-sm text-gray-500">{student.fullName}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-frosted-blue-50 px-3 py-1 text-xs font-medium text-frosted-blue-600">
                      {CATEGORY_LABELS[student.category]}
                    </span>
                  </div>

                  <div className="mt-3">
                    {/* Stats */}
                    <div className="flex gap-2">
                      <span className="inline-flex items-center gap-1 rounded-full bg-tea-green-50 px-3 py-1 text-xs font-medium text-tea-green-700">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                        {student.totalXp} XP
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-berry-lipstick-50 px-3 py-1 text-xs font-medium text-berry-lipstick-600">
                        <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 23c-4.97 0-9-3.58-9-8 0-2.1.89-4.03 2.4-5.55C6.83 8.04 8 6.13 8 4c0-.58.07-1.15.2-1.69C9.57 4.56 11 6.94 12 9c1-2.06 2.43-4.44 3.8-6.69.13.54.2 1.11.2 1.69 0 2.13 1.17 4.04 2.6 5.45C19.11 10.97 20 12.9 20 15c0 4.42-4.03 8-9 8h-1z" />
                        </svg>
                        {student.currentStreak} hari
                      </span>
                    </div>

                    {/* Enrolled Classes */}
                    {student.enrollments.length > 0 && (
                      <div className="mt-3">
                        <p className="mb-2 text-sm font-medium text-gray-600">Kelas:</p>
                        <div className="flex flex-wrap gap-2">
                          {student.enrollments.filter((e) => e.class).map((enrollment) => (
                            <span
                              key={enrollment.id}
                              className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
                              </svg>
                              {enrollment.class!.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {student.enrollments.length === 0 && (
                      <p className="mt-2 text-sm text-gray-400">Belum terdaftar di kelas</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Schedule Tab */}
        {segment === "schedule" && (
          <div className="mt-4 space-y-4">
            {students.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center shadow-md">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Belum ada jadwal</h3>
                <p className="mt-1 text-sm text-gray-500">Tambahkan anak terlebih dahulu</p>
              </div>
            ) : (
              students.map((student) => {
                const schedules = student.schedules.filter(
                  (s, i, arr) => arr.findIndex((x) => x.id === s.id) === i
                );
                return (
                  <div key={student.id} className="rounded-2xl bg-white p-5 shadow-md">
                    <h3 className="text-[1.1rem] font-bold text-gray-800">{student.nickname}</h3>
                    <div className="mt-3">
                      {schedules.length === 0 ? (
                        <p className="text-sm text-gray-400">Belum ada jadwal</p>
                      ) : (
                        <div className="space-y-2">
                          {schedules.map((schedule) => (
                            <div
                              key={schedule.id}
                              className="flex items-center justify-between rounded-xl bg-frosted-blue-50 p-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-frosted-blue-100">
                                  <svg className="h-5 w-5 text-frosted-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-800">
                                    {DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {schedule.startTime} - {schedule.endTime}
                                  </p>
                                </div>
                              </div>
                              {schedule.topic && (
                                <span className="rounded-full bg-frosted-blue-100 px-3 py-1 text-xs font-medium text-frosted-blue-700">
                                  {schedule.topic}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* FAB Add Student */}
      <button
        onClick={() => setShowAddStudent(true)}
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-dark-amethyst-500 text-white shadow-lg transition hover:bg-dark-amethyst-600 hover:shadow-xl"
      >
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      </button>

      {/* Modal Add Student */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowAddStudent(false)}
          />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Tambah Anak</h2>
              <button
                onClick={() => setShowAddStudent(false)}
                className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={onAddStudent}>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap</label>
                <input
                  value={form.fullName}
                  onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                  placeholder="Nama lengkap anak"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Nama Panggilan</label>
                <input
                  value={form.nickname}
                  onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))}
                  placeholder="Nama panggilan"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="email@contoh.com"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Minimal 8 karakter"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Telepon</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="08xxxxxxxxxx"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
                  required
                />
              </div>

              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                <input
                  type="date"
                  value={form.birthDate}
                  onChange={(e) => setForm((f) => ({ ...f, birthDate: e.target.value }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">Kategori</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as typeof form.category }))}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
                >
                  <option value="JUNIOR_I">Kelas 1-3 SD</option>
                  <option value="JUNIOR_II">Kelas 4-6 SD</option>
                  <option value="JUNIOR_III">Kelas 7-9 SMP</option>
                </select>
              </div>

              {error && (
                <div className="mb-4 rounded-lg bg-berry-lipstick-50 p-3 text-sm text-berry-lipstick-600">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-tea-green-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-tea-green-600 disabled:opacity-50"
              >
                {saving ? (
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  "Simpan"
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
