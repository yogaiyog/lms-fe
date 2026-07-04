"use client";

import Link from "next/link";
import { Rocket, LogIn, UserPlus } from "lucide-react";

export default function HomeContent() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-5">
      {/* Hero card */}
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-sm p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-blue-700 shadow-sm shadow-blue-600/30">
          <Rocket size={36} className="text-white" />
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          JTCourse
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Platform belajar coding untuk anak-anak Indonesia
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
          Belajar coding itu menyenangkan! 🎯
        </p>
      </div>
    </div>
  );
}
