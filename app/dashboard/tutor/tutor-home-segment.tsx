"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Clock, CheckSquare, Video, User, X } from "lucide-react";
import type { Schedule, StudentProfile, Curriculum } from "@/lib/api";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin", TUESDAY: "Selasa", WEDNESDAY: "Rabu",
  THURSDAY: "Kamis", FRIDAY: "Jumat", SATURDAY: "Sabtu", SUNDAY: "Minggu",
};

type Theme = {
  dark: boolean;
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
};

type ClassWithSchedules = {
  id: string;
  name: string;
  schedules: Schedule[];
  enrollments?: { id: string; studentId: string }[];
  curriculum?: Curriculum | null;
};

function Card({ children, className = "", theme, onClick }: { children: React.ReactNode; className?: string; theme: Theme; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-3xl border ${theme.border} ${theme.card} shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function getThisWeekSchedules(classes: ClassWithSchedules[]) {
  const { monday, sunday } = getWeekRange();
  const result: ({ className: string; classId: string } & Schedule)[] = [];
  for (const cls of classes) {
    for (const s of cls.schedules) {
      const d = new Date(s.date);
      if (d >= monday && d <= sunday) {
        result.push({ ...s, className: cls.name, classId: cls.id });
      }
    }
  }
  result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime() || a.startTime.localeCompare(b.startTime));
  return result;
}

function getStudentName(studentId: string, students: StudentProfile[]) {
  const s = students.find((s) => s.id === studentId);
  return s?.nickname ?? s?.fullName ?? studentId.slice(0, 8);
}

export default function TutorHomeSegment({
  theme,
  classes,
  students,
  countdowns,
  forceOngoingIds,
  attendanceForm,
  submittingAttendance,
  onInitAttendanceForm,
  onSubmitAttendance,
  onSetAttendanceStatus,
  onCancelAttendance,
  onEditSchedule,
  onOpenScheduleDetail,
  tutorName,
  attendanceFilledIds,
}: {
  theme: Theme;
  classes: ClassWithSchedules[];
  students: StudentProfile[];
  countdowns: Record<string, { days: number; hours: number; minutes: number; seconds: number }>;
  forceOngoingIds: Set<string>;
  attendanceForm: { scheduleId: string; studentId: string; status: string }[];
  submittingAttendance: boolean;
  onInitAttendanceForm: (scheduleId: string, classId: string) => void;
  onSubmitAttendance: () => void;
  onSetAttendanceStatus: (studentId: string, status: string) => void;
  onCancelAttendance: () => void;
  onEditSchedule: (schedule: Schedule, classId: string) => void;
  onOpenScheduleDetail: (schedule: Schedule) => void;
  tutorName?: string;
  attendanceFilledIds?: Set<string>;
}) {
  const weekSchedules = getThisWeekSchedules(classes);
  const [studentListModal, setStudentListModal] = useState<{ scheduleId: string; classId: string } | null>(null);

  function getStudentsForClass(classId: string) {
    const cls = classes.find((c) => c.id === classId);
    if (!cls?.enrollments) return [];
    return cls.enrollments.map((e) => {
      const s = students.find((st) => st.id === e.studentId);
      return {
        name: s?.nickname ?? s?.fullName ?? e.studentId.slice(0, 8),
        parentPhone: s?.parent?.phone ?? "-",
        parentName: s?.parent?.fullName ?? "-",
      };
    });
  }

  return (
    <div>
      <p className={`mb-3 text-xs sm:text-sm font-semibold ${theme.textMuted}`}>
        Jadwal minggu ini: <span className={`font-bold ${theme.text}`}>{getWeekRange().monday.toLocaleDateString("id-ID", { day: "numeric", month: "short" })} – {getWeekRange().sunday.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</span>
      </p>

      {weekSchedules.length === 0 ? (
        <Card theme={theme} className="p-8 sm:p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-4xl sm:text-5xl mb-3">📅</span>
          <h3 className={`font-bold text-sm sm:text-base ${theme.text}`}>Tidak ada jadwal minggu ini</h3>
          <p className={`text-xs sm:text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kamu tidak memiliki jadwal mengajar minggu ini</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {weekSchedules.map((schedule) => {
            const cd = countdowns[schedule.id];
            const isCountdownZero = cd && cd.days === 0 && cd.hours === 0 && cd.minutes === 0 && cd.seconds === 0;
            const isOngoing = (isCountdownZero || forceOngoingIds.has(schedule.id)) && !schedule.isDone;
            const isSoon = cd && !isCountdownZero && cd.days === 0 && cd.hours < 2;
            const scheduleClass = classes.find((c) => c.id === schedule.classId);
            const scheduleCurriculumId = scheduleClass?.curriculum?.id;
            return (
              <Card key={schedule.id} theme={theme} className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isOngoing ? "bg-emerald-100" : isSoon ? "bg-amber-100" : schedule.isDone ? "bg-slate-100" : cd ? "bg-blue-100" : "bg-slate-100"}`}>
                      <Calendar size={18} className={isOngoing ? "text-emerald-600" : isSoon ? "text-amber-600" : schedule.isDone ? "text-slate-400" : cd ? "text-blue-600" : "text-slate-400"} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[10px] font-semibold uppercase tracking-wide ${theme.textMuted}`}>{schedule.className}</p>
                      <h3 className={`text-sm font-bold ${theme.text}`}>
                        {DAY_LABELS[schedule.dayOfWeek] ?? schedule.dayOfWeek}, {new Date(schedule.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </h3>
                      {scheduleCurriculumId ? (
                        <Link href={`/dashboard/tutor/kurikulum/${scheduleCurriculumId}`} className="hover:opacity-75 transition-opacity">
                          <p className={`text-xs ${theme.textMuted}`}>{schedule.startTime}–{schedule.endTime}</p>
                          {schedule.topic && (
                            <p className={`text-[11px] mt-0.5 font-semibold ${isOngoing ? "text-emerald-600" : "text-blue-600"}`}>{schedule.topic}</p>
                          )}
                        </Link>
                      ) : (
                        <>
                          <p className={`text-xs ${theme.textMuted}`}>{schedule.startTime}–{schedule.endTime}</p>
                          {schedule.topic && (
                            <p className={`text-[11px] mt-0.5 font-semibold ${isOngoing ? "text-emerald-600" : "text-blue-600"}`}>{schedule.topic}</p>
                          )}
                        </>
                      )}
                      {!schedule.isDone && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <button onClick={() => setStudentListModal({ scheduleId: schedule.id, classId: schedule.classId })}
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                            <User size={10} /> Lihat Siswa
                          </button>
                          {attendanceFilledIds?.has(schedule.id) && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">
                              <svg className="h-2.5 w-2.5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                              </svg>
                              Absensi Terisi
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-13 sm:pl-0">
                    {schedule.isDone ? (
                      <button onClick={() => onOpenScheduleDetail(schedule)}
                        className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-300 transition-colors cursor-pointer">
                        <Clock size={10} /> Selesai
                      </button>
                    ) : isOngoing ? (
                      <div className="flex flex-col items-end gap-1.5">
                        {!isCountdownZero && cd && (
                          <div className="flex items-center gap-1">
                            {cd.days > 0 && (
                              <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                                <span className={`text-[10px] font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{cd.days}</span>
                                <span className={`text-[7px] ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>h</span>
                              </div>
                            )}
                            <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                              <span className={`text-[10px] font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{String(cd.hours).padStart(2, "0")}</span>
                              <span className={`text-[7px] ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>j</span>
                            </div>
                            <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                              <span className={`text-[10px] font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{String(cd.minutes).padStart(2, "0")}</span>
                              <span className={`text-[7px] ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>m</span>
                            </div>
                            {cd.days === 0 && (
                              <div className="flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 bg-red-100">
                                <span className="text-[10px] font-extrabold text-red-700">{String(cd.seconds).padStart(2, "0")}</span>
                                <span className="text-[7px] text-red-500">d</span>
                              </div>
                            )}
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 animate-pulse">
                          Berlangsung
                        </span>
                        <div className="flex items-center gap-1.5">
                          {attendanceFilledIds?.has(schedule.id) ? (
                            <button onClick={() => onOpenScheduleDetail(schedule)}
                              className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition-colors">
                              <CheckSquare size={10} /> Assessment
                            </button>
                          ) : (
                            <button onClick={() => onInitAttendanceForm(schedule.id, schedule.classId)}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors">
                              <CheckSquare size={10} /> Absensi
                            </button>
                          )}
                          <button onClick={() => onEditSchedule(schedule, schedule.classId)}
                            className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ) : cd && !isCountdownZero ? (
                      <div className="flex flex-col items-end gap-1.5">
                        <div className="flex items-center gap-1">
                          {cd.days > 0 && (
                            <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                              <span className={`text-[10px] font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{cd.days}</span>
                              <span className={`text-[7px] ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>h</span>
                            </div>
                          )}
                          <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                            <span className={`text-[10px] font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{String(cd.hours).padStart(2, "0")}</span>
                            <span className={`text-[7px] ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>j</span>
                          </div>
                          <div className={`flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 ${cd.days === 0 ? "bg-red-100" : "bg-blue-100"}`}>
                            <span className={`text-[10px] font-extrabold ${cd.days === 0 ? "text-red-700" : "text-blue-700"}`}>{String(cd.minutes).padStart(2, "0")}</span>
                            <span className={`text-[7px] ${cd.days === 0 ? "text-red-500" : "text-blue-500"}`}>m</span>
                          </div>
                          {cd.days === 0 && (
                            <div className="flex items-center gap-0.5 rounded-lg px-1.5 py-0.5 bg-red-100">
                              <span className="text-[10px] font-extrabold text-red-700">{String(cd.seconds).padStart(2, "0")}</span>
                              <span className="text-[7px] text-red-500">d</span>
                            </div>
                          )}
                        </div>
                        {isSoon && (
                          <div className="flex items-center gap-1.5">
                            {attendanceFilledIds?.has(schedule.id) ? (
                              <button onClick={() => onOpenScheduleDetail(schedule)}
                                className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition-colors">
                                <CheckSquare size={10} /> Assessment
                              </button>
                            ) : (
                              <button onClick={() => onInitAttendanceForm(schedule.id, schedule.classId)}
                                className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition-colors">
                                <CheckSquare size={10} /> Absensi
                              </button>
                            )}
                            <button onClick={() => onEditSchedule(schedule, schedule.classId)}
                              className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ) : null}

                    {!schedule.isDone && !isOngoing && !(cd && !isCountdownZero) && (
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => onEditSchedule(schedule, schedule.classId)}
                          className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        {schedule.meetLink && (
                          <a href={schedule.meetLink} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition-colors">
                            <Video size={10} /> Meet
                          </a>
                        )}
                      </div>
                    )}
                    {!schedule.isDone && (isOngoing || (cd && !isCountdownZero)) && schedule.meetLink && (
                      <a href={schedule.meetLink} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition-colors">
                        <Video size={10} /> Meet
                      </a>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Attendance Form Modal */}
      {attendanceForm.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={onCancelAttendance} />
          <div className={`relative w-full max-w-md rounded-t-3xl ${theme.card} p-6 shadow-2xl sm:rounded-3xl max-h-[80vh] overflow-y-auto`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-lg font-extrabold ${theme.text}`}>Isi Absensi</h2>
              <button onClick={onCancelAttendance} className={`rounded-xl p-1.5 ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}>
                <X size={20} />
              </button>
            </div>
            {tutorName && (
              <div className={`mb-3 rounded-xl px-4 py-2.5 text-sm ${theme.dark ? "bg-blue-900/30" : "bg-blue-50"}`}>
                <span className="font-semibold text-blue-600">Pengajar: {tutorName}</span>
              </div>
            )}
            <div className="space-y-3">
              {attendanceForm.map((item) => (
                <div key={item.studentId} className={`flex items-center justify-between rounded-xl px-4 py-3 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                  <span className={`text-sm font-semibold ${theme.text}`}>{getStudentName(item.studentId, students)}</span>
                  <select value={item.status} onChange={(e) => onSetAttendanceStatus(item.studentId, e.target.value)}
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold outline-none transition focus:border-blue-400">
                    <option value="PRESENT">Hadir</option>
                    <option value="LATE">Terlambat</option>
                    <option value="ABSENT">Tidak Hadir</option>
                    <option value="SICK">Sakit</option>
                    <option value="PERMISSION">Izin</option>
                  </select>
                </div>
              ))}
            </div>
            <button onClick={onSubmitAttendance} disabled={submittingAttendance}
              className="mt-4 w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {submittingAttendance ? <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Menyimpan...</span> : "Simpan Absensi"}
            </button>
          </div>
        </div>
      )}

      {/* Student List Modal */}
      {studentListModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setStudentListModal(null)} />
          <div className={`relative w-full max-w-md rounded-t-3xl ${theme.card} p-6 shadow-2xl sm:rounded-3xl max-h-[80vh] overflow-y-auto`}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={`text-lg font-extrabold ${theme.text}`}>Daftar Siswa</h2>
              <button onClick={() => setStudentListModal(null)} className={`rounded-xl p-1.5 ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}>
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3">
              {getStudentsForClass(studentListModal.classId).map((s, i) => (
                <div key={i} className={`rounded-xl px-4 py-3 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${theme.text}`}>{s.name}</span>
                    <span className="text-xs text-slate-400">#{i + 1}</span>
                  </div>
                  <div className="mt-1.5 flex items-center gap-4 text-xs text-slate-500">
                    <span>{s.parentName}</span>
                    <span className="text-slate-400">/</span>
                    <span className="font-semibold text-slate-600">Phone: {s.parentPhone}</span>
                  </div>
                </div>
              ))}
              {getStudentsForClass(studentListModal.classId).length === 0 && (
                <p className={`text-sm text-center py-8 ${theme.textMuted}`}>Belum ada siswa terdaftar</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
