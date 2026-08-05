---
type: "query"
date: "2026-08-02T10:09:08.906296+00:00"
question: "Bagaimana cetak invoice PDF dari FE (window.print) tanpa mengubah tombol lama?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["InvoiceDetailView", "globals.css", "AdminNavbar", "AdminSidebar", "admin-dashboard"]
---

# Q: Bagaimana cetak invoice PDF dari FE (window.print) tanpa mengubah tombol lama?

## Answer

Cetak invoice PDF dari FE tanpa menghapus tombol lama:
- Tambah tombol "Cetak" baru di app/dashboard/admin/components/billing/InvoiceDetailView.tsx yang memanggil window.print(). Tombol lama "Download PDF" (BE) dan "Kirim via Email" tetap ada.
- CSS print di app/globals.css: @media print { @page A4 portrait margin 12mm; print-color-adjust exact }.
- print:hidden pada chrome admin: AdminNavbar root, AdminSidebar root, FAB & toast di admin-dashboard.tsx, container print:px-0 py-0 gap-0, dan kontrol admin di InvoiceDetailView (bar atas, tombol aksi, "Ganti Metode", "Salin WA", kolom tabel Aksi & Simulasi).
- Header dokumen print-only: hidden print:block (nama perusahaan NEXT_PUBLIC_COMPANY_NAME || "JTCourse", INVOICE, nomor, status, "Terbit").
- Catatan Android: dukungan window.print() di WebView tergantung Chrome.

## Outcome

- Signal: useful

## Source Nodes

- InvoiceDetailView
- globals.css
- AdminNavbar
- AdminSidebar
- admin-dashboard