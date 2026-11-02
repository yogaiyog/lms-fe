"use client";

import Link from "next/link";
import { ChevronRight, LogOut, Menu, Moon, Sun, X, type LucideIcon } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Avatar } from "@/components/ui/avatar";
import { IconButton } from "@/components/ui/button";

const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME || "JuaraKu";

export type ShellNavChild = { key: string; label: string };

export type ShellNavItem = {
  key: string;
  label: string;
  /** Label ringkas untuk bottom navigation mobile (default: label). */
  shortLabel?: string;
  icon: LucideIcon;
  /** Tautan ke halaman lain (bukan segmen di halaman ini). */
  href?: string;
  /** Sub-menu; bila ada, klik item induk membuka sub-menu pertama. Key anak berbentuk "induk/anak". */
  children?: ShellNavChild[];
};

export type ShellNavSection = { title?: string; items: ShellNavItem[] };

type DashboardShellProps = {
  /** Label peran di bawah nama brand, mis. "Admin", "Tutor". */
  roleLabel: string;
  sections: ShellNavSection[];
  /** Key aktif. Untuk sub-menu gunakan "induk/anak". */
  activeKey: string;
  onNavigate: (key: string) => void;
  title: ReactNode;
  subtitle?: ReactNode;
  user: { name?: string | null; email?: string | null; avatarUrl?: string | null };
  onLogout: () => void;
  /** Bila diisi, tombol mode gelap tampil di topbar. */
  dark?: boolean;
  onToggleDark?: () => void;
  /** Key item yang tampil di bottom navigation mobile (maks. 5). */
  mobileNav?: string[];
  headerActions?: ReactNode;
  /** Konten tambahan di atas daftar menu (mis. pemilih anak untuk orang tua). */
  sidebarExtra?: ReactNode;
  children: ReactNode;
  /** Lebar maksimum konten. */
  contentClassName?: string;
};

function isActive(item: ShellNavItem, activeKey: string) {
  return activeKey === item.key || activeKey.startsWith(`${item.key}/`);
}

function SidebarContent({
  roleLabel,
  sections,
  activeKey,
  onNavigate,
  user,
  onLogout,
  sidebarExtra,
}: Pick<DashboardShellProps, "roleLabel" | "sections" | "activeKey" | "onNavigate" | "user" | "onLogout" | "sidebarExtra">) {
  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 pb-6 pt-6">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15">
          <img src="/logo.png" alt="" className="h-7 w-auto" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-base font-bold leading-tight text-white">{COMPANY}</p>
          <span className="mt-1 inline-flex rounded-full bg-accent-300 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-primary-950">
            {roleLabel}
          </span>
        </div>
      </div>

      {sidebarExtra && <div className="px-3 pb-4">{sidebarExtra}</div>}

      {/* Menu */}
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4" aria-label="Menu utama">
        {sections.map((section, si) => (
          <div key={section.title ?? si}>
            {section.title && (
              <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-primary-200/60">
                {section.title}
              </p>
            )}
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item, activeKey);
                const base = cn(
                  "group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-white/12 text-white" : "text-primary-100/80 hover:bg-white/8 hover:text-white",
                );
                const inner = (
                  <>
                    {active && <span className="absolute inset-y-2 left-0 w-1 rounded-r-full bg-accent-300" aria-hidden />}
                    <Icon size={18} className={active ? "text-accent-300" : "text-primary-200/70 group-hover:text-white"} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.children && (
                      <ChevronRight size={16} className={cn("transition-transform", active && "rotate-90")} aria-hidden />
                    )}
                  </>
                );
                return (
                  <li key={item.key}>
                    {item.href ? (
                      <Link href={item.href} className={base}>
                        {inner}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={base}
                        aria-current={active && !item.children ? "page" : undefined}
                        onClick={() => onNavigate(item.children ? `${item.key}/${item.children[0].key}` : item.key)}
                      >
                        {inner}
                      </button>
                    )}
                    {item.children && active && (
                      <ul className="mt-1 space-y-0.5 border-l border-white/10 pl-3 ml-5">
                        {item.children.map((child) => {
                          const childKey = `${item.key}/${child.key}`;
                          const childActive = activeKey === childKey;
                          return (
                            <li key={child.key}>
                              <button
                                type="button"
                                aria-current={childActive ? "page" : undefined}
                                onClick={() => onNavigate(childKey)}
                                className={cn(
                                  "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] transition-colors",
                                  childActive
                                    ? "bg-white/12 font-semibold text-white"
                                    : "font-medium text-primary-100/70 hover:bg-white/5 hover:text-primary-50",
                                )}
                              >
                                <span
                                  aria-hidden
                                  className={cn("h-1.5 w-1.5 shrink-0 rounded-full", childActive ? "bg-accent-300" : "bg-primary-300/40")}
                                />
                                {child.label}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 rounded-xl px-2 py-2">
          <Avatar name={user.name ?? user.email} src={user.avatarUrl} size="sm" className="ring-2 ring-white/20" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{user.name || user.email || "Pengguna"}</p>
            {user.email && user.name && <p className="truncate text-xs text-primary-200/70">{user.email}</p>}
          </div>
          <button
            type="button"
            onClick={onLogout}
            aria-label="Keluar"
            title="Keluar"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-primary-200/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Kerangka dashboard bersama untuk semua peran (admin, tutor, siswa, orang tua):
 * sidebar desktop, drawer + bottom-nav mobile, topbar, dan mode gelap.
 */
export function DashboardShell(props: DashboardShellProps) {
  const {
    sections,
    activeKey,
    onNavigate,
    title,
    subtitle,
    onLogout,
    dark = false,
    onToggleDark,
    mobileNav,
    headerActions,
    children,
    contentClassName,
  } = props;
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const navigate = (key: string) => {
    onNavigate(key);
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const allItems = sections.flatMap((s) => s.items);
  const bottomItems = (mobileNav ?? [])
    .map((key) => allItems.find((i) => i.key === key))
    .filter((i): i is ShellNavItem => Boolean(i));

  const sidebarBg = "bg-gradient-to-b from-primary-900 via-primary-900 to-primary-950";

  return (
    <div className={cn(dark && "dark")}>
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 print:bg-white">
        {/* Sidebar desktop */}
        <aside className={cn("fixed inset-y-0 left-0 z-30 hidden w-64 lg:block print:hidden", sidebarBg)}>
          <SidebarContent {...props} onNavigate={navigate} />
        </aside>

        {/* Drawer mobile/tablet */}
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <div className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm" onClick={() => setDrawerOpen(false)} />
            <div className={cn("absolute inset-y-0 left-0 w-72 max-w-[85vw] animate-slide-in-left shadow-2xl", sidebarBg)}>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                aria-label="Tutup menu"
                className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-primary-100 hover:bg-white/10"
              >
                <X size={18} />
              </button>
              <SidebarContent {...props} onNavigate={navigate} />
            </div>
          </div>
        )}

        <div className="lg:pl-64 print:pl-0">
          {/* Topbar */}
          <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/85 print:hidden">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <IconButton label="Buka menu" onClick={() => setDrawerOpen(true)} className="-ml-2 lg:hidden">
                <Menu size={20} />
              </IconButton>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-base font-semibold text-slate-900 sm:text-lg dark:text-white">{title}</h1>
                {subtitle && <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">{subtitle}</p>}
              </div>
              <div className="flex items-center gap-1">
                {headerActions}
                {onToggleDark && (
                  <IconButton label={dark ? "Mode terang" : "Mode gelap"} onClick={onToggleDark}>
                    {dark ? <Sun size={18} /> : <Moon size={18} />}
                  </IconButton>
                )}
                <IconButton label="Keluar" tone="danger" onClick={onLogout} className="lg:hidden">
                  <LogOut size={18} />
                </IconButton>
              </div>
            </div>
          </header>

          <main
            className={cn(
              "mx-auto w-full px-4 py-6 sm:px-6 lg:px-8 print:max-w-none print:p-0",
              bottomItems.length > 0 ? "pb-28 lg:pb-10" : "pb-10",
              contentClassName ?? "max-w-7xl",
            )}
          >
            {children}
          </main>
        </div>

        {/* Bottom nav mobile */}
        {bottomItems.length > 0 && (
          <nav
            aria-label="Navigasi bawah"
            className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden dark:border-slate-800 dark:bg-slate-950/95 print:hidden"
          >
            <ul className="flex">
              {bottomItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item, activeKey);
                const cls = cn(
                  "flex w-full flex-col items-center gap-1 py-2.5 text-[11px] font-semibold transition-colors",
                  active ? "text-primary-600 dark:text-primary-300" : "text-slate-500 dark:text-slate-400",
                );
                const content = (
                  <>
                    <span
                      className={cn(
                        "flex h-7 w-12 items-center justify-center rounded-full transition-colors",
                        active && "bg-primary-50 dark:bg-primary-950",
                      )}
                    >
                      <Icon size={18} />
                    </span>
                    <span className="max-w-full truncate px-1">{item.shortLabel ?? item.label}</span>
                  </>
                );
                return (
                  <li key={item.key} className="flex-1">
                    {item.href ? (
                      <Link href={item.href} className={cls}>
                        {content}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        className={cls}
                        aria-current={active ? "page" : undefined}
                        onClick={() => navigate(item.children ? `${item.key}/${item.children[0].key}` : item.key)}
                      >
                        {content}
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
}
