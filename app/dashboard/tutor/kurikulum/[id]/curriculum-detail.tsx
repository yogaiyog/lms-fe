"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut, BookOpen, FileText, Code, Wrench } from "lucide-react";
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
    (async () => {
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
    })();
  }, [router, curriculumId]);

  async function logout() {
    await api.auth.logout();
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!curriculum) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-8 text-center">
          <h2 className="text-xl font-extrabold text-slate-900">Kurikulum tidak ditemukan</h2>
          <Link href="/dashboard/tutor/kurikulum"
            className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 transition-colors">
            Kembali
          </Link>
        </div>
      </div>
    );
  }

  const sortedTopics = [...curriculum.topics].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/tutor/kurikulum"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{curriculum.name}</h1>
              <p className="mt-1 text-sm text-slate-500">{user?.tutorProfile?.fullName ?? user?.email}</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={18} />
          </button>
        </div>

        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">
            <BookOpen size={13} />
            {sortedTopics.length} topik
          </span>
        </div>

        {sortedTopics.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center text-center">
            <span className="text-5xl mb-4">📖</span>
            <h2 className="text-lg font-bold text-slate-900">Belum ada topik</h2>
            <p className="mt-1 text-sm text-slate-500">Belum ada topik dalam kurikulum ini</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTopics.map((topic, index) => (
              <div key={topic.id} className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-100 text-sm font-bold text-blue-700">
                    {index + 1}
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold text-slate-900">{topic.title}</h2>
                    {topic.goals && (
                      <p className="mt-0.5 text-sm text-slate-500">{topic.goals}</p>
                    )}
                  </div>
                </div>

                <div className="ml-11 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {topic.materialLink && (
                    <a href={topic.materialLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100">
                      <FileText size={15} />
                      Materi
                    </a>
                  )}
                  {topic.exampleProjectLink && (
                    <a href={topic.exampleProjectLink} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 rounded-xl bg-emerald-50 p-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                      <Code size={15} />
                      Contoh Project
                    </a>
                  )}
                  {topic.tools && (
                    <div className="flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-xs font-semibold text-slate-600">
                      <Wrench size={15} className="text-slate-400" />
                      <span><span className="text-slate-700">Tools:</span> {topic.tools}</span>
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
