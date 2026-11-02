import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type EmptyStateProps = {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** compact: untuk di dalam kartu/tabel; default: blok mandiri bergaris putus-putus. */
  variant?: "default" | "compact";
};

/**
 * Pengganti emoji (📭, 📅) yang tampil berbeda di tiap OS.
 * Ikon lucide konsisten di web, Android (Capacitor), dan iOS.
 */
export function EmptyState({ icon: Icon, title, description, action, className, variant = "default" }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center",
        variant === "default"
          ? "rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-12 dark:border-slate-700 dark:bg-slate-900/40"
          : "px-4 py-8",
        className,
      )}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-600 ring-8 ring-primary-50/50 dark:bg-primary-950 dark:text-primary-300 dark:ring-primary-950/40">
        <Icon size={26} strokeWidth={1.75} />
      </div>
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
