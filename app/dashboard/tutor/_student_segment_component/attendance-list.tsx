"use client";

import { useState } from "react";
import { Edit2, Save, Calendar } from "lucide-react";
import type { Theme, AttendanceWithDetails } from "./types";
import { ATTENDANCE_LABELS } from "./components";
import { Card } from "./components";

export default function AttendanceList({
  attendances, theme, onSave,
}: {
  attendances: AttendanceWithDetails[];
  theme: Theme;
  onSave: (attendanceId: string, data: { status: string; notes: string | null }) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<{ status: string; notes: string }>({ status: "", notes: "" });

  async function handleSave(id: string) {
    await onSave(id, { status: form.status, notes: form.notes || null });
    setEditingId(null);
  }

  return (
    <Card theme={theme} className="p-6">
      <h3 className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${theme.text}`}>
        <Calendar size={14} /> Riwayat Absensi
      </h3>
      <div className="space-y-2 max-h-60 overflow-y-auto">
        {[...attendances].reverse().map((att) => {
          const isEditing = editingId === att.id;
          const info = ATTENDANCE_LABELS[att.status] ?? { label: att.status, color: "text-slate-600 bg-slate-100", icon: Edit2 };
          const Icon = info.icon;

          if (isEditing) {
            return (
              <div key={att.id} className={`rounded-xl px-3 py-2.5 ${theme.dark ? "bg-slate-800" : "bg-slate-50"} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${theme.text}`}>
                    {new Date(att.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <button onClick={() => handleSave(att.id)} className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                    <Save size={12} /> Simpan
                  </button>
                </div>
                <select
                  value={form.status || att.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className={`w-full px-2 py-1 rounded-lg text-sm ${theme.dark ? "bg-slate-700 text-white" : "bg-white text-black"} border ${theme.border}`}
                >
                  {Object.entries(ATTENDANCE_LABELS).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
                <textarea
                  value={form.notes || att.notes || ""}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Catatan..."
                  className={`w-full px-2 py-1 rounded-lg text-sm ${theme.dark ? "bg-slate-700 text-white" : "bg-white text-black"} border ${theme.border}`}
                  rows={2}
                />
              </div>
            );
          }

          return (
            <div key={att.id} className={`rounded-xl px-3 py-2.5 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${info.color}`}>
                    <Icon size={10} /> {info.label}
                  </span>
                  <span className={`text-xs ${theme.textMuted}`}>
                    {new Date(att.date).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  </span>
                </div>
                <button
                  onClick={() => { setEditingId(att.id); setForm({ status: att.status, notes: att.notes || "" }); }}
                  className="text-xs text-blue-600 flex items-center gap-1"
                >
                  <Edit2 size={12} /> Edit
                </button>
              </div>
              {att.schedule?.topic && (
                <div className="ml-2 mt-1">
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-0.5 text-[9px] font-semibold text-blue-700">
                    {att.schedule.topic}
                  </span>
                </div>
              )}
              {att.notes && (
                <div className="ml-2">
                  <span className={`text-xs font-bold mr-1 ${theme.textMuted}`}>Catatan:</span>
                  <span className={`text-[10px] mt-1 ${theme.textMuted}`}>{att.notes}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
