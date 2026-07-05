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
  type Enrollment,
  type RequestClass,
  type StudentProfile,
  type TutorSlot,
  type AssessmentSet,
} from "@/lib/api";
import { CATEGORY_LABELS } from "../constants";

type TutorOption = { id: string; fullName: string };

export type StudentItem = {
  id: string;
  userId: string;
  fullName: string;
  nickname: string;
  email?: string;
  category: string;
  parentName?: string;
};

export function useAdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [mainMenu, setMainMenu] = useState<"classes" | "tutors" | "curriculums" | "students">("classes");
  const [segment, setSegment] = useState<"classes" | "requests" | "create">("classes");

  const [classes, setClasses] = useState<Class[]>([]);
  const [requests, setRequests] = useState<RequestClass[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [assessmentSets, setAssessmentSets] = useState<AssessmentSet[]>([]);
  const [curriculumSegment, setCurriculumSegment] = useState<"list" | "topics" | "assessments">("list");
  const [loading, setLoading] = useState(true);

  const [createType, setCreateType] = useState<"BATCH" | "PRIVATE" | "MAKEUP">("BATCH");
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
    (async () => {
      try {
        const me = await api.auth.me();
        setUser(me);
        if (me.role !== "ADMIN") { router.replace("/dashboard"); return; }

        const [cls, reqs, tuts, currics, fullTutors, studentProfiles, assSets] = await Promise.all([
          api.classes.listByTutor("") as Promise<Class[]>,
          api.requestClass.list(),
          api.tutorProfiles.list() as Promise<TutorOption[]>,
          api.curriculums.list(),
          api.tutorProfiles.list() as Promise<{ id: string; fullName: string; phone: string; user?: { email: string }; bio?: string | null }[]>,
          api.studentProfiles.list() as Promise<
            { id: string; fullName: string; nickname: string; category: string; user?: { email: string }; parent?: { fullName: string } }[]
          >,
          api.assessmentSets.list(),
        ]);
        setClasses(cls);
        setRequests(reqs);
        setTutors(tuts);
        setCurriculums(currics);
        setAssessmentSets(assSets);
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
    })();
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

  const curriculumEnrolledStudentIds = useMemo(() => {
    const set = new Set<string>();
    for (const cls of classes) {
      if (cls.curriculumId !== createCurriculumId) continue;
      for (const e of cls.enrollments ?? []) {
        set.add(e.studentId);
      }
    }
    return set;
  }, [classes, createCurriculumId]);

  const [unassignedEnrollments, setUnassignedEnrollments] = useState<
    { id: string; studentId: string; curriculumId: string; student: { id: string; fullName: string; category: string; nickname: string; user?: { email: string } } }[]
  >([]);

  useEffect(() => {
    if (!createCurriculumId) { setUnassignedEnrollments([]); return; }
    api.enrollments.listUnassignedByCurriculum(createCurriculumId).then((list) => {
      if (Array.isArray(list)) setUnassignedEnrollments(list as any);
    }).catch(() => setUnassignedEnrollments([]));
  }, [createCurriculumId]);

  const unassignedEnrollmentMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const e of unassignedEnrollments) {
      map.set(e.studentId, e.id);
    }
    return map;
  }, [unassignedEnrollments]);

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
  ], [classColumnHelper]);

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
  ], [reqColumnHelper]);

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

  const DAY_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  function dayKeyFromDate(date: Date | string) {
    return DAY_ORDER[new Date(date).getDay()];
  }

  function generateScheduleSlots(topics: { id: string; title: string }[], slots: { dayOfWeek: string; startTime: string; endTime: string }[], startDate: string, classType: string = "BATCH") {
    const sorted = [...topics].sort((a, b) => a.title.localeCompare(b.title));
    const topicsToUse = classType === "MAKEUP" ? [sorted[0]] : sorted;
    const start = new Date(startDate);
    return topicsToUse.map((topic, i) => {
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

  function timesOverlap(aStart: string, aEnd: string, bStart: string, bEnd: string) {
    return aStart < bEnd && aEnd > bStart;
  }

  const studentConflicts = useMemo(() => {
    const map = new Map<string, { dayOfWeek: string; startTime: string; endTime: string }[]>();
    for (const cls of classes) {
      if (!cls.schedules || !cls.enrollments) continue;
      for (const enrollment of cls.enrollments) {
        const existing = map.get(enrollment.studentId) ?? [];
        for (const s of cls.schedules) {
          existing.push({ dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime });
        }
        map.set(enrollment.studentId, existing);
      }
    }
    return map;
  }, [classes]);

  const [createSelectedStudentIds, setCreateSelectedStudentIds] = useState<string[]>([]);

  const createAvailableStudents = useMemo(() => {
    if (selectedSlots.length === 0) return [];
    return unassignedEnrollments
      .map((e) => ({
        id: e.studentId,
        enrollmentId: e.id,
        fullName: e.student.fullName,
        nickname: e.student.nickname,
        email: e.student.user?.email,
      }))
      .filter((s) => {
        if (curriculumEnrolledStudentIds.has(s.id)) return false;
        return !selectedSlots.some((slot) =>
          (studentConflicts.get(s.id) ?? []).some((c) =>
            c.dayOfWeek === slot.dayOfWeek && timesOverlap(slot.startTime, slot.endTime, c.startTime, c.endTime)
          )
        );
      });
  }, [unassignedEnrollments, selectedSlots, studentConflicts, curriculumEnrolledStudentIds]);

  function getSlotsConflictReason(studentId: string, slots: { dayOfWeek: string; startTime: string; endTime: string }[]) {
    const conflicts = studentConflicts.get(studentId);
    if (!conflicts) return null;
    for (const slot of slots) {
      for (const c of conflicts) {
        if (c.dayOfWeek === slot.dayOfWeek && timesOverlap(slot.startTime, slot.endTime, c.startTime, c.endTime)) {
          return `${SLOT_DAY_LABELS[c.dayOfWeek]} ${c.startTime}-${c.endTime}`;
        }
      }
    }
    return null;
  }

  async function createClass(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreating(true);
    setCreateError("");
    try {
      const autoName = createType === "MAKEUP"
        ? `Make Up - ${selectedCurriculum!.name}`
        : createType === "PRIVATE"
          ? `${selectedCurriculum!.name} - Private`
          : `${selectedCurriculum!.name} - Batch ${createBatchPreview}`;
      const topics = selectedCurriculum!.topics;
      const scheduleData = generateScheduleSlots(topics, selectedSlots, createStartDate, createType);
      const startDateISO = new Date(createStartDate).toISOString();
      const newClass = await api.classes.create({
        name: autoName,
        type: createType,
        category: createCategory,
        tutorId: createTutorId,
        curriculumId: createCurriculumId,
        startDate: startDateISO,
      });
      await Promise.all(scheduleData.map((s) =>
        api.schedules.create({ ...s, classId: newClass.id }),
      ));
      if (createSelectedStudentIds.length > 0) {
        await Promise.all(createSelectedStudentIds.map((sid) => {
          const unassignedId = unassignedEnrollmentMap.get(sid);
          if (unassignedId) {
            return api.enrollments.update(unassignedId, { classId: newClass.id });
          }
          return api.enrollments.create({ studentId: sid, classId: newClass.id, curriculumId: selectedCurriculum!.id });
        }));
      }
      setCreateCurriculumId("");
      setCreateCategory("JUNIOR_I");
      setCreateTutorId("");
      setCreateStartDate("");
      setSelectedSlots([]);
      setCreateSelectedStudentIds([]);
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
      const payload: Record<string, unknown> = {
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
      const [fullClass, allStudents, unassigned] = await Promise.all([
        api.classes.get(cls.id),
        api.studentProfiles.list(),
        cls.curriculumId ? api.enrollments.listUnassignedByCurriculum(cls.curriculumId) : Promise.resolve([] as Enrollment[]),
      ]);
      const unassignedList = Array.isArray(unassigned) ? unassigned : [];
      const map: Record<string, StudentProfile> = {};
      for (const s of allStudents) map[s.id] = s;
      setDetailStudentMap(map);
      setDetailClass(fullClass);
      setDetailClassName(fullClass.name);
      setDetailTutorId(fullClass.tutorId);
      const enrolledIds = new Set((fullClass.enrollments ?? []).map((e) => e.studentId));
      const classSlots = (fullClass.schedules ?? []).map((s) => ({
        dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime,
      }));
      const unassignedStudents = unassignedList
        .map((e: any) => map[e.studentId])
        .filter(Boolean) as StudentProfile[];
      setDetailStudents(unassignedStudents.filter((s) => {
        if (s.category !== fullClass.category) return false;
        if (enrolledIds.has(s.id)) return false;
        if (classSlots.length === 0) return true;
        return !classSlots.some((slot) =>
          (studentConflicts.get(s.id) ?? []).some((c) =>
            c.dayOfWeek === slot.dayOfWeek && timesOverlap(slot.startTime, slot.endTime, c.startTime, c.endTime)
          )
        );
      }));
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
        await Promise.all([...pendingRemovals].map((id) => api.enrollments.update(id, { classId: null })));
      }
      await api.classes.update(detailClass.id, {
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
      // Check if student has unassigned enrollment for this class's curriculum
      let unassignedId: string | undefined;
      if (detailClass.curriculumId) {
        const list = await api.enrollments.listUnassignedByCurriculum(detailClass.curriculumId);
        const found = Array.isArray(list) ? list.find((e: { studentId: string; id: string }) => e.studentId === detailAddingStudentId) : undefined;
        if (found) unassignedId = found.id;
      }
      if (unassignedId) {
        await api.enrollments.update(unassignedId, { classId: detailClass.id });
      } else {
        await api.enrollments.create({ studentId: detailAddingStudentId, classId: detailClass.id, curriculumId: detailClass.curriculumId! });
      }
      const _updated = await api.classes.get(detailClass.id);
      const allStudents = await api.studentProfiles.list();
      const map: Record<string, StudentProfile> = {};
      for (const s of allStudents) map[s.id] = s;
      setDetailStudentMap(map);
      const enrolledIds = new Set((_updated.enrollments ?? []).map((e) => e.studentId));
      const classSlots = (_updated.schedules ?? []).map((s) => ({
        dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime,
      }));
      const unassignedList = _updated.curriculumId
        ? await api.enrollments.listUnassignedByCurriculum(_updated.curriculumId)
        : ([] as Enrollment[]);
      const unassignedStudents = unassignedList
        .map((e: { studentId: string }) => map[e.studentId])
        .filter(Boolean) as StudentProfile[];
      setDetailStudents(unassignedStudents.filter((s) => {
        if (s.category !== _updated.category) return false;
        if (enrolledIds.has(s.id)) return false;
        if (classSlots.length === 0) return true;
        return !classSlots.some((slot) =>
          (studentConflicts.get(s.id) ?? []).some((c) =>
            c.dayOfWeek === slot.dayOfWeek && timesOverlap(slot.startTime, slot.endTime, c.startTime, c.endTime)
          )
        );
      }));
      setDetailClass(_updated);
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

  async function handleShiftSchedule(scheduleId: string) {
    if (!detailClass) return;
    try {
      const schedules = [...(detailClass.schedules ?? [])].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      const idx = schedules.findIndex((s) => s.id === scheduleId);
      if (idx === -1) return;
      const toShift = schedules.slice(idx);
      await Promise.all(
        toShift.map((s) => {
          const d = new Date(s.date);
          d.setDate(d.getDate() + 7);
          return api.schedules.update(s.id, { date: d.toISOString(), dayOfWeek: dayKeyFromDate(d) });
        })
      );
      const updated = await api.classes.get(detailClass.id);
      setDetailClass(updated);
      const cls = await api.classes.listByTutor("");
      setClasses(cls);
      showToast(`${toShift.length} jadwal berhasil digeser +7 hari`, "success");
    } catch (err) {
      console.error("Shift schedule error", err);
      showToast(err instanceof Error ? err.message : "Gagal menggeser jadwal", "error");
    }
  }

  async function handleUpdateScheduleTime(scheduleId: string, startTime: string, endTime: string) {
    try {
      await api.schedules.update(scheduleId, { startTime, endTime });
      if (detailClass) {
        const updated = await api.classes.get(detailClass.id);
        setDetailClass(updated);
        const cls = await api.classes.listByTutor("");
        setClasses(cls);
      }
      showToast("Jam jadwal berhasil diubah", "success");
    } catch {
      showToast("Gagal mengubah jam jadwal", "error");
    }
  }

  async function handleReschedule(scheduleId: string, newDate: string) {
    try {
      await api.schedules.update(scheduleId, { date: new Date(newDate).toISOString(), dayOfWeek: dayKeyFromDate(newDate) });
      if (detailClass) {
        const updated = await api.classes.get(detailClass.id);
        setDetailClass(updated);
        const cls = await api.classes.listByTutor("");
        setClasses(cls);
      }
      showToast("Jadwal berhasil digeser", "success");
    } catch (err) {
      console.error("Reschedule error", err);
      showToast(err instanceof Error ? err.message : "Gagal menggeser jadwal", "error");
    }
  }

  async function handleRegisterTutor(payload: {
    email: string; password: string; fullName: string; phone: string;
    bio?: string | null; meetLink?: string | null; dayoff1?: number | null; dayoff2?: number | null;
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

  async function refreshCurriculumData() {
    try {
      const [currics, assSets] = await Promise.all([
        api.curriculums.list(),
        api.assessmentSets.list(),
      ]);
      setCurriculums(currics);
      setAssessmentSets(assSets);
    } catch {}
  }

  async function logout() {
    await api.auth.logout();
    router.push("/login");
  }

  const [selectedStudent, setSelectedStudent] = useState<StudentProfile | null>(null);
  const [selectedStudentEnrollments, setSelectedStudentEnrollments] = useState<Enrollment[]>([]);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);

  async function handleSelectStudent(student: StudentItem) {
    setStudentDetailLoading(true);
    try {
      const [profile, enrollments] = await Promise.all([
        api.studentProfiles.get(student.id),
        api.enrollments.listByStudent(student.id),
      ]);
      setSelectedStudent(profile);
      setSelectedStudentEnrollments(enrollments);
    } catch {
      setSelectedStudent(null);
      setSelectedStudentEnrollments([]);
    } finally {
      setStudentDetailLoading(false);
    }
  }

  function handleImpersonate(studentId: string) {
    api.auth.impersonate(studentId).then((session) => {
      clearSession();
      window.localStorage.setItem("lms.rememberMe", "true");
      saveSession(session);
      router.replace("/dashboard");
    }).catch(() => showToast("Gagal mengakses akun siswa", "error"));
  }

  return {
    user, loading, mainMenu, setMainMenu, segment, setSegment,
    tutorSegment, setTutorSegment,
    curriculums,
    curriculumSegment, setCurriculumSegment,
    assessmentSets,
    refreshCurriculumData,
    classes, requests, tutors, tutorsFull, registering, registerError,
    createType, setCreateType,
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
    handleSaveDetail, handleAddStudent, handleReschedule, handleShiftSchedule, handleUpdateScheduleTime,
    handleRegisterTutor, logout, handleImpersonate, handleSelectStudent,
    selectedStudent, setSelectedStudent,
    selectedStudentEnrollments, setSelectedStudentEnrollments,
    studentDetailLoading,
    studentsFull,
    createSelectedStudentIds, setCreateSelectedStudentIds,
    createAvailableStudents, getSlotsConflictReason,
    curriculumEnrolledStudentIds,
  };
}


