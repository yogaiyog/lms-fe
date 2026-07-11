
"use client";
import { useState, useEffect } from "react";
import type { Theme, Segment } from "./types";
import { NAV_ITEMS } from "./types";
import type { LucideIcon } from "lucide-react";

type NavItem = { key: Segment; label: string; icon: LucideIcon };

type Props = {
  theme: Theme;
  segment: Segment;
  onNavigate: (key: Segment) => void;
  user: { studentProfile?: { fullName?: string; nickname?: string } | null } | null;
  title?: string;
  navItems?: NavItem[];
};

const LOGO_EXTS = ["jpeg", "png", "jpg", "webp", "svg"];

export default function Sidebar({ theme, segment, onNavigate, user, title, navItems }: Props) {
  const items = navItems ?? NAV_ITEMS;
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const tryExt = (i: number) => {
      if (i >= LOGO_EXTS.length || cancelled) {
        if (!cancelled) setLogoSrc(null);
        return;
      }
      const img = new Image();
      img.onload = () => { if (!cancelled) setLogoSrc(`/logo.${LOGO_EXTS[i]}`); };
      img.onerror = () => { if (!cancelled) tryExt(i + 1); };
      img.src = `/logo.${LOGO_EXTS[i]}`;
    };
    tryExt(0);
    return () => { cancelled = true; };
  }, []);

  return (
    <aside className={`hidden md:flex md:w-64 md:flex-col fixed inset-y-0 left-0 border-r ${theme.border} ${theme.card} px-4 py-6`}>
      <div className="flex items-center gap-2 px-2 mb-8">
        {logoSrc ? (
          <img src={logoSrc} alt="Logo" className="h-10 w-10 rounded-2xl object-cover" />
        ) : (
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white font-extrabold">
            {user?.studentProfile?.fullName?.charAt(0) ?? "P"}
          </div>
        )}
        <div>
          <p className={`font-extrabold leading-tight ${theme.text}`}>{title ?? "Student"}</p>
          <p className={`text-xs leading-tight ${theme.textMuted}`}>{user?.studentProfile?.fullName ?? user?.studentProfile?.nickname ?? ""}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = segment === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onNavigate(item.key)}
              className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                active ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30" : `${theme.text} hover:bg-blue-50 hover:text-blue-700`
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className={`mt-6 rounded-2xl p-4 ${theme.dark ? "bg-slate-800" : "bg-blue-50"}`}>
        <p className={`text-xs font-bold ${theme.text}`}>Butuh bantuan?</p>
        <p className={`text-xs mt-1 ${theme.textMuted}`}>Hubungi tutor kamu jika ada pertanyaan.</p>
      </div>
    </aside>
  );
}
