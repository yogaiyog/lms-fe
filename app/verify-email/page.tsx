"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { CheckCircle, XCircle, Loader } from "lucide-react";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Token verifikasi tidak ditemukan");
      return;
    }
    api.auth.verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "Email berhasil diverifikasi");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Gagal memverifikasi email");
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white shadow-sm p-8 sm:p-10 text-center">
        {status === "loading" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <Loader size={28} className="text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Memverifikasi...</h1>
            <p className="mt-2 text-sm text-slate-500">Tunggu sebentar ya.</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
              <CheckCircle size={28} className="text-green-600" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Email Terverifikasi!</h1>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <Link href="/login" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700">
              Login Sekarang
            </Link>
          </>
        )}
        {status === "error" && (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
              <XCircle size={28} className="text-red-600" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Verifikasi Gagal</h1>
            <p className="mt-2 text-sm text-slate-500">{message}</p>
            <Link href="/login" className="mt-6 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700">
              Ke Halaman Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
