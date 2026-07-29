"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { api, type Curriculum, type TopicTask } from "@/lib/api";
import { UnitSection } from "@/components/roadmap";
import type { Theme } from "../student/_component/types";

type Props = {
  theme: Theme;
};

const STATUS_STYLES: Record<string, string> = {
  available: "bg-white border-slate-800 text-slate-800",
  completed:
    "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30",
  locked: "bg-white border-slate-300 text-slate-300",
  in_progress:
    "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/30",
};

export default function TutorRoadmapSegment({ theme }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [curricula, setCurricula] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCurriculumId, setSelectedCurriculumId] = useState<string>("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.curriculums.list();
        if (!cancelled) {
          setCurricula(data);
          const params = new URLSearchParams(window.location.search);
          const curriculumFromUrl = params.get("curriculum");
          if (curriculumFromUrl) {
            setSelectedCurriculumId(curriculumFromUrl);
          } else if (data.length > 0) {
            setSelectedCurriculumId(data[0].id);
          }
        }
      } catch (err) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : "Gagal memuat kurikulum");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedCurriculumId) return;
    const params = new URLSearchParams(window.location.search);
    params.set("curriculum", selectedCurriculumId);
    const qs = params.toString();
    router.replace(`${pathname}?${qs}`, { scroll: false });
  }, [selectedCurriculumId, router, pathname]);

  const selectedCurriculum = useMemo(
    () => curricula.find((c) => c.id === selectedCurriculumId),
    [curricula, selectedCurriculumId],
  );

  const units = useMemo(() => {
    if (!selectedCurriculum?.topics) return [];
    return selectedCurriculum.topics.map((topic) => {
      const levels = (topic.tasks ?? [])
        .filter((t: TopicTask) => !t.isCapstone)
        .map((t: TopicTask) => ({
          id: t.code,
          label: t.label,
          url: t.url,
          type: t.type,
          status: "available",
          instructions: t.instructions,
          defaultCode: t.defaultCode,
        }));
      const capstoneTask = topic.tasks?.find((t: TopicTask) => t.isCapstone);
      return {
        id: topic.title.toLowerCase().replace(/\s+/g, "-"),
        title: topic.title,
        topicId: topic.id,
        materialLink: topic.materialLink,
        exampleProjectLink: topic.exampleProjectLink,
        project: {
          name: topic.title,
          projectId: topic.id,
          levels,
          capstone: capstoneTask
            ? {
                id: capstoneTask.code,
                url: capstoneTask.url,
                type: capstoneTask.type,
                status: "available",
                instructions: capstoneTask.instructions,
                defaultCode: capstoneTask.defaultCode,
              }
            : null,
        },
      };
    });
  }, [selectedCurriculum]);

  const openPythonEditor = (url: string, payload: { instructions?: string; defaultCode?: string; title: string; taskCode: string }) => {
    const win = window.open(url, "scratch-tutorial", "width=1200,height=800");
    if (!win) return;

    const initPayload = { type: "python-editor:init" as const, payload };

    const onReady = (e: MessageEvent) => {
      if (e.source !== win) return;
      if (e.data?.type !== "python-editor:ready") return;
      win.postMessage(initPayload, "*");
      window.removeEventListener("message", onReady);
    };
    window.addEventListener("message", onReady);

    setTimeout(() => {
      window.removeEventListener("message", onReady);
      if (!win.closed) win.postMessage(initPayload, "*");
    }, 10000);
  };

  const handleLevelClick = (level: { id: string; label: string; url: string | null; type: "SCRATCH" | "QUIZ" | "PYTHON"; status: string; instructions?: string | null; defaultCode?: string | null }) => {
    if (level.type === "QUIZ") {
      window.open(`/dashboard/student/quiz/${level.id}`, "_blank");
      return;
    }
    if (level.type === "PYTHON" && level.url) {
      openPythonEditor(level.url, {
        instructions: level.instructions ?? undefined,
        defaultCode: level.defaultCode ?? undefined,
        title: level.label,
        taskCode: level.id,
      });
      return;
    }
    if (level.url) {
      window.open(level.url, "_blank");
    }
  };

  const handleCapstoneClick = (capstone: { id: string; url: string | null; type: "SCRATCH" | "QUIZ" | "PYTHON"; status: string; instructions?: string | null; defaultCode?: string | null }) => {
    if (capstone.type === "QUIZ") {
      window.open(`/dashboard/student/quiz/${capstone.id}`, "_blank");
      return;
    }
    if (capstone.type === "PYTHON" && capstone.url) {
      openPythonEditor(capstone.url, {
        instructions: capstone.instructions ?? undefined,
        defaultCode: capstone.defaultCode ?? undefined,
        title: "Capstone",
        taskCode: capstone.id,
      });
      return;
    }
    if (capstone.url) {
      window.open(capstone.url, "_blank");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-600">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        {curricula.length > 1 && (
          <select
            value={selectedCurriculumId}
            onChange={(e) => setSelectedCurriculumId(e.target.value)}
            className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold outline-none focus:border-blue-400 text-slate-600"
          >
            {curricula.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {curricula.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
          <span className="text-5xl">📭</span>
          <h2 className={`mt-4 font-bold ${theme.text}`}>
            Belum ada kurikulum
          </h2>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {units.map((unit) => (
            <UnitSection
              key={unit.id}
              unit={unit}
              onLevelClick={handleLevelClick}
              onCapstoneClick={handleCapstoneClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
