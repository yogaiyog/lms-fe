"use client";

import { X } from "lucide-react";
import type { Theme, Segment } from "./types";
import { NAV_ITEMS } from "./types";

type Props = {
  theme: Theme;
  open: boolean;
  segment: Segment;
  onNavigate: (key: Segment) => void;
  onClose: () => void;
  user: { studentProfile?: { fullName?: string } | null } | null;
};

export default function MobileDrawer({ theme, open, segment, onNavigate, onClose, user }: Props) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 md:hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={`absolute left-0 top-0 bottom-0 w-72 ${theme.card} p-5`}>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <img src="/logo.jpeg" alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
            <div>
              <p className={`text-xs font-bold ${theme.textMuted}`}>Student</p>
              <p className={`text-sm font-extrabold ${theme.text} leading-tight`}>{user?.studentProfile?.fullName ?? "Student"}</p>
            </div>
          </div>
          <button onClick={onClose} className={theme.textMuted}><X size={20} /></button>
        </div>
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = segment === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { onNavigate(item.key); onClose(); }}
                className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${
                  active ? "bg-blue-600 text-white" : `${theme.text} hover:bg-blue-50 hover:text-blue-700`
                }`}
              >
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
