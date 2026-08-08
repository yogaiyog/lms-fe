"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, getStoredSession, type Invoice, type MidtransBank, type InvoiceListParams } from "@/lib/api";
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

const STORAGE_KEY = "lms.billing.invoiceFilters";

type InvoiceFilters = {
  search: string;
  statusFilter: string;
  sortBy: string;
  sortDir: "asc" | "desc";
  pageSize: number;
};

const DEFAULT_FILTERS: InvoiceFilters = {
  search: "",
  statusFilter: "ALL",
  sortBy: "createdAt",
  sortDir: "desc",
  pageSize: 20,
};

function loadInvoiceFilters(): InvoiceFilters {
  if (typeof window === "undefined") return DEFAULT_FILTERS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_FILTERS;
    const p = JSON.parse(raw) as Partial<InvoiceFilters>;
    return {
      search: typeof p.search === "string" ? p.search : DEFAULT_FILTERS.search,
      statusFilter: typeof p.statusFilter === "string" ? p.statusFilter : DEFAULT_FILTERS.statusFilter,
      sortBy: typeof p.sortBy === "string" ? p.sortBy : DEFAULT_FILTERS.sortBy,
      sortDir: p.sortDir === "asc" ? "asc" : "desc",
      pageSize: typeof p.pageSize === "number" && p.pageSize > 0 ? p.pageSize : DEFAULT_FILTERS.pageSize,
    };
  } catch {
    return DEFAULT_FILTERS;
  }
}

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
  const [initial] = useState(loadInvoiceFilters);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [invoicesLoading, setInvoicesLoading] = useState(false);
  const [invoicesError, setInvoicesError] = useState("");

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initial.pageSize);
  const [search, setSearch] = useState(initial.search);
  const [searchInput, setSearchInput] = useState(initial.search);
  const [statusFilter, setStatusFilter] = useState(initial.statusFilter);
  const [sortBy, setSortBy] = useState(initial.sortBy);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initial.sortDir);
  const [total, setTotal] = useState(0);

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
      const params: InvoiceListParams = {
        take: pageSize,
        skip: (page - 1) * pageSize,
        sortBy,
        sortDir,
      };
      if (search.trim()) params.search = search.trim();
      if (statusFilter !== "ALL") params.status = statusFilter;
      const res = await api.invoices.list(params);
      setInvoices(res.data);
      setTotal(res.meta.total);
    } catch (error) {
      setInvoicesError(error instanceof Error ? error.message : "Gagal memuat invoice");
    } finally {
      setInvoicesLoading(false);
    }
  }, [page, pageSize, search, statusFilter, sortBy, sortDir]);

  const onSearchChange = useCallback((value: string) => {
    setSearchInput(value);
  }, []);

  const onStatusChange = useCallback((value: string) => {
    setPage(1);
    setStatusFilter(value);
  }, []);

  const onSortChange = useCallback((nextSortBy: string, nextSortDir: "asc" | "desc") => {
    setSortBy(nextSortBy);
    setSortDir(nextSortDir);
  }, []);

  const onPageChange = useCallback((nextPage: number) => {
    setPage(nextPage);
  }, []);

  const onPageSizeChange = useCallback((size: number) => {
    setPage(1);
    setPageSize(size);
  }, []);

  const onReset = useCallback(() => {
    setSearchInput("");
    setSearch("");
    setStatusFilter("ALL");
    setSortBy("createdAt");
    setSortDir("desc");
    setPage(1);
  }, []);

  // Debounce search input → commit search + reset to page 1
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        setPage(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput, search]);

  // Auto-fetch when any server-side param changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInvoices();
  }, [fetchInvoices]);

  // Persist filter/sort preferences (not page) across refresh
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ search, statusFilter, sortBy, sortDir, pageSize }),
      );
    } catch {
      /* ignore storage errors */
    }
  }, [search, statusFilter, sortBy, sortDir, pageSize]);

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
    page,
    pageSize,
    total,
    search: searchInput,
    statusFilter,
    sortBy,
    sortDir,
    onSearchChange,
    onStatusChange,
    onSortChange,
    onPageChange,
    onPageSizeChange,
    onReset,
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
