---
type: "query"
date: "2026-07-31T18:14:36.880041+00:00"
question: "Bagaimana alur ubah metode pembayaran invoice setelah tombol bayar dihapus dari detail view?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["useBilling.ts", "InvoiceFormModal.tsx", "InvoiceDetailView.tsx", "admin-dashboard.tsx", "createPaymentForInvoice", "submitInvoiceEditWithPayment"]
---

# Q: Bagaimana alur ubah metode pembayaran invoice setelah tombol bayar dihapus dari detail view?

## Answer

Alur pembayaran invoice dipindah dari tombol 'Pembayaran Manual' & 'Bayar via Midtrans' di InvoiceDetailView ke wizard Edit Invoice. InvoiceDetailView.tsx hanya menyisakan tombol Download PDF & Kirim via Email. Untuk mengubah/metode pembayaran: user buka Edit dari detail view → InvoiceFormModal.tsx kini selalu memakai wizard 3-step (Detail → Metode → Ringkasan) baik untuk create maupun edit. Di step 2 (Metode) saat edit, muncul teks 'Ubah metode pembayaran (opsional)' dengan tombol 'Lewati' bila tidak ingin mengubah metode. Di step 3: jika metode dipilih, tombol 'Simpan & Perbarui Metode' memanggil onSubmitEditWithPayment → useBilling.submitInvoiceEditWithPayment (update invoice via api.invoices.update lalu createPaymentForInvoice) dan guard backend cancelPendingPayments otomatis membatalkan payment PENDING lama; jika Lewati/dipilih kosong, tombol 'Simpan' memanggil onSubmit → submitInvoice (update detail saja tanpa payment). createPaymentForInvoice (modul helper di useBilling.ts) dibuat untuk manual (api.payments.create status PENDING) dan midtrans (api.payments.createMidtransCharge). PaymentFormModal.tsx dan PaymentMethodModal.tsx kini orphan (tidak dirender). selectedInvoice direfresh otomatis setelah submit edit agar detail view tidak stale.

## Outcome

- Signal: useful

## Source Nodes

- useBilling.ts
- InvoiceFormModal.tsx
- InvoiceDetailView.tsx
- admin-dashboard.tsx
- createPaymentForInvoice
- submitInvoiceEditWithPayment