"use client";

import { Roadmap } from "@/components/roadmap";
import type { RoadmapItem } from "@/components/roadmap";
import Card from "./Card";
import type { Theme } from "./types";
import type { Class, Schedule } from "@/lib/api";

type Props = {
  theme: Theme;
  selectedClass: Class | null;
  roadmapItems: RoadmapItem[];
  roadmapSchedules: Schedule[];
  allClasses: Class[];
  selectedClassId: string;
  onSelectClass: (id: string) => void;
  onTopicSelect: (topicId: string) => void;
};

export default function RoadmapTab({ theme, selectedClass, roadmapItems, roadmapSchedules, allClasses, selectedClassId, onSelectClass, onTopicSelect }: Props) {
  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>Roadmap</h1>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>Perjalanan belajar kamu.</p>
        </div>
        {allClasses.length > 1 && (
          <select value={selectedClassId} onChange={(e) => onSelectClass(e.target.value)}
            className="ml-auto rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold outline-none focus:border-blue-400 text-slate-600">
            {allClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>
      {!selectedClass?.curriculum ? (
        <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-5xl mb-4">🗺️</span>
          <h2 className={`font-bold ${theme.text}`}>Belum ada roadmap</h2>
          <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kelas kamu belum memiliki kurikulum.</p>
        </Card>
      ) : roadmapItems.length === 0 ? (
        <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-5xl mb-4">📭</span>
          <h2 className={`font-bold ${theme.text}`}>Kurikulum kosong</h2>
        </Card>
      ) : (
        <Roadmap
          items={roadmapItems}
          animated
          onStepSelect={(item) => !item.locked && onTopicSelect(item.id)}
        />
      )}
    </div>
  );
}
