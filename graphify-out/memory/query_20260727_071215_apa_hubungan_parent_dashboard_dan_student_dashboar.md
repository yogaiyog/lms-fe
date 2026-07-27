---
type: "query"
date: "2026-07-27T07:12:15.498448+00:00"
question: "Apa hubungan Parent Dashboard dan Student Dashboard?"
contributor: "graphify"
outcome: "useful"
---

# Q: Apa hubungan Parent Dashboard dan Student Dashboard?

## Answer

Parent Dashboard dan Student Dashboard terhubung via Sidebar.tsx yang di-share. Keduanya import dari _component/ yang sama (types.ts, Sidebar.tsx, Card.tsx, Topbar.tsx, MobileBottomNav.tsx, MobileDrawer.tsx). Juga sama-sama import api lib/api.ts. Pattern: shared _component/ folder + shared API layer + shared Theme type.

## Outcome

- Signal: useful