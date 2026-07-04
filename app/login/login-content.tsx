"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { api, saveSession } from "@/lib/api";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setEmail(window.localStorage.getItem("lms.savedEmail") ?? "");
    setPassword(window.localStorage.getItem("lms.savedPassword") ?? "");
  }, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await api.auth.login({ email, password });
      window.localStorage.setItem("lms.rememberMe", String(rememberMe));
      if (rememberMe) {
        window.localStorage.setItem("lms.savedEmail", email);
        window.localStorage.setItem("lms.savedPassword", password);
      } else {
        window.localStorage.removeItem("lms.savedEmail");
        window.localStorage.removeItem("lms.savedPassword");
      }
      saveSession(session);
      if (session.user.role === "TUTOR") {
        router.push("/dashboard/tutor");
      } else if (session.user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else if (session.user.role === "STUDENT") {
        router.push("/dashboard/student");
      } else {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
        >
          ← Kembali
        </Link>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-7 sm:p-8">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <LogIn size={28} className="text-blue-600" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Login</h1>
            <p className="mt-1 text-sm text-slate-500">Masuk ke akun kamu</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Ingat saya
            </label>

            {error && (
              <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Memproses...
                </span>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-500">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
