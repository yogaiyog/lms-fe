"use client";

import { useState } from "react";
import { LevelBadge } from "./LevelBadge";

type Level = {
  id: string;
  label: string;
  url: string | null;
  type: "SCRATCH" | "QUIZ";
  status: string;
};

type Capstone = {
  id: string;
  url: string | null;
  type: "SCRATCH" | "QUIZ";
  status: string;
};

export type Unit = {
  id: string;
  title: string;
  topicId?: string;
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

export function UnitSection({ unit, onLevelClick, onCapstoneClick }: Props) {
  const [open, setOpen] = useState(true);
  const { project } = unit;

  const allComplete = project.levels.every((l) => l.status === "completed");

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 bg-slate-800 px-6 py-4 text-left text-white transition-colors hover:bg-slate-700"
      >
        <ChevronIcon open={open} />
        <h2 className="text-lg font-bold">{unit.title}</h2>
      </button>

      {open && (
        <div className="px-6 py-4">
          <div className="mb-3 text-sm font-semibold text-slate-600">
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
            <div className="mt-4">
              <button
                type="button"
                onClick={() => project.capstone && onCapstoneClick?.(project.capstone)}
                className={[
                  "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700",
                  project.capstone.status === "completed"
                    ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/30"
                    : allComplete
                      ? "bg-slate-800 text-white hover:bg-slate-700"
                      : "bg-slate-200 text-slate-400",
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
        </div>
      )}
    </section>
  );
}
