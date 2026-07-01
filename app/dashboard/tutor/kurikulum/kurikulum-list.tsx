"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  api,
  clearSession,
  getStoredSession,
  type Class,
} from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
  KIDS: "Kelas 1-3 SD",
  JUNIOR_I: "Kelas 4-6 SD",
  JUNIOR_II: "Kelas 7-9 SMP",
};

export default function KurikulumList() {
  const router = useRouter();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [router]);

  async function loadData() {
    try {
      const me = await api.auth.me();
      if (me.role !== "TUTOR" || !me.tutorProfile) {
        router.replace("/dashboard");
        return;
      }

      const classList = await api.classes.listByTutor(me.tutorProfile.id);
      setClasses(classList);
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

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)" }}>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Kurikulum</h1>
            <p className="text-sm text-white/80">Daftar kurikulum kelas</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/tutor"
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              Kembali
            </Link>
            <button
              onClick={logout}
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>

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
          <div className="space-y-4">
            {classes.map((cls) => {
              const curriculum = cls.curriculum;
              const topicCount = curriculum?.topics?.length ?? 0;
              return (
                <Link
                  key={cls.id}
                  href={
                    curriculum
                      ? `/dashboard/tutor/kurikulum/${curriculum.id}`
                      : "#"
                  }
                  className={`block rounded-2xl bg-white p-5 shadow-md transition hover:shadow-lg ${
                    curriculum ? "cursor-pointer" : "cursor-default"
                  }`}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{cls.name}</h3>
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

                  {curriculum ? (
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-700">{curriculum.name}</p>
                      <span className="rounded-full bg-frosted-blue-50 px-2 py-0.5 text-[10px] font-medium text-frosted-blue-600">
                        {topicCount} topic
                      </span>
                      <svg className="ml-auto h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-400">Belum ada kurikulum</p>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
