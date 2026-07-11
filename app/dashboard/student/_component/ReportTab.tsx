"use client";

import { useState, useEffect } from "react";
import { FileText, Camera } from "lucide-react";
import Card from "./Card";
import type { Theme } from "./types";
import { api, type Gallery, type SavedReport } from "@/lib/api";
import ReportViewerModal from "../../tutor/_student_segment_component/report-viewer-modal";

const TOPIC_COLORS = ["#22c55e", "#6366f1", "#0ea5e9", "#f59e0b", "#ec4899", "#8b5cf6", "#14b8a6", "#f97316"];

type Props = {
  theme: Theme;
  studentId?: string;
};

export default function ReportTab({ theme, studentId }: Props) {
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [viewing, setViewing] = useState<SavedReport | null>(null);
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [previewImage, setPreviewImage] = useState<Gallery | null>(null);

  useEffect(() => {
    if (!studentId) return;
    api.savedReports.listByStudent(studentId).then((res) => {
      setReports(res ?? []);
    }).catch(() => {});
    api.galleries.listByStudent(studentId).then(setGalleries).catch(() => {});
  }, [studentId]);

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>Laporan & Gallery</h1>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>Laporan hasil belajar dan dokumentasi kegiatan.</p>
        </div>
      </div>

      {reports.length === 0 ? (
        <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-5xl mb-4">📄</span>
          <h3 className={`font-bold ${theme.text}`}>Belum ada laporan</h3>
          <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Tutor akan membuat laporan hasil belajarmu di sini.</p>
        </Card>
      ) : (
        <div className="space-y-2 mb-8">
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

      {galleries.length > 0 && (
        <div className="mt-8">
          <h2 className={`mb-4 flex items-center gap-2 text-lg font-extrabold tracking-tight ${theme.text}`}>
            <Camera size={20} /> Gallery Kegiatan
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleries.map((item, i) => (
              <div key={item.id} onClick={() => setPreviewImage(item)}
                className="group cursor-pointer rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow">
                <img src={item.imageUrl} alt={item.caption ?? ""}
                  className="h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300" />
                {item.caption && (
                  <div className="px-3 py-2.5"
                    style={{ background: `linear-gradient(135deg, ${TOPIC_COLORS[i % TOPIC_COLORS.length]}15, ${TOPIC_COLORS[(i + 1) % TOPIC_COLORS.length]}15)` }}>
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: TOPIC_COLORS[i % TOPIC_COLORS.length] }} />
                      <p className="text-sm font-semibold text-slate-800 truncate">{item.caption}</p>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-3xl w-full rounded-3xl overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <button onClick={async () => {
              try {
                const res = await fetch(previewImage.imageUrl);
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "gallery.jpg";
                a.click();
                URL.revokeObjectURL(url);
              } catch {}
            }}
              className="absolute top-3 right-14 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
            <img src={previewImage.imageUrl} alt={previewImage.caption ?? ""}
              className="w-full max-h-[70vh] object-contain bg-slate-100" />
            {previewImage.caption && (
              <div className="px-5 py-4 border-t border-slate-200">
                <p className="text-sm font-semibold text-slate-900">{previewImage.caption}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {new Date(previewImage.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {viewing && (
        <ReportViewerModal
          theme={theme}
          data={viewing.data}
          title={viewing.title}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}


