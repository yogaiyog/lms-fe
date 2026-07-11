"use client";

import { useState, useMemo } from "react";
import type { ParentProfile } from "@/lib/api";

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

type Props = {
  parents: ParentProfile[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (parent: ParentProfile) => void;
  onArchive?: (parent: ParentProfile) => void;
  onRestore?: (parent: ParentProfile) => void;
  onDelete?: (parent: ParentProfile) => void;
};

export default function AllParentsView({ parents, loading, onRefresh, onEdit, onArchive, onRestore, onDelete }: Props) {
  const [parentTab, setParentTab] = useState<"active" | "archived">("active");
  const [parentSort, setParentSort] = useState<"desc" | "asc">("desc");

  const displayed = useMemo(
    () => parents.filter((p) => parentTab === "active" ? p.isActive !== false : p.isActive === false),
    [parents, parentTab],
  );

  const sorted = useMemo(() => {
    const copy = [...displayed];
    copy.sort((a, b) => {
      const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return parentSort === "desc" ? db - da : da - db;
    });
    return copy;
  }, [displayed, parentSort]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Semua Orang Tua</h2>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
            <button onClick={() => setParentTab("active")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${parentTab === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Aktif
            </button>
            <button onClick={() => setParentTab("archived")}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${parentTab === "archived" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              Diarsipkan
            </button>
          </div>
          <button onClick={onRefresh} className="rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">
            Refresh
          </button>
        </div>
      </div>
      {sorted.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">Belum ada orang tua terdaftar</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Nama</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Email</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Telepon</th>
                <th onClick={() => setParentSort((d) => d === "desc" ? "asc" : "desc")}
                  className="cursor-pointer border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500 hover:text-blue-600 select-none">
                  Tgl Dibuat {parentSort === "desc" ? "▼" : "▲"}
                </th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-center text-xs font-semibold uppercase text-slate-500">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((p) => (
                <tr key={p.id} onClick={() => onEdit(p)}
                  className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-blue-50">
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{p.fullName}</td>
                  <td className="px-3 py-2.5 text-slate-600">{p.user?.email ?? "—"}</td>
                  <td className="px-3 py-2.5 text-slate-600">{p.phone}</td>
                  <td className="px-3 py-2.5 text-slate-500 text-xs">{fmtDate(p.createdAt)}</td>
                  <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {p.isActive === false ? (
                        <>
                          <button onClick={() => onRestore?.(p)}
                            className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">
                            Aktifkan
                          </button>
                          <button onClick={() => { if (confirm("Yakin hapus orang tua ini? Semua siswa dan data terkait akan ikut terhapus.")) onDelete?.(p); }}
                            className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                            Hapus
                          </button>
                        </>
                      ) : (
                        <button onClick={() => onArchive?.(p)}
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
