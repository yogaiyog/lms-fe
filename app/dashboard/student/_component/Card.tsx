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
      className={`rounded-3xl border ${theme.border} ${theme.card} shadow-sm ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
