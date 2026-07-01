"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { api, saveSession } from "@/lib/api";
import Link from "next/link";

export default function LoginContent() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session = await api.auth.login({ email, password });
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
    <div
      className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-5"
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
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-dark-amethyst-100">
            <svg
              className="h-7 w-7 text-dark-amethyst-600"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Login</h2>
          <p className="mt-1 text-sm text-gray-500">Masuk ke akun kamu</p>
        </div>

        <form className="p-4" onSubmit={onSubmit}>
          <div className="mb-4">
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
              placeholder="Masukkan password"
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
            className="w-full rounded-xl bg-dark-amethyst-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-dark-amethyst-600 disabled:opacity-50"
          >
            {loading ? (
              <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Login"
            )}
          </button>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="font-semibold text-dark-amethyst-600 hover:text-dark-amethyst-700"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
