"use client";

import { CheckCircle, AlertCircle, XCircle } from "lucide-react";
import type { Theme } from "./types";

export function Card({ children, className = "", theme }: { children: React.ReactNode; className?: string; theme: Theme }) {
  return (
    <div className={`rounded-3xl border ${theme.border} ${theme.card} shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export const CATEGORY_LABELS: Record<string, string> = {
  JUNIOR_I: "Kelas 4-6 SD",
  JUNIOR_II: "Kelas 7-9 SMP",
  JUNIOR_III: "Kelas 10-12 SMA",
};

export const ATTENDANCE_LABELS: Record<string, { label: string; color: string; icon: typeof CheckCircle }> = {
  PRESENT: { label: "Hadir", color: "text-emerald-600 bg-emerald-100", icon: CheckCircle },
  LATE: { label: "Terlambat", color: "text-amber-600 bg-amber-100", icon: AlertCircle },
  ABSENT: { label: "Tidak Hadir", color: "text-red-600 bg-red-100", icon: XCircle },
  SICK: { label: "Sakit", color: "text-blue-600 bg-blue-100", icon: AlertCircle },
  PERMISSION: { label: "Izin", color: "text-purple-600 bg-purple-100", icon: AlertCircle },
};
