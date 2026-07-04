import React, { useState, useEffect, useMemo } from "react";
import {
  Home, BookOpen, Milestone, History as HistoryIcon, ClipboardList, Award,
  User, Bell, Moon, Sun, Globe, Video, Download, FileText, CheckCircle2,
  Lock, Clock, ChevronRight, PlayCircle, Calendar, Users,
  Star, ArrowLeft, X, Menu, Sparkles, MessageSquareQuote, ClipboardCheck,
  Rocket
} from "lucide-react";

// ---------------------------------------------------------------------------
// Mock data — Kevin, Scratch JR Batch 1
// ---------------------------------------------------------------------------
const STUDENT = { name: "Kevin", initials: "K" };

const COURSE = {
  id: "scratch-jr-1",
  name: "Scratch JR Batch 1",
  emoji: "🐱",
  schedule: "Every Thursday · 15:00 WIB",
  teacher: "Mr. Yoga",
  teacherInitials: "MY",
  totalMeetings: 12,
  completed: 3,
  currentMeeting: 4,
  currentTopic: "Variables & Scoring System",
  meetLink: "https://meet.google.com/xxx-yyyy-zzz",
  nextDateISO: "2026-07-03T15:00:00+07:00",
  nextDateLabel: "Thursday, 3 July",
  nextTimeLabel: "15:00 – 16:30 WIB",
};

const MEETINGS = [
  { id: 1, topic: "Introduction to Scratch", status: "completed", icon: "👋",
    attendance: "Present", homeworkScore: 90,
    feedback: "Kevin picked up the Scratch interface quickly and asked great questions.",
    material: "01-intro-to-scratch.pdf", recording: "meeting-1-recording.mp4" },
  { id: 2, topic: "Motion Block", status: "completed", icon: "🏃",
    attendance: "Present", homeworkScore: 88,
    feedback: "Nice work animating the cat sprite — timing could be a bit smoother.",
    material: "02-motion-block.pdf", recording: "meeting-2-recording.mp4" },
  { id: 3, topic: "Events", status: "completed", icon: "⚡",
    attendance: "Present", homeworkScore: 95,
    feedback: "Great job understanding events and broadcasting.",
    material: "03-events.pdf", recording: "meeting-3-recording.mp4" },
  { id: 4, topic: "Variables & Scoring System", status: "upcoming", icon: "🔢" },
  { id: 5, topic: "Loops", status: "locked", icon: "🔁" },
  { id: 6, topic: "Conditions", status: "locked", icon: "🚦" },
  { id: 7, topic: "Animation", status: "locked", icon: "🎬" },
  { id: 8, topic: "Maze Game", status: "locked", icon: "🧩" },
  { id: 9, topic: "Quiz Game", status: "locked", icon: "❓" },
  { id: 10, topic: "Platformer", status: "locked", icon: "🎮" },
  { id: 11, topic: "Final Project", status: "locked", icon: "🚀" },
  { id: 12, topic: "Presentation Day", status: "locked", icon: "🎤" },
];

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: Home },
  { key: "classes", label: "My Classes", icon: BookOpen },
  { key: "curriculum", label: "Curriculum", icon: Milestone },
  { key: "history", label: "History", icon: HistoryIcon },
  { key: "homework", label: "Homework", icon: ClipboardList },
  { key: "certificates", label: "Certificates", icon: Award },
  { key: "profile", label: "Profile", icon: User },
];

const MOBILE_NAV = ["dashboard", "classes", "curriculum", "history", "profile"];

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------
function useCountdown(targetISO) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const target = useMemo(() => new Date(targetISO), [targetISO]);
  let diff = Math.max(0, target.getTime() - now.getTime());
  const d = Math.floor(diff / 86400000); diff -= d * 86400000;
  const h = Math.floor(diff / 3600000); diff -= h * 3600000;
  const m = Math.floor(diff / 60000); diff -= m * 60000;
  const s = Math.floor(diff / 1000);
  return { d, h, m, s, isPast: target.getTime() - now.getTime() <= 0 };
}

function StatusBadge({ status, theme }) {
  const map = {
    completed: { label: "Completed", cls: "bg-emerald-100 text-emerald-700", icon: CheckCircle2 },
    upcoming: { label: "Upcoming", cls: "bg-orange-100 text-orange-700", icon: Clock },
    locked: { label: "Locked", cls: theme.dark ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400", icon: Lock },
  };
  const m = map[status];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${m.cls}`}>
      <Icon size={13} strokeWidth={2.5} />
      {m.label}
    </span>
  );
}

function ProgressBar({ value, total, colorClass = "bg-blue-600", theme }) {
  const pct = Math.round((value / total) * 100);
  return (
    <div className="w-full">
      <div className={`h-3 w-full rounded-full overflow-hidden ${theme.dark ? "bg-slate-800" : "bg-slate-100"}`}>
        <div className={`h-full rounded-full ${colorClass} transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Card({ children, className = "", theme, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl border ${theme.border} ${theme.card} shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function PageHeader({ title, subtitle, theme, onBack }) {
  return (
    <div className="mb-6 flex items-start gap-3">
      {onBack && (
        <button
          onClick={onBack}
          className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${theme.border} ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}
        >
          <ArrowLeft size={18} />
        </button>
      )}
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>{title}</h1>
        {subtitle && <p className={`mt-1 text-sm ${theme.textMuted}`}>{subtitle}</p>}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard page
// ---------------------------------------------------------------------------
function DashboardPage({ theme, go }) {
  const { d, h, m, s } = useCountdown(COURSE.nextDateISO);

  return (
    <div className="space-y-6">
      {/* Welcome card */}
      <Card theme={theme} className="p-6 sm:p-7 bg-gradient-to-br from-blue-600 to-blue-700 border-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-2xl font-extrabold text-white ring-4 ring-white/10">
              {STUDENT.initials}
            </div>
            <div>
              <p className="text-blue-100 text-sm font-medium">Welcome back,</p>
              <h1 className="text-2xl font-extrabold text-white">{STUDENT.name}! 👋</h1>
              <p className="text-blue-100 text-sm mt-0.5">{COURSE.emoji} {COURSE.name}</p>
            </div>
          </div>
          <div className="flex gap-6 sm:gap-8 sm:pl-6 sm:border-l sm:border-white/20">
            <div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide">Progress</p>
              <p className="text-2xl font-extrabold text-white">25%</p>
            </div>
            <div>
              <p className="text-blue-100 text-xs font-semibold uppercase tracking-wide">Meetings</p>
              <p className="text-2xl font-extrabold text-white">3 <span className="text-blue-200 text-base font-semibold">/ 12</span></p>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <ProgressBar value={3} total={12} colorClass="bg-white" theme={{ dark: false }} />
        </div>
      </Card>

      {/* This week's class — hero card */}
      <Card theme={theme} className="p-6 sm:p-7 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-orange-50 opacity-60" />
        <div className="relative">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-lg">📚</span>
              <div>
                <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>This week&apos;s class</p>
                <p className={`font-bold ${theme.text}`}>{COURSE.name}</p>
              </div>
            </div>
            <StatusBadge status="upcoming" theme={theme} />
          </div>

          <div className="mt-5 grid grid-cols-1 md:grid-cols-[1.3fr_1fr] gap-6">
            <div>
              <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>Meeting #{COURSE.currentMeeting} · Topic</p>
              <h2 className={`text-xl font-extrabold mt-1 ${theme.text}`}>{COURSE.currentTopic}</h2>

              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-blue-600" />
                  <span className={theme.text}>{COURSE.nextDateLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-blue-600" />
                  <span className={theme.text}>{COURSE.nextTimeLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={16} className="text-blue-600" />
                  <span className={theme.text}>{COURSE.teacher}</span>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href={COURSE.meetLink}
                  className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 transition-colors"
                >
                  <Video size={17} /> Join Google Meet
                </a>
                <button
                  onClick={() => go("curriculum")}
                  className={`inline-flex items-center gap-2 rounded-2xl border ${theme.border} px-5 py-3 text-sm font-bold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}
                >
                  <FileText size={17} /> View Material
                </button>
              </div>
            </div>

            {/* Countdown */}
            <div className={`rounded-2xl p-5 ${theme.dark ? "bg-slate-800" : "bg-orange-50"}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600 flex items-center gap-1.5">
                <Sparkles size={14} /> Class starts in
              </p>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[["Days", d], ["Hrs", h], ["Min", m], ["Sec", s]].map(([label, val]) => (
                  <div key={label} className={`rounded-xl py-2 ${theme.dark ? "bg-slate-900" : "bg-white"}`}>
                    <p className="text-lg font-extrabold text-orange-600 tabular-nums">{String(val).padStart(2, "0")}</p>
                    <p className={`text-[10px] font-semibold uppercase ${theme.textMuted}`}>{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Course progress */}
      <Card theme={theme} className="p-6 sm:p-7">
        <div className="flex items-center justify-between mb-4">
          <h3 className={`font-bold ${theme.text}`}>Course Progress</h3>
          <span className={`text-sm font-semibold ${theme.textMuted}`}>3 / 12 meetings completed</span>
        </div>
        <ProgressBar value={3} total={12} theme={theme} />
        <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MEETINGS.slice(0, 4).map((mm) => (
            <div key={mm.id} className={`rounded-2xl border ${theme.border} p-3 text-center ${mm.status === "upcoming" ? "ring-2 ring-orange-300" : ""}`}>
              <span className="text-xl">{mm.icon}</span>
              <p className={`mt-1 text-xs font-bold ${theme.text}`}>Meeting {mm.id}</p>
              <div className="mt-1 flex justify-center">
                {mm.status === "completed" && <CheckCircle2 size={16} className="text-emerald-500" />}
                {mm.status === "upcoming" && <Clock size={16} className="text-orange-500" />}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// My Classes page
// ---------------------------------------------------------------------------
function ClassesPage({ theme, go }) {
  return (
    <div>
      <PageHeader title="My Classes" subtitle="All your active courses in one place." theme={theme} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Card theme={theme} className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-purple-50 text-xl">{COURSE.emoji}</span>
              <div>
                <h3 className={`font-bold ${theme.text}`}>{COURSE.name}</h3>
                <p className={`text-sm ${theme.textMuted}`}>{COURSE.schedule}</p>
              </div>
            </div>
            <StatusBadge status="upcoming" theme={theme} />
          </div>

          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-1.5">
              <Milestone size={15} className="text-purple-600" />
              <span className={theme.text}>{COURSE.totalMeetings} Meetings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users size={15} className="text-purple-600" />
              <span className={theme.text}>{COURSE.teacher}</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className={theme.textMuted}>Progress</span>
              <span className={theme.text}>3 / 12</span>
            </div>
            <ProgressBar value={3} total={12} colorClass="bg-purple-600" theme={theme} />
          </div>

          <button
            onClick={() => go("classDetail")}
            className="mt-5 w-full rounded-2xl bg-blue-600 py-3 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
          >
            View Class
          </button>
        </Card>

        {/* Placeholder empty-state card for a second class slot */}
        <Card theme={theme} className={`p-6 flex flex-col items-center justify-center text-center border-dashed ${theme.dark ? "" : ""}`}>
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-2xl mb-3">➕</span>
          <h3 className={`font-bold ${theme.text}`}>Explore more courses</h3>
          <p className={`text-sm mt-1 ${theme.textMuted}`}>Ask your parent to enroll you in a new adventure.</p>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Class Detail page
// ---------------------------------------------------------------------------
function ClassDetailPage({ theme, go }) {
  return (
    <div>
      <PageHeader title={COURSE.name} subtitle={`${COURSE.schedule} · Teacher ${COURSE.teacher}`} theme={theme} onBack={() => go("classes")} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
        <div className="space-y-6">
          <Card theme={theme} className="p-6 sm:p-7">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-bold ${theme.text}`}>Student Progress</h3>
              <span className="text-sm font-semibold text-blue-600">3 / 12 completed</span>
            </div>
            <ProgressBar value={3} total={12} theme={theme} />
          </Card>

          <Card theme={theme} className="p-6 sm:p-7 border-2 border-orange-200">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-100 text-orange-600"><Clock size={16} /></span>
              <h3 className={`font-bold ${theme.text}`}>Next Meeting</h3>
            </div>
            <p className={`text-sm font-semibold ${theme.textMuted}`}>Meeting {COURSE.currentMeeting}</p>
            <h2 className={`text-lg font-extrabold ${theme.text}`}>{COURSE.currentTopic}</h2>

            <div className="mt-3 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5"><Calendar size={15} className="text-blue-600" /><span className={theme.text}>{COURSE.nextDateLabel}</span></div>
              <div className="flex items-center gap-1.5"><Clock size={15} className="text-blue-600" /><span className={theme.text}>{COURSE.nextTimeLabel}</span></div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
              <a href={COURSE.meetLink} className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors">
                <Video size={16} /> Google Meet
              </a>
              <button className={`inline-flex items-center gap-2 rounded-2xl border ${theme.border} px-4 py-2.5 text-sm font-bold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}>
                <Download size={16} /> Download Material
              </button>
              <button className={`inline-flex items-center gap-2 rounded-2xl border ${theme.border} px-4 py-2.5 text-sm font-bold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}>
                <ClipboardList size={16} /> Homework
              </button>
            </div>
          </Card>

          <Card theme={theme} className="p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-bold ${theme.text}`}>Curriculum Preview</h3>
              <button onClick={() => go("curriculum")} className="text-sm font-semibold text-blue-600 hover:underline flex items-center gap-1">
                See full curriculum <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {MEETINGS.slice(0, 5).map((mm) => (
                <div key={mm.id} className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{mm.icon}</span>
                    <span className={`text-sm font-semibold ${theme.text}`}>Meeting {mm.id} · {mm.topic}</span>
                  </div>
                  <StatusBadge status={mm.status} theme={theme} />
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card theme={theme} className="p-6">
            <h3 className={`font-bold mb-4 ${theme.text}`}>Teacher</h3>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 font-bold">{COURSE.teacherInitials}</div>
              <div>
                <p className={`font-bold ${theme.text}`}>{COURSE.teacher}</p>
                <p className={`text-sm ${theme.textMuted}`}>Scratch & Junior Coding Mentor</p>
              </div>
            </div>
          </Card>

          <Card theme={theme} className="p-6">
            <h3 className={`font-bold mb-3 ${theme.text}`}>Class Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2"><Calendar size={15} className="text-purple-600" /><span className={theme.text}>{COURSE.schedule}</span></li>
              <li className="flex items-center gap-2"><Milestone size={15} className="text-purple-600" /><span className={theme.text}>{COURSE.totalMeetings} total meetings</span></li>
              <li className="flex items-center gap-2"><Rocket size={15} className="text-purple-600" /><span className={theme.text}>Ages 7–15</span></li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Curriculum page
// ---------------------------------------------------------------------------
function CurriculumPage({ theme, openReport }) {
  const [expanded, setExpanded] = useState(3);

  return (
    <div>
      <PageHeader title="Curriculum" subtitle={`${COURSE.name} · 12 meetings`} theme={theme} />

      <div className="relative pl-8 sm:pl-10">
        <div className={`absolute left-[15px] sm:left-[19px] top-2 bottom-2 w-0.5 ${theme.dark ? "bg-slate-800" : "bg-slate-200"}`} />
        <div className="space-y-4">
          {MEETINGS.map((mm) => {
            const isOpen = expanded === mm.id;
            const dotColor =
              mm.status === "completed" ? "bg-emerald-500" :
              mm.status === "upcoming" ? "bg-orange-500" : (theme.dark ? "bg-slate-700" : "bg-slate-300");
            return (
              <div key={mm.id} className="relative">
                <div className={`absolute -left-8 sm:-left-10 top-4 flex h-8 w-8 items-center justify-center rounded-full ${dotColor} text-white shadow-sm`}>
                  {mm.status === "completed" ? <CheckCircle2 size={16} /> : mm.status === "upcoming" ? <Clock size={16} /> : <Lock size={14} />}
                </div>
                <Card
                  theme={theme}
                  className={`p-4 sm:p-5 ${mm.status === "locked" ? "opacity-60" : ""} ${mm.status === "upcoming" ? "ring-2 ring-orange-300" : ""}`}
                  onClick={mm.status !== "locked" ? () => setExpanded(isOpen ? null : mm.id) : undefined}
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{mm.icon}</span>
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>Meeting {mm.id}</p>
                        <h3 className={`font-bold ${theme.text}`}>{mm.topic}</h3>
                      </div>
                    </div>
                    <StatusBadge status={mm.status} theme={theme} />
                  </div>

                  {mm.status === "completed" && isOpen && (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button className={`flex items-center gap-2 rounded-xl border ${theme.border} px-3 py-2.5 text-sm font-semibold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}>
                        <FileText size={16} /> Material
                      </button>
                      <button className={`flex items-center gap-2 rounded-xl border ${theme.border} px-3 py-2.5 text-sm font-semibold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}>
                        <PlayCircle size={16} /> Recording
                      </button>
                      <button className={`flex items-center gap-2 rounded-xl border ${theme.border} px-3 py-2.5 text-sm font-semibold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}>
                        <ClipboardList size={16} /> Homework · {mm.homeworkScore}/100
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); openReport(mm.id); }}
                        className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                      >
                        <MessageSquareQuote size={16} /> Teacher Notes & Attendance
                      </button>
                    </div>
                  )}

                  {mm.status === "upcoming" && isOpen && (
                    <div className="mt-4 flex flex-wrap gap-3">
                      <a href={COURSE.meetLink} className="flex items-center gap-2 rounded-xl bg-blue-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors">
                        <Video size={16} /> Join Meet
                      </a>
                      <button className={`flex items-center gap-2 rounded-xl border ${theme.border} px-3 py-2.5 text-sm font-semibold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}>
                        <ClipboardList size={16} /> Homework
                      </button>
                      <span className={`flex items-center gap-2 text-sm font-semibold ${theme.textMuted}`}>
                        <Clock size={15} className="text-orange-500" /> {COURSE.nextDateLabel}, {COURSE.nextTimeLabel}
                      </span>
                    </div>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// History page
// ---------------------------------------------------------------------------
function HistoryPage({ theme, openReport }) {
  const completedMeetings = MEETINGS.filter((mm) => mm.status === "completed");
  return (
    <div>
      <PageHeader title="History" subtitle="Completed meetings and reports." theme={theme} />
      <div className="space-y-4">
        {completedMeetings.map((mm) => (
          <Card key={mm.id} theme={theme} className="p-5 sm:p-6" onClick={() => openReport(mm.id)}>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-xl">{mm.icon}</span>
                <div>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${theme.textMuted}`}>Meeting {mm.id}</p>
                  <h3 className={`font-bold ${theme.text}`}>{mm.topic}</h3>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                  <p className={`text-xs ${theme.textMuted}`}>Homework</p>
                  <p className="font-bold text-emerald-600">{mm.homeworkScore}/100</p>
                </div>
                <StatusBadge status="completed" theme={theme} />
                <ChevronRight size={18} className={theme.textMuted} />
              </div>
            </div>
          </Card>
        ))}
        <Card theme={theme} className={`p-5 text-center border-dashed ${theme.textMuted}`}>
          <p className="text-sm">Meeting 4 will appear here once it&apos;s completed. 🎉</p>
        </Card>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Report Detail page
// ---------------------------------------------------------------------------
function ReportDetailPage({ theme, meetingId, go }) {
  const mm = MEETINGS.find((x) => x.id === meetingId) || MEETINGS[2];
  return (
    <div>
      <PageHeader title={`Meeting ${mm.id} Report`} subtitle={mm.topic} theme={theme} onBack={() => go("history")} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-6">
        <div className="space-y-6">
          <Card theme={theme} className="p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquareQuote size={18} className="text-blue-600" />
              <h3 className={`font-bold ${theme.text}`}>Teacher Feedback</h3>
            </div>
            <p className={`text-sm leading-relaxed rounded-2xl p-4 ${theme.dark ? "bg-slate-800" : "bg-blue-50"} ${theme.text}`}>
              “{mm.feedback}”
            </p>
            <p className={`mt-3 text-xs ${theme.textMuted}`}>— {COURSE.teacher}</p>
          </Card>

          <Card theme={theme} className="p-6 sm:p-7">
            <h3 className={`font-bold mb-4 ${theme.text}`}>Resources</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button className={`flex items-center justify-between rounded-xl border ${theme.border} px-4 py-3 text-sm font-semibold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}>
                <span className="flex items-center gap-2"><Download size={16} /> Material Download</span>
                <ChevronRight size={15} />
              </button>
              <button className={`flex items-center justify-between rounded-xl border ${theme.border} px-4 py-3 text-sm font-semibold ${theme.text} hover:bg-blue-50 hover:text-blue-700 transition-colors`}>
                <span className="flex items-center gap-2"><PlayCircle size={16} /> Recording</span>
                <ChevronRight size={15} />
              </button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card theme={theme} className="p-6">
            <h3 className={`font-bold mb-4 ${theme.text}`}>Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme.textMuted}`}>Attendance</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600"><CheckCircle2 size={15} /> {mm.attendance}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-sm ${theme.textMuted}`}>Homework</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600"><ClipboardCheck size={15} /> Completed</span>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-sm ${theme.textMuted}`}>Homework Score</span>
                  <span className={`text-sm font-extrabold ${theme.text}`}>{mm.homeworkScore}/100</span>
                </div>
                <ProgressBar value={mm.homeworkScore} total={100} colorClass="bg-emerald-500" theme={theme} />
              </div>
            </div>
          </Card>

          <Card theme={theme} className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 border-0">
            <div className="flex items-center gap-2 text-white">
              <Star size={18} fill="white" />
              <p className="font-bold">Great progress!</p>
            </div>
            <p className="text-sm text-purple-100 mt-1">Kevin is on track to finish Scratch JR Batch 1 on schedule.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple placeholder pages (Homework / Certificates / Profile)
// ---------------------------------------------------------------------------
function SimplePage({ title, subtitle, emoji, theme }) {
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} theme={theme} />
      <Card theme={theme} className="p-12 flex flex-col items-center text-center">
        <span className="text-5xl mb-4">{emoji}</span>
        <h3 className={`font-bold ${theme.text}`}>Nothing here yet</h3>
        <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>This section will fill up as Kevin moves through Scratch JR Batch 1.</p>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Shell: Sidebar, Topbar, Mobile nav
// ---------------------------------------------------------------------------
export default function JuniorTechDashboard() {
  const [page, setPage] = useState("dashboard");
  const [meetingId, setMeetingId] = useState(3);
  const [dark, setDark] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = {
    dark,
    bg: dark ? "bg-slate-950" : "bg-slate-50",
    card: dark ? "bg-slate-900" : "bg-white",
    border: dark ? "border-slate-800" : "border-slate-200",
    text: dark ? "text-slate-50" : "text-slate-900",
    textMuted: dark ? "text-slate-400" : "text-slate-500",
  };

  const go = (p) => { setPage(p); setDrawerOpen(false); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const openReport = (id) => { setMeetingId(id); go("reportDetail"); };

  const activeNavKey =
    page === "classDetail" ? "classes" :
    page === "reportDetail" ? "history" : page;

  return (
    <div className={`min-h-screen w-full ${theme.bg} font-sans`}>
      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className={`hidden md:flex md:w-64 md:flex-col fixed inset-y-0 left-0 border-r ${theme.border} ${theme.card} px-4 py-6`}>
          <div className="flex items-center gap-2 px-2 mb-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold">JT</div>
            <div>
              <p className={`font-extrabold leading-tight ${theme.text}`}>Junior Tech</p>
              <p className={`text-xs leading-tight ${theme.textMuted}`}>Course</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const active = activeNavKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => go(item.key === "classes" ? "classes" : item.key)}
                  className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                    active ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30" : `${theme.text} hover:bg-blue-50 hover:text-blue-700`
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
          <div className={`mt-6 rounded-2xl p-4 ${dark ? "bg-slate-800" : "bg-blue-50"}`}>
            <p className={`text-xs font-bold ${theme.text}`}>Need help?</p>
            <p className={`text-xs mt-1 ${theme.textMuted}`}>Message your teacher anytime from Class Detail.</p>
          </div>
        </aside>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="fixed inset-0 z-40 md:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} />
            <div className={`absolute left-0 top-0 bottom-0 w-72 ${theme.card} p-5`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-extrabold text-sm">JT</div>
                  <p className={`font-extrabold ${theme.text}`}>Junior Tech</p>
                </div>
                <button onClick={() => setDrawerOpen(false)} className={theme.textMuted}><X size={20} /></button>
              </div>
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const active = activeNavKey === item.key;
                  return (
                    <button
                      key={item.key}
                      onClick={() => go(item.key)}
                      className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                        active ? "bg-blue-600 text-white" : `${theme.text} hover:bg-blue-50 hover:text-blue-700`
                      }`}
                    >
                      <Icon size={18} /> {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Main column */}
        <div className="flex-1 md:ml-64 min-w-0">
          {/* Topbar */}
          <header className={`sticky top-0 z-30 flex items-center justify-between gap-3 border-b ${theme.border} ${theme.card}/90 backdrop-blur px-4 sm:px-8 py-3.5`}>
            <div className="flex items-center gap-3">
              <button onClick={() => setDrawerOpen(true)} className={`md:hidden ${theme.text}`}>
                <Menu size={22} />
              </button>
              <p className={`font-extrabold hidden sm:block ${theme.text}`}>
                {NAV_ITEMS.find((n) => n.key === activeNavKey)?.label || "Dashboard"}
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}>
                <Globe size={18} />
              </button>
              <button
                onClick={() => setDark((v) => !v)}
                className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}
              >
                {dark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button className={`relative flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}>
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-orange-500" />
              </button>
              <button onClick={() => go("profile")} className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                {STUDENT.initials}
              </button>
            </div>
          </header>

          {/* Page content */}
          <main className="px-4 sm:px-8 py-6 pb-24 md:pb-10 max-w-6xl">
            {page === "dashboard" && <DashboardPage theme={theme} go={go} />}
            {page === "classes" && <ClassesPage theme={theme} go={go} />}
            {page === "classDetail" && <ClassDetailPage theme={theme} go={go} />}
            {page === "curriculum" && <CurriculumPage theme={theme} openReport={openReport} />}
            {page === "history" && <HistoryPage theme={theme} openReport={openReport} />}
            {page === "reportDetail" && <ReportDetailPage theme={theme} meetingId={meetingId} go={go} />}
            {page === "homework" && <SimplePage title="Homework" subtitle="Track assignments across all classes." emoji="📝" theme={theme} />}
            {page === "certificates" && <SimplePage title="Certificates" subtitle="Earned once a course is complete." emoji="🏆" theme={theme} />}
            {page === "profile" && <SimplePage title="Profile" subtitle="Manage Kevin's learning profile." emoji="🙂" theme={theme} />}
          </main>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <nav className={`md:hidden fixed bottom-0 inset-x-0 z-30 border-t ${theme.border} ${theme.card} px-2 py-2 flex items-center justify-between`}>
        {MOBILE_NAV.map((key) => {
          const item = NAV_ITEMS.find((n) => n.key === key);
          const Icon = item.icon;
          const active = activeNavKey === key;
          return (
            <button
              key={key}
              onClick={() => go(key)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl py-1.5 text-[10px] font-semibold ${
                active ? "text-blue-600" : theme.textMuted
              }`}
            >
              <Icon size={19} />
              {item.label.split(" ")[0]}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
