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
  onImpersonate: (studentId: string) => void;
};

const CATEGORY_LABELS: Record<string, string> = {
  JUNIOR_I: "Kelas 1-3 SD",
  JUNIOR_II: "Kelas 4-6 SD",
  JUNIOR_III: "Kelas 7-9 SMP",
};

export default function StudentList({ students, onImpersonate }: Props) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(
    () => students.filter((s) => s.fullName.toLowerCase().includes(filter.toLowerCase())),
    [students, filter],
  );

  return (
    <div className="rounded-2xl bg-white shadow-md">
      <div className="px-4 pt-4">
        <input value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="Cari siswa..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-dark-amethyst-400"
        />
      </div>
      {filtered.length === 0 ? (
        <div className="p-6 text-center"><p className="text-gray-500">Tidak ada siswa</p></div>
      ) : (
        <div className="overflow-x-auto p-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-gray-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nama</th>
                <th className="border-b border-gray-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Panggilan</th>
                <th className="border-b border-gray-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="border-b border-gray-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Kategori</th>
                <th className="border-b border-gray-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Orang Tua</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} onClick={() => onImpersonate(s.userId)}
                  className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-dark-amethyst-50"
                >
                  <td className="px-3 py-3 font-medium text-gray-800">{s.fullName}</td>
                  <td className="px-3 py-3 text-gray-600">{s.nickname}</td>
                  <td className="px-3 py-3 text-gray-600">{s.email ?? "—"}</td>
                  <td className="px-3 py-3">{CATEGORY_LABELS[s.category] ?? s.category}</td>
                  <td className="px-3 py-3 text-gray-600">{s.parentName ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
