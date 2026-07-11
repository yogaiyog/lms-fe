"use client";

import { useState } from "react";
import { X, User, ChevronRight, Star, Camera, Check, Loader2 } from "lucide-react";
import type { Attendance, Schedule, AssessmentAspect } from "@/lib/api";
import { api } from "@/lib/api";
import GalleryUploadModal from "./_student_segment_component/gallery-upload-modal";

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

export default function TutorScheduleDetailModal({
  theme,
  detailSchedule,
  detailAttendances,
  loadingDetail,
  expandedStudent,
  assessingAttendance,
  formAspects,
  assessmentScores,
  mentorComment,
  projectLink,
  savingAssessment,
  onClose,
  onToggleExpand,
  onStartAssessment,
  onCancelAssessment,
  onScoreChange,
  onMentorCommentChange,
  onProjectLinkChange,
  onSaveAssessment,
  onMarkDone,
  onUpdateAttendance,
}: {
  theme: Theme;
  detailSchedule: Schedule;
  detailAttendances: Attendance[];
  loadingDetail: boolean;
  expandedStudent: string | null;
  assessingAttendance: string | null;
  formAspects: AssessmentAspect[];
  assessmentScores: Record<string, number>;
  mentorComment: string;
  projectLink: string;
  savingAssessment: boolean;
  onClose: () => void;
  onToggleExpand: (studentId: string) => void;
  onStartAssessment: (attendanceId: string) => void;
  onCancelAssessment: () => void;
  onScoreChange: (aspectId: string, value: number) => void;
  onMentorCommentChange: (value: string) => void;
  onProjectLinkChange: (value: string) => void;
  onSaveAssessment: (attendanceId: string) => void;
  onMarkDone: (schedule: Schedule) => void;
  onUpdateAttendance?: (attendanceId: string, status: string) => Promise<void>;
}) {
  const [galleryStudentId, setGalleryStudentId] = useState<string | null>(null);
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState<string | null>(null);
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full max-w-2xl rounded-t-3xl ${theme.card} p-4 sm:p-6 shadow-2xl sm:rounded-3xl max-h-dvh sm:max-h-[95vh] overflow-y-auto`}>
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className={`text-lg font-extrabold ${theme.text}`}>
              {DAY_LABELS[detailSchedule.dayOfWeek] ?? detailSchedule.dayOfWeek}, {detailSchedule.date && new Date(detailSchedule.date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </h2>
            <p className={`text-sm ${theme.textMuted}`}>{detailSchedule.startTime}–{detailSchedule.endTime}</p>
            {detailSchedule.topic && <p className="text-xs mt-1 font-semibold text-blue-600">{detailSchedule.topic}</p>}
          </div>
          <button onClick={onClose} className={`rounded-xl p-1.5 ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}>
            <X size={20} />
          </button>
        </div>

        {loadingDetail ? (
          <div className="flex items-center justify-center py-12">
            <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
          </div>
        ) : detailAttendances.length === 0 ? (
          <div className="py-12 text-center">
            <p className={`text-sm ${theme.textMuted}`}>Belum ada data absensi untuk jadwal ini</p>
          </div>
        ) : (
          <div className="space-y-2">
            {detailAttendances.map((att) => {
              const isExpanded = expandedStudent === att.studentId;
              const maxScore = att.assessment?.scores?.reduce((sum, s) => sum + (s.aspect?.maxScore ?? 5), 0) ?? 0;
              const rowBg = theme.dark ? "bg-slate-800" : "bg-slate-50";
              return (
                <div key={att.id} className={`rounded-xl ${rowBg} overflow-hidden`}>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        att.status === "PRESENT" ? "bg-emerald-100" :
                        att.status === "ABSENT" ? "bg-red-100" :
                        att.status === "LATE" ? "bg-amber-100" :
                        att.status === "SICK" ? "bg-blue-100" : "bg-slate-100"
                      }`}>
                        <User size={15} className={
                          att.status === "PRESENT" ? "text-emerald-600" :
                          att.status === "ABSENT" ? "text-red-600" :
                          att.status === "LATE" ? "text-amber-600" :
                          att.status === "SICK" ? "text-blue-600" : "text-slate-600"
                        } />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold ${theme.text}`}>{att.student?.fullName ?? att.studentId.slice(0, 8)}</p>
                        {att.notes && <p className={`text-xs ${theme.textMuted}`}>{att.notes}</p>}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => setGalleryStudentId(att.studentId)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 transition-colors">
                        <Camera size={14} /> Upload
                      </button>
                      <div className="flex items-center flex-wrap gap-1.5">
                      {editingStatus === att.id ? (
                        <div className="flex items-center gap-1">
                          <select value={att.status} onChange={async (e) => {
                            const newStatus = e.target.value;
                            setStatusSaving(att.id);
                            try {
                              if (onUpdateAttendance) {
                                await onUpdateAttendance(att.id, newStatus);
                              } else {
                                await api.attendances.update(att.id, { status: newStatus });
                              }
                            } catch {} finally {
                              setStatusSaving(null);
                              setEditingStatus(null);
                            }
                          }}
                            className="rounded-xl border border-slate-200 bg-white px-2 py-1 text-xs font-bold outline-none focus:border-blue-400">
                            <option value="PRESENT">Hadir</option>
                            <option value="LATE">Terlambat</option>
                            <option value="ABSENT">Tidak Hadir</option>
                            <option value="SICK">Sakit</option>
                            <option value="PERMISSION">Izin</option>
                          </select>
                          {statusSaving === att.id && <Loader2 size={12} className="animate-spin text-slate-400" />}
                        </div>
                      ) : (
                        <button onClick={() => setEditingStatus(att.id)}
                          className={`inline-flex items-center gap-1 rounded-xl px-3 py-1 text-xs font-bold transition-colors ${
                            att.status === "PRESENT" ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                            att.status === "LATE" ? "bg-amber-100 text-amber-700 hover:bg-amber-200" :
                            att.status === "ABSENT" ? "bg-red-100 text-red-700 hover:bg-red-200" :
                            att.status === "SICK" ? "bg-blue-100 text-blue-700 hover:bg-blue-200" :
                            "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}>
                          <Check size={11} />
                          {att.status === "PRESENT" ? "Hadir" :
                           att.status === "LATE" ? "Terlambat" :
                           att.status === "ABSENT" ? "Tidak Hadir" :
                           att.status === "SICK" ? "Sakit" : "Izin"}
                        </button>
                      )}
                      {att.assessment ? (
                        <button onClick={() => onStartAssessment(att.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-200 transition-colors">
                          {att.assessment.percentage != null ? `${att.assessment.percentage}%` : `${att.assessment.totalScore ?? 0}/${maxScore}`} · Edit
                        </button>
                      ) : (att.status === "PRESENT" || att.status === "LATE") && (
                        <button onClick={() => onStartAssessment(att.id)}
                          className="inline-flex items-center gap-1 rounded-xl bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700 hover:bg-amber-200 transition-colors">
                          <Star size={13} /> Nilai
                        </button>
                      )}
                      </div>
                      {(att.assessment && att.assessment.scores && att.assessment.scores.length > 0) && (
                        <button onClick={() => onToggleExpand(att.studentId)}
                          className={`rounded-lg p-1.5 transition-colors ${theme.textMuted} hover:bg-blue-100 hover:text-blue-600`}>
                          <ChevronRight size={18} className={`transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {assessingAttendance === att.id && (
                    <div className={`border-t ${theme.border} px-4 py-3 space-y-3`}>
                      <p className={`text-xs font-bold ${theme.text}`}>Penilaian</p>
                      {formAspects.length === 0 ? (
                        <p className={`text-xs ${theme.textMuted}`}>Kurikulum belum memiliki aspek penilaian</p>
                      ) : (
                        formAspects.map((asp) => (
                          <div key={asp.id} className="flex items-center justify-between">
                            <p className={`text-xs font-medium ${theme.text}`}>{asp.title}</p>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                <button type="button" onClick={() => {
                                  const cur = assessmentScores[asp.id] ?? asp.minScore;
                                  if (cur > asp.minScore) onScoreChange(asp.id, cur - 1);
                                }}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-30"
                                  disabled={(assessmentScores[asp.id] ?? asp.minScore) <= asp.minScore}>
                                  −
                                </button>
                                <input type="number" min={asp.minScore} max={asp.maxScore}
                                  value={assessmentScores[asp.id] ?? asp.minScore}
                                  onFocus={(e) => e.target.select()}
                                  onChange={(e) => {
                                    const raw = e.target.value;
                                    if (raw === "") return;
                                    const val = Number(raw);
                                    if (!isNaN(val) && val >= asp.minScore && val <= asp.maxScore) {
                                      onScoreChange(asp.id, val);
                                    }
                                  }}
                                  className="w-12 rounded-lg border border-slate-200 bg-white px-1 py-1 text-center text-xs font-bold text-blue-700 outline-none focus:border-blue-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
                                <button type="button" onClick={() => {
                                  const cur = assessmentScores[asp.id] ?? asp.minScore;
                                  if (cur < asp.maxScore) onScoreChange(asp.id, cur + 1);
                                }}
                                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-sm font-bold text-slate-600 hover:bg-slate-100 active:bg-slate-200 transition-colors disabled:opacity-30"
                                  disabled={(assessmentScores[asp.id] ?? asp.minScore) >= asp.maxScore}>
                                  +
                                </button>
                              </div>
                              <span className={`text-xs ${theme.textMuted}`}>/ {asp.maxScore}</span>
                            </div>
                          </div>
                        ))
                      )}
                      <div>
                        <label className={`mb-1 block text-xs font-semibold ${theme.textMuted}`}>Link Project</label>
                        <input type="url" value={projectLink} onChange={(e) => onProjectLinkChange(e.target.value)}
                          placeholder="https://scratch.mit.edu/projects/..."
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                      </div>
                      <div>
                        <label className={`mb-1 block text-xs font-semibold ${theme.textMuted}`}>Catatan Mentor</label>
                        <textarea value={mentorComment} onChange={(e) => onMentorCommentChange(e.target.value)}
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none" rows={2} />
                      </div>
                      <div className="flex gap-2 pt-1">
                        <button onClick={onCancelAssessment}
                          className="rounded-2xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                          Batal
                        </button>
                        <button onClick={() => onSaveAssessment(att.id)} disabled={savingAssessment}
                          className="rounded-2xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors">
                          {savingAssessment ? "Menyimpan..." : "Simpan Penilaian"}
                        </button>
                      </div>
                    </div>
                  )}

                  {isExpanded && att.assessment?.scores && assessingAttendance !== att.id && (
                    <div className={`border-t ${theme.border} px-4 py-3 space-y-2`}>
                      {att.assessment.scores.map((sc) => (
                        <div key={sc.id} className="flex items-center justify-between">
                          <p className={`text-xs font-medium ${theme.text}`}>{sc.aspect?.title ?? "Aspek"}</p>
                          <div className="flex items-center gap-2">
                            <div className="flex h-6 w-8 items-center justify-center rounded-md bg-blue-100 text-xs font-bold text-blue-700">
                              {sc.score}
                            </div>
                            <span className={`text-xs ${theme.textMuted}`}>/ {sc.aspect?.maxScore ?? 5}</span>
                          </div>
                        </div>
                      ))}
                      {att.assessment.projectLink && (
                        <div className="pt-2">
                          <p className={`text-xs font-semibold ${theme.textMuted}`}>Link Project: <a href={att.assessment.projectLink} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 hover:underline">{att.assessment.projectLink}</a></p>
                        </div>
                      )}
                      {att.assessment.mentorComment && (
                        <div className="pt-2 border-t border-slate-200">
                          <p className={`text-xs font-semibold ${theme.textMuted}`}>Catatan Mentor: <span className="font-medium">{att.assessment.mentorComment}</span></p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {!detailSchedule.isDone && !loadingDetail && (
          <div className="mt-6 border-t border-slate-200 pt-4">
            <button onClick={() => onMarkDone(detailSchedule)}
              className="w-full rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-700 transition-colors">
              Kelas Selesai
            </button>
          </div>
        )}
      </div>

      {galleryStudentId && (
        <GalleryUploadModal
          open={!!galleryStudentId}
          studentId={galleryStudentId}
          theme={theme}
          onClose={() => setGalleryStudentId(null)}
        />
      )}
    </div>
  );
}
