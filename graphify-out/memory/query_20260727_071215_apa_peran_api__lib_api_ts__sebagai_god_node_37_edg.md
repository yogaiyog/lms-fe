---
type: "query"
date: "2026-07-27T07:12:15.296128+00:00"
question: "Apa peran api (lib/api.ts) sebagai god node 37 edges?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["api", "getStoredSession", "authenticatedRequest"]
---

# Q: Apa peran api (lib/api.ts) sebagai god node 37 edges?

## Answer

api (lib/api.ts:L618) — 37 edges, backbone frontend. Di-import oleh semua dashboard: student, parent, tutor, admin. Juga oleh login, register, forgot/reset password, verify email, certificate preview, quiz page, hooks (useAdminDashboard, useStudentDashboard, useTutorDashboard, useProgressTracker). Fungsi utama: getStoredSession() untuk session, authenticatedRequest() untuk HTTP calls, uploadImage() untuk upload.

## Outcome

- Signal: useful

## Source Nodes

- api
- getStoredSession
- authenticatedRequest