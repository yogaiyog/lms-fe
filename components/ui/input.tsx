import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const control =
  "w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm transition-colors " +
  "placeholder:text-slate-400 focus:border-primary-500 focus:outline-none focus:ring-4 focus:ring-primary-500/15 " +
  "disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 " +
  "dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500";

const invalidControl = "border-red-400 focus:border-red-500 focus:ring-red-500/15";

type InvalidProp = { invalid?: boolean };

export function Input({ className, invalid, ...props }: InputHTMLAttributes<HTMLInputElement> & InvalidProp) {
  return <input className={cn(control, "h-10", invalid && invalidControl, className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Select({ className, invalid, ...props }: SelectHTMLAttributes<HTMLSelectElement> & InvalidProp) {
  return <select className={cn(control, "h-10 pr-8", invalid && invalidControl, className)} aria-invalid={invalid || undefined} {...props} />;
}

export function Textarea({ className, invalid, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & InvalidProp) {
  return (
    <textarea
      className={cn(control, "min-h-24 py-2.5", invalid && invalidControl, className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
}

type FieldProps = {
  label: ReactNode;
  htmlFor?: string;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  className?: string;
  children: ReactNode;
};

/** Label + kontrol + hint/error dengan jarak & tipografi seragam. */
export function Field({ label, htmlFor, hint, error, required, className, children }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      ) : null}
    </div>
  );
}
