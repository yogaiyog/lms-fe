"use client";

import { useState, useMemo } from "react";
import { type Class, type StudentProfile, type Schedule } from "@/lib/api";
import { CATEGORY_LABELS, CLASS_TYPE_LABELS, DAY_LABELS } from "../../constants";
import { X } from "lucide-react";

type Props = {
  detailClass: Class;
  detailClassName: string;
  onDetailClassNameChange: (v: string) => void;
  detailTutorId: string;
  onDetailTutorIdChange: (v: string) => void;
  detailStudents: StudentProfile[];
  detailStudentMap: Record<string, StudentProfile>;
  detailSaving: boolean;
  detailError: string;
  detailAddingStudentId: string;
  onDetailAddingStudentIdChange: (v: string) => void;
  tutors: { id: string; fullName: string }[];
  pendingRemovals: Set<string>;
  onToggleRemoval: (enrollmentId: string) => void;
  onClose: () => void;
  onSave: () => void;
  onAddStudent: () => void;
  onReschedule: (scheduleId: string, newDate: string) => void;
  onShiftSchedule: (scheduleId: string) => void;
  onUpdateScheduleTime: (scheduleId: string, startTime: string, endTime: string) => void;
};

export default function ClassDetailModal({
  detailClass, detailClassName, onDetailClassNameChange,
  detailTutorId, onDetailTutorIdChange,
  detailStudents, detailStudentMap,
  detailSaving, detailError,
  detailAddingStudentId, onDetailAddingStudentIdChange,
  tutors, pendingRemovals, onToggleRemoval,
  onClose, onSave, onAddStudent, onReschedule, onShiftSchedule, onUpdateScheduleTime,
}: Props) {
  const [shiftConfirmId, setShiftConfirmId] = useState<string | null>(null);

  const shiftPreview = useMemo(() => {
    if (!shiftConfirmId) return [] as { id: string; oldDate: string; newDate: string; topic: string | null }[];
    const sorted = [...(detailClass.schedules ?? [])].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const idx = sorted.findIndex((s) => s.id === shiftConfirmId);
    if (idx === -1) return [];
    return sorted.slice(idx).map((s) => {
      const d = new Date(s.date);
      d.setDate(d.getDate() + 7);
      return {
        id: s.id,
        oldDate: new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        newDate: d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
        topic: s.topic,
      };
    });
  }, [shiftConfirmId, detailClass.schedules]);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl border border-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Detail Kelas</h2>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 grid grid-cols-4 gap-3 text-xs text-slate-500">
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block font-semibold text-slate-700">Tipe</span>
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold ${
              detailClass.type === "PRIVATE" ? "bg-purple-100 text-purple-700"
              : detailClass.type === "MAKEUP" ? "bg-amber-100 text-amber-700"
              : "bg-blue-100 text-blue-700"
            }`}>
              {CLASS_TYPE_LABELS[detailClass.type] ?? detailClass.type}
            </span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block font-semibold text-slate-700">Kategori</span>
            {CATEGORY_LABELS[detailClass.category] ?? detailClass.category}
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block font-semibold text-slate-700">Batch</span>
            Batch {detailClass.batch}
          </div>
          <div className="rounded-xl bg-slate-50 p-3">
            <span className="block font-semibold text-slate-700">Mulai</span>
            {new Date(detailClass.startDate).toLocaleDateString("id-ID")}
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama Kelas</label>
          <input value={detailClassName} onChange={(e) => onDetailClassNameChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tutor</label>
          <select value={detailTutorId} onChange={(e) => onDetailTutorIdChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            {tutors.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Siswa ({detailClass.enrollments?.length ?? 0})
          </label>
          <div className="max-h-40 overflow-y-auto rounded-xl border border-slate-200">
            {(detailClass.enrollments ?? []).length === 0 ? (
              <div className="p-3 text-center text-sm text-slate-400">Belum ada siswa</div>
            ) : (
              detailClass.enrollments!.map((e) => {
                const marked = pendingRemovals.has(e.id);
                return (
                  <div key={e.id} className={`flex items-center justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-0 ${marked ? "opacity-40" : ""}`}>
                    <span className={`text-slate-700 ${marked ? "line-through" : ""}`}>
                      {detailStudentMap[e.studentId]?.fullName ?? e.studentId}
                    </span>
                    <button onClick={() => onToggleRemoval(e.id)} disabled={detailSaving}
                      className={`rounded-xl p-1.5 transition disabled:opacity-30 ${
                        marked
                          ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                          : "text-slate-400 hover:bg-red-50 hover:text-red-600"
                      }`}
                      title={marked ? "Batalkan" : "Hapus"}
                    >
                      {marked ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {detailClass.type !== "MAKEUP" && (
          <div className="mb-4">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Tambah Siswa
              {detailClass.type === "PRIVATE" && (detailClass.enrollments ?? []).length >= 1 && (
                <span className="ml-1 text-xs font-normal text-purple-600">(Private — maks 1)</span>
              )}
            </label>
            {detailClass.type === "PRIVATE" && (detailClass.enrollments ?? []).length >= 1 ? (
              <p className="rounded-xl bg-purple-50 px-4 py-3 text-sm text-purple-700">Kelas Private sudah memiliki 1 siswa.</p>
            ) : (<>
              <div className="flex gap-2">
                <select value={detailAddingStudentId} onChange={(e) => onDetailAddingStudentIdChange(e.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Pilih siswa --</option>
                  {detailStudents.map((s) => (
                    <option key={s.id} value={s.id}>{s.fullName} ({s.user?.email ?? "-"})</option>
                  ))}
                </select>
                <button onClick={onAddStudent} disabled={!detailAddingStudentId || detailSaving}
                  className="rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {detailSaving ? "..." : "+"}
                </button>
              </div>
              {detailStudents.length === 0 && (detailClass.schedules ?? []).length > 0 && (
                <p className="mt-1 text-[10px] text-slate-400">Semua siswa kategori ini sudah memiliki jadwal bentrok atau sudah terdaftar</p>
              )}
            </>)}
          </div>
        )}

        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            Jadwal ({detailClass.schedules?.length ?? 0})
          </label>
          <div className="max-h-60 overflow-y-auto rounded-xl border border-slate-200">
            {(detailClass.schedules ?? []).length === 0 ? (
              <div className="p-3 text-center text-sm text-slate-400">Belum ada jadwal</div>
            ) : (
              <div className="divide-y divide-slate-100">
                {detailClass.schedules!.map((s) => {
                  const sDate = s.date ? new Date(s.date).toLocaleDateString("sv-SE") : "";
                  const formattedDate = s.date
                    ? new Date(s.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
                    : "";
                  return (
                    <div key={s.id} className={`flex items-center justify-between gap-2 px-3 py-2 text-sm ${s.isDone ? "bg-emerald-50/50" : ""}`}>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span>{formattedDate}</span>
                          {s.isDone && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Selesai
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span className={`font-semibold ${s.isDone ? "text-slate-400" : "text-slate-700"}`}>
                            {s.date ? new Date(s.date).toLocaleDateString("id-ID", { weekday: "long" }) : ""}
                          </span>
                          {s.isDone ? (
                            <span className={`font-semibold ${s.isDone ? "text-slate-400" : "text-slate-700"}`}>
                              {s.startTime}-{s.endTime}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <input type="time" defaultValue={s.startTime}
                                onBlur={(e) => {
                                  if (e.target.value !== s.startTime) onUpdateScheduleTime(s.id, e.target.value, s.endTime);
                                }}
                                className="w-16 rounded border border-slate-200 px-1 py-0.5 text-[10px] outline-none focus:border-blue-400"
                              />
                              <span>–</span>
                              <input type="time" defaultValue={s.endTime}
                                onBlur={(e) => {
                                  if (e.target.value !== s.endTime) onUpdateScheduleTime(s.id, s.startTime, e.target.value);
                                }}
                                className="w-16 rounded border border-slate-200 px-1 py-0.5 text-[10px] outline-none focus:border-blue-400"
                              />
                            </span>
                          )}
                          <span className="text-slate-300">•</span>
                          <span>{s.topic ?? "—"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <input type="date" value={sDate}
                          onChange={(e) => onReschedule(s.id, e.target.value)}
                          className={`w-32 rounded-lg border px-2 py-1 text-xs outline-none transition focus:border-blue-400 ${
                            s.isDone
                              ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                              : "border-slate-200 bg-slate-50"
                          }`}
                        />
                        {!s.isDone && (
                          <button onClick={() => setShiftConfirmId(s.id)} title="Geser jadwal +7 hari"
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-amber-50 hover:text-amber-600"
                          >
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {detailError && <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{detailError}</div>}
        <button onClick={onSave} disabled={detailSaving}
          className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {detailSaving ? <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Menyimpan...</span> : "Simpan Perubahan"}
        </button>
      </div>

      {shiftConfirmId && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShiftConfirmId(null)} />
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
            <h3 className="mb-3 text-base font-extrabold text-slate-900">Konfirmasi Geser Jadwal</h3>
            <p className="mb-3 text-sm text-slate-600">
              Semua jadwal berikut akan digeser <strong>+7 hari</strong>:
            </p>
            <div className="mb-4 max-h-48 overflow-y-auto rounded-xl border border-slate-200 text-xs">
              {shiftPreview.map((item, i) => (
                <div key={item.id} className={`flex items-center justify-between gap-2 px-3 py-2 ${i > 0 ? "border-t border-slate-100" : ""}`}>
                  <span className="font-medium text-slate-700">{item.topic ?? "—"}</span>
                  <span className="text-slate-500">
                    <span className="line-through">{item.oldDate}</span>
                    <span className="mx-1">→</span>
                    <span className="font-semibold text-amber-600">{item.newDate}</span>
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShiftConfirmId(null)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Batal
              </button>
              <button onClick={() => { onShiftSchedule(shiftConfirmId); setShiftConfirmId(null); }}
                className="flex-1 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-amber-500/30 transition hover:bg-amber-600"
              >
                Ya, Geser
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
