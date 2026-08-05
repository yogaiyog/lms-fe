---
type: "query"
date: "2026-08-02T10:09:08.975471+00:00"
question: "Bagaimana toast error dibuat menetap sampai diklik X?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["useAdminDashboard", "admin-dashboard"]
---

# Q: Bagaimana toast error dibuat menetap sampai diklik X?

## Answer

Toast error menetap sampai diklik X:
- useAdminDashboard (app/dashboard/admin/hooks/useAdminDashboard.ts): showToast kini men-set toast; untuk type "success" auto-dismiss 3 detik (pakai toastTimer ref + clearTimeout), untuk type "error" TIDAK auto-dismiss (menetap). Tambah fungsi dismissToast() yang clear timer + setToast(null), di-expose di return hook.
- admin-dashboard.tsx: toast dirender flex dengan pesan + tombol X (lucide) yang memanggil h.dismissToast. Berguna untuk pesan error pembayaran yang panjang agar sempat dibaca.

## Outcome

- Signal: useful

## Source Nodes

- useAdminDashboard
- admin-dashboard