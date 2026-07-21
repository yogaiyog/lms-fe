"use client";

import { useState } from "react";
import { ChevronLeft, FileText, Camera } from "lucide-react";
import type { StudentProfile, StudentBadge, SavedReport } from "@/lib/api";
import { api } from "@/lib/api";
import type { Theme, ClassWithEnrollments, AttendanceWithDetails, AssessmentSummary, GeneratedReport } from "./_student_segment_component/types";
import { Card } from "./_student_segment_component/components";
import StudentListCard from "./_student_segment_component/student-list-card";
import StudentProfileCard from "./_student_segment_component/student-profile-card";
import ClassListSection from "./_student_segment_component/class-list-section";
import AttendanceList from "./_student_segment_component/attendance-list";
import BadgeList from "./_student_segment_component/badge-list";
import AssessmentList from "./_student_segment_component/assessment-list";
import ReportPickerModal from "./_student_segment_component/report-picker-modal";
import ReportViewerModal from "./_student_segment_component/report-viewer-modal";
import GalleryUploadModal from "./_student_segment_component/gallery-upload-modal";
import GalleryViewModal from "./_student_segment_component/gallery-view-modal";

export default function TutorStudentsSegment({
  theme, classes, students,
}: {
  theme: Theme;
  classes: ClassWithEnrollments[];
  students: StudentProfile[];
}) {
  const [view, setView] = useState<"list" | "detail">("list");
  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [attendances, setAttendances] = useState<AttendanceWithDetails[]>([]);
  const [badges, setBadges] = useState<StudentBadge[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentSummary[]>([]);
  const [selectedAttendanceIds, setSelectedAttendanceIds] = useState<string[]>([]);
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [showSavedReports, setShowSavedReports] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportViewModal, setShowReportViewModal] = useState(false);
  const [reportViewData, setReportViewData] = useState<GeneratedReport | null>(null);
  const [reportViewTitle, setReportViewTitle] = useState("Laporan Dibuat");
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showGalleryView, setShowGalleryView] = useState(false);

  const enrolledStudentIds = new Set<string>();
  const classMap = new Map<string, ClassWithEnrollments>();
  for (const cls of classes) {
    classMap.set(cls.id, cls);
    for (const e of cls.enrollments ?? []) {
      enrolledStudentIds.add(e.studentId);
    }
  }
  const tutorStudents = students.filter((s) => enrolledStudentIds.has(s.id));

  async function openStudentDetail(student: StudentProfile) {
    setSelectedStudent(student);
    setView("detail");
    setLoadingDetail(true);
    setAttendances([]);
    setBadges([]);
    setAssessments([]);
    setSelectedAttendanceIds([]);
    setGeneratedReport(null);
    try {
      const [atts, bgs] = await Promise.all([
        api.attendances.listByStudent(student.id),
        api.studentBadges.listByStudent(student.id),
      ]);
      const detailedAttendances = atts as AttendanceWithDetails[];
      setAttendances(detailedAttendances);
      setBadges(bgs);

      const assessmentsWithScores: AssessmentSummary[] = [];
      for (const att of detailedAttendances) {
        if (att.assessment) {
          const scores = att.assessment.scores ?? [];
          assessmentsWithScores.push({
            date: att.schedule?.date ?? att.date,
            percentage: att.assessment.percentage ?? 0,
            comment: att.assessment.mentorComment ?? "",
            scores,
            assessmentId: att.assessment.id,
          });
        }
      }
      assessmentsWithScores.sort((a, b) => b.date.localeCompare(a.date));
      setAssessments(assessmentsWithScores);
    } catch {
      // silent
    } finally {
      setLoadingDetail(false);
    }
  }

  function getStudentClasses(studentId: string) {
    const result: ClassWithEnrollments[] = [];
    for (const cls of classes) {
      const enrollment = (cls.enrollments ?? []).find((e) => e.studentId === studentId);
      if (enrollment) result.push(cls);
    }
    return result;
  }

  async function handleAttendanceSave(attendanceId: string, data: { status: string; notes: string | null }) {
    try {
      await api.attendances.update(attendanceId, { status: data.status, notes: data.notes });
      setAttendances(prev => prev.map(a => a.id === attendanceId ? { ...a, status: data.status as AttendanceWithDetails["status"], notes: data.notes ?? undefined } : a));
      setGeneratedReport(null);
    } catch (e) {
      console.error(e);
    }
  }

  async function handleAssessmentSave(index: number, data: { percentage: number; comment: string | null; scores: { id: string; score: number; notes: string | null }[] }) {
    try {
      const assessment = assessments[index];
      if (!assessment.assessmentId) return;
      await api.attendanceAssessments.update(assessment.assessmentId, { percentage: data.percentage, mentorComment: data.comment });
      for (const score of data.scores) {
        await api.attendanceAssessmentScores.update(score.id, { score: score.score, notes: score.notes });
      }
      setAssessments(prev => prev.map((a, i) => i === index ? { ...a, percentage: data.percentage, comment: data.comment ?? "" } : a));
      setGeneratedReport(null);
    } catch (e) {
      console.error(e);
    }
  }

  function toggleReportAttendance(attendanceId: string) {
    setGeneratedReport(null);
    setSelectedAttendanceIds((prev) =>
      prev.includes(attendanceId) ? prev.filter((id) => id !== attendanceId) : [...prev, attendanceId]
    );
  }

  async function generateStudentReport() {
    if (!selectedStudent) return;
    const selectedAttendances = attendances.filter((att) => selectedAttendanceIds.includes(att.id) && att.assessment);
    if (selectedAttendances.length === 0) { setGeneratedReport(null); return; }

    let totalScore = 0, maxScore = 0;
    const statusCounts = { PRESENT: 0, LATE: 0, ABSENT: 0, SICK: 0, PERMISSION: 0 };
    const topics: string[] = [];

    for (const att of selectedAttendances) {
      const scores = att.assessment?.scores ?? [];
      totalScore += att.assessment?.totalScore ?? scores.reduce((sum, s) => sum + s.score, 0);
      maxScore += scores.reduce((sum, s) => sum + (s.aspect?.maxScore ?? 5), 0);
      if (statusCounts[att.status as keyof typeof statusCounts] !== undefined) statusCounts[att.status as keyof typeof statusCounts]++;
      if (att.schedule?.topic && !topics.includes(att.schedule.topic)) topics.push(att.schedule.topic);
    }
    const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    const aspectMap = new Map<string, { totalScore: number; totalMaxScore: number; count: number; description: string | null; icon: string | null }>();
    try {
      const scheduleIds = [...new Set(selectedAttendances.map((a) => a.schedule?.id).filter(Boolean) as string[])];
      const reports = await Promise.allSettled(scheduleIds.map((sid) => api.reports.getScheduleReport(sid)));
      for (const result of reports) {
        if (result.status !== "fulfilled") continue;
        const report = result.value as { students?: { student?: { id: string }; aspectAnalysis?: { aspectTitle: string; score: number; maxScore: number; aspectDescription?: string | null; icon?: string | null }[] }[] };
        for (const student of (report?.students ?? [])) {
          if (student.student?.id !== selectedStudent.id) continue;
          for (const item of (student.aspectAnalysis ?? [])) {
            const existing = aspectMap.get(item.aspectTitle);
            if (existing) { existing.totalScore += item.score; existing.totalMaxScore += item.maxScore; existing.count++; }
            else { aspectMap.set(item.aspectTitle, { totalScore: item.score, totalMaxScore: item.maxScore, count: 1, description: item.aspectDescription ?? null, icon: item.icon ?? null }); }
          }
        }
      }
    } catch { /* noop */ }

    const aspectSummaries = [...aspectMap].map(([title, d]) => {
      const avgPct = d.totalMaxScore > 0 ? (d.totalScore / d.totalMaxScore) * 100 : 0;
      return {
        aspectTitle: title, aspectDescription: d.description, icon: d.icon,
        avgScore: d.totalScore / d.count, avgMaxScore: d.totalMaxScore / d.count, avgPercentage: avgPct, count: d.count,
        narrative: avgPct >= 50
          ? `${selectedStudent.nickname || selectedStudent.fullName} memiliki kelebihan di ${title}${d.description ? ` yaitu ${d.description}` : ""}`
          : `${selectedStudent.nickname || selectedStudent.fullName} memiliki kekurangan di ${title}${d.description ? ` yaitu ${d.description}` : ""}`,
      };
    });
    aspectSummaries.sort((a, b) => b.avgPercentage - a.avgPercentage);
    const strengths = aspectSummaries.filter((a) => a.avgPercentage >= 50).slice(0, 2);
    const topWeakness = aspectSummaries.filter((a) => a.avgPercentage < 50).at(-1) ?? null;

    const notes = selectedAttendances
      .filter((a) => a.assessment?.mentorComment)
      .map((a) => ({
        comment: a.assessment!.mentorComment!,
        date: a.date ?? a.schedule?.date ?? "",
        tutorName: a.tutor?.fullName ?? "Tutor",
      }));

    const projectLinks = selectedAttendances
      .filter((a) => a.assessment?.projectLink)
      .map((a) => ({
        url: a.assessment!.projectLink!,
        date: a.date ?? a.schedule?.date ?? "",
      }));

    const report: GeneratedReport = {
      student: { id: selectedStudent.id, fullName: selectedStudent.fullName, nickname: selectedStudent.nickname },
      generatedAt: new Date().toISOString(), selectedCount: selectedAttendances.length,
      totalScore, maxScore, scorePercentage, statusCounts, topics,
      topStrengths: strengths, topWeakness,
      assessmentScores: aspectSummaries.map((a) => ({
        aspectTitle: a.aspectTitle, aspectDescription: a.aspectDescription, icon: a.icon,
        avgScore: a.avgScore, avgMaxScore: a.avgMaxScore, avgPercentage: a.avgPercentage, count: a.count,
      })),
      notes, projectLinks,
    };
    setGeneratedReport(report);
    setReportViewData(report);
    setReportViewTitle("Laporan Dibuat");
    setShowReportModal(false);
    setShowReportViewModal(true);
  }

  async function fetchSavedReports() {
    try { setSavedReports(await api.savedReports.list() ?? []); } catch { setSavedReports([]); }
  }

  async function saveCurrentReport(title: string) {
    if (!generatedReport || !selectedStudent) return;
    setSavingReport(true);
    try {
      await api.savedReports.create({ studentId: selectedStudent.id, title, data: generatedReport });
      await fetchSavedReports();
    } catch { /* noop */ } finally { setSavingReport(false); }
  }

  async function deleteSavedReport(id: string) {
    try { await api.savedReports.delete(id); setSavedReports((prev) => prev.filter((r) => r.id !== id)); } catch { /* noop */ }
  }

  function loadSavedReport(report: SavedReport) {
    setReportViewData(report.data);
    setReportViewTitle(report.title);
    setShowSavedReports(false);
    setShowReportModal(false);
    setShowReportViewModal(true);
  }

  if (view === "list") {
    if (tutorStudents.length === 0) {
      return (
        <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
          <span className="text-5xl mb-4">👤</span>
          <h2 className={`font-bold ${theme.text}`}>Belum ada siswa</h2>
          <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Kelas kamu belum memiliki siswa terdaftar</p>
        </Card>
      );
    }
    return (
      <div className="space-y-3">
        {tutorStudents.map((student) => (
          <StudentListCard
            key={student.id}
            student={student}
            theme={theme}
            classes={getStudentClasses(student.id)}
            onClick={() => openStudentDetail(student)}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <button onClick={() => setView("list")} className={`flex items-center gap-2 px-4 py-2 rounded-xl ${theme.dark ? "bg-slate-800" : "bg-slate-100"} ${theme.text} hover:opacity-80 transition-all`}>
        <ChevronLeft size={20} /> Kembali
      </button>

      {selectedStudent && (
        <>
          <StudentProfileCard theme={theme} student={selectedStudent} totalPresent={attendances.filter((a) => a.status === "PRESENT").length} />

          {loadingDetail ? (
            <div className="flex items-center justify-center py-12">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-5">
              <ClassListSection theme={theme} classes={getStudentClasses(selectedStudent.id)} studentId={selectedStudent.id} />

              {attendances.length > 0 && (
                <AttendanceList attendances={attendances} theme={theme} onSave={handleAttendanceSave} />
              )}


              {assessments.length > 0 && (
                <AssessmentList assessments={assessments} theme={theme} onSave={handleAssessmentSave} studentId={selectedStudent.id} />
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowReportModal(true)} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 transition">
                  <FileText size={18} /> Laporan
                </button>
                <button onClick={() => setShowGalleryView(true)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white shadow-sm hover:bg-emerald-700 transition">
                  <Camera size={18} /> Gallery
                </button>
              </div>

              {attendances.length === 0 && badges.length === 0 && (
                <div className="py-8 text-center">
                  <p className={`text-sm ${theme.textMuted}`}>Belum ada data aktivitas untuk siswa ini</p>
                </div>
              )}

              {showReportModal && (
                <ReportPickerModal
                  theme={theme}
                  attendances={attendances}
                  selectedAttendanceIds={selectedAttendanceIds}
                  savedReports={savedReports}
                  showSavedReports={showSavedReports}
                  onToggleAttendance={toggleReportAttendance}
                  onGenerateReport={generateStudentReport}
                  onToggleSavedReports={() => setShowSavedReports(!showSavedReports)}
                  onLoadSavedReport={loadSavedReport}
                  onDeleteSavedReport={deleteSavedReport}
                  onClose={() => setShowReportModal(false)}
                  onFetchSavedReports={fetchSavedReports}
                />
              )}

              {showReportViewModal && reportViewData && (
                <ReportViewerModal
                  theme={theme}
                  data={reportViewData}
                  title={reportViewTitle}
                  onBack={() => { setShowReportViewModal(false); setShowReportModal(true); }}
                  onClose={() => setShowReportViewModal(false)}
                  onSave={reportViewTitle === "Laporan Dibuat" ? saveCurrentReport : undefined}
                  saving={savingReport}
                />
              )}

              {showGalleryModal && selectedStudent && (
                <GalleryUploadModal
                  open={showGalleryModal}
                  studentId={selectedStudent.id}
                  theme={theme}
                  onClose={() => setShowGalleryModal(false)}
                />
              )}

              {showGalleryView && selectedStudent && (
                <GalleryViewModal
                  open={showGalleryView}
                  studentId={selectedStudent.id}
                  theme={theme}
                  onClose={() => setShowGalleryView(false)}
                />
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
