"use client";

import { useState, useMemo } from "react";

type StudentItem = {
  id: string;
  userId: string;
  fullName: string;
  nickname: string;
  email?: string;
  category: string;
  parentName?: string;
};

type Props = {
  students: StudentItem[];
  onSelect: (student: StudentItem) => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  JUNIOR_I: "Kelas 1-3 SD",
  JUNIOR_II: "Kelas 4-6 SD",
  JUNIOR_III: "Kelas 7-9 SMP",
};

export default function StudentList({ students, onSelect }: Props) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(
    () => students.filter((s) => s.fullName.toLowerCase().includes(filter.toLowerCase())),
    [students, filter],
  );

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="px-4 pt-4">
        <input value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="Cari siswa..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="p-6 text-center"><p className="text-slate-500">Tidak ada siswa</p></div>
      ) : (
        <div className="overflow-x-auto p-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Panggilan</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Kategori</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Orang Tua</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} onClick={() => onSelect(s)}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-blue-50"
                >
                  <td className="px-3 py-3 font-semibold text-slate-900">{s.fullName}</td>
                  <td className="px-3 py-3 text-slate-600">{s.nickname}</td>
                  <td className="px-3 py-3 text-slate-600">{s.email ?? "—"}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {CATEGORY_LABELS[s.category] ?? s.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{s.parentName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
