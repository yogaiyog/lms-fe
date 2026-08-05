---
type: "query"
date: "2026-08-02T10:09:09.044670+00:00"
question: "Bagaimana hapus payment CANCELLED dari riwayat pembayaran invoice?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["useBilling", "InvoiceDetailView", "api"]
---

# Q: Bagaimana hapus payment CANCELLED dari riwayat pembayaran invoice?

## Answer

Hapus payment ber-status CANCELLED dari riwayat pembayaran invoice:
- useBilling (frontend/hooks/useBilling.ts): tambah deletePayment(paymentId) -> api.payments.delete(paymentId) lalu refreshSelected(); return {ok, message}; di-expose di return.
- admin-dashboard.tsx: wire prop onDeletePayment di InvoiceDetailView -> billing.deletePayment + h.showToast.
- InvoiceDetailView.tsx: prop onDeletePayment + handler handleDeletePayment (window.confirm); di kolom Aksi, untuk status "CANCELLED" tampil ikon Trash2; PENDING midtrans tetap tombol "Cek Status".
- lib/api.ts: Payment.status union ditambah "CANCELLED" (sebelumnya tidak ada padahal backend menghasilkan status ini).
- Backend DELETE /api/v1/academic/payments/:id sudah ada (baseRouter crud-router), tanpa perlu updateInvoiceStatus karena CANCELLED tidak memengaruhi hitungan settled/refund.

## Outcome

- Signal: useful

## Source Nodes

- useBilling
- InvoiceDetailView
- api