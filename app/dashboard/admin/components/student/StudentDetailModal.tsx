"use client";

import { useEffect, useState, useRef, useMemo, type FormEvent } from "react";
import { X, User, Mail, GraduationCap, BookOpen, Calendar, ArrowRight, Plus, Pencil, Loader2, FileText, FileCheck, Save } from "lucide-react";
import { api, checkEmail, type StudentProfile, type Enrollment, type Curriculum, type Class, type Certificate, type ParentProfile, type Category } from "@/lib/api";
import CertificatePreviewModal from "../../../shared/CertificatePreviewModal";

type Props = {
  student: StudentProfile;
  enrollments: Enrollment[];
  certificates: Certificate[];
  loading: boolean;
  curriculums: Curriculum[];
  classes: Class[];
  parents: ParentProfile[];
  categories: Category[];
  onImpersonate: (studentId: string) => void;
  onClose: () => void;
  onRefreshEnrollments: () => void;
  onUpdate: (updated: StudentProfile) => void;
};

export default function StudentDetailModal({
  student, enrollments, certificates, loading, curriculums, classes, parents, categories,
  onImpersonate, onClose, onRefreshEnrollments, onUpdate,
}: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingEnrollment, setEditingEnrollment] = useState<Enrollment | null>(null);
  const [formCurriculumId, setFormCurriculumId] = useState("");
  const [formClassId, setFormClassId] = useState("");
  const [formTotalMeetPurchased, setFormTotalMeetPurchased] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [previewEnrollment, setPreviewEnrollment] = useState<Enrollment | null>(null);
  const [localCertificates, setLocalCertificates] = useState<Certificate[]>(certificates);

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editBirthDate, setEditBirthDate] = useState("");
  const [editParentId, setEditParentId] = useState("");
  const [editCategoryId, setEditCategoryId] = useState("");
  const [editSchool, setEditSchool] = useState("");
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState("");
  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const emailTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    queueMicrotask(() => {
      setLocalCertificates(certificates);
    });
  }, [certificates, student.id]);

  const isEdit = !!editingEnrollment;
  const selectedCurriculum = curriculums.find((c) => c.id === formCurriculumId);
  const maxMeet = selectedCurriculum?.topics.length ?? 0;
  const meetValue = formTotalMeetPurchased ? Number(formTotalMeetPurchased) : 0;
  const meetError = !isEdit && maxMeet > 0 && meetValue > maxMeet
    ? `Kurikulum hanya memiliki ${maxMeet} pertemuan`
    : "";

  const isCertificateSent = (enr: Enrollment) =>
    localCertificates.some((cert) => cert.studentId === enr.studentId && cert.curriculumId === enr.curriculumId);

  const filteredClasses = useMemo(
    () => classes.filter((c) => c.isActive !== false && (!formCurriculumId || c.curriculumId === formCurriculumId)),
    [classes, formCurriculumId],
  );

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

  function startEditing() {
    setEditName(student.fullName);
    setEditEmail(student.user?.email ?? "");
    setEditBirthDate(student.birthDate?.split("T")[0] ?? "");
    setEditParentId(student.parentId);
    setEditCategoryId(student.categoryId ?? "");
    setEditSchool(student.school ?? "");
    setEmailStatus("idle");
    setEditError("");
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
    setEditError("");
  }

  function handleEmailChange(val: string) {
    setEditEmail(val);
    if (emailTimer.current) clearTimeout(emailTimer.current);
    if (!val) { setEmailStatus("idle"); return; }
    if (val === student.user?.email) { setEmailStatus("available"); return; }
    setEmailStatus("checking");
    emailTimer.current = setTimeout(async () => {
      const available = await checkEmail(val);
      setEmailStatus(available ? "available" : "taken");
    }, 500);
  }

  async function handleSaveEdit(e: FormEvent) {
    e.preventDefault();
    setEditSaving(true);
    setEditError("");
    try {
      const promises: Promise<unknown>[] = [];

      if (editEmail !== student.user?.email) {
        promises.push(api.users.update(student.userId, { email: editEmail }));
      }

      const profileUpdates: Record<string, unknown> = {};
      if (editName !== student.fullName) profileUpdates.fullName = editName;
      if (editBirthDate && editBirthDate !== student.birthDate?.split("T")[0]) {
        profileUpdates.birthDate = new Date(editBirthDate).toISOString();
      }
      if (editParentId !== student.parentId) profileUpdates.parentId = editParentId;
      if (editCategoryId !== (student.categoryId ?? "")) profileUpdates.categoryId = editCategoryId || null;
      if (editSchool !== (student.school ?? "")) profileUpdates.school = editSchool || null;

      if (Object.keys(profileUpdates).length > 0) {
        promises.push(api.studentProfiles.update(student.id, profileUpdates));
      }

      await Promise.all(promises);

      const updated = await api.studentProfiles.get(student.id);
      onUpdate(updated);
      setEditing(false);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setEditSaving(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (formSubmitting || meetError) return;

    const totalMeetPurchased = formTotalMeetPurchased ? Number(formTotalMeetPurchased) : undefined;
    setFormSubmitting(true);
    try {
      if (isEdit) {
        const updateData: Record<string, unknown> = {
          ...(formClassId !== editingEnrollment!.classId ? { classId: formClassId || null } : {}),
        };
        if (totalMeetPurchased !== undefined) {
          updateData.totalMeetPurchased = totalMeetPurchased;
          updateData.verified = true;
        }
        await api.enrollments.update(editingEnrollment!.id, updateData);
      } else {
        await api.enrollments.create({
          studentId: student.id,
          curriculumId: formCurriculumId,
          classId: formClassId || undefined,
          totalMeetPurchased,
          verified: totalMeetPurchased ? true : undefined,
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Detail Siswa</h2>
          <div className="flex items-center gap-2">
            {!editing && (
              <button onClick={startEditing}
                className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-50 transition-colors">
                <Pencil size={13} />
                Edit
              </button>
            )}
            <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5 overflow-y-auto flex-1">
          {editing ? (
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="rounded-2xl bg-blue-50 border border-blue-200 p-4 space-y-4">
                <h3 className="text-sm font-bold text-slate-700">Edit Data Siswa</h3>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Nama Lengkap</label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
                  <input type="email" value={editEmail}
                    onChange={(e) => handleEmailChange(e.target.value)} required
                    className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none focus:ring-2 ${
                      emailStatus === "taken" ? "border-red-400 focus:border-red-400 focus:ring-red-100" :
                      emailStatus === "available" && editEmail !== student.user?.email ? "border-green-400 focus:border-green-400 focus:ring-green-100" :
                      "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                    }`} />
                  {emailStatus === "checking" && <p className="mt-1 text-xs text-slate-400">Memeriksa email...</p>}
                  {emailStatus === "available" && editEmail !== student.user?.email && <p className="mt-1 text-xs text-green-600">Email tersedia</p>}
                  {emailStatus === "taken" && <p className="mt-1 text-xs text-red-600">Email sudah digunakan</p>}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Tanggal Lahir</label>
                  <input type="date" value={editBirthDate} onChange={(e) => setEditBirthDate(e.target.value)} required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Orang Tua</label>
                  <select value={editParentId} onChange={(e) => setEditParentId(e.target.value)} required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="">-- Pilih Orang Tua --</option>
                    {parents.map((p) => (
                      <option key={p.id} value={p.id}>{p.fullName} ({p.user?.email ?? "—"})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Kategori</label>
                  <select value={editCategoryId} onChange={(e) => setEditCategoryId(e.target.value)} required
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-semibold text-slate-600">Sekolah (opsional)</label>
                  <input value={editSchool} onChange={(e) => setEditSchool(e.target.value)}
                    placeholder="Nama sekolah"
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>

                {editError && (
                  <div className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-700">{editError}</div>
                )}

                <div className="flex items-center justify-end gap-2 pt-1">
                  <button type="button" onClick={cancelEditing}
                    className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-200/60 transition">
                    Batal
                  </button>
                  <button type="submit" disabled={editSaving || emailStatus === "taken" || emailStatus === "checking"}
                    className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition">
                    {editSaving && <Loader2 size={13} className="animate-spin" />}
                    <Save size={13} />
                    Simpan
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <>
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
                      {student.category?.label ?? "-"}
                    </span>
                  </div>
                </div>
              </div>

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
                {student.school && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <GraduationCap size={14} className="shrink-0 text-slate-400" />
                    <span>Sekolah: {student.school}</span>
                  </div>
                )}
              </div>
            </>
          )}

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
                  {isEdit && (
                    <p className="mt-1 text-[11px] text-blue-500">Mengisi nilai akan memverifikasi enrollment ini.</p>
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
                          {enr.class ? `Kelas: ${enr.class.name}` : "Belum ditempatkan di kelas"}
                        </p>
                      </div>
                      <div className="ml-3 flex shrink-0 items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs font-semibold text-slate-700">
                            {enr.meetUsages?.length ?? 0} / {enr.totalMeetPurchased} sesi digunakan
                          </p>
                          {enr.verified ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">Terverifikasi</span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">Menunggu Verifikasi</span>
                          )}
                          {(() => {
                            const c = curriculums.find((c) => c.id === enr.curriculumId);
                            return c?.topics.length ? (
                              enr.totalMeetPurchased != c.topics.length ? (
                              <p className="text-[11px] text-slate-400">{enr.totalMeetPurchased} / {c.topics.length} pertemuan dibayar</p>
                              ) : (<p className="text-[11px] text-green-400">Lunas</p>)
                            ) : null;
                          })()}
                        </div>
                        {!isCertificateSent(enr) ? (
                          <button onClick={() => setPreviewEnrollment(enr)}
                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-green-600">
                            <FileText size={14} />
                          </button>
                        ) : (
                          <button onClick={() => setPreviewEnrollment(enr)}
                            className="rounded-lg p-1.5 text-green-400 transition bg-green-100 hover:bg-slate-100 hover:text-slate-600">
                            <FileCheck size={14} />
                          </button>
                        )}
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

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4 shrink-0">
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
      <CertificatePreviewModal
        open={!!previewEnrollment}
        enrollment={previewEnrollment}
        studentName={student.fullName}
        mode="admin"
        initialSent={previewEnrollment ? isCertificateSent(previewEnrollment) : false}
        onSent={(certificate) => {
          setLocalCertificates((prev) => {
            if (prev.some((cert) => cert.id === certificate.id)) return prev;
            return [certificate, ...prev];
          });
        }}
        onClose={() => setPreviewEnrollment(null)}
      />
    </div>
  );
}
