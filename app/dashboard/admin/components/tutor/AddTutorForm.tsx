"use client";

import { useState, type FormEvent } from "react";

const DAY_LABELS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

type Props = {
  registering: boolean;
  registerError: string;
  onSubmit: (payload: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
    bio?: string | null;
    dayoff1?: number | null;
    dayoff2?: number | null;
  }) => void;
};

export default function AddTutorForm({ registering, registerError, onSubmit }: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [dayoff1, setDayoff1] = useState("");
  const [dayoff2, setDayoff2] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const d1 = dayoff1 === "" ? null : Number(dayoff1);
    const d2 = dayoff2 === "" ? null : Number(dayoff2);
    onSubmit({ email, password, fullName, phone, bio: bio || null, dayoff1: d1, dayoff2: d2 });
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-7">
      <h2 className="mb-6 text-lg font-extrabold tracking-tight text-slate-900">Tambah Tutor Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email <span className="text-red-500">*</span></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">No. HP <span className="text-red-500">*</span></label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Hari Libur 1</label>
          <select value={dayoff1} onChange={(e) => setDayoff1(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">-- Tidak ada --</option>
            {DAY_LABELS.map((label, i) => <option key={i} value={i}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Hari Libur 2</label>
          <select value={dayoff2} onChange={(e) => setDayoff2(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          >
            <option value="">-- Tidak ada --</option>
            {DAY_LABELS.map((label, i) => <option key={i} value={i}>{label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
        </div>
        {registerError && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{registerError}</div>}
        <button type="submit" disabled={registering}
          className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-colors">
          {registering ? <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Mendaftarkan...</span> : "Tambah Tutor"}
        </button>
      </form>
    </div>
  );
}
