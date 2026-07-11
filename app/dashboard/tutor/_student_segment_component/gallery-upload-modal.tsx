"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, X } from "lucide-react";
import { api, uploadImage } from "@/lib/api";
import type { Theme } from "./types";

type Props = {
  open: boolean;
  studentId: string;
  theme: Theme;
  onClose: () => void;
};

export default function GalleryUploadModal({ open, studentId, theme, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!open) return null;

  function reset() { setFile(null); setCaption(""); setError(""); setSuccess(""); }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className={`relative w-full max-w-md rounded-t-3xl ${theme.card} p-6 shadow-2xl sm:rounded-3xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className={`text-lg font-extrabold ${theme.text}`}>Upload Gallery</h2>
          <button onClick={() => { reset(); onClose(); }} className={`rounded-xl p-1.5 ${theme.textMuted} hover:bg-blue-50 hover:text-blue-600`}>
            <X size={20} />
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="text-sm font-semibold text-green-700">Gambar berhasil diupload!</p>
            <div className="mt-4 flex items-center justify-center gap-3">
              <button onClick={() => { reset(); }}
                className="rounded-xl bg-blue-100 px-4 py-2 text-sm font-bold text-blue-700 hover:bg-blue-200 transition">
                Upload Lagi
              </button>
              <button onClick={() => { reset(); onClose(); }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 transition">
                Tutup
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault();
            if (!file) return;
            setUploading(true);
            setError("");
            try {
              const uploaded = await uploadImage(file, "general", studentId);
              await api.galleries.create({
                studentId,
                imageUrl: uploaded.url,
                caption: caption || undefined,
              });
              setSuccess("Gambar berhasil diupload!");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Upload gagal");
            } finally {
              setUploading(false);
            }
          }} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Pilih Gambar</label>
              <div onClick={() => fileInputRef.current?.click()}
                className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 p-8 transition hover:border-blue-400 hover:bg-blue-50">
                {file ? (
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <>
                    <Camera size={36} className="text-slate-400" />
                    <p className="mt-2 text-sm font-semibold text-slate-500">Klik untuk pilih gambar</p>
                    <p className="text-xs text-slate-400">JPG, PNG, WebP</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">Keterangan <span className="text-slate-400">(opsional)</span></label>
              <input value={caption} onChange={(e) => setCaption(e.target.value)}
                placeholder="Misal: Project hari ini..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            {error && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
            <button type="submit" disabled={!file || uploading}
              className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition">
              {uploading ? (
                <span className="inline-flex items-center gap-2"><Loader2 size={18} className="animate-spin" /> Mengupload...</span>
              ) : "Upload"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
