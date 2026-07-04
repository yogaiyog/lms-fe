"use client";

import { useState } from "react";
import { ChevronLeft, X, TrendingUp, ThumbsUp, ThumbsDown, Save } from "lucide-react";

type Theme = { dark: boolean; bg: string; card: string; border: string; text: string; textMuted: string };

type Aspect = { aspectTitle: string; aspectDescription?: string | null; narrative: string };
type ReportData = {
  student: { nickname: string; fullName: string };
  generatedAt: string;
  selectedCount: number;
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  statusCounts: { PRESENT: number; LATE: number; ABSENT: number; SICK?: number; PERMISSION?: number };
  topics?: string[];
  topStrengths?: Aspect[];
  topWeakness?: Aspect | null;
};

function getGradeColor(pct: number) {
  if (pct >= 80) return "text-emerald-600";
  if (pct >= 60) return "text-amber-600";
  if (pct >= 40) return "text-orange-600";
  return "text-red-600";
}

function SectionCard({ theme, children, className = "" }: { theme: Theme; children: React.ReactNode; className?: string }) {
  return <div className={`rounded-xl p-4 mb-4 ${theme.dark ? "bg-slate-800" : "bg-slate-50"} ${className}`}>{children}</div>;
}

function SectionTitle({ theme, children }: { theme: Theme; children: React.ReactNode }) {
  return <p className={`text-[10px] font-semibold mb-2 ${theme.textMuted}`}>{children}</p>;
}

export default function ReportViewerModal({
  theme, data, title, onBack, onClose, onSave, saving,
}: {
  theme: Theme;
  data: ReportData;
  title: string;
  onBack: () => void;
  onClose: () => void;
  onSave?: (saveTitle: string) => Promise<void>;
  saving?: boolean;
}) {
  const [saveTitle, setSaveTitle] = useState("");
  const total = data.selectedCount;
  const presentPct = total > 0 ? Math.round((data.statusCounts.PRESENT / total) * 100) : 0;
  const latePct = total > 0 ? Math.round((data.statusCounts.LATE / total) * 100) : 0;
  const absentPct = total > 0 ? Math.round((data.statusCounts.ABSENT / total) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-10 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl border ${theme.border} ${theme.card} p-6 shadow-xl mb-10`}>
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className={`flex items-center gap-1.5 text-sm font-bold ${theme.text} hover:opacity-80 transition`}>
            <ChevronLeft size={18} /> Kembali
          </button>
          <button onClick={onClose} className={`rounded-xl p-1.5 ${theme.dark ? "hover:bg-slate-700" : "hover:bg-slate-200"} transition`}>
            <X size={18} className={theme.text} />
          </button>
        </div>

        <h4 className={`text-xl font-bold flex items-center gap-1.5 mb-3 ${theme.text}`}>
            {title}
        </h4>

        <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
          <p className={`mt-1 text-xs ${theme.textMuted}`}>{data.selectedCount} jadwal dipilih · {new Date(data.generatedAt).toLocaleString("id-ID")}</p>
          <div className={`rounded-2xl px-4 py-2 text-right ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
            <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Nilai Akumulasi</p>
            <p className={`text-lg font-extrabold ${getGradeColor(data.scorePercentage)}`}>{Math.round(data.scorePercentage)}%</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 mb-4">
          <SectionCard theme={theme}>
            <SectionTitle theme={theme}>Nama siswa</SectionTitle>
            <p className={`text-sm font-bold ${theme.text}`}>{data.student.nickname}</p>
            <p className={`text-xs ${theme.textMuted}`}>{data.student.fullName}</p>
          </SectionCard>
          <SectionCard theme={theme}>
            <SectionTitle theme={theme}>Total Skor</SectionTitle>
            <p className={`text-sm font-bold ${theme.text}`}>{data.totalScore} / {data.maxScore}</p>
          </SectionCard>
        </div>

        <SectionCard theme={theme}>
          <SectionTitle theme={theme}>Rekap Status Kehadiran</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-extrabold text-emerald-600">{presentPct}%</p>
              <p className="text-[10px] font-semibold text-slate-500">Hadir</p>
              <p className="text-[10px] text-slate-400">({data.statusCounts.PRESENT})</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-amber-600">{latePct}%</p>
              <p className="text-[10px] font-semibold text-slate-500">Terlambat</p>
              <p className="text-[10px] text-slate-400">({data.statusCounts.LATE})</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-red-600">{absentPct}%</p>
              <p className="text-[10px] font-semibold text-slate-500">Tidak Hadir</p>
              <p className="text-[10px] text-slate-400">({data.statusCounts.ABSENT})</p>
            </div>
          </div>
        </SectionCard>

        {data.topics && data.topics.length > 0 && (
          <SectionCard theme={theme}>
            <SectionTitle theme={theme}>{data.student.nickname} telah mempelajari : </SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {data.topics.map((t, i) => (
                <span key={i} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{t}</span>
              ))}
            </div>
          </SectionCard>
        )}

        {data.topStrengths && data.topStrengths.length > 0 && (
          <div className={`rounded-xl p-4 mb-3 ${theme.dark ? "bg-slate-800" : "bg-emerald-50"} border border-emerald-200`}>
            <p className={`text-[10px] font-semibold mb-2 flex items-center gap-1 text-emerald-700`}>
              <ThumbsUp size={12} /> Kelebihan
            </p>
            <div className="space-y-2">
              {data.topStrengths.map((s, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-[10px] font-bold text-emerald-700">{i + 1}</span>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">{s.aspectTitle}</p>
                    <p className="text-[11px] text-emerald-600 italic">{s.narrative}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.topWeakness && (
          <div className={`rounded-xl p-4 mb-4 ${theme.dark ? "bg-slate-800" : "bg-red-50"} border border-red-200`}>
            <p className={`text-[10px] font-semibold mb-2 flex items-center gap-1 text-red-700`}>
              <ThumbsDown size={12} /> Perlu Perhatian
            </p>
            <div className="flex items-start gap-2">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-200 text-[10px] font-bold text-red-700">1</span>
              <div>
                <p className="text-xs font-bold text-red-800">{data.topWeakness.aspectTitle}</p>
                <p className="text-[11px] text-red-600 italic">{data.topWeakness.narrative}</p>
              </div>
            </div>
          </div>
        )}

        {onSave && (
          <div className={`rounded-xl p-4 mb-4 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
            <p className={`text-[10px] font-semibold mb-2 ${theme.textMuted}`}>Simpan Laporan (Akan tampil di dashboard siswa)</p>
            <div className="flex items-center gap-2">
              <input
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                placeholder="Nama laporan..."
                className={`flex-1 px-3 py-2 rounded-lg text-sm ${theme.dark ? "bg-slate-700 text-white" : "bg-white text-black"} border ${theme.border}`}
              />
              <button
                onClick={async () => { if (saveTitle.trim()) { await onSave(saveTitle.trim()); onClose(); } }}
                disabled={!saveTitle.trim() || saving}
                className="shrink-0 rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
