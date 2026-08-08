---
type: "query"
date: "2026-08-08T06:13:48.837768+00:00"
question: "Bagaimana perubahan warna theme student dashboard ke brand #013798 dan yellow?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["globals.css", "Sidebar.tsx", "OverviewTab.tsx", "MobileDrawer.tsx"]
---

# Q: Bagaimana perubahan warna theme student dashboard ke brand #013798 dan yellow?

## Answer

Theme student dashboard diubah dari frosted-blue/dark-amethyst gradient ke solid brand colors: #013798 (brand-blue) sebagai primary dan #FFD100 (brand-yellow) sebagai accent. Semua frosted-blue-* diganti brand-blue-* di 14 file. Gradient dihapus: Sidebar active nav solid bg-brand-blue-500, hero card solid bg-brand-blue-500, MobileDrawer solid. Sidebar split layout: atas 70% white, bawah 30% bg-brand-yellow-400 dengan help card bg-brand-yellow-300. Brand colors ditambahkan ke globals.css @theme dengan shade range 50-950.

## Outcome

- Signal: useful

## Source Nodes

- globals.css
- Sidebar.tsx
- OverviewTab.tsx
- MobileDrawer.tsx