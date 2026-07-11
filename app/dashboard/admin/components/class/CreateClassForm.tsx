"use client";

import { type FormEvent } from "react";
import { type Curriculum, type TutorSlot } from "@/lib/api";
import { X } from "lucide-react";

type Props = {
  createType: "BATCH" | "PRIVATE" | "MAKEUP" | "TRIAL";
  onCreateTypeChange: (v: "BATCH" | "PRIVATE" | "MAKEUP" | "TRIAL") => void;
  createIsOnline: boolean;
  onCreateIsOnlineChange: (v: boolean) => void;
  createLocation: string;
  onCreateLocationChange: (v: string) => void;
  createName: string;
  onCreateNameChange: (v: string) => void;
  createCategory: string;
  onCreateCategoryChange: (v: string) => void;
  createCurriculumId: string;
  onCreateCurriculumIdChange: (v: string) => void;
  createTutorIds: string[];
  onCreateTutorIdsChange: (v: string[]) => void;
  createStartDate: string;
  onCreateStartDateChange: (v: string) => void;
  creating: boolean;
  createError: string;
  filteredCurriculums: Curriculum[];
  selectedCurriculum: Curriculum | undefined;
  createBatchPreview: number | null;
  tutors: { id: string; fullName: string }[];
  tutorSlots: TutorSlot[];
  tutorDayoffs: number[];
  slotsLoading: boolean;
  selectedSlots: { dayOfWeek: string; startTime: string; endTime: string }[];
  onSelectedSlotsChange: (slots: { dayOfWeek: string; startTime: string; endTime: string }[]) => void;
  SLOT_DAYS: string[];
  SLOT_DAY_LABELS: Record<string, string>;
  SLOT_HOURS: number[];
  fmt: (h: number) => string;
  isInRange: (day: string, hour: number) => boolean;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  createAvailableStudents: { id: string; fullName: string; nickname: string; email?: string }[];
  createSelectedStudentIds: string[];
  onSelectedStudentIdsChange: (ids: string[]) => void;
  getSlotsConflictReason?: (studentId: string, slots: { dayOfWeek: string; startTime: string; endTime: string }[]) => string | null;
};

export default function CreateClassForm({
  createType, onCreateTypeChange,
  createIsOnline, onCreateIsOnlineChange,
  createLocation, onCreateLocationChange,
  createName, onCreateNameChange,
  createCategory, onCreateCategoryChange,
  createCurriculumId, onCreateCurriculumIdChange,
  createTutorIds, onCreateTutorIdsChange,
  createStartDate, onCreateStartDateChange,
  creating, createError,
  filteredCurriculums, selectedCurriculum, createBatchPreview,
  tutors, tutorSlots, tutorDayoffs, slotsLoading,
  selectedSlots, onSelectedSlotsChange,
  SLOT_DAYS, SLOT_DAY_LABELS, SLOT_HOURS, fmt, isInRange,
  onSubmit,
  createAvailableStudents,
  createSelectedStudentIds, onSelectedStudentIdsChange,
  getSlotsConflictReason,
}: Props) {
  function fmt55(h: number) { return `${String(h).padStart(2, "0")}:55`; }

  const availableToAdd = createAvailableStudents.filter(
    (s) => !createSelectedStudentIds.includes(s.id),
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-7">
      <h2 className="mb-6 text-lg font-extrabold tracking-tight text-slate-900">Buat Kelas Baru</h2>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Kategori <span className="text-red-500">*</span></label>
          <select value={createCategory} onChange={(e) => { onCreateCategoryChange(e.target.value); onCreateCurriculumIdChange(""); }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="Kelas 1">Kelas 1 SD</option>
            <option value="Kelas 2">Kelas 2 SD</option>
            <option value="Kelas 3">Kelas 3 SD</option>
            <option value="Kelas 4">Kelas 4 SD</option>
            <option value="Kelas 5">Kelas 5 SD</option>
            <option value="Kelas 6">Kelas 6 SD</option>
            <option value="Kelas 7">Kelas 7 SMP</option>
            <option value="Kelas 8">Kelas 8 SMP</option>
            <option value="Kelas 9">Kelas 9 SMP</option>
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tipe Kelas</label>
          <div className="flex gap-2">
            {(["BATCH", "PRIVATE", "MAKEUP", "TRIAL"] as const).map((t) => (
              <button key={t} type="button"
                onClick={() => {
                  onCreateTypeChange(t);
                  onSelectedStudentIdsChange([]);
                  onSelectedSlotsChange([]);
                }}
                className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                  createType === t
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
                }`}
              >
                {t === "BATCH" ? "Batch" : t === "PRIVATE" ? "Private" : t === "MAKEUP" ? "Make Up" : "Trial"}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Metode</label>
          <div className="flex gap-2">
            <button type="button" onClick={() => onCreateIsOnlineChange(true)}
              className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                createIsOnline
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
              }`}
            >
              Online
            </button>
            <button type="button" onClick={() => onCreateIsOnlineChange(false)}
              className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                !createIsOnline
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-slate-200 bg-slate-50 text-slate-500 hover:border-slate-300"
              }`}
            >
              Offline
            </button>
          </div>
        </div>
        {!createIsOnline && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Lokasi <span className="text-red-500">*</span></label>
            <input type="text" value={createLocation} onChange={(e) => onCreateLocationChange(e.target.value)}
              placeholder="Masukkan alamat / lokasi kelas"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required
            />
          </div>
        )}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Kurikulum <span className="text-red-500">*</span></label>
          <select value={createCurriculumId} onChange={(e) => onCreateCurriculumIdChange(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required
          >
            <option value="">-- Pilih kurikulum --</option>
            {filteredCurriculums.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama Kelas <span className="text-red-500">*</span></label>
          <input type="text" value={createName} onChange={(e) => onCreateNameChange(e.target.value)}
            placeholder="Nama kelas akan otomatis terisi"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required
          />
          {createType === "BATCH" && (
            <p className="mt-1 text-[10px] text-slate-400">Batch: {createBatchPreview !== null ? createBatchPreview : "..."}</p>
          )}
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">
            Tutor <span className="text-red-500">*</span> {createTutorIds.length > 0 && <span className="font-normal text-slate-400">({createTutorIds.length})</span>}
          </label>
          {createTutorIds.length > 0 && (
            <div className="mb-2 max-h-32 overflow-y-auto rounded-xl border border-slate-200">
              {createTutorIds.map((tid) => {
                const t = tutors.find((x) => x.id === tid);
                return (
                  <div key={tid} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-0">
                    <span className="text-slate-700">{t?.fullName ?? tid}</span>
                    <button type="button" onClick={() => onCreateTutorIdsChange(createTutorIds.filter((id) => id !== tid))}
                      className="rounded-xl p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
          <select value="" onChange={(e) => {
            const id = e.target.value;
            if (id && !createTutorIds.includes(id)) {
              onCreateTutorIdsChange([...createTutorIds, id]);
            }
          }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">-- Tambah tutor --</option>
            {tutors.filter((t) => !createTutorIds.includes(t.id)).map((t) => (
              <option key={t.id} value={t.id}>{t.fullName}</option>
            ))}
          </select>
        </div>

        {createTutorIds.length > 0 && (
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Jadwal Kelas {selectedSlots.length > 0 && <span className="font-normal text-slate-400">({selectedSlots.length}/{createType === "MAKEUP" ? 1 : 2} dipilih)</span>}
            </label>
            {createTutorIds.length > 0 && (
              <div className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-slate-500">
                <span className="font-semibold text-slate-600">Tutor terpilih:</span>
                {createTutorIds.map((tid) => {
                  const t = tutors.find((x) => x.id === tid);
                  return (
                    <span key={tid} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                      {t?.fullName ?? tid}
                    </span>
                  );
                })}
              </div>
            )}
            {selectedCurriculum && selectedSlots.length > 0 && (
              <p className="mb-2 text-[10px] text-slate-400">
                {createType === "MAKEUP"
                  ? "Akan membuat 1 jadwal make up"
                  : `Akan membuat ${selectedCurriculum.topics.length} jadwal (1 per topik), dimulai dari tgl mulai`
                }
              </p>
            )}
            {slotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 border-r border-b border-slate-200 bg-slate-50 px-2 py-2 text-left font-semibold text-slate-500">Jam</th>
                      {SLOT_DAYS.map((day) => (
                        <th key={day} className="border-b border-slate-200 bg-slate-50 px-1 py-2 text-center font-semibold text-slate-500">
                          {SLOT_DAY_LABELS[day]}
                          {tutorDayoffs.includes(SLOT_DAYS.indexOf(day)) && <span className="ml-0.5 text-red-500">(off)</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SLOT_HOURS.map((hour) => (
                      <tr key={hour}>
                        <td className="sticky left-0 border-r border-b border-slate-200 bg-white px-2 py-2 text-[10px] font-medium text-slate-500">
                          {fmt(hour)}-{fmt(hour + 1)}
                        </td>
                        {SLOT_DAYS.map((day) => {
                          const allowMultiClass = process.env.NEXT_PUBLIC_ALLOW_MULTI_CLASS === "true";
                          const slot = tutorSlots.find((s) => s.dayOfWeek === day && s.startTime === fmt(hour) && (allowMultiClass || !s.isFilled));
                          const rangeOk = isInRange(day, hour);
                          const dayOff = tutorDayoffs.includes(SLOT_DAYS.indexOf(day));
                          const isSelected = selectedSlots.some((s) => s.dayOfWeek === day && s.startTime === fmt(hour));

                          const isFilled = slot?.isFilled ?? false;

                          if (!rangeOk || dayOff) {
                            return <td key={day} className="border-b border-slate-200 bg-slate-100 px-1 py-2 text-center text-[10px] text-slate-300">&mdash;</td>;
                          }
                          if (!slot) {
                            return <td key={day} className="border-b border-slate-200 bg-slate-50 px-1 py-2 text-center text-[10px] text-slate-300">&mdash;</td>;
                          }

                          const cellBg = isSelected
                            ? "bg-blue-200 text-blue-800 font-semibold"
                            : isFilled && allowMultiClass
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100";

                          return (
                            <td key={day}
                              className={`border-b border-slate-200 px-1 py-2 text-center text-[10px] transition cursor-pointer ${cellBg}`}
                              onClick={() => {
                                const maxSlots = createType === "MAKEUP" ? 1 : 2;
                                if (isSelected) {
                                  onSelectedSlotsChange(selectedSlots.filter((s) => !(s.dayOfWeek === day && s.startTime === fmt(hour))));
                                } else if (selectedSlots.length < maxSlots) {
                                  onSelectedSlotsChange([...selectedSlots, { dayOfWeek: day, startTime: fmt(hour), endTime: fmt55(hour) }]);
                                }
                              }}
                            >
                              {isSelected ? "✓" : isFilled && allowMultiClass ? "Isi" : "Pilih"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {selectedSlots.length === 0 && createTutorIds.length > 0 && !slotsLoading && (
              <p className="mt-1 text-[10px] text-slate-400">Klik slot yang tersedia (maksimal {createType === "MAKEUP" ? 1 : 2})</p>
            )}
          </div>
        )}
        {selectedSlots.length > 0 && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Tanggal Mulai Kelas <span className="text-red-500">*</span>
            </label>
            <input type="date" value={createStartDate} onChange={(e) => onCreateStartDateChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required
            />
            {selectedCurriculum && (
              <p className="mt-1 text-[10px] text-slate-400">
                {createType === "MAKEUP" ? "1 pertemuan" : `${selectedCurriculum.topics.length} pertemuan (${Math.ceil(selectedCurriculum.topics.length / selectedSlots.length)} minggu)`}
              </p>
            )}
          </div>
        )}

        {selectedSlots.length > 0 && createType !== "MAKEUP" && (
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Daftar Siswa {createSelectedStudentIds.length > 0 && <span className="font-normal text-slate-400">({createSelectedStudentIds.length}{createType === "PRIVATE" ? "/1" : ""} dipilih)</span>}
            </label>
            {createSelectedStudentIds.length > 0 && (
              <div className="mb-2 max-h-32 overflow-y-auto rounded-xl border border-slate-200">
                {createSelectedStudentIds.map((sid) => {
                  const s = createAvailableStudents.find((st) => st.id === sid);
                  return (
                    <div key={sid} className="flex items-center justify-between border-b border-slate-100 px-3 py-2 text-sm last:border-0">
                      <span className="text-slate-700">{s?.fullName ?? sid}</span>
                      <button type="button" onClick={() => onSelectedStudentIdsChange(createSelectedStudentIds.filter((x) => x !== sid))}
                        className="rounded-xl p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <X size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-2">
              <select value="" onChange={(e) => {
                const id = e.target.value;
                if (id && !createSelectedStudentIds.includes(id)) {
                  const max = createType === "PRIVATE" ? 1 : Infinity;
                  onSelectedStudentIdsChange([...createSelectedStudentIds.slice(-(max - 1)), id].slice(0, max));
                }
              }}
                className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              >
                <option value="">-- Tambah siswa --</option>
                {availableToAdd.map((s) => (
                  <option key={s.id} value={s.id}>{s.fullName} ({s.email ?? "-"})</option>
                ))}
              </select>
            </div>
            {selectedSlots.length > 0 && createAvailableStudents.length === 0 && (
              <p className="mt-1 text-[10px] text-slate-400">Tidak ada siswa tersedia (semua bentrok atau sudah terdaftar)</p>
            )}
            {createType === "PRIVATE" && createSelectedStudentIds.length >= 1 && (
              <p className="mt-1 text-[10px] text-emerald-600">Kelas Private hanya untuk 1 siswa</p>
            )}
          </div>
        )}

        {createError && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{createError}</div>}
        <button type="submit" disabled={creating}
          className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {creating ? <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Membuat...</span> : "Buat Kelas"}
        </button>
      </form>
    </div>
  );
}
