---
type: "query"
date: "2026-07-31T07:06:37.800635+00:00"
question: "Bagaimana state billing admin di frontend dan komponennya?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["useBilling.ts", "InvoiceList.tsx", "InvoiceDetailModal.tsx", "admin-dashboard.tsx"]
---

# Q: Bagaimana state billing admin di frontend dan komponennya?

## Answer

useBilling (frontend/hooks/useBilling.ts) mengelola state billing: invoices, invoicesLoading/Error, selectedInvoice (detail), invoiceFormOpen+editingInvoice (form create/edit), paymentFor (modal pembayaran manual), formSaving/formError, paymentSaving/paymentError, midtransBusy. Komponen di app/dashboard/admin/components/billing/: InvoiceList (tabel + formatIDR + INVOICE_STATUS_COLORS/PAYMENT_STATUS_COLORS), InvoiceFormModal (live hitung pajak, remount via key utk create vs edit), InvoiceDetailModal (rincian + riwayat pembayaran + tombol bayar manual/midtrans), PaymentFormModal (default amount = sisa tagihan). AdminNavbar item Keuangan -> mainMenu=billing di useAdminDashboard. Urutan render modal di admin-dashboard.tsx penting: InvoiceFormModal & PaymentFormModal harus DIBELAKANG InvoiceDetailModal biar z-index popup menang.

## Outcome

- Signal: useful

## Source Nodes

- useBilling.ts
- InvoiceList.tsx
- InvoiceDetailModal.tsx
- admin-dashboard.tsx