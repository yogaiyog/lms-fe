"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  clearSession,
  getStoredSession,
  type AuthUser,
  type Class,
  type Schedule,
  type Announcement,
  type Topic,
} from "@/lib/api";
import Link from "next/link";

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
  KIDS: "Kelas 1-3 SD",
  JUNIOR_I: "Kelas 4-6 SD",
  JUNIOR_II: "Kelas 7-9 SMP",
};

type ClassWithDetails = Class & {
  schedules: Schedule[];
  announcements: Announcement[];
};

export default function TutorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [segment, setSegment] = useState<"classes" | "schedule">("classes");

  // Schedule edit
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editScheduleClassId, setEditScheduleClassId] = useState<string>("");
  const [editTopicId, setEditTopicId] = useState<string>("");
  const [editCustomTopic, setEditCustomTopic] = useState("");
  const [editMeetLink, setEditMeetLink] = useState("");
  const [savingSchedule, setSavingSchedule] = useState(false);
  const [scheduleError, setScheduleError] = useState("");

  // Announcement
  const [announceClass, setAnnounceClass] = useState<string | null>(null);
  const [announceTitle, setAnnounceTitle] = useState("");
  const [announceContent, setAnnounceContent] = useState("");
  const [announceSaving, setAnnounceSaving] = useState(false);
  const [announceError, setAnnounceError] = useState("");



  async function loadData() {
    try {
      const me = await api.auth.me();
      setUser(me);

      if (me.role !== "TUTOR" || !me.tutorProfile) {
        router.replace("/dashboard");
        return;
      }

      const classList = await api.classes.listByTutor(me.tutorProfile.id);
      const classesWithDetails = await Promise.all(
        classList.map(async (cls) => {
          const [schedules, announcements] = await Promise.all([
            api.schedules.listByClass(cls.id),
            api.announcements.listByClass(cls.id),
          ]);
          return { ...cls, schedules, announcements };
        })
      );

      setClasses(classesWithDetails);
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
    loadData();
  }, [router]);

  async function logout() {
    await api.auth.logout();
    router.push("/login");
  }

  // Schedule handlers
  function startEditSchedule(schedule: Schedule, classId: string) {
    setEditingSchedule(schedule);
    setEditScheduleClassId(classId);
    setEditTopicId(schedule.topicId ?? "");
    setEditCustomTopic(schedule.topic ?? "");
    setEditMeetLink(schedule.meetLink);
    setScheduleError("");
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
        const updated = await api.schedules.update(editingSchedule.id, payload);
        setClasses((prev) =>
          prev.map((cls) => ({
            ...cls,
            schedules: cls.schedules.map((s) => (s.id === updated.id ? updated : s)),
          }))
        );
      }
      setEditingSchedule(null);
    } catch (err) {
      setScheduleError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSavingSchedule(false);
    }
  }

  // Announcement handlers
  async function createAnnouncement(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!announceClass || !user?.tutorProfile) return;
    setAnnounceSaving(true);
    setAnnounceError("");

    try {
      const created = await api.announcements.create({
        classId: announceClass,
        tutorId: user.tutorProfile.id,
        title: announceTitle,
        content: announceContent,
      });

      setClasses((prev) =>
        prev.map((cls) =>
          cls.id === announceClass
            ? { ...cls, announcements: [...cls.announcements, created] }
            : cls
        )
      );

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
    const cls = classes.find((c) => c.id === classId);
    return cls?.curriculum?.topics ?? [];
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

  const allSchedules = classes.flatMap((cls) =>
    cls.schedules.map((s) => ({ ...s, className: cls.name }))
  );

  return (
    <div
      className="min-h-screen"
      style={{
        background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)",
      }}
    >
      <div className="mx-auto max-w-4xl px-4 py-6">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard Tutor</h1>
            <p className="text-sm text-white/80">
              {user?.tutorProfile?.fullName ?? user?.email}
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
              onClick={() => setSegment("classes")}
              className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                segment === "classes"
                  ? "bg-white text-dark-amethyst-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Kelas Saya
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
            <Link
              href="/dashboard/tutor/jadwal-slot"
              className="flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              Slot
            </Link>
            <Link
              href="/dashboard/tutor/kurikulum"
              className="flex-1 rounded-lg px-4 py-2.5 text-center text-sm font-medium text-gray-500 transition hover:text-gray-700"
            >
              Kurikulum
            </Link>
          </div>
        </div>

        {/* Classes Tab */}
        {segment === "classes" && (
          <div className="mt-4 space-y-4">
            {classes.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center shadow-md">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Belum ada kelas</h3>
                <p className="mt-1 text-sm text-gray-500">Kamu belum mengajar kelas apapun</p>
              </div>
            ) : (
              classes.map((cls) => (
                <div key={cls.id} className="rounded-2xl bg-white p-5 shadow-md">
                  {/* Class Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="text-[1.1rem] font-bold text-gray-800">{cls.name}</h3>
                      <span className="mt-1 inline-block rounded-full bg-frosted-blue-50 px-3 py-1 text-xs font-medium text-frosted-blue-600">
                        {CATEGORY_LABELS[cls.category] ?? cls.category}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-tea-green-50 px-3 py-1 text-xs font-medium text-tea-green-700">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                      </svg>
                      {cls.enrollments?.length ?? 0} siswa
                    </span>
                  </div>

                  {/* Schedules */}
                  {cls.schedules.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-sm font-medium text-gray-600">Jadwal:</p>
                      <div className="space-y-2">
                        {cls.schedules.map((schedule) => (
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
                                {schedule.topic && (
                                  <p className="text-xs font-medium text-frosted-blue-700">
                                    {schedule.topic}
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {schedule.meetLink && (
                                <a
                                  href={schedule.meetLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="rounded-lg bg-frosted-blue-100 p-2 text-frosted-blue-600 transition hover:bg-frosted-blue-200"
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                                  </svg>
                                </a>
                              )}
                              <button
                                onClick={() => startEditSchedule(schedule, cls.id)}
                                className="rounded-lg bg-dark-amethyst-100 p-2 text-dark-amethyst-600 transition hover:bg-dark-amethyst-200"
                              >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                                </svg>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cls.schedules.length === 0 && (
                    <p className="mb-4 text-sm text-gray-400">Belum ada jadwal untuk kelas ini</p>
                  )}

                  {/* Announcements */}
                  <div className="border-t border-gray-100 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">Pengumuman:</p>
                      <button
                        onClick={() => {
                          setAnnounceClass(cls.id);
                          setAnnounceTitle("");
                          setAnnounceContent("");
                          setAnnounceError("");
                        }}
                        className="rounded-lg bg-dark-amethyst-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-dark-amethyst-600"
                      >
                        + Pengumuman
                      </button>
                    </div>

                    {cls.announcements.length > 0 ? (
                      <div className="space-y-2">
                        {cls.announcements.map((ann) => (
                          <div key={ann.id} className="rounded-xl bg-gray-50 p-3">
                            <p className="text-sm font-semibold text-gray-800">{ann.title}</p>
                            <p className="mt-0.5 text-xs text-gray-500">{ann.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Belum ada pengumuman</p>
                    )}
                  </div>

                  {/* Curriculum Section */}
                  <div className="mt-4 border-t border-gray-100 pt-4">
                    <div className="mb-3 flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-600">Kurikulum:</p>
                      {cls.curriculum && (
                        <Link
                          href={`/dashboard/tutor/kurikulum/${cls.curriculum.id}`}
                          className="rounded-lg bg-dark-amethyst-500 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-dark-amethyst-600"
                        >
                          Lihat Kurikulum
                        </Link>
                      )}
                    </div>

                    {cls.curriculum ? (
                      <div className="mb-2 flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-700">{cls.curriculum.name}</p>
                        <span className="rounded-full bg-frosted-blue-50 px-2 py-0.5 text-[10px] font-medium text-frosted-blue-600">
                          {cls.curriculum.topics.length} topic
                        </span>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400">Belum ada kurikulum</p>
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
            {allSchedules.length === 0 ? (
              <div className="rounded-2xl bg-white p-6 text-center shadow-md">
                <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                  <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800">Belum ada jadwal</h3>
                <p className="mt-1 text-sm text-gray-500">Kamu belum memiliki jadwal mengajar</p>
              </div>
            ) : (
              <div className="space-y-2">
                {allSchedules.map((schedule) => (
                  <div key={schedule.id} className="rounded-2xl bg-white p-4 shadow-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">{schedule.className}</p>
                          <p className="text-xs text-gray-500">
                            {DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek},{" "}
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                          {schedule.topic && (
                            <p className="text-xs font-medium text-frosted-blue-700">
                              {schedule.topic}
                            </p>
                          )}
                        </div>
                      </div>
                      {schedule.meetLink && (
                        <a
                          href={schedule.meetLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg bg-frosted-blue-50 px-3 py-1.5 text-xs font-medium text-frosted-blue-600 transition hover:bg-frosted-blue-100"
                        >
                          Buka Link
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal Edit Schedule */}
      {editingSchedule && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setEditingSchedule(null)} />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Edit Jadwal</h2>
              <button onClick={() => setEditingSchedule(null)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={saveSchedule}>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Topic (dari Kurikulum)</label>
                <select
                  value={editTopicId}
                  onChange={(e) => {
                    setEditTopicId(e.target.value);
                    if (e.target.value) {
                      const topic = getClassTopics(editScheduleClassId).find((t) => t.id === e.target.value);
                      setEditCustomTopic(topic?.title ?? "");
                    }
                  }}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
                >
                  <option value="">-- Pilih topic --</option>
                  {getClassTopics(editScheduleClassId).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">Meet Link</label>
                <input value={editMeetLink} onChange={(e) => setEditMeetLink(e.target.value)} placeholder="https://meet.google.com/xxx" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100" />
              </div>
              {scheduleError && <div className="mb-4 rounded-lg bg-berry-lipstick-50 p-3 text-sm text-berry-lipstick-600">{scheduleError}</div>}
              <button type="submit" disabled={savingSchedule} className="w-full rounded-xl bg-dark-amethyst-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-dark-amethyst-600 disabled:opacity-50">
                {savingSchedule ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Create Announcement */}
      {announceClass && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setAnnounceClass(null)} />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-800">Buat Pengumuman</h2>
              <button onClick={() => setAnnounceClass(null)} className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={createAnnouncement}>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium text-gray-700">Judul</label>
                <input value={announceTitle} onChange={(e) => setAnnounceTitle(e.target.value)} placeholder="Judul pengumuman" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100" required />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium text-gray-700">Isi Pengumuman</label>
                <textarea value={announceContent} onChange={(e) => setAnnounceContent(e.target.value)} placeholder="Tulis isi pengumuman..." rows={4} className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100" required />
              </div>
              {announceError && <div className="mb-4 rounded-lg bg-berry-lipstick-50 p-3 text-sm text-berry-lipstick-600">{announceError}</div>}
              <button type="submit" disabled={announceSaving} className="w-full rounded-xl bg-tea-green-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-tea-green-600 disabled:opacity-50">
                {announceSaving ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Kirim Pengumuman"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
