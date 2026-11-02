"use client";

import { EmptyState } from "@/components/ui";
import { Inbox, Map as MapIcon } from "lucide-react";
import { Roadmap } from "@/components/roadmap";
import type { RoadmapItem } from "@/components/roadmap";
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
            className={`ml-auto rounded-xl border ${theme.border} ${theme.card} px-4 py-2 text-xs font-semibold outline-none focus:border-primary-400 ${theme.text}`}>
            {allClasses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        )}
      </div>
      {!selectedClass?.curriculum ? (
        <EmptyState
          icon={MapIcon}
          title="Belum ada roadmap"
          description="Kelas kamu belum memiliki kurikulum."
        />
      ) : roadmapItems.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Kurikulum kosong"
        />
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
