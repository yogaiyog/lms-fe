"use client";

import { type Table, flexRender } from "@tanstack/react-table";
import { type Class, type Schedule } from "@/lib/api";
import { DAY_LABELS } from "../../constants";

type Props = {
  table: Table<Class>;
  globalFilter: string;
  onGlobalFilterChange: (v: string) => void;
  onRowClick: (cls: Class) => void;
  onToggleActive?: (cls: Class) => void;
  onDelete?: (cls: Class) => void;
  tab: "active" | "inactive";
  onTabChange: (tab: "active" | "inactive") => void;
};

function ScheduleCell({ schedules: raw }: { schedules: Schedule[] | undefined | null }) {
  const schedules = raw ?? [];

  if (schedules.length === 0) {
    return <span className="text-xs text-slate-400">—</span>;
  }

  const total = schedules.length;
  const done = schedules.filter((s) => s.isDone).length;

  const sorted = [...schedules].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const nextSched = sorted.find((s) => !s.isDone);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all"
            style={{ width: `${Math.round((done / total) * 100)}%` }}
          />
        </div>
        <span className="whitespace-nowrap text-xs font-medium text-slate-500">
          {done}/{total} Selesai
        </span>
      </div>
      {nextSched ? (
        <div className="text-xs text-slate-600">
          <span className="font-semibold">{nextSched.topic ?? "—"}</span>
          <span className="text-slate-400">
            {" — "}
            {nextSched.date
              ? `${DAY_LABELS[nextSched.dayOfWeek]}, ${new Date(nextSched.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}`
              : DAY_LABELS[nextSched.dayOfWeek]}
          </span>
        </div>
      ) : (
        <div className="text-xs font-medium text-emerald-600">Semua selesai</div>
      )}
    </div>
  );
}

export default function ClassesTable({ table, globalFilter, onGlobalFilterChange, onRowClick, onToggleActive, onDelete, tab, onTabChange }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-4 px-4 pt-4">
        <input value={globalFilter} onChange={(e) => onGlobalFilterChange(e.target.value)}
          placeholder="Cari kelas..."
          className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
        <div className="flex shrink-0 gap-1 rounded-xl bg-slate-100 p-1">
          <button onClick={() => onTabChange("active")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${tab === "active" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            Aktif
          </button>
          <button onClick={() => onTabChange("inactive")}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${tab === "inactive" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
            Nonaktif
          </button>
        </div>
      </div>
      {table.getRowModel().rows.length === 0 ? (
        <div className="p-6 text-center"><p className="text-slate-500">Belum ada kelas</p></div>
      ) : (
        <div className="overflow-x-auto p-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()}
                      className="cursor-pointer border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: " ▲", desc: " ▼" }[h.column.getIsSorted() as string] ?? ""}
                    </th>
                  ))}
                  <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</th>
                  <th className="border-b border-slate-200 px-3 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} onClick={() => onRowClick(row.original)}
                  className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <ScheduleCell schedules={row.original.schedules} />
                  </td>
                  <td className="px-3 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                    {row.original.isActive ? (
                      <button onClick={() => onToggleActive?.(row.original)}
                        className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        Nonaktifkan
                      </button>
                    ) : (
                      <>
                        <button onClick={() => onToggleActive?.(row.original)}
                          className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-emerald-600 hover:bg-emerald-50 transition-colors">
                          Aktifkan
                        </button>
                        <button onClick={() => { if (confirm("Yakin hapus kelas ini? Semua jadwal dan pengumuman akan ikut terhapus.")) onDelete?.(row.original); }}
                          className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50 transition-colors">
                          Hapus
                        </button>
                      </>
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
