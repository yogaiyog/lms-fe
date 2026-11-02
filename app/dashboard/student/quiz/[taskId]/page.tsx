"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type QuizAnswerResult, type QuizData, type QuizSubmitResult } from "@/lib/api";
import Blocks3Renderer from "@/components/Blocks3Renderer";
import { parseMixedContent } from "@/lib/parseMixedContent";

const COMPANY = process.env.NEXT_PUBLIC_COMPANY_NAME || "JuaraKu";

const LABELS = ["a", "b", "c", "d", "e"];

function MixedContent({ text, className }: { text: string; className?: string }) {
  const segments = parseMixedContent(text);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === "text" ? (
          <span key={i}>{seg.content}</span>
        ) : (
          <Blocks3Renderer key={i} code={seg.code} />
        )
      )}
    </span>
  );
}

export default function QuizPage() {
  const params = useParams();
  const taskCode = params.taskId as string;

  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submittingProgress, setSubmittingProgress] = useState(false);
  // Hasil penilaian dari server untuk soal saat ini (kunci jawaban tidak dikirim ke siswa).
  const [answerResult, setAnswerResult] = useState<QuizAnswerResult | null>(null);
  const [checking, setChecking] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; choiceIndex: number }[]>([]);
  const [result, setResult] = useState<QuizSubmitResult | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api.quiz.fetchByTaskCode(taskCode);
        if (!cancelled) setQuiz(data);
      } catch (err) {
        if (!cancelled)
          setError(
            err instanceof Error ? err.message : "Gagal memuat quiz",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [taskCode]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-2xl px-6 pt-8">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-xl font-bold text-emerald-800 mb-2">Quiz Selesai!</h2>
            {result && (
              <p className="text-emerald-700 font-semibold mb-1">
                Benar {result.correct} dari {result.total} soal (nilai {result.score})
              </p>
            )}
            <p className="text-emerald-600 mb-6">
              {result?.saved === false ? "Mode pratinjau — progress tidak disimpan." : "Progress Anda telah tersimpan."}
            </p>
            <button
              onClick={() => window.close()}
              className="rounded-lg bg-slate-800 px-6 py-2 text-white transition-colors hover:bg-slate-700"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-2xl px-6 pt-8">
          <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center text-red-600">
            {error || "Quiz tidak ditemukan"}
          </div>
          <button
            onClick={() => window.close()}
            className="mx-auto mt-4 block px-6 py-2 text-sm text-slate-600 hover:text-slate-900"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleChoiceSelect = (index: number) => {
    if (submitted) return;
    setSelectedChoiceIndex(index);
  };

  const handleSubmit = async () => {
    if (selectedChoiceIndex === null) return;
    setChecking(true);
    setActionError(null);
    try {
      const res = await api.quiz.answer(taskCode, question.id, selectedChoiceIndex);
      setAnswerResult(res);
      setAnswers((prev) => [
        ...prev.filter((a) => a.questionId !== question.id),
        { questionId: question.id, choiceIndex: selectedChoiceIndex },
      ]);
      setSubmitted(true);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Gagal memeriksa jawaban");
    } finally {
      setChecking(false);
    }
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setSubmittingProgress(true);
      setActionError(null);
      try {
        setResult(await api.quiz.submit(taskCode, answers));
        setCompleted(true);
      } catch (err) {
        setActionError(err instanceof Error ? err.message : "Gagal menyimpan hasil quiz");
      } finally {
        setSubmittingProgress(false);
      }
      return;
    }
    setSubmitted(false);
    setAnswerResult(null);
    setSelectedChoiceIndex(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const isCorrect = answerResult?.isCorrect ?? false;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-2xl px-6 pt-6 pb-10">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold text-slate-600">
            Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}
          </h1>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Soal:
          </div>
          {question.imageUrl && (
            <div className="mb-4 flex justify-center">
              <img
                src={question.imageUrl}
                alt="Gambar soal"
                className="max-h-64 w-full rounded-lg object-contain"
                loading="lazy"
              />
            </div>
          )}
          <div className="mb-6 text-lg font-medium leading-relaxed">
            <MixedContent text={question.question} />
          </div>

          <div className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Jawaban:
          </div>
          <div className="space-y-3">
            {question.choices.map((choice, index) => {
              const isSelected = selectedChoiceIndex === index;
              const choiceIsCorrect = answerResult?.correctIndexes.includes(index) ?? false;
              const showCorrect = submitted && choiceIsCorrect;
              const showWrong = submitted && isSelected && !choiceIsCorrect;

              return (
                <button
                  key={index}
                  onClick={() => handleChoiceSelect(index)}
                  className={`w-full rounded-lg border p-4 text-left transition-colors ${
                    isSelected && !submitted
                      ? "border-primary-500 bg-primary-50"
                      : "border-slate-200"
                  } ${showCorrect ? "border-emerald-500 bg-emerald-50" : ""}
                    ${showWrong ? "border-red-500 bg-red-50" : ""}
                  `}
                >
                    <span className="inline-flex items-start gap-3">
                      <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        isSelected && !submitted
                          ? "bg-primary-600 text-white"
                          : showCorrect
                            ? "bg-emerald-600 text-white"
                            : showWrong
                              ? "bg-red-600 text-white"
                              : "bg-slate-100 text-slate-600"
                      }`}>
                        {LABELS[index] || index}
                      </span>
                      <span className="flex flex-col gap-2 pt-0.5">
                        {choice.imageUrl && (
                          <img
                            src={choice.imageUrl}
                            alt=""
                            className="max-h-24 w-full rounded object-contain border border-slate-200"
                            loading="lazy"
                          />
                        )}
                        {choice.content && <MixedContent text={choice.content} />}
                      </span>
                    </span>
                </button>
              );
            })}
          </div>

          {submitted && selectedChoiceIndex !== null && (
            <div
              className={`mt-4 rounded-lg p-4 ${
                isCorrect
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {answerResult?.feedback || (isCorrect ? "Benar!" : "Belum tepat.")}
            </div>
          )}

          {actionError && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{actionError}</div>
          )}

          <div className="mt-6 flex justify-end">
            {!submitted ? (
              <button
                onClick={handleSubmit}
                disabled={selectedChoiceIndex === null || checking}
                className="rounded-lg bg-slate-800 px-6 py-2 text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
              >
                {checking ? "Memeriksa..." : "Submit"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={submittingProgress}
                className="rounded-lg bg-slate-800 px-6 py-2 text-white transition-colors hover:bg-slate-700"
              >
                {isLastQuestion
                  ? submittingProgress
                    ? "Menyimpan..."
                    : "Selesai"
                  : "Lanjut"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-6 py-3.5">
        <img src="/logo.png" alt={COMPANY} className="h-8 w-auto object-contain" />
        <span className="text-sm font-extrabold text-slate-800">{COMPANY}</span>
        <span className="text-sm text-slate-300">/</span>
        <span className="text-sm font-semibold text-slate-500">Quiz</span>
      </div>
    </header>
  );
}
