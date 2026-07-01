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
    <div className="rounded-2xl bg-white shadow-md">
      <div className="px-4 pt-4">
        <input value={globalFilter} onChange={(e) => onGlobalFilterChange(e.target.value)}
          placeholder="Cari request..."
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm outline-none focus:border-dark-amethyst-400"
        />
      </div>
      {table.getRowModel().rows.length === 0 ? (
        <div className="p-6 text-center"><p className="text-gray-500">Belum ada request kelas</p></div>
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
                  <th className="border-b border-gray-200 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Detail</th>
                  <th className="border-b border-gray-200 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">Aksi</th>
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-3 text-gray-700">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-xs text-gray-500">
                    <div>Orang tua: {row.original.parent?.fullName ?? "-"}</div>
                    <div>{JSON.parse(row.original.days).map((d: string) => DAY_LABELS[d]).join(", ")} {row.original.startTime}-{row.original.endTime}</div>
                    <div>{row.original.sessionCount}x/minggu</div>
                    {row.original.notes && <div className="italic text-gray-400">{row.original.notes}</div>}
                    {row.original.adminNotes && <div className="text-amber-600">{row.original.adminNotes}</div>}
                  </td>
                  <td className="px-3 py-3">
                    {row.original.status === "PENDING" ? (
                      <button onClick={() => onProcess(row.original)}
                        className="rounded-lg bg-dark-amethyst-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-dark-amethyst-600">
                        Proses
                      </button>
                    ) : (
                      <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                        row.original.status === "APPROVED" ? "bg-tea-green-100 text-tea-green-700" :
                        row.original.status === "REJECTED" ? "bg-berry-lipstick-100 text-berry-lipstick-700" :
                        "bg-gray-100 text-gray-500"
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
