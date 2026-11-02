"use client";

import { type Table, flexRender } from "@tanstack/react-table";
import { type Class, type Schedule } from "@/lib/api";
import { DAY_LABELS } from "../../constants";
import { BookOpen, Search } from "lucide-react";
import { Card, EmptyState, Input, Segmented } from "@/components/ui";

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
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
        <div className="relative min-w-0 flex-1 basis-56">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            placeholder="Cari kelas…"
            aria-label="Cari kelas"
            className="pl-9"
          />
        </div>
        <Segmented
          ariaLabel="Status kelas"
          value={tab}
          onChange={onTabChange}
          items={[
            { key: "active", label: "Aktif" },
            { key: "inactive", label: "Nonaktif" },
          ]}
        />
      </div>
      {table.getRowModel().rows.length === 0 ? (
        <EmptyState
          variant="compact"
          icon={BookOpen}
          title={tab === "active" ? "Belum ada kelas aktif" : "Tidak ada kelas nonaktif"}
          description={globalFilter ? "Tidak ada kelas yang cocok dengan pencarian." : "Buat kelas baru lewat menu Kelas → Buat Kelas."}
        />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()}
                      className="cursor-pointer whitespace-nowrap border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 hover:text-slate-700"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: " ▲", desc: " ▼" }[h.column.getIsSorted() as string] ?? ""}
                    </th>
                  ))}
                  <th className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Progress</th>
                  <th className="border-b border-slate-200 bg-slate-50/70 px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} onClick={() => onRowClick(row.original)}
                  className="cursor-pointer border-b border-slate-100 transition-colors last:border-0 hover:bg-primary-50/40"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3.5 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="px-4 py-3.5">
                    <ScheduleCell schedules={row.original.schedules} />
                  </td>
                  <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                    {row.original.isActive ? (
                      <button onClick={() => onToggleActive?.(row.original)}
                        className="rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors">
                        Nonaktifkan
                      </button>
                    ) : (
                      <>
                        <button onClick={() => onToggleActive?.(row.original)}
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors">
                          Aktifkan
                        </button>
                        <button onClick={() => { if (confirm("Yakin hapus kelas ini? Semua jadwal dan pengumuman akan ikut terhapus.")) onDelete?.(row.original); }}
                          className="rounded-lg px-2.5 py-1 text-xs font-semibold text-red-500 hover:bg-red-50 transition-colors">
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
    </Card>
  );
}
