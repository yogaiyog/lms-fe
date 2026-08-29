"use client";

import { useCallback, useEffect, useState } from "react";
import { DollarSign, RefreshCw, Edit2, Check, X, Layers, AlertCircle, Plus } from "lucide-react";
import { api } from "@/lib/api";
import { formatIDR } from "./InvoiceList";

type TutorCostItem = {
  id: string;
  classType: string;
  cost: number;
  description?: string | null;
};

const TYPE_LABELS: Record<string, string> = {
  TRIAL: "Trial",
  BATCH810: "Batch 8-10",
  BATCH35: "Batch 3-5",
  PRIVATE: "Private",
  MAKEUP: "Make Up",
};

const TYPE_BADGE_STYLES: Record<string, { border: string; bg: string; text: string }> = {
  TRIAL: { border: "border-slate-200", bg: "bg-slate-50", text: "text-slate-700" },
  BATCH810: { border: "border-emerald-100", bg: "bg-emerald-50", text: "text-emerald-700" },
  BATCH35: { border: "border-teal-100", bg: "bg-teal-50", text: "text-teal-700" },
  PRIVATE: { border: "border-indigo-100", bg: "bg-indigo-50", text: "text-indigo-700" },
  MAKEUP: { border: "border-amber-100", bg: "bg-amber-50", text: "text-amber-700" },
};

const DEFAULT_ITEMS = [
  { classType: "TRIAL", cost: 12000, description: "Biaya honor tutor untuk sesi kelas Trial" },
  { classType: "BATCH810", cost: 20000, description: "Biaya honor tutor untuk kelas Batch kapasitas 8-10 siswa" },
  { classType: "BATCH35", cost: 20000, description: "Biaya honor tutor untuk kelas Batch kapasitas 3-5 siswa" },
  { classType: "PRIVATE", cost: 30000, description: "Biaya honor tutor untuk sesi kelas Private (1 siswa)" },
  { classType: "MAKEUP", cost: 20000, description: "Biaya honor tutor untuk sesi kelas Make Up" },
];

export default function SetTutorCost() {
  const [items, setItems] = useState<TutorCostItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCost, setEditCost] = useState<number>(0);
  const [editDescription, setEditDescription] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const fetchCosts = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.tutorCosts.list();
      setItems(data.map((d) => ({ ...d, cost: Number(d.cost) })));
    } catch (err: any) {
      setError(err?.message || "Gagal memuat tarif tutor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCosts();
  }, [fetchCosts]);

  const handleStartEdit = (item: TutorCostItem) => {
    setEditingId(item.id);
    setEditCost(item.cost);
    setEditDescription(item.description ?? "");
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCost(0);
    setEditDescription("");
  };

  const handleSaveEdit = async (id: string) => {
    if (editCost < 0) return;
    setSaving(true);
    try {
      await api.tutorCosts.update(id, {
        cost: editCost,
        description: editDescription || null,
      });
      setEditingId(null);
      await fetchCosts();
    } catch (err: any) {
      alert(err?.message || "Gagal menyimpan tarif tutor");
    } finally {
      setSaving(false);
    }
  };

  const handleInitializeDefaults = async () => {
    if (items.length > 0 && !confirm("Inisialisasi ulang konfigurasi default tarif tutor?")) {
      return;
    }
    setInitializing(true);
    try {
      for (const def of DEFAULT_ITEMS) {
        const existing = items.find((it) => it.classType === def.classType);
        if (existing) {
          await api.tutorCosts.update(existing.id, { cost: def.cost, description: def.description });
        } else {
          await api.tutorCosts.create(def);
        }
      }
      await fetchCosts();
    } catch (err: any) {
      alert(err?.message || "Gagal menginisialisasi default tarif");
    } finally {
      setInitializing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Set Tutor Cost (Tarif Honor Tutor)</h2>
          <p className="text-xs text-slate-500 mt-1">
            Konfigurasi besaran honor tutor per kehadiran/pertemuan berdasarkan tipe kelas yang diajar.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {items.length === 0 && (
            <button
              onClick={handleInitializeDefaults}
              disabled={initializing}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition"
            >
              <Plus size={14} />
              {initializing ? "Menginisialisasi..." : "Inisialisasi Tarif Default"}
            </button>
          )}
          <button
            onClick={fetchCosts}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm hover:bg-slate-50 disabled:opacity-50 transition"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(items.length > 0 ? items : DEFAULT_ITEMS.map((d, i) => ({ ...d, id: `preview-${i}` }))).map((item) => {
          const style = TYPE_BADGE_STYLES[item.classType] ?? {
            border: "border-slate-200",
            bg: "bg-slate-50",
            text: "text-slate-700",
          };
          return (
            <div
              key={item.classType}
              className={`rounded-3xl border ${style.border} ${style.bg} p-5 transition hover:shadow-md`}
            >
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${style.text} bg-white/70 border ${style.border}`}>
                  {TYPE_LABELS[item.classType] ?? item.classType}
                </span>
                <span className="text-[10px] font-semibold text-slate-400">per pertemuan</span>
              </div>
              <div className="mt-3 text-2xl font-black tracking-tight text-slate-900">
                {formatIDR(item.cost)}
              </div>
              <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">
                {item.description || "Tidak ada deskripsi"}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Table */}
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-blue-600" />
            <h3 className="text-sm font-extrabold text-slate-800">Daftar Pengaturan Tarif Tutor</h3>
          </div>
          <span className="text-xs text-slate-400 font-medium">{items.length} tipe terdaftar</span>
        </div>

        {error && (
          <div className="m-4 flex items-center gap-2 rounded-2xl bg-red-50 p-3 text-xs text-red-700 border border-red-100">
            <AlertCircle size={16} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Tipe Kelas</th>
                <th className="px-6 py-3.5">Tarif Honor (per kehadiran)</th>
                <th className="px-6 py-3.5">Deskripsi</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading && items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
                    <p>Memuat tarif tutor...</p>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-400">
                    Belum ada data tarif. Klik tombol{" "}
                    <button
                      onClick={handleInitializeDefaults}
                      className="font-bold text-blue-600 underline"
                    >
                      Inisialisasi Tarif Default
                    </button>
                    .
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const isEditing = editingId === item.id;
                  const style = TYPE_BADGE_STYLES[item.classType] ?? {
                    border: "border-slate-200",
                    bg: "bg-slate-50",
                    text: "text-slate-700",
                  };
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-semibold">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold border ${style.border} ${style.bg} ${style.text}`}>
                          {TYPE_LABELS[item.classType] ?? item.classType}
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 font-mono">
                          {item.classType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {isEditing ? (
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-400 font-semibold">Rp</span>
                            <input
                              type="number"
                              min={0}
                              step={1000}
                              value={editCost}
                              onChange={(e) => setEditCost(Math.max(0, Number(e.target.value)))}
                              className="w-36 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                              autoFocus
                            />
                          </div>
                        ) : (
                          <span className="text-sm font-extrabold text-slate-900">
                            {formatIDR(item.cost)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 max-w-xs">
                        {isEditing ? (
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Deskripsi tarif..."
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        ) : (
                          <span className="text-slate-500 text-xs">
                            {item.description || "—"}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              disabled={saving}
                              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition"
                            >
                              <Check size={14} />
                              Simpan
                            </button>
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              disabled={saving}
                              className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100 transition"
                            >
                              <X size={14} />
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleStartEdit(item)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition shadow-sm"
                          >
                            <Edit2 size={13} />
                            Ubah Tarif
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
