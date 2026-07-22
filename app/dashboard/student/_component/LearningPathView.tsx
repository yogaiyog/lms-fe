"use client";

import { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { api, type TopicTask } from "@/lib/api";
import { UnitSection } from "@/components/roadmap";
import { useProgressTracker } from "@/hooks/useProgressTracker";
import type { Theme } from "./types";

type Props = {
  theme: Theme;
  studentId: string;
  selectedTopicId?: string | null;
  onBack: () => void;
};

function mapCurriculumToUnits(
  data: Awaited<ReturnType<typeof api.roadmap.fetchScratchFundamental>>,
  getTaskStatus: (taskId: string) => string,
) {
  if (!data?.curriculum?.topics) return [];
  return data.curriculum.topics.map((topic) => {
    const levels = (topic.tasks ?? [])
      .filter((t: TopicTask) => !t.isCapstone)
      .map((t: TopicTask) => ({
        id: t.code,
        label: t.label,
        url: t.url,
        status: getTaskStatus(t.code),
      }));
    const capstoneTask = topic.tasks?.find((t: TopicTask) => t.isCapstone);
    return {
      id: topic.title.toLowerCase().replace(/\s+/g, "-"),
      title: topic.title,
      topicId: topic.id,
      project: {
        name: topic.title,
        projectId: topic.id,
        levels,
        capstone: capstoneTask
          ? {
              id: capstoneTask.code,
              url: capstoneTask.url,
              status: getTaskStatus(capstoneTask.code),
            }
          : null,
      },
    };
  });
}

export default function LearningPathView({
  theme,
  studentId,
  selectedTopicId,
  onBack,
}: Props) {
  const [rawData, setRawData] = useState<Awaited<
    ReturnType<typeof api.roadmap.fetchScratchFundamental>
  > | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { openTutorial, getTaskStatus, setTaskStatus, loaded } =
    useProgressTracker(studentId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.roadmap.fetchScratchFundamental(studentId);
        if (!cancelled) setRawData(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Gagal memuat kurikulum",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [studentId]);

  const units = useMemo(
    () => (rawData ? mapCurriculumToUnits(rawData, getTaskStatus) : []),
    [rawData, getTaskStatus],
  );

  const filteredUnits = useMemo(
    () =>
      selectedTopicId
        ? units.filter((u) => u.topicId === selectedTopicId)
        : units,
    [units, selectedTopicId],
  );

  const handleLevelClick = (level: { id: string; label: string; url: string; status: string }) => {
    if (level.status === "completed") {
      window.open(level.url, "_blank");
      return;
    }
    const unit = units.find((u) =>
      u.project.levels.some((l) => l.id === level.id),
    );
    openTutorial(level.url, unit?.project.projectId ?? "", level.id);
  };

  const handleCapstoneClick = (capstone: { id: string; url: string; status: string }) => {
    window.open(capstone.url, "_blank");
    if (capstone.status !== "completed") {
      setTaskStatus(capstone.id, "completed");
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-colors ${
            theme.dark
              ? "text-slate-300 hover:bg-slate-800"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>
            Learning Path
          </h1>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>
            Selesaikan tutorial Scratch untuk naik ke level berikutnya.
          </p>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-600">
          Gagal memuat kurikulum: {error}
        </div>
      )}

      {!loading && !error && (
        <div className="flex flex-col gap-6">
          {!loaded && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-center text-sm text-slate-500">
              Memuat progress...
            </div>
          )}
          {filteredUnits.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 p-12 text-center">
              <span className="text-5xl">📭</span>
              <h2 className={`mt-4 font-bold ${theme.text}`}>
                Belum ada unit tersedia
              </h2>
            </div>
          ) : (
            filteredUnits.map((unit) => (
              <UnitSection
                key={unit.id}
                unit={unit}
                onLevelClick={handleLevelClick}
                onCapstoneClick={handleCapstoneClick}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
