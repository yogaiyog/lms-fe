"use client";

import { Plus, RefreshCw, Receipt, Search, ArrowUp, ArrowDown } from "lucide-react";
import type { Invoice } from "@/lib/api";

export function formatIDR(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(n);
}

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  DRAFT: "bg-slate-100 text-slate-600",
  UNPAID: "bg-amber-100 text-amber-700",
  PAID: "bg-green-100 text-green-700",
  PARTIAL: "bg-blue-100 text-blue-700",
  REFUNDED: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-gray-100 text-gray-500",
};

export const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-700",
  SETTLEMENT: "bg-green-100 text-green-700",
  EXPIRED: "bg-slate-100 text-slate-600",
  DENY: "bg-red-100 text-red-700",
  REFUND: "bg-rose-100 text-rose-700",
  CANCELLED: "bg-slate-100 text-slate-500",
};

type Props = {
  invoices: Invoice[];
  loading: boolean;
  error?: string;
  total: number;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (sortBy: string, sortDir: "asc" | "desc") => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onReset: () => void;
  onRefresh: () => void;
  onCreate: () => void;
  onOpen: (invoice: Invoice) => void;
};

const STATUS_OPTIONS = ["DRAFT", "UNPAID", "PAID", "PARTIAL", "REFUNDED", "CANCELLED"] as const;
const PAGE_SIZE_OPTIONS = [20, 50, 100];

type SortKey = "number" | "student" | "curriculum" | "meetCount" | "total" | "status" | "createdAt";

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function SortableTh({ label, sortKey, activeKey, dir, onSort, className = "" }: {
  label: string;
  sortKey: SortKey;
  activeKey: string;
  dir: "asc" | "desc";
  onSort: (key: SortKey) => void;
  className?: string;
}) {
  const active = activeKey === sortKey;
  return (
    <th className={`border-b border-slate-200 px-3 py-2.5 text-xs font-semibold uppercase text-slate-500 ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex items-center gap-1 transition hover:text-blue-600"
      >
        {label}
        {active ? (
          dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />
        ) : (
          <ArrowDown size={12} className="opacity-25" />
        )}
      </button>
    </th>
  );
}

export default function InvoiceList({
  invoices,
  loading,
  error,
  total,
  page,
  pageSize,
  search,
  statusFilter,
  sortBy,
  sortDir,
  onSearchChange,
  onStatusChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
  onReset,
  onRefresh,
  onCreate,
  onOpen,
}: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);

  const hasCustomState =
    search !== "" ||
    statusFilter !== "ALL" ||
    sortBy !== "createdAt" ||
    sortDir !== "desc";

  const handleSort = (key: SortKey) => {
    if (key === sortBy) {
      onSortChange(key, sortDir === "asc" ? "desc" : "asc");
    } else {
      onSortChange(key, "asc");
    }
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Semua Invoice</h2>
          <p className="text-xs text-slate-400">Tagihan dan pembayaran siswa</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
            <RefreshCw size={14} />
            Refresh
          </button>
          <button onClick={onCreate}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700">
            <Plus size={14} />
            Buat Invoice
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>
      )}

      {(total > 0 || hasCustomState) && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <div className="relative min-w-[220px] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari nomor, siswa, kurikulum..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-blue-400"
          >
            <option value="ALL">Semua Status</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {hasCustomState && (
            <button
              onClick={onReset}
              className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-100"
            >
              Reset Filter & Sort
            </button>
          )}
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <Search size={28} className="mb-2 text-slate-300" />
          <p className="text-sm text-slate-400">
            {total === 0 && !hasCustomState ? "Belum ada invoice" : "Tidak ada hasil untuk filter"}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <SortableTh label="Nomor" sortKey="number" activeKey={sortBy} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Siswa" sortKey="student" activeKey={sortBy} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Kurikulum" sortKey="curriculum" activeKey={sortBy} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Pertemuan" sortKey="meetCount" activeKey={sortBy} dir={sortDir} onSort={handleSort} className="text-center" />
                <SortableTh label="Total" sortKey="total" activeKey={sortBy} dir={sortDir} onSort={handleSort} className="text-right" />
                <SortableTh label="Tanggal Dibuat" sortKey="createdAt" activeKey={sortBy} dir={sortDir} onSort={handleSort} />
                <SortableTh label="Status" sortKey="status" activeKey={sortBy} dir={sortDir} onSort={handleSort} className="text-center" />
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} onClick={() => onOpen(inv)}
                  className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-blue-50">
                  <td className="px-3 py-2.5 font-mono text-xs font-bold text-blue-600">{inv.number}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-900">
                    {inv.enrollment?.student?.fullName ?? "—"}
                  </td>
                  <td className="px-3 py-2.5 text-slate-600">{inv.enrollment?.curriculum?.name ?? "—"}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{inv.meetCount}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-900">{formatIDR(inv.total)}</td>
                  <td className="px-3 py-2.5 text-slate-600">{formatDate(inv.createdAt)}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${INVOICE_STATUS_COLORS[inv.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="text-xs text-slate-500">
              Menampilkan {rangeStart}–{rangeEnd} dari {total} invoice
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={pageSize}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none transition focus:border-blue-400"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size} / hal</option>
                ))}
              </select>
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Sebelumnya
              </button>
              <span className="text-xs text-slate-500">Hal {page} dari {totalPages}</span>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Berikutnya
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function InvoiceBadge({ invoice }: { invoice: Invoice }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${INVOICE_STATUS_COLORS[invoice.status] ?? "bg-slate-100 text-slate-600"}`}>
      <Receipt size={10} />
      {invoice.number} · {invoice.status}
    </span>
  );
}
