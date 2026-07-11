"use client";

import { FormEvent, useState, useEffect } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import { CheckCircle, UserPlus } from "lucide-react";

const LOGO_EXTS = ["png", "jpeg", "jpg", "webp", "svg"];

export default function RegisterContent() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const [registered, setRegistered] = useState(false);

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

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.auth.registerParent({
        email,
        password,
        fullName,
        phone,
      });
      setRegistered(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register gagal");
    } finally {
      setLoading(false);
    }
  }

  if (registered) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-sm p-8 sm:p-10 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
            <CheckCircle size={28} className="text-green-600" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Cek Email Kamu</h1>
          <p className="mt-2 text-sm text-slate-500">
            Kami sudah mengirim email verifikasi ke <strong>{email}</strong>.
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Klik link di email untuk memverifikasi akun kamu sebelum login.
          </p>
          <div className="mt-6 rounded-2xl bg-blue-50 p-3 text-xs text-slate-600">
            Tidak terima email? Cek folder spam atau tunggu beberapa menit.
          </div>
          <Link href="/login" className="mt-4 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700">
            Ke Halaman Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5 py-8">
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
            {logoSrc ? (
              <img src={logoSrc} alt="Logo" className="mx-auto mb-4 h-16 w-16 rounded-2xl object-cover" />
            ) : (
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
                <UserPlus size={28} className="text-blue-600" />
              </div>
            )}
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Daftar Akun</h1>
            <p className="mt-1 text-sm text-slate-500">Buat akun baru untuk memulai</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Nama Lengkap
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama lengkap"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Telepon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

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
                placeholder="Minimal 8 karakter"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                required
              />
            </div>

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
                "Daftar"
              )}
            </button>
          </form>

          <div className="mt-4 rounded-2xl bg-blue-50 p-3 text-center text-xs text-slate-600">
            Email verifikasi akan dikirim setelah pendaftaran. Silakan cek inbox/spam kamu.
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-bold text-blue-600 hover:text-blue-700 transition-colors"
              >
                Login di sini
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
