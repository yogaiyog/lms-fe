"use client";

import { Plus, RefreshCw, Receipt } from "lucide-react";
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
  onRefresh: () => void;
  onCreate: () => void;
  onOpen: (invoice: Invoice) => void;
};

export default function InvoiceList({ invoices, loading, error, onRefresh, onCreate, onOpen }: Props) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

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

      {invoices.length === 0 ? (
        <div className="flex flex-col items-center py-12 text-center">
          <span className="text-4xl mb-3">🧾</span>
          <p className="text-sm text-slate-400">Belum ada invoice</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Nomor</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Siswa</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Kurikulum</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-center text-xs font-semibold uppercase text-slate-500">Pertemuan</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Total</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-center text-xs font-semibold uppercase text-slate-500">Status</th>
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
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold ${INVOICE_STATUS_COLORS[inv.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {inv.status}
                    </span>
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

export function InvoiceBadge({ invoice }: { invoice: Invoice }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${INVOICE_STATUS_COLORS[invoice.status] ?? "bg-slate-100 text-slate-600"}`}>
      <Receipt size={10} />
      {invoice.number} · {invoice.status}
    </span>
  );
}
