"use client";

import { useEffect } from "react";
import { X, FileText, CheckSquare } from "lucide-react";
import type { Theme, AttendanceWithDetails } from "./types";
import { ATTENDANCE_LABELS } from "./components";

export default function ReportPickerModal({
  theme, attendances, selectedAttendanceIds, savedReports, showSavedReports,
  onToggleAttendance, onGenerateReport, onToggleSavedReports,
  onLoadSavedReport, onDeleteSavedReport, onClose, onFetchSavedReports,
}: {
  theme: Theme;
  attendances: AttendanceWithDetails[];
  selectedAttendanceIds: string[];
  savedReports: any[];
  showSavedReports: boolean;
  onToggleAttendance: (id: string) => void;
  onGenerateReport: () => void;
  onToggleSavedReports: () => void;
  onLoadSavedReport: (report: any) => void;
  onDeleteSavedReport: (id: string) => void;
  onClose: () => void;
  onFetchSavedReports: () => void;
}) {
  useEffect(() => { onFetchSavedReports(); }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-10 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl border ${theme.border} ${theme.card} p-6 shadow-xl mb-10`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`text-sm font-bold flex items-center gap-1.5 ${theme.text}`}>
            <FileText size={14} /> Laporan Siswa
          </h3>
          <button onClick={onClose} className={`rounded-xl p-1.5 ${theme.dark ? "hover:bg-slate-700" : "hover:bg-slate-200"} transition`}>
            <X size={18} className={theme.text} />
          </button>
        </div>

        <div className="mb-4">
          <p className={`text-xs ${theme.textMuted} mb-3`}>
            Pilih satu atau lebih jadwal yang sudah diikuti siswa dan punya penilaian.
          </p>
          <div className="space-y-2 max-h-[65vh] overflow-y-auto mb-3">
            {attendances
              .filter((att) => att.assessment)
              .map((att) => {
                const info = ATTENDANCE_LABELS[att.status] ?? { label: att.status, color: "text-slate-600 bg-slate-100", icon: X };
                const checked = selectedAttendanceIds.includes(att.id);
                return (
                  <label
                    key={att.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-3 transition ${checked ? "border-blue-300 bg-blue-50" : `${theme.border} ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => onToggleAttendance(att.id)} className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm font-bold ${theme.text}`}>
                          {new Date(att.schedule?.date ?? att.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${info.color}`}>
                          <info.icon size={10} /> {info.label}
                        </span>
                      </div>
                      <p className={`text-xs ${theme.textMuted}`}>{att.schedule?.class?.name ?? "Kelas"}</p>
                      {att.schedule?.topic && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 mt-1">
                          {att.schedule.topic}
                        </span>
                      )}
                      <p className={`text-xs mt-1 font-semibold ${theme.text}`}>
                        {att.assessment?.percentage != null ? `${Math.round(att.assessment.percentage)}%` : "Belum ada persentase"}
                      </p>
                    </div>
                  </label>
                );
              })}
          </div>
          <button
            onClick={onGenerateReport}
            disabled={selectedAttendanceIds.length === 0}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckSquare size={16} /> Buat Laporan
          </button>
        </div>

        <button
          onClick={() => { onToggleSavedReports(); if (!showSavedReports) onFetchSavedReports(); }}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold ${theme.dark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-600"} hover:opacity-80 transition`}
        >
          <FileText size={14} /> {showSavedReports ? "Tutup" : "Laporan Tersimpan"} ({savedReports.length})
        </button>

        {showSavedReports && savedReports.length > 0 && (
          <div className="space-y-2 max-h-[30vh] overflow-y-auto mt-3">
            {savedReports.map((r) => (
              <div key={r.id} className={`rounded-xl px-4 py-3 flex items-center justify-between ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                <div className="min-w-0 flex-1 cursor-pointer" onClick={() => onLoadSavedReport(r)}>
                  <p className={`text-sm font-bold ${theme.text}`}>{r.title}</p>
                  <p className={`text-[10px] ${theme.textMuted}`}>
                    {new Date(r.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <button onClick={() => onDeleteSavedReport(r.id)} className="shrink-0 rounded-lg px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 transition">
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}

        {showSavedReports && savedReports.length === 0 && (
          <p className={`text-xs ${theme.textMuted} py-3 text-center`}>Belum ada laporan tersimpan</p>
        )}
      </div>
    </div>
  );
}
