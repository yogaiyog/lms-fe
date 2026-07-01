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
    <div className="rounded-2xl bg-white p-6 shadow-md">
      <h2 className="mb-4 text-lg font-bold text-gray-800">Tambah Tutor Baru</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Nama Lengkap <span className="text-berry-lipstick-500">*</span></label>
          <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400" />
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Email <span className="text-berry-lipstick-500">*</span></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400" />
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Password <span className="text-berry-lipstick-500">*</span></label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400" />
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">No. HP <span className="text-berry-lipstick-500">*</span></label>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400" />
        </div>
        <div className="mb-3">
          <label className="mb-1 block text-sm font-medium text-gray-700">Hari Libur 1</label>
          <select value={dayoff1} onChange={(e) => setDayoff1(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400"
          >
            <option value="">-- Tidak ada --</option>
            {DAY_LABELS.map((label, i) => <option key={i} value={i}>{label}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Hari Libur 2</label>
          <select value={dayoff2} onChange={(e) => setDayoff2(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400"
          >
            <option value="">-- Tidak ada --</option>
            {DAY_LABELS.map((label, i) => <option key={i} value={i}>{label}</option>)}
          </select>
        </div>
        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Bio</label>
          <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400" />
        </div>
        {registerError && <div className="mb-4 rounded-lg bg-berry-lipstick-50 p-3 text-sm text-berry-lipstick-600">{registerError}</div>}
        <button type="submit" disabled={registering}
          className="w-full rounded-xl bg-dark-amethyst-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-dark-amethyst-600 disabled:opacity-50">
          {registering ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Tambah Tutor"}
        </button>
      </form>
    </div>
  );
}
