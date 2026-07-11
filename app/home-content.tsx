"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Rocket, LogIn, UserPlus } from "lucide-react";

const LOGO_EXTS = ["png", "jpeg", "jpg", "webp", "svg"];

export default function HomeContent() {
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-5">
      {/* Hero card */}
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-sm p-8 sm:p-10 text-center">
        {logoSrc ? (
          <img src={logoSrc} alt="Logo" className="mx-auto mb-5 h-20 w-20 rounded-3xl object-cover" />
        ) : (
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm shadow-blue-600/30">
            <Rocket size={36} className="text-white" />
          </div>
        )}

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          {process.env.NEXT_PUBLIC_COMPANY_NAME || "JTCourse"}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {process.env.NEXT_PUBLIC_COMPANY_SLOGAN || "Tumbuh Cerdas, Berkarya Hebat."}
        </p>

        <div className="mt-8 space-y-3">
          <Link
            href="/login"
            className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
          >
            <LogIn size={18} />
            Login
          </Link>
          <Link
            href="/register"
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 px-5 py-3.5 text-sm font-bold text-slate-900 transition hover:bg-blue-50 hover:text-blue-700"
          >
            <UserPlus size={18} />
            Daftar Akun
          </Link>
        </div>

        <p className="mt-8 text-xs text-slate-400">
          {process.env.NEXT_PUBLIC_COMPANY_SLOGAN2 || "Explore, Imagine, Creativity and Fun Lerning"}
        </p>
      </div>
    </div>
  );
}
