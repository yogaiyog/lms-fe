"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, saveSession } from "@/lib/api";
import Link from "next/link";

export default function RegisterContent() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await api.auth.registerParent({
        email,
        password,
        fullName,
        phone,
      });
      saveSession(session);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5 py-8"
      style={{
        background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)",
      }}
    >
      {/* Back Link */}
      <Link
        href="/"
        className="mb-6 self-start text-sm text-white/80 hover:text-white"
      >
        ← Kembali
      </Link>

      {/* Card */}
      <div className="w-full rounded-[20px] bg-white p-6 shadow-xl">
        <div className="mb-4 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-tea-green-100">
            <svg
              className="h-7 w-7 text-tea-green-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Daftar Akun</h2>
          <p className="mt-1 text-sm text-gray-500">
            Buat akun baru untuk memulai
          </p>
        </div>

        <form className="p-4" onSubmit={onSubmit}>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Nama Lengkap
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nama lengkap"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
              required
            />
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Telepon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
              required
            />
          </div>

          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@contoh.com"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
              required
            />
          </div>

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-dark-amethyst-400 focus:ring-2 focus:ring-dark-amethyst-100"
              required
            />
          </div>

          {error && (
            <div className="mb-4 rounded-lg bg-berry-lipstick-50 p-3 text-sm text-berry-lipstick-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-berry-lipstick-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-berry-lipstick-600 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Daftar"
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="font-semibold text-dark-amethyst-600 hover:text-dark-amethyst-700"
              >
                Login di sini
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
