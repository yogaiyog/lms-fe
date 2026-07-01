"use client";

import { type Table, flexRender } from "@tanstack/react-table";
import { type Class } from "@/lib/api";
import { DAY_LABELS } from "../../constants";

type Props = {
  table: Table<Class>;
  globalFilter: string;
  onGlobalFilterChange: (v: string) => void;
  onRowClick: (cls: Class) => void;
};

export default function ClassesTable({ table, globalFilter, onGlobalFilterChange, onRowClick }: Props) {
  return (
    <div className="rounded-2xl bg-white shadow-md">
      <div className="px-4 pt-4">
        <input value={globalFilter} onChange={(e) => onGlobalFilterChange(e.target.value)}
          placeholder="Cari kelas..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-dark-amethyst-400"
        />
      </div>
      {table.getRowModel().rows.length === 0 ? (
        <div className="p-6 text-center"><p className="text-gray-500">Belum ada kelas</p></div>
      ) : (
        <div className="overflow-x-auto p-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} onClick={h.column.getToggleSortingHandler()}
                      className="cursor-pointer border-b border-gray-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 hover:text-gray-700"
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                      {{ asc: " ▲", desc: " ▼" }[h.column.getIsSorted() as string] ?? ""}
                    </th>
                  ))}
                  <th className="border-b border-gray-200 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Jadwal</th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} onClick={() => onRowClick(row.original)}
                  className="cursor-pointer border-b border-gray-100 last:border-0 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3 text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {(row.original.schedules ?? []).length === 0 ? (
                        <span className="text-xs text-gray-400">—</span>
                      ) : (
                        row.original.schedules!.slice(0, 3).map((s) => (
                          <span key={s.id} className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] text-gray-600">
                            {DAY_LABELS[s.dayOfWeek]} {s.startTime}
                          </span>
                        ))
                      )}
                      {(row.original.schedules?.length ?? 0) > 3 && (
                        <span className="rounded-md bg-gray-50 px-2 py-0.5 text-[10px] text-gray-400">
                          +{row.original.schedules!.length - 3}
                        </span>
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
