import { cn } from "@/lib/cn";

export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <span
      role="status"
      aria-label="Memuat"
      className={cn("inline-block animate-spin rounded-full border-2 border-current border-t-transparent", className)}
      style={{ width: size, height: size }}
    />
  );
}

/** Loader layar penuh dengan logo — dipakai saat dashboard pertama kali memuat data. */
export function PageLoader({ label = "Memuat dashboard…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-950">
      <img src="/logo.png" alt="" className="h-14 w-auto animate-pulse" />
      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        <Spinner size={14} className="text-primary-600" />
        {label}
      </div>
    </div>
  );
}
