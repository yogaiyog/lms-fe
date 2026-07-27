---
type: "query"
date: "2026-07-27T07:12:15.363621+00:00"
question: "Apa peran getStoredSession sebagai god node 22 edges?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["getStoredSession", "readFromStorage", "authenticatedRequest"]
---

# Q: Apa peran getStoredSession sebagai god node 22 edges?

## Answer

getStoredSession() (lib/api.ts:L419) — 22 edges. Initial session loader yang dipanggil di entry point tiap role: StudentDashboard, ParentDashboard, TutorDashboard, useAdminDashboard, dan juga di slot-grid, quiz page, curriculum pages. Fungsi internal: readFromStorage() + authenticatedRequest().

## Outcome

- Signal: useful

## Source Nodes

- getStoredSession
- readFromStorage
- authenticatedRequest