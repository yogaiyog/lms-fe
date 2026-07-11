"use client";

import { type Class, type RequestClass } from "@/lib/api";
import { X } from "lucide-react";

type Props = {
  request: RequestClass;
  approveAction: "APPROVED" | "REJECTED";
  onApproveActionChange: (a: "APPROVED" | "REJECTED") => void;
  approveClassId: string;
  onApproveClassIdChange: (v: string) => void;
  adminNotes: string;
  onAdminNotesChange: (v: string) => void;
  approving: boolean;
  approveError: string;
  classes: Class[];
  onClose: () => void;
  onSubmit: () => void;
};

export default function ApproveRejectModal({
  request, approveAction, onApproveActionChange,
  approveClassId, onApproveClassIdChange,
  adminNotes, onAdminNotesChange,
  approving, approveError, classes,
  onClose, onSubmit,
}: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl border border-slate-200">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
            {approveAction === "APPROVED" ? "Setujui Request" : "Tolak Request"}
          </h2>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 text-sm text-slate-600 font-semibold">
          {request.student?.fullName} — {request.curriculum}
        </p>

        <div className="mb-4 flex gap-2">
          <button onClick={() => onApproveActionChange("APPROVED")}
            className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${approveAction === "APPROVED" ? "bg-emerald-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            Setujui
          </button>
          <button onClick={() => onApproveActionChange("REJECTED")}
            className={`flex-1 rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors ${approveAction === "REJECTED" ? "bg-red-500 text-white shadow-sm" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
            Tolak
          </button>
        </div>

        {approveAction === "APPROVED" && (
          <div className="mb-3">
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Assign ke Kelas</label>
            <select value={approveClassId} onChange={(e) => onApproveClassIdChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100" required
            >
              <option value="">-- Pilih kelas --</option>
              {classes.filter((c) => {
                const gradeMap: Record<string, string[]> = {
                  JUNIOR_I: ["Kelas 1", "Kelas 2", "Kelas 3"],
                  JUNIOR_II: ["Kelas 4", "Kelas 5", "Kelas 6"],
                  JUNIOR_III: ["Kelas 7", "Kelas 8", "Kelas 9"],
                };
                return gradeMap[request.category]?.includes(c.category?.name ?? "") && c.isActive;
              }).map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.tutors?.map((t) => t.fullName).join(", ")})</option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Catatan Admin</label>
          <textarea value={adminNotes} onChange={(e) => onAdminNotesChange(e.target.value)} rows={3}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        {approveError && <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{approveError}</div>}
        <button onClick={onSubmit} disabled={approving || (approveAction === "APPROVED" && !approveClassId)}
          className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          {approving ? <span className="inline-flex items-center gap-2"><span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> Memproses...</span> : "Simpan"}
        </button>
      </div>
    </div>
  );
}
