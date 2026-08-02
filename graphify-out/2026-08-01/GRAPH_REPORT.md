# Graph Report - frontend  (2026-08-01)

## Corpus Check
- 140 files · ~116,715 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 723 nodes · 1239 edges · 64 communities (49 shown, 15 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 17 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `4b4595cc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Parent Dashboard
- Student Dashboard
- Roadmap & Icons
- Tutor Attendance
- Tutor Student Segment
- Dev Config & ESLint
- Certificate Preview
- Capacitor Plugins
- TypeScript References
- Login Page
- Junior Tech Dashboard
- Markdown Parser
- Admin Dashboard
- Admin Student Management
- Admin Class Management
- Student Learning Path
- Android Build Config
- Admin Tutor Management
- Android Native Assets
- Admin Attendance
- App Layout & Fonts
- Admin Curriculum
- Topic Management
- UI Components (Nav, Button)
- Admin Student List
- Android Instrumented Tests
- Admin Navbar
- Home Page
- Register Page
- Android Unit Tests
- Gradle Wrapper
- Create Class Form
- Android MainActivity
- UI Card Component
- UI Input Component
- Public SVG Assets
- capacitor.config.ts
- eslint.config.mjs
- next.config.ts
- postcss.config.mjs
- scratchblocks.d.ts
- tutor-home-segment.tsx
- login-content.tsx
- Q: Apa peran api (lib/api.ts) sebagai god node 37 edges?
- Q: Apa peran getStoredSession sebagai god node 22 edges?
- Q: Bagaimana alur Theme type di frontend?
- Q: Apa hubungan Parent Dashboard dan Student Dashboard?
- Q: Bagaimana alur Capacitor Android build pipeline?
- CurriculumList.tsx
- Q: Bagaimana state billing admin di frontend dan komponennya?
- ClassesTable.tsx
- api
- TutorList.tsx
- register-content.tsx
- Q: Bagaimana alur ubah metode pembayaran invoice setelah tombol bayar dihapus dari detail view?
- Q: Bagaimana alur pembayaran Midtrans charge di UI billing admin?
- tutor-content.tsx
- AllParentsView.tsx

## God Nodes (most connected - your core abstractions)
1. `api` - 40 edges
2. `getStoredSession()` - 22 edges
3. `Schedule` - 17 edges
4. `Theme` - 16 edges
5. `Class` - 16 edges
6. `compilerOptions` - 16 edges
7. `clearSession()` - 14 edges
8. `Theme` - 12 edges
9. `Curriculum` - 11 edges
10. `StudentProfile` - 10 edges

## Surprising Connections (you probably didn't know these)
- `App Logo PNG` --references--> `Capacitor Android Configuration`  [INFERRED]
  public/logo.png → capacitor.config.ts
- `Android Splash Screen (density/orientation variants)` --references--> `Capacitor Android Configuration`  [INFERRED]
  android/app/src/main/res/drawable/splash.png → capacitor.config.ts
- `QuizPage()` --calls--> `getStoredSession()`  [EXTRACTED]
  app/dashboard/student/quiz/[taskId]/page.tsx → lib/api.ts
- `AdminDashboard()` --calls--> `useBilling()`  [EXTRACTED]
  app/dashboard/admin/admin-dashboard.tsx → hooks/useBilling.ts
- `ImagePicker()` --calls--> `uploadImage()`  [EXTRACTED]
  app/dashboard/admin/components/kurikulum/TopicManagement.tsx → lib/api.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Capacitor Android Deployment Pipeline** — frontend_nextjs, frontend_capacitor, frontend_android_apk_build, frontend_node22, frontend_jdk21, frontend_android_sdk [EXTRACTED 1.00]
- **Android Splash Screen (all orientation/density variants)** — android_drawable_splash [INFERRED 0.95]
- **Android Adaptive Launcher Icons (all density variants)** — android_mipmap_ic_launcher, android_mipmap_ic_launcher_round, android_mipmap_ic_launcher_foreground [INFERRED 0.95]
- **Capacitor Android Native Assets** — android_drawable_splash, android_mipmap_ic_launcher, android_mipmap_ic_launcher_round, android_mipmap_ic_launcher_foreground, android_main_activity, capacitor_android_config [INFERRED 0.95]

## Communities (64 total, 15 thin omitted)

### Community 0 - "Parent Dashboard"
Cohesion: 0.07
Nodes (31): DAY_LABELS, TYPE_LABELS, Props, Card(), CATEGORY_LABELS, Props, TYPE_LABELS, MobileBottomNav() (+23 more)

### Community 1 - "Student Dashboard"
Cohesion: 0.24
Nodes (9): ATTENDANCE_LABELS, DATE_PRESETS, DAY_LABELS, fmtDate(), getPresetRange(), Props, ScheduleGroup, Theme (+1 more)

### Community 2 - "Roadmap & Icons"
Cohesion: 0.09
Nodes (30): CheckIcon(), LockIcon(), Level, LevelBadge(), Props, STATUS_STYLES, Roadmap(), fallbackEmojis (+22 more)

### Community 3 - "Tutor Attendance"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Bagaimana detail invoice dirender sebagai view (bukan modal) di halaman billing admin?, Source Nodes

### Community 4 - "Tutor Student Segment"
Cohesion: 0.12
Nodes (20): BadgeList(), ATTENDANCE_LABELS, Card(), CATEGORY_LABELS, Props, Props, StudentProfileCard(), AspectSummary (+12 more)

### Community 5 - "Dev Config & ESLint"
Cohesion: 0.05
Nodes (36): @capacitor/assets, @capacitor/cli, eslint, eslint-config-next, devDependencies, @capacitor/assets, @capacitor/cli, eslint (+28 more)

### Community 6 - "Certificate Preview"
Cohesion: 0.06
Nodes (41): PreviewMode, BANKS, InvoiceFormModal(), MethodKey, Props, WALLETS, CertificatePreviewModal(), PreviewMode (+33 more)

### Community 7 - "Capacitor Plugins"
Cohesion: 0.06
Nodes (31): @capacitor/android, @capacitor/browser, @capacitor/core, @capacitor/filesystem, @capacitor/share, @capawesome/capacitor-pdf-viewer, framer-motion, lucide-react (+23 more)

### Community 8 - "TypeScript References"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 9 - "Login Page"
Cohesion: 0.12
Nodes (16): ApiError, ApiSuccess, AttendanceAssessment, AttendanceAssessmentScore, authenticatedRequest(), AuthSession, Badge, CurriculumCategory (+8 more)

### Community 10 - "Junior Tech Dashboard"
Cohesion: 0.13
Nodes (9): ClassDetailPage(), COURSE, DashboardPage(), MEETINGS, MOBILE_NAV, NAV_ITEMS, ReportDetailPage(), STUDENT (+1 more)

### Community 11 - "Markdown Parser"
Cohesion: 0.14
Nodes (15): BLOCK_TYPES, extractCollapseContent(), findEarliestBlockStart(), parseChoices(), parseQuiz(), parseStepMarkdown(), Category, ContentSegment (+7 more)

### Community 12 - "Admin Dashboard"
Cohesion: 0.22
Nodes (6): AllEnrollmentsView(), AdminSidebar(), Props, ApproveRejectModal(), Props, RequestClass

### Community 13 - "Admin Student Management"
Cohesion: 0.24
Nodes (6): Props, Props, AddStudentModal(), Category, checkEmail(), ParentProfile

### Community 14 - "Admin Class Management"
Cohesion: 0.17
Nodes (8): DAY_NAMES, Props, Props, Props, CATEGORY_LABELS, CLASS_TYPE_LABELS, DAY_LABELS, STATUS_LABELS

### Community 15 - "Student Learning Path"
Cohesion: 0.18
Nodes (11): LearningPathView(), mapCurriculumToUnits(), Props, Props, STATUS_STYLES, UnitSection(), getTaskStatusFromMap(), ProgressMap (+3 more)

### Community 16 - "Android Build Config"
Cohesion: 0.21
Nodes (11): Android APK Build Process, Android SDK Requirement, Capacitor Framework, Capacitor Build Rules, create-next-app, Geist Font, Java JDK 21 Requirement, Next.js Framework (+3 more)

### Community 17 - "Admin Tutor Management"
Cohesion: 0.24
Nodes (10): AdminDashboard(), DAY_LABELS, DAYS, fmt(), HOURS, isInRange(), Props, TutorDetailModal() (+2 more)

### Community 18 - "Android Native Assets"
Cohesion: 0.29
Nodes (10): Android Splash Screen (density/orientation variants), MainActivity.java (BridgeActivity), Android Launcher Icon (density variants), Android Adaptive Icon Foreground (density variants), Android Round Launcher Icon (density variants), App Branding Asset Group, Capacitor Android Configuration, App Logo PNG (+2 more)

### Community 19 - "Admin Attendance"
Cohesion: 0.28
Nodes (8): AdminAttendance(), ATTENDANCE_LABELS, DATE_PRESETS, DAY_LABELS, fmtDate(), getPresetRange(), ScheduleGroup, TutorOption

### Community 20 - "App Layout & Fonts"
Cohesion: 0.25
Nodes (6): geistMono, geistSans, lexend, metadata, viewport, QueryProvider()

### Community 21 - "Admin Curriculum"
Cohesion: 0.33
Nodes (4): Props, TASK_TYPE_LABELS, TaskWithQuiz, QuizQuestionData

### Community 22 - "Topic Management"
Cohesion: 0.29
Nodes (6): ImagePicker(), Props, GalleryUploadModal(), ImageRecord, images, uploadImage()

### Community 23 - "UI Components (Nav, Button)"
Cohesion: 0.33
Nodes (4): NavProps, Button(), ButtonProps, variants

### Community 24 - "Admin Student List"
Cohesion: 0.40
Nodes (5): fmtDate(), Props, SortDir, StudentItem, StudentList()

### Community 25 - "Android Instrumented Tests"
Cohesion: 0.60
Nodes (3): ExampleInstrumentedTest, Test, RunWith

### Community 26 - "Admin Navbar"
Cohesion: 0.40
Nodes (3): items, MainMenu, Props

### Community 28 - "Register Page"
Cohesion: 0.20
Nodes (10): InvoiceDetailView(), paymentExpiry(), Props, formatIDR(), INVOICE_STATUS_COLORS, InvoiceList(), PAYMENT_STATUS_COLORS, Props (+2 more)

### Community 30 - "Gradle Wrapper"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 31 - "Create Class Form"
Cohesion: 0.14
Nodes (9): Props, Props, Props, StudentItem, TutorOption, AssessmentAspect, AssessmentSet, Curriculum (+1 more)

### Community 35 - "Public SVG Assets"
Cohesion: 0.67
Nodes (3): File Icon SVG, Globe Icon SVG, Window Icon SVG

### Community 47 - "tutor-home-segment.tsx"
Cohesion: 0.33
Nodes (7): ClassWithSchedules, DAY_LABELS, getStudentName(), getThisWeekSchedules(), getWeekRange(), Theme, TutorHomeSegment()

### Community 49 - "Q: Apa peran api (lib/api.ts) sebagai god node 37 edges?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Apa peran api (lib/api.ts) sebagai god node 37 edges?, Source Nodes

### Community 50 - "Q: Apa peran getStoredSession sebagai god node 22 edges?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Apa peran getStoredSession sebagai god node 22 edges?, Source Nodes

### Community 51 - "Q: Bagaimana alur Theme type di frontend?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Bagaimana alur Theme type di frontend?, Source Nodes

### Community 52 - "Q: Apa hubungan Parent Dashboard dan Student Dashboard?"
Cohesion: 0.50
Nodes (3): Answer, Outcome, Q: Apa hubungan Parent Dashboard dan Student Dashboard?

### Community 53 - "Q: Bagaimana alur Capacitor Android build pipeline?"
Cohesion: 0.50
Nodes (3): Answer, Outcome, Q: Bagaimana alur Capacitor Android build pipeline?

### Community 55 - "Q: Bagaimana state billing admin di frontend dan komponennya?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Bagaimana state billing admin di frontend dan komponennya?, Source Nodes

### Community 56 - "ClassesTable.tsx"
Cohesion: 0.19
Nodes (8): LABELS, MixedContent(), QuizPage(), Blocks3Renderer(), Props, QuizData, MixedSegment, parseMixedContent()

### Community 60 - "Q: Bagaimana alur ubah metode pembayaran invoice setelah tombol bayar dihapus dari detail view?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Bagaimana alur ubah metode pembayaran invoice setelah tombol bayar dihapus dari detail view?, Source Nodes

### Community 61 - "Q: Bagaimana alur pembayaran Midtrans charge di UI billing admin?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Bagaimana alur pembayaran Midtrans charge di UI billing admin?, Source Nodes

### Community 63 - "tutor-content.tsx"
Cohesion: 0.06
Nodes (30): CATEGORY_LABELS, DashboardContent(), DAY_LABELS, StudentWithDetails, ParentDashboard(), DAY_LABELS, DAYS, fmt() (+22 more)

### Community 67 - "AllParentsView.tsx"
Cohesion: 0.67
Nodes (3): AllParentsView(), fmtDate(), Props

## Ambiguous Edges - Review These
- `Seamless Background JPG` → `App Branding Asset Group`  [AMBIGUOUS]
  public/seamless.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **262 isolated node(s):** `PreviewMode`, `MainMenu`, `Props`, `items`, `Props` (+257 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **15 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Work-memory lessons

**Preferred sources** — corroborated by past sessions; start here.
- `admin-dashboard.tsx` (2× useful, score=1.989337862) _(code changed — re-verify)_
- `useBilling.ts` (2× useful, score=1.989337862) _(code changed — re-verify)_

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Seamless Background JPG` and `App Branding Asset Group`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `api` connect `api` to `Parent Dashboard`, `Student Dashboard`, `Tutor Student Segment`, `Certificate Preview`, `Login Page`, `Admin Student Management`, `Admin Class Management`, `Student Learning Path`, `login-content.tsx`, `Admin Tutor Management`, `Admin Attendance`, `Admin Curriculum`, `Topic Management`, `ClassesTable.tsx`, `register-content.tsx`, `tutor-content.tsx`, `Create Class Form`?**
  _High betweenness centrality (0.058) - this node is a cross-community bridge._
- **Why does `getStoredSession()` connect `tutor-content.tsx` to `Parent Dashboard`, `Login Page`, `Admin Tutor Management`, `Topic Management`, `ClassesTable.tsx`, `Create Class Form`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `RoadmapItem` connect `Roadmap & Icons` to `Parent Dashboard`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `PreviewMode`, `MainMenu`, `Props` to the rest of the system?**
  _262 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Parent Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.07364114552893045 - nodes in this community are weakly interconnected._
- **Should `Roadmap & Icons` be split into smaller, more focused modules?**
  _Cohesion score 0.08970099667774087 - nodes in this community are weakly interconnected._