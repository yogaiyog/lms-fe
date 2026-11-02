"use client";

import { Button, Input, Select, Textarea } from "@/components/ui";
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
    meetLink?: string | null;
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
  const [meetLink, setMeetLink] = useState("");
  const [dayoff1, setDayoff1] = useState("");
  const [dayoff2, setDayoff2] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const d1 = dayoff1 === "" ? null : Number(dayoff1);
    const d2 = dayoff2 === "" ? null : Number(dayoff2);
    onSubmit({ email, password, fullName, phone, bio: bio || null, meetLink: meetLink || null, dayoff1: d1, dayoff2: d2 });
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6 sm:p-7">
      <h2 className="mb-6 text-lg font-extrabold tracking-tight text-slate-900">Tambah Tutor Baru</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nama Lengkap <span className="text-red-500">*</span></label>
          <Input value={fullName} onChange={(e) => setFullName(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email <span className="text-red-500">*</span></label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Password <span className="text-red-500">*</span></label>
          <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">No. HP <span className="text-red-500">*</span></label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Link Meet Default</label>
          <Input type="url" value={meetLink} onChange={(e) => setMeetLink(e.target.value)} placeholder="https://meet.google.com/..." />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Hari Libur 1</label>
          <Select value={dayoff1} onChange={(e) => setDayoff1(e.target.value)}
          >
            <option value="">-- Tidak ada --</option>
            {DAY_LABELS.map((label, i) => <option key={i} value={i}>{label}</option>)}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Hari Libur 2</label>
          <Select value={dayoff2} onChange={(e) => setDayoff2(e.target.value)}
          >
            <option value="">-- Tidak ada --</option>
            {DAY_LABELS.map((label, i) => <option key={i} value={i}>{label}</option>)}
          </Select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Bio</label>
          <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="resize-none" />
        </div>
        {registerError && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{registerError}</div>}
        <Button type="submit" disabled={registering} className="w-full">
          {registering ? <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Mendaftarkan...</span> : "Tambah Tutor"}
        </Button>
      </form>
    </div>
  );
}
