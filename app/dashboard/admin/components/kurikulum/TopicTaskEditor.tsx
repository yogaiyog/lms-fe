"use client";

import { useState, useEffect, type FormEvent } from "react";
import { api, type TopicTask, type QuizQuestionData } from "@/lib/api";

type Props = {
  topicId: string;
};

type TaskWithQuiz = TopicTask & { quiz?: { id: string; questions: QuizQuestionData[] } | null };

const TASK_TYPE_LABELS: Record<string, string> = {
  SCRATCH: "Scratch",
  QUIZ: "Quiz",
  PYTHON: "Python",
};

export default function TopicTaskEditor({ topicId }: Props) {
  const [tasks, setTasks] = useState<TaskWithQuiz[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editCode, setEditCode] = useState("");
  const [editLabel, setEditLabel] = useState("");
  const [editType, setEditType] = useState<"SCRATCH" | "QUIZ" | "PYTHON">("SCRATCH");
  const [editUrl, setEditUrl] = useState("");
  const [editOrder, setEditOrder] = useState(0);
  const [editIsCapstone, setEditIsCapstone] = useState(false);
  const [editAutoComplete, setEditAutoComplete] = useState(false);
  const [editInstructions, setEditInstructions] = useState("");
  const [editDefaultCode, setEditDefaultCode] = useState("");

  const [quizQuestions, setQuizQuestions] = useState<QuizQuestionData[]>([]);
  const [quizLoading, setQuizLoading] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizSaving, setQuizSaving] = useState(false);
  const [quizQuestion, setQuizQuestion] = useState("");
  const [quizChoices, setQuizChoices] = useState<{ content: string; isCorrect: boolean; feedback: string }[]>([
    { content: "", isCorrect: true, feedback: "" },
    { content: "", isCorrect: false, feedback: "" },
  ]);
  const [editingQuizQuestionId, setEditingQuizQuestionId] = useState<string | null>(null);

  async function loadTasks() {
    setLoading(true);
    try {
      const data = await api.topicTasks.listByTopic(topicId);
      setTasks(data as TaskWithQuiz[]);
    } catch { setTasks([]); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadTasks(); }, [topicId]);

  function resetForm() {
    setEditCode("");
    setEditLabel("");
    setEditType("SCRATCH");
    setEditUrl("");
    setEditOrder(tasks.length);
    setEditIsCapstone(false);
    setEditAutoComplete(false);
    setEditInstructions("");
    setEditDefaultCode("");
  }

  function handleEditClick(task: TaskWithQuiz) {
    setEditTaskId(task.id);
    setEditCode(task.code);
    setEditLabel(task.label);
    setEditType(task.type);
    setEditUrl(task.url ?? "");
    setEditOrder(task.order);
    setEditIsCapstone(task.isCapstone);
    setEditAutoComplete(Boolean(task.autoComplete));
    setEditInstructions(task.instructions ?? "");
    setEditDefaultCode(task.defaultCode ?? "");
    setError("");
    setShowCreate(true);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editTaskId) {
        await api.topicTasks.update(editTaskId, {
          code: editCode,
          label: editLabel,
          type: editType,
          url: editUrl || null,
          order: editOrder,
          isCapstone: editIsCapstone,
          autoComplete: editAutoComplete,
          instructions: editInstructions || null,
          defaultCode: editDefaultCode || null,
        });
      } else {
        await api.topicTasks.create({
          topicId,
          code: editCode,
          label: editLabel,
          type: editType,
          url: editUrl || null,
          order: editOrder,
          isCapstone: editIsCapstone,
          autoComplete: editAutoComplete,
          instructions: editInstructions || null,
          defaultCode: editDefaultCode || null,
        });
      }
      setShowCreate(false);
      setEditTaskId(null);
      resetForm();
      await loadTasks();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal");
    } finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus task ini?")) return;
    try {
      await api.topicTasks.delete(id);
      await loadTasks();
    } catch {
      setError("Gagal menghapus task");
    }
  }

  async function loadQuizQuestions(taskCode: string) {
    setQuizLoading(true);
    try {
      const quiz = await api.quiz.fetchByTaskCode(taskCode);
      setQuizQuestions(quiz.questions);
    } catch { setQuizQuestions([]); }
    finally { setQuizLoading(false); }
  }

  function toggleExpand(task: TaskWithQuiz) {
    if (expandedTaskId === task.id) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(task.id);
      if (task.type === "QUIZ") {
        loadQuizQuestions(task.code);
      }
    }
  }

  function resetQuizForm() {
    setQuizQuestion("");
    setQuizChoices([
      { content: "", isCorrect: true, feedback: "" },
      { content: "", isCorrect: false, feedback: "" },
    ]);
    setEditingQuizQuestionId(null);
  }

  function addChoice() {
    setQuizChoices((prev) => [...prev, { content: "", isCorrect: false, feedback: "" }]);
  }

  function removeChoice(index: number) {
    if (quizChoices.length <= 2) return;
    setQuizChoices((prev) => prev.filter((_, i) => i !== index));
  }

  function updateChoice(index: number, field: string, value: string | boolean) {
    setQuizChoices((prev) => prev.map((c, i) => {
      if (i !== index) return c;
      return { ...c, [field]: value };
    }));
  }

  async function handleSaveQuestion(taskCode: string) {
    if (!quizQuestion.trim() || quizChoices.some((c) => !c.content.trim())) return;
    setQuizSaving(true);
    try {
      if (editingQuizQuestionId) {
        await api.quiz.updateQuestion(taskCode, editingQuizQuestionId, {
          question: quizQuestion,
          choices: quizChoices.map((c) => ({ ...c, imageUrl: undefined })),
        });
      } else {
        await api.quiz.createQuestion(taskCode, {
          question: quizQuestion,
          choices: quizChoices.map((c) => ({ ...c, imageUrl: undefined })),
        });
      }
      resetQuizForm();
      setShowQuizForm(false);
      await loadQuizQuestions(taskCode);
    } catch {
      setError("Gagal menyimpan soal");
    } finally { setQuizSaving(false); }
  }

  async function handleDeleteQuestion(taskCode: string, questionId: string) {
    if (!confirm("Hapus soal ini?")) return;
    try {
      await api.quiz.deleteQuestion(taskCode, questionId);
      await loadQuizQuestions(taskCode);
    } catch {
      setError("Gagal menghapus soal");
    }
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Tasks ({tasks.length})</span>
        <button
          onClick={() => { setShowCreate(true); setEditTaskId(null); resetForm(); }}
          className="rounded-lg bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 transition hover:bg-emerald-100"
        >
          + Task
        </button>
      </div>

      {loading && <p className="py-2 text-xs text-slate-400">Memuat...</p>}

      {!loading && tasks.length === 0 && (
        <p className="py-2 text-xs text-slate-400">Belum ada task</p>
      )}

      {!loading && tasks.length > 0 && (
        <div className="mb-3 space-y-1">
          {[...tasks].sort((a, b) => a.order - b.order).map((task) => (
            <div key={task.id}>
              <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2">
                {task.type === "QUIZ" && (
                  <button onClick={() => toggleExpand(task)} className="shrink-0">
                    <svg
                      className={`h-3.5 w-3.5 text-slate-400 transition ${expandedTaskId === task.id ? "rotate-90" : ""}`}
                      fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-800">{task.label}. {task.code}</p>
                  <p className="text-[10px] text-slate-400">
                    <span className={`inline-block rounded-md px-1.5 py-0.5 text-[9px] font-bold ${
                      task.type === "SCRATCH" ? "bg-orange-100 text-orange-700" :
                      task.type === "QUIZ" ? "bg-purple-100 text-purple-700" :
                      "bg-blue-100 text-blue-700"
                    }`}>
                      {TASK_TYPE_LABELS[task.type]}
                    </span>
                    {task.isCapstone && (
                      <span className="ml-1 inline-block rounded-md bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-700">Capstone</span>
                    )}
                    {task.autoComplete && (
                      <span className="ml-1 inline-block rounded-md bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-700">⚡ Auto</span>
                    )}
                    <span className="ml-1">Order: {task.order}</span>
                  </p>
                </div>
                <button onClick={() => handleEditClick(task)}
                  className="shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-amber-50 hover:text-amber-500"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
                </button>
                <button onClick={() => handleDelete(task.id)}
                  className="shrink-0 rounded-lg p-1 text-slate-300 transition hover:bg-red-50 hover:text-red-500"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {expandedTaskId === task.id && task.type === "QUIZ" && (
                <div className="ml-6 mt-1 rounded-xl border border-purple-100 bg-purple-50/30 p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-purple-800">Soal Quiz ({quizQuestions.length})</span>
                    <button
                      onClick={() => { setShowQuizForm(true); resetQuizForm(); }}
                      className="rounded-lg bg-purple-600 px-2 py-0.5 text-[10px] font-bold text-white transition hover:bg-purple-700"
                    >
                      + Soal
                    </button>
                  </div>

                  {quizLoading && <p className="py-2 text-xs text-slate-400">Memuat...</p>}

                  {!quizLoading && showQuizForm && (
                    <div className="mb-2 rounded-lg border border-purple-200 bg-white p-2 text-xs">
                      <div className="mb-2">
                        <label className="mb-0.5 block font-semibold text-slate-600">Pertanyaan</label>
                        <textarea
                          value={quizQuestion}
                          onChange={(e) => setQuizQuestion(e.target.value)}
                          rows={2}
                          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-1.5 text-xs outline-none transition focus:border-purple-400"
                          placeholder="Tulis pertanyaan..."
                        />
                      </div>
                      <div className="mb-2">
                        <label className="mb-0.5 block font-semibold text-slate-600">Pilihan Jawaban</label>
                        {quizChoices.map((choice, i) => (
                          <div key={i} className="mb-1 flex items-center gap-1.5">
                            <input
                              type="radio"
                              name="correctChoice"
                              checked={choice.isCorrect}
                              onChange={() => {
                                setQuizChoices((prev) => prev.map((c, j) => ({ ...c, isCorrect: j === i })));
                              }}
                              className="h-3 w-3 accent-purple-600"
                            />
                            <input
                              value={choice.content}
                              onChange={(e) => updateChoice(i, "content", e.target.value)}
                              className="min-w-0 flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none transition focus:border-purple-400"
                              placeholder="Jawaban..."
                            />
                            <input
                              value={choice.feedback}
                              onChange={(e) => updateChoice(i, "feedback", e.target.value)}
                              className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none transition-all duration-200 focus:w-60 focus:border-purple-400"
                              placeholder="Feedback"
                            />
                            {quizChoices.length > 2 && (
                              <button onClick={() => removeChoice(i)}
                                className="shrink-0 text-slate-400 hover:text-red-500"
                              >
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            )}
                          </div>
                        ))}
                        <button onClick={addChoice}
                          className="mt-1 rounded-lg border border-dashed border-slate-300 px-2 py-0.5 text-[10px] text-slate-500 transition hover:border-purple-400 hover:text-purple-600"
                        >
                          + Tambah Pilihan
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setShowQuizForm(false); resetQuizForm(); }}
                          className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                        >
                          Batal
                        </button>
                        <button onClick={() => handleSaveQuestion(task.code)} disabled={quizSaving}
                          className="flex-1 rounded-lg bg-purple-600 px-2 py-1 text-xs font-bold text-white transition hover:bg-purple-700 disabled:opacity-50"
                        >
                          {quizSaving ? "..." : editingQuizQuestionId ? "Update Soal" : "Simpan Soal"}
                        </button>
                      </div>
                    </div>
                  )}

                  {!quizLoading && quizQuestions.length === 0 && !showQuizForm && (
                    <p className="py-2 text-xs text-slate-400">Belum ada soal</p>
                  )}

                  {!quizLoading && quizQuestions.length > 0 && (
                    <div className="space-y-1">
                      {quizQuestions.map((q, qi) => (
                        <div key={q.id} className="flex items-start gap-1.5 rounded-lg border border-slate-100 bg-white px-2 py-1.5">
                          <span className="mt-0.5 shrink-0 text-[10px] font-bold text-purple-500">{qi + 1}.</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-700">{q.question}</p>
                            <div className="mt-0.5 flex flex-wrap gap-1">
                              {Array.isArray(q.choices) ? (q.choices as any[]).map((c: any, ci: number) => (
                                <span key={ci} className={`rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${
                                  c.isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"
                                }`}>
                                  {c.content}
                                </span>
                              )) : (
                                <span className="text-[9px] text-slate-400">No choices</span>
                              )}
                            </div>
                          </div>
                          <div className="flex shrink-0 gap-0.5">
                            <button onClick={() => {
                              setEditingQuizQuestionId(q.id);
                              setQuizQuestion(q.question);
                              const choices = Array.isArray(q.choices) ? (q.choices as any[]).map((c: any) => ({
                                content: c.content ?? "",
                                isCorrect: c.isCorrect ?? false,
                                feedback: c.feedback ?? "",
                              })) : [{ content: "", isCorrect: true, feedback: "" }, { content: "", isCorrect: false, feedback: "" }];
                              setQuizChoices(choices);
                              setShowQuizForm(true);
                            }}
                              className="rounded p-0.5 text-slate-300 hover:text-amber-500"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                              </svg>
                            </button>
                            <button onClick={() => handleDeleteQuestion(task.code, q.id)}
                              className="rounded p-0.5 text-slate-300 hover:text-red-500"
                            >
                              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showCreate && (
        <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-3 text-sm">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">{editTaskId ? "Edit Task" : "Tambah Task"}</span>
          </div>
          <div className="mb-2 grid grid-cols-2 gap-2">
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-600">Code</label>
              <input value={editCode} onChange={(e) => setEditCode(e.target.value)} autoFocus
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400"
                placeholder="m1, capstone-motion, ..." />
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-600">Label</label>
              <input value={editLabel} onChange={(e) => setEditLabel(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400"
                placeholder="1, 2, Capstone" />
            </div>
          </div>
          <div className="mb-2 grid grid-cols-3 gap-2">
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-600">Tipe</label>
              <select value={editType} onChange={(e) => setEditType(e.target.value as "SCRATCH" | "QUIZ" | "PYTHON")}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400"
              >
                <option value="SCRATCH">Scratch</option>
                <option value="QUIZ">Quiz</option>
                <option value="PYTHON">Python</option>
              </select>
            </div>
            <div>
              <label className="mb-0.5 block text-xs font-semibold text-slate-600">Order</label>
              <input type="number" min={0} value={editOrder} onChange={(e) => setEditOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400" />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-1 text-xs">
                <input type="checkbox" checked={editIsCapstone} onChange={(e) => setEditIsCapstone(e.target.checked)}
                  className="rounded accent-blue-600" />
                <span className="font-semibold text-slate-600">Capstone</span>
              </label>
            </div>
          </div>
          <div className="mb-2 flex items-center gap-2">
            <label className="flex items-center gap-1 text-xs">
              <input type="checkbox" checked={editAutoComplete} onChange={(e) => setEditAutoComplete(e.target.checked)}
                className="rounded accent-blue-600" />
              <span className="font-semibold text-slate-600">Auto Complete</span>
            </label>
            <p className="text-[10px] text-slate-400">Klik task langsung menandai selesai (buka link, tanpa editor)</p>
          </div>
          <div className="mb-2">
            <label className="mb-0.5 block text-xs font-semibold text-slate-600">URL (opsional)</label>
            <input value={editUrl} onChange={(e) => setEditUrl(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400"
              placeholder="https://..." />
          </div>
          {(editType === "PYTHON" || editType === "SCRATCH") && (
            <>
              <div className="mb-2">
                <label className="mb-0.5 block text-xs font-semibold text-slate-600">Instruksi (markdown)</label>
                <textarea value={editInstructions} onChange={(e) => setEditInstructions(e.target.value)} rows={2}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs outline-none transition focus:border-blue-400" />
              </div>
              {editType === "PYTHON" && (
                <div className="mb-2">
                  <label className="mb-0.5 block text-xs font-semibold text-slate-600">Default Code</label>
                  <textarea value={editDefaultCode} onChange={(e) => setEditDefaultCode(e.target.value)} rows={3}
                    className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-xs outline-none transition focus:border-blue-400"
                    spellCheck={false} />
                </div>
              )}
            </>
          )}
          <div className="flex gap-2">
            <button onClick={() => { setShowCreate(false); setEditTaskId(null); resetForm(); }}
              className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Batal
            </button>
            <button onClick={handleCreate} disabled={!editCode.trim() || !editLabel.trim() || saving}
              className="flex-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {saving ? "..." : editTaskId ? "Update" : "Simpan"}
            </button>
          </div>
        </div>
      )}

      {error && <div className="rounded-lg bg-red-50 p-2 text-xs font-semibold text-red-700">{error}</div>}
    </div>
  );
}
