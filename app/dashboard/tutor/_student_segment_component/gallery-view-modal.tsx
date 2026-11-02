"use client";

import { Button, Modal } from "@/components/ui";
import { useEffect, useState } from "react";
import { Trash2, Save, Camera, Pencil, Loader2 } from "lucide-react";
import { api, type Gallery } from "@/lib/api";
import type { Theme } from "./types";
import GalleryUploadModal from "./gallery-upload-modal";

type Props = {
  open: boolean;
  studentId: string;
  theme: Theme;
  onClose: () => void;
};

export default function GalleryViewModal({ open, studentId, theme, onClose }: Props) {
  const [items, setItems] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCaption, setEditCaption] = useState("");
  const [saving, setSaving] = useState(false);

  async function fetchItems() {
    setLoading(true);
    try {
      const list = await api.galleries.listByStudent(studentId);
      setItems(list);
    } catch {} finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) fetchItems();
  }, [open, studentId]);

  async function handleSaveCaption(id: string) {
    setSaving(true);
    try {
      await api.galleries.update(id, { caption: editCaption || undefined });
      setItems((prev) => prev.map((g) => g.id === id ? { ...g, caption: editCaption } : g));
      setEditingId(null);
    } catch {} finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus gambar ini?")) return;
    try {
      await api.galleries.delete(id);
      setItems((prev) => prev.filter((g) => g.id !== id));
    } catch {}
  }

  if (!open) return null;

  return (
    <>
      <Modal open onClose={onClose} title="Gallery Siswa" size="lg">

          <button onClick={() => setShowUpload(true)}
            className="mb-4 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white hover:bg-emerald-700 transition">
            <Camera size={16} /> Upload Gambar
          </button>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 size={24} className="animate-spin text-slate-400" />
            </div>
          ) : items.length === 0 ? (
            <div className="py-12 text-center">
              <p className={`text-sm ${theme.textMuted}`}>Belum ada gambar</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item) => (
                <div key={item.id} className="group relative rounded-2xl border border-slate-200 overflow-hidden bg-white">
                  <img src={item.imageUrl} alt={item.caption ?? ""}
                    className="h-40 w-full object-cover" />
                  <div className="p-2">
                    {editingId === item.id ? (
                      <div className="space-y-1">
                        <input value={editCaption} onChange={(e) => setEditCaption(e.target.value)}
                          className="w-full rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-primary-400" />
                        <div className="flex gap-1">
                          <Button type="submit" onClick={() => handleSaveCaption(item.id)} disabled={saving} className="text-[10px]">
                            <Save size={10} /> Simpan
                          </Button>
                          <button onClick={() => setEditingId(null)}
                            className="rounded-lg bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            Batal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-[11px] text-slate-600 truncate flex-1">{item.caption ?? "—"}</p>
                        <button onClick={() => { setEditingId(item.id); setEditCaption(item.caption ?? ""); }}
                          className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-primary-600">
                          <Pencil size={11} />
                        </button>
                        <button onClick={() => handleDelete(item.id)}
                          className="shrink-0 rounded-lg p-1 text-slate-400 hover:bg-red-50 hover:text-red-600">
                          <Trash2 size={11} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
      </Modal>

      <GalleryUploadModal
        open={showUpload}
        studentId={studentId}
        theme={theme}
        onClose={() => { setShowUpload(false); fetchItems(); }}
      />
    </>
  );
}
