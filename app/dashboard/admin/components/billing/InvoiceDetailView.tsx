"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, Download, ExternalLink, Mail, Pencil, Phone, Printer, RefreshCw, Trash2 } from "lucide-react";
import type { Invoice, Payment } from "@/lib/api";
import { formatIDR, INVOICE_STATUS_COLORS, PAYMENT_STATUS_COLORS } from "./InvoiceList";

const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME || "JTCourse";

type Props = {
  invoice: Invoice;
  loading: boolean;
  pdfBusy: boolean;
  emailSending: boolean;
  deleting: boolean;
  onClose: () => void;
  onEdit: (invoice: Invoice) => void;
  onChangePayment: (invoice: Invoice) => void;
  onRefresh: () => void;
  onDownloadPdf: () => void;
  onSendEmail: () => void;
  onDelete: () => void;
  onCheckStatus: (paymentId: string) => void;
  onDeletePayment: (paymentId: string) => Promise<void>;
  checkingPaymentIds: Set<string>;
};

export default function InvoiceDetailView({
  invoice, loading, pdfBusy, emailSending, deleting, onClose, onEdit, onChangePayment, onRefresh, onDownloadPdf, onSendEmail, onDelete,
  onCheckStatus, onDeletePayment, checkingPaymentIds,
}: Props) {
  const [copied, setCopied] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);
  const settled = (invoice.payments ?? [])
    .filter((p) => p.status === "SETTLEMENT")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const remaining = Math.max(0, Number(invoice.total) - settled);
  const isPaid = ["PAID", "PARTIAL", "REFUNDED"].includes(invoice.status);
  const isSandbox = process.env.NEXT_PUBLIC_SANDBOX === "TRUE";

  const payments = useMemo(
    () => [...(invoice.payments ?? [])].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [invoice.payments],
  );

  const issuedDate = new Date(invoice.createdAt).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function confirmDelete() {
    if (isPaid || deleting) return;
    const ok = window.confirm(
      `Hapus invoice ${invoice.number}?\n\nInvoice yang belum dibayar akan dihapus permanen bersama riwayat pembayarannya. Tindakan ini tidak dapat dibatalkan.`,
    );
    if (ok) onDelete();
  }

  async function handleDeletePayment(paymentId: string) {
    if (!window.confirm("Hapus riwayat pembayaran ini? Tindakan tidak dapat dibatalkan.")) return;
    await onDeletePayment(paymentId);
  }

  const student = invoice.enrollment?.student;
  const parent = student?.parent;
  const parentEmail = parent?.user?.email ?? student?.user?.email;
  const parentPhone = parent?.phone;
  const canEmail = Boolean(parentEmail);

  async function copyPhone() {
    if (!parentPhone) return;
    try {
      await navigator.clipboard.writeText(parentPhone);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="w-full max-w-4xl print:max-w-none">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm print:rounded-none print:border-0 print:shadow-none">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 print:hidden">
          <button
            onClick={onClose}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-700"
          >
            <ArrowLeft size={16} /> Kembali
          </button>
          <div className="flex items-center gap-1">
            <button onClick={onRefresh} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Refresh">
              <RefreshCw size={18} />
            </button>
            <button onClick={() => onEdit(invoice)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600" title="Edit">
              <Pencil size={18} />
            </button>
            <button
              onClick={confirmDelete}
              disabled={isPaid || deleting}
              title={isPaid ? "Invoice sudah dibayar — tidak dapat dihapus" : "Hapus invoice"}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 size={18} className={deleting ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        <div className="px-6 py-5 space-y-5">
          <div className="hidden print:block">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xl font-extrabold tracking-tight text-slate-900">{COMPANY}</p>
                <p className="text-3xl font-extrabold tracking-tight text-slate-900">INVOICE</p>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-semibold text-blue-700">{invoice.number}</p>
                <p className="mt-1 text-xs text-slate-500">Terbit: {issuedDate}</p>
                <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${INVOICE_STATUS_COLORS[invoice.status] ?? "bg-slate-100 text-slate-600"}`}>
                  {invoice.status}
                </span>
              </div>
            </div>
            <div className="mt-4 border-b-2 border-slate-900" />
          </div>

          <div className="print:hidden">
            <h2 className="flex items-center gap-2 text-lg font-extrabold text-slate-900">
              Invoice
              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${INVOICE_STATUS_COLORS[invoice.status] ?? "bg-slate-100 text-slate-600"}`}>
                {invoice.status}
              </span>
            </h2>
            <p className="font-mono text-xs text-blue-600">{invoice.number}</p>
          </div>

          {loading && (
            <div className="flex justify-center py-6">
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-sm">
            <Info label="Siswa" value={invoice.enrollment?.student?.fullName ?? "—"} />
            <Info label="Kurikulum" value={invoice.enrollment?.curriculum?.name ?? "—"} />
            <Info label="Deskripsi" value={invoice.description ?? "—"} />
            <Info label="Pertemuan" value={String(invoice.meetCount)} />
            <Info label="Dibayar" value={invoice.paidAt ? new Date(invoice.paidAt).toLocaleString("id-ID") : "—"} />
          </div>

          {(parent || parentEmail || parentPhone) && (
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <p className="mb-2 text-[10px] font-semibold text-slate-400">KONTAK PARENT (untuk kirim invoice)</p>
              {parent?.fullName && <p className="text-sm font-semibold text-slate-800">{parent.fullName}</p>}
              <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                {parentEmail && (
                  <span className="inline-flex items-center gap-1">
                    <Mail size={12} /> {parentEmail}
                  </span>
                )}
                {parentPhone && (
                  <span className="inline-flex items-center gap-1">
                    <Phone size={12} /> {parentPhone}
                    <button onClick={copyPhone}
                      className="rounded-md bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold text-slate-700 hover:bg-slate-300 print:hidden">
                      {copied ? "Tersalin" : "Salin WA"}
                    </button>
                  </span>
                )}
              </div>
              {!canEmail && (
                <p className="mt-1 text-[11px] text-slate-400">Tidak ada email — kirim manual via WhatsApp.</p>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-slate-50 p-4 space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-semibold">{formatIDR(invoice.subtotal)}</span></div>
            <div className="flex justify-between text-slate-600">
              <span>Pajak {invoice.taxPercent != null ? `(${invoice.taxPercent}%)` : ""}</span>
              <span className="font-semibold">{formatIDR(invoice.taxAmount)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900">
              <span>Total</span><span>{formatIDR(invoice.total)}</span>
            </div>
            <div className="flex justify-between text-emerald-700">
              <span>Terbayar</span><span className="font-semibold">{formatIDR(settled)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-900">
              <span>Sisa</span><span>{formatIDR(remaining)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 print:hidden">
            <button onClick={onDownloadPdf} disabled={pdfBusy}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-slate-800 disabled:opacity-40">
              <Download size={14} />
              {pdfBusy ? "Membuat PDF..." : "Download PDF"}
            </button>
            <button onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700">
              <Printer size={14} />
              Cetak
            </button>
            <button onClick={onSendEmail} disabled={emailSending || !canEmail}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-100 disabled:opacity-40">
              <Mail size={14} />
              {emailSending ? "Mengirim..." : "Kirim via Email"}
            </button>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-700">Riwayat Pembayaran ({invoice.payments?.length ?? 0})</h3>
              <button onClick={() => onChangePayment(invoice)}
                title="Ganti metode pembayaran"
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 print:hidden">
                <Pencil size={13} /> Ganti Metode
              </button>
            </div>
            {(invoice.payments ?? []).length === 0 ? (
              <p className="text-sm text-slate-400">Belum ada pembayaran</p>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Status</th>
                      <th className="px-3 py-2 text-right text-xs font-semibold text-slate-500">Jumlah</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Metode</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Waktu</th>
                      <th className="px-3 py-2 text-left text-xs font-semibold text-slate-500">Expired At</th>
                      {isSandbox && <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500 print:hidden">Simulasi</th>}
                      <th className="px-3 py-2 text-center text-xs font-semibold text-slate-500 print:hidden">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => {
                      const expiry = paymentExpiry(p);
                      const expired = p.status === "PENDING" && expiry !== null && expiry.getTime() < now;
                      return (
                        <tr key={p.id} className="border-t border-slate-100">
                          <td className="px-3 py-2">
                            <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${PAYMENT_STATUS_COLORS[p.status] ?? "bg-slate-100 text-slate-600"}`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-900">{formatIDR(p.amount)}</td>
                          <td className="px-3 py-2">
                            <span className="text-slate-600">{p.paymentMethod ?? "—"}</span>
                            <PaymentMethodDetail payment={p} />
                          </td>
                          <td className="px-3 py-2 text-xs text-slate-500">{p.paidAt ? new Date(p.paidAt).toLocaleString("id-ID") : new Date(p.createdAt).toLocaleString("id-ID")}</td>
                          <td className="px-3 py-2 text-xs">
                            {p.status === "PENDING" && expiry ? (
                              <span className={expired ? "font-semibold text-red-600" : "text-slate-500"}>
                                {expiry.toLocaleString("id-ID")}
                                {expired && <span className="ml-1 text-red-600">· kedaluwarsa</span>}
                              </span>
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </td>
                          {isSandbox && (
                            <td className="px-3 py-2 text-center print:hidden">
                              {p.status === "PENDING" && p.gateway === "midtrans" ? (
                                <a
                                  href="https://simulator.sandbox.midtrans.com/"
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 rounded-lg bg-amber-100 px-2 py-1 text-[10px] font-bold text-amber-700 hover:bg-amber-200"
                                >
                                  Simulasi <ExternalLink size={10} />
                                </a>
                              ) : null}
                            </td>
                          )}
                          <td className="px-3 py-2 text-center print:hidden">
                            {p.status === "CANCELLED" ? (
                              <button
                                onClick={() => handleDeletePayment(p.id)}
                                title="Hapus payment"
                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                              >
                                <Trash2 size={15} />
                              </button>
                            ) : p.status === "PENDING" && p.gateway === "midtrans" ? (
                              <button
                                onClick={() => onCheckStatus(p.id)}
                                disabled={checkingPaymentIds.has(p.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-blue-100 px-2 py-1 text-[10px] font-bold text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                              >
                                {checkingPaymentIds.has(p.id) ? (
                                  <RefreshCw size={10} className="animate-spin" />
                                ) : (
                                  <RefreshCw size={10} />
                                )}
                                Cek Status
                              </button>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function paymentExpiry(payment: Payment): Date | null {
  if (!payment.createdAt) return null;
  const created = new Date(payment.createdAt);
  if (Number.isNaN(created.getTime())) return null;
  const ms = 60 * 1000;
  if (payment.paymentType === "bank_transfer") return new Date(created.getTime() + 24 * 60 * ms);
  if (payment.paymentType === "qris") return new Date(created.getTime() + 15 * ms);
  if (payment.paymentType === "gopay" || payment.paymentType === "shopeepay" || payment.paymentType === "dana") {
    return new Date(created.getTime() + 15 * ms);
  }
  return null;
}

function PaymentMethodDetail({ payment }: { payment: Payment }) {
  const [copied, setCopied] = useState("");

  async function copyToClipboard(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      /* ignore */
    }
  }

  if (payment.gateway !== "midtrans" && !payment.paymentType) return null;

  if (payment.paymentType === "bank_transfer" && payment.vaNumber) {
    return (
      <div className="mt-1">
        <div className="flex items-center gap-1">
          <span className="font-mono text-[11px] font-semibold text-blue-700">VA: {payment.vaNumber}</span>
          <button
            onClick={() => copyToClipboard(payment.vaNumber!, "va")}
            className="inline-flex items-center rounded p-0.5 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
            title="Salin VA"
          >
            {copied === "va" ? <span className="text-[10px] font-bold text-emerald-600">Tersalin</span> : <Copy size={11} />}
          </button>
        </div>
      </div>
    );
  }
  if (payment.paymentType === "qris") {
    return (
      <div className="mt-1">
        {payment.qrString && (
          <div className="max-w-[160px] truncate font-mono text-[11px] text-slate-500" title={payment.qrString}>
            QR: {payment.qrString.slice(0, 24)}...
          </div>
        )}
        {payment.deeplinkUrl && (
          <div className="flex items-center gap-1">
            <a
              href={payment.deeplinkUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-blue-600 hover:underline"
            >
              QR Code ↗
            </a>
            <button
              onClick={() => copyToClipboard(payment.deeplinkUrl!, "qris")}
              className="inline-flex items-center rounded p-0.5 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
              title="Salin URL QR"
            >
              {copied === "qris" ? <span className="text-[10px] font-bold text-emerald-600">Tersalin</span> : <Copy size={11} />}
            </button>
          </div>
        )}
      </div>
    );
  }
  if (payment.paymentType && payment.deeplinkUrl) {
    return (
      <div className="mt-1 flex items-center gap-1">
        <a href={payment.deeplinkUrl} target="_blank" rel="noreferrer"
          className="text-[11px] font-semibold text-blue-600 hover:underline">
          Buka pembayaran ↗
        </a>
        <button
          onClick={() => copyToClipboard(payment.deeplinkUrl!, "deeplink")}
          className="inline-flex items-center rounded p-0.5 text-slate-400 hover:bg-blue-100 hover:text-blue-600"
          title="Salin link"
        >
          {copied === "deeplink" ? <span className="text-[10px] font-bold text-emerald-600">Tersalin</span> : <Copy size={11} />}
        </button>
      </div>
    );
  }
  if (payment.paymentType) {
    return (
      <div className="mt-1 text-[11px] font-mono text-slate-400">{payment.paymentType}</div>
    );
  }
  return null;
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3">
      <p className="text-[10px] font-semibold text-slate-400">{label}</p>
      <p className="mt-0.5 font-semibold text-slate-800">{value}</p>
    </div>
  );
}
