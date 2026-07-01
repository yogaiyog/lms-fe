"use client";

import { type Class, type StudentProfile } from "@/lib/api";
import { CATEGORY_LABELS, DAY_LABELS } from "../../constants";

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
};

export default function ClassDetailModal({
  detailClass, detailClassName, onDetailClassNameChange,
  detailTutorId, onDetailTutorIdChange,
  detailStudents, detailStudentMap,
  detailSaving, detailError,
  detailAddingStudentId, onDetailAddingStudentIdChange,
  tutors, pendingRemovals, onToggleRemoval,
  onClose, onSave, onAddStudent, onReschedule,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">Detail Kelas</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4 grid grid-cols-3 gap-3 text-xs text-gray-500">
          <div className="rounded-lg bg-gray-50 p-2">
            <span className="block font-medium text-gray-700">Kategori</span>
            {CATEGORY_LABELS[detailClass.category] ?? detailClass.category}
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <span className="block font-medium text-gray-700">Batch</span>
            Batch {detailClass.batch}
          </div>
          <div className="rounded-lg bg-gray-50 p-2">
            <span className="block font-medium text-gray-700">Mulai</span>
            {detailClass.startDate ? new Date(detailClass.startDate).toLocaleDateString("id-ID") : "—"}
          </div>
        </div>

        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Kelas</label>
          <input value={detailClassName} onChange={(e) => onDetailClassNameChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400" />
        </div>

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Tutor</label>
          <select value={detailTutorId} onChange={(e) => onDetailTutorIdChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400"
          >
            {tutors.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
          </select>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Siswa ({detailClass.enrollments?.length ?? 0})
          </label>
          <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200">
            {(detailClass.enrollments ?? []).length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-400">Belum ada siswa</div>
            ) : (
              detailClass.enrollments!.map((e) => {
                const marked = pendingRemovals.has(e.id);
                return (
                  <div key={e.id} className={`flex items-center justify-between border-b border-gray-100 px-3 py-2 text-sm last:border-0 ${marked ? "opacity-40" : ""}`}>
                    <span className={`text-gray-700 ${marked ? "line-through" : ""}`}>
                      {detailStudentMap[e.studentId]?.fullName ?? e.studentId}
                    </span>
                    <button onClick={() => onToggleRemoval(e.id)} disabled={detailSaving}
                      className={`rounded-lg p-1 transition disabled:opacity-30 ${
                        marked
                          ? "bg-tea-green-50 text-tea-green-600 hover:bg-tea-green-100"
                          : "text-gray-400 hover:bg-berry-lipstick-50 hover:text-berry-lipstick-600"
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

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Tambah Siswa</label>
          <div className="flex gap-2">
            <select value={detailAddingStudentId} onChange={(e) => onDetailAddingStudentIdChange(e.target.value)}
              className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400"
            >
              <option value="">-- Pilih siswa --</option>
              {detailStudents.map((s) => (
                <option key={s.id} value={s.id}>{s.fullName} ({s.user?.email ?? "-"})</option>
              ))}
            </select>
            <button onClick={onAddStudent} disabled={!detailAddingStudentId || detailSaving}
              className="rounded-xl bg-dark-amethyst-500 px-4 py-3 text-sm font-semibold text-white hover:bg-dark-amethyst-600 disabled:opacity-50"
            >
              {detailSaving ? "..." : "+"}
            </button>
          </div>
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-gray-700">
            Jadwal ({detailClass.schedules?.length ?? 0})
          </label>
          <div className="max-h-60 overflow-y-auto rounded-xl border border-gray-200">
            {(detailClass.schedules ?? []).length === 0 ? (
              <div className="p-3 text-center text-sm text-gray-400">Belum ada jadwal</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {detailClass.schedules!.map((s) => {
                  const sDate = s.date ? new Date(s.date).toISOString().split("T")[0] : "";
                  return (
                    <div key={s.id} className="flex items-center justify-between gap-2 px-3 py-2 text-sm">
                      <div className="min-w-0 flex-1">
                        <div className="text-gray-700">
                          {DAY_LABELS[s.dayOfWeek]} {s.startTime}-{s.endTime}
                        </div>
                        <div className="text-[10px] text-gray-400">{s.topic ?? "—"}</div>
                      </div>
                      <input type="date" value={sDate}
                        onChange={(e) => onReschedule(s.id, e.target.value)}
                        className="w-36 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-xs outline-none focus:border-dark-amethyst-400"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {detailError && <div className="mb-4 rounded-lg bg-berry-lipstick-50 p-3 text-sm text-berry-lipstick-600">{detailError}</div>}
        <button onClick={onSave} disabled={detailSaving}
          className="w-full rounded-xl bg-dark-amethyst-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-dark-amethyst-600 disabled:opacity-50"
        >
          {detailSaving ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Simpan Perubahan"}
        </button>
      </div>
    </div>
  );
}
