import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type AlertTone = "error" | "success" | "warning" | "info";

const tones: Record<AlertTone, { box: string; icon: typeof Info }> = {
  error: { box: "bg-red-50 text-red-800 ring-red-200 dark:bg-red-950/40 dark:text-red-200 dark:ring-red-900", icon: AlertCircle },
  success: { box: "bg-green-50 text-green-800 ring-green-200 dark:bg-green-950/40 dark:text-green-200 dark:ring-green-900", icon: CheckCircle2 },
  warning: { box: "bg-amber-50 text-amber-800 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-200 dark:ring-amber-900", icon: TriangleAlert },
  info: { box: "bg-primary-50 text-primary-800 ring-primary-200 dark:bg-primary-950/50 dark:text-primary-200 dark:ring-primary-900", icon: Info },
};

/** Pesan inline (error form, info, sukses) dengan ikon & warna seragam. */
export function Alert({ tone = "error", children, className }: { tone?: AlertTone; children: ReactNode; className?: string }) {
  const { box, icon: Icon } = tones[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex items-start gap-2.5 rounded-xl p-3 text-sm ring-1 ring-inset", box, className)}>
      <Icon size={18} className="mt-px shrink-0" aria-hidden />
      <div className="min-w-0 flex-1 font-medium">{children}</div>
    </div>
  );
}
