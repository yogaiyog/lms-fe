"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { X, Download, Printer } from "lucide-react";

type PreviewMode = "admin" | "student";

type CachedPreview = {
  pdfDataUrl: string;
  pdfFileName: string;
};

function getCacheKey(enrollmentId: string, mode: PreviewMode) {
  return `certificate-preview:${mode}:${enrollmentId}`;
}

function readCachedPreview(enrollmentId: string, mode: PreviewMode): CachedPreview | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(getCacheKey(enrollmentId, mode));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as CachedPreview;
  } catch {
    return null;
  }
}

function writeCachedPreview(enrollmentId: string, mode: PreviewMode, value: CachedPreview) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(getCacheKey(enrollmentId, mode), JSON.stringify(value));
}

async function blobToDataUrl(blob: Blob): Promise<string> {
  const buffer = await blob.arrayBuffer();
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }

  return `data:application/pdf;base64,${btoa(binary)}`;
}

export default function CertificatePreviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const enrollmentId = searchParams.get("enrollmentId");
  const mode = (searchParams.get("mode") || "admin") as PreviewMode;

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFileName, setPdfFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (!enrollmentId) {
      queueMicrotask(() => {
        setError("ID enrollment tidak ditemukan");
        setLoading(false);
      });
      return;
    }

    const cachedPreview = readCachedPreview(enrollmentId, mode);
    if (cachedPreview) {
      queueMicrotask(() => {
        setPdfUrl(cachedPreview.pdfDataUrl);
        setPdfFileName(cachedPreview.pdfFileName);
        setLoading(false);
      });
      return;
    }

    const cancelled = { current: false };
    (async () => {
      try {
        const enrollment = await api.enrollments.get(enrollmentId);
        if (cancelled.current) return;
        const student = enrollment.student!;
        const instructor = enrollment.class?.tutors?.[0]?.fullName ?? "Tutor";

        const blob = await api.certificates.generatePdf({
          name: student.fullName,
          course: enrollment.curriculum?.name ?? "—",
          date: new Date().toISOString(),
          certificateNumber: `CERT-${Date.now()}`,
          instructor,
        });
        if (cancelled.current) return;

        const url = await blobToDataUrl(blob);
        const sanitizedName = student.fullName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "");
        writeCachedPreview(enrollmentId, mode, {
          pdfDataUrl: url,
          pdfFileName: `${sanitizedName}.pdf`,
        });
        setPdfUrl(url);
        setPdfFileName(`${sanitizedName}.pdf`);
      } catch {
        if (!cancelled.current) setError("Gagal membuat sertifikat");
      } finally {
        if (!cancelled.current) setLoading(false);
      }
    })();
    return () => { cancelled.current = true; };
  }, [enrollmentId, mode]);

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
        <button onClick={handleClose}
          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <h1 className="text-base font-extrabold tracking-tight text-slate-900">Pratinjau Sertifikat</h1>
        <button onClick={handleClose}
          className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
          <X size={20} />
        </button>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 p-4">
        {loading && !pdfUrl && (
          <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
              <p className="text-sm font-semibold text-slate-600">Sedang membuat PDF sertifikat...</p>
            </div>
          </div>
        )}
        {pdfUrl && (
          <iframe
            id="pdf-frame"
            src={pdfUrl}
            className="h-full w-full rounded-2xl border border-slate-200 bg-white"
            title="Pratinjau Sertifikat"
          />
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-white px-6 py-4">
        <button onClick={handleClose}
          className="rounded-xl px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-100">
          Tutup
        </button>
        <button onClick={handlePrint}
          className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-bold text-blue-600 shadow-sm ring-1 ring-blue-600/30 transition hover:bg-blue-50">
          <Printer size={15} />
          Cetak
        </button>
        <button onClick={handleDownload}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-blue-600/30 transition hover:bg-blue-700">
          <Download size={15} />
          Download PDF
        </button>
        {mode === "admin" && !sent && (
          <button onClick={handleSendToDashboard} disabled={sending}
            className="inline-flex items-center gap-1.5 rounded-xl bg-green-600 px-4 py-2 text-sm font-bold text-white shadow-sm shadow-green-600/30 transition hover:bg-green-700 disabled:opacity-50">
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
