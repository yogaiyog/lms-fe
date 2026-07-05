"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import Card from "./Card";
import type { Theme } from "./types";
import { api } from "@/lib/api";

type Props = {
  theme: Theme;
  studentId?: string;
};

export default function ReportTab({ theme, studentId }: Props) {
  const [reports, setReports] = useState<any[]>([]);
  const [viewing, setViewing] = useState<any | null>(null);

  useEffect(() => {
    if (!studentId) return;
    api.savedReports.listByStudent(studentId).then((res) => {
      setReports(res ?? []);
    }).catch(() => {});
  }, [studentId]);

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>Laporan</h1>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>Laporan hasil belajar dari tutor.</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-5xl mb-4">📄</span>
          <h3 className={`font-bold ${theme.text}`}>Belum ada laporan</h3>
          <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Tutor akan membuat laporan hasil belajarmu di sini.</p>
        </Card>
      ) : (
        <div className="space-y-2">
          {reports.map((report) => (
            <div key={report.id}
              className={`rounded-2xl border ${theme.border} ${theme.card} px-4 py-3 flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100">
                  <FileText size={18} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <p className={`text-sm font-semibold ${theme.text}`}>{report.title}</p>
                  <p className={`text-xs ${theme.textMuted}`}>
                    {new Date(report.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setViewing(report)}
                className="shrink-0 rounded-xl bg-blue-100 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-200 transition-colors">
                Lihat
              </button>
            </div>
          ))}
        </div>
      )}

      {viewing && <ReportViewer theme={theme} report={viewing} onClose={() => setViewing(null)} />}
    </div>
  );
}

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

function ReportViewer({ theme, report, onClose }: { theme: Theme; report: any; onClose: () => void }) {
  const data = report.data;
  if (!data) return null;
  const total = data.selectedCount ?? 0;
  const presentPct = total > 0 ? Math.round((data.statusCounts?.PRESENT ?? 0) / total * 100) : 0;
  const latePct = total > 0 ? Math.round((data.statusCounts?.LATE ?? 0) / total * 100) : 0;
  const absentPct = total > 0 ? Math.round((data.statusCounts?.ABSENT ?? 0) / total * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-10 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl border ${theme.border} ${theme.card} p-6 shadow-xl mb-10`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-xl font-bold ${theme.text}`}>{report.title}</h2>
          <button onClick={onClose} className={`rounded-xl p-1.5 ${theme.dark ? "hover:bg-slate-700" : "hover:bg-slate-200"} transition`}>
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

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
            <p className={`text-sm font-bold ${theme.text}`}>{data.student?.nickname ?? "-"}</p>
            <p className={`text-xs ${theme.textMuted}`}>{data.student?.fullName ?? ""}</p>
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
              <p className="text-[10px] text-slate-400">({data.statusCounts?.PRESENT ?? 0})</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-amber-600">{latePct}%</p>
              <p className="text-[10px] font-semibold text-slate-500">Terlambat</p>
              <p className="text-[10px] text-slate-400">({data.statusCounts?.LATE ?? 0})</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-extrabold text-red-600">{absentPct}%</p>
              <p className="text-[10px] font-semibold text-slate-500">Tidak Hadir</p>
              <p className="text-[10px] text-slate-400">({data.statusCounts?.ABSENT ?? 0})</p>
            </div>
          </div>
        </SectionCard>

        {data.topics && data.topics.length > 0 && (
          <SectionCard theme={theme}>
            <SectionTitle theme={theme}>{data.student?.nickname ?? "Siswa"} telah mempelajari :</SectionTitle>
            <div className="flex flex-wrap gap-1.5">
              {data.topics.map((t: string, i: number) => (
                <span key={i} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-700">{t}</span>
              ))}
            </div>
          </SectionCard>
        )}

        {data.topStrengths && data.topStrengths.length > 0 && (
          <div className={`rounded-xl p-4 mb-3 ${theme.dark ? "bg-slate-800" : "bg-emerald-50"} border border-emerald-200`}>
            <p className={`text-[10px] font-semibold mb-2 flex items-center gap-1 text-emerald-700`}>
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" /></svg>
              Kelebihan
            </p>
            <div className="space-y-2">
              {data.topStrengths.map((s: any, i: number) => (
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
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.715.211-1.413.608-2.008L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" /></svg>
              Perlu Perhatian
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
      </div>
    </div>
  );
}
