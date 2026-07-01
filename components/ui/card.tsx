import type { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl border border-white/30 bg-white/90 shadow-xl backdrop-blur-xl ${className}`}
      {...props}
    />
  );
}
