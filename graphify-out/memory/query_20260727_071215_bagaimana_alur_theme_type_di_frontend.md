---
type: "query"
date: "2026-07-27T07:12:15.431112+00:00"
question: "Bagaimana alur Theme type di frontend?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Theme"]
---

# Q: Bagaimana alur Theme type di frontend?

## Answer

Theme (app/dashboard/student/_component/types.ts:L5) — 16 edges. Type theme yang dipakai oleh 14 component di student & parent dashboard: ReportTab, EnrollmentTab, LearningPathView, RoadmapTab, BadgesTab, OverviewTab, ScheduleTab, Sidebar, Card, MobileBottomNav, MobileDrawer, Topbar. Juga di tutor-roadmap-segment. Semua component ini nerima theme sebagai prop untuk styling konsisten.

## Outcome

- Signal: useful

## Source Nodes

- Theme