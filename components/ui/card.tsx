import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement> & {
  /** Tambah padding standar (p-5 sm:p-6). Matikan untuk tabel full-bleed. */
  padded?: boolean;
};

export function Card({ className, padded = false, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900",
        padded && "p-5 sm:p-6",
        className,
      )}
      {...props}
    />
  );
}

type CardHeaderProps = {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
};

export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6 dark:border-slate-800",
        className,
      )}
    >
      <div className="min-w-0">
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        {description && <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
