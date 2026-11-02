"use client";

import { type Class, type RequestClass } from "@/lib/api";
import { Alert, Button, Field, Modal, Segmented, Select, Textarea } from "@/components/ui";

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

const GRADE_MAP: Record<string, string[]> = {
  JUNIOR_I: ["Kelas 1", "Kelas 2", "Kelas 3"],
  JUNIOR_II: ["Kelas 4", "Kelas 5", "Kelas 6"],
  JUNIOR_III: ["Kelas 7", "Kelas 8", "Kelas 9"],
};

export default function ApproveRejectModal({
  request, approveAction, onApproveActionChange,
  approveClassId, onApproveClassIdChange,
  adminNotes, onAdminNotesChange,
  approving, approveError, classes,
  onClose, onSubmit,
}: Props) {
  const eligibleClasses = classes.filter(
    (c) => GRADE_MAP[request.category]?.includes(c.category?.name ?? "") && c.isActive,
  );
  const approving_ = approveAction === "APPROVED";

  return (
    <Modal
      open
      onClose={onClose}
      dismissible={!approving}
      size="sm"
      title={approving_ ? "Setujui Request" : "Tolak Request"}
      description={`${request.student?.fullName ?? "Siswa"} — ${request.curriculum}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={approving}>
            Batal
          </Button>
          <Button
            variant={approving_ ? "primary" : "danger"}
            onClick={onSubmit}
            loading={approving}
            disabled={approving_ && !approveClassId}
          >
            {approving ? "Memproses…" : approving_ ? "Setujui" : "Tolak"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Segmented
          ariaLabel="Keputusan"
          className="w-full [&>button]:flex-1 [&>button]:justify-center"
          value={approveAction}
          onChange={onApproveActionChange}
          items={[
            { key: "APPROVED", label: "Setujui" },
            { key: "REJECTED", label: "Tolak" },
          ]}
        />

        {approving_ && (
          <Field
            label="Assign ke kelas"
            htmlFor="approve-class"
            required
            hint={eligibleClasses.length === 0 ? "Belum ada kelas aktif yang sesuai jenjang siswa ini." : undefined}
          >
            <Select id="approve-class" value={approveClassId} onChange={(e) => onApproveClassIdChange(e.target.value)} required>
              <option value="">— Pilih kelas —</option>
              {eligibleClasses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.tutors?.map((t) => t.fullName).join(", ")})
                </option>
              ))}
            </Select>
          </Field>
        )}

        <Field label="Catatan admin" htmlFor="approve-notes">
          <Textarea id="approve-notes" value={adminNotes} onChange={(e) => onAdminNotesChange(e.target.value)} rows={3} />
        </Field>

        {approveError && <Alert>{approveError}</Alert>}
      </div>
    </Modal>
  );
}
