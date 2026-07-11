"use client";

import { useState, useMemo } from "react";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

type StudentItem = {
  id: string;
  userId: string;
  fullName: string;
  nickname: string;
  email?: string;
  category?: { id: string; name: string; label: string } | null;
  parentName?: string;
  isActive?: boolean;
  createdAt?: string;
  school?: string | null;
};

type Props = {
  students: StudentItem[];
  onSelect: (student: StudentItem) => void;
  onArchive?: (student: StudentItem) => void;
  onRestore?: (student: StudentItem) => void;
  onDelete?: (student: StudentItem) => void;
};

type SortDir = "asc" | "desc";

export default function StudentList({ students, onSelect, onArchive, onRestore, onDelete }: Props) {
  const [filter, setFilter] = useState("");
  const [tab, setTab] = useState<"active" | "archived">("active");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const filtered = useMemo(
    () => students.filter((s) => s.fullName.toLowerCase().includes(filter.toLowerCase())),
    [students, filter],
  );

  const displayed = useMemo(
    () => filtered.filter((s) => (tab === "active" ? s.isActive !== false : s.isActive === false)),
    [filtered, tab],
  );

  const sorted = useMemo(() => {
    const copy = [...displayed];
    copy.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return sortDir === "desc" ? db - da : da - db;
    });
    return copy;
  }, [displayed, sortDir]);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-4 px-4 pt-4">
        <input value={filter} onChange={(e) => setFilter(e.target.value)}
          placeholder="Cari siswa..."
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <div className="flex shrink-0 gap-1 rounded-xl bg-slate-100 p-1">
          <button onClick={() => setTab("active")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${tab === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            Aktif
          </button>
          <button onClick={() => setTab("archived")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${tab === "archived" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            Diarsipkan
          </button>
        </div>
      </div>
      {sorted.length === 0 ? (
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
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Sekolah</th>
                <th onClick={() => setSortDir((d) => d === "desc" ? "asc" : "desc")}
                  className="cursor-pointer border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-blue-600 select-none">
                  Tgl Dibuat {sortDir === "desc" ? "▼" : "▲"}
                </th>
                <th className="border-b border-slate-200 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => (
                <tr key={s.id} onClick={() => onSelect(s)}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-blue-50"
                >
                  <td className="px-3 py-3 font-semibold text-slate-900">{s.fullName}</td>
                  <td className="px-3 py-3 text-slate-600">{s.nickname}</td>
                  <td className="px-3 py-3 text-slate-600">{s.email ?? "—"}</td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
                      {s.category?.label ?? "-"}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-slate-600">{s.parentName ?? "—"}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs">{s.school ?? "—"}</td>
                  <td className="px-3 py-3 text-slate-500 text-xs">{fmtDate(s.createdAt)}</td>
                  <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {s.isActive === false ? (
                        <>
                          <button onClick={() => onRestore?.(s)}
                            className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">
                            Aktifkan
                          </button>
                          <button onClick={() => { if (confirm("Yakin hapus siswa ini? Semua data terkait akan ikut terhapus.")) onDelete?.(s); }}
                            className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                            Hapus
                          </button>
                        </>
                      ) : (
                        <button onClick={() => onArchive?.(s)}
                          className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                          Arsipkan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
