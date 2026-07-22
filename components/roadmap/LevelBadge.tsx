"use client";

type Level = {
  id: string;
  label: string;
  type: "SCRATCH" | "QUIZ";
  status: string;
};

type Props = {
  level: Level;
  onClick?: () => void;
};

const STATUS_STYLES: Record<string, string> = {
  available: "bg-white border-slate-800 text-slate-800",
  completed:
    "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30",
  locked: "bg-white border-slate-300 text-slate-300",
  in_progress:
    "bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/30",
};

export function LevelBadge({ level, onClick }: Props) {
  const isLocked = level.status === "locked";
  const style = STATUS_STYLES[level.status] || STATUS_STYLES.available;

  return (
    <div className="group relative flex items-center justify-center">
      <button
        type="button"
        disabled={isLocked}
        onClick={() => !isLocked && onClick?.()}
        className={[
          "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold",
          "transition-transform duration-150",
          isLocked
            ? "cursor-not-allowed"
            : "cursor-pointer hover:scale-110 hover:z-10",
          style,
        ].join(" ")}
      >
        <span>
          {level.status === "completed" ? (
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          ) : (
            level.label
          )}
        </span>
      </button>

      <div
        className={[
          "pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2",
          "whitespace-nowrap rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white shadow-lg",
          "opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100",
        ].join(" ")}
      >
        <span>Project {level.label}</span>
        <div className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-slate-900" />
      </div>
    </div>
  );
}
