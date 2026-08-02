# Graph Report - frontend  (2026-07-31)

## Corpus Check
- 140 files · ~117,283 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 722 nodes · 1255 edges · 70 communities (57 shown, 13 thin omitted)
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
- AddTutorForm.tsx
- TutorList.tsx
- register-content.tsx
- Q: Bagaimana alur pembayaran Midtrans charge di UI billing admin?
- ApproveRejectModal.tsx
- tutor-content.tsx
- slot-grid.tsx
- PaymentMethodModal.tsx
- tutor-classes-segment.tsx
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
- `ImagePicker()` --calls--> `uploadImage()`  [EXTRACTED]
  app/dashboard/admin/components/kurikulum/TopicManagement.tsx → lib/api.ts
- `useAdminDashboard()` --calls--> `clearSession()`  [EXTRACTED]
  app/dashboard/admin/hooks/useAdminDashboard.ts → lib/api.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Capacitor Android Deployment Pipeline** — frontend_nextjs, frontend_capacitor, frontend_android_apk_build, frontend_node22, frontend_jdk21, frontend_android_sdk [EXTRACTED 1.00]
- **Android Splash Screen (all orientation/density variants)** — android_drawable_splash [INFERRED 0.95]
- **Android Adaptive Launcher Icons (all density variants)** — android_mipmap_ic_launcher, android_mipmap_ic_launcher_round, android_mipmap_ic_launcher_foreground [INFERRED 0.95]
- **Capacitor Android Native Assets** — android_drawable_splash, android_mipmap_ic_launcher, android_mipmap_ic_launcher_round, android_mipmap_ic_launcher_foreground, android_main_activity, capacitor_android_config [INFERRED 0.95]

## Communities (70 total, 13 thin omitted)

### Community 0 - "Parent Dashboard"
Cohesion: 0.07
Nodes (34): DAY_LABELS, TYPE_LABELS, Props, Card(), CATEGORY_LABELS, Props, TYPE_LABELS, MobileBottomNav() (+26 more)

### Community 1 - "Student Dashboard"
Cohesion: 0.14
Nodes (12): CATEGORY_LABELS, DashboardContent(), DAY_LABELS, StudentWithDetails, ParentDashboard(), CurriculumDetail(), CATEGORY_LABELS, KurikulumList() (+4 more)

### Community 2 - "Roadmap & Icons"
Cohesion: 0.09
Nodes (31): CheckIcon(), LockIcon(), Level, LevelBadge(), Props, STATUS_STYLES, Roadmap(), fallbackEmojis (+23 more)

### Community 3 - "Tutor Attendance"
Cohesion: 0.24
Nodes (9): ATTENDANCE_LABELS, DATE_PRESETS, DAY_LABELS, fmtDate(), getPresetRange(), Props, ScheduleGroup, Theme (+1 more)

### Community 4 - "Tutor Student Segment"
Cohesion: 0.12
Nodes (20): BadgeList(), ATTENDANCE_LABELS, Card(), CATEGORY_LABELS, Props, Props, StudentProfileCard(), AspectSummary (+12 more)

### Community 5 - "Dev Config & ESLint"
Cohesion: 0.05
Nodes (36): @capacitor/assets, @capacitor/cli, eslint, eslint-config-next, devDependencies, @capacitor/assets, @capacitor/cli, eslint (+28 more)

### Community 6 - "Certificate Preview"
Cohesion: 0.10
Nodes (28): PreviewMode, AdminDashboard(), CertificatePreviewModal(), PreviewMode, Props, ReportTab(), Aspect, AssessmentScoreItem (+20 more)

### Community 7 - "Capacitor Plugins"
Cohesion: 0.06
Nodes (31): @capacitor/android, @capacitor/browser, @capacitor/core, @capacitor/filesystem, @capacitor/share, @capawesome/capacitor-pdf-viewer, framer-motion, lucide-react (+23 more)

### Community 8 - "TypeScript References"
Cohesion: 0.07
Nodes (28): dom, dom.iterable, esnext, **/*.mts, .next/dev/types/**/*.ts, next-env.d.ts, .next/types/**/*.ts, node_modules (+20 more)

### Community 9 - "Login Page"
Cohesion: 0.12
Nodes (15): ApiError, ApiSuccess, AttendanceAssessment, AttendanceAssessmentScore, authenticatedRequest(), AuthSession, Badge, CurriculumCategory (+7 more)

### Community 10 - "Junior Tech Dashboard"
Cohesion: 0.13
Nodes (9): ClassDetailPage(), COURSE, DashboardPage(), MEETINGS, MOBILE_NAV, NAV_ITEMS, ReportDetailPage(), STUDENT (+1 more)

### Community 11 - "Markdown Parser"
Cohesion: 0.14
Nodes (15): BLOCK_TYPES, extractCollapseContent(), findEarliestBlockStart(), parseChoices(), parseQuiz(), parseStepMarkdown(), Category, ContentSegment (+7 more)

### Community 12 - "Admin Dashboard"
Cohesion: 0.18
Nodes (6): AllEnrollmentsView(), AdminSidebar(), Props, InvoiceFormModal(), DAY_LABELS, Props

### Community 13 - "Admin Student Management"
Cohesion: 0.19
Nodes (8): Props, Props, StudentItem, TutorOption, AddStudentModal(), Category, checkEmail(), ParentProfile

### Community 14 - "Admin Class Management"
Cohesion: 0.15
Nodes (9): DAY_NAMES, Props, Props, Props, Props, CATEGORY_LABELS, CLASS_TYPE_LABELS, DAY_LABELS (+1 more)

### Community 15 - "Student Learning Path"
Cohesion: 0.33
Nodes (7): LearningPathView(), mapCurriculumToUnits(), Props, getTaskStatusFromMap(), ProgressMap, ProgressRecord, useProgressTracker()

### Community 16 - "Android Build Config"
Cohesion: 0.21
Nodes (11): Android APK Build Process, Android SDK Requirement, Capacitor Framework, Capacitor Build Rules, create-next-app, Geist Font, Java JDK 21 Requirement, Next.js Framework (+3 more)

### Community 17 - "Admin Tutor Management"
Cohesion: 0.24
Nodes (10): DAY_LABELS, DAYS, fmt(), HOURS, isInRange(), Props, TutorDetailModal(), TutorItem (+2 more)

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
Cohesion: 0.18
Nodes (11): InvoiceDetailModal(), Props, formatIDR(), INVOICE_STATUS_COLORS, InvoiceList(), PAYMENT_STATUS_COLORS, Props, METHODS (+3 more)

### Community 30 - "Gradle Wrapper"
Cohesion: 0.83
Nodes (3): gradlew script, die(), warn()

### Community 31 - "Create Class Form"
Cohesion: 0.22
Nodes (5): Props, Props, STATUS_STYLES, Curriculum, TopicTask

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

### Community 54 - "CurriculumList.tsx"
Cohesion: 0.40
Nodes (3): Props, AssessmentAspect, AssessmentSet

### Community 55 - "Q: Bagaimana state billing admin di frontend dan komponennya?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Bagaimana state billing admin di frontend dan komponennya?, Source Nodes

### Community 56 - "ClassesTable.tsx"
Cohesion: 0.19
Nodes (8): LABELS, MixedContent(), QuizPage(), Blocks3Renderer(), Props, QuizData, MixedSegment, parseMixedContent()

### Community 57 - "AddTutorForm.tsx"
Cohesion: 0.16
Nodes (10): BANKS, MethodKey, Props, WALLETS, InvoiceFormPayload, InvoicePaymentMethod, ManualPaymentPayload, SubmitInvoiceResult (+2 more)

### Community 61 - "Q: Bagaimana alur pembayaran Midtrans charge di UI billing admin?"
Cohesion: 0.40
Nodes (4): Answer, Outcome, Q: Bagaimana alur pembayaran Midtrans charge di UI billing admin?, Source Nodes

### Community 62 - "ApproveRejectModal.tsx"
Cohesion: 0.50
Nodes (3): ApproveRejectModal(), Props, RequestClass

### Community 63 - "tutor-content.tsx"
Cohesion: 0.21
Nodes (7): MOBILE_NAV, NAV_ITEMS, TutorDashboard(), DAY_LABELS, Theme, useTutorDashboard(), Attendance

### Community 64 - "slot-grid.tsx"
Cohesion: 0.28
Nodes (6): DAY_LABELS, DAYS, fmt(), HOURS, isInRange(), SlotGrid()

### Community 65 - "PaymentMethodModal.tsx"
Cohesion: 0.25
Nodes (5): BANKS, EWALLETS, PaymentMethodModal(), Props, MidtransBank

### Community 66 - "tutor-classes-segment.tsx"
Cohesion: 0.25
Nodes (5): CATEGORY_LABELS, ClassWithDetails, DAY_LABELS, Theme, Topic

### Community 67 - "AllParentsView.tsx"
Cohesion: 0.67
Nodes (3): AllParentsView(), fmtDate(), Props

## Ambiguous Edges - Review These
- `Seamless Background JPG` → `App Branding Asset Group`  [AMBIGUOUS]
  public/seamless.jpg · relation: conceptually_related_to

## Knowledge Gaps
- **259 isolated node(s):** `PreviewMode`, `MainMenu`, `Props`, `items`, `Props` (+254 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **13 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Seamless Background JPG` and `App Branding Asset Group`?**
  _Edge tagged AMBIGUOUS (relation: conceptually_related_to) - confidence is low._
- **Why does `api` connect `register-content.tsx` to `Parent Dashboard`, `Student Dashboard`, `Tutor Attendance`, `Tutor Student Segment`, `Certificate Preview`, `Login Page`, `Admin Student Management`, `Admin Class Management`, `Student Learning Path`, `Admin Tutor Management`, `Admin Attendance`, `Admin Curriculum`, `Topic Management`, `Create Class Form`, `login-content.tsx`, `CurriculumList.tsx`, `ClassesTable.tsx`, `AddTutorForm.tsx`, `api`, `tutor-content.tsx`, `slot-grid.tsx`, `tutor-classes-segment.tsx`, `verify-email/page.tsx`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `getStoredSession()` connect `Student Dashboard` to `Parent Dashboard`, `slot-grid.tsx`, `Login Page`, `Admin Student Management`, `Admin Tutor Management`, `Topic Management`, `ClassesTable.tsx`, `tutor-content.tsx`?**
  _High betweenness centrality (0.011) - this node is a cross-community bridge._
- **Why does `RoadmapItem` connect `Roadmap & Icons` to `Parent Dashboard`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `PreviewMode`, `MainMenu`, `Props` to the rest of the system?**
  _259 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Parent Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.06912442396313365 - nodes in this community are weakly interconnected._
- **Should `Student Dashboard` be split into smaller, more focused modules?**
  _Cohesion score 0.1380952380952381 - nodes in this community are weakly interconnected._