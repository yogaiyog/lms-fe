"use client";

import { useState, useEffect, type FormEvent } from "react";
import { api, type Category, type Curriculum, type AssessmentSet } from "@/lib/api";
import { CATEGORY_LABELS } from "../../constants";

type Props = {
  curriculums: Curriculum[];
  assessmentSets: AssessmentSet[];
  onRefresh: () => void;
};

export default function CurriculumList({ curriculums, assessmentSets, onRefresh }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editingCurriculum, setEditingCurriculum] = useState<Curriculum | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryNames, setSelectedCategoryNames] = useState<string[]>([]);

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => {});
  }, []);

  async function onCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const ids = categories.filter((c) => selectedCategoryNames.includes(c.name)).map((c) => c.id);
      await api.curriculums.create({
        name: fd.get("name") as string,
        categoryIds: ids,
        assessmentSetId: (fd.get("assessmentSetId") as string) || null,
      });
      setShowCreate(false);
      setSelectedCategoryNames([]);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
    } finally { setSaving(false); }
  }

  async function onEdit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!editingCurriculum) return;
    setSaving(true);
    setError("");
    try {
      const fd = new FormData(e.currentTarget);
      const ids = categories.filter((c) => selectedCategoryNames.includes(c.name)).map((c) => c.id);
      await api.curriculums.update(editingCurriculum.id, {
        name: fd.get("name") as string,
        categoryIds: ids,
        assessmentSetId: (fd.get("assessmentSetId") as string) || null,
      });
      setShowEdit(false);
      setEditingCurriculum(null);
      setSelectedCategoryNames([]);
      onRefresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
    } finally { setSaving(false); }
  }

  function toggleCategory(name: string) {
    setSelectedCategoryNames((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name],
    );
  }

  function handleEditClick(c: Curriculum) {
    setEditingCurriculum(c);
    setSelectedCategoryNames(c.categories?.map((cc) => cc.category.name) ?? []);
    setError("");
    setShowEdit(true);
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-800">Kurikulum</h2>
          <span className="text-xs text-slate-400">{curriculums.length} total</span>
        </div>
        {curriculums.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm text-slate-400">Belum ada kurikulum</p>
          </div>
        ) : (
          <div className="mb-4 space-y-2">
            {curriculums.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => handleEditClick(c)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800">{c.name}</p>
                  <div className="mb-1 flex flex-wrap gap-1">
                    {c.categories?.map((cat) => (
                      <span key={cat.category.id} className="rounded-lg bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-700">
                        {CATEGORY_LABELS[cat?.category?.name] ?? cat?.category?.name ?? ""}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    {c.topics.length} topik
                    {c.assessmentSet && <> &middot; {c.assessmentSet.name}</>}
                  </p>
                </div>
                <svg className="ml-2 h-4 w-4 shrink-0 text-slate-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
                </svg>
              </button>
            ))}
          </div>
        )}

        <button onClick={() => { setShowCreate(true); setError(""); }}
          className="w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700"
        >
          + Tambah Kurikulum
        </button>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Tambah Kurikulum</h3>
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
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Kategori <span className="text-red-500">*</span></label>
                <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryNames.includes(cat.name);
                    return (
                      <button key={cat.id} type="button" onClick={() => toggleCategory(cat.name)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
                {selectedCategoryNames.length === 0 && <p className="mt-1 text-[10px] text-slate-400">Pilih minimal 1 kategori</p>}
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Set Penilaian</label>
                <select name="assessmentSetId"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Tanpa penilaian --</option>
                  {assessmentSets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
              <button type="submit" disabled={saving || selectedCategoryNames.length === 0}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {showEdit && editingCurriculum && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setShowEdit(false)} />
          <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Edit Kurikulum</h3>
              <button onClick={() => setShowEdit(false)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={onEdit}>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Nama</label>
                <input name="name" required defaultValue={editingCurriculum.name}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Kategori <span className="text-red-500">*</span></label>
                <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-2.5">
                  {categories.map((cat) => {
                    const isSelected = selectedCategoryNames.includes(cat.name);
                    return (
                      <button key={cat.id} type="button" onClick={() => toggleCategory(cat.name)}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white shadow-sm"
                            : "border border-slate-200 bg-white text-slate-600 hover:border-blue-300 hover:text-blue-700"
                        }`}
                      >
                        {cat.label}
                      </button>
                    );
                  })}
                </div>
                {selectedCategoryNames.length === 0 && <p className="mt-1 text-[10px] text-slate-400">Pilih minimal 1 kategori</p>}
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Set Penilaian</label>
                <select name="assessmentSetId" defaultValue={editingCurriculum.assessmentSetId ?? ""}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Tanpa penilaian --</option>
                  {assessmentSets.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              {error && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
              <button type="submit" disabled={saving || selectedCategoryNames.length === 0}
                className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
