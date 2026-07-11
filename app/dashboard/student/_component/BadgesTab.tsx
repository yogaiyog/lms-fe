"use client";

import { useState } from "react";
import { Star, Award, FileText, Eye } from "lucide-react";
import Card from "./Card";
import type { Theme } from "./types";
import type { StudentBadge, Certificate, Enrollment } from "@/lib/api";
import CertificatePreviewModal from "../../shared/CertificatePreviewModal";

type Props = {
  theme: Theme;
  studentBadges: StudentBadge[];
  certificates: Certificate[];
  enrollments: Enrollment[];
};

export default function BadgesTab({ theme, studentBadges, certificates, enrollments }: Props) {
  const [previewEnrollment, setPreviewEnrollment] = useState<Enrollment | null>(null);

  function handlePreview(cert: Certificate) {
    const enrollment = enrollments.find(
      (e) => e.curriculumId === cert.curriculumId && e.studentId === cert.studentId
    );
    if (!enrollment) return;
    setPreviewEnrollment(enrollment);
  }
  return (
    <div>
      <div className="mb-6 flex items-start gap-3">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${theme.text}`}>Badges & Sertifikat</h1>
          <p className={`mt-1 text-sm ${theme.textMuted}`}>Pencapaian kamu selama belajar.</p>
        </div>
      </div>

      {/* Certificates */}
      {certificates.length > 0 && (
        <div className="mb-8">
          <h2 className={`mb-3 flex items-center gap-1.5 text-sm font-bold ${theme.text}`}>
            <Award size={16} /> Sertifikat
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {certificates.map((cert) => (
              <Card key={cert.id} theme={theme} className="p-5 flex items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                  <FileText size={22} className="text-blue-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold ${theme.text}`}>
                    {cert.certificateNumber}
                  </p>
                  {cert.grade && (
                    <p className={`text-xs font-semibold text-blue-600`}>Grade: {cert.grade}</p>
                  )}
                  <p className={`text-[10px] ${theme.textMuted}`}>
                    {new Date(cert.issuedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <button onClick={() => handlePreview(cert)}
                  className="rounded-lg p-2 text-blue-600 transition hover:bg-blue-50">
                  <Eye size={18} />
                </button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Badges */}
      {/* <div>
        <h2 className={`mb-3 flex items-center gap-1.5 text-sm font-bold ${theme.text}`}>
          <Star size={16} /> Badges
        </h2>
        {studentBadges.length === 0 ? (
          <Card theme={theme} className="p-12 flex flex-col items-center text-center border-dashed">
            <span className="text-5xl mb-4">🏆</span>
            <h3 className={`font-bold ${theme.text}`}>Belum ada badge</h3>
            <p className={`text-sm mt-1 max-w-sm ${theme.textMuted}`}>Ikuti kelas dan raih badge!</p>
          </Card>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {studentBadges.map((sb) => (
              <Card key={sb.id} theme={theme} className="p-5 text-center">
                <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-2xl">
                  <Star size={24} className="text-amber-500" fill="currentColor" />
                </div>
                <p className={`text-sm font-bold ${theme.text}`}>{sb.badge.title}</p>
                <p className={`mt-0.5 text-[10px] ${theme.textMuted}`}>{sb.badge.description}</p>
                <p className={`mt-2 text-xs font-semibold text-blue-600`}>+{sb.badge.xpBonus} XP</p>
              </Card>
            ))}
          </div>
        )}
      </div> */}

      <CertificatePreviewModal
        open={!!previewEnrollment}
        enrollment={previewEnrollment}
        studentName={previewEnrollment?.student?.fullName ?? "Sertifikat"}
        mode="student"
        onClose={() => setPreviewEnrollment(null)}
      />
    </div>
  );
}
