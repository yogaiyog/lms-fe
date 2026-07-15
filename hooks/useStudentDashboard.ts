"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type Class, type Schedule, type Attendance, type Enrollment, type Announcement, type StudentBadge, type Certificate, type SavedReport, type Gallery } from "@/lib/api";

const POLLING_INTERVAL = 60 * 1000;

export function useStudentDashboard(studentId: string | undefined) {
  const enrollments = useQuery<Enrollment[]>({
    queryKey: ["student-enrollments", studentId],
    queryFn: () => api.enrollments.listByStudent(studentId!),
    enabled: !!studentId,
    refetchInterval: POLLING_INTERVAL,
  });

  const studentBadges = useQuery<StudentBadge[]>({
    queryKey: ["student-badges", studentId],
    queryFn: () => api.studentBadges.listByStudent(studentId!),
    enabled: !!studentId,
    refetchInterval: POLLING_INTERVAL,
  });

  const attendances = useQuery<Attendance[]>({
    queryKey: ["student-attendances", studentId],
    queryFn: () => api.attendances.listByStudent(studentId!),
    enabled: !!studentId,
    refetchInterval: POLLING_INTERVAL,
  });

  const certificates = useQuery<Certificate[]>({
    queryKey: ["student-certificates", studentId],
    queryFn: () => api.certificates.listByStudent(studentId!),
    enabled: !!studentId,
    refetchInterval: POLLING_INTERVAL,
  });

  const activeEnrollments = enrollments.data?.filter((e) => e.classId) ?? [];
  const totalMeetLeft = activeEnrollments.reduce((sum, e) => sum + (e.totalMeetLeft ?? 0), 0);

  const classIds = activeEnrollments.map((e) => e.classId!);

  const classes = useQuery<Class[]>({
    queryKey: ["student-classes", studentId, ...classIds],
    queryFn: async () => {
      const results = await Promise.all(
        classIds.map((id) => api.classes.get(id).catch(() => null))
      );
      return results.filter(Boolean) as Class[];
    },
    enabled: classIds.length > 0,
    refetchInterval: POLLING_INTERVAL,
  });

  const schedules = useQuery<Schedule[]>({
    queryKey: ["student-schedules", studentId, ...classIds],
    queryFn: async () => {
      const results = await Promise.all(
        classIds.map((id) => api.schedules.listByClass(id))
      );
      return results.flat();
    },
    enabled: classIds.length > 0,
    refetchInterval: POLLING_INTERVAL,
  });

  const announcements = useQuery<Announcement[]>({
    queryKey: ["student-announcements", studentId, ...classIds],
    queryFn: async () => {
      const results = await Promise.all(
        classIds.map((id) => api.announcements.listByClass(id))
      );
      return results.flat();
    },
    enabled: classIds.length > 0,
    refetchInterval: POLLING_INTERVAL,
  });

  const savedReports = useQuery<SavedReport[]>({
    queryKey: ["student-saved-reports", studentId],
    queryFn: () => api.savedReports.listByStudent(studentId!),
    enabled: !!studentId,
    refetchInterval: POLLING_INTERVAL,
  });

  const galleries = useQuery<Gallery[]>({
    queryKey: ["student-galleries", studentId],
    queryFn: () => api.galleries.listByStudent(studentId!),
    enabled: !!studentId,
    refetchInterval: POLLING_INTERVAL,
  });

  const isLoading =
    enrollments.isLoading ||
    studentBadges.isLoading ||
    attendances.isLoading ||
    certificates.isLoading ||
    classes.isLoading ||
    schedules.isLoading ||
    announcements.isLoading ||
    savedReports.isLoading ||
    galleries.isLoading;

  return {
    enrollments: enrollments.data ?? [],
    studentBadges: studentBadges.data ?? [],
    attendances: attendances.data ?? [],
    certificates: certificates.data ?? [],
    allClasses: classes.data ?? [],
    schedules: schedules.data ?? [],
    announcements: announcements.data ?? [],
    savedReports: savedReports.data ?? [],
    galleries: galleries.data ?? [],
    totalMeetLeft,
    isLoading,
    refetch: () => {
      enrollments.refetch();
      studentBadges.refetch();
      attendances.refetch();
      certificates.refetch();
      classes.refetch();
      schedules.refetch();
      announcements.refetch();
      savedReports.refetch();
      galleries.refetch();
    },
  };
}
