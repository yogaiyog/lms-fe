"use client";

import { X, User, Mail, GraduationCap, BookOpen, Calendar, Zap, ArrowRight } from "lucide-react";
import type { StudentProfile, Enrollment } from "@/lib/api";

const CATEGORY_LABELS: Record<string, string> = {
  JUNIOR_I: "Kelas 1-3 SD",
  JUNIOR_II: "Kelas 4-6 SD",
  JUNIOR_III: "Kelas 7-9 SMP",
};

type Props = {
  student: StudentProfile;
  enrollments: Enrollment[];
  loading: boolean;
  onImpersonate: (studentId: string) => void;
  onClose: () => void;
};

export default function StudentDetailModal({ student, enrollments, loading, onImpersonate, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Detail Siswa</h2>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="space-y-5 px-6 py-5">
          {/* Student Info Card */}
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50">
              <User size={24} className="text-blue-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold text-slate-900">{student.fullName}</p>
              <p className="text-sm text-slate-500">@{student.nickname}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
                  <GraduationCap size={12} />
                  {CATEGORY_LABELS[student.category] ?? student.category}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-700">
                  <Zap size={12} />
                  XP {student.totalXp}
                </span>
              </div>
            </div>
          </div>

          {/* Detail Fields */}
          <div className="space-y-3 rounded-2xl bg-slate-50 p-4">
            {student.user?.email && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Mail size={14} className="shrink-0 text-slate-400" />
                <span className="truncate">{student.user.email}</span>
              </div>
            )}
            {student.parent && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User size={14} className="shrink-0 text-slate-400" />
                <span>Orang Tua: {student.parent.fullName}</span>
              </div>
            )}
            {student.birthDate && (
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar size={14} className="shrink-0 text-slate-400" />
                <span>Lahir: {new Date(student.birthDate).toLocaleDateString("id-ID")}</span>
              </div>
            )}
          </div>

          {/* Enrollments */}
          <div>
            <h3 className="mb-2 flex items-center gap-1.5 text-sm font-bold text-slate-700">
              <BookOpen size={15} />
              Enrollment ({enrollments.length})
            </h3>
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : enrollments.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-400">Belum ada enrollment</p>
            ) : (
              <div className="space-y-2">
                {enrollments.map((enr) => (
                  <div key={enr.id} className="rounded-2xl border border-slate-100 bg-white px-4 py-3">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-bold text-slate-900">
                          {enr.curriculum?.name ?? "—"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {enr.class
                            ? `Kelas: ${enr.class.name}`
                            : "Belum ditempatkan di kelas"}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0 text-right">
                        <p className="text-xs font-semibold text-slate-700">
                          {enr.totalMeetLeft}/{enr.totalMeetPurchased}
                        </p>
                        <p className="text-[11px] text-slate-400">pertemuan</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100">
            Tutup
          </button>
          <button onClick={() => onImpersonate(student.id)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700">
            <ArrowRight size={15} />
            Impersonate
          </button>
        </div>
      </div>
    </div>
  );
}
