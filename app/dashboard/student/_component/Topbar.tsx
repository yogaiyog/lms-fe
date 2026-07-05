"use client";

import { Menu, Sun, Moon, Bell, LogOut } from "lucide-react";
import type { Theme } from "./types";
import { NAV_ITEMS } from "./types";

type Props = {
  theme: Theme;
  segment: string;
  onToggleDark: () => void;
  onLogout: () => void;
  onMenuClick: () => void;
};

export default function Topbar({ theme, segment, onToggleDark, onLogout, onMenuClick }: Props) {
  return (
    <header className={`sticky top-0 z-30 flex items-center justify-between gap-3 border-b ${theme.border} ${theme.card}/90 backdrop-blur px-4 sm:px-8 py-3.5`}>
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className={`md:hidden ${theme.text}`}>
          <Menu size={22} />
        </button>
        <p className={`font-extrabold hidden sm:block ${theme.text}`}>
          {NAV_ITEMS.find((n) => n.key === segment)?.label || "Ringkasan"}
        </p>
      </div>
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onToggleDark}
          className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}
        >
          {theme.dark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button className={`relative flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600 transition-colors`}>
          <Bell size={18} />
        </button>
        <button onClick={onLogout} className={`flex h-9 w-9 items-center justify-center rounded-full ${theme.textMuted} hover:bg-red-50 hover:text-red-600 transition-colors`} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}
