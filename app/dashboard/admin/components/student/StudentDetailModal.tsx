"use client";

import { useState } from "react";
import { X, User, Mail, GraduationCap, BookOpen, Calendar, Zap, ArrowRight, Plus, Pencil, Loader2, FileText } from "lucide-react";
import { api, type StudentProfile, type Enrollment, type Curriculum, type Class } from "@/lib/api";
import CertificatePreviewModal from "../../../shared/CertificatePreviewModal";

const CATEGORY_LABELS: Record<string, string> = {
  JUNIOR_I: "Kelas 1-3 SD",
  JUNIOR_II: "Kelas 4-6 SD",
  JUNIOR_III: "Kelas 7-9 SMP",
};

type Props = {
  student: StudentProfile;
  enrollments: Enrollment[];
  loading: boolean;
  curriculums: Curriculum[];
  classes: Class[];
  onImpersonate: (studentId: string) => void;
  onClose: () => void;
  onRefreshEnrollments: () => void;
};

export default function StudentDetailModal({
  student, enrollments, loading, curriculums, classes,
  onImpersonate, onClose, onRefreshEnrollments,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [formCurriculumId, setFormCurriculumId] = useState("");
  const [formClassId, setFormClassId] = useState("");
  const [formTotalMeetPurchased, setFormTotalMeetPurchased] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [previewEnrollment, setPreviewEnrollment] = useState<Enrollment | null>(null);

  const isEdit = !!editingEnrollment;
  const selectedCurriculum = curriculums.find((c) => c.id === formCurriculumId);
  const maxMeet = selectedCurriculum?.topics.length ?? 0;
  const meetValue = formTotalMeetPurchased ? Number(formTotalMeetPurchased) : 0;
  const meetError = !isEdit && maxMeet > 0 && meetValue > maxMeet
    ? `Kurikulum hanya memiliki ${maxMeet} pertemuan`
    : "";

  function openAddForm() {
    setEditingEnrollment(null);
    setFormCurriculumId("");
    setFormClassId("");
    setFormTotalMeetPurchased("");
    setShowForm(true);
  }

  function openEditForm(enr: Enrollment) {
    setEditingEnrollment(enr);
    setFormCurriculumId(enr.curriculumId);
    setFormClassId(enr.classId ?? "");
    setFormTotalMeetPurchased(String(enr.totalMeetPurchased));
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingEnrollment(null);
    setFormCurriculumId("");
    setFormClassId("");
    setFormTotalMeetPurchased("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (formSubmitting || meetError) return;

    const totalMeetPurchased = formTotalMeetPurchased ? Number(formTotalMeetPurchased) : undefined;
    setFormSubmitting(true);
    try {
      if (isEdit) {
        await api.enrollments.update(editingEnrollment!.id, {
          ...(formClassId !== editingEnrollment!.classId ? { classId: formClassId || null } : {}),
          ...(totalMeetPurchased !== undefined ? { totalMeetPurchased } : {}),
        });
      } else {
        await api.enrollments.create({
          studentId: student.id,
          curriculumId: formCurriculumId,
          classId: formClassId || undefined,
          totalMeetPurchased,
        });
      }
      closeForm();
      onRefreshEnrollments();
    } catch {
      alert(isEdit ? "Gagal mengupdate enrollment" : "Gagal menambah enrollment");
    } finally {
      setFormSubmitting(false);
    }
  }

  const filteredClasses = classes.filter(
    (c) => !formCurriculumId || c.curriculumId === formCurriculumId
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl">
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
            <div className="mb-2 flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-700">
                <BookOpen size={15} />
                Enrollment ({enrollments.length})
              </h3>
              <button onClick={openAddForm}
                className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-bold text-white transition hover:bg-blue-700">
                <Plus size={13} />
                Tambah
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleSubmit} className="mb-3 rounded-2xl border border-blue-200 bg-blue-50 p-4 space-y-3">
                {!isEdit && (
                  <div>
                    <label className="mb-1 block text-xs font-bold text-slate-600">Kurikulum</label>
                    <select value={formCurriculumId} onChange={(e) => { setFormCurriculumId(e.target.value); setFormClassId(""); }}
                      required className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400">
                      <option value="">Pilih Kurikulum</option>
                      {curriculums.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Kelas (opsional)</label>
                  <select value={formClassId} onChange={(e) => setFormClassId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400">
                    <option value="">Pilih Kelas</option>
                    {filteredClasses.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Total Pertemuan Dibeli</label>
                  <input type="number" min="0" value={formTotalMeetPurchased}
                    onChange={(e) => setFormTotalMeetPurchased(e.target.value)}
                    placeholder={maxMeet > 0 ? `Maksimal ${maxMeet}` : "0"}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-400" />
                  {!isEdit && maxMeet > 0 && (
                    <p className="mt-1 text-[11px] text-slate-400">Maksimal {maxMeet} pertemuan (sesuai kurikulum)</p>
                  )}
                </div>
                {meetError && (
                  <p className="text-xs font-semibold text-red-500">{meetError}</p>
                )}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button type="button" onClick={closeForm}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-200/60">
                    Batal
                  </button>
                  <button type="submit" disabled={formSubmitting || (!isEdit && !formCurriculumId) || !!meetError}
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:opacity-50">
                    {formSubmitting && <Loader2 size={13} className="animate-spin" />}
                    {isEdit ? "Simpan" : "Tambah"}
                  </button>
                </div>
              </form>
            )}

            {!showForm && (loading ? (
              <div className="flex items-center justify-center py-4">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
              </div>
            ) : enrollments.length === 0 ? (
              <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-400">Belum ada enrollment</p>
            ) : (
              <div className="max-h-[320px] space-y-2 overflow-y-auto pr-1">
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
                      <div className="ml-3 flex shrink-0 items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-700">
                            {enr.meetUsages?.length ?? 0} / {enr.totalMeetPurchased} sesi digunakan
                          </p>
                          {(() => {
                            const c = curriculums.find((c) => c.id === enr.curriculumId);
                            return c?.topics.length ? (
                              enr.totalMeetPurchased != c.topics.length ? (
                              <p className="text-[11px] text-slate-400">
                                {enr.totalMeetPurchased} / {c.topics.length} pertemuan dibayar
                              </p>) : (<p className="text-[11px] text-green-400">
                                Lunas
                              </p>)
                            ) : null;
                          })()}
                        </div>
                        <button onClick={() => setPreviewEnrollment(enr)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-green-600">
                          <FileText size={14} />
                        </button>
                        <button onClick={() => openEditForm(enr)}
                          className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600">
                          <Pencil size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
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
      <CertificatePreviewModal
        open={!!previewEnrollment}
        enrollment={previewEnrollment}
        studentName={student.fullName}
        mode="admin"
        onClose={() => setPreviewEnrollment(null)}
      />
      </div>
    </div>
  );
}
