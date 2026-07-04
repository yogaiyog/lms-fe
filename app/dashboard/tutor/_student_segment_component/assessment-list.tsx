"use client";

import { useState } from "react";
import { Edit2, Save, Percent } from "lucide-react";
import type { Theme, AssessmentSummary } from "./types";
import { Card } from "./components";

export default function AssessmentList({
  assessments, theme, onSave,
}: {
  assessments: AssessmentSummary[];
  theme: Theme;
  onSave: (index: number, data: { percentage: number; comment: string | null; scores: { id: string; score: number; notes: string | null }[] }) => Promise<void>;
}) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [form, setForm] = useState<{ percentage: number; comment: string; scores: { id: string; score: number; notes: string | null }[] }>({ percentage: 0, comment: "", scores: [] });

  async function handleSave(i: number) {
    await onSave(i, { percentage: form.percentage, comment: form.comment || null, scores: form.scores });
    setEditingIndex(null);
  }

  return (
    <Card theme={theme} className="p-6">
      <h3 className={`text-sm font-bold mb-2 flex items-center gap-1.5 ${theme.text}`}>
        <Percent size={14} /> Penilaian
      </h3>
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {assessments.map((a, i) => {
          const isEditing = editingIndex === i;

          if (isEditing) {
            return (
              <div key={i} className={`rounded-xl px-3 py-2.5 ${theme.dark ? "bg-slate-800" : "bg-slate-50"} space-y-2`}>
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${theme.text}`}>
                    {new Date(a.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                  <button onClick={() => handleSave(i)} className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                    <Save size={12} /> Simpan
                  </button>
                </div>
                <input
                  type="number"
                  value={form.percentage || a.percentage}
                  onChange={(e) => setForm({ ...form, percentage: Number(e.target.value) })}
                  className={`w-full px-2 py-1 rounded-lg text-sm ${theme.dark ? "bg-slate-700 text-white" : "bg-white text-black"} border ${theme.border}`}
                  min="0" max="100"
                  placeholder="Persentase"
                />
                {a.scores.length > 0 && (
                  <div className="space-y-1">
                    {form.scores.map((score, si) => (
                      <div key={si} className="flex items-center gap-2">
                        <span className={`text-[10px] ${theme.textMuted}`}>Aspek {si + 1}:</span>
                        <input
                          type="number"
                          value={score.score}
                          onChange={(e) => {
                            const newScores = [...form.scores];
                            newScores[si] = { ...score, score: Number(e.target.value) };
                            setForm({ ...form, scores: newScores });
                          }}
                          className={`w-16 px-2 py-1 rounded-lg text-sm ${theme.dark ? "bg-slate-700 text-white" : "bg-white text-black"} border ${theme.border}`}
                          min="0" max="5"
                        />
                      </div>
                    ))}
                  </div>
                )}
                <textarea
                  value={form.comment || a.comment}
                  onChange={(e) => setForm({ ...form, comment: e.target.value })}
                  placeholder="Komentar mentor..."
                  className={`w-full px-2 py-1 rounded-lg text-sm ${theme.dark ? "bg-slate-700 text-white" : "bg-white text-black"} border ${theme.border}`}
                  rows={3}
                />
              </div>
            );
          }

          return (
            <div key={i} className={`rounded-xl px-3 py-2.5 ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-bold ${theme.text}`}>
                  {new Date(a.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-extrabold ${a.percentage >= 70 ? "text-emerald-600" : a.percentage >= 50 ? "text-amber-600" : "text-red-600"}`}>
                    {a.percentage}%
                  </span>
                  <button
                    onClick={() => {
                      setEditingIndex(i);
                      setForm({
                        percentage: a.percentage,
                        comment: a.comment,
                        scores: a.scores.map(s => ({ id: s.id, score: s.score, notes: s.notes ?? null })),
                      });
                    }}
                    className="text-xs text-blue-600 flex items-center gap-1"
                  >
                    <Edit2 size={12} /> Edit
                  </button>
                </div>
              </div>
              <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${a.percentage >= 70 ? "bg-emerald-500" : a.percentage >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                  style={{ width: `${a.percentage}%` }}
                />
              </div>
              {a.scores.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {a.scores.map((s) => (
                    <span key={s.id} className="text-[9px] font-semibold text-slate-500">
                      {s.score}/{5}
                    </span>
                  ))}
                </div>
              )}
              {a.comment && (
                <p className={`mt-1 text-[10px] italic ${theme.textMuted}`}>{a.comment}</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
