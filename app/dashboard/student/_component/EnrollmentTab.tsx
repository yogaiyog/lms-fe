"use client";

import { useState } from "react";
import { BookOpen, Users, Calendar, ShoppingCart, X, Check } from "lucide-react";
import Card from "./Card";
import type { Theme } from "./types";
import type { Schedule, Class, Enrollment } from "@/lib/api";

type Props = {
  theme: Theme;
  classes: Class[];
  enrollments: Enrollment[];
  schedules: Schedule[];
  studentId?: string;
  totalMeetLeft: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  KIDS: "Kelas 1-3 SD",
  JUNIOR_I: "Kelas 4-6 SD",
  JUNIOR_II: "Kelas 7-9 SMP",
};

const TYPE_LABELS: Record<string, string> = {
  BATCH: "Reguler",
  PRIVATE: "Privat",
  MAKEUP: "Makeup",
};

export default function EnrollmentTab({ theme, classes, enrollments, schedules, studentId, totalMeetLeft }: Props) {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>Enrollment</h1>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>Daftar enrollment dan kehadiran kamu.</p>
        </div>
      </div>

      {classes.length === 0 && enrollments.filter((e) => !e.classId).length === 0 ? (
        <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-5xl mb-4">📚</span>
          <h3 className={`font-bold ${theme.text}`}>Belum ada enrollment</h3>
          <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kamu belum terdaftar di enrollment manapun.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className={`rounded-2xl border ${theme.border} ${theme.card} px-5 py-4 flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                <ShoppingCart size={18} className="text-blue-600" />
              </div>
              <div>
                <p className={`text-sm font-bold ${theme.text}`}>Sisa Pertemuan</p>
                <p className={`text-xs ${theme.textMuted}`}>Total pertemuan yang tersisa</p>
              </div>
            </div>
            <span className="text-2xl font-extrabold text-blue-600">{totalMeetLeft}</span>
          </div>

          {classes.map((cls) => {
            const studentCount = cls.enrollments?.length ?? 0;
            const totalTopics = cls.curriculum?.topics?.length ?? 0;
            const classSchedules = cls.schedules?.length
              ? cls.schedules
              : schedules.filter((s) => s.classId === cls.id);
            const historyMeetings = classSchedules.filter(
              (s) => s.isDone || s.date < new Date().toISOString().split("T")[0]
            ).length;
            const myEnrollment = cls.enrollments?.find((e) =>
              studentId ? e.studentId === studentId : true
            );
            return (
              <button key={cls.id} onClick={() => setSelectedClass(cls)} className="w-full text-left">
                <Card theme={theme} className="p-5 w-full hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-50">
                        <BookOpen size={20} className="text-indigo-600" />
                      </span>
                      <div>
                        <h3 className={`text-lg font-extrabold ${theme.text}`}>{cls.name}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                            {cls.category?.label ?? "-"}
                          </span>
                          <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700">
                            {TYPE_LABELS[cls.type] ?? cls.type}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className={`rounded-xl p-3 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                        <Users size={13} className="text-emerald-600" />
                        <span className={theme.textMuted}>Siswa</span>
                      </div>
                      <p className={`text-lg font-extrabold ${theme.text}`}>{studentCount}</p>
                    </div>
                    <div className={`rounded-xl p-3 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                      <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                        <Calendar size={13} className="text-blue-600" />
                        <span className={theme.textMuted}>Progress Kelas</span>
                      </div>
                      <div className={`h-2.5 w-full overflow-hidden rounded-full ${theme.dark ? "bg-slate-700" : "bg-slate-200"}`}>
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all"
                          style={{
                            width: `${totalTopics > 0 ? Math.min(100, (historyMeetings / totalTopics) * 100) : 0}%`,
                          }}
                        />
                      </div>
                      <p className="mt-1 text-[10px] font-semibold text-blue-600">
                        sudah berjalan {historyMeetings} dari {totalTopics} topics yang ada
                      </p>
                    </div>
                    {myEnrollment && (
                      <div className={`rounded-xl p-3 ${theme.dark ? "bg-slate-800" : "bg-slate-50"} col-span-2 sm:col-span-1`}>
                        <div className="flex items-center gap-1.5 text-xs font-semibold mb-1">
                          <ShoppingCart size={13} className="text-amber-600" />
                          <span className={theme.textMuted}>Sisa Pertemuan</span>
                        </div>
                        <p className={`text-lg font-extrabold ${theme.text}`}>{myEnrollment.totalMeetLeft ?? "-"}</p>
                      </div>
                    )}
                  </div>

                  {cls.curriculum?.topics && cls.curriculum.topics.length > 0 && (() => {
                    const topics = [...cls.curriculum!.topics!].sort((a, b) => a.order - b.order);
                    const myEnrollment = cls.enrollments?.find((e) => studentId ? e.studentId === studentId : true);
                    const meetScheduleIds = new Set((myEnrollment?.meetUsages ?? []).map((m) => m.scheduleId));
                    const classSchedulesForTopics = classSchedules;
                    return (
                      <div className={`mt-4 pt-4 border-t ${theme.border}`}>
                        <h3 className={`text-[10px] font-semibold mb-2 ${theme.textMuted}`}>Kurikulum</h3>
                        <div className="space-y-1">
                          {topics.map((topic) => {
                            const tSchedules = classSchedulesForTopics.filter((s) => s.topicId === topic.id);
                            const completed = tSchedules.length > 0 && tSchedules.every((s) => meetScheduleIds.has(s.id));
                            return (
                              <div key={topic.id} className="flex items-center gap-2">
                                <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${completed ? "bg-emerald-100 text-emerald-600" : "bg-slate-200 text-slate-400"}`}>
                                  {completed ? <Check size={8} /> : <span className="text-[8px] font-bold">{topics.indexOf(topic) + 1}</span>}
                                </span>
                                <span className={`text-[11px] ${completed ? "text-emerald-600 font-semibold" : theme.textMuted}`}>{topic.title}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {cls.tutors && cls.tutors.length > 0 && (
                    <div className={`mt-4 pt-4 border-t ${theme.border} flex items-center gap-3`}>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
                        {cls.tutors[0].fullName?.charAt(0) ?? "T"}
                      </div>
                      <div>
                        <p className={`text-xs font-semibold ${theme.textMuted}`}>Tutor</p>
                        <p className={`text-sm font-bold ${theme.text}`}>{cls.tutors.map((t) => t.fullName).join(", ") ?? "-"}</p>
                      </div>
                    </div>
                  )}
                </Card>
              </button>
            );
          })}

          {enrollments.filter((e) => !e.classId).map((enr) => (
            <div key={enr.id}
              className={`rounded-2xl border ${theme.border} ${theme.card} px-5 py-4 flex items-center justify-between gap-3`}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50">
                  <BookOpen size={20} className="text-amber-600" />
                </div>
                <div className="min-w-0">
                  <h3 className={`text-base font-extrabold ${theme.text}`}>{enr.curriculum?.name ?? "Menunggu kelas"}</h3>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
                      Menunggu Kelas
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Dibeli</p>
                  <p className={`text-base font-extrabold ${theme.text}`}>{enr.totalMeetPurchased}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Sisa</p>
                  <p className={`text-base font-extrabold ${theme.text}`}>{enr.totalMeetLeft}</p>
                </div>
                <div className="text-right">
                  <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Hadir</p>
                  <p className={`text-base font-extrabold text-emerald-600`}>{enr.meetUsages?.length ?? 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedClass && (
        <ClassDetailModal
          theme={theme}
          cls={selectedClass}
          schedules={schedules.filter((s) => s.classId === selectedClass.id)}
          studentId={studentId}
          onClose={() => setSelectedClass(null)}
        />
      )}
    </div>
  );
}

function ClassDetailModal({
  theme, cls, schedules, studentId, onClose,
}: {
  theme: Theme;
  cls: Class;
  schedules: Schedule[];
  studentId?: string;
  onClose: () => void;
}) {
  const myEnrollment = cls.enrollments?.find((e) =>
    studentId ? e.studentId === studentId : true
  );
  const topics = [...(cls.curriculum?.topics ?? [])].sort((a, b) => a.order - b.order);
  const purchased = myEnrollment?.totalMeetPurchased ?? 0;
  const meetUsages = myEnrollment?.meetUsages ?? [];
  const meetScheduleIds = new Set(meetUsages.map((m) => m.scheduleId));

  const attended = meetUsages.length;
  const remaining = Math.max(0, purchased - attended);

  function topicSchedules(topicId: string) {
    return schedules.filter((s) => s.topicId === topicId);
  }

  function isTopicCompleted(topicId: string) {
    const tSchedules = topicSchedules(topicId);
    if (tSchedules.length === 0) return false;
    return tSchedules.every((s) => meetScheduleIds.has(s.id));
  }

  function topicAttendedCount(topicId: string) {
    const tSchedules = topicSchedules(topicId);
    if (tSchedules.length === 0) return 0;
    return tSchedules.filter((s) => meetScheduleIds.has(s.id)).length;
  }

  const meetLeftForTopicProgress = myEnrollment?.totalMeetLeft ?? remaining;
  const paidTopicStartIndex = attended;
  const paidTopicEndIndex = Math.min(topics.length - 1, attended + meetLeftForTopicProgress);

  function isPaidTopic(index: number) {
    return index >= paidTopicStartIndex && index <= paidTopicEndIndex;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-10 overflow-y-auto">
      <div className={`relative w-full max-w-2xl rounded-3xl border ${theme.border} ${theme.card} p-6 shadow-xl mb-10`}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className={`text-xl font-extrabold ${theme.text}`}>{cls.name}</h2>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-semibold text-blue-700">
                {cls.category?.label ?? "-"}
              </span>
              <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700">
                {TYPE_LABELS[cls.type] ?? cls.type}
              </span>
            </div>
          </div>
          <button onClick={onClose} className={`rounded-xl p-1.5 ${theme.dark ? "hover:bg-slate-700" : "hover:bg-slate-200"} transition`}>
            <X size={20} className={theme.text} />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
              <div className={`rounded-xl p-3 text-center ${theme.dark ? "bg-slate-800" : "bg-blue-50"}`}>
                <p className={`text-lg font-extrabold text-blue-600`}>{purchased}</p>
                <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Dibeli</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${theme.dark ? "bg-slate-800" : "bg-emerald-50"}`}>
                <p className={`text-lg font-extrabold text-emerald-600`}>{attended}</p>
                <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Hadir</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${theme.dark ? "bg-slate-800" : "bg-amber-50"}`}>
                <p className={`text-lg font-extrabold text-amber-600`}>{remaining}</p>
                <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Sisa</p>
              </div>
            </div>

            {topics.length > 0 && (
              <div className={`mb-6 border-t ${theme.border} pt-5`}>
                <h3 className={`text-sm font-bold mb-3 ${theme.text}`}>Kurikulum</h3>
                <div className="space-y-1.5">
                  {topics.map((topic, i) => {
                    const completed = isTopicCompleted(topic.id);
                    const hasSchedules = topicSchedules(topic.id).length > 0;
                    const attCount = topicAttendedCount(topic.id);
                    const totalForTopic = topicSchedules(topic.id).length;
                    const paid = isPaidTopic(i);
                    return (
                      <div key={topic.id}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${completed ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-500"}`}>
                            {completed ? <Check size={12} /> : i + 1}
                          </span>
                          <div className="min-w-0">
                            <p className={`text-xs font-semibold ${completed ? "text-emerald-700" : theme.text}`}>{topic.title}</p>
                            {hasSchedules && (
                              <p className={`text-[10px] ${theme.textMuted}`}>{attCount}/{totalForTopic} pertemuan</p>
                            )}
                          </div>
                        </div>
                        {completed ? (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700">
                            <Check size={10} /> Selesai
                          </span>
                        ) : paid ? (
                          <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-[10px] font-bold text-blue-700">
                            <Check size={10} /> Sudah Dibayar
                          </span>
                        ) : (
                          <span className="shrink-0 inline-flex items-center rounded-full bg-slate-200 px-2.5 py-0.5 text-[10px] font-semibold text-slate-500">
                            Belum
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {cls.tutors && cls.tutors.length > 0 && (
              <div className={`mt-5 pt-5 border-t ${theme.border} flex items-center gap-3`}>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                  {cls.tutors[0].fullName?.charAt(0) ?? "T"}
                </div>
                <div>
                  <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Tutor</p>
                  <p className={`text-sm font-bold ${theme.text}`}>{cls.tutors.map((t) => t.fullName).join(", ") ?? "-"}</p>
                </div>
              </div>
            )}
          </div>
      </div>
  );
}
