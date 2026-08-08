"use client";
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

export default function Sidebar({ theme, segment, onNavigate, user, title, navItems }: Props) {
  const items = navItems ?? NAV_ITEMS;

  return (
    <aside className={`hidden md:flex md:w-64 md:flex-col fixed inset-y-0 left-0 border-r ${theme.border} overflow-hidden`}>
      {/* Bagian atas ~70% - background putih */}
      <div className={`flex flex-col flex-[7] ${theme.card} px-4 py-6 overflow-y-auto`}>
        <div className="flex items-center gap-2.5 px-2 mb-8">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center">
            <img src="/logo.png" alt="Logo" className="h-7 w-7 rounded-lg object-contain" />
          </div>
          <div className="min-w-0">
            <p className={`font-extrabold leading-tight text-sm ${theme.text}`}>{title ?? "Student"}</p>
            <p className={`text-xs leading-tight ${theme.textMuted} truncate`}>
              {user?.studentProfile?.fullName ?? user?.studentProfile?.nickname ?? ""}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5">
          {items.map((item) => {
            const Icon = item.icon;
            const active = segment === item.key;
            return (
              <button
                key={item.key}
                onClick={() => onNavigate(item.key)}
                className={`w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-brand-blue-400 text-white shadow-md shadow-brand-blue-500/30"
                    : `${theme.text} hover:bg-brand-blue-50 hover:text-brand-blue-700`
                }`}
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bagian bawah ~30% */}
      <div className={`flex-[3] flex items-end px-4 pb-10 ${theme.dark ? "bg-brand-blue-900" : "bg-brand-yellow-400"}`}>
        <div className={`rounded-2xl p-4 w-full shadow-md shadow-black/10 ${theme.dark ? "bg-brand-blue-800" : "bg-brand-yellow-300"}`}>
          <p className={`text-xs font-bold ${theme.dark ? "text-brand-blue-200" : "text-brand-blue-500"}`}>Butuh bantuan?</p>
          <p className={`text-xs mt-1 ${theme.dark ? "text-brand-blue-300" : "text-brand-blue-600"}`}>Hubungi tutor kamu jika ada pertanyaan.</p>
        </div>
      </div>
    </aside>
  );
}