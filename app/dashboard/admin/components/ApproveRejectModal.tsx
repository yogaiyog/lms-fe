"use client";

import { type Class, type RequestClass } from "@/lib/api";
import { STATUS_LABELS } from "../constants";

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
      <div className="relative w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-800">
            {approveAction === "APPROVED" ? "Setujui Request" : "Tolak Request"}
          </h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-3 text-sm text-gray-600">
          {request.student?.fullName} — {request.curriculum}
        </p>

        <div className="mb-4 flex gap-2">
          <button onClick={() => onApproveActionChange("APPROVED")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${approveAction === "APPROVED" ? "bg-tea-green-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            Setujui
          </button>
          <button onClick={() => onApproveActionChange("REJECTED")}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${approveAction === "REJECTED" ? "bg-berry-lipstick-500 text-white" : "bg-gray-100 text-gray-600"}`}>
            Tolak
          </button>
        </div>

        {approveAction === "APPROVED" && (
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700">Assign ke Kelas</label>
            <select value={approveClassId} onChange={(e) => onApproveClassIdChange(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400" required
            >
              <option value="">-- Pilih kelas --</option>
              {classes.filter((c) => c.category === request.category && c.isActive).map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.tutor?.fullName})</option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-4">
          <label className="mb-1 block text-sm font-medium text-gray-700">Catatan Admin</label>
          <textarea value={adminNotes} onChange={(e) => onAdminNotesChange(e.target.value)} rows={3}
            className="w-full resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none focus:border-dark-amethyst-400"
          />
        </div>

        {approveError && <div className="mb-4 rounded-lg bg-berry-lipstick-50 p-3 text-sm text-berry-lipstick-600">{approveError}</div>}
        <button onClick={onSubmit} disabled={approving || (approveAction === "APPROVED" && !approveClassId)}
          className="w-full rounded-xl bg-dark-amethyst-500 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-dark-amethyst-600 disabled:opacity-50"
        >
          {approving ? <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" /> : "Simpan"}
        </button>
      </div>
    </div>
  );
}
