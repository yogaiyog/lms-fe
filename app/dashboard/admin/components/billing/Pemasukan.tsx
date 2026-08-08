"use client";

import { useCallback, useEffect, useState } from "react";
import { Search, RefreshCw, Wallet, Receipt, TrendingUp, CalendarRange } from "lucide-react";
import { api, type Payment } from "@/lib/api";
import { formatIDR } from "./InvoiceList";

const PAGE_SIZE_OPTIONS = [20, 50, 100];

function monthKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

function startOfMonth(month: string): string {
  return `${month}-01T00:00:00`;
}

function endOfMonth(month: string): string {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(y, m, 0).getDate();
  return `${month}-${String(lastDay).padStart(2, "0")}T23:59:59`;
}

function formatDate(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

function methodLabel(p: Payment): string {
  if (p.paymentMethod) return p.paymentMethod;
  if (p.paymentType) {
    const bank = p.bank ? ` ${p.bank.toUpperCase()}` : "";
    const map: Record<string, string> = {
      bank_transfer: "Transfer",
      qris: "QRIS",
      gopay: "GoPay",
      shopeepay: "ShopeePay",
      dana: "Dana",
    };
    return `${map[p.paymentType] ?? p.paymentType}${bank}`;
  }
  return "—";
}

export default function Pemasukan() {
  const now = monthKey(new Date());
  const [fromMonth, setFromMonth] = useState(now);
  const [toMonth, setToMonth] = useState(now);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [sum, setSum] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchIncome = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.payments.income({
        take: pageSize,
        skip: (page - 1) * pageSize,
        from: startOfMonth(fromMonth),
        to: endOfMonth(toMonth),
      });
      setPayments(res.data);
      setTotal(res.meta.total);
      setSum(Number(res.meta.sum ?? 0));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Gagal memuat pemasukan");
      setPayments([]);
      setTotal(0);
      setSum(0);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, fromMonth, toMonth]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIncome();
  }, [fetchIncome]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, total);
  const average = total > 0 ? sum / total : 0;

  const setCurrentMonth = () => {
    setFromMonth(now);
    setToMonth(now);
    setPage(1);
  };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900">Pemasukan</h2>
          <p className="text-xs text-slate-400">Ringkasan dan daftar pembayaran lunas</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => fetchIncome()} disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100">
            <RefreshCw size={14} />
            Muat Ulang
          </button>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-slate-50 p-3">
        <CalendarRange size={16} className="text-slate-400" />
        <span className="text-sm font-semibold text-slate-700">Periode</span>
        <input
          type="month"
          value={fromMonth}
          onChange={(e) => { setFromMonth(e.target.value || now); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400"
        />
        <span className="text-sm text-slate-400">s/d</span>
        <input
          type="month"
          value={toMonth}
          onChange={(e) => { setToMonth(e.target.value || now); setPage(1); }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400"
        />
        <button
          onClick={setCurrentMonth}
          className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          Bulan ini
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                <Wallet size={14} />
                Total Pemasukan
              </div>
              <div className="text-xl font-extrabold text-emerald-800">{formatIDR(sum)}</div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-blue-700">
                <Receipt size={14} />
                Jumlah Transaksi
              </div>
              <div className="text-xl font-extrabold text-blue-800">{total}</div>
            </div>
            <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
              <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-indigo-700">
                <TrendingUp size={14} />
                Rata-rata / Transaksi
              </div>
              <div className="text-xl font-extrabold text-indigo-800">{formatIDR(average)}</div>
            </div>
          </div>

          {payments.length === 0 ? (
            <div className="flex flex-col items-center py-12 text-center">
              <Search size={28} className="mb-2 text-slate-300" />
              <p className="text-sm text-slate-400">Belum ada pemasukan untuk periode ini</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Tanggal</th>
                    <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">No. Invoice</th>
                    <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Siswa</th>
                    <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Kurikulum</th>
                    <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Metode</th>
                    <th className="border-b border-slate-200 px-3 py-2.5 text-right text-xs font-semibold uppercase text-slate-500">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-2.5 text-slate-600">{formatDate(p.paidAt)}</td>
                      <td className="px-3 py-2.5 font-mono text-xs font-bold text-blue-600">{p.invoice?.number ?? "—"}</td>
                      <td className="px-3 py-2.5 font-semibold text-slate-900">
                        {p.invoice?.enrollment?.student?.fullName ?? "—"}
                      </td>
                      <td className="px-3 py-2.5 text-slate-600">{p.invoice?.enrollment?.curriculum?.name ?? "—"}</td>
                      <td className="px-3 py-2.5 text-slate-600">{methodLabel(p)}</td>
                      <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">{formatIDR(p.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-3">
                <div className="text-xs text-slate-500">
                  Menampilkan {rangeStart}–{rangeEnd} dari {total} transaksi
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={pageSize}
                    onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                    className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs outline-none transition focus:border-blue-400"
                  >
                    {PAGE_SIZE_OPTIONS.map((size) => (
                      <option key={size} value={size}>{size} / hal</option>
                    ))}
                  </select>
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Sebelumnya
                  </button>
                  <span className="text-xs text-slate-500">Hal {page} dari {totalPages}</span>
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Berikutnya
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
