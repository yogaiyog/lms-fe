import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Spinner } from "./spinner";

export type ButtonVariant = "primary" | "accent" | "secondary" | "subtle" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary-600 text-white shadow-sm shadow-primary-900/10 hover:bg-primary-700 active:bg-primary-800",
  accent: "bg-accent-300 text-primary-950 shadow-sm hover:bg-accent-400",
  secondary:
    "border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800",
  subtle:
    "bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-950/60 dark:text-primary-200 dark:hover:bg-primary-900/70",
  ghost:
    "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white",
  danger: "bg-red-600 text-white shadow-sm hover:bg-red-700",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-lg px-3 text-xs",
  md: "h-10 gap-2 rounded-xl px-4 text-sm",
  lg: "h-12 gap-2 rounded-xl px-5 text-base",
};

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** Ikon di kiri teks (mis. <Plus size={16} />). */
  icon?: ReactNode;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  disabled,
  children,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex shrink-0 items-center justify-center font-semibold transition-colors",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Spinner size={size === "sm" ? 12 : 16} /> : icon}
      {children}
    </button>
  );
}

export type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Wajib untuk aksesibilitas — dipakai sebagai aria-label & tooltip. */
  label: string;
  tone?: "default" | "danger";
};

/** Tombol ikon bulat (topbar, aksi tabel). */
export function IconButton({ label, tone = "default", className, type = "button", ...props }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-colors",
        tone === "danger"
          ? "text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/50"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white",
        className,
      )}
      {...props}
    />
  );
}
