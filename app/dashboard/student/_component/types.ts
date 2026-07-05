import { Home, Calendar, Award, Route, FileText, Users } from "lucide-react";

export type Segment = "overview" | "schedule" | "roadmap" | "badges" | "reports" | "enrollment";

export interface Theme {
  dark: boolean;
  bg: string;
  card: string;
  border: string;
  text: string;
  textMuted: string;
}

export const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin", TUESDAY: "Selasa", WEDNESDAY: "Rabu",
  THURSDAY: "Kamis", FRIDAY: "Jumat", SATURDAY: "Sabtu", SUNDAY: "Minggu",
};

export const NAV_ITEMS: { key: Segment; label: string; icon: any }[] = [
  { key: "overview", label: "Ringkasan", icon: Home },
  { key: "schedule", label: "Jadwal", icon: Calendar },
  { key: "roadmap", label: "Roadmap", icon: Route },
  { key: "reports", label: "Laporan", icon: FileText },
  { key: "enrollment", label: "Kelas", icon: Users },
  { key: "badges", label: "Badges", icon: Award },
];

export const MOBILE_NAV: Segment[] = ["overview", "schedule", "roadmap", "reports", "badges"];
