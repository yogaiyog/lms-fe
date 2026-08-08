---
type: "query"
date: "2026-08-08T04:47:28.513420+00:00"
question: "Bagaimana konfigurasi font di frontend setelah migrasi ke Poppins?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["poppins", "lexend", "layout.tsx", "globals.css"]
---

# Q: Bagaimana konfigurasi font di frontend setelah migrasi ke Poppins?

## Answer

Font di-load di app/layout.tsx via next/font/google: Poppins (weight 400/500/600/700, variable --font-poppins) dan Lexend (variable --font-lexend), dipasang sebagai class di html. Pemakaian di app/globals.css (Tailwind v4 @theme): --font-sans: var(--font-poppins), Arial, sans-serif (L6) menjadikan Poppins font body default dengan fallback Arial; @layer base h1-h6 pakai var(--font-lexend). Geist Sans & Geist Mono sudah dihapus. font-mono eksplisit (nomor invoice di InvoiceDetailView/InvoiceList/Pemasukan, textarea TopicTaskEditor) pakai system mono stack bawaan Tailwind, bukan Geist Mono.

## Outcome

- Signal: useful

## Source Nodes

- poppins
- lexend
- layout.tsx
- globals.css