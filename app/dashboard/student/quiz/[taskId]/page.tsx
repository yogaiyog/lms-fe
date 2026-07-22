"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, getStoredSession, type QuizData } from "@/lib/api";
import Blocks3Renderer from "@/components/Blocks3Renderer";

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
      <div className="mx-auto max-w-2xl p-6">
        <div className="flex items-center justify-center py-16">
          <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-8 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-xl font-bold text-emerald-800 mb-2">Quiz Selesai!</h2>
          <p className="text-emerald-600 mb-6">Progress Anda telah tersimpan.</p>
          <button
            onClick={() => window.close()}
            className="rounded-lg bg-slate-800 px-6 py-2 text-white transition-colors hover:bg-slate-700"
          >
            Tutup
          </button>
        </div>
      </div>
    );
  }

  if (error || !quiz) {
    return (
      <div className="mx-auto max-w-2xl p-6">
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
    );
  }

  const question = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  const handleChoiceSelect = (index: number) => {
    if (submitted) return;
    setSelectedChoiceIndex(index);
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleNext = async () => {
    if (isLastQuestion) {
      setSubmittingProgress(true);
      try {
        const session = getStoredSession();
        const studentId = session?.user?.studentProfile?.id;
        if (studentId) {
          await api.roadmap.upsertProgress({
            studentId,
            topicTaskCode: taskCode,
            status: "completed",
          });
        }
      } catch {
        // silent
      }
      setCompleted(true);
      return;
    }
    setSubmitted(false);
    setSelectedChoiceIndex(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const isCorrect = selectedChoiceIndex !== null
    ? question.choices[selectedChoiceIndex].isCorrect
    : false;

  return (
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-600">
          Pertanyaan {currentQuestionIndex + 1} dari {quiz.questions.length}
        </h1>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <p className="mb-6 text-lg font-medium">{question.question}</p>

        <div className="space-y-3">
          {question.choices.map((choice, index) => {
            const isSelected = selectedChoiceIndex === index;
            const showCorrect = submitted && choice.isCorrect;
            const showWrong = submitted && isSelected && !choice.isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleChoiceSelect(index)}
                className={`w-full rounded-lg border p-4 text-left transition-colors ${
                  isSelected && !submitted
                    ? "border-blue-500 bg-blue-50"
                    : "border-slate-200"
                } ${showCorrect ? "border-emerald-500 bg-emerald-50" : ""}
                  ${showWrong ? "border-red-500 bg-red-50" : ""}
                `}
              >
                <Blocks3Renderer code={choice.content} />
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
            {question.choices[selectedChoiceIndex].feedback}
          </div>
        )}

        <div className="mt-6 flex justify-end">
          {!submitted ? (
            <button
              onClick={handleSubmit}
              disabled={selectedChoiceIndex === null}
              className="rounded-lg bg-slate-800 px-6 py-2 text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
            >
              Submit
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
  );
}
