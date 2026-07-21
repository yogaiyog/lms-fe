"use client";

import { useEffect, useState, useMemo, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  clearSession,
  getStoredSession,
  checkEmail,
  type AuthUser,
  type StudentProfile,
  type Class,
  type Schedule,
  type Enrollment,
  type Category,
  type Curriculum,
} from "@/lib/api";
import type { Theme, Segment } from "../student/_component/types";
import { Home, BookOpen, X, ShoppingCart, Check, Users, Calendar } from "lucide-react";
import Sidebar from "../student/_component/Sidebar";
import Topbar from "../student/_component/Topbar";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin", TUESDAY: "Selasa", WEDNESDAY: "Rabu",
  THURSDAY: "Kamis", FRIDAY: "Jumat", SATURDAY: "Sabtu", SUNDAY: "Minggu",
};

const TYPE_LABELS: Record<string, string> = {
  BATCH: "Reguler",
  PRIVATE: "Privat",
  MAKEUP: "Makeup",
};

export default function ParentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [dark, setDark] = useState(false);
  const [segment, setSegment] = useState<Segment>("overview");

  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedDetailClass, setSelectedDetailClass] = useState<Class | null>(null);

  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    email: "",
    password: "",
    fullName: "",
    nickname: "",
    birthDate: "",
    categoryId: "",
  });
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const emailTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const selectedStudent = useMemo(() => students.find((s) => s.id === selectedStudentId) ?? students[0], [students, selectedStudentId]);

  const theme: Theme = {
    dark,
    bg: dark ? "bg-slate-950" : "bg-slate-50",
    card: dark ? "bg-slate-900" : "bg-white",
    border: dark ? "border-slate-800" : "border-slate-200",
    text: dark ? "text-slate-50" : "text-slate-900",
    textMuted: dark ? "text-slate-400" : "text-slate-500",
  };

  const go = (p: Segment) => {
    if (p === "overview" || p === "enrollment") setSegment(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  async function loadStudentData(studentId: string) {
    if (!studentId) return;
    try {
      const allEnrollments = await api.enrollments.listByStudent(studentId);
      setEnrollments(allEnrollments);

      const activeEnrollments = allEnrollments.filter((e) => e.classId);
      if (activeEnrollments.length === 0) { setSchedules([]); return; }

      const allSchedules = await Promise.all(
        activeEnrollments.map((e) => api.schedules.listByClass(e.classId!))
      );
      setSchedules(allSchedules.flat());
    } catch {}
  }

  useEffect(() => {
    const session = getStoredSession();
    if (!session) { router.replace("/login"); return; }
    if (session.user.role !== "PARENT") {
      if (session.user.role === "STUDENT") { router.replace("/dashboard/student"); return; }
      if (session.user.role === "TUTOR") { router.replace("/dashboard/tutor"); return; }
      if (session.user.role === "ADMIN") { router.replace("/dashboard/admin"); return; }
      router.replace("/dashboard"); return;
    }
    (async () => {
      try {
        setUser(session.user);
        const [allCategories] = await Promise.all([api.categories.list()]);
        setCategories(allCategories);
        const parentId = session.user.parentProfile?.id;
        if (!parentId) { setLoading(false); return; }
        const list = await api.studentProfiles.listByParent(parentId);
        setStudents(list);
        if (list.length > 0) {
          setSelectedStudentId(list[0].id);
          await loadStudentData(list[0].id);
        }
      } catch {
        clearSession();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  useEffect(() => {
    if (!selectedStudentId) return;
    api.enrollments.listByStudent(selectedStudentId)
      .then(async (allEnrollments) => {
        setEnrollments(allEnrollments);
        const activeEnrollments = allEnrollments.filter((e) => e.classId);
        if (activeEnrollments.length === 0) { setSchedules([]); return; }
        const allSchedules = await Promise.all(
          activeEnrollments.map((e) => api.schedules.listByClass(e.classId!))
        );
        setSchedules(allSchedules.flat());
      })
      .catch(() => {});
  }, [selectedStudentId]);

  async function logout() {
    await api.auth.logout();
    router.push("/login");
  }

  async function onAddStudent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
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
        nickname: form.nickname,
        birthDate: new Date(form.birthDate).toISOString(),
        categoryId: form.categoryId || null,
      });

      setShowAdd(false);
      setForm({ email: "", password: "", fullName: "", nickname: "", birthDate: "", categoryId: "" });

      const parentId2 = user?.parentProfile?.id;
      if (parentId2) {
        const list = await api.studentProfiles.listByParent(parentId2);
        setStudents(list);
        if (list.length > 0) {
          setSelectedStudentId(list[0].id);
          await loadStudentData(list[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menambah anak");
    } finally {
      setSaving(false);
    }
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
        <Sidebar theme={theme} segment={segment} onNavigate={go} title={`Parent ${user?.parentProfile?.fullName ?? ""}`} navItems={[
          { key: "overview", label: "Home", icon: Home },
          { key: "enrollment", label: "Enrollment", icon: BookOpen },
        ]} user={{
          studentProfile: selectedStudent ? { fullName: selectedStudent.fullName } : null,
        }} />

        <div className="flex-1 md:ml-64 min-w-0">
          <Topbar theme={theme} segment={segment} onToggleDark={() => setDark((v) => !v)} onLogout={logout} onMenuClick={() => {}} />

          <main className="px-4 sm:px-8 py-6 pb-10 max-w-6xl">
            {students.length === 0 ? (
              <div className={`rounded-3xl p-8 text-center ${theme.card}`}>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                  <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                </div>
                <h2 className={`text-lg font-bold ${theme.text}`}>Belum ada anak terdaftar</h2>
                <p className={`mt-1 text-sm ${theme.textMuted}`}>Daftarkan anak untuk mulai belajar</p>
                <button onClick={() => { setShowAdd(true); setError(""); }}
                  className="mt-5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
                >
                  + Daftarkan Anak
                </button>
              </div>
            ) : segment === "overview" ? (
              <OverviewView
                theme={theme}
                students={students}
                selectedStudentId={selectedStudentId}
                setSelectedStudentId={setSelectedStudentId}
                selectedStudent={selectedStudent}
                enrollments={enrollments}
                weekSchedules={weekSchedules}
                onShowAdd={() => { setShowAdd(true); setError(""); }}
              />
            ) : (
              <EnrollmentView
                theme={theme}
                students={students}
                onSelectClass={setSelectedDetailClass}
              />
            )}
          </main>
        </div>
      </div>

      <AddStudentModal
        show={showAdd}
        onClose={() => setShowAdd(false)}
        onAdd={onAddStudent}
        form={form}
        setForm={setForm}
        emailStatus={emailStatus}
        setEmailStatus={setEmailStatus}
        emailTimer={emailTimer}
        saving={saving}
        error={error}
        categories={categories}
      />

      {selectedDetailClass && (
        <ClassDetailModal
          theme={theme}
          cls={selectedDetailClass}
          onClose={() => setSelectedDetailClass(null)}
        />
      )}
    </div>
  );
}

function OverviewView({ theme, students, selectedStudentId, setSelectedStudentId, selectedStudent, enrollments, weekSchedules, onShowAdd }: {
  theme: Theme;
  students: StudentProfile[];
  selectedStudentId: string;
  setSelectedStudentId: (id: string) => void;
  selectedStudent: StudentProfile | undefined;
  enrollments: Enrollment[];
  weekSchedules: Schedule[];
  onShowAdd: () => void;
}) {
  return (
    <>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <label className={`text-sm font-bold ${theme.text}`}>Anak:</label>
        <div className="flex flex-wrap gap-2">
          {students.map((s) => (
            <button key={s.id} onClick={() => setSelectedStudentId(s.id)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                selectedStudentId === s.id
                  ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                  : `${theme.card} ${theme.text} border ${theme.border} hover:bg-blue-50 hover:text-blue-700`
              }`}
            >
              {s.nickname}
              <span className="ml-1.5 text-xs opacity-70">{s.category?.label ?? ""}</span>
            </button>
          ))}
          <button onClick={onShowAdd}
            className="rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-400 transition hover:border-blue-400 hover:text-blue-600"
          >
            + Tambah
          </button>
        </div>
      </div>

      {selectedStudent && (
        <div className={`mb-6 rounded-3xl p-5 ${theme.card}`}>
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-xl font-extrabold text-blue-700">
              {selectedStudent.nickname.charAt(0)}
            </div>
            <div>
              <h2 className={`text-xl font-extrabold ${theme.text}`}>{selectedStudent.nickname}</h2>
              <p className={`text-sm ${theme.textMuted}`}>{selectedStudent.fullName}</p>
              <div className="mt-1 flex gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                  ⭐ {selectedStudent.totalXp} XP
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-600">
                  🔥 {selectedStudent.currentStreak} hari
                </span>
              </div>
            </div>
          </div>

          {enrollments.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {enrollments.filter((e) => e.class).map((e) => (
                <span key={e.id} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
                  📚 {e.class!.name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-4">
        <h3 className={`text-lg font-bold ${theme.text}`}>Jadwal Minggu Ini</h3>
        {weekSchedules.length === 0 ? (
          <div className={`rounded-3xl p-6 text-center ${theme.card}`}>
            <p className={`text-sm ${theme.textMuted}`}>Tidak ada jadwal minggu ini</p>
          </div>
        ) : (
          weekSchedules.map((s) => (
            <div key={s.id} className={`rounded-3xl p-4 ${theme.card}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                  </div>
                  <div>
                    <p className={`text-sm font-semibold ${theme.text}`}>
                      {DAY_LABELS[s.dayOfWeek] ?? s.dayOfWeek}
                    </p>
                    <p className={`text-xs ${theme.textMuted}`}>
                      {s.startTime} - {s.endTime}
                      {s.topic && <> &middot; {s.topic}</>}
                    </p>
                  </div>
                </div>
                {s.isDone && (
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Selesai</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

function EnrollmentView({ theme, students, onSelectClass }: {
  theme: Theme;
  students: StudentProfile[];
  onSelectClass: (cls: Class) => void;
}) {
  const [data, setData] = useState<Record<string, { enrollments: Enrollment[]; classes: Class[]; schedules: Schedule[] }>>({});
  const [loading, setLoading] = useState(true);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [showEnroll, setShowEnroll] = useState<string | null>(null);
  const [enrollForm, setEnrollForm] = useState({ curriculumId: "", classId: "" });
  const [enrolling, setEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  useEffect(() => { api.curriculums.list().then(setCurriculums).catch(() => {}); }, []);

  async function refresh() {
    const result: Record<string, { enrollments: Enrollment[]; classes: Class[]; schedules: Schedule[] }> = {};
    for (const s of students) {
      const enr = await api.enrollments.listByStudent(s.id);
      const active = enr.filter((e) => e.classId);
      const classes = await Promise.all(
        active.map((e) => api.classes.get(e.classId!).catch(() => null))
      );
      const sch = await Promise.all(
        active.map((e) => api.schedules.listByClass(e.classId!))
      );
      result[s.id] = { enrollments: enr, classes: classes.filter(Boolean) as Class[], schedules: sch.flat() };
    }
    setData(result);
    setLoading(false);
  }

  useEffect(() => {
    if (students.length === 0) return;
    const result: Record<string, { enrollments: Enrollment[]; classes: Class[]; schedules: Schedule[] }> = {};
    Promise.all(students.map(async (s) => {
      const enr = await api.enrollments.listByStudent(s.id);
      const active = enr.filter((e) => e.classId);
      const classes = await Promise.all(
        active.map((e) => api.classes.get(e.classId!).catch(() => null))
      );
      const sch = await Promise.all(
        active.map((e) => api.schedules.listByClass(e.classId!))
      );
      result[s.id] = { enrollments: enr, classes: classes.filter(Boolean) as Class[], schedules: sch.flat() };
    })).then(() => {
      setData(result);
      setLoading(false);
    });
  }, [students]);

  async function handleEnroll(e: FormEvent) {
    e.preventDefault();
    if (!showEnroll) return;
    setEnrolling(true);
    setEnrollError("");
    try {
      await api.enrollments.create({
        studentId: showEnroll,
        curriculumId: enrollForm.curriculumId,
        classId: enrollForm.classId || undefined,
      });
      setShowEnroll(null);
      setEnrollForm({ curriculumId: "", classId: "" });
      await refresh();
    } catch (err) {
      setEnrollError(err instanceof Error ? err.message : "Gagal");
    } finally { setEnrolling(false); }
  }

  const selectedCurriculum = curriculums.find((c) => c.id === enrollForm.curriculumId);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>Enrollment</h1>

      {students.map((student) => {
        const sData = data[student.id];
        const hasEnrollments = sData && (sData.classes.length > 0 || sData.enrollments.filter((e) => !e.classId).length > 0);
        return (
          <div key={student.id}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-sm font-extrabold text-blue-700">
                  {student.nickname.charAt(0)}
                </div>
                <div>
                  <h2 className={`text-lg font-extrabold ${theme.text}`}>{student.nickname}</h2>
                  <p className={`text-xs ${theme.textMuted}`}>{student.fullName}</p>
                </div>
              </div>
              <button onClick={() => { setShowEnroll(student.id); setEnrollForm({ curriculumId: "", classId: "" }); setEnrollError(""); }}
                className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700">
                + Enroll
              </button>
            </div>

            {!hasEnrollments && (
              <p className={`mb-3 text-sm ${theme.textMuted}`}>Belum ada enrollment. Klik &quot;Enroll&quot; untuk mendaftarkan.</p>
            )}

            {hasEnrollments && (
              <div className="space-y-3">
                {sData.classes.map((cls) => {
                  const totalMeetLeft = sData.enrollments.find((e) => e.classId === cls.id)?.totalMeetLeft ?? 0;
                  const classSchedules = sData.schedules.filter((s) => s.classId === cls.id);
                  const totalTopics = cls.curriculum?.topics?.length ?? 0;
                  const historyMeetings = classSchedules.filter(
                    (s) => s.isDone || s.date < new Date().toISOString().split("T")[0]
                  ).length;
                  const studentCount = cls.enrollments?.length ?? 0;

                  return (
                    <button key={cls.id} onClick={() => onSelectClass(cls)} className="w-full text-left">
                      <div className={`rounded-2xl border ${theme.border} ${theme.card} p-5 w-full hover:shadow-md transition-shadow cursor-pointer`}>
                        <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                          <div className="flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
                              <BookOpen size={20} className="text-indigo-600" />
                            </span>
                            <div>
                              <h3 className={`text-lg font-extrabold ${theme.text}`}>{cls.name}</h3>
                              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                                  {cls.category?.label ?? "-"}
                                </span>
                                <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700">
                                  {TYPE_LABELS[cls.type] ?? cls.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className={`rounded-xl p-3 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                              <Users size={13} className="text-emerald-600" />
                              <span className={theme.textMuted}>Siswa</span>
                            </div>
                            <p className={`text-lg font-extrabold ${theme.text}`}>{studentCount}</p>
                          </div>
                          <div className={`rounded-xl p-3 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                              <Calendar size={13} className="text-blue-600" />
                              <span className={theme.textMuted}>Progress Kelas</span>
                            </div>
                            <div className={`h-2.5 w-full overflow-hidden rounded-full ${theme.dark ? "bg-slate-700" : "bg-slate-200"}`}>
                              <div className="h-full rounded-full bg-blue-600 transition-all"
                                style={{ width: `${totalTopics > 0 ? Math.min(100, (historyMeetings / totalTopics) * 100) : 0}%` }} />
                            </div>
                            <p className="mt-1 text-[10px] font-semibold text-blue-600">
                              sudah berjalan {historyMeetings} dari {totalTopics} topics
                            </p>
                          </div>
                          <div className={`rounded-xl p-3 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                            <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                              <ShoppingCart size={13} className="text-amber-600" />
                              <span className={theme.textMuted}>Sisa Pertemuan</span>
                            </div>
                            <p className={`text-lg font-extrabold ${theme.text}`}>{totalMeetLeft}</p>
                          </div>
                        </div>

                        {cls.curriculum?.topics && cls.curriculum.topics.length > 0 && (
                          <div className={`mt-4 pt-4 border-t ${theme.border}`}>
                            <h3 className={`text-[10px] font-semibold mb-2 ${theme.textMuted}`}>Kurikulum</h3>
                            <div className="space-y-1">
                              {[...cls.curriculum.topics].sort((a, b) => a.order - b.order).map((topic) => {
                                const tSchedules = classSchedules.filter((s) => s.topicId === topic.id);
                                const completed = tSchedules.length > 0 && tSchedules.every((s) => s.isDone);
                                return (
                                  <div key={topic.id} className="flex items-center gap-2">
                                    <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${completed ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400"}`}>
                                      {completed ? <Check size={8} /> : <span className="text-[8px] font-bold">{topic.order + 1}</span>}
                                    </span>
                                    <span className={`text-[11px] ${completed ? "text-emerald-600 font-semibold" : theme.textMuted}`}>{topic.title}</span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {cls.tutors && cls.tutors.length > 0 && (
                          <div className={`mt-4 pt-4 border-t ${theme.border} flex items-center gap-3`}>
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                              {cls.tutors[0].fullName?.charAt(0) ?? "T"}
                            </div>
                            <div>
                              <p className={`text-xs font-semibold ${theme.textMuted}`}>Tutor</p>
                              <p className={`text-sm font-bold ${theme.text}`}>{cls.tutors.map((t) => t.fullName).join(", ") ?? "-"}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {sData.enrollments.filter((e) => !e.classId).map((enr) => (
                  <div key={enr.id} className={`rounded-2xl border ${theme.border} ${theme.card} px-5 py-4 flex items-center justify-between gap-3`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                        <BookOpen size={20} className="text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <h3 className={`text-base font-extrabold ${theme.text}`}>{enr.curriculum?.name ?? "Menunggu kelas"}</h3>
                        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          Menunggu Kelas
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Dibeli</p>
                        <p className={`text-base font-extrabold ${theme.text}`}>{enr.totalMeetPurchased}</p>
                      </div>
                      <div className="text-right">
                        <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Sisa</p>
                        <p className={`text-base font-extrabold ${theme.text}`}>{enr.totalMeetLeft}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {showEnroll && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowEnroll(null)} />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-800">Enroll Siswa</h2>
              <button onClick={() => setShowEnroll(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEnroll}>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-slate-700">Siswa</label>
                <select value={showEnroll} onChange={(e) => setShowEnroll(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.nickname} ({s.fullName})</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-slate-700">Kurikulum</label>
                <select value={enrollForm.curriculumId} onChange={(e) => setEnrollForm((f) => ({ ...f, curriculumId: e.target.value, classId: "" }))} required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Pilih Kurikulum --</option>
                  {curriculums.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-slate-700">Kelas <span className="text-xs font-normal text-slate-400">(opsional)</span></label>
                <select value={enrollForm.classId} onChange={(e) => setEnrollForm((f) => ({ ...f, classId: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Tanpa kelas --</option>
                  {(selectedCurriculum as Curriculum & { classes?: Class[] })?.classes?.map((cls) => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))}
                </select>
                {!(selectedCurriculum as Curriculum & { classes?: Class[] })?.classes && <p className="mt-1 text-xs text-slate-400">Pilih kurikulum untuk melihat kelas</p>}
              </div>

              {enrollError && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{enrollError}</div>}

              <button type="submit" disabled={enrolling}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
              >
                {enrolling ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AddStudentModal({ show, onClose, onAdd, form, setForm, emailStatus, setEmailStatus, emailTimer, saving, error, categories }: {
  show: boolean;
  onClose: () => void;
  onAdd: (e: FormEvent<HTMLFormElement>) => Promise<void>;
  form: { email: string; password: string; fullName: string; nickname: string; birthDate: string; categoryId: string };
  setForm: React.Dispatch<React.SetStateAction<{ email: string; password: string; fullName: string; nickname: string; birthDate: string; categoryId: string }>>;
  emailStatus: "idle" | "checking" | "available" | "taken";
  setEmailStatus: React.Dispatch<React.SetStateAction<"idle" | "checking" | "available" | "taken">>;
  emailTimer: React.MutableRefObject<ReturnType<typeof setTimeout> | undefined>;
  saving: boolean;
  error: string;
  categories: Category[];
}) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Daftarkan Anak</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onAdd}>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Nama Lengkap</label>
            <input value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} placeholder="Nama lengkap anak" required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Nama Panggilan</label>
            <input value={form.nickname} onChange={(e) => setForm((f) => ({ ...f, nickname: e.target.value }))} placeholder="Nama panggilan" required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={form.email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                setForm((f) => ({ ...f, email: val }));
                if (emailTimer.current) clearTimeout(emailTimer.current);
                if (!val) { setEmailStatus("idle"); return; }
                setEmailStatus("checking");
                // eslint-disable-next-line react-hooks/immutability
                emailTimer.current = setTimeout(async () => {
                  const available = await checkEmail(val);
                  setEmailStatus(available ? "available" : "taken");
                }, 500);
              }}
              placeholder="email@contoh.com" required
              className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                emailStatus === "taken" ? "border-red-400 focus:border-red-400 focus:ring-red-100" : emailStatus === "available" ? "border-green-400 focus:border-green-400 focus:ring-green-100" : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              }`} />
            {emailStatus === "checking" && <p className="mt-1 text-xs text-slate-400">Memeriksa email...</p>}
            {emailStatus === "available" && <p className="mt-1 text-xs text-green-600">Email tersedia</p>}
            {emailStatus === "taken" && <p className="mt-1 text-xs text-red-600">Email sudah digunakan</p>}
            {emailStatus === "idle" && <p className="mt-1 text-xs text-slate-400">Jika anak belum punya email, gunakan {form.nickname || "namaanak"}@email.com</p>}
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input type="password" value={form.password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, password: e.target.value }))} placeholder="Minimal 8 karakter" required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-slate-700">Tanggal Lahir</label>
            <input type="date" value={form.birthDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, birthDate: e.target.value }))} required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">Kategori</label>
            <select value={form.categoryId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

          <button type="submit" disabled={saving || emailStatus === "taken" || emailStatus === "checking"}
            className="w-full rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Daftarkan"}
          </button>
        </form>
      </div>
    </div>
  );
}

function ClassDetailModal({ theme, cls, onClose }: {
  theme: Theme;
  cls: Class;
  onClose: () => void;
}) {
  const topics = [...(cls.curriculum?.topics ?? [])].sort((a, b) => a.order - b.order);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-10 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl border ${theme.border} ${theme.card} p-6 shadow-xl mb-10`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className={`text-xl font-extrabold ${theme.text}`}>{cls.name}</h2>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                {cls.category?.label ?? "-"}
              </span>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700">
                {TYPE_LABELS[cls.type] ?? cls.type}
              </span>
            </div>
          </div>
          <button onClick={onClose} className={`rounded-xl p-1.5 ${theme.dark ? "hover:bg-slate-700" : "hover:bg-slate-200"} transition`}>
            <X size={20} className={theme.text} />
          </button>
        </div>

        {topics.length > 0 && (
          <div className={`border-t ${theme.border} pt-5`}>
            <h3 className={`text-sm font-bold mb-3 ${theme.text}`}>Kurikulum</h3>
            <div className="space-y-1.5">
              {topics.map((topic, i) => (
                <div key={topic.id} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold bg-slate-200 text-slate-500">
                      {i + 1}
                    </span>
                    <span className={`text-xs font-semibold ${theme.text}`}>{topic.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {cls.tutors && cls.tutors.length > 0 && (
          <div className={`mt-5 pt-5 border-t ${theme.border} flex items-center gap-3`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              {cls.tutors[0].fullName?.charAt(0) ?? "T"}
            </div>
            <div>
              <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Tutor</p>
              <p className={`text-sm font-bold ${theme.text}`}>{cls.tutors.map((t) => t.fullName).join(", ") ?? "-"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
