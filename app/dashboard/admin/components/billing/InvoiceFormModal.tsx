"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Banknote, Check, CreditCard, Landmark, Plus, QrCode, Search, User, Wallet, X } from "lucide-react";
import { api, type Curriculum, type Enrollment, type Invoice, type MidtransBank } from "@/lib/api";
import type { InvoiceFormPayload, InvoicePaymentMethod, SubmitInvoiceResult } from "@/hooks/useBilling";
import type { StudentItem } from "../../hooks/useAdminDashboard";
import { formatIDR } from "./InvoiceList";

type Props = {
  editing: Invoice | null;
  initialStep?: number;
  saving: boolean;
  error: string;
  students: StudentItem[];
  curriculums: Curriculum[];
  onClose: () => void;
  onSubmit: (payload: InvoiceFormPayload) => Promise<SubmitInvoiceResult>;
  onSubmitWithPayment: (payload: InvoiceFormPayload, choice: InvoicePaymentMethod) => Promise<SubmitInvoiceResult>;
  onSubmitEditWithPayment: (payload: InvoiceFormPayload, choice: InvoicePaymentMethod) => Promise<SubmitInvoiceResult>;
};

type MethodKey = "manual" | "va" | "qris" | "wallet" | "";

const BANKS: { value: MidtransBank; label: string }[] = [
  { value: "bca", label: "BCA" },
  { value: "bni", label: "BNI" },
  { value: "bri", label: "BRI" },
  { value: "mandiri", label: "Mandiri" },
  { value: "permata", label: "Permata" },
];

const WALLETS: { value: "gopay" | "shopeepay" | "dana"; label: string }[] = [
  { value: "gopay", label: "GoPay" },
  { value: "shopeepay", label: "ShopeePay" },
  { value: "dana", label: "DANA" },
];

const DEFAULT_PRICE_PER_MEETING = 120000;

export default function InvoiceFormModal({ editing, initialStep = 1, saving, error, students, curriculums, onClose, onSubmit, onSubmitWithPayment, onSubmitEditWithPayment }: Props) {
  const [step, setStep] = useState(initialStep);
  const [method, setMethod] = useState<MethodKey>("");
  const [bank, setBank] = useState<MidtransBank>("bca");
  const [wallet, setWallet] = useState<"gopay" | "shopeepay" | "dana">("gopay");
  const [manualBank, setManualBank] = useState("");

  const initialStudent = editing ? (students.find((s) => s.id === editing.enrollment?.studentId) ?? null) : null;
  const [studentSearch, setStudentSearch] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(initialStudent);
  const [studentEnrollments, setStudentEnrollments] = useState<Enrollment[]>([]);
  const [studentEnrollmentsLoading, setStudentEnrollmentsLoading] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(editing?.enrollment as Enrollment | null);
  const [selectedClassType, setSelectedClassType] = useState<string>(editing?.enrollment?.class?.type ?? "");
  const [showCreateEnrollment, setShowCreateEnrollment] = useState(false);

  const [meetCount, setMeetCount] = useState(editing && editing.meetCount ? String(editing.meetCount) : "");
  const [pricePerMeeting, setPricePerMeeting] = useState(editing && editing.meetCount > 0 ? String(Math.round(Number(editing.subtotal) / editing.meetCount)) : String(DEFAULT_PRICE_PER_MEETING));
  const [registrationFee, setRegistrationFee] = useState(editing?.registrationFee != null ? String(editing.registrationFee) : "0");
  const [taxPercent, setTaxPercent] = useState(editing?.taxPercent != null ? String(editing.taxPercent) : "");
  const [description, setDescription] = useState(editing?.description ?? "");
  const [notes, setNotes] = useState(editing?.notes ?? "");

  const [newEnrollmentCurriculumId, setNewEnrollmentCurriculumId] = useState("");
  const [newEnrollmentSaving, setNewEnrollmentSaving] = useState(false);

  const editingRef = useRef(editing);
  editingRef.current = editing;

  useEffect(() => {
    if (initialStudent) loadEnrollments(initialStudent.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadEnrollments(studentId: string) {
    setStudentEnrollmentsLoading(true);
    try {
      const list = await api.enrollments.listByStudent(studentId);
      setStudentEnrollments(list);
      const ed = editingRef.current;
      if (ed) {
        const match = list.find((e) => e.id === ed.enrollmentId);
        if (match) {
          setSelectedEnrollment(match);
          if (match.class?.type) setSelectedClassType(match.class.type);
        }
      }
    } catch {
      setStudentEnrollments([]);
    } finally {
      setStudentEnrollmentsLoading(false);
    }
  }

  const availableClassTypes = useMemo(() => {
    const c = selectedEnrollment?.curriculum;
    if (!c) return [];
    const list: { type: string; label: string; price: number }[] = [];
    if (c.priceBatch810 != null && Number(c.priceBatch810) > 0) {
      list.push({ type: "BATCH810", label: "Batch 8-10", price: Number(c.priceBatch810) });
    }
    if (c.priceBatch35 != null && Number(c.priceBatch35) > 0) {
      list.push({ type: "BATCH35", label: "Batch 3-5", price: Number(c.priceBatch35) });
    }
    if (c.pricePrivate != null && Number(c.pricePrivate) > 0) {
      list.push({ type: "PRIVATE", label: "Private", price: Number(c.pricePrivate) });
    }
    if (c.priceTrial != null && Number(c.priceTrial) > 0) {
      list.push({ type: "TRIAL", label: "Trial", price: Number(c.priceTrial) });
    }
    if (c.priceMakeup != null && Number(c.priceMakeup) > 0) {
      list.push({ type: "MAKEUP", label: "Make Up", price: Number(c.priceMakeup) });
    }
    return list;
  }, [selectedEnrollment?.curriculum]);

  const handleSelectEnrollment = (enr: Enrollment | null) => {
    setSelectedEnrollment(enr);
    if (!enr?.curriculum) {
      setSelectedClassType("");
      return;
    }
    const c = enr.curriculum;
    const list: { type: string; label: string; price: number }[] = [];
    if (c.priceBatch810 != null && Number(c.priceBatch810) > 0) list.push({ type: "BATCH810", label: "Batch 8-10", price: Number(c.priceBatch810) });
    if (c.priceBatch35 != null && Number(c.priceBatch35) > 0) list.push({ type: "BATCH35", label: "Batch 3-5", price: Number(c.priceBatch35) });
    if (c.pricePrivate != null && Number(c.pricePrivate) > 0) list.push({ type: "PRIVATE", label: "Private", price: Number(c.pricePrivate) });
    if (c.priceTrial != null && Number(c.priceTrial) > 0) list.push({ type: "TRIAL", label: "Trial", price: Number(c.priceTrial) });
    if (c.priceMakeup != null && Number(c.priceMakeup) > 0) list.push({ type: "MAKEUP", label: "Make Up", price: Number(c.priceMakeup) });

    if (list.length > 0) {
      const defaultType = enr.class?.type && list.find((t) => t.type === enr.class?.type) ? enr.class.type : list[0].type;
      const matched = list.find((t) => t.type === defaultType) ?? list[0];
      setSelectedClassType(matched.type);
      if (!editingRef.current) {
        setPricePerMeeting(String(matched.price));
      }
    } else {
      setSelectedClassType("");
    }
  };

  const handleSelectClassType = (type: string) => {
    setSelectedClassType(type);
    const found = availableClassTypes.find((t) => t.type === type);
    if (found) {
      setPricePerMeeting(String(found.price));
    }
  };

  const filteredStudents = useMemo(
    () => students.filter((s) => s.fullName.toLowerCase().includes(studentSearch.toLowerCase())),
    [students, studentSearch],
  );

  const validEnrollments = useMemo(
    () => studentEnrollments.filter((enr) => {
      const topics = enr.curriculum?.topics?.length ?? 0;
      if (topics === 0) return true;
      return (enr.totalMeetPurchased ?? 0) < topics;
    }),
    [studentEnrollments],
  );

  const sessionSubtotal = (Number(meetCount) || 0) * (Number(pricePerMeeting) || 0);
  const regFee = Number(registrationFee) || 0;
  const taxPctNum = Math.min(100, Math.max(0, Number(taxPercent) || 0));
  const taxableBase = sessionSubtotal + regFee;
  const taxAmount = Math.round(taxableBase * taxPctNum * 0.01);
  const total = taxableBase + taxAmount;

  const topicsLength = selectedEnrollment?.curriculum?.topics?.length ?? 0;
  const remainingQuota = Math.max(0, topicsLength - (selectedEnrollment?.totalMeetPurchased ?? 0));
  const exceedsQuota = topicsLength > 0 && Number(meetCount) > remainingQuota;
  const canGoNext = !!(selectedEnrollment && Number(meetCount) >= 1 && !exceedsQuota);

  function buildPayload(): InvoiceFormPayload {
    return {
      enrollmentId: selectedEnrollment!.id,
      description: description || `${Number(meetCount)} sesi ${selectedEnrollment?.curriculum?.name ?? ""}`,
      meetCount: meetCount ? Number(meetCount) : 0,
      subtotal: sessionSubtotal,
      registrationFee: regFee || undefined,
      taxPercent: taxPctNum || undefined,
      notes: notes || undefined,
    };
  }

  function buildChoice(): InvoicePaymentMethod {
    if (method === "manual") return { method: "manual", bank: manualBank || undefined };
    if (method === "va") return { method: "bank_transfer", bank };
    if (method === "wallet") return { method: wallet };
    return { method: "qris" };
  }

  function handleSubmit() {
    const payload = buildPayload();
    if (!isEdit) { onSubmitWithPayment(payload, buildChoice()); return; }
    if (method === "") { onSubmit(payload); return; }
    onSubmitEditWithPayment(payload, buildChoice());
  }

  function methodReady(): boolean {
    if (method === "va") return Boolean(bank);
    if (method === "wallet") return Boolean(wallet);
    return Boolean(method);
  }

  function methodLabel(): string {
    if (method === "manual") return `Transfer Bank${manualBank ? ` - ${manualBank}` : ""}`;
    if (method === "va") return `Virtual Account - ${BANKS.find((b) => b.value === bank)?.label ?? bank}`;
    if (method === "qris") return "QRIS";
    if (method === "wallet") return `E-Wallet - ${WALLETS.find((w) => w.value === wallet)?.label ?? wallet}`;
    return "";
  }

  function methodSummary(): string {
    if (method === "manual") return "Pembayaran manual (PENDING)";
    if (method === "va") return "Kode Virtual Account dikirim setelah disimpan";
    if (method === "qris") return "QRIS untuk dipindai";
    if (method === "wallet") return "Link pembayaran e-wallet";
    return "";
  }

  async function handleCreateEnrollment() {
    if (!selectedStudent || !newEnrollmentCurriculumId) return;
    setNewEnrollmentSaving(true);
    try {
      const created = await api.enrollments.create({
        studentId: selectedStudent.id,
        curriculumId: newEnrollmentCurriculumId,
      });
      setShowCreateEnrollment(false);
      setNewEnrollmentCurriculumId("");
      await loadEnrollments(selectedStudent.id);
      handleSelectEnrollment(created);
    } catch {
      alert("Gagal membuat enrollment");
    } finally {
      setNewEnrollmentSaving(false);
    }
  }

  const isEdit = Boolean(editing);
  const isPaymentOnly = isEdit && initialStep === 2;
  const requireMethod = isPaymentOnly || (isEdit && buildPayload().subtotal !== (Number(editing?.subtotal) || 0) && (editing?.payments ?? []).some((p) => p.status === "PENDING"));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-xl max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900">
              {isEdit ? `Edit Invoice ${editing?.number}` : "Buat Invoice Baru"}
            </h2>
            <div className="mt-1 flex items-center gap-1.5">
              {[1, 2, 3].map((s) => (
                <span key={s} className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  step === s ? "bg-blue-600 text-white" : step > s ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {step > s ? <Check size={11} /> : s}
                </span>
              ))}
              <span className="text-[10px] font-semibold text-slate-400">
                {step === 1 ? "Detail Invoice" : step === 2 ? "Metode Pembayaran" : "Ringkasan"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {error && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}

          {step === 1 ? (
            <StepOne
              students={students}
              filteredStudents={filteredStudents}
              studentSearch={studentSearch}
              setStudentSearch={setStudentSearch}
              selectedStudent={selectedStudent}
              setSelectedStudent={setSelectedStudent}
              loadEnrollments={loadEnrollments}
              studentEnrollments={studentEnrollments}
              studentEnrollmentsLoading={studentEnrollmentsLoading}
              validEnrollments={validEnrollments}
              selectedEnrollment={selectedEnrollment}
              onSelectEnrollment={handleSelectEnrollment}
              availableClassTypes={availableClassTypes}
              selectedClassType={selectedClassType}
              onSelectClassType={handleSelectClassType}
              showCreateEnrollment={showCreateEnrollment}
              setShowCreateEnrollment={setShowCreateEnrollment}
              meetCount={meetCount}
              setMeetCount={setMeetCount}
              pricePerMeeting={pricePerMeeting}
              setPricePerMeeting={setPricePerMeeting}
              registrationFee={registrationFee}
              setRegistrationFee={setRegistrationFee}
              taxPercent={taxPercent}
              setTaxPercent={setTaxPercent}
              description={description}
              setDescription={setDescription}
              notes={notes}
              setNotes={setNotes}
              sessionSubtotal={sessionSubtotal}
              regFee={regFee}
              taxPctNum={taxPctNum}
              taxAmount={taxAmount}
              total={total}
              remainingQuota={remainingQuota}
              exceedsQuota={exceedsQuota}
              canGoNext={canGoNext}
              curriculums={curriculums}
              newEnrollmentCurriculumId={newEnrollmentCurriculumId}
              setNewEnrollmentCurriculumId={setNewEnrollmentCurriculumId}
              newEnrollmentSaving={newEnrollmentSaving}
              handleCreateEnrollment={handleCreateEnrollment}
              isEdit={isEdit}
              onClose={onClose}
              onNext={() => setStep(2)}
            />
          ) : step === 2 ? (
            <div className="space-y-4">
              <p className="text-sm font-semibold text-slate-600">
                {requireMethod ? "Pilih metode pembayaran untuk invoice ini:" : isEdit ? "Ubah metode pembayaran (opsional):" : "Pilih metode pembayaran untuk invoice ini:"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <MethodCard active={method === "manual"} onClick={() => setMethod("manual")} icon={<Banknote size={18} />} title="Transfer Bank" desc="Manual · PENDING" />
                <MethodCard active={method === "va"} onClick={() => setMethod("va")} icon={<Landmark size={18} />} title="Virtual Account" desc="BCA · BNI · BRI · Mandiri · Permata" />
                <MethodCard active={method === "qris"} onClick={() => setMethod("qris")} icon={<QrCode size={18} />} title="QRIS" desc="Scan kode QR" />
                <MethodCard active={method === "wallet"} onClick={() => setMethod("wallet")} icon={<Wallet size={18} />} title="E-Wallet" desc="GoPay · ShopeePay · DANA" />
              </div>

              {method === "manual" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Nama Bank (opsional)</label>
                  <input value={manualBank} onChange={(e) => setManualBank(e.target.value)}
                    placeholder="mis. BCA"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
                </div>
              )}

              {method === "va" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">Bank Virtual Account</label>
                  <div className="flex flex-wrap gap-2">
                    {BANKS.map((b) => (
                      <button key={b.value} type="button" onClick={() => setBank(b.value)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                          bank === b.value ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {method === "wallet" && (
                <div>
                  <label className="mb-1 block text-xs font-bold text-slate-600">E-Wallet</label>
                  <div className="flex flex-wrap gap-2">
                    {WALLETS.map((w) => (
                      <button key={w.value} type="button" onClick={() => setWallet(w.value)}
                        className={`rounded-xl px-3 py-2 text-xs font-bold transition ${
                          wallet === w.value ? "bg-blue-600 text-white shadow-sm" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                        }`}>
                        {w.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-1">
                <button type="button" onClick={() => setStep(1)}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
                  <ArrowLeft size={15} /> Kembali
                </button>
                <div className="flex items-center gap-2">
                  {isEdit && !requireMethod && (
                    <button type="button" onClick={() => setStep(3)}
                      className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
                      Lewati
                    </button>
                  )}
                  <button type="button" onClick={() => setStep(3)} disabled={!methodReady()}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
                    Lanjut <ArrowRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4 space-y-2 text-sm">
                {isEdit && <SummaryRow label="Nomor Invoice" value={editing?.number ?? "—"} />}
                <SummaryRow label="Siswa" value={selectedStudent?.fullName ?? "—"} />
                <SummaryRow label="Kurikulum" value={selectedEnrollment?.curriculum?.name ?? "—"} />
                <SummaryRow label="Pertemuan" value={String(Number(meetCount) || 0)} />
                <div className="flex justify-between text-slate-600">
                  <span>Harga/pertemuan</span><span>{Number(pricePerMeeting).toLocaleString("id-ID")}</span>
                </div>
                {regFee > 0 && <div className="flex justify-between text-slate-600"><span>Biaya Pendaftaran</span><span className="font-semibold">Rp {regFee.toLocaleString("id-ID")}</span></div>}
                <div className="flex justify-between border-t border-slate-200 pt-2 font-bold text-slate-900">
                  <span>Total</span><span>Rp {total.toLocaleString("id-ID")}</span>
                </div>
              </div>
              {method === "" && isEdit ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-sm font-bold text-slate-700">Metode pembayaran tidak diubah</p>
                  <p className="mt-1 text-xs text-slate-500">Invoice disimpan tanpa membuat pembayaran baru.</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                    <CreditCard size={15} /> {methodLabel()}
                  </div>
                  <p className="mt-1 text-xs text-emerald-700">{methodSummary()}</p>
                </div>
              )}
              <div className="flex items-center justify-between gap-2 pt-1">
                <button type="button" onClick={() => setStep(2)}
                  className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">
                  <ArrowLeft size={15} /> Kembali
                </button>
                <button type="button" onClick={handleSubmit} disabled={saving}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
                  {saving ? "Menyimpan..." : isEdit ? (method === "" ? "Simpan" : "Simpan & Perbarui Metode") : "Simpan Invoice"} <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StepOne({
  students, filteredStudents, studentSearch, setStudentSearch,
  selectedStudent, setSelectedStudent, loadEnrollments,
  studentEnrollments, studentEnrollmentsLoading, validEnrollments,
  selectedEnrollment, onSelectEnrollment,
  availableClassTypes, selectedClassType, onSelectClassType,
  showCreateEnrollment, setShowCreateEnrollment,
  meetCount, setMeetCount, pricePerMeeting, setPricePerMeeting,
  registrationFee, setRegistrationFee, taxPercent, setTaxPercent,
  description, setDescription, notes, setNotes,
  sessionSubtotal, regFee, taxPctNum, taxAmount, total,
  remainingQuota, exceedsQuota, canGoNext,
  curriculums, newEnrollmentCurriculumId, setNewEnrollmentCurriculumId,
  newEnrollmentSaving, handleCreateEnrollment,
  isEdit, onClose, onNext,
}: {
  students: StudentItem[];
  filteredStudents: StudentItem[];
  studentSearch: string;
  setStudentSearch: (v: string) => void;
  selectedStudent: StudentItem | null;
  setSelectedStudent: (s: StudentItem | null) => void;
  loadEnrollments: (studentId: string) => void;
  studentEnrollments: Enrollment[];
  studentEnrollmentsLoading: boolean;
  validEnrollments: Enrollment[];
  selectedEnrollment: Enrollment | null;
  onSelectEnrollment: (e: Enrollment | null) => void;
  availableClassTypes: { type: string; label: string; price: number }[];
  selectedClassType: string;
  onSelectClassType: (type: string) => void;
  showCreateEnrollment: boolean;
  setShowCreateEnrollment: (v: boolean) => void;
  meetCount: string;
  setMeetCount: (v: string) => void;
  pricePerMeeting: string;
  setPricePerMeeting: (v: string) => void;
  registrationFee: string;
  setRegistrationFee: (v: string) => void;
  taxPercent: string;
  setTaxPercent: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  sessionSubtotal: number;
  regFee: number;
  taxPctNum: number;
  taxAmount: number;
  total: number;
  remainingQuota: number;
  exceedsQuota: boolean;
  canGoNext: boolean;
  curriculums: Curriculum[];
  newEnrollmentCurriculumId: string;
  setNewEnrollmentCurriculumId: (v: string) => void;
  newEnrollmentSaving: boolean;
  handleCreateEnrollment: () => void;
  isEdit: boolean;
  onClose: () => void;
  onNext: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Student Picker */}
      {!isEdit || !selectedStudent ? (
        <StudentPickerSection
          students={students}
          filteredStudents={filteredStudents}
          search={studentSearch}
          setSearch={setStudentSearch}
          selected={selectedStudent}
          onSelect={(s) => { setSelectedStudent(s); onSelectEnrollment(null); loadEnrollments(s.id); }}
        />
      ) : (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
              {selectedStudent.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{selectedStudent.fullName}</p>
              <p className="text-[11px] text-slate-500">{selectedStudent.email ?? "—"}</p>
            </div>
          </div>
        </div>
      )}

      {/* Enrollment List */}
      {selectedStudent && !selectedEnrollment && (
        <EnrollmentListSection
          enrollments={validEnrollments}
          allCount={studentEnrollments.length}
          loading={studentEnrollmentsLoading}
          onSelect={onSelectEnrollment}
          onCreateNew={() => { setShowCreateEnrollment(true); }}
          showCreateEnrollment={showCreateEnrollment}
        />
      )}

      {/* Inline Enrollment Creator */}
      {selectedStudent && showCreateEnrollment && !selectedEnrollment && (
        <InlineEnrollmentCreator
          curriculums={curriculums}
          curriculumId={newEnrollmentCurriculumId}
          setCurriculumId={setNewEnrollmentCurriculumId}
          saving={newEnrollmentSaving}
          onSubmit={handleCreateEnrollment}
          onCancel={() => setShowCreateEnrollment(false)}
        />
      )}

      {/* Detail Tagihan */}
      {selectedEnrollment && (
        <DetailTagihanSection
          enrollment={selectedEnrollment}
          availableClassTypes={availableClassTypes}
          selectedClassType={selectedClassType}
          onSelectClassType={onSelectClassType}
          meetCount={meetCount}
          setMeetCount={setMeetCount}
          pricePerMeeting={pricePerMeeting}
          setPricePerMeeting={setPricePerMeeting}
          registrationFee={registrationFee}
          setRegistrationFee={setRegistrationFee}
          taxPercent={taxPercent}
          setTaxPercent={setTaxPercent}
          description={description}
          setDescription={setDescription}
          notes={notes}
          setNotes={setNotes}
          sessionSubtotal={sessionSubtotal}
          regFee={regFee}
          taxPctNum={taxPctNum}
          taxAmount={taxAmount}
          total={total}
          remainingQuota={remainingQuota}
          exceedsQuota={exceedsQuota}
        />
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <button type="button" onClick={onClose}
          className="rounded-xl px-4 py-2 text-sm font-bold text-slate-500 hover:bg-slate-100">Batal</button>
        <button type="button" onClick={onNext} disabled={!canGoNext}
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
          Lanjut <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

function StudentPickerSection({
  students, filteredStudents, search, setSearch, selected, onSelect,
}: {
  students: StudentItem[];
  filteredStudents: StudentItem[];
  search: string;
  setSearch: (v: string) => void;
  selected: StudentItem | null;
  onSelect: (s: StudentItem) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-slate-600">Pilih Siswa</label>
      {selected ? (
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
              {selected.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold text-slate-800 truncate">{selected.fullName}</p>
              <p className="text-[11px] text-slate-500">{selected.email ?? "—"}</p>
            </div>
          </div>
          <button onClick={() => onSelect({ ...selected, id: "" } as unknown as StudentItem)}
            className="rounded-lg px-2.5 py-1 text-[10px] font-bold text-red-500 hover:bg-red-50">
            Ganti
          </button>
        </div>
      ) : (
        <>
          <div className="relative mb-2">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama siswa..."
              className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
          </div>
          {search && (
            <div className="max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              {filteredStudents.length === 0 ? (
                <p className="p-3 text-center text-xs text-slate-400">Tidak ditemukan</p>
              ) : (
                filteredStudents.map((s) => (
                  <button key={s.id} onClick={() => onSelect(s)}
                    className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-blue-50">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                      {s.fullName.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{s.fullName}</p>
                      <p className="text-[10px] text-slate-400">{s.nickname}{s.email ? ` · ${s.email}` : ""}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
          {students.length === 0 && (
            <p className="text-xs text-slate-400">Tidak ada data siswa. Tambahkan siswa terlebih dahulu.</p>
          )}
        </>
      )}
    </div>
  );
}

function EnrollmentListSection({
  enrollments, allCount, loading, onSelect, onCreateNew, showCreateEnrollment,
}: {
  enrollments: Enrollment[];
  allCount: number;
  loading: boolean;
  onSelect: (e: Enrollment) => void;
  onCreateNew: () => void;
  showCreateEnrollment: boolean;
}) {
  if (loading) {
    return <p className="text-xs text-slate-400 text-center py-4">Memuat enrollment...</p>;
  }

  if (!showCreateEnrollment && enrollments.length === 0) {
    return (
      <div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
          <User size={24} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-semibold text-slate-600">
            {allCount === 0 ? "Belum ada enrollment untuk siswa ini" : "Semua enrollment sudah penuh"}
          </p>
          <p className="mt-1 text-xs text-slate-400">Buat enrollment baru terlebih dahulu.</p>
        </div>
        <button onClick={onCreateNew}
          className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700">
          <Plus size={14} /> Buat Enrollment Baru
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1 block text-xs font-bold text-slate-600">Pilih Enrollment</label>
      <div className="space-y-1.5 max-h-40 overflow-y-auto">
        {enrollments.map((enr) => {
          const topics = enr.curriculum?.topics?.length ?? 0;
          const remaining = Math.max(0, topics - (enr.totalMeetPurchased ?? 0));
          return (
            <button key={enr.id} onClick={() => onSelect(enr)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left hover:border-blue-300 hover:bg-blue-50/40 transition">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800">{enr.curriculum?.name ?? "—"}</p>
                  <p className="text-xs text-slate-500">{(enr.totalMeetPurchased ?? 0)} / {topics} pertemuan dibeli</p>
                </div>
                <span className="shrink-0 ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                  Sisa {remaining}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <button onClick={onCreateNew}
        className="mt-2 w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 hover:border-blue-300 hover:text-blue-600">
        <Plus size={14} /> Buat Enrollment Baru
      </button>
    </div>
  );
}

function InlineEnrollmentCreator({
  curriculums, curriculumId, setCurriculumId,
  saving, onSubmit, onCancel,
}: {
  curriculums: Curriculum[];
  curriculumId: string;
  setCurriculumId: (v: string) => void;
  saving: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}) {
  const selectedCurriculum = curriculums.find((c) => c.id === curriculumId);

  return (
    <div className="rounded-2xl border border-blue-300 bg-blue-50 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-blue-800">Buat Enrollment Baru</h3>
        <button onClick={onCancel} className="rounded-lg p-1 text-blue-400 hover:bg-blue-100">
          <X size={16} />
        </button>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-slate-600">Kurikulum</label>
        <select value={curriculumId} onChange={(e) => { setCurriculumId(e.target.value); }}
          required className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400">
          <option value="">Pilih Kurikulum</option>
          {curriculums.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        {selectedCurriculum && (
          <p className="mt-1 text-[11px] text-slate-400">{selectedCurriculum.topics.length} topik tersedia</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={onCancel}
          className="rounded-xl px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-white">
          Batal
        </button>
        <button type="button" onClick={onSubmit}
          disabled={!curriculumId || saving}
          className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
          {saving ? "Menyimpan..." : "Buat Enrollment"}
        </button>
      </div>
    </div>
  );
}

function DetailTagihanSection({
  enrollment, availableClassTypes, selectedClassType, onSelectClassType,
  meetCount, setMeetCount, pricePerMeeting, setPricePerMeeting,
  registrationFee, setRegistrationFee, taxPercent, setTaxPercent,
  description, setDescription, notes, setNotes,
  sessionSubtotal, regFee, taxPctNum, taxAmount, total,
  remainingQuota, exceedsQuota,
}: {
  enrollment: Enrollment;
  availableClassTypes: { type: string; label: string; price: number }[];
  selectedClassType: string;
  onSelectClassType: (type: string) => void;
  meetCount: string;
  setMeetCount: (v: string) => void;
  pricePerMeeting: string;
  setPricePerMeeting: (v: string) => void;
  registrationFee: string;
  setRegistrationFee: (v: string) => void;
  taxPercent: string;
  setTaxPercent: (v: string) => void;
  description: string;
  setDescription: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  sessionSubtotal: number;
  regFee: number;
  taxPctNum: number;
  taxAmount: number;
  total: number;
  remainingQuota: number;
  exceedsQuota: boolean;
}) {
  return (
    <>
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-3 text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-slate-500">Kurikulum</span>
          <span className="font-bold text-slate-700">{enrollment.curriculum?.name ?? "—"}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Pertemuan Dibeli</span>
          <span className="font-bold text-slate-700">{enrollment.totalMeetPurchased ?? 0}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Total Topics</span>
          <span className="font-bold text-slate-700">{enrollment.curriculum?.topics?.length ?? 0}</span>
        </div>
      </div>

      {/* Tipe Kelas & Tarif Pricing Selector */}
      {availableClassTypes.length > 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-bold text-slate-700">
              Pilih Tipe Kelas & Tarif ({enrollment.curriculum?.name})
            </label>
            <span className="text-[10px] text-slate-400 font-medium">Klik untuk mengisi otomatis harga/pertemuan</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {availableClassTypes.map((t) => {
              const active = selectedClassType === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => onSelectClassType(t.type)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition shadow-sm ${
                    active
                      ? "bg-blue-600 text-white shadow-blue-500/20 ring-2 ring-blue-300"
                      : "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-50/50"
                  }`}
                >
                  <span>{t.label}</span>
                  <span className={`rounded-lg px-1.5 py-0.5 text-[10px] font-extrabold ${active ? "bg-blue-700 text-white" : "bg-slate-100 text-slate-700"}`}>
                    {formatIDR(t.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}

      <div>
        <label className="mb-1 block text-xs font-bold text-slate-600">Deskripsi</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder={enrollment?.curriculum?.name ? `${meetCount ? meetCount : "?"} sesi ${enrollment.curriculum.name}` : ""}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">Pertemuan</label>
          <input type="number" min="1" value={meetCount} onChange={(e) => setMeetCount(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
          {remainingQuota > 0 && (
            <p className="mt-0.5 text-[10px] text-slate-400">Maks {remainingQuota}</p>
          )}
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-600">Harga/pertemuan</label>
          </div>
          <input type="number" min="0" value={pricePerMeeting} onChange={(e) => setPricePerMeeting(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
        </div>
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">Biaya Daftar</label>
          <input type="number" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs font-bold text-slate-600">Pajak (%)</label>
          <input type="number" min="0" max="100" step="0.01" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
        </div>
      </div>

      {exceedsQuota && (
        <p className="text-xs font-semibold text-red-600">
          Pertemuan ({Number(meetCount) || 0}) + Total Meet Purchased ({enrollment.totalMeetPurchased ?? 0}) = {(Number(meetCount) || 0) + (enrollment.totalMeetPurchased ?? 0)} melebihi total topics ({enrollment.curriculum?.topics?.length ?? 0})
        </p>
      )}

      <div className="rounded-2xl bg-slate-50 p-4 space-y-1.5 text-sm">
        <div className="flex justify-between text-slate-600"><span>Sesi ({Number(meetCount) || 0} × {Number(pricePerMeeting).toLocaleString("id-ID")})</span><span className="font-semibold">Rp {sessionSubtotal.toLocaleString("id-ID")}</span></div>
        {regFee > 0 && <div className="flex justify-between text-slate-600"><span>Biaya Pendaftaran</span><span className="font-semibold">Rp {regFee.toLocaleString("id-ID")}</span></div>}
        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span className="font-semibold">Rp {(sessionSubtotal + regFee).toLocaleString("id-ID")}</span></div>
        <div className="flex justify-between text-slate-600"><span>Pajak {taxPctNum > 0 ? `(${taxPctNum}%)` : ""}</span><span className="font-semibold">Rp {taxAmount.toLocaleString("id-ID")}</span></div>
        <div className="flex justify-between border-t border-slate-200 pt-1.5 font-bold text-slate-900"><span>Total</span><span>Rp {total.toLocaleString("id-ID")}</span></div>
      </div>

      <div>
        <label className="mb-1 block text-xs font-bold text-slate-600">Catatan</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-blue-400" />
      </div>
    </>
  );
}

function MethodCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button type="button" onClick={onClick}
      className={`rounded-2xl border p-3 text-left transition ${
        active ? "border-blue-500 bg-blue-50 ring-2 ring-blue-100" : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
      }`}>
      <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"}`}>
        {icon}
      </span>
      <p className="mt-2 text-sm font-bold text-slate-800">{title}</p>
      <p className="mt-0.5 text-[11px] text-slate-500">{desc}</p>
    </button>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-slate-600">
      <span>{label}</span>
      <span className="font-semibold text-slate-800">{value}</span>
    </div>
  );
}
