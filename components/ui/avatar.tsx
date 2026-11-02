import { cn } from "@/lib/cn";

function initials(name?: string | null) {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

type AvatarProps = {
  name?: string | null;
  src?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-primary-500 to-primary-800 font-bold text-white",
        sizes[size],
        className,
      )}
    >
      {src ? <img src={src} alt={name ?? ""} className="h-full w-full object-cover" /> : initials(name)}
    </span>
  );
}
