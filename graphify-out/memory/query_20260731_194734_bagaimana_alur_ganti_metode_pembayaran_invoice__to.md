---
type: "query"
date: "2026-07-31T19:47:34.128849+00:00"
question: "Bagaimana alur ganti metode pembayaran invoice (tombol Ganti Metode di Riwayat Pembayaran) dan validasi wajib pilih metode saat nominal berubah?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["InvoiceFormModal.tsx", "InvoiceDetailView.tsx", "useBilling.ts", "admin-dashboard.tsx", "payments.route.ts"]
---

# Q: Bagaimana alur ganti metode pembayaran invoice (tombol Ganti Metode di Riwayat Pembayaran) dan validasi wajib pilih metode saat nominal berubah?

## Answer

Dua fitur di billing admin. 1) Tombol 'Ganti Metode' sejajar judul 'Riwayat Pembayaran (N)' di InvoiceDetailView.tsx (ikon Pencil) memanggil prop onChangePayment -> useBilling.openChangePayment yang set editingInvoice + invoiceFormInitialStep=2, sehingga InvoiceFormModal terbuka langsung di step 2 (Metode Pembayaran) dengan metode WAJIB (tombol Lewati disembunyikan via isPaymentOnly = isEdit && initialStep===2). Submit memakai submitInvoiceEditWithPayment: api.invoices.update + createPaymentForInvoice (manual: api.payments.create; va/qris/wallet: createMidtransCharge), guard cancelPendingPayments membatalkan PENDING lama. 2) Saat Edit biasa mengubah total (preview.total != editing.total) dan ada payment PENDING (mustChooseMethod), tombol Lewati disembunyikan dan muncul note amber 'Total berubah - pilih metode untuk memperbarui pembayaran' sehingga admin dipaksa pilih metode lagi -> payment baru dengan nominal baru, mencegah mismatch nominal. State invoiceFormInitialStep default 1 untuk create/edit biasa.

## Outcome

- Signal: useful

## Source Nodes

- InvoiceFormModal.tsx
- InvoiceDetailView.tsx
- useBilling.ts
- admin-dashboard.tsx
- payments.route.ts