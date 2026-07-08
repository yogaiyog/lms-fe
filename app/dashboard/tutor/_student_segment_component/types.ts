import type { Attendance, AttendanceAssessmentScore } from "@/lib/api";

export type Theme = {
  dark: boolean;
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
};

export type ClassWithEnrollments = {
  id: string;
  name: string;
  category: string;
  curriculum?: { id: string; name: string } | null;
  enrollments?: { id: string; studentId: string; totalMeetPurchased?: number | null; totalMeetLeft?: number | null }[];
};

export type ClassStat = { name: string; present: number; total: number; percentage: number };

export type AssessmentSummary = {
  date: string;
  percentage: number;
  comment: string;
  scores: AttendanceAssessmentScore[];
  assessmentId?: string;
};

export type AttendanceWithDetails = Attendance & {
  schedule?: {
    id: string;
    date: string;
    startTime: string;
    endTime: string;
    topic?: string | null;
    class?: { id: string; name: string } | null;
  } | null;
  assessment?: {
    id: string;
    percentage?: number | null;
    mentorComment?: string | null;
    totalScore?: number | null;
    scores?: AttendanceAssessmentScore[];
  } | null;
};

export type AspectSummary = {
  aspectTitle: string;
  aspectDescription: string | null;
  avgScore: number;
  avgMaxScore: number;
  avgPercentage: number;
  count: number;
  narrative: string;
};

export type AssessmentScore = {
  aspectTitle: string;
  aspectDescription: string | null;
  avgScore: number;
  avgMaxScore: number;
  avgPercentage: number;
  count: number;
};

export type ReportNote = {
  comment: string;
  date: string;
  tutorName: string;
};

export type ReportProjectLink = {
  url: string;
  date: string;
};

export type GeneratedReport = {
  student: { id: string; fullName: string; nickname: string };
  generatedAt: string;
  selectedCount: number;
  totalScore: number;
  maxScore: number;
  scorePercentage: number;
  statusCounts: { PRESENT: number; LATE: number; ABSENT: number; SICK: number; PERMISSION: number };
  topics: string[];
  topStrengths: AspectSummary[];
  topWeakness: AspectSummary | null;
  assessmentScores: AssessmentScore[];
  notes: ReportNote[];
  projectLinks: ReportProjectLink[];
};
