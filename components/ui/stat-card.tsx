import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "primary" | "accent" | "success" | "danger";

const iconTones: Record<Tone, string> = {
  primary: "bg-primary-50 text-primary-600 dark:bg-primary-950 dark:text-primary-300",
  accent: "bg-accent-100 text-accent-700 dark:bg-accent-900/40 dark:text-accent-300",
  success: "bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-300",
  danger: "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-300",
};

type StatCardProps = {
  label: ReactNode;
  value: ReactNode;
  icon: LucideIcon;
  tone?: Tone;
  hint?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, icon: Icon, tone = "primary", hint, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", iconTones[tone])}>
        <Icon size={20} />
      </div>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
        <p className="text-xl font-bold tabular-nums text-slate-900 dark:text-white">{value}</p>
        {hint && <p className="truncate text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      </div>
    </div>
  );
}
