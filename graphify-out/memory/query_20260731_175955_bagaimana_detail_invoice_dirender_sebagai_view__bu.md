---
type: "query"
date: "2026-07-31T17:59:55.143565+00:00"
question: "Bagaimana detail invoice dirender sebagai view (bukan modal) di halaman billing admin?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["InvoiceDetailView", "admin-dashboard", "InvoiceList", "useBilling"]
---

# Q: Bagaimana detail invoice dirender sebagai view (bukan modal) di halaman billing admin?

## Answer

InvoiceDetailModal.tsx di-rename jadi InvoiceDetailView.tsx (frontend/app/dashboard/admin/components/billing/InvoiceDetailView.tsx) — wrapper modal fixed inset-0 bg-black/40 dihapus, diganti container biasa (w-full max-w-2xl rounded-3xl border bg-white), header memakai tombol Kembali (ArrowLeft) untuk onClose. Di admin-dashboard.tsx, section h.mainMenu === 'billing' kini ternary: jika billing.selectedInvoice ada render <InvoiceDetailView> (dengan props onEdit/onPayManual/onPayMidtrans/onRefresh/onDownloadPdf/onSendEmail/onDelete), selain itu <InvoiceList>. Blok modal detail lama dihapus. Modal yang tetap: InvoiceFormModal (create/edit invoice), PaymentFormModal (manual), PaymentMethodModal (midtrans charge).

## Outcome

- Signal: useful

## Source Nodes

- InvoiceDetailView
- admin-dashboard
- InvoiceList
- useBilling