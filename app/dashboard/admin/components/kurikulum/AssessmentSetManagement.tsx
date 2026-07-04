"use client";

import { useState, type FormEvent } from "react";
import { api, type AssessmentSet } from "@/lib/api";

type Props = {
  assessmentSets: AssessmentSet[];
  onRefresh: () => void;
};

export default function AssessmentSetManagement({ assessmentSets, onRefresh }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      await api.assessmentSets.create({
        name: fd.get("name") as string,
        description: (fd.get("description") as string) || null,
      });
      setShowCreate(false);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
    } finally { setSaving(false); }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Set Penilaian</h2>
          <span className="text-xs text-slate-400">{assessmentSets.length} total</span>
        </div>

        {assessmentSets.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">Belum ada set penilaian</p>
          </div>
        ) : (
          <div className="mb-4 space-y-2">
            {assessmentSets.map((s) => (
              <div key={s.id} className="rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-800">{s.name}</p>
                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                    {s.aspects?.length ?? 0} aspek
                  </span>
                </div>
                {s.description && (
                  <p className="mt-0.5 text-xs text-slate-400">{s.description}</p>
                )}
              </div>
            ))}
          </div>
        )}

        <button onClick={() => { setShowCreate(true); setError(""); }}
          className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
        >
          + Tambah Set Penilaian
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Tambah Set Penilaian</h3>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={onCreate}>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nama</label>
                <input name="name" required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Deskripsi</label>
                <textarea name="description" rows={3}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
              <button type="submit" disabled={saving}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
