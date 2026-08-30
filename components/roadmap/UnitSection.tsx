"use client";

import { useState } from "react";
import { LevelBadge } from "./LevelBadge";

type Level = {
  id: string;
  label: string;
  url: string | null;
  type: "SCRATCH" | "QUIZ" | "PYTHON";
  status: string;
};

type Capstone = {
  id: string;
  url: string | null;
  type: "SCRATCH" | "QUIZ" | "PYTHON";
  status: string;
};

export type Unit = {
  id: string;
  title: string;
  topicId?: string;
  materialLink?: string | null;
  exampleProjectLink?: string | null;
  videoYoutubeUrl?: string | null;
  videoUploadUrl?: string | null;
  project: {
    name: string;
    projectId?: string;
    levels: Level[];
    capstone: Capstone | null;
  };
};

type Props = {
  unit: Unit;
  onLevelClick: (level: Level) => void;
  onCapstoneClick?: (capstone: Capstone) => void;
};

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`h-[18px] w-[18px] transition-transform duration-200 ${
        open ? "" : "-rotate-90"
      }`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function getYouTubeEmbedUrl(url: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed.includes("youtube.com/embed/")) {
    return trimmed;
  }
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) {
    return `https://www.youtube-nocookie.com/embed/${shortMatch[1]}`;
  }
  const longMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?.*v=|v\/|shorts\/))([a-zA-Z0-9_-]+)/);
  if (longMatch) {
    return `https://www.youtube-nocookie.com/embed/${longMatch[1]}`;
  }
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return `https://www.youtube-nocookie.com/embed/${trimmed}`;
  }
  return trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
}

export function UnitSection({ unit, onLevelClick, onCapstoneClick }: Props) {
  const [open, setOpen] = useState(true);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const { project } = unit;

  const hasYoutube = Boolean(unit.videoYoutubeUrl && unit.videoYoutubeUrl.trim());
  const hasUpload = Boolean(unit.videoUploadUrl && unit.videoUploadUrl.trim());
  const hasVideo = hasYoutube || hasUpload;

  const [activeTab, setActiveTab] = useState<"youtube" | "upload">(
    hasYoutube ? "youtube" : "upload",
  );

  const allComplete = project.levels.every((l) => l.status === "completed");

  const ytEmbedUrl = unit.videoYoutubeUrl ? getYouTubeEmbedUrl(unit.videoYoutubeUrl) : null;

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-slate-300">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 bg-slate-800 px-6 py-4 text-left text-white transition-colors hover:bg-slate-700"
      >
        <ChevronIcon open={open} />
        <h2 className="text-lg font-bold">{unit.title}</h2>
      </button>

      {open && (
        <div className="p-6">
          <div className="flex flex-col gap-4">
            <div className="text-sm font-semibold text-slate-600">
              {project.name}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {project.levels.map((level, i) => (
                <div key={level.id} className="flex items-center">
                  <LevelBadge
                    level={level}
                    onClick={() => onLevelClick(level)}
                  />
                  {i < project.levels.length - 1 && (
                    <span
                      className="mx-0.5 h-px w-3 bg-slate-300"
                      aria-hidden="true"
                    />
                  )}
                </div>
              ))}
            </div>

            {project.capstone && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => project.capstone && onCapstoneClick?.(project.capstone)}
                  className={[
                    "rounded-full border px-4 py-1.5 text-sm font-medium transition",
                    project.capstone.status === "completed"
                      ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                      : allComplete
                        ? "border-slate-800 bg-slate-800 text-white hover:bg-slate-700"
                        : "border-slate-300 bg-slate-200 text-slate-400",
                  ].join(" ")}
                >
                  {project.capstone.status === "completed" ? (
                    <svg className="inline h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : null}
                  Capstone Project
                </button>
              </div>
            )}

            {(unit.materialLink || unit.exampleProjectLink || hasVideo) && (
              <div className="flex flex-wrap items-center gap-3 pt-1">
                {unit.materialLink && (
                  <a
                    href={unit.materialLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-blue-300 bg-blue-50 px-4 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 transition shadow-sm"
                  >
                    Buka Materi
                  </a>
                )}
                {unit.exampleProjectLink && (
                  <a
                    href={unit.exampleProjectLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100 transition shadow-sm"
                  >
                    Contoh Project
                  </a>
                )}
                {hasVideo && (
                  <button
                    type="button"
                    onClick={() => setShowVideoModal(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-rose-300 bg-rose-50 px-4 py-1.5 text-sm font-medium text-rose-700 shadow-sm transition hover:bg-rose-100 hover:border-rose-400"
                  >
                    <svg className="h-4 w-4 text-rose-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                    Video Pembahasan
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Video Modal Popup */}
      {showVideoModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="fixed inset-0" onClick={() => setShowVideoModal(false)} />
          <div className="relative z-10 w-full max-w-4xl rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-800">Video Pembahasan</h3>
                  <p className="text-xs text-slate-500">{unit.title}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {hasYoutube && hasUpload && (
                  <div className="flex rounded-xl bg-slate-200 p-1 text-xs font-semibold text-slate-600">
                    <button
                      type="button"
                      onClick={() => setActiveTab("youtube")}
                      className={`rounded-lg px-3 py-1.5 transition ${
                        activeTab === "youtube" ? "bg-white text-rose-600 shadow-sm" : "hover:text-slate-900"
                      }`}
                    >
                      YouTube
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab("upload")}
                      className={`rounded-lg px-3 py-1.5 transition ${
                        activeTab === "upload" ? "bg-white text-blue-600 shadow-sm" : "hover:text-slate-900"
                      }`}
                    >
                      S3 / MinIO
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => setShowVideoModal(false)}
                  className="rounded-xl p-2 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Video Player Body */}
            <div className="p-4 bg-black">
              {(activeTab === "youtube" || (!hasUpload && hasYoutube)) && ytEmbedUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                  <iframe
                    src={ytEmbedUrl}
                    title={`Video ${unit.title}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              )}

              {(activeTab === "upload" || (!hasYoutube && hasUpload)) && unit.videoUploadUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl">
                  <video
                    src={unit.videoUploadUrl}
                    controls
                    autoPlay
                    playsInline
                    preload="auto"
                    className="h-full w-full object-contain"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
