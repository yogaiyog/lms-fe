"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, Printer, X } from "lucide-react";
import { api, type Enrollment, type Certificate } from "@/lib/api";

type PreviewMode = "admin" | "student";

type Props = {
  open: boolean;
  enrollment: Enrollment | null;
  studentName: string;
  mode: PreviewMode;
  initialSent?: boolean;
  onSent?: (certificate: Certificate) => void;
  onClose: () => void;
};

export default function CertificatePreviewModal({
  open,
  enrollment,
  studentName,
  mode,
  initialSent = false,
  onSent,
  onClose,
}: Props) {
  const router = useRouter();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open || !enrollment) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError("");
      setSent(initialSent);
      setPdfUrl(null);
      setPdfFileName("");
    });

    (async () => {
      try {
        const blob = await api.certificates.generatePdf({
          name: studentName,
          course: enrollment.curriculum?.name ?? "—",
          date: new Date().toISOString(),
          certificateNumber: `CERT-${Date.now()}`,
          instructor: enrollment.class?.tutors?.[0]?.fullName ?? "Tutor",
        });
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = url;

        const sanitizedName = studentName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        setPdfUrl(url);
        setPdfFileName(`${sanitizedName}.pdf`);
      } catch {
        if (!cancelled) setError("Gagal membuat sertifikat");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [open, enrollment, studentName, initialSent]);

  function handleDownload() {
    if (!pdfUrl) return;
    const a = document.createElement("a");
    a.href = pdfUrl;
    a.download = pdfFileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handlePrint() {
    const iframe = document.getElementById("certificate-preview-frame") as HTMLIFrameElement;
    iframe?.contentWindow?.print();
  }

  function handleOpenPage() {
    if (!enrollment) return;
    router.push(`/certificate/preview?enrollmentId=${enrollment.id}&mode=${mode}`);
  }

  async function handleSendToDashboard() {
    if (!enrollment || sending || sent) return;
    setSending(true);
    try {
      const certNumber = `CERT-${Date.now()}`;
      const certificate = await api.certificates.create({
        studentId: enrollment.studentId,
        curriculumId: enrollment.curriculumId,
        certificateNumber: certNumber,
      });
      onSent?.(certificate);
      setSent(true);
    } catch {
      alert("Gagal mengirim sertifikat ke dashboard student");
    } finally {
      setSending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="flex h-full max-h-[92vh] w-full max-w-6xl flex-col overflow-hidden rounded-3xl bg-slate-100 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h1 className="text-base font-extrabold tracking-tight text-slate-900">Pratinjau Sertifikat</h1>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 min-h-0 p-4">
          {error ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70">
              <div className="flex flex-col items-center gap-3 text-center">
                <p className="text-sm font-semibold text-red-500">{error}</p>
                <button
                  onClick={onClose}
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                >
                  Kembali
                </button>
              </div>
            </div>
          ) : loading && !pdfUrl ? (
            <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70">
              <div className="flex flex-col items-center gap-3 text-center">
                <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="text-sm font-semibold text-slate-600">Sedang membuat PDF sertifikat...</p>
              </div>
            </div>
          ) : (
            <iframe
              id="certificate-preview-frame"
              src={pdfUrl ?? undefined}
              className="h-full min-h-[72vh] w-full rounded-2xl border border-slate-200 bg-white"
              title="Pratinjau Sertifikat"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100"
          >
            Tutup
          </button>
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-600 shadow-sm ring-1 ring-blue-600/30 transition hover:bg-blue-50"
        >
          <Printer size={15} />
          Cetak
        </button>
        <button
          onClick={handleOpenPage}
          className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50"
        >
          Buka di Halaman
        </button>
        <button
          onClick={handleDownload}
          disabled={!pdfUrl}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700 disabled:opacity-50"
          >
            <Download size={15} />
            Download PDF
          </button>
          {mode === "admin" && !sent && (
            <button
              onClick={handleSendToDashboard}
              disabled={sending}
              className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-green-600/30 transition hover:bg-green-700 disabled:opacity-50"
            >
              {sending ? "Mengirim..." : "Kirim ke Dashboard Student"}
            </button>
          )}
          {sent && (
            <span
              className="inline-flex items-center justify-center rounded-xl bg-green-100 px-3 py-2 text-green-700 ring-1 ring-green-200"
              title="asdasdasd"
              aria-label="Terkirim"
            >
              <CheckCircle2 size={16} />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
