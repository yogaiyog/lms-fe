"use client";

import Link from "next/link";

export default function HomeContent() {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-5"
      style={{
        background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)",
      }}
    >
      {/* Logo */}
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
        <span className="text-4xl">💻</span>
      </div>

      {/* Title */}
      <h1 className="mb-2 text-3xl font-bold text-white">JTCourse</h1>
      <p className="mb-8 text-center text-white/80">
        Platform belajar coding untuk anak-anak Indonesia
      </p>

      {/* Card */}
      <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-dark-amethyst-100">
            <span className="text-2xl">🚀</span>
          </div>
        </div>
        <h2 className="mb-1 text-center text-xl font-bold text-gray-800">
          Selamat Datang
        </h2>
        <p className="mb-6 text-center text-sm text-gray-500">
          Mulai petualangan codingmu sekarang!
        </p>

        <Link
          href="/login"
          className="mb-3 block rounded-xl bg-berry-lipstick-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-berry-lipstick-600"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="block rounded-xl bg-dark-amethyst-500 px-4 py-3 text-center text-sm font-semibold text-white shadow-md transition hover:bg-dark-amethyst-600"
        >
          Daftar Akun
        </Link>
      </div>

      <p className="mt-6 text-sm text-white/60">
        Belajar coding itu menyenangkan! 🎯
      </p>
    </div>
  );
}
