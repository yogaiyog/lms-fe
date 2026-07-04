"use client";

import { useState, type FormEvent } from "react";
import { api, type Curriculum, type Topic } from "@/lib/api";
import { CATEGORY_LABELS } from "../../constants";

type Props = {
  curriculums: Curriculum[];
};

export default function TopicManagement({ curriculums }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function loadTopics(curriculumId: string) {
    if (!curriculumId) { setTopics([]); return; }
    setLoading(true);
    try {
      setTopics(await api.topics.listByCurriculum(curriculumId));
    } catch { setTopics([]); }
    finally { setLoading(false); }
  }

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const curriculumId = (fd.get("curriculumId") as string) || null;
      await api.topics.create({
        curriculumId,
        title: fd.get("title") as string,
        materialLink: (fd.get("materialLink") as string) || null,
        exampleProjectLink: (fd.get("exampleProjectLink") as string) || null,
        goals: (fd.get("goals") as string) || null,
        tools: (fd.get("tools") as string) || null,
      });
      setShowCreate(false);
      if (selectedId && curriculumId === selectedId) {
        await loadTopics(selectedId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
    } finally { setSaving(false); }
  }

  const selectedCurriculum = curriculums.find((c) => c.id === selectedId);

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Topik</h2>

        <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); loadTopics(e.target.value); }}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">-- Pilih Kurikulum (opsional) --</option>
          {curriculums.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({CATEGORY_LABELS[c.category] ?? c.category})</option>
          ))}
        </select>

        {loading && <p className="py-4 text-center text-sm text-slate-400">Memuat...</p>}

        {!loading && selectedId && topics.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">Belum ada topik</p>
          </div>
        )}

        {!loading && topics.length > 0 && (
          <div className="mb-4 space-y-1.5">
            {[...topics].sort((a, b) => a.order - b.order).map((t) => (
              <div key={t.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-[11px] font-bold text-blue-700">
                  {t.order + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                  {t.goals && <p className="text-xs text-slate-400 truncate">{t.goals}</p>}
                </div>
                <span className="shrink-0 text-[10px] text-slate-400">{t.tools ?? "—"}</span>
              </div>
            ))}
          </div>
        )}

        <button onClick={() => { setShowCreate(true); setError(""); }}
          className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
        >
          + Tambah Topik
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Tambah Topik</h3>
              <button onClick={() => setShowCreate(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={onCreate}>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Kurikulum <span className="text-xs font-normal text-slate-400">(opsional)</span></label>
                <select name="curriculumId" defaultValue={selectedId}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Tanpa kurikulum --</option>
                  {curriculums.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({CATEGORY_LABELS[c.category] ?? c.category})</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Judul</label>
                <input name="title" required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Tujuan</label>
                <input name="goals"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Link Materi</label>
                <input name="materialLink" type="url"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Link Project</label>
                <input name="exampleProjectLink" type="url"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Tools</label>
                <input name="tools"
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
