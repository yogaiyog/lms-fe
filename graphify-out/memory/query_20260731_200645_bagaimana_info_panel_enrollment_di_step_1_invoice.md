---
type: "query"
date: "2026-07-31T20:06:45.972786+00:00"
question: "Bagaimana info panel enrollment di step 1 invoice form menampilkan detail Total Meet Purchased, Total Meet Left, Total Topics, Sisa Kuota dan validasi meetCount + totalMeetPurchased tidak boleh melebihi total topics?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["InvoiceFormModal.tsx", "enrollments.route.ts"]
---

# Q: Bagaimana info panel enrollment di step 1 invoice form menampilkan detail Total Meet Purchased, Total Meet Left, Total Topics, Sisa Kuota dan validasi meetCount + totalMeetPurchased tidak boleh melebihi total topics?

## Answer

InvoiceFormModal.tsx step 1: setelah dropdown enrollment, muncul info panel biru (selectedEnrollment) menampilkan totalMeetPurchased, totalMeetLeft, curriculum.topics.length (total topics), dan sisa kuota = topics - meetPurchased. Validasi meetsExceeded via useMemo: const m = Number(meetCount) || 0; return m + (selectedEnrollment.totalMeetPurchased ?? 0) > topics. Jika true: error teks merah 'Pertemuan (N) + Total Meet Purchased (N) = N melebihi total topics (N)' di bawah input pertemuan, dan canGoNextStep1 menambah && !meetsExceeded -> Lanjut disabled. Backend: enrollments.route.ts include diubah menjadi curriculum: { include: { topics: true } } agar API mengembalikan data topics array untuk hitung panjangnya.

## Outcome

- Signal: useful

## Source Nodes

- InvoiceFormModal.tsx
- enrollments.route.ts