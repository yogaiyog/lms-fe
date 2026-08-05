"use client";

import Link from "next/link";
import { Rocket, LogIn, UserPlus } from "lucide-react";

export default function HomeContent() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-5">
      {/* Hero card */}
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-sm p-8 sm:p-10 text-center h-fit">
          <img src="/logo.png" alt="Logo" className="mx-auto mb-5 h-20 w-20 object-contain" />
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
