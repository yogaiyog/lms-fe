"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, getStoredSession, type Invoice, type MidtransBank } from "@/lib/api";
import {
  isNativePlatform,
  downloadFileCapacitor,
  downloadFileWeb,
} from "@/lib/capacitor-download";

export type InvoiceFormPayload = {
  enrollmentId: string;
  description?: string;
  meetCount?: number;
  subtotal?: number;
  registrationFee?: number;
  taxPercent?: number;
  notes?: string;
};

export type ManualPaymentPayload = {
  amount: number;
  paymentMethod?: string;
  status?: string;
  transactionId?: string;
};

export type InvoicePaymentMethod =
  | { method: "manual"; bank?: string }
  | { method: "bank_transfer"; bank: MidtransBank }
  | { method: "qris" }
  | { method: "gopay" }
  | { method: "shopeepay" }
  | { method: "dana" };

export type SubmitInvoiceResult = { ok: boolean; invoice?: Invoice | null; message?: string };

async function createPaymentForInvoice(invoice: Invoice, choice: InvoicePaymentMethod): Promise<void> {
  if (choice.method === "manual") {
    await api.payments.create({
      invoiceId: invoice.id,
      amount: Number(invoice.total),
      paymentMethod: choice.bank ? `TRANSFER - ${choice.bank}` : "TRANSFER",
      status: "PENDING",
      gateway: "manual",
    });
  } else if (choice.method === "bank_transfer") {
    await api.payments.createMidtransCharge({ invoiceId: invoice.id, method: "bank_transfer", bank: choice.bank });
  } else if (choice.method === "qris") {
    await api.payments.createMidtransCharge({ invoiceId: invoice.id, method: "qris" });
  } else {
    await api.payments.createMidtransCharge({ invoiceId: invoice.id, method: choice.method });
  }
}

export function useBilling() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState("");

  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [invoiceFormOpen, setInvoiceFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [invoiceFormInitialStep, setInvoiceFormInitialStep] = useState(1);
  const [formSaving, setFormSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [pdfBusy, setPdfBusy] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [checkingPaymentIds, setCheckingPaymentIds] = useState<Set<string>>(new Set());

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get("invoiceId");
    if (id) openInvoice({ id } as Invoice);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncInvoiceUrl = useCallback(
    (invoiceId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (invoiceId) {
        params.set("invoiceId", invoiceId);
      } else {
        params.delete("invoiceId");
      }
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  const fetchInvoices = useCallback(async () => {
    setInvoicesLoading(true);
    setInvoicesError("");
    try {
      const list = await api.invoices.list();
      setInvoices(list);
    } catch (error) {
      setInvoicesError(error instanceof Error ? error.message : "Gagal memuat invoice");
    } finally {
      setInvoicesLoading(false);
    }
  }, []);

  const openInvoice = useCallback(async (invoice: Invoice) => {
    setDetailLoading(true);
    try {
      const full = await api.invoices.get(invoice.id);
      setSelectedInvoice(full);
      syncInvoiceUrl(full.id);
    } catch {
      setSelectedInvoice(invoice);
      syncInvoiceUrl(invoice.id);
    } finally {
      setDetailLoading(false);
    }
  }, [syncInvoiceUrl]);

  const refreshSelected = useCallback(async () => {
    if (!selectedInvoice) return;
    try {
      const full = await api.invoices.get(selectedInvoice.id);
      setSelectedInvoice(full);
    } catch {
      /* keep existing */
    }
    await fetchInvoices();
  }, [selectedInvoice, fetchInvoices]);

  const closeInvoice = useCallback(() => {
    setSelectedInvoice(null);
    syncInvoiceUrl(null);
  }, [syncInvoiceUrl]);

  const openCreateInvoice = useCallback(() => {
    setEditingInvoice(null);
    setFormError("");
    setInvoiceFormInitialStep(1);
    setInvoiceFormOpen(true);
  }, []);

  const openEditInvoice = useCallback((invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormError("");
    setInvoiceFormInitialStep(1);
    setInvoiceFormOpen(true);
  }, []);

  const openChangePayment = useCallback((invoice: Invoice) => {
    setEditingInvoice(invoice);
    setFormError("");
    setInvoiceFormInitialStep(2);
    setInvoiceFormOpen(true);
  }, []);

  const closeInvoiceForm = useCallback(() => {
    setInvoiceFormOpen(false);
    setEditingInvoice(null);
    setInvoiceFormInitialStep(1);
    setFormError("");
  }, []);

  const submitInvoice = useCallback(async (payload: InvoiceFormPayload): Promise<SubmitInvoiceResult> => {
    setFormSaving(true);
    setFormError("");
    try {
      const invoice = editingInvoice
        ? await api.invoices.update(editingInvoice.id, payload)
        : await api.invoices.create(payload);
      setInvoiceFormOpen(false);
      setEditingInvoice(null);
      await fetchInvoices();
      if (selectedInvoice?.id === invoice.id) {
        try {
          const full = await api.invoices.get(invoice.id);
          setSelectedInvoice(full);
        } catch {
          /* keep existing */
        }
      }
      return { ok: true, invoice };
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Gagal menyimpan invoice");
      return { ok: false };
    } finally {
      setFormSaving(false);
    }
  }, [editingInvoice, fetchInvoices, selectedInvoice]);

  const submitInvoiceWithPayment = useCallback(
    async (payload: InvoiceFormPayload, choice: InvoicePaymentMethod): Promise<SubmitInvoiceResult> => {
      setFormSaving(true);
      setFormError("");
      try {
        const invoice = await api.invoices.create(payload);
        let ok = true;
        let message: string | undefined;
        try {
          await createPaymentForInvoice(invoice, choice);
        } catch (error) {
          ok = false;
          message =
            error instanceof Error
              ? `Invoice dibuat, tetapi gagal membuat pembayaran: ${error.message}`
              : "Invoice dibuat, tetapi gagal membuat pembayaran.";
        }
        setInvoiceFormOpen(false);
        setEditingInvoice(null);
        await fetchInvoices();
        return { ok, invoice, message };
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "Gagal menyimpan invoice");
        return { ok: false };
      } finally {
        setFormSaving(false);
      }
    },
    [fetchInvoices],
  );

  const submitInvoiceEditWithPayment = useCallback(
    async (payload: InvoiceFormPayload, choice: InvoicePaymentMethod): Promise<SubmitInvoiceResult> => {
      if (!editingInvoice) {
        setFormError("Invoice yang diedit tidak ditemukan");
        return { ok: false };
      }
      setFormSaving(true);
      setFormError("");
      try {
        const invoice = await api.invoices.update(editingInvoice.id, payload);
        let ok = true;
        let message: string | undefined;
        try {
          await createPaymentForInvoice(invoice, choice);
        } catch (error) {
          ok = false;
          message =
            error instanceof Error
              ? `Invoice diperbarui, tetapi gagal membuat pembayaran: ${error.message}`
              : "Invoice diperbarui, tetapi gagal membuat pembayaran.";
        }
        setInvoiceFormOpen(false);
        setEditingInvoice(null);
        await fetchInvoices();
        if (selectedInvoice?.id === invoice.id) {
          try {
            const full = await api.invoices.get(invoice.id);
            setSelectedInvoice(full);
          } catch {
            /* keep existing */
          }
        }
        return { ok, invoice, message };
      } catch (error) {
        setFormError(error instanceof Error ? error.message : "Gagal memperbarui invoice");
        return { ok: false };
      } finally {
        setFormSaving(false);
      }
    },
    [editingInvoice, fetchInvoices, selectedInvoice],
  );

  const downloadPdf = useCallback(async (invoice: Invoice): Promise<boolean> => {
    setPdfBusy(true);
    try {
      const blob = await api.invoices.generatePdf(invoice.id);
      const fileName = `${invoice.number}.pdf`;
      if (isNativePlatform()) {
        await downloadFileCapacitor(blob, fileName);
      } else {
        downloadFileWeb(blob, fileName);
      }
      return true;
    } catch {
      return false;
    } finally {
      setPdfBusy(false);
    }
  }, []);

  const sendInvoiceEmail = useCallback(
    async (invoice: Invoice): Promise<{ ok: boolean; to?: string }> => {
      setEmailSending(true);
      try {
        const result = await api.invoices.sendEmail(invoice.id);
        return { ok: true, to: result.to };
      } catch {
        return { ok: false };
      } finally {
        setEmailSending(false);
      }
    },
    [],
  );

  const deleteInvoice = useCallback(
    async (invoice: Invoice): Promise<{ ok: boolean; message?: string }> => {
      setDeleting(true);
      try {
        await api.invoices.delete(invoice.id);
        setSelectedInvoice(null);
        syncInvoiceUrl(null);
        await fetchInvoices();
        return { ok: true };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "Gagal menghapus invoice" };
      } finally {
        setDeleting(false);
      }
    },
    [fetchInvoices, syncInvoiceUrl],
  );

  const deletePayment = useCallback(
    async (paymentId: string): Promise<{ ok: boolean; message?: string }> => {
      try {
        await api.payments.delete(paymentId);
        await refreshSelected();
        return { ok: true };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "Gagal menghapus payment" };
      }
    },
    [refreshSelected],
  );

  const checkPaymentStatus = useCallback(
    async (paymentId: string): Promise<{ ok: boolean; message: string }> => {
      setCheckingPaymentIds((prev) => new Set(prev).add(paymentId));
      try {
        const result = await api.payments.checkStatus(paymentId);
        if (result.updated) {
          await refreshSelected();
          return { ok: true, message: "Status pembayaran berhasil diperbarui" };
        }
        if (result.skipped) {
          return { ok: false, message: `Pembayaran sudah ${result.status ?? "selesai"}` };
        }
        return { ok: true, message: "Status pembayaran belum berubah — coba lagi nanti" };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : "Gagal mengecek status" };
      } finally {
        setCheckingPaymentIds((prev) => {
          const next = new Set(prev);
          next.delete(paymentId);
          return next;
        });
      }
    },
    [refreshSelected],
  );

  const eventSourceRef = useRef<EventSource | null>(null);
  const selectedInvoiceRef = useRef(selectedInvoice);
  selectedInvoiceRef.current = selectedInvoice;
  const refreshRef = useRef(refreshSelected);
  refreshRef.current = refreshSelected;

  useEffect(() => {
    const session = getStoredSession();
    if (!session?.accessToken) return;

    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000"}/api/v1/academic/events?token=${encodeURIComponent(session.accessToken)}`;
    const es = new EventSource(url);
    eventSourceRef.current = es;

    es.addEventListener("invoice_updated", (event) => {
      try {
        const data = JSON.parse(event.data) as { invoiceId: string };
        if (selectedInvoiceRef.current && data.invoiceId === selectedInvoiceRef.current.id) {
          refreshRef.current();
        }
      } catch {
        /* ignore malformed events */
      }
    });

    es.onerror = () => {
      es.close();
    };

    return () => {
      es.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    invoices,
    invoicesLoading,
    invoicesError,
    fetchInvoices,
    selectedInvoice,
    detailLoading,
    openInvoice,
    closeInvoice,
    refreshSelected,
    invoiceFormOpen,
    editingInvoice,
    invoiceFormInitialStep,
    formSaving,
    formError,
    openCreateInvoice,
    openEditInvoice,
    openChangePayment,
    closeInvoiceForm,
    submitInvoice,
    submitInvoiceWithPayment,
    submitInvoiceEditWithPayment,
    pdfBusy,
    emailSending,
    deleting,
    downloadPdf,
    sendInvoiceEmail,
    deleteInvoice,
    deletePayment,
    checkingPaymentIds,
    checkPaymentStatus,
  };
}
