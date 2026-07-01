"use client";

import { useEffect, useState, useMemo, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import {
  api,
  clearSession,
  saveSession,
  getStoredSession,
  type AuthUser,
  type Class,
  type Curriculum,
  type RequestClass,
  type StudentProfile,
  type TutorSlot,
} from "@/lib/api";
import { CATEGORY_LABELS } from "../constants";

type TutorOption = { id: string; fullName: string };

export function useAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mainMenu, setMainMenu] = useState<"classes" | "tutors" | "curriculums" | "students">("classes");
  const [segment, setSegment] = useState<"classes" | "requests" | "create">("classes");

  const [classes, setClasses] = useState<Class[]>([]);
  const [requests, setRequests] = useState<RequestClass[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [loading, setLoading] = useState(true);

  const [createCurriculumId, setCreateCurriculumId] = useState("");
  const [createCategory, setCreateCategory] = useState("JUNIOR_I");
  const [createTutorId, setCreateTutorId] = useState("");
  const [tutorSegment, setTutorSegment] = useState<"list" | "add">("list");
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [tutorsFull, setTutorsFull] = useState<{ id: string; fullName: string; phone: string; email?: string; bio?: string | null }[]>([]);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [studentsFull, setStudentsFull] = useState<{ id: string; userId: string; fullName: string; nickname: string; email?: string; category: string; parentName?: string }[]>([]);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createStartDate, setCreateStartDate] = useState("");

  const [tutorSlots, setTutorSlots] = useState<TutorSlot[]>([]);
  const [tutorDayoffs, setTutorDayoffs] = useState<number[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<{ dayOfWeek: string; startTime: string; endTime: string }[]>([]);

  const SLOT_DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
  const SLOT_DAY_LABELS: Record<string, string> = {
    MONDAY: "Senin", TUESDAY: "Selasa", WEDNESDAY: "Rabu", THURSDAY: "Kamis",
    FRIDAY: "Jumat", SATURDAY: "Sabtu", SUNDAY: "Minggu",
  };
  const SLOT_HOURS = Array.from({ length: 13 }, (_, i) => i + 9);
  function fmt(h: number) { return `${String(h).padStart(2, "0")}:00`; }
  function isInRange(day: string, hour: number) {
    const idx = SLOT_DAYS.indexOf(day);
    if (hour < 9 || hour >= 21) return false;
    if (idx < 5 && hour < 15) return false;
    return true;
  }

  const [detailClass, setDetailClass] = useState<Class | null>(null);
  const [detailClassName, setDetailClassName] = useState("");
  const [detailTutorId, setDetailTutorId] = useState("");
  const [detailStudents, setDetailStudents] = useState<StudentProfile[]>([]);
  const [detailStudentMap, setDetailStudentMap] = useState<Record<string, StudentProfile>>({});
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [detailAddingStudentId, setDetailAddingStudentId] = useState("");
  const [pendingRemovals, setPendingRemovals] = useState<Set<string>>(new Set());
  function togglePendingRemoval(enrollmentId: string) {
    setPendingRemovals((prev) => {
      const next = new Set(prev);
      if (next.has(enrollmentId)) next.delete(enrollmentId);
      else next.add(enrollmentId);
      return next;
    });
  }

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  const [classGlobalFilter, setClassGlobalFilter] = useState("");
  const [classSorting, setClassSorting] = useState<SortingState>([]);
  const [reqGlobalFilter, setReqGlobalFilter] = useState("");
  const [reqSorting, setReqSorting] = useState<SortingState>([]);

  const [selectedRequest, setSelectedRequest] = useState<RequestClass | null>(null);
  const [approveAction, setApproveAction] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [approveClassId, setApproveClassId] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState("");

  useEffect(() => {
    const session = getStoredSession();
    if (!session) { router.replace("/login"); return; }
    loadData();
  }, [router]);

  const filteredCurriculums = useMemo(
    () => curriculums.filter((c) => c.category === createCategory),
    [curriculums, createCategory],
  );

  useEffect(() => {
    if (!createTutorId) { setTutorSlots([]); setTutorDayoffs([]); setSelectedSlots([]); return; }
    setSlotsLoading(true);
    api.tutorSlots.list(createTutorId)
      .then((res) => { setTutorSlots(res.slots); setTutorDayoffs(res.dayoffs); setSelectedSlots([]); })
      .catch(() => { setTutorSlots([]); setTutorDayoffs([]); })
      .finally(() => setSlotsLoading(false));
  }, [createTutorId]);

  const selectedCurriculum = useMemo(
    () => filteredCurriculums.find((c) => c.id === createCurriculumId),
    [filteredCurriculums, createCurriculumId],
  );

  const createBatchPreview = useMemo(() => {
    if (!selectedCurriculum) return null;
    const matches = classes.filter((c) => c.curriculum?.name === selectedCurriculum.name);
    return matches.reduce((max, c) => Math.max(max, c.batch), 0) + 1;
  }, [selectedCurriculum, classes]);

  const classColumnHelper = createColumnHelper<Class>();
  const classColumns = useMemo(() => [
    classColumnHelper.accessor("name", { header: "Nama Kelas", enableColumnFilter: false }),
    classColumnHelper.accessor("category", {
      header: "Kategori",
      cell: (info) => CATEGORY_LABELS[info.getValue()] ?? info.getValue(),
      enableColumnFilter: false,
    }),
    classColumnHelper.accessor("tutor.fullName", { id: "tutor", header: "Tutor", enableColumnFilter: false }),
    classColumnHelper.accessor((row) => row.enrollments?.length ?? 0, { id: "siswa", header: "Siswa", enableColumnFilter: false }),
    classColumnHelper.accessor((row) => row.schedules?.length ?? 0, { id: "jadwal", header: "Jadwal", enableColumnFilter: false }),
    classColumnHelper.accessor("isActive", {
      header: "Status",
      cell: (info) => info.getValue() ? "Aktif" : "Nonaktif",
      enableColumnFilter: false,
    }),
  ], []);

  const classTable = useReactTable({
    data: classes,
    columns: classColumns,
    state: { sorting: classSorting, globalFilter: classGlobalFilter },
    onSortingChange: setClassSorting,
    onGlobalFilterChange: setClassGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const reqColumnHelper = createColumnHelper<RequestClass>();
  const reqColumns = useMemo(() => [
    reqColumnHelper.accessor("student.fullName", { id: "nama", header: "Nama", enableColumnFilter: false }),
    reqColumnHelper.accessor("student.user.email", { id: "email", header: "Email", enableColumnFilter: false }),
    reqColumnHelper.accessor("category", {
      header: "Kategori",
      cell: (info) => CATEGORY_LABELS[info.getValue()] ?? info.getValue(),
      enableColumnFilter: false,
    }),
    reqColumnHelper.accessor("curriculum", { header: "Kurikulum", enableColumnFilter: false }),
  ], []);

  const reqTable = useReactTable({
    data: requests,
    columns: reqColumns,
    state: { sorting: reqSorting, globalFilter: reqGlobalFilter },
    onSortingChange: setReqSorting,
    onGlobalFilterChange: setReqGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  async function loadData() {
    try {
      const me = await api.auth.me();
      setUser(me);
      if (me.role !== "ADMIN") { router.replace("/dashboard"); return; }

      const [cls, reqs, tuts, currics, fullTutors, studentProfiles] = await Promise.all([
        api.classes.listByTutor("") as Promise<Class[]>,
        api.requestClass.list(),
        api.tutorProfiles.list() as Promise<TutorOption[]>,
        api.curriculums.list(),
        api.tutorProfiles.list() as Promise<{ id: string; fullName: string; phone: string; user?: { email: string }; bio?: string | null }[]>,
        api.studentProfiles.list() as Promise<
          { id: string; fullName: string; nickname: string; category: string; user?: { email: string }; parent?: { fullName: string } }[]
        >,
      ]);
      setClasses(cls);
      setRequests(reqs);
      setTutors(tuts);
      setCurriculums(currics);
      setTutorsFull(fullTutors.map((t) => ({ id: t.id, fullName: t.fullName, phone: t.phone, email: t.user?.email, bio: t.bio })));
      setStudentsFull(
        (studentProfiles as { id: string; fullName: string; nickname: string; category: string; user?: { id: string; email: string }; parent?: { fullName: string } }[]).map((s) => ({
          id: s.id, userId: s.user?.id ?? s.id, fullName: s.fullName, nickname: s.nickname,
          email: s.user?.email, category: s.category,
          parentName: s.parent?.fullName,
        })),
      );
    } catch {
      clearSession();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

  function generateScheduleSlots(topics: { id: string; title: string }[], slots: { dayOfWeek: string; startTime: string; endTime: string }[], startDate: string) {
    const sorted = [...topics].sort((a, b) => a.title.localeCompare(b.title));
    const start = new Date(startDate);
    const DAY_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    return sorted.map((topic, i) => {
      const slot = slots[i % slots.length];
      const weekOffset = Math.floor(i / slots.length);
      const dayIdx = DAY_ORDER.indexOf(slot.dayOfWeek);
      const startDay = start.getDay();
      let daysUntilTarget = (dayIdx - startDay + 7) % 7;
      daysUntilTarget += weekOffset * 7;
      const d = new Date(start);
      d.setDate(d.getDate() + daysUntilTarget);
      return {
        classId: "",
        dayOfWeek: slot.dayOfWeek,
        startTime: slot.startTime,
        endTime: slot.endTime,
        meetLink: `https://meet.google.com/new`,
        topic: topic.title,
        topicId: topic.id,
        date: d.toISOString().split("T")[0],
      };
    });
  }

  async function createClass(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const autoName = `${selectedCurriculum!.name} - Batch ${createBatchPreview}`;
      const topics = selectedCurriculum!.topics;
      const scheduleData = generateScheduleSlots(topics, selectedSlots, createStartDate);
      const startDateISO = new Date(createStartDate).toISOString();
      const newClass = await api.classes.create({
        name: autoName,
        category: createCategory,
        tutorId: createTutorId,
        curriculumId: createCurriculumId,
        startDate: startDateISO,
      });
      await Promise.all(scheduleData.map((s) =>
        api.schedules.create({ ...s, classId: newClass.id }),
      ));
      setCreateCurriculumId("");
      setCreateCategory("JUNIOR_I");
      setCreateTutorId("");
      setCreateStartDate("");
      setSelectedSlots([]);
      setTutorSlots([]);
      const cls = await api.classes.listByTutor("");
      setClasses(cls);
      setSegment("classes");
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Gagal membuat kelas");
    } finally {
      setCreating(false);
    }
  }

  async function handleApproveReject() {
    if (!selectedRequest) return;
    setApproving(true);
    setApproveError("");
    try {
      const payload: any = {
        status: approveAction,
        adminNotes: adminNotes || null,
        reviewedBy: user!.id,
        reviewedAt: new Date().toISOString(),
      };
      if (approveAction === "APPROVED" && approveClassId) {
        payload.approvedClassId = approveClassId;
      }
      await api.requestClass.update(selectedRequest.id, payload);
      setSelectedRequest(null);
      const reqs = await api.requestClass.list();
      setRequests(reqs);
    } catch (err) {
      setApproveError(err instanceof Error ? err.message : "Gagal memproses");
    } finally {
      setApproving(false);
    }
  }

  async function openClassDetail(cls: Class) {
    try {
      const [fullClass, allStudents] = await Promise.all([
        api.classes.get(cls.id),
        api.studentProfiles.list(),
      ]);
      const map: Record<string, StudentProfile> = {};
      for (const s of allStudents) map[s.id] = s;
      setDetailStudentMap(map);
      setDetailClass(fullClass);
      setDetailClassName(fullClass.name);
      setDetailTutorId(fullClass.tutorId);
      const enrolledIds = new Set((fullClass.enrollments ?? []).map((e) => e.studentId));
      setDetailStudents(allStudents.filter((s) => s.category === fullClass.category && !enrolledIds.has(s.id)));
      setDetailAddingStudentId("");
      setDetailError("");
      setPendingRemovals(new Set());
    } catch {
      setDetailError("Gagal memuat detail kelas");
    }
  }

  async function handleSaveDetail() {
    if (!detailClass) return;
    setDetailSaving(true);
    setDetailError("");
    try {
      if (pendingRemovals.size > 0) {
        await Promise.all([...pendingRemovals].map((id) => api.enrollments.delete(id)));
      }
      const updated = await api.classes.update(detailClass.id, {
        name: detailClassName,
        tutorId: detailTutorId,
      });
      const allStudents = await api.studentProfiles.list();
      const map: Record<string, StudentProfile> = {};
      for (const s of allStudents) map[s.id] = s;
      setDetailStudentMap(map);
      const cls = await api.classes.listByTutor("");
      setClasses(cls);
      setDetailClass(null);
      showToast("Kelas berhasil diperbarui", "success");
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setDetailSaving(false);
    }
  }

  async function handleAddStudent() {
    if (!detailClass || !detailAddingStudentId) return;
    setDetailSaving(true);
    setDetailError("");
    try {
      await api.enrollments.create({ studentId: detailAddingStudentId, classId: detailClass.id });
      const updated = await api.classes.get(detailClass.id);
      const allStudents = await api.studentProfiles.list();
      const map: Record<string, StudentProfile> = {};
      for (const s of allStudents) map[s.id] = s;
      setDetailStudentMap(map);
      const enrolledIds = new Set((updated.enrollments ?? []).map((e) => e.studentId));
      setDetailStudents(allStudents.filter((s) => s.category === updated.category && !enrolledIds.has(s.id)));
      setDetailClass(updated);
      setDetailAddingStudentId("");
      const cls = await api.classes.listByTutor("");
      setClasses(cls);
      showToast("Siswa berhasil ditambahkan", "success");
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Gagal menambahkan siswa");
    } finally {
      setDetailSaving(false);
    }
  }

  async function handleRemoveStudent(enrollmentId: string) {
    if (!detailClass) return;
    setDetailSaving(true);
    setDetailError("");
    try {
      await api.enrollments.delete(enrollmentId);
      const updated = await api.classes.get(detailClass.id);
      const allStudents = await api.studentProfiles.list();
      const map: Record<string, StudentProfile> = {};
      for (const s of allStudents) map[s.id] = s;
      setDetailStudentMap(map);
      const enrolledIds = new Set((updated.enrollments ?? []).map((e) => e.studentId));
      setDetailStudents(allStudents.filter((s) => s.category === updated.category && !enrolledIds.has(s.id)));
      setDetailClass(updated);
      const cls = await api.classes.listByTutor("");
      setClasses(cls);
      showToast("Siswa berhasil dihapus", "success");
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Gagal menghapus siswa");
    } finally {
      setDetailSaving(false);
    }
  }

  async function handleReschedule(scheduleId: string, newDate: string) {
    try {
      await api.schedules.update(scheduleId, { date: new Date(newDate).toISOString() });
      if (detailClass) {
        const updated = await api.classes.get(detailClass.id);
        setDetailClass(updated);
        const cls = await api.classes.listByTutor("");
        setClasses(cls);
      }
      showToast("Jadwal berhasil digeser", "success");
    } catch {
      showToast("Gagal menggeser jadwal", "error");
    }
  }

  async function handleRegisterTutor(payload: {
    email: string; password: string; fullName: string; phone: string;
    bio?: string | null; dayoff1?: number | null; dayoff2?: number | null;
  }) {
    setRegistering(true);
    setRegisterError("");
    try {
      const session = await api.auth.registerTutor(payload);
      const tutorId = session.user.tutorProfile?.id;
      if (tutorId && (payload.dayoff1 != null || payload.dayoff2 != null)) {
        await api.tutorSlots.updateDayoffs(tutorId, payload.dayoff1 ?? null, payload.dayoff2 ?? null);
      }
      const [tuts, fullTutors] = await Promise.all([
        api.tutorProfiles.list() as Promise<TutorOption[]>,
        api.tutorProfiles.list() as Promise<{ id: string; fullName: string; phone: string; user?: { email: string }; bio?: string | null }[]>,
      ]);
      setTutors(tuts);
      setTutorsFull(fullTutors.map((t) => ({ id: t.id, fullName: t.fullName, phone: t.phone, email: t.user?.email, bio: t.bio })));
      setTutorSegment("list");
      showToast("Tutor berhasil ditambahkan", "success");
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : "Gagal menambahkan tutor");
    } finally {
      setRegistering(false);
    }
  }

  async function logout() {
    await api.auth.logout();
    router.push("/login");
  }

  function handleImpersonate(studentId: string) {
    api.auth.impersonate(studentId).then((session) => {
      clearSession();
      saveSession(session);
      router.replace("/dashboard");
    }).catch(() => showToast("Gagal mengakses akun siswa", "error"));
  }

  return {
    user, loading, mainMenu, setMainMenu, segment, setSegment,
    tutorSegment, setTutorSegment,
    classes, requests, tutors, tutorsFull, registering, registerError,
    createCategory, setCreateCategory,
    createCurriculumId, setCreateCurriculumId,
    createTutorId, setCreateTutorId,
    createStartDate, setCreateStartDate,
    creating, createError,
    filteredCurriculums, selectedCurriculum, createBatchPreview,
    tutorSlots, tutorDayoffs, slotsLoading, selectedSlots, setSelectedSlots,
    SLOT_DAYS, SLOT_DAY_LABELS, SLOT_HOURS, fmt, isInRange,
    classGlobalFilter, setClassGlobalFilter, classTable,
    reqGlobalFilter, setReqGlobalFilter, reqTable,
    detailClass, setDetailClass,
    detailClassName, setDetailClassName,
    detailTutorId, setDetailTutorId,
    detailStudents, detailStudentMap,
    detailSaving, detailError,
    detailAddingStudentId, setDetailAddingStudentId,
    pendingRemovals, setPendingRemovals, togglePendingRemoval,
    selectedRequest, setSelectedRequest,
    approveAction, setApproveAction,
    approveClassId, setApproveClassId,
    adminNotes, setAdminNotes,
    approving, approveError, setApproveError,
    toast, showToast,
    createClass, handleApproveReject, openClassDetail,
    handleSaveDetail, handleAddStudent, handleReschedule,
    handleRegisterTutor, logout, handleImpersonate, studentsFull,
  };
}


