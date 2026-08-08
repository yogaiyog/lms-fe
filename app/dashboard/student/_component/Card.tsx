"use client";

import type { Theme } from "./types";

export default function Card({ children, className = "", theme, onClick }: {
  children: React.ReactNode;
  className?: string;
  theme: Theme;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`rounded-[1.75rem] border ${theme.border} ${theme.card} shadow-sm ${onClick ? "cursor-pointer hover:shadow-md hover:shadow-brand-blue-500/10 hover:-translate-y-0.5 transition-all duration-200" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
