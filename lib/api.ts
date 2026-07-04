const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

type ApiSuccess<T> = {
  success: true;
  data: T;
};

type ApiError = {
  success?: false;
  message?: string;
  code?: string;
};

export type AuthUser = {
  id: string;
  email: string;
  role: "ADMIN" | "TUTOR" | "PARENT" | "STUDENT";
  createdAt: string;
  updatedAt: string;
  parentProfile?: {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
  } | null;
  tutorProfile?: {
    id: string;
    userId: string;
    fullName: string;
    phone: string;
    bio?: string | null;
    avatarUrl?: string | null;
  } | null;
  studentProfile?: {
    id: string;
    userId: string;
    parentId: string;
    fullName: string;
    nickname: string;
    birthDate: string;
    avatarUrl?: string | null;
    category: "JUNIOR_I" | "JUNIOR_II" | "JUNIOR_III";
    totalXp: number;
    currentStreak: number;
    lastActive?: string | null;
  } | null;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: "Bearer";
  user: AuthUser;
};

export type ParentProfile = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
};

export type StudentProfile = {
  id: string;
  userId: string;
  parentId: string;
  fullName: string;
  nickname: string;
  birthDate: string;
  avatarUrl?: string | null;
  category: "JUNIOR_I" | "JUNIOR_II" | "JUNIOR_III";
  totalXp: number;
  currentStreak: number;
  lastActive?: string | null;
  enrollments?: Enrollment[];
  user?: { id: string; email: string };
  parent?: { id: string; fullName: string; phone?: string };
};

export type Enrollment = {
  id: string;
  studentId: string;
  classId: string | null;
  curriculumId: string;
  joinedAt: string;
  totalMeetPurchased: number;
  totalMeetLeft: number;
  class: Class | null;
  curriculum?: Curriculum;
  student?: StudentProfile;
};



export type Class = {
  id: string;
  name: string;
  type: "BATCH" | "PRIVATE" | "MAKEUP";
  category: string;
  tutorId: string;
  curriculumId?: string | null;
  batch: number;
  startDate: string;
  isActive: boolean;
  schedules?: Schedule[];
  tutor?: TutorProfile;
  enrollments?: { id: string; studentId: string; classId: string; totalMeetPurchased?: number | null; totalMeetLeft?: number | null }[];
  curriculum?: Curriculum | null;
};

export type Schedule = {
  id: string;
  classId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  meetLink: string;
  topic?: string | null;
  topicId?: string | null;
  topicRef?: Topic | null;
  date: string;
  isDone?: boolean;
};

export type Attendance = {
  id: string;
  scheduleId: string;
  studentId: string;
  date: string;
  status: "PRESENT" | "ABSENT" | "LATE" | "SICK" | "PERMISSION";
  notes?: string | null;
  assessment?: AttendanceAssessment | null;
  student?: StudentProfile | null;
};

export type TutorProfile = {
  id: string;
  userId: string;
  fullName: string;
  phone: string;
  bio?: string | null;
  avatarUrl?: string | null;
  user?: { id: string; email: string };
};

export type Curriculum = {
  id: string;
  category: string;
  name: string;
  topics: Topic[];
  assessmentSetId?: string | null;
  assessmentSet?: AssessmentSet | null;
};

export type Topic = {
  id: string;
  curriculumId?: string | null;
  title: string;
  materialLink?: string | null;
  exampleProjectLink?: string | null;
  goals?: string | null;
  tools?: string | null;
  order: number;
  schedules?: Schedule[];
};

export type Announcement = {
  id: string;
  classId: string;
  tutorId: string;
  title: string;
  content: string;
  createdAt: string;
  class?: Class;
  tutor?: TutorProfile;
};

export type Badge = {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  xpBonus: number;
};

export type StudentBadge = {
  id: string;
  studentId: string;
  badgeId: string;
  earnedAt: string;
  badge: Badge;
};

export type TutorSlot = {
  id: string;
  tutorId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  isDayoff: boolean;
  isFilled: boolean;
};

export type RequestClass = {
  id: string;
  studentId: string;
  parentId: string;
  prevClassId: string | null;
  category: string;
  curriculum: string;
  days: string;
  startTime: string;
  endTime: string;
  sessionCount: number;
  preferredTutorId: string | null;
  notes: string | null;
  status: string;
  adminNotes: string | null;
  approvedClassId: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; fullName: string; nickname: string; user?: { email: string } };
  parent?: { id: string; fullName: string };
  prevClass?: { id: string; name: string };
  preferredTutor?: { id: string; fullName: string };
  approvedClass?: { id: string; name: string };
};

export type AssessmentSet = {
  id: string;
  name: string;
  description?: string | null;
  aspects?: AssessmentAspect[];
  createdAt: string;
  updatedAt: string;
};

export type AssessmentAspect = {
  id: string;
  assessmentSetId: string;
  title: string;
  description?: string | null;
  minScore: number;
  maxScore: number;
  order: number;
  createdAt: string;
  updatedAt: string;
};

export type AttendanceAssessmentScore = {
  id: string;
  assessmentId: string;
  aspectId: string;
  score: number;
  notes?: string | null;
  createdAt: string;
  aspect?: AssessmentAspect;
};

export type AttendanceAssessment = {
  id: string;
  attendanceId: string;
  totalScore?: number | null;
  percentage?: number | null;
  mentorComment?: string | null;
  scores?: AttendanceAssessmentScore[];
  attendance?: Attendance;
  createdAt: string;
  updatedAt: string;
};

const storageKeys = {
  accessToken: "lms.accessToken",
  refreshToken: "lms.refreshToken",
  user: "lms.user",
  rememberMe: "lms.rememberMe",
} as const;

function readFromStorage(storage: Storage) {
  const accessToken = storage.getItem(storageKeys.accessToken);
  const refreshToken = storage.getItem(storageKeys.refreshToken);
  const userRaw = storage.getItem(storageKeys.user);

  if (!accessToken || !refreshToken || !userRaw) return null;

  try {
    const user = JSON.parse(userRaw) as AuthUser;
    return { accessToken, refreshToken, user };
  } catch {
    return null;
  }
}

export function getStoredSession() {
  if (typeof window === "undefined") return null;

  return (
    readFromStorage(window.localStorage) ??
    readFromStorage(window.sessionStorage)
  );
}

export function saveSession(session: AuthSession) {
  if (typeof window === "undefined") return;

  const rememberMe = window.localStorage.getItem(storageKeys.rememberMe) !== "false";
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem(storageKeys.accessToken, session.accessToken);
  storage.setItem(storageKeys.refreshToken, session.refreshToken);
  storage.setItem(storageKeys.user, JSON.stringify(session.user));
}

export function clearSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(storageKeys.accessToken);
  window.localStorage.removeItem(storageKeys.refreshToken);
  window.localStorage.removeItem(storageKeys.user);
  window.sessionStorage.removeItem(storageKeys.accessToken);
  window.sessionStorage.removeItem(storageKeys.refreshToken);
  window.sessionStorage.removeItem(storageKeys.user);
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const payload = (await response.json()) as ApiSuccess<T> | ApiError;

  if (!response.ok) {
    const errorPayload = payload as ApiError;
    throw new Error(errorPayload.message ?? "Request failed");
  }

  return (payload as ApiSuccess<T>).data;
}

async function refreshAccessToken() {
  if (typeof window === "undefined") {
    throw new Error("Refresh only available in browser");
  }

  const refreshToken =
    window.localStorage.getItem(storageKeys.refreshToken) ??
    window.sessionStorage.getItem(storageKeys.refreshToken);
  if (!refreshToken) {
    throw new Error("Refresh token not found");
  }

  const session = await request<AuthSession>(
    "/api/v1/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    },
  );

  saveSession(session);
  return session.accessToken;
}

async function authenticatedRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const session = getStoredSession();

  if (!session) {
    throw new Error("Silakan login dulu");
  }

  try {
    return await request<T>(path, options, session.accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Request failed";

    if (message.toLowerCase().includes("token") || message.toLowerCase().includes("unauthorized")) {
      const nextAccessToken = await refreshAccessToken();
      return request<T>(path, options, nextAccessToken);
    }

    throw error;
  }
}

export const api = {
  auth: {
    async registerParent(payload: {
      email: string;
      password: string;
      fullName: string;
      phone: string;
    }) {
      return request<AuthSession>("/api/v1/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async registerTutor(payload: {
      email: string;
      password: string;
      fullName: string;
      phone: string;
      bio?: string | null;
      meetLink?: string | null;
    }) {
      return authenticatedRequest<AuthSession>("/api/v1/auth/register/tutor", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async login(payload: { email: string; password: string }) {
      return request<AuthSession>("/api/v1/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async me() {
      return authenticatedRequest<AuthUser>("/api/v1/auth/me");
    },
    async impersonate(userId: string) {
      return authenticatedRequest<AuthSession>("/api/v1/auth/impersonate", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
    },
    async logout(refreshToken?: string) {
      const token = refreshToken ?? getStoredSession()?.refreshToken;

      if (!token) {
        return;
      }

      await request<{ success: boolean }>("/api/v1/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refreshToken: token }),
      });
      clearSession();
    },
  },
  tutorProfiles: {
    async list() {
      return authenticatedRequest<TutorProfile[]>("/api/v1/tutor-profiles");
    },
  },
  parentProfiles: {
    async list() {
      return authenticatedRequest<ParentProfile[]>("/api/v1/parent-profiles");
    },
  },
  studentProfiles: {
    async list() {
      return authenticatedRequest<StudentProfile[]>("/api/v1/student-profiles");
    },
    async get(id: string) {
      return authenticatedRequest<StudentProfile>(`/api/v1/student-profiles/${id}`);
    },
    async create(payload: {
      parentId: string;
      email: string;
      password: string;
      fullName: string;
      phone: string;
      nickname: string;
      birthDate: string;
      avatarUrl?: string | null;
      category: "JUNIOR_I" | "JUNIOR_II" | "JUNIOR_III";
    }) {
      return authenticatedRequest<StudentProfile>("/api/v1/auth/register/student", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
  enrollments: {
    async list() {
      return authenticatedRequest<Enrollment[]>("/api/v1/academic/enrollments");
    },
    async listByStudent(studentId: string) {
      return authenticatedRequest<Enrollment[]>(`/api/v1/academic/enrollments/student/${studentId}`);
    },
    async listByClass(classId: string) {
      const all = await this.list();
      return all.filter((e) => e.classId === classId);
    },
    async listUnassignedByCurriculum(curriculumId: string) {
      return authenticatedRequest<Enrollment[]>(`/api/v1/academic/enrollments/unassigned/${curriculumId}`);
    },
    async create(payload: { studentId: string; classId?: string; curriculumId: string; totalMeetPurchased?: number }) {
      return authenticatedRequest<Enrollment>("/api/v1/academic/enrollments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: Record<string, unknown>) {
      return authenticatedRequest<Enrollment>(`/api/v1/academic/enrollments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return authenticatedRequest<void>(`/api/v1/academic/enrollments/${id}`, {
        method: "DELETE",
      });
    },
  },
  attendances: {
    async list() {
      return authenticatedRequest<Attendance[]>("/api/v1/academic/attendances");
    },
    async listByStudent(studentId: string) {
      const all = await this.list();
      return all.filter((a) => a.studentId === studentId);
    },
    async listBySchedule(scheduleId: string) {
      const all = await this.list();
      return all.filter((a) => a.scheduleId === scheduleId);
    },
    async create(payload: { scheduleId: string; studentId: string; date: string; status?: string; notes?: string | null }) {
      return authenticatedRequest<Attendance>("/api/v1/academic/attendances", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: Partial<{ status: string; notes: string | null }>) {
      return authenticatedRequest<Attendance>(`/api/v1/academic/attendances/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
  },
  classes: {
    async list() {
      return authenticatedRequest<Class[]>("/api/v1/academic/classes");
    },
    async get(id: string) {
      return authenticatedRequest<Class>(`/api/v1/academic/classes/${id}`);
    },
    async listByTutor(tutorId: string) {
      return authenticatedRequest<Class[]>(`/api/v1/academic/classes?tutorId=${tutorId}`);
    },
    async create(payload: { name: string; type?: "BATCH" | "PRIVATE" | "MAKEUP"; category: string; tutorId: string; curriculumId?: string | null; startDate: string }) {
      return authenticatedRequest<Class>("/api/v1/academic/classes", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: { name?: string; tutorId?: string; isActive?: boolean; type?: "BATCH" | "PRIVATE" | "MAKEUP" }) {
      return authenticatedRequest<Class>(`/api/v1/academic/classes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
  },
  schedules: {
    async list() {
      return authenticatedRequest<Schedule[]>("/api/v1/academic/schedules");
    },
    async get(id: string) {
      return authenticatedRequest<Schedule>(`/api/v1/academic/schedules/${id}`);
    },
    async listByClass(classId: string) {
      return authenticatedRequest<Schedule[]>(`/api/v1/academic/schedules?classId=${classId}`);
    },
    async create(payload: { classId: string; dayOfWeek: string; startTime: string; endTime: string; meetLink: string; date: string; topic?: string | null }) {
      return authenticatedRequest<Schedule>("/api/v1/academic/schedules", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: Partial<{ topic: string; meetLink: string; date: string; isDone: boolean }>) {
      return authenticatedRequest<Schedule>(`/api/v1/academic/schedules/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
  },
  announcements: {
    async listByClass(classId: string) {
      return authenticatedRequest<Announcement[]>(`/api/v1/academic/announcements?classId=${classId}`);
    },
    async create(payload: { classId: string; tutorId: string; title: string; content: string }) {
      return authenticatedRequest<Announcement>("/api/v1/academic/announcements", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
  },
  curriculums: {
    async list() {
      return authenticatedRequest<Curriculum[]>("/api/v1/academic/curriculums");
    },
    async get(id: string) {
      return authenticatedRequest<Curriculum>(`/api/v1/academic/curriculums/${id}`);
    },
    async listByCategory(category: string) {
      return authenticatedRequest<Curriculum[]>(`/api/v1/academic/curriculums?category=${category}`);
    },
    async create(payload: { category: string; name: string; assessmentSetId?: string | null }) {
      return authenticatedRequest<Curriculum>("/api/v1/academic/curriculums", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: Partial<{ name: string; assessmentSetId: string | null }>) {
      return authenticatedRequest<Curriculum>(`/api/v1/academic/curriculums/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return authenticatedRequest<void>(`/api/v1/academic/curriculums/${id}`, {
        method: "DELETE",
      });
    },
  },
  topics: {
    async listByCurriculum(curriculumId: string) {
      return authenticatedRequest<Topic[]>(`/api/v1/academic/topics?curriculumId=${curriculumId}`);
    },
    async create(payload: {
      curriculumId?: string | null;
      title: string;
      materialLink?: string | null;
      exampleProjectLink?: string | null;
      goals?: string | null;
      tools?: string | null;
      order?: number;
    }) {
      return authenticatedRequest<Topic>("/api/v1/academic/topics", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: Partial<{
      title: string;
      materialLink: string | null;
      exampleProjectLink: string | null;
      goals: string | null;
      tools: string | null;
      order: number;
    }>) {
      return authenticatedRequest<Topic>(`/api/v1/academic/topics/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return authenticatedRequest<void>(`/api/v1/academic/topics/${id}`, {
        method: "DELETE",
      });
    },
  },
  tutorSlots: {
    async list(tutorId: string) {
      return authenticatedRequest<{ slots: TutorSlot[]; dayoffs: number[] }>(`/api/v1/academic/tutor-slots/${tutorId}`);
    },
    async toggle(tutorId: string, dayOfWeek: string, startTime: string) {
      return authenticatedRequest<void>(`/api/v1/academic/tutor-slots/${tutorId}/toggle`, {
        method: "PATCH",
        body: JSON.stringify({ dayOfWeek, startTime }),
      });
    },
    async updateDayoffs(tutorId: string, dayoff1: number | null, dayoff2: number | null) {
      return authenticatedRequest<void>(`/api/v1/academic/tutor-slots/${tutorId}/dayoffs`, {
        method: "PATCH",
        body: JSON.stringify({ dayoff1, dayoff2 }),
      });
    },
  },
  requestClass: {
    async list(params?: { status?: string; parentId?: string }) {
      const qs = params ? "?" + new URLSearchParams(params as Record<string, string>).toString() : "";
      return authenticatedRequest<RequestClass[]>(`/api/v1/request-class${qs}`);
    },
    async get(id: string) {
      return authenticatedRequest<RequestClass>(`/api/v1/request-class/${id}`);
    },
    async update(id: string, payload: Partial<{
      status: string;
      adminNotes: string | null;
      approvedClassId: string | null;
      reviewedBy: string;
      reviewedAt: string;
    }>) {
      return authenticatedRequest<RequestClass>(`/api/v1/request-class/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
  },
  badges: {
    async list() {
      return authenticatedRequest<Badge[]>("/api/v1/gamification/badges");
    },
  },
  studentBadges: {
    async listByStudent(studentId: string) {
      return authenticatedRequest<StudentBadge[]>(`/api/v1/gamification/student-badges?studentId=${studentId}`);
    },
  },
  assessmentSets: {
    async list() {
      return authenticatedRequest<AssessmentSet[]>("/api/v1/academic/assessment-sets");
    },
    async get(id: string) {
      return authenticatedRequest<AssessmentSet>(`/api/v1/academic/assessment-sets/${id}`);
    },
    async create(payload: { name: string; description?: string | null }) {
      return authenticatedRequest<AssessmentSet>("/api/v1/academic/assessment-sets", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: Partial<{ name: string; description: string | null }>) {
      return authenticatedRequest<AssessmentSet>(`/api/v1/academic/assessment-sets/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return authenticatedRequest<void>(`/api/v1/academic/assessment-sets/${id}`, {
        method: "DELETE",
      });
    },
  },
  assessmentAspects: {
    async listBySet(assessmentSetId: string) {
      return authenticatedRequest<AssessmentAspect[]>(`/api/v1/academic/assessment-aspects?assessmentSetId=${assessmentSetId}`);
    },
    async create(payload: {
      assessmentSetId: string;
      title: string;
      description?: string | null;
      minScore?: number;
      maxScore?: number;
      order?: number;
    }) {
      return authenticatedRequest<AssessmentAspect>("/api/v1/academic/assessment-aspects", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: Partial<{
      title: string;
      description: string | null;
      minScore: number;
      maxScore: number;
      order: number;
    }>) {
      return authenticatedRequest<AssessmentAspect>(`/api/v1/academic/assessment-aspects/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return authenticatedRequest<void>(`/api/v1/academic/assessment-aspects/${id}`, {
        method: "DELETE",
      });
    },
  },
  attendanceAssessments: {
    async list() {
      return authenticatedRequest<AttendanceAssessment[]>("/api/v1/academic/attendance-assessments");
    },
    async get(id: string) {
      return authenticatedRequest<AttendanceAssessment>(`/api/v1/academic/attendance-assessments/${id}`);
    },
    async create(payload: {
      attendanceId: string;
      totalScore?: number | null;
      percentage?: number | null;
      mentorComment?: string | null;
    }) {
      return authenticatedRequest<AttendanceAssessment>("/api/v1/academic/attendance-assessments", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: Partial<{
      totalScore: number | null;
      percentage: number | null;
      mentorComment: string | null;
    }>) {
      return authenticatedRequest<AttendanceAssessment>(`/api/v1/academic/attendance-assessments/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return authenticatedRequest<void>(`/api/v1/academic/attendance-assessments/${id}`, {
        method: "DELETE",
      });
    },
  },
  attendanceAssessmentScores: {
    async listByAssessment(assessmentId: string) {
      return authenticatedRequest<AttendanceAssessmentScore[]>(`/api/v1/academic/attendance-assessment-scores?assessmentId=${assessmentId}`);
    },
    async create(payload: {
      assessmentId: string;
      aspectId: string;
      score: number;
      notes?: string | null;
    }) {
      return authenticatedRequest<AttendanceAssessmentScore>("/api/v1/academic/attendance-assessment-scores", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async update(id: string, payload: { score?: number; notes?: string | null }) {
      return authenticatedRequest<AttendanceAssessmentScore>(`/api/v1/academic/attendance-assessment-scores/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return authenticatedRequest<void>(`/api/v1/academic/attendance-assessment-scores/${id}`, {
        method: "DELETE",
      });
    },
  },
  reports: {
    async getDoneSchedulesByClass(classId: string) {
      return authenticatedRequest(`/api/v1/academic/reports/class/${classId}/done-schedules`);
    },
    async getScheduleReport(scheduleId: string) {
      return authenticatedRequest(`/api/v1/academic/reports/schedule/${scheduleId}`);
    },
    async getStudentReportSummary(studentId: string, attendanceIds: string[]) {
      const ids = attendanceIds.join(",");
      return authenticatedRequest<{ success: boolean; data: any }>(`/api/v1/academic/reports/student/${studentId}/report-summary?attendanceIds=${ids}`);
    },
  },
  savedReports: {
    async list() {
      return authenticatedRequest<any[]>("/api/v1/academic/saved-reports");
    },
    async create(payload: { studentId: string; title: string; data: any }) {
      return authenticatedRequest<{ id: string; createdAt: string }>("/api/v1/academic/saved-reports", {
        method: "POST",
        body: JSON.stringify(payload),
      });
    },
    async delete(id: string) {
      return authenticatedRequest<{ success: boolean }>(`/api/v1/academic/saved-reports/${id}`, {
        method: "DELETE",
      });
    },
  },
};
