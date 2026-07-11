"use client";

import { useEffect, useState, useMemo, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
  type Category,
  type Class,
  type Curriculum,
  type Enrollment,
  type RequestClass,
  type StudentProfile,
  type TutorSlot,
  type AssessmentSet,
  type Certificate,
  type ParentProfile,
} from "@/lib/api";
import { CATEGORY_LABELS } from "../constants";

type TutorOption = { id: string; fullName: string };

export type StudentItem = {
  id: string;
  userId: string;
  fullName: string;
  nickname: string;
  email?: string;
  category?: Category | null;
  parentName?: string;
  isActive?: boolean;
  createdAt?: string;
  school?: string | null;
};

export function useAdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const menuParam = searchParams.get("menu") as "classes" | "tutors" | "curriculums" | "students" | "attendance" | null;
  const segParam = searchParams.get("seg");

  const validMenus = ["classes", "tutors", "curriculums", "students", "attendance"] as const;
  const initialMenu = menuParam && validMenus.includes(menuParam) ? menuParam : "classes";

  const [user, setUser] = useState<AuthUser | null>(null);
  const [mainMenu, setMainMenu] = useState<"classes" | "tutors" | "curriculums" | "students" | "attendance">(initialMenu);
  const [segment, setSegment] = useState<"classes" | "requests" | "create">(
    initialMenu === "classes" && ["classes", "requests", "create"].includes(segParam ?? "") ? segParam as "classes" | "requests" | "create" : "classes"
  );

  const [classes, setClasses] = useState<Class[]>([]);
  const [requests, setRequests] = useState<RequestClass[]>([]);
  const [curriculums, setCurriculums] = useState<Curriculum[]>([]);
  const [assessmentSets, setAssessmentSets] = useState<AssessmentSet[]>([]);
  const [curriculumSegment, setCurriculumSegment] = useState<"list" | "topics" | "assessments">(
    initialMenu === "curriculums" && ["list", "topics", "assessments"].includes(segParam ?? "") ? segParam as "list" | "topics" | "assessments" : "list"
  );
  const [loading, setLoading] = useState(true);

  const [createType, setCreateType] = useState<"BATCH" | "PRIVATE" | "MAKEUP" | "TRIAL">("BATCH");
  const [createIsOnline, setCreateIsOnline] = useState(true);
  const [createLocation, setCreateLocation] = useState("");
  const [createName, setCreateName] = useState("");
  const [createCurriculumId, setCreateCurriculumId] = useState("");
  const [createCategory, setCreateCategory] = useState("Kelas 1");
  const [createTutorIds, setCreateTutorIds] = useState<string[]>([]);
  const [tutorSegment, setTutorSegment] = useState<"list" | "add">(
    initialMenu === "tutors" && ["list", "add"].includes(segParam ?? "") ? segParam as "list" | "add" : "list"
  );
  const [studentSegment, setStudentSegment] = useState<"list" | "enrollment" | "parent" | "add">(
    initialMenu === "students" && ["list", "enrollment", "parent", "add"].includes(segParam ?? "") ? segParam as "list" | "enrollment" | "parent" | "add" : "list"
  );
  const [tutors, setTutors] = useState<TutorOption[]>([]);
  const [tutorsFull, setTutorsFull] = useState<{ id: string; fullName: string; phone: string; email?: string; bio?: string | null }[]>([]);
  const [registering, setRegistering] = useState(false);
  const [registerError, setRegisterError] = useState("");
  const [studentsFull, setStudentsFull] = useState<{ id: string; userId: string; fullName: string; nickname: string; email?: string; category?: Category | null; parentName?: string }[]>([]);
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
  const [detailTutorIds, setDetailTutorIds] = useState<string[]>([]);
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
    const seg = mainMenu === "classes" ? segment
      : mainMenu === "tutors" ? tutorSegment
      : mainMenu === "students" ? studentSegment
      : mainMenu === "curriculums" ? curriculumSegment
      : "";
    const params = new URLSearchParams({ menu: mainMenu });
    if (seg) params.set("seg", seg);
    const qs = params.toString();
    const url = qs ? `?${qs}` : window.location.pathname;
    router.replace(url, { scroll: false });
  }, [mainMenu, segment, tutorSegment, studentSegment, curriculumSegment, router]);

  useEffect(() => {
    const session = getStoredSession();
    if (!session) { router.replace("/login"); return; }
    (async () => {
      try {
        const me = await api.auth.me();
        setUser(me);
        if (me.role !== "ADMIN") { router.replace("/dashboard"); return; }

        const [cls, reqs, tuts, currics, fullTutors, studentProfiles, assSets, cats, parents] = await Promise.all([
          api.classes.listByTutor("") as Promise<Class[]>,
          api.requestClass.list(),
          api.tutorProfiles.list() as Promise<TutorOption[]>,
          api.curriculums.list(),
          api.tutorProfiles.list() as Promise<{ id: string; fullName: string; phone: string; user?: { email: string }; bio?: string | null }[]>,
          api.studentProfiles.list(),
          api.assessmentSets.list(),
          api.categories.list(),
          api.parentProfiles.list("?showArchived=true"),
        ]);
        setClasses(cls);
        setRequests(reqs);
        setTutors(tuts);
        setCurriculums(currics);
        setAssessmentSets(assSets);
        setCategories(cats);
        setAllParents(parents);
        setTutorsFull(fullTutors.map((t) => ({ id: t.id, fullName: t.fullName, phone: t.phone, email: t.user?.email, bio: t.bio })));
        setStudentsFull(
          studentProfiles.map((s) => ({
            id: s.id, userId: s.user?.id ?? s.id, fullName: s.fullName, nickname: s.nickname,
            email: s.user?.email, category: s.category,
            parentName: s.parent?.fullName, isActive: s.isActive, createdAt: s.createdAt, school: s.school,
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
    () => curriculums.filter((c) => c.categories?.some((cat) => cat.category.name === createCategory)),
    [curriculums, createCategory],
  );

  useEffect(() => {
    if (createTutorIds.length === 0) { setTutorSlots([]); setTutorDayoffs([]); setSelectedSlots([]); return; }
    setSlotsLoading(true);
    Promise.all(createTutorIds.map((id) => api.tutorSlots.list(id)))
      .then((results) => {
        const slotMap = new Map<string, TutorSlot & { count: number }>();
        const allDayoffs = new Set<number>();
        const tutorCount = results.length;
        for (const res of results) {
          for (const d of res.dayoffs) allDayoffs.add(d);
          for (const s of res.slots) {
            const key = `${s.dayOfWeek}|${s.startTime}`;
            if (!slotMap.has(key)) {
              slotMap.set(key, { ...s, count: 1 });
            } else {
              const existing = slotMap.get(key)!;
              existing.count++;
              if (s.isFilled) existing.isFilled = true;
              if (s.isDayoff) existing.isDayoff = true;
            }
          }
        }
        const merged = Array.from(slotMap.values()).filter((s) => s.count === tutorCount);
        setTutorSlots(merged);
        setTutorDayoffs(Array.from(allDayoffs));
        setSelectedSlots([]);
      })
      .catch(() => { setTutorSlots([]); setTutorDayoffs([]); })
      .finally(() => setSlotsLoading(false));
  }, [createTutorIds]);

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
      if (Array.isArray(list)) {
        const mapped: { id: string; studentId: string; curriculumId: string; student: { id: string; fullName: string; category: string; nickname: string; user?: { email: string } } }[] = [];
        for (const e of list) {
          if (!e.student) continue;
          mapped.push({
            id: e.id,
            studentId: e.studentId,
            curriculumId: e.curriculumId,
            student: {
              id: e.student.id,
              fullName: e.student.fullName,
              category: e.student.category?.name ?? "",
              nickname: e.student.nickname,
              user: e.student.user ? { email: e.student.user.email } : undefined,
            },
          });
        }
        setUnassignedEnrollments(mapped);
      }
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

  useEffect(() => {
    if (!selectedCurriculum) { setCreateName(""); return; }
    const name = createType === "MAKEUP"
      ? `Make Up - ${selectedCurriculum.name}`
      : createType === "PRIVATE"
        ? `${selectedCurriculum.name} - Private`
        : createType === "TRIAL"
          ? `${selectedCurriculum.name} - Trial`
          : `${selectedCurriculum.name} - Batch ${createBatchPreview ?? "?"}`;
    setCreateName(name);
  }, [createType, selectedCurriculum, createBatchPreview]);

  const classColumnHelper = createColumnHelper<Class>();
  const classColumns = useMemo(() => [
    classColumnHelper.accessor("name", { header: "Nama Kelas", enableColumnFilter: false }),
    classColumnHelper.accessor("category", {
      header: "Kategori",
      cell: (info) => info.getValue<{ label?: string } | null>()?.label ?? "-",
      enableColumnFilter: false,
    }),
    classColumnHelper.accessor((row) => row.tutors?.map((t) => t.fullName).join(", ") ?? "", { id: "tutors", header: "Tutor", enableColumnFilter: false }),
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
          : createType === "TRIAL"
            ? `${selectedCurriculum!.name} - Trial`
            : `${selectedCurriculum!.name} - Batch ${createBatchPreview}`;
      const topics = selectedCurriculum!.topics;
      const scheduleData = generateScheduleSlots(topics, selectedSlots, createStartDate, createType);
      const startDateISO = new Date(createStartDate).toISOString();
      const cat = (await api.categories.list()).find((c) => c.name === createCategory);
      const newClass = await api.classes.create({
        name: createName || autoName,
        type: createType,
        categoryId: cat?.id,
        tutorIds: createTutorIds,
        curriculumId: createCurriculumId,
        startDate: startDateISO,
        isOnline: createIsOnline,
        location: createIsOnline ? null : (createLocation || null),
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
      setCreateCategory("Kelas 1");
      setCreateTutorIds([]);
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
      setDetailTutorIds(fullClass.tutors?.map((t) => t.id) ?? []);
      const enrolledIds = new Set((fullClass.enrollments ?? []).map((e) => e.studentId));
      const classSlots = (fullClass.schedules ?? []).map((s) => ({
        dayOfWeek: s.dayOfWeek, startTime: s.startTime, endTime: s.endTime,
      }));
      const unassignedStudents = unassignedList
        .map((e: { studentId: string }) => map[e.studentId])
        .filter(Boolean) as StudentProfile[];
      setDetailStudents(unassignedStudents.filter((s) => {
        if (s.category?.id !== fullClass.category?.id) return false;
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
        tutorIds: detailTutorIds,
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
        if (s.category?.id !== _updated.category?.id) return false;
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

  async function handleCreateParent(payload: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }): Promise<string> {
    const session = await api.auth.registerParentByAdmin(payload);
    const parentId = session.user.parentProfile?.id;
    if (!parentId) throw new Error("Gagal mendapatkan data orang tua");
    const parents = await api.parentProfiles.list("?showArchived=true");
    setAllParents(parents);
    showToast("Orang tua berhasil ditambahkan", "success");
    return parentId;
  }

  async function handleRegisterStudent(payload: {
    parentId: string;
    email: string;
    password: string;
    fullName: string;
    nickname: string;
    birthDate: string;
    categoryId?: string | null;
    school?: string | null;
  }) {
    setRegistering(true);
    setRegisterError("");
    try {
      await api.studentProfiles.create(payload);
      window.location.reload();
    } catch (err) {
      setRegisterError(err instanceof Error ? err.message : "Gagal menambahkan siswa");
    } finally {
      setRegistering(false);
    }
  }

  async function handleArchiveStudent(student: StudentItem) {
    try {
      await api.studentProfiles.update(student.id, { isActive: false });
      setStudentsFull((prev) => prev.map((s) => s.id === student.id ? { ...s, isActive: false } : s));
      showToast("Siswa berhasil diarsipkan", "success");
    } catch {
      showToast("Gagal mengarsipkan siswa", "error");
    }
  }

  async function handleRestoreStudent(student: StudentItem) {
    try {
      await api.studentProfiles.update(student.id, { isActive: true });
      setStudentsFull((prev) => prev.map((s) => s.id === student.id ? { ...s, isActive: true } : s));
      showToast("Siswa berhasil diaktifkan kembali", "success");
    } catch {
      showToast("Gagal mengaktifkan siswa", "error");
    }
  }

  async function handleDeleteStudent(student: StudentItem) {
    try {
      await api.studentProfiles.delete(student.id);
      window.location.reload();
    } catch {
      showToast("Gagal menghapus siswa", "error");
    }
  }

  async function handleArchiveParent(parent: ParentProfile) {
    try {
      await api.parentProfiles.update(parent.id, { isActive: false });
      const studentIds = (parent.students ?? []).map((s) => s.id);
      if (studentIds.length > 0) {
        await Promise.all(studentIds.map((id) => api.studentProfiles.update(id, { isActive: false })));
        setStudentsFull((prev) => prev.map((s) => studentIds.includes(s.id) ? { ...s, isActive: false } : s));
      }
      setAllParents((prev) => prev.map((p) => p.id === parent.id ? { ...p, isActive: false } : p));
      showToast("Orang tua dan siswa berhasil diarsipkan", "success");
    } catch {
      showToast("Gagal mengarsipkan orang tua", "error");
    }
  }

  async function handleRestoreParent(parent: ParentProfile) {
    try {
      await api.parentProfiles.update(parent.id, { isActive: true });
      const studentIds = (parent.students ?? []).map((s) => s.id);
      if (studentIds.length > 0) {
        await Promise.all(studentIds.map((id) => api.studentProfiles.update(id, { isActive: true })));
        setStudentsFull((prev) => prev.map((s) => studentIds.includes(s.id) ? { ...s, isActive: true } : s));
      }
      setAllParents((prev) => prev.map((p) => p.id === parent.id ? { ...p, isActive: true } : p));
      showToast("Orang tua dan siswa berhasil diaktifkan kembali", "success");
    } catch {
      showToast("Gagal mengaktifkan orang tua", "error");
    }
  }

  async function handleDeleteParent(parent: ParentProfile) {
    try {
      await api.parentProfiles.delete(parent.id);
      window.location.reload();
    } catch {
      showToast("Gagal menghapus orang tua", "error");
    }
  }

  async function handleToggleClassActive(cls: Class) {
    try {
      const next = !cls.isActive;
      await api.classes.update(cls.id, { isActive: next });
      const updated = await api.classes.listByTutor("");
      setClasses(updated);
      showToast(next ? "Kelas berhasil diaktifkan" : "Kelas berhasil dinonaktifkan", "success");
    } catch {
      showToast("Gagal mengubah status kelas", "error");
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
  const [selectedStudentCertificates, setSelectedStudentCertificates] = useState<Certificate[]>([]);
  const [studentDetailLoading, setStudentDetailLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  const [allEnrollments, setAllEnrollments] = useState<Enrollment[]>([]);
  const [allEnrollmentsLoading, setAllEnrollmentsLoading] = useState(false);
  const [allParents, setAllParents] = useState<ParentProfile[]>([]);
  const [allParentsLoading, setAllParentsLoading] = useState(false);

  async function handleSelectStudent(student: StudentItem) {
    setStudentDetailLoading(true);
    try {
      const [profile, enrollments, certificates] = await Promise.all([
        api.studentProfiles.get(student.id),
        api.enrollments.listByStudent(student.id),
        api.certificates.listByStudent(student.id),
      ]);
      setSelectedStudent(profile);
      setSelectedStudentEnrollments(enrollments);
      setSelectedStudentCertificates(certificates);
    } catch {
      setSelectedStudent(null);
      setSelectedStudentEnrollments([]);
      setSelectedStudentCertificates([]);
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

  async function refreshStudentEnrollments() {
    if (!selectedStudent) return;
    setStudentDetailLoading(true);
    try {
      const enrollments = await api.enrollments.listByStudent(selectedStudent.id);
      const certificates = await api.certificates.listByStudent(selectedStudent.id);
      setSelectedStudentEnrollments(enrollments);
      setSelectedStudentCertificates(certificates);
    } catch {
      showToast("Gagal memuat ulang enrollment", "error");
    } finally {
      setStudentDetailLoading(false);
    }
  }

  async function fetchAllEnrollments() {
    setAllEnrollmentsLoading(true);
    try {
      const list = await api.enrollments.list();
      setAllEnrollments(list);
    } catch {
      showToast("Gagal memuat enrollment", "error");
    } finally {
      setAllEnrollmentsLoading(false);
    }
  }

  async function fetchAllParents() {
    setAllParentsLoading(true);
    try {
      const list = await api.parentProfiles.list("?showArchived=true");
      setAllParents(list);
    } catch {
      showToast("Gagal memuat data orang tua", "error");
    } finally {
      setAllParentsLoading(false);
    }
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
    createIsOnline, setCreateIsOnline, createLocation, setCreateLocation,
    createName, setCreateName,
    createCategory, setCreateCategory,
    createCurriculumId, setCreateCurriculumId,
    createTutorIds, setCreateTutorIds,
    createStartDate, setCreateStartDate,
    creating, createError,
    filteredCurriculums, selectedCurriculum, createBatchPreview,
    tutorSlots, tutorDayoffs, slotsLoading, selectedSlots, setSelectedSlots,
    SLOT_DAYS, SLOT_DAY_LABELS, SLOT_HOURS, fmt, isInRange,
    classGlobalFilter, setClassGlobalFilter, classTable,
    reqGlobalFilter, setReqGlobalFilter, reqTable,
    detailClass, setDetailClass,
    detailClassName, setDetailClassName,
    detailTutorIds, setDetailTutorIds,
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
    selectedStudentCertificates, setSelectedStudentCertificates,
    studentDetailLoading, refreshStudentEnrollments,
    studentsFull,
    studentSegment, setStudentSegment,
    categories,
    handleRegisterStudent, handleCreateParent,
    handleArchiveStudent, handleRestoreStudent, handleDeleteStudent,
    handleArchiveParent, handleRestoreParent, handleDeleteParent,
    handleToggleClassActive,
    allEnrollments, allEnrollmentsLoading, fetchAllEnrollments,
    allParents, allParentsLoading, fetchAllParents,
    createSelectedStudentIds, setCreateSelectedStudentIds,
    createAvailableStudents, getSlotsConflictReason,
    curriculumEnrolledStudentIds,
  };
}
