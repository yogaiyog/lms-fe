"use client";

import { type FormEvent } from "react";
import { type Curriculum, type TutorSlot, type TutorProfile } from "@/lib/api";

type Props = {
  createCategory: string;
  onCreateCategoryChange: (v: string) => void;
  createCurriculumId: string;
  onCreateCurriculumIdChange: (v: string) => void;
  createTutorId: string;
  onCreateTutorIdChange: (v: string) => void;
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
};

export default function CreateClassForm({
  createCategory, onCreateCategoryChange,
  createCurriculumId, onCreateCurriculumIdChange,
  createTutorId, onCreateTutorIdChange,
  createStartDate, onCreateStartDateChange,
  creating, createError,
  filteredCurriculums, selectedCurriculum, createBatchPreview,
  tutors, tutorSlots, tutorDayoffs, slotsLoading,
  selectedSlots, onSelectedSlotsChange,
  SLOT_DAYS, SLOT_DAY_LABELS, SLOT_HOURS, fmt, isInRange,
  onSubmit,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-bold text-gray-800">Buat Kelas Baru</h2>
      <form onSubmit={onSubmit}>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Kategori <span className="text-berry-lipstick-500">*</span></label>
          <select value={createCategory} onChange={(e) => { onCreateCategoryChange(e.target.value); onCreateCurriculumIdChange(""); }}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400"
          >
            <option value="JUNIOR_I">Kelas 1-3 SD (Junior I)</option>
            <option value="JUNIOR_II">Kelas 4-6 SD (Junior II)</option>
            <option value="JUNIOR_III">Kelas 7-9 SMP (Junior III)</option>
          </select>
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Kurikulum <span className="text-berry-lipstick-500">*</span></label>
          <select value={createCurriculumId} onChange={(e) => onCreateCurriculumIdChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400" required
          >
            <option value="">-- Pilih kurikulum --</option>
            {filteredCurriculums.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Batch <span className="text-berry-lipstick-500">*</span></label>
          <div className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 text-sm text-gray-500">
            {createBatchPreview !== null ? createBatchPreview : "Otomatis setelah isi kurikulum"}
          </div>
          <p className="mt-1 text-[10px] text-gray-400">Nama kelas: <strong>{selectedCurriculum ? `${selectedCurriculum.name} - Batch ${createBatchPreview ?? "?"}` : "—"}</strong></p>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Tutor</label>
          <select value={createTutorId} onChange={(e) => onCreateTutorIdChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400" required
          >
            <option value="">-- Pilih tutor --</option>
            {tutors.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
          </select>
        </div>

        {createTutorId && (
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Jadwal Kelas {selectedSlots.length > 0 && <span className="font-normal text-gray-400">({selectedSlots.length}/2 dipilih)</span>}
            </label>
            {selectedCurriculum && selectedSlots.length > 0 && (
              <p className="mb-2 text-[10px] text-gray-400">
                Akan membuat {selectedCurriculum.topics.length} jadwal (1 per topik), dimulai dari tgl mulai
              </p>
            )}
            {slotsLoading ? (
              <div className="flex items-center justify-center py-8">
                <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-dark-amethyst-500 border-t-transparent" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th className="sticky left-0 border-r border-b border-gray-200 bg-gray-50 px-2 py-2 text-left font-semibold text-gray-500">Jam</th>
                      {SLOT_DAYS.map((day) => (
                        <th key={day} className="border-b border-gray-200 bg-gray-50 px-1 py-2 text-center font-semibold text-gray-500">
                          {SLOT_DAY_LABELS[day]}
                          {tutorDayoffs.includes(SLOT_DAYS.indexOf(day)) && <span className="ml-0.5 text-berry-lipstick-500">(off)</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {SLOT_HOURS.map((hour) => (
                      <tr key={hour}>
                        <td className="sticky left-0 border-r border-b border-gray-200 bg-white px-2 py-2 text-[10px] font-medium text-gray-500">
                          {fmt(hour)}-{fmt(hour + 1)}
                        </td>
                        {SLOT_DAYS.map((day) => {
                          const slot = tutorSlots.find((s) => s.dayOfWeek === day && s.startTime === fmt(hour) && !s.isFilled);
                          const rangeOk = isInRange(day, hour);
                          const dayOff = tutorDayoffs.includes(SLOT_DAYS.indexOf(day));
                          const isSelected = selectedSlots.some((s) => s.dayOfWeek === day && s.startTime === fmt(hour));

                          if (!rangeOk || dayOff) {
                            return <td key={day} className="border-b border-gray-200 bg-gray-100 px-1 py-2 text-center text-[10px] text-gray-300">&mdash;</td>;
                          }
                          if (!slot) {
                            return <td key={day} className="border-b border-gray-200 bg-gray-50 px-1 py-2 text-center text-[10px] text-gray-300">&mdash;</td>;
                          }

                          return (
                            <td key={day}
                              className={`border-b border-gray-200 px-1 py-2 text-center text-[10px] transition cursor-pointer
                                ${isSelected ? "bg-dark-amethyst-200 text-dark-amethyst-800 font-semibold" : "bg-tea-green-50 text-tea-green-700 hover:bg-tea-green-100"}`}
                              onClick={() => {
                                if (isSelected) {
                                  onSelectedSlotsChange(selectedSlots.filter((s) => !(s.dayOfWeek === day && s.startTime === fmt(hour))));
                                } else if (selectedSlots.length < 2) {
                                  onSelectedSlotsChange([...selectedSlots, { dayOfWeek: day, startTime: fmt(hour), endTime: fmt(hour + 1) }]);
                                }
                              }}
                            >
                              {isSelected ? "✓" : "Pilih"}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {selectedSlots.length === 0 && createTutorId && !slotsLoading && (
              <p className="mt-1 text-[10px] text-gray-400">Klik slot yang tersedia (maksimal 2)</p>
            )}
          </div>
        )}
        {selectedSlots.length > 0 && (
          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tanggal Mulai Kelas <span className="text-berry-lipstick-500">*</span>
            </label>
            <input type="date" value={createStartDate} onChange={(e) => onCreateStartDateChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400" required
            />
            {selectedCurriculum && (
              <p className="mt-1 text-[10px] text-gray-400">
                {selectedCurriculum.topics.length} pertemuan ({Math.ceil(selectedCurriculum.topics.length / selectedSlots.length)} minggu)
              </p>
            )}
          </div>
        )}
        {createError && <div className="mb-4 rounded-lg bg-berry-lipstick-50 p-3 text-sm text-berry-lipstick-600">{createError}</div>}
        <button type="submit" disabled={creating}
          className="w-full rounded-xl bg-dark-amethyst-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-dark-amethyst-600 disabled:opacity-50"
        >
          {creating ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Buat Kelas"}
        </button>
      </form>
    </div>
  );
}
