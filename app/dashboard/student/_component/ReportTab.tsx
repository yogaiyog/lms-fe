"use client";

import { useState, useEffect } from "react";
import { FileText } from "lucide-react";
import Card from "./Card";
import type { Theme } from "./types";
import { api } from "@/lib/api";
import ReportViewerModal from "../../tutor/_student_segment_component/report-viewer-modal";

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


