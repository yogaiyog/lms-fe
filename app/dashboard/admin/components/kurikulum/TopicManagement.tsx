"use client";

import { useState, type FormEvent, useRef, useEffect } from "react";
import { api, uploadImage, images, type ImageRecord, type Curriculum, type Topic } from "@/lib/api";
import { RoadmapAvatar } from "@/components/roadmap";
import { CATEGORY_LABELS } from "../../constants";

type Props = {
  curriculums: Curriculum[];
};

function ImagePicker({
  onSelect,
  curriculumId,
}: {
  onSelect: (url: string) => void;
  curriculumId?: string | null;
}) {
  const [tab, setTab] = useState<"upload" | "gallery">("upload");
  const [gallery, setGallery] = useState<ImageRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (tab !== "gallery") return;
    setLoading(true);
    images.listByEntityType("topic").then(setGallery).catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const record = await uploadImage(file, "topic", curriculumId ?? undefined);
      onSelect(record.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex gap-1 rounded-xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setTab("upload")}
          className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${tab === "upload" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
        >
          Upload
        </button>
        <button
          type="button"
          onClick={() => setTab("gallery")}
          className={`flex-1 rounded-lg px-3 py-1.5 text-sm font-semibold transition ${tab === "gallery" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500"}`}
        >
          Gallery
        </button>
      </div>

      {tab === "upload" ? (
        <div className="flex gap-2">
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(e) => { if (e.target.files?.[0]) handleUpload(); }}
            className="min-w-0 flex-1 text-sm file:mr-3 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100" />
          {uploading && <span className="inline-block h-5 w-5 shrink-0 self-center animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />}
        </div>
      ) : (
        <div className="max-h-48 overflow-y-auto">
          {loading ? (
            <p className="py-4 text-center text-sm text-slate-400">Memuat...</p>
          ) : gallery.length === 0 ? (
            <p className="py-4 text-center text-sm text-slate-400">Belum ada gambar</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {gallery.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => onSelect(img.url)}
                  className="group relative aspect-square overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:border-blue-400 hover:shadow-md"
                >
                  <img src={img.url} alt="" className="h-full w-full object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                    <span className="rounded-lg bg-white/90 px-2 py-0.5 text-xs font-bold text-blue-700 opacity-0 transition group-hover:opacity-100">
                      Pilih
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TopicManagement({ curriculums }: Props) {
  const [selectedId, setSelectedId] = useState("");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [detailTopic, setDetailTopic] = useState<Topic | null>(null);
  const [detailDirty, setDetailDirty] = useState(false);
  const [detailSaving, setDetailSaving] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [materialViewTopic, setMaterialViewTopic] = useState<Topic | null>(null);

  const [createCurriculumId, setCreateCurriculumId] = useState("");

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

      const hiddenImage = e.currentTarget.querySelector<HTMLInputElement>("[name=imageUrl]");
      const imageUrl = hiddenImage?.value || null;

      await api.topics.create({
        curriculumId,
        title: fd.get("title") as string,
        imageUrl,
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

  async function saveDetail() {
    if (!detailTopic) return;
    setDetailSaving(true);
    setDetailError("");
    try {
      const updated = await api.topics.update(detailTopic.id, {
        title: detailTopic.title,
        imageUrl: detailTopic.imageUrl ?? null,
        goals: detailTopic.goals ?? null,
        materialLink: detailTopic.materialLink ?? null,
        exampleProjectLink: detailTopic.exampleProjectLink ?? null,
        tools: detailTopic.tools ?? null,
      });
      setTopics((prev) => prev.map((t) => t.id === updated.id ? updated : t));
      setDetailTopic(updated);
      setDetailDirty(false);
    } catch (err) {
      setDetailError(err instanceof Error ? err.message : "Gagal");
    } finally { setDetailSaving(false); }
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="p-4">
        <h2 className="mb-4 text-lg font-bold text-slate-800">Topik</h2>

        <select value={selectedId} onChange={(e) => { setSelectedId(e.target.value); loadTopics(e.target.value); }}
          className="mb-4 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">-- Pilih Kurikulum (opsional) --</option>
          {curriculums.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.categories?.map((cat) => CATEGORY_LABELS[cat.category.name] ?? cat.category.name).join(", ") ?? ""})</option>
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
              <button key={t.id} onClick={() => { setDetailTopic(t); setDetailDirty(false); setDetailError(""); }}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50"
              >
                <RoadmapAvatar
                  label={t.title}
                  imageUrl={t.imageUrl}
                  fallbackSeed={t.id}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-sm shadow-sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">{t.title}</p>
                  {t.goals && <p className="text-xs text-slate-400 truncate">{t.goals}</p>}
                </div>
                <span className="shrink-0 text-[10px] text-slate-400">{t.tools ?? "—"}</span>
              </button>
            ))}
          </div>
        )}

        <button onClick={() => { setShowCreate(true); setError(""); setCreateCurriculumId(selectedId); }}
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
                <select name="curriculumId" defaultValue={createCurriculumId}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="">-- Tanpa kurikulum --</option>
                  {curriculums.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({c.categories?.map((cat) => CATEGORY_LABELS[cat.category.name] ?? cat.category.name).join(", ") ?? ""})</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Judul</label>
                <input name="title" required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-semibold text-slate-700">Gambar</label>
                <input type="hidden" name="imageUrl" />
                <ImagePicker
                  curriculumId={createCurriculumId}
                  onSelect={(url) => {
                    const input = document.querySelector<HTMLInputElement>("[name=imageUrl]");
                    if (input) input.value = url;
                  }}
                />
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

      {materialViewTopic && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
          <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h3 className="text-lg font-bold text-slate-800">Materi: {materialViewTopic.title}</h3>
              <button onClick={() => setMaterialViewTopic(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-2">
              <iframe
                src={materialViewTopic.materialLink ?? ""}
                width="100%"
                height="700"
                allowFullScreen
                className="rounded-2xl"
              />
          </div>
          </div>
        </div>
      )}

      {detailTopic && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDetailTopic(null)} />
          <div className="relative w-full max-w-lg rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl overflow-y-auto max-h-[90vh]">
            <div className="p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Detail Topik</h3>
              <button onClick={() => setDetailTopic(null)} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>

            <div className="mb-3">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Judul</label>
              <input value={detailTopic.title} onChange={(e) => { setDetailTopic({ ...detailTopic, title: e.target.value }); setDetailDirty(true); }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Gambar</label>
              <ImagePicker
                curriculumId={detailTopic.curriculumId}
                onSelect={(url) => {
                  setDetailTopic({ ...detailTopic, imageUrl: url });
                  setDetailDirty(true);
                }}
              />
              <div className="mt-2 flex gap-2">
                {detailTopic.imageUrl && (
                  <button type="button" onClick={() => { setDetailTopic({ ...detailTopic, imageUrl: null }); setDetailDirty(true); }}
                    className="rounded-xl border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50">
                    Hapus Gambar
                  </button>
                )}
              </div>
              {detailTopic.imageUrl?.trim() ? (
                <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-slate-50">
                  <div className="relative flex items-center justify-center bg-white p-4">
                    <img
                      src={detailTopic.imageUrl}
                      alt=""
                      className="max-h-48 w-full rounded-lg object-contain"
                    />
                  </div>
                  <div className="border-t border-slate-100 px-4 py-2">
                    <p className="text-xs font-semibold text-slate-500">Preview Gambar</p>
                  </div>
                </div>
              ) : (
                <div className="mt-3 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <RoadmapAvatar
                    label={detailTopic.title}
                    imageUrl={detailTopic.imageUrl}
                    fallbackSeed={detailTopic.id}
                    className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-xl shadow-sm"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-700">Preview</p>
                    <p className="truncate text-xs text-slate-400">
                      Emoji fallback akan dipakai kalau kosong
                    </p>
          </div>
          </div>
        )}
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Tujuan</label>
              <textarea value={detailTopic.goals ?? ""} onChange={(e) => { setDetailTopic({ ...detailTopic, goals: e.target.value || null }); setDetailDirty(true); }} rows={3}
                className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Link Materi</label>
              <div className="flex gap-2">
                <input type="url" value={detailTopic.materialLink ?? ""} onChange={(e) => { setDetailTopic({ ...detailTopic, materialLink: e.target.value || null }); setDetailDirty(true); }}
                  className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                {detailTopic.materialLink && (
                  <button onClick={() => setMaterialViewTopic(detailTopic)}
                    className="shrink-0 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700">
                    Lihat
                  </button>
                )}
              </div>
            </div>
            <div className="mb-3">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Link Project</label>
              <input type="url" value={detailTopic.exampleProjectLink ?? ""} onChange={(e) => { setDetailTopic({ ...detailTopic, exampleProjectLink: e.target.value || null }); setDetailDirty(true); }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-semibold text-slate-700">Tools</label>
              <input value={detailTopic.tools ?? ""} onChange={(e) => { setDetailTopic({ ...detailTopic, tools: e.target.value || null }); setDetailDirty(true); }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>

            {detailError && <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{detailError}</div>}
            <button onClick={saveDetail} disabled={!detailDirty || detailSaving}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {detailSaving ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Simpan Perubahan"}
            </button>
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
