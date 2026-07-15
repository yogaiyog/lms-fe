"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Download, Printer, X } from "lucide-react";
import { api } from "@/lib/api";
import { isNativePlatform, downloadFileCapacitor, downloadFileWeb } from "@/lib/capacitor-download";

type PreviewMode = "admin" | "student";

function CertificatePreviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get("enrollmentId");
  const mode = (searchParams.get("mode") || "admin") as PreviewMode;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enrollmentId) {
      queueMicrotask(() => {
        setError("ID enrollment tidak ditemukan");
      });
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      setLoading(true);
      setError("");
      setSent(false);
      setPdfUrl(null);
      setPdfBlob(null);
      setPdfFileName("");
    });

    (async () => {
      try {
        const enrollment = await api.enrollments.get(enrollmentId);
        if (cancelled) return;

        const student = enrollment.student;
        if (!student) {
          throw new Error("Student data not found");
        }

        const blob = await api.certificates.generatePdf({
          name: student.fullName,
          course: enrollment.curriculum?.name ?? "—",
          date: new Date().toISOString(),
          certificateNumber: `CERT-${Date.now()}`,
          instructor: enrollment.class?.tutors?.[0]?.fullName ?? "Tutor",
        });
        if (cancelled) return;

        const url = URL.createObjectURL(blob);
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = url;

        const sanitizedName = student.fullName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");

        setPdfUrl(url);
        setPdfBlob(blob);
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
  }, [enrollmentId]);

  async function handleDownload() {
    if (!pdfBlob) return;
    try {
      console.log("[cert-page] Starting download:", pdfFileName);
      if (isNativePlatform()) {
        await downloadFileCapacitor(pdfBlob, pdfFileName);
      } else {
        downloadFileWeb(pdfBlob, pdfFileName);
      }
    } catch (err) {
      console.error("[cert-page] Download failed:", err);
      alert("Gagal download sertifikat");
    }
  }

  function handlePrint() {
    const iframe = document.getElementById("pdf-frame") as HTMLIFrameElement;
    iframe?.contentWindow?.print();
  }

  async function handleSendToDashboard() {
    if (!enrollmentId || sending || sent) return;
    setSending(true);
    try {
      const enrollment = await api.enrollments.get(enrollmentId);
      const certNumber = `CERT-${Date.now()}`;

      await api.certificates.create({
        studentId: enrollment.studentId,
        curriculumId: enrollment.curriculumId,
        certificateNumber: certNumber,
      });

      setSent(true);
    } catch {
      alert("Gagal mengirim sertifikat ke dashboard student");
    } finally {
      setSending(false);
    }
  }

  function handleClose() {
    if (mode === "admin") {
      router.push("/dashboard/admin");
    } else {
      router.push("/dashboard/student");
    }
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-4">
        <p className="text-sm font-semibold text-red-500">{error}</p>
        <button
          onClick={handleClose}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-base font-extrabold tracking-tight text-slate-900">Pratinjau Sertifikat</h1>
        <button
          onClick={handleClose}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 min-h-0 p-4">
        {loading && !pdfUrl ? (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm font-semibold text-slate-600">Sedang membuat PDF sertifikat...</p>
            </div>
          </div>
        ) : (
          <iframe
            id="pdf-frame"
            src={pdfUrl ?? undefined}
            className="h-full min-h-[78vh] w-full rounded-2xl border border-slate-200 bg-white"
            title="Pratinjau Sertifikat"
          />
        )}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <button
          onClick={handleClose}
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
          onClick={handleDownload}
          disabled={!pdfBlob}
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
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-green-100 px-4 py-2 text-sm font-bold text-green-700">
            Terkirim
          </span>
        )}
      </div>
    </div>
  );
}

export default function CertificatePreviewPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-slate-50"><span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>}>
      <CertificatePreviewContent />
    </Suspense>
  );
}
