"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  /** Tombol aksi di bagian bawah (rata kanan). */
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Cegah tutup sama sekali (tombol X, klik latar, Escape) — mis. saat form sedang disimpan. */
  dismissible?: boolean;
  /**
   * Tutup lewat klik latar & Escape (default true). Set false untuk form panjang
   * agar isian tidak hilang karena salah klik; tombol X tetap ada.
   */
  closeOnBackdrop?: boolean;
  /** Tombol tambahan di header, di sebelah kiri tombol X (mis. Edit / Hapus). */
  headerActions?: ReactNode;
  /** Ganti padding area isi (mis. "p-0" bila konten mengatur padding sendiri). */
  bodyClassName?: string;
};

const widths = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl", "2xl": "max-w-6xl" };

/**
 * Modal standar: Escape & klik latar untuk menutup, scroll body dikunci,
 * fokus dipindah ke dialog, tampil sebagai bottom sheet di layar kecil.
 * Dirender lewat portal ke <body> sehingga modal bertumpuk (konfirmasi di atas detail)
 * tidak terkurung oleh transform/overflow induknya.
 */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
  closeOnBackdrop = true,
  headerActions,
  bodyClassName,
}: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  // Pemanggil biasanya mengirim arrow function baru tiap render; simpan di ref supaya
  // efek di bawah tidak berjalan ulang (yang akan merebut fokus dari input saat mengetik).
  const onCloseRef = useRef(onClose);
  const dismissibleRef = useRef(dismissible && closeOnBackdrop);
  useEffect(() => {
    onCloseRef.current = onClose;
    dismissibleRef.current = dismissible && closeOnBackdrop;
  });

  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissibleRef.current) onCloseRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open]);

  if (!open || typeof document === "undefined") return null;

  // Modal yang dibuka di dalam elemen ".dark" ikut bertema gelap walau dipindah ke <body>.
  const inDark = typeof window !== "undefined" && Boolean(document.querySelector(".dark"));

  return createPortal(
    <div className={cn("fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4", inDark && "dark")}>
      <div
        className="absolute inset-0 animate-fade-in bg-slate-950/50 backdrop-blur-sm"
        onClick={dismissible && closeOnBackdrop ? onClose : undefined}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cn(
          "relative flex max-h-[92vh] w-full animate-pop-in flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl outline-none",
          "sm:rounded-2xl dark:bg-slate-900",
          widths[size],
        )}
      >
        {(title || dismissible || headerActions) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-5 py-4 sm:px-6 dark:border-slate-800">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-slate-900 dark:text-white">
                  {title}
                </h2>
              )}
              {description && <div className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{description}</div>}
            </div>
            <div className="-mr-2 flex shrink-0 items-center gap-1">
            {headerActions}
            {dismissible && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Tutup"
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            )}
            </div>
          </div>
        )}
        <div className={cn("flex-1 overflow-y-auto", bodyClassName ?? "px-5 py-5 sm:px-6")}>{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3.5 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
