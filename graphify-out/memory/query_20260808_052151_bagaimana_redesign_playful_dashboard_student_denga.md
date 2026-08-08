---
type: "query"
date: "2026-08-08T05:21:51.343582+00:00"
question: "Bagaimana redesign playful dashboard student dengan palete brand kustom?"
contributor: "graphify"
outcome: "useful"
source_nodes: ["Card.tsx", "Sidebar.tsx", "Topbar.tsx", "MobileBottomNav.tsx", "OverviewTab.tsx", "types.ts"]
---

# Q: Bagaimana redesign playful dashboard student dengan palete brand kustom?

## Answer

Redesign student dashboard pakai palete brand custom dari globals.css: frosted-blue (primary), tea-green/emerald (success), dark-amethyst (gradient sekunder), berry-lipstick (accent hangat). Perubahan: Card rounded-1.75rem + hover lift shadow-frosted-blue; Sidebar active pakai gradient frosted-blue-to-dark-amethyst; Topbar hover pakai frosted-blue; MobileBottomNav animated pill via framer-motion layoutId; OverviewTab hero gradient frosted-blue-to-dark-amethyst + framer-motion stagger entrance. Konsistensi warna: semua blue-* diganti frosted-blue-* di ScheduleTab, ReportTab, EnrollmentTab, BadgesTab, RoadmapTab, LearningPathView, student-dashboard, quiz page. Dark mode fixes: ReportTab gallery card/modal, RoadmapTab select, LearningPathView empty state pakai theme.*. Branch: redesign/student-dashboard. Rollback: git checkout HEAD -- app/dashboard/student/

## Outcome

- Signal: useful

## Source Nodes

- Card.tsx
- Sidebar.tsx
- Topbar.tsx
- MobileBottomNav.tsx
- OverviewTab.tsx
- types.ts