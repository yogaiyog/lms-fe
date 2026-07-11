"use client";

import { useState, useEffect, type FormEvent } from "react";
import * as LucideIcons from "lucide-react";
import { api, type AssessmentSet, type AssessmentAspect } from "@/lib/api";

type Props = {
  assessmentSets: AssessmentSet[];
  onRefresh: () => void;
};

export default function AssessmentSetManagement({ assessmentSets, onRefresh }: Props) {
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [detailSet, setDetailSet] = useState<AssessmentSet | null>(null);
  const [detailName, setDetailName] = useState("");
  const [detailDesc, setDetailDesc] = useState("");
  const [detailAspects, setDetailAspects] = useState<AssessmentAspect[]>([]);
  const [detailDirty, setDetailDirty] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [showAddAspect, setShowAddAspect] = useState(false);
  const [editingAspectId, setEditingAspectId] = useState<string | null>(null);
  const [aspectTitle, setAspectTitle] = useState("");
  const [aspectDesc, setAspectDesc] = useState("");
  const [aspectIcon, setAspectIcon] = useState("");
  const [aspectMin, setAspectMin] = useState(1);
  const [aspectMax, setAspectMax] = useState(5);
  const [aspectOrder, setAspectOrder] = useState(0);
  const [aspectSaving, setAspectSaving] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [editIconAspectId, setEditIconAspectId] = useState<string | null>(null);

  const ASPECT_ICONS = [
    "Star", "Trophy", "Award", "Brain", "Lightbulb", "Code2", "Puzzle",
    "Clock", "MessageCircle", "FolderCheck", "Users", "Presentation",
    "TrendingUp", "Palette", "Music", "PenLine", "Ruler", "Calculator",
    "Heart", "Zap", "Target", "Eye", "Feather", "Sparkles", "Flame",
    "Droplet", "Sun", "Moon", "Shield", "BookOpen", "Compass", "Crown",
    "Gem", "Key", "Link", "Lock", "Map", "Search", "Settings",
  ] as const;

  useEffect(() => {
    if (!detailSet) return;
    api.assessmentAspects.listBySet(detailSet.id).then(setDetailAspects).catch(() => {});
  }, [detailSet]);

  function openDetail(s: AssessmentSet) {
    setDetailSet(s);
    setDetailName(s.name);
    setDetailDesc(s.description ?? "");
    setDetailDirty(false);
    setDetailError("");
  }

  async function saveDetail() {
    if (!detailSet) return;
    setDetailSaving(true);
    setDetailError("");
    try {
      const updated = await api.assessmentSets.update(detailSet.id, {
        name: detailName,
        description: detailDesc || null,
      });
      setDetailSet(updated);
      setDetailDirty(false);
      onRefresh();
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Gagal");
    } finally { setDetailSaving(false); }
  }

  async function addAspect() {
    if (!detailSet || !aspectTitle.trim()) return;
    setAspectSaving(true);
    try {
      const created = await api.assessmentAspects.create({
        assessmentSetId: detailSet.id,
        title: aspectTitle.trim(),
        description: aspectDesc.trim() || null,
        icon: aspectIcon || null,
        minScore: aspectMin,
        maxScore: aspectMax,
        order: aspectOrder,
      });
      setDetailAspects((prev) => [...prev, created].sort((a, b) => a.order - b.order));
      resetAspectForm();
      setShowAddAspect(false);
    } catch {
      setDetailError("Gagal menambah aspek");
    } finally { setAspectSaving(false); }
  }

  async function updateAspect() {
    if (!editingAspectId || !aspectTitle.trim()) return;
    setAspectSaving(true);
    try {
      const updated = await api.assessmentAspects.update(editingAspectId, {
        title: aspectTitle.trim(),
        description: aspectDesc.trim() || null,
        icon: aspectIcon || null,
        minScore: aspectMin,
        maxScore: aspectMax,
        order: aspectOrder,
      });
      setDetailAspects((prev) => prev.map((a) => a.id === updated.id ? updated : a).sort((a, b) => a.order - b.order));
      resetAspectForm();
      setEditingAspectId(null);
      setShowAddAspect(false);
    } catch {
      setDetailError("Gagal mengupdate aspek");
    } finally { setAspectSaving(false); }
  }

  function resetAspectForm() {
    setAspectTitle("");
    setAspectDesc("");
    setAspectIcon("");
    setAspectMin(1);
    setAspectMax(5);
    setAspectOrder(0);
  }

  async function updateAspectIcon(aspect: AssessmentAspect, icon: string) {
    try {
      const updated = await api.assessmentAspects.update(aspect.id, { icon: icon || null });
      setDetailAspects((prev) => prev.map((a) => a.id === updated.id ? { ...a, icon: updated.icon } : a));
    } catch {
      setDetailError("Gagal mengupdate icon");
    }
    setEditIconAspectId(null);
  }

  async function deleteAspect(id: string) {
    if (!confirm("Hapus aspek ini?")) return;
    try {
      await api.assessmentAspects.delete(id);
      setDetailAspects((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setDetailError("Gagal menghapus aspek");
    }
  }

  function IconPreview({ icon, size = 16 }: { icon?: string | null; size?: number }) {
    if (!icon) return <span className="text-slate-300">—</span>;
    const LucideIcon = (LucideIcons as any)[icon];
    if (!LucideIcon) return <span className="text-slate-300">—</span>;
    return <LucideIcon size={size} />;
  }

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
              <button key={s.id} onClick={() => openDetail(s)}
                className="flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">{s.name}</p>
                  {s.description && <p className="mt-0.5 text-xs text-slate-400">{s.description}</p>}
                </div>
                <span className="shrink-0 rounded-full bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                  {s.aspects?.length ?? 0} aspek
                </span>
              </button>
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

      {detailSet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDetailSet(null)} />
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Detail Set Penilaian</h3>
              <button onClick={() => setDetailSet(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Nama</label>
              <input value={detailName} onChange={(e) => { setDetailName(e.target.value); setDetailDirty(true); }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Deskripsi</label>
              <textarea value={detailDesc} onChange={(e) => { setDetailDesc(e.target.value); setDetailDirty(true); }} rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="mb-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">Aspek ({detailAspects.length})</span>
                <button onClick={() => {
                  if (showAddAspect) { setShowAddAspect(false); setEditingAspectId(null); return; }
                  resetAspectForm();
                  setAspectOrder(detailAspects.length);
                  setEditingAspectId(null);
                  setShowAddAspect(true);
                }}
                  className="rounded-lg bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
                >
                  + Aspek
                </button>
              </div>

              {showAddAspect && (
                <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">{editingAspectId ? "Edit Aspek" : "Tambah Aspek"}</span>
                  </div>
                  <div className="mb-2">
                    <label className="mb-0.5 block text-xs font-semibold text-slate-600">Judul</label>
                    <input value={aspectTitle} onChange={(e) => setAspectTitle(e.target.value)} autoFocus
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400" />
                  </div>
                  <div className="mb-2">
                    <label className="mb-0.5 block text-xs font-semibold text-slate-600">Deskripsi</label>
                    <input value={aspectDesc} onChange={(e) => setAspectDesc(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400" />
                  </div>
                  <div className="mb-2">
                    <label className="mb-0.5 block text-xs font-semibold text-slate-600">Icon</label>
                    <div className="relative">
                      <button type="button" onClick={() => setShowIconPicker(true)}
                        className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition hover:border-blue-400"
                      >
                        {aspectIcon ? (
                          <><IconPreview icon={aspectIcon} size={16} /><span className="text-slate-700">{aspectIcon}</span></>
                        ) : (
                          <span className="text-slate-400">Pilih icon</span>
                        )}
                      </button>
                      {showIconPicker && (
                        <div className="absolute left-0 top-full z-50 mt-1 w-[320px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl">
                          <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-600">Pilih Icon</span>
                            <button onClick={() => { setShowIconPicker(false); setEditIconAspectId(null); }}
                              className="rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                            >
                              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <div className="flex max-h-48 flex-wrap gap-1 overflow-y-auto">
                            {ASPECT_ICONS.map((name) => {
                              const LucideIcon = (LucideIcons as any)[name];
                              if (!LucideIcon) return null;
                              return (
                                <button key={name} type="button" onClick={() => {
                                  if (editIconAspectId) {
                                    const aspect = detailAspects.find((a) => a.id === editIconAspectId);
                                    if (aspect) updateAspectIcon(aspect, name);
                                  } else {
                                    setAspectIcon(name);
                                  }
                                  setShowIconPicker(false);
                                  setEditIconAspectId(null);
                                }}
                                  className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs transition hover:bg-blue-100 ${
                                    (editIconAspectId ? detailAspects.find((a) => a.id === editIconAspectId)?.icon : aspectIcon) === name
                                      ? "bg-blue-100 text-blue-700 ring-2 ring-blue-300" : "text-slate-500 hover:text-slate-700"
                                  }`}
                                  title={name}
                                >
                                  <LucideIcon size={16} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mb-2 grid grid-cols-3 gap-2">
                    <div>
                      <label className="mb-0.5 block text-xs font-semibold text-slate-600">Min</label>
                      <input type="number" min={0} value={aspectMin} onChange={(e) => setAspectMin(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs font-semibold text-slate-600">Max</label>
                      <input type="number" min={1} value={aspectMax} onChange={(e) => setAspectMax(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400" />
                    </div>
                    <div>
                      <label className="mb-0.5 block text-xs font-semibold text-slate-600">Urutan</label>
                      <input type="number" min={0} value={aspectOrder} onChange={(e) => setAspectOrder(Number(e.target.value))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400" />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { resetAspectForm(); setEditingAspectId(null); setShowAddAspect(false); }}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button onClick={editingAspectId ? updateAspect : addAspect} disabled={!aspectTitle.trim() || aspectSaving}
                      className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
                    >
                      {aspectSaving ? "..." : editingAspectId ? "Update" : "Simpan"}
                    </button>
                  </div>
                </div>
              )}

              {detailAspects.length === 0 ? (
                <p className="text-xs text-slate-400">Belum ada aspek</p>
              ) : (
                <div className="space-y-1.5">
                  {detailAspects.map((a) => (
                    <div key={a.id} className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
                      <button onClick={() => { setEditIconAspectId(a.id); setShowIconPicker(true); }}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-blue-50 text-[10px] font-bold text-blue-700 transition hover:bg-blue-100"
                        title="Ganti icon"
                      >
                        <IconPreview icon={a.icon} size={14} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-slate-800">{a.title}</p>
                        <p className="text-[10px] text-slate-400">{a.description ?? "—"}</p>
                      </div>
                      <span className="shrink-0 text-[10px] text-slate-500">
                        {a.minScore}-{a.maxScore}
                      </span>
                      <button onClick={() => {
                        setEditingAspectId(a.id);
                        setAspectTitle(a.title);
                        setAspectDesc(a.description ?? "");
                        setAspectIcon(a.icon ?? "");
                        setAspectMin(a.minScore);
                        setAspectMax(a.maxScore);
                        setAspectOrder(a.order);
                        setShowAddAspect(true);
                      }}
                        className="shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-amber-50 hover:text-amber-500"
                        title="Edit aspek"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                      <button onClick={() => deleteAspect(a.id)}
                        className="shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {detailError && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{detailError}</div>}
            <button onClick={saveDetail} disabled={!detailDirty || detailSaving}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {detailSaving ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Simpan Perubahan"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
