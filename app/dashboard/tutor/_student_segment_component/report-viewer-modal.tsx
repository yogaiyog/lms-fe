"use client";

import { useState } from "react";
import type { LucideIcon } from "lucide-react";
import { ChevronLeft, X, ThumbsUp, Save, CalendarCheck2, Trophy, Percent, Award, CheckCircle2, AlertTriangle, BookOpen, Brain, Code2, Lightbulb, Puzzle, Clock, MessageCircle, FolderCheck, Users, Presentation, TrendingUp, Quote, Star, Palette, PenLine, Ruler, Calculator, Heart, Zap, Target, Eye, Feather, Sparkles, Flame, Droplet, Sun, Moon, Shield, Gem, Key, Search, Compass, Crown, Link, Lock, Map, Settings } from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts";

type Theme = { dark: boolean; bg: string; card: string; border: string; text: string; textMuted: string };

type Aspect = { aspectTitle: string; aspectDescription?: string | null; icon?: string | null; narrative: string };
type AssessmentScoreItem = {
  aspectTitle: string;
  aspectDescription?: string | null;
  icon?: string | null;
  avgScore: number;
  avgMaxScore: number;
  avgPercentage: number;
  count: number;
};
type ReportNote = {
  comment: string;
  date: string;
  tutorName: string;
};
type ReportProjectLink = {
  url: string;
  date: string;
};
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
  assessmentScores?: AssessmentScoreItem[];
  notes?: ReportNote[];
  projectLinks?: ReportProjectLink[];
};

function getGradeBadge(pct: number) {
  if (pct >= 90) return { label: "Excellent", bg: "bg-emerald-100 text-emerald-700" };
  if (pct >= 75) return { label: "Good", bg: "bg-blue-100 text-blue-700" };
  if (pct >= 60) return { label: "Cukup", bg: "bg-amber-100 text-amber-700" };
  return { label: "Perlu Bimbingan", bg: "bg-red-100 text-red-700" };
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const scoreColor = (pct: number) => {
  if (pct >= 80) return { bar: "#22C55E", bg: "#DCFCE7", text: "#15803D" };
  if (pct >= 60) return { bar: "#3B82F6", bg: "#DBEAFE", text: "#1D4ED8" };
  if (pct >= 40) return { bar: "#EAB308", bg: "#FEF9C3", text: "#A16207" };
  if (pct >= 20) return { bar: "#F97316", bg: "#FFEDD5", text: "#C2410C" };
  return { bar: "#EF4444", bg: "#FEE2E2", text: "#B91C1C" };
};

const BUILTIN_ICON_MAP: Record<string, LucideIcon> = {
  Star, Trophy, Award, Brain, Lightbulb, Code2, Puzzle, Clock,
  MessageCircle, FolderCheck, Users, Presentation, TrendingUp,
  Palette, PenLine, Ruler, Calculator, Heart, Zap, Target, Eye,
  Feather, Sparkles, Flame, Droplet, Sun, Moon, Shield, BookOpen,
  Compass, Crown, Gem, Key, Link, Lock, Map, Search, Settings,
};

function hashSeed(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

const FALLBACK_ICONS = Object.values(BUILTIN_ICON_MAP).filter((v, i, a) => a.indexOf(v) === i);

function resolveIcon(iconName?: string | null, seed?: string): LucideIcon {
  if (iconName && BUILTIN_ICON_MAP[iconName]) return BUILTIN_ICON_MAP[iconName];
  if (seed) return FALLBACK_ICONS[hashSeed(seed) % FALLBACK_ICONS.length];
  return Brain;
}

export default function ReportViewerModal({
  theme, data, title, onBack, onClose, onSave, saving,
}: {
  theme: Theme;
  data: ReportData;
  title: string;
  onBack?: () => void;
  onClose: () => void;
  onSave?: (saveTitle: string) => Promise<void>;
  saving?: boolean;
}) {
  const [saveTitle, setSaveTitle] = useState("");
  const total = data.selectedCount;
  const presentPct = total > 0 ? Math.round((data.statusCounts.PRESENT / total) * 100) : 0;
  const latePct = total > 0 ? Math.round((data.statusCounts.LATE / total) * 100) : 0;
  const absentPct = total > 0 ? Math.round((data.statusCounts.ABSENT / total) * 100) : 0;
  const badge = getGradeBadge(data.scorePercentage);

  const cardCls = `${theme.card} border ${theme.border} rounded-2xl shadow-sm`;
  const textCls = theme.text;
  const mutedCls = theme.textMuted;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 pt-10">
      <div className={`relative w-full max-w-2xl rounded-3xl border ${theme.border} ${theme.card} shadow-xl mb-10`}>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          {onBack ? (
            <button onClick={onBack} className={`flex items-center gap-1.5 text-sm font-bold ${textCls} transition hover:opacity-80`}>
              <ChevronLeft size={18} /> Kembali
            </button>
          ) : <div />}
          <button onClick={onClose} className={`rounded-xl p-1.5 transition ${theme.dark ? "hover:bg-slate-700" : "hover:bg-slate-200"}`}>
            <X size={18} className={textCls} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">

          {/* Student Header Card */}
          <div className={`${cardCls} p-5`}>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-400 text-base font-bold text-white shadow-sm shadow-blue-500/30">
                  {initials(data.student.fullName)}
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${textCls}`}>{data.student.nickname}</h2>
                  <p className={`text-xs ${mutedCls}`}>{data.student.fullName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <CalendarCheck2 size={12} /> {new Date(data.generatedAt).toLocaleString("id-ID")}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400">
                      <BookOpen size={12} /> {data.selectedCount} jadwal
                    </span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${badge.bg}`}>
                <Award size={13} /> {badge.label}
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Nilai Akumulasi", value: `${Math.round(data.scorePercentage)}%`, icon: Percent, tint: "#22C55E" },
              { label: "Total Skor", value: `${data.totalScore} / ${data.maxScore}`, icon: Trophy, tint: "#3B82F6" },
              { label: "Tepat Waktu", value: `${data.statusCounts.PRESENT} / ${total}`, icon: CheckCircle2, tint: "#EAB308" },
            ].map((c) => (
              <div key={c.label} className={`${cardCls} p-4 text-center`}>
                <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: `${c.tint}1A` }}>
                  <c.icon size={16} color={c.tint} />
                </div>
                <p className={`text-lg font-extrabold ${textCls}`}>{c.value}</p>
                <p className={`text-[10px] font-semibold ${mutedCls}`}>{c.label}</p>
              </div>
            ))}
          </div>

          {/* Attendance Breakdown */}
          <div className={`${cardCls} p-5`}>
            <h3 className={`mb-3 flex items-center gap-1.5 text-sm font-bold ${textCls}`}>
              <CalendarCheck2 size={15} /> Rekap Kehadiran
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Tepat Waktu", pct: presentPct, count: data.statusCounts.PRESENT, bar: "#22C55E", textCls: "text-emerald-600" },
                { label: "Terlambat", pct: latePct, count: data.statusCounts.LATE, bar: "#EAB308", textCls: "text-amber-600" },
                { label: "Tidak Hadir", pct: absentPct, count: data.statusCounts.ABSENT, bar: "#EF4444", textCls: "text-red-600" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className={`text-lg font-extrabold ${s.textCls}`}>{s.pct}%</p>
                  <p className="text-[10px] font-semibold text-slate-500">{s.label}</p>
                  <p className="mb-1.5 text-[10px] text-slate-400">({s.count})</p>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.pct}%`, background: s.bar }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Topics Learned */}
          {data.topics && data.topics.length > 0 && (
            <div className={`${cardCls} p-5`}>
              <h3 className={`mb-3 flex items-center gap-1.5 text-sm font-bold ${textCls}`}>
                <BookOpen size={15} /> Materi yang dipelajari
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {data.topics.map((t, i) => (
                  <span key={i} className="inline-flex items-center rounded-lg bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}

      

          {/* Performance Assessment */}
          {data.assessmentScores && data.assessmentScores.length > 0 && (
            <div className={`${cardCls} p-5`}>
              <div className="mb-2 flex items-center justify-between">
                <h3 className={`flex items-center gap-1.5 text-sm font-bold ${textCls}`}>
                  <TrendingUp size={15} /> Performance Assessment
                </h3>
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                  data.scorePercentage >= 80 ? "bg-emerald-100 text-emerald-700" :
                  data.scorePercentage >= 60 ? "bg-blue-100 text-blue-700" :
                  "bg-amber-100 text-amber-700"
                }`}>
                  Rata-rata {Math.round(data.scorePercentage)}%
                </span>
              </div>

              {/* Radar Chart */}
              <div className="mb-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={data.assessmentScores.map((s) => ({ subject: s.aspectTitle, value: Math.round(s.avgScore * 10) / 10 }))} outerRadius="72%">
                    <PolarGrid stroke="#E2E8F0" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748B", fontSize: 11 }} />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fill: "#64748B", fontSize: 10 }} tickCount={6} />
                    <Radar name="Nilai" dataKey="value" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Score Bars */}
              <div className="space-y-3">
                {data.assessmentScores.map((s) => {
                  const c = scoreColor(s.avgPercentage);
                  const Icon = resolveIcon(s.icon, s.aspectTitle);
                  return (
                    <div key={s.aspectTitle}>
                      <div className="mb-1.5 flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ background: c.bg }}>
                          <Icon size={15} color={c.text} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className={`text-xs font-bold ${textCls}`}>{s.aspectTitle}</span>
                            <span className="text-xs font-bold" style={{ color: c.text }}>
                              {s.count > 1 ? Math.round(s.avgScore * 10) / 10 : s.avgScore} / {Math.round(s.avgMaxScore)}
                              {s.count > 1 && <span className="ml-1 font-normal text-slate-400">(rata-rata)</span>}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${s.avgPercentage}%`, background: c.bar }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <p className={`mt-3 text-[11px] ${mutedCls}`}>
                Berdasarkan {data.assessmentScores.reduce((sum, s) => Math.max(sum, s.count), 0)} penilaian dari {data.selectedCount} pertemuan
              </p>
            </div>
          )}

              {/* Strengths */}
          {data.topStrengths && data.topStrengths.length > 0 && (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-emerald-700">
                <ThumbsUp size={15} /> Kelebihan
              </h3>
              <div className="space-y-2.5">
                {data.topStrengths.map((s, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-200 text-[10px] font-bold text-emerald-700">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs font-bold text-emerald-800">{s.aspectTitle}</p>
                      {s.narrative && <p className="text-[11px] italic text-emerald-600">{s.narrative}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weakness */}
          {data.topWeakness && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-bold text-red-700">
                <AlertTriangle size={15} /> Perlu Perhatian
              </h3>
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-200 text-[10px] font-bold text-red-700">1</span>
                <div>
                  <p className="text-xs font-bold text-red-800">{data.topWeakness.aspectTitle}</p>
                  {data.topWeakness.narrative && <p className="text-[11px] italic text-red-600">{data.topWeakness.narrative}</p>}
                </div>
              </div>
            </div>
          )}

          {/* Catatan Tutor */}
          {data.notes && data.notes.length > 0 && (
            <div className={`${cardCls} relative overflow-hidden p-5`}>
              <Quote size={72} color="#3B82F6" className="absolute left-4 top-2 opacity-10" />
              <h3 className={`mb-4 flex items-center gap-1.5 text-sm font-bold ${textCls}`}>
                <MessageCircle size={15} /> Catatan Tutor
              </h3>
              <div className="space-y-4">
                {data.notes!.map((n, i: number) => (
                  <div key={i} className="relative z-10">
                    <p className={`text-sm leading-relaxed italic ${textCls}`}>
                      &quot;{n.comment}&quot;
                    </p>
                    <div className="mt-3 flex items-center gap-2.5">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-[10px] font-bold text-white">
                        {initials(n.tutorName)}
                      </div>
                      <div>
                        <span className={`text-xs font-semibold ${textCls}`}>{n.tutorName}</span>
                        <span className={`ml-2 text-[10px] ${mutedCls}`}>
                          {new Date(n.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                    </div>
                    {i < data.notes!.length - 1 && <div className="my-3 border-t border-slate-200" />}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Project Links */}
          {data.projectLinks && data.projectLinks.length > 0 && (
            <div className={`${cardCls} p-5`}>
              <h3 className={`mb-3 flex items-center gap-1.5 text-sm font-bold ${textCls}`}>
                <FolderCheck size={15} /> Project Link
              </h3>
              <div className="space-y-2">
                {data.projectLinks.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                      <Presentation size={15} className="text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate text-xs font-semibold text-blue-600 underline-offset-2 hover:underline"
                      >
                        {p.url}
                      </a>
                      <span className={`text-[10px] ${mutedCls}`}>
                        {new Date(p.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Save Report */}
          {onSave && (
            <div className={`${cardCls} p-5`}>
              <h3 className={`mb-3 flex items-center gap-1.5 text-sm font-bold ${textCls}`}>
                <Save size={15} /> Simpan Laporan
              </h3>
              <p className={`mb-3 text-[11px] ${mutedCls}`}>Laporan akan tampil di dashboard siswa</p>
              <div className="flex items-center gap-2">
                <input
                  value={saveTitle}
                  onChange={(e) => setSaveTitle(e.target.value)}
                  placeholder="Nama laporan..."
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm outline-none transition focus:border-blue-400 ${
                    theme.dark ? "border-slate-600 bg-slate-800 text-white" : "border-slate-200 bg-white text-slate-900"
                  }`}
                />
                <button
                  onClick={async () => { if (saveTitle.trim()) { await onSave(saveTitle.trim()); onClose(); } }}
                  disabled={!saveTitle.trim() || saving}
                  className="shrink-0 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
