import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "neutral" | "primary" | "accent" | "success" | "warning" | "danger" | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
  primary: "bg-primary-50 text-primary-700 ring-primary-200 dark:bg-primary-950 dark:text-primary-200 dark:ring-primary-800",
  accent: "bg-accent-100 text-accent-800 ring-accent-200 dark:bg-accent-900/40 dark:text-accent-200 dark:ring-accent-800",
  success: "bg-green-50 text-green-700 ring-green-200 dark:bg-green-950/50 dark:text-green-300 dark:ring-green-900",
  warning: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-900",
  danger: "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/50 dark:text-red-300 dark:ring-red-900",
  info: "bg-sky-50 text-sky-700 ring-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:ring-sky-900",
};

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  /** Titik status di kiri teks. */
  dot?: boolean;
};

export function Badge({ tone = "neutral", dot = false, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
      {...props}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden />}
      {children}
    </span>
  );
}
