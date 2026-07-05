"use client";

import { Fragment, useEffect, useState, useMemo } from "react";
import { CalendarDays, ChevronDown, ChevronRight, Search } from "lucide-react";
import { api, type Attendance, type Schedule } from "@/lib/api";

type Theme = {
  dark: boolean;
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
};

const ATTENDANCE_LABELS: Record<string, { label: string; color: string }> = {
  PRESENT: { label: "Hadir", color: "text-emerald-600 bg-emerald-100" },
  LATE: { label: "Terlambat", color: "text-amber-600 bg-amber-100" },
  ABSENT: { label: "Tidak Hadir", color: "text-red-600 bg-red-100" },
  SICK: { label: "Sakit", color: "text-blue-600 bg-blue-100" },
  PERMISSION: { label: "Izin", color: "text-purple-600 bg-purple-100" },
};

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin", TUESDAY: "Selasa", WEDNESDAY: "Rabu",
  THURSDAY: "Kamis", FRIDAY: "Jumat", SATURDAY: "Sabtu", SUNDAY: "Minggu",
};

const DATE_PRESETS = [
  { key: "today", label: "Hari Ini" },
  { key: "week", label: "Minggu Ini" },
  { key: "month", label: "Bulan Ini" },
  { key: "3months", label: "3 Bulan" },
  { key: "custom", label: "Custom" },
] as const;

type Props = { theme: Theme; tutorId: string };

type ScheduleGroup = {
  schedule: Schedule;
  attendances: Attendance[];
};

function getPresetRange(key: string): { start: Date; end: Date } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();
  switch (key) {
    case "today":
      return { start: new Date(y, m, d), end: new Date(y, m, d, 23, 59, 59, 999) };
    case "week": {
      const day = now.getDay();
      const mon = new Date(y, m, d + (day === 0 ? -6 : 1 - day));
      const sun = new Date(mon);
      sun.setDate(mon.getDate() + 6);
      sun.setHours(23, 59, 59, 999);
      return { start: mon, end: sun };
    }
    case "month":
      return { start: new Date(y, m, 1), end: new Date(y, m + 1, 0, 23, 59, 59, 999) };
    case "3months": {
      const threeMonthsAgo = new Date(y, m - 2, 1);
      return { start: threeMonthsAgo, end: new Date(y, m + 1, 0, 23, 59, 59, 999) };
    }
    default:
      return { start: new Date(0), end: new Date(8640000000000000) };
  }
}

function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export default function TutorAttendanceSegment({ theme, tutorId }: Props) {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [preset, setPreset] = useState<string>("month");
  const [customStart, setCustomStart] = useState(fmtDate(new Date()));
  const [customEnd, setCustomEnd] = useState(fmtDate(new Date()));

  useEffect(() => {
    (async () => {
      try {
        const list = await api.attendances.list();
        setAttendances(list);
      } catch (e) {
        console.error("Failed to load attendances", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const dateRange = useMemo(() => {
    if (preset !== "custom") return getPresetRange(preset);
    return { start: new Date(customStart + "T00:00:00"), end: new Date(customEnd + "T23:59:59.999") };
  }, [preset, customStart, customEnd]);

  const grouped = useMemo(() => {
    const myAttendances = attendances.filter((att) => att.teachedBy === tutorId);

    const map = new Map<string, Attendance[]>();
    for (const att of myAttendances) {
      const sid = att.scheduleId;
      if (!map.has(sid)) map.set(sid, []);
      map.get(sid)!.push(att);
    }
    const groups: ScheduleGroup[] = [];
    for (const [, atts] of map) {
      const sched = atts[0].schedule;
      if (!sched) continue;
      const d = new Date(sched.date);
      if (d < dateRange.start || d > dateRange.end) continue;
      groups.push({ schedule: sched, attendances: atts });
    }
    groups.sort((a, b) => new Date(b.schedule.date).getTime() - new Date(a.schedule.date).getTime());
    return groups;
  }, [attendances, tutorId, dateRange]);

  const filtered = useMemo(() => {
    if (!search) return grouped;
    const q = search.toLowerCase();
    return grouped.filter((g) =>
      g.attendances.some(
        (att) =>
          att.student?.fullName?.toLowerCase().includes(q) ||
          att.tutor?.fullName?.toLowerCase().includes(q) ||
          att.status?.toLowerCase().includes(q)
      )
    );
  }, [grouped, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / 10));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * 10, safePage * 10);

  const totalSchedules = filtered.length;
  const totalStudents = new Set(filtered.flatMap((g) => g.attendances.map((a) => a.studentId))).size;
  const totalAttendanceRecords = filtered.reduce((sum, g) => sum + g.attendances.length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h2 className={`text-lg font-extrabold ${theme.text}`}>Riwayat Absensi Tutor</h2>
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Cari siswa..."
            className={`w-full sm:w-64 rounded-xl border ${theme.border} bg-transparent pl-9 pr-4 py-2 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 ${theme.text}`}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {DATE_PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => { setPreset(p.key); setPage(1); }}
            className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
              preset === p.key
                ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30"
                : `${theme.dark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`
            }`}
          >
            {p.label}
          </button>
        ))}
        {preset === "custom" && (
          <div className="flex items-center gap-2">
            <input
              type="date" value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-400"
            />
            <span className="text-xs text-slate-400">—</span>
            <input
              type="date" value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-blue-400"
            />
          </div>
        )}
      </div>

      <div className={`grid grid-cols-3 gap-3 mb-5`}>
        <div className={`rounded-2xl border ${theme.border} ${theme.card} p-4 text-center`}>
          <p className={`text-2xl font-extrabold text-blue-600`}>{totalSchedules}</p>
          <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Total Jadwal</p>
        </div>
        {/* <div className={`rounded-2xl border ${theme.border} ${theme.card} p-4 text-center`}>
          <p className={`text-2xl font-extrabold text-emerald-600`}>{totalStudents}</p>
          <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Siswa Diampu</p>
        </div> */}
        <div className={`rounded-2xl border ${theme.border} ${theme.card} p-4 text-center`}>
          <p className={`text-2xl font-extrabold text-amber-600`}>{totalAttendanceRecords}</p>
          <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Total Absensi Siswa</p>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className={`rounded-3xl border ${theme.border} ${theme.card} p-8 text-center`}>
          <CalendarDays size={40} className="mx-auto mb-3 text-slate-300" />
          <p className={`text-sm font-semibold ${theme.textMuted}`}>Belum ada jadwal di periode ini</p>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-500">
                  <th className="w-8 py-3 px-2" />
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Tanggal</th>
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Jam</th>
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Topik</th>
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Siswa</th>
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Status</th>
                  <th className="text-left py-3 px-3 font-semibold whitespace-nowrap">Tutor</th>
                  <th className="text-right py-3 px-3 font-semibold whitespace-nowrap">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((group) => {
                  const s = group.schedule;
                  const open = expandedId === s.id;
                  const presentCount = group.attendances.filter((a) => a.status === "PRESENT" || a.status === "LATE").length;
                  return (
                    <Fragment key={s.id}>
                      <tr
                        onClick={() => setExpandedId(open ? null : s.id)}
                        className={`border-t border-slate-200 cursor-pointer transition ${
                          open ? "bg-blue-50" : theme.card
                        } hover:bg-slate-50`}
                      >
                        <td className="py-3 px-2">
                          {open ? (
                            <ChevronDown size={16} className="text-slate-400" />
                          ) : (
                            <ChevronRight size={16} className="text-slate-400" />
                          )}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap font-semibold text-slate-500">
                          {new Date(s.date).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap text-slate-400">
                          {DAY_LABELS[s.dayOfWeek] ?? s.dayOfWeek} {s.startTime}-{s.endTime}
                        </td>
                        <td className="py-3 px-3 whitespace-nowrap">
                          {s.topic ? (
                            <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 font-semibold text-blue-700">
                              {s.topic}
                            </span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-slate-400">
                          {group.attendances.length} siswa
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-emerald-600 font-semibold">{presentCount} hadir</span>
                        </td>
                        <td className="py-3 px-3" />
                        <td className="py-3 px-3" />
                      </tr>
                      {open &&
                        group.attendances.map((att) => {
                          const info =
                            ATTENDANCE_LABELS[att.status] ?? {
                              label: att.status,
                              color: "text-slate-600 bg-slate-100",
                            };
                          return (
                            <tr
                              key={att.id}
                              className={`border-t border-slate-100 ${theme.card}`}
                            >
                              <td className="py-2 px-2" />
                              <td className="py-2 px-3" />
                              <td className="py-2 px-3" />
                              <td className="py-2 px-3" />
                              <td className="py-2 px-3 whitespace-nowrap font-semibold text-slate-700">
                                {att.student?.fullName ?? "Siswa"}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap">
                                <span
                                  className={`inline-flex items-center rounded-full px-2 py-0.5 font-semibold ${info.color}`}
                                >
                                  {info.label}
                                </span>
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap font-semibold text-blue-600">
                                {att.tutor?.fullName ?? att.teachedBy ?? "—"}
                              </td>
                              <td className="py-2 px-3 whitespace-nowrap text-right font-semibold text-slate-600">
                                {att.assessment?.percentage != null
                                  ? `${Math.round(att.assessment.percentage)}%`
                                  : "—"}
                              </td>
                            </tr>
                          );
                        })}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
            <p className={`text-[10px] ${theme.textMuted}`}>
              {filtered.length > 0
                ? `Halaman ${safePage} dari ${totalPages} (${filtered.length} jadwal)`
                : "0 jadwal"}
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage <= 1}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-30 ${
                    theme.dark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    onClick={() => setPage(num)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      num === safePage
                        ? "bg-blue-600 text-white"
                        : `${theme.dark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`
                    }`}
                  >
                    {num}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage >= totalPages}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-30 ${
                    theme.dark ? "bg-slate-800 text-slate-300 hover:bg-slate-700" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
