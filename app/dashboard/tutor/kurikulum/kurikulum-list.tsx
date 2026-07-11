"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut, BookOpen, ChevronRight } from "lucide-react";
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
    (async () => {
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
    })();
  }, [router]);

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

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/tutor"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Kurikulum</h1>
              <p className="mt-1 text-sm text-slate-500">Daftar kurikulum kelas</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={18} />
          </button>
        </div>

        {classes.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-12 flex flex-col items-center text-center border-dashed">
            <span className="text-5xl mb-4">📚</span>
            <h3 className="text-lg font-bold text-slate-900">Belum ada kelas</h3>
            <p className="mt-1 text-sm text-slate-500">Kamu belum mengajar kelas apapun</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map((cls) => {
              const curriculum = cls.curriculum;
              const topicCount = curriculum?.topics?.length ?? 0;
              return (
                <Link
                  key={cls.id}
                  href={curriculum ? `/dashboard/tutor/kurikulum/${curriculum.id}` : "#"}
                  className={`block rounded-3xl border border-slate-200 bg-white shadow-sm p-6 transition hover:shadow-md ${curriculum ? "cursor-pointer" : "cursor-default"}`}
                >
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50">
                        <BookOpen size={20} className="text-blue-600" />
                      </span>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900">{cls.name}</h3>
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                          {cls.category?.label ?? "-"}
                        </span>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      <BookOpen size={12} />
                      {cls.enrollments?.length ?? 0} siswa
                    </span>
                  </div>

                  {curriculum ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{curriculum.name}</span>
                      <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        {topicCount} topik
                      </span>
                      <ChevronRight size={16} className="ml-auto text-slate-400" />
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400">Belum ada kurikulum</p>
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
