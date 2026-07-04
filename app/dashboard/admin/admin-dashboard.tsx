"use client";

import { useAdminDashboard } from "./hooks/useAdminDashboard";
import AdminNavbar from "./components/AdminNavbar";
import AdminSidebar from "./components/AdminSidebar";
import ClassesTable from "./components/class/ClassesTable";
import RequestsTable from "./components/class/RequestsTable";
import CreateClassForm from "./components/class/CreateClassForm";
import ClassDetailModal from "./components/class/ClassDetailModal";
import ApproveRejectModal from "./components/ApproveRejectModal";
import TutorList from "./components/tutor/TutorList";
import AddTutorForm from "./components/tutor/AddTutorForm";
import StudentList from "./components/student/StudentList";
import StudentDetailModal from "./components/student/StudentDetailModal";
import CurriculumList from "./components/kurikulum/CurriculumList";
import TopicManagement from "./components/kurikulum/TopicManagement";
import AssessmentSetManagement from "./components/kurikulum/AssessmentSetManagement";

export default function AdminDashboard() {
  const h = useAdminDashboard();

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
          curriculumSegment={h.curriculumSegment} onCurriculumSegmentChange={h.setCurriculumSegment} />

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
              createCategory={h.createCategory} onCreateCategoryChange={h.setCreateCategory}
              createCurriculumId={h.createCurriculumId} onCreateCurriculumIdChange={h.setCreateCurriculumId}
              createTutorId={h.createTutorId} onCreateTutorIdChange={h.setCreateTutorId}
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
            <TutorList tutors={h.tutorsFull} />
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
          {h.mainMenu === "students" && (
            <StudentList students={h.studentsFull} onSelect={h.handleSelectStudent} />
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
          detailTutorId={h.detailTutorId} onDetailTutorIdChange={h.setDetailTutorId}
          detailStudents={h.detailStudents} detailStudentMap={h.detailStudentMap}
          detailSaving={h.detailSaving} detailError={h.detailError}
          detailAddingStudentId={h.detailAddingStudentId} onDetailAddingStudentIdChange={h.setDetailAddingStudentId}
          tutors={h.tutors}
          pendingRemovals={h.pendingRemovals} onToggleRemoval={h.togglePendingRemoval}
          onClose={() => { h.setDetailClass(null); h.setPendingRemovals(new Set()); }}
          onSave={h.handleSaveDetail}
          onAddStudent={h.handleAddStudent} onReschedule={h.handleReschedule} />
      )}

      {h.selectedStudent && (
        <StudentDetailModal
          student={h.selectedStudent}
          enrollments={h.selectedStudentEnrollments}
          loading={h.studentDetailLoading}
          onImpersonate={() => h.handleImpersonate(h.selectedStudent!.id)}
          onClose={() => { h.setSelectedStudent(null); h.setSelectedStudentEnrollments([]); }}
        />
      )}

      {h.toast && (
        <div className={`fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-2xl px-5 py-3 text-sm font-bold text-white shadow-lg transition-all ${
          h.toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
        }`}>
          {h.toast.message}
        </div>
      )}
    </div>
  );
}
