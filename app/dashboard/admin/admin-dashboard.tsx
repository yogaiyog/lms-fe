"use client";

import { useEffect, useState } from "react";
import { useAdminDashboard } from "./hooks/useAdminDashboard";
import AdminNavbar from "./components/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar";
import ClassesTable from "./components/class/ClassesTable";
import RequestsTable from "./components/class/RequestsTable";
import CreateClassForm from "./components/class/CreateClassForm";
import ClassDetailModal from "./components/class/ClassDetailModal";
import ApproveRejectModal from "./components/ApproveRejectModal";
import TutorList from "./components/tutor/TutorList";
import TutorDetailModal from "./components/tutor/TutorDetailModal";
import AddTutorForm from "./components/tutor/AddTutorForm";
import StudentList from "./components/student/StudentList";
import StudentDetailModal from "./components/student/StudentDetailModal";
import CurriculumList from "./components/kurikulum/CurriculumList";
import TopicManagement from "./components/kurikulum/TopicManagement";
import AssessmentSetManagement from "./components/kurikulum/AssessmentSetManagement";
import AdminAttendance from "./components/attendance/AdminAttendance";

export default function AdminDashboard() {
  const h = useAdminDashboard();
  const [editingParent, setEditingParent] = useState<import("@/lib/api").ParentProfile | null>(null);
  const [parentForm, setParentForm] = useState({ fullName: "", phone: "", email: "" });
  const [parentSaving, setParentSaving] = useState(false);
  const [parentSaveError, setParentSaveError] = useState("");
  const [editingTutor, setEditingTutor] = useState<{ id: string; fullName: string; phone: string; email?: string; bio?: string | null } | null>(null);

  useEffect(() => {
    if (h.mainMenu === "students" && h.studentSegment === "enrollment") {
      h.fetchAllEnrollments();
    }
    if (h.mainMenu === "students" && h.studentSegment === "parent") {
      h.fetchAllParents();
    }
  }, [h.mainMenu, h.studentSegment]);

  if (h.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AdminNavbar mainMenu={h.mainMenu} onChange={(m) => { h.setMainMenu(m); h.setSegment("classes"); h.setTutorSegment("list"); h.setCurriculumSegment("list"); }}
        email={h.user?.email} onLogout={h.logout} />

      <div className="mx-auto flex max-w-full gap-6 px-10 py-6">
        <AdminSidebar mainMenu={h.mainMenu} segment={h.segment} onSegmentChange={h.setSegment}
          tutorSegment={h.tutorSegment} onTutorSegmentChange={h.setTutorSegment}
          curriculumSegment={h.curriculumSegment} onCurriculumSegmentChange={h.setCurriculumSegment}
          studentSegment={h.studentSegment} onStudentSegmentChange={h.setStudentSegment} />

        <main className="min-w-0 flex-1">
          {h.mainMenu === "classes" && h.segment === "classes" && (
            <ClassesTable table={h.classTable} globalFilter={h.classGlobalFilter}
              onGlobalFilterChange={h.setClassGlobalFilter} onRowClick={h.openClassDetail} />
          )}

          {h.mainMenu === "classes" && h.segment === "requests" && (
            <RequestsTable table={h.reqTable} globalFilter={h.reqGlobalFilter}
              onGlobalFilterChange={h.setReqGlobalFilter}
              onProcess={(req) => { h.setSelectedRequest(req); h.setApproveAction("APPROVED"); h.setApproveClassId(""); h.setAdminNotes(""); h.setApproveError(""); }} />
          )}

          {h.mainMenu === "classes" && h.segment === "create" && (
            <CreateClassForm
              createType={h.createType} onCreateTypeChange={h.setCreateType}
              createIsOnline={h.createIsOnline} onCreateIsOnlineChange={h.setCreateIsOnline}
              createLocation={h.createLocation} onCreateLocationChange={h.setCreateLocation}
              createName={h.createName} onCreateNameChange={h.setCreateName}
              createCategory={h.createCategory} onCreateCategoryChange={h.setCreateCategory}
              createCurriculumId={h.createCurriculumId} onCreateCurriculumIdChange={h.setCreateCurriculumId}
              createTutorIds={h.createTutorIds} onCreateTutorIdsChange={h.setCreateTutorIds}
              createStartDate={h.createStartDate} onCreateStartDateChange={h.setCreateStartDate}
              creating={h.creating} createError={h.createError}
              filteredCurriculums={h.filteredCurriculums} selectedCurriculum={h.selectedCurriculum}
              createBatchPreview={h.createBatchPreview} tutors={h.tutors}
              tutorSlots={h.tutorSlots} tutorDayoffs={h.tutorDayoffs}
              slotsLoading={h.slotsLoading} selectedSlots={h.selectedSlots}
              onSelectedSlotsChange={h.setSelectedSlots}
              SLOT_DAYS={h.SLOT_DAYS} SLOT_DAY_LABELS={h.SLOT_DAY_LABELS}
              SLOT_HOURS={h.SLOT_HOURS} fmt={h.fmt} isInRange={h.isInRange}
              onSubmit={h.createClass}
              createAvailableStudents={h.createAvailableStudents}
              createSelectedStudentIds={h.createSelectedStudentIds}
              onSelectedStudentIdsChange={h.setCreateSelectedStudentIds}
              getSlotsConflictReason={h.getSlotsConflictReason} />
          )}

          {h.mainMenu === "tutors" && h.tutorSegment === "list" && (
            <TutorList tutors={h.tutorsFull} onSelect={(t) => setEditingTutor(t)} />
          )}
          {h.mainMenu === "tutors" && h.tutorSegment === "add" && (
            <AddTutorForm registering={h.registering} registerError={h.registerError}
              onSubmit={h.handleRegisterTutor} />
          )}
          {h.mainMenu === "curriculums" && h.curriculumSegment === "list" && (
            <CurriculumList curriculums={h.curriculums} assessmentSets={h.assessmentSets}
              onRefresh={h.refreshCurriculumData} />
          )}
          {h.mainMenu === "curriculums" && h.curriculumSegment === "topics" && (
            <TopicManagement curriculums={h.curriculums} />
          )}
          {h.mainMenu === "curriculums" && h.curriculumSegment === "assessments" && (
            <AssessmentSetManagement assessmentSets={h.assessmentSets}
              onRefresh={h.refreshCurriculumData} />
          )}
          {h.mainMenu === "students" && h.studentSegment === "list" && (
            <StudentList students={h.studentsFull} onSelect={h.handleSelectStudent} />
          )}

          {h.mainMenu === "students" && h.studentSegment === "enrollment" && (
            <AllEnrollmentsView
              enrollments={h.allEnrollments}
              loading={h.allEnrollmentsLoading}
              onRefresh={h.fetchAllEnrollments}
              onSelectStudent={(studentId) => {
                const student = h.studentsFull.find((s) => s.id === studentId);
                if (student) h.handleSelectStudent(student);
              }}
            />
          )}

          {h.mainMenu === "students" && h.studentSegment === "parent" && (
            <AllParentsView
              parents={h.allParents}
              loading={h.allParentsLoading}
              onRefresh={h.fetchAllParents}
              onEdit={(parent) => {
                setEditingParent(parent);
                setParentForm({
                  fullName: parent.fullName,
                  phone: parent.phone,
                  email: parent.user?.email ?? "",
                });
                setParentSaveError("");
              }}
            />
          )}
          {h.mainMenu === "attendance" && (
            <AdminAttendance />
          )}
        </main>
      </div>

      {h.selectedRequest && (
        <ApproveRejectModal request={h.selectedRequest}
          approveAction={h.approveAction} onApproveActionChange={h.setApproveAction}
          approveClassId={h.approveClassId} onApproveClassIdChange={h.setApproveClassId}
          adminNotes={h.adminNotes} onAdminNotesChange={h.setAdminNotes}
          approving={h.approving} approveError={h.approveError} classes={h.classes}
          onClose={() => h.setSelectedRequest(null)} onSubmit={h.handleApproveReject} />
      )}

      {h.detailClass && (
        <ClassDetailModal detailClass={h.detailClass}
          detailClassName={h.detailClassName} onDetailClassNameChange={h.setDetailClassName}
          detailTutorIds={h.detailTutorIds} onDetailTutorIdsChange={h.setDetailTutorIds}
          detailStudents={h.detailStudents} detailStudentMap={h.detailStudentMap}
          detailSaving={h.detailSaving} detailError={h.detailError}
          detailAddingStudentId={h.detailAddingStudentId} onDetailAddingStudentIdChange={h.setDetailAddingStudentId}
          tutors={h.tutors}
          pendingRemovals={h.pendingRemovals} onToggleRemoval={h.togglePendingRemoval}
          onClose={() => { h.setDetailClass(null); h.setPendingRemovals(new Set()); }}
          onSave={h.handleSaveDetail}
          onAddStudent={h.handleAddStudent} onReschedule={h.handleReschedule}
          onShiftSchedule={h.handleShiftSchedule}
          onUpdateScheduleTime={h.handleUpdateScheduleTime} />
      )}

      {h.selectedStudent && (
        <StudentDetailModal
          student={h.selectedStudent}
          enrollments={h.selectedStudentEnrollments}
          certificates={h.selectedStudentCertificates}
          loading={h.studentDetailLoading}
          curriculums={h.curriculums}
          classes={h.classes}
          onImpersonate={() => h.handleImpersonate(h.selectedStudent!.userId)}
          onClose={() => { h.setSelectedStudent(null); h.setSelectedStudentEnrollments([]); }}
          onRefreshEnrollments={h.refreshStudentEnrollments}
        />
      )}

      {h.toast && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all ${
          h.toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
        }`}>
          {h.toast.message}
        </div>
      )}

      {editingTutor && (
        <TutorDetailModal
          tutor={editingTutor}
          onClose={() => setEditingTutor(null)}
          onSaved={() => { h.fetchAllEnrollments(); }}
        />
      )}

      {editingParent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">Edit Orang Tua</h2>
              <button onClick={() => setEditingParent(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setParentSaving(true);
              setParentSaveError("");
              try {
                const { api } = await import("@/lib/api");
                await Promise.all([
                  api.parentProfiles.update(editingParent.id, { fullName: parentForm.fullName, phone: parentForm.phone }),
                  parentForm.email !== editingParent.user?.email
                    ? api.users.update(editingParent.userId, { email: parentForm.email })
                    : Promise.resolve(),
                ]);
                setEditingParent(null);
                h.fetchAllParents();
                h.showToast("Data orang tua berhasil diperbarui", "success");
              } catch (err) {
                setParentSaveError(err instanceof Error ? err.message : "Gagal menyimpan");
              } finally {
                setParentSaving(false);
              }
            }} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nama Lengkap</label>
                <input value={parentForm.fullName} onChange={(e) => setParentForm((f) => ({ ...f, fullName: e.target.value }))} required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                <input type="email" value={parentForm.email} onChange={(e) => setParentForm((f) => ({ ...f, email: e.target.value }))} required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-semibold text-slate-700">Telepon</label>
                <input value={parentForm.phone} onChange={(e) => setParentForm((f) => ({ ...f, phone: e.target.value }))} required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              {editingParent.students && editingParent.students.length > 0 && (
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">Anak ({editingParent.students.length})</label>
                  <div className="max-h-40 space-y-1 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2">
                    {editingParent.students.map((s) => (
                      <div key={s.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm hover:bg-white">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                          {s.nickname?.charAt(0) ?? "?"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 truncate">{s.fullName}</p>
                          <p className="text-[10px] text-slate-400">@{s.nickname}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-600">
                          {s.category?.label ?? "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {parentSaveError && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{parentSaveError}</div>}
              <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={() => setEditingParent(null)}
                  className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">Batal</button>
                <button type="submit" disabled={parentSaving}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
                  {parentSaving ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function AllEnrollmentsView({ enrollments, loading, onRefresh, onSelectStudent }: {
  enrollments: import("@/lib/api").Enrollment[];
  loading: boolean;
  onRefresh: () => void;
  onSelectStudent: (studentId: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editMeet, setEditMeet] = useState("");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Semua Enrollment</h2>
        <button onClick={onRefresh} className="rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">
          Refresh
        </button>
      </div>
      {enrollments.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">Belum ada enrollment</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Siswa</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Kurikulum</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Kelas</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-center text-xs font-semibold uppercase text-slate-500">Dibeli</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-center text-xs font-semibold uppercase text-slate-500">Sisa</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-center text-xs font-semibold uppercase text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enr) => (
                <tr key={enr.id}
                  onClick={() => enr.student?.id && onSelectStudent(enr.student.id)}
                  className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-blue-50">
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{enr.student?.fullName ?? enr.studentId}</td>
                  <td className="px-3 py-2.5 text-slate-600">{enr.curriculum?.name ?? "—"}</td>
                  <td className="px-3 py-2.5 text-slate-600">{enr.class?.name ?? "Belum ditempatkan"}</td>
                  <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                    {editingId === enr.id ? (
                      <div className="inline-flex items-center gap-1">
                        <input type="number" min="0" value={editMeet}
                          onChange={(e) => setEditMeet(e.target.value)}
                          className="w-16 rounded border border-slate-200 px-1 py-0.5 text-center text-xs" />
                        <button onClick={async () => {
                          const val = Number(editMeet);
                          if (!val && val !== 0) return;
                          try {
                            const { api } = await import("@/lib/api");
                            await api.enrollments.update(enr.id, { totalMeetPurchased: val, verified: true });
                            setEditingId(null);
                            onRefresh();
                          } catch {}
                        }} className="text-xs font-bold text-green-600 hover:text-green-700 px-1">✓</button>
                        <button onClick={() => setEditingId(null)} className="text-xs font-bold text-red-500 hover:text-red-600 px-1">✕</button>
                      </div>
                    ) : (
                      <button onClick={() => { setEditingId(enr.id); setEditMeet(String(enr.totalMeetPurchased)); }}
                        className="text-sm font-semibold text-slate-700 hover:text-blue-600">
                        {enr.totalMeetPurchased}
                      </button>
                    )}
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{enr.totalMeetLeft}</td>
                  <td className="px-3 py-2.5 text-center">
                    {enr.verified ? (
                      <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                        Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700">
                        Menunggu
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AllParentsView({ parents, loading, onRefresh, onEdit }: {
  parents: import("@/lib/api").ParentProfile[];
  loading: boolean;
  onRefresh: () => void;
  onEdit: (parent: import("@/lib/api").ParentProfile) => void;
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">Semua Orang Tua</h2>
        <button onClick={onRefresh} className="rounded-lg px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50">
          Refresh
        </button>
      </div>
      {parents.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">Belum ada orang tua terdaftar</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Nama</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Email</th>
                <th className="border-b border-slate-200 px-3 py-2.5 text-left text-xs font-semibold uppercase text-slate-500">Telepon</th>
              </tr>
            </thead>
            <tbody>
              {parents.map((p) => (
                <tr key={p.id} onClick={() => onEdit(p)}
                  className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-blue-50">
                  <td className="px-3 py-2.5 font-semibold text-slate-900">{p.fullName}</td>
                  <td className="px-3 py-2.5 text-slate-600">{p.user?.email ?? "—"}</td>
                  <td className="px-3 py-2.5 text-slate-600">{p.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
