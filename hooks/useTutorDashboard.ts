"use client";

import { useQuery } from "@tanstack/react-query";
import { api, type Class, type Schedule, type Announcement, type StudentProfile } from "@/lib/api";

const POLLING_INTERVAL = 60 * 1000;

export type ClassWithDetails = Class & {
  schedules: Schedule[];
  announcements: Announcement[];
};

export function useTutorDashboard(tutorProfileId: string | undefined) {
  const classesQuery = useQuery<Class[]>({
    queryKey: ["tutor-classes", tutorProfileId],
    queryFn: () => api.classes.listByTutor(tutorProfileId!),
    enabled: !!tutorProfileId,
    refetchInterval: POLLING_INTERVAL,
  });

  const studentsQuery = useQuery<StudentProfile[]>({
    queryKey: ["tutor-students"],
    queryFn: () => api.studentProfiles.list(),
    enabled: !!tutorProfileId,
    refetchInterval: POLLING_INTERVAL,
  });

  const classIds = classesQuery.data?.map((c) => c.id) ?? [];

  const schedulesQueries = useQuery<Schedule[][]>({
    queryKey: ["tutor-schedules", tutorProfileId, ...classIds],
    queryFn: async () => {
      const results = await Promise.all(
        classIds.map((id) => api.schedules.listByClass(id))
      );
      return results;
    },
    enabled: classIds.length > 0,
    refetchInterval: POLLING_INTERVAL,
  });

  const announcementsQueries = useQuery<Announcement[][]>({
    queryKey: ["tutor-announcements", tutorProfileId, ...classIds],
    queryFn: async () => {
      const results = await Promise.all(
        classIds.map((id) => api.announcements.listByClass(id))
      );
      return results;
    },
    enabled: classIds.length > 0,
    refetchInterval: POLLING_INTERVAL,
  });

  const classes: ClassWithDetails[] = (classesQuery.data ?? []).map((cls, idx) => ({
    ...cls,
    schedules: schedulesQueries.data?.[idx] ?? [],
    announcements: announcementsQueries.data?.[idx] ?? [],
  }));

  const isLoading =
    classesQuery.isLoading ||
    studentsQuery.isLoading ||
    schedulesQueries.isLoading ||
    announcementsQueries.isLoading;

  return {
    classes,
    students: studentsQuery.data ?? [],
    isLoading,
    refetch: () => {
      classesQuery.refetch();
      studentsQuery.refetch();
      schedulesQueries.refetch();
      announcementsQueries.refetch();
    },
  };
}
