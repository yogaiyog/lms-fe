"use client";

import { cn } from "@/lib/cn";

type SegmentedItem<K extends string> = { key: K; label: string; count?: number };

type SegmentedProps<K extends string> = {
  items: SegmentedItem<K>[];
  value: K;
  onChange: (key: K) => void;
  className?: string;
  ariaLabel?: string;
};

/** Pilihan tab kecil (mis. Aktif / Nonaktif) dengan gaya seragam. */
export function Segmented<K extends string>({ items, value, onChange, className, ariaLabel }: SegmentedProps<K>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn("inline-flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800", className)}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
              active
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-900 dark:text-white"
                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  active ? "bg-primary-50 text-primary-700 dark:bg-primary-950 dark:text-primary-200" : "bg-slate-200/70 dark:bg-slate-700",
                )}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
