"use client";

import { type Table, flexRender } from "@tanstack/react-table";
import { type RequestClass } from "@/lib/api";
import { DAY_LABELS, STATUS_LABELS } from "../../constants";

type Props = {
  table: Table<RequestClass>;
  globalFilter: string;
  onGlobalFilterChange: (v: string) => void;
  onProcess: (req: RequestClass) => void;
};

export default function RequestsTable({ table, globalFilter, onGlobalFilterChange, onProcess }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="px-4 pt-4">
        <input value={globalFilter} onChange={(e) => onGlobalFilterChange(e.target.value)}
          placeholder="Cari request..."
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        />
      </div>
      {table.getRowModel().rows.length === 0 ? (
        <div className="p-6 text-center"><p className="text-slate-500">Belum ada request kelas</p></div>
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
                  <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Detail</th>
                  <th className="border-b border-slate-200 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Aksi</th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3 text-slate-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-xs text-slate-500">
                    <div>Orang tua: {row.original.parent?.fullName ?? "-"}</div>
                    <div>{JSON.parse(row.original.days).map((d: string) => DAY_LABELS[d]).join(", ")} {row.original.startTime}-{row.original.endTime}</div>
                    <div>{row.original.sessionCount}x/minggu</div>
                    {row.original.notes && <div className="italic text-slate-400">{row.original.notes}</div>}
                    {row.original.adminNotes && <div className="text-amber-600">{row.original.adminNotes}</div>}
                  </td>
                  <td className="px-3 py-3">
                    {row.original.status === "PENDING" ? (
                      <button onClick={() => onProcess(row.original)}
                        className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 transition-colors">
                        Proses
                      </button>
                    ) : (
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        row.original.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                        row.original.status === "REJECTED" ? "bg-red-100 text-red-700" :
                        "bg-slate-100 text-slate-500"
                      }`}>
                        {STATUS_LABELS[row.original.status] ?? row.original.status}
                      </span>
                    )}
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
