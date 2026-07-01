"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  api,
  clearSession,
  getStoredSession,
  type Curriculum,
  type AuthUser,
} from "@/lib/api";

export default function CurriculumDetail() {
  const router = useRouter();
  const params = useParams();
  const curriculumId = params.id as string;

  const [user, setUser] = useState<AuthUser | null>(null);
  const [curriculum, setCurriculum] = useState<Curriculum | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [router, curriculumId]);

  async function loadData() {
    try {
      const me = await api.auth.me();
      setUser(me);

      if (me.role !== "TUTOR" || !me.tutorProfile) {
        router.replace("/dashboard");
        return;
      }

      const curriculum = await api.curriculums.get(curriculumId);
      setCurriculum(curriculum);
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

  if (!curriculum) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)" }}>
        <div className="rounded-2xl bg-white p-8 text-center shadow-md">
          <h2 className="text-xl font-bold text-gray-800">Kurikulum tidak ditemukan</h2>
          <Link href="/dashboard/tutor/kurikulum" className="mt-4 inline-block rounded-lg bg-dark-amethyst-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-dark-amethyst-600">
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const sortedTopics = [...curriculum.topics].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)" }}>
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">{curriculum.name}</h1>
            <p className="text-sm text-white/80">{user?.tutorProfile?.fullName ?? user?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/tutor/kurikulum"
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

        <div className="mb-4 flex items-center gap-2">
          <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white">
            {sortedTopics.length} topic
          </span>
        </div>

        {sortedTopics.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-md">
            <p className="text-gray-500">Belum ada topic dalam kurikulum ini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedTopics.map((topic, index) => (
              <div key={topic.id} className="rounded-2xl bg-white p-5 shadow-md">
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-dark-amethyst-100 text-sm font-bold text-dark-amethyst-700">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-800">{topic.title}</h3>
                      {topic.goals && (
                        <p className="mt-0.5 text-xs text-gray-500">{topic.goals}</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="ml-11 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {topic.materialLink && (
                    <a
                      href={topic.materialLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-frosted-blue-50 p-3 text-xs font-medium text-frosted-blue-700 transition hover:bg-frosted-blue-100"
                    >
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      Materi
                    </a>
                  )}
                  {topic.exampleProjectLink && (
                    <a
                      href={topic.exampleProjectLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                    >
                      <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                      </svg>
                      Contoh Project
                    </a>
                  )}
                  {topic.tools && (
                    <div className="flex items-center gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-600">
                      <svg className="h-4 w-4 flex-shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.354 2.716m-2.788 2.517c-.48.582-1.144 1.048-1.89 1.42" />
                      </svg>
                      <span><span className="font-medium text-gray-700">Tools:</span> {topic.tools}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
