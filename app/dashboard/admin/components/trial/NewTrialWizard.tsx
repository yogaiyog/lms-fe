"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight, UserPlus, BookOpen, Clock, CheckCircle2 } from "lucide-react";
import { api, checkEmail, type Category, type Curriculum, type ParentProfile, type TutorSlot } from "@/lib/api";

type TutorOption = { id: string; fullName: string };

type Props = {
  categories: Category[];
  curriculums: Curriculum[];
  tutors: TutorOption[];
  parents: ParentProfile[];
  SLOT_DAYS: string[];
  SLOT_DAY_LABELS: Record<string, string>;
  SLOT_HOURS: number[];
  fmt: (h: number) => string;
  isInRange: (day: string, hour: number) => boolean;
  onClose: () => void;
  onDone: () => void;
};

const STEPS = ["Orang Tua", "Siswa", "Kurikulum", "Kelas & Jadwal"];

const DAY_ORDER = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

function computeDate(startDate: string, dayOfWeek: string) {
  const dayIdx = DAY_ORDER.indexOf(dayOfWeek);
  const start = new Date(startDate);
  const diff = (dayIdx - start.getDay() + 7) % 7;
  const d = new Date(start);
  d.setDate(d.getDate() + diff);
  return d.toISOString().split("T")[0];
}

function useEmailCheck(value: string) {
  const [status, setStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      if (!value) {
        setStatus("idle");
        return;
      }
      setStatus("checking");
      try {
        setStatus((await checkEmail(value)) ? "available" : "taken");
      } catch {
        setStatus("idle");
      }
    }, value ? 500 : 0);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [value]);

  return status;
}

export default function NewTrialWizard({
  categories, curriculums, tutors, parents,
  SLOT_DAYS, SLOT_DAY_LABELS, SLOT_HOURS, fmt, isInRange,
  onClose, onDone,
}: Props) {
  const [step, setStep] = useState(1);

  const [parentMode, setParentMode] = useState<"select" | "create">("select");
  const [parentSearch, setParentSearch] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentPassword, setParentPassword] = useState("");

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [school, setSchool] = useState("");

  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [selectedTutorId, setSelectedTutorId] = useState("");
  const [tutorSlots, setTutorSlots] = useState<TutorSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ dayOfWeek: string; startTime: string; endTime: string } | null>(null);
  const [startDate, setStartDate] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const parentEmailStatus = useEmailCheck(parentMode === "create" ? parentEmail : "");
  const studentEmailStatus = useEmailCheck(email);

  const filteredParents = parents.filter((p) =>
    p.fullName.toLowerCase().includes(parentSearch.toLowerCase()),
  );

  const trialCurriculums = useMemo(
    () =>
      categoryId
        ? curriculums.filter(
            (c) =>
              c.name.toLowerCase().includes("trial") &&
              c.categories?.some((cat) => cat.categoryId === categoryId),
          )
        : [],
    [curriculums, categoryId],
  );

  const selectedCurriculum = useMemo(
    () => curriculums.find((c) => c.id === selectedCurriculumId),
    [curriculums, selectedCurriculumId],
  );

  const categoryLabel = categories.find((c) => c.id === categoryId)?.label ?? "";

  const suggestedEmail = useMemo(
    () => (nickname ? `${nickname.toLowerCase().replace(/\s+/g, "")}@email.com` : ""),
    [nickname],
  );

  const meetingDate = useMemo(
    () => (selectedSlot && startDate ? computeDate(startDate, selectedSlot.dayOfWeek) : ""),
    [selectedSlot, startDate],
  );

  useEffect(() => {
    if (!selectedTutorId) return;
    api.tutorSlots
      .list(selectedTutorId)
      .then((res) => {
        setTutorSlots(res.slots);
        setSelectedSlot(null);
      })
      .catch(() => setTutorSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [selectedTutorId]);

  const step1Valid =
    parentMode === "select"
      ? !!selectedParentId
      : !!(parentName && parentEmail && parentPhone && parentPassword.length >= 8) &&
        parentEmailStatus !== "taken";
  const step2Valid = !!(
    fullName &&
    nickname &&
    birthDate &&
    password.length >= 8 &&
    categoryId
  );
  const step3Valid = !!selectedCurriculumId;
  const step4Valid = !!(selectedTutorId && selectedSlot && startDate);

  const canNext =
    (step === 1 && step1Valid) ||
    (step === 2 && step2Valid) ||
    (step === 3 && step3Valid);

  function goNext() {
    if (canNext) setStep((s) => Math.min(4, s + 1));
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError("");
    try {
      const curriculum = selectedCurriculum;
      if (!curriculum) throw new Error("Kurikulum trial tidak ditemukan");
      if (!selectedSlot || !selectedTutorId) throw new Error("Jadwal belum lengkap");
      if (!startDate) throw new Error("Tanggal mulai wajib diisi");

      const studentEmail = email || suggestedEmail;
      if (!studentEmail) throw new Error("Email siswa wajib diisi");

      if (parentMode === "create" && parentEmailStatus === "taken") {
        throw new Error("Email orang tua sudah digunakan");
      }
      if (studentEmailStatus === "taken") {
        throw new Error("Email siswa sudah digunakan");
      }

      await api.trial.create({
        parent:
          parentMode === "create"
            ? { fullName: parentName, email: parentEmail, password: parentPassword, phone: parentPhone }
            : { parentId: selectedParentId },
        student: {
          fullName,
          nickname,
          birthDate,
          email: studentEmail,
          password,
          categoryId,
          school: school || null,
        },
        curriculumId: curriculum.id,
        tutorId: selectedTutorId,
        className: `${curriculum.name} - Trial`,
        isOnline: true,
        slot: selectedSlot,
        startDate,
      });

      onDone();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Gagal membuat akun trial");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-10 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl mb-10">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Buat Akun Trial</h2>
            <p className="mt-0.5 text-xs text-slate-500">Parent → Siswa → Enrollment trial → Kelas & Jadwal</p>
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6 flex items-center gap-2">
          {STEPS.map((label, i) => {
            const n = i + 1;
            const active = step === n;
            const done = step > n;
            return (
              <div key={label} className="flex flex-1 items-center gap-2">
                <div className="flex flex-col items-center gap-1 flex-1">
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                    done ? "bg-emerald-100 text-emerald-600"
                      : active ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}>
                    {done ? <CheckCircle2 size={14} /> : n}
                  </span>
                  <span className={`text-[10px] font-semibold ${active ? "text-blue-700" : "text-slate-400"}`}>{label}</span>
                </div>
                {n < STEPS.length && <div className={`h-0.5 flex-1 rounded-full ${step > n ? "bg-emerald-200" : "bg-slate-100"}`} />}
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {step === 1 && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <button type="button" onClick={() => setParentMode("select")}
                  className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                    parentMode === "select" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}>Pilih Orang Tua</button>
                <button type="button" onClick={() => setParentMode("create")}
                  className={`flex-1 rounded-xl border-2 px-3 py-2.5 text-sm font-bold transition-colors ${
                    parentMode === "create" ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-slate-50 text-slate-500"
                  }`}>Buat Baru</button>
              </div>

              {parentMode === "select" ? (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Cari Orang Tua</label>
                  <input value={parentSearch} onChange={(e) => setParentSearch(e.target.value)}
                    placeholder="Cari nama orang tua..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  {parentSearch && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                      {filteredParents.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-400">Tidak ditemukan</div>
                      ) : (
                        filteredParents.map((p) => (
                          <button key={p.id} onClick={() => setSelectedParentId(p.id)}
                            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-blue-50">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                              {p.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{p.fullName}</p>
                              <p className="text-[10px] text-slate-400">{p.user?.email ?? "—"}</p>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Nama Lengkap</label>
                    <input value={parentName} onChange={(e) => setParentName(e.target.value)} required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
                    <input type="email" value={parentEmail} onChange={(e) => setParentEmail(e.target.value)} required
                      className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 ${
                        parentEmailStatus === "taken" ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                          : parentEmailStatus === "available" ? "border-green-400 focus:border-green-400 focus:ring-green-100"
                            : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                      }`} />
                    {parentEmailStatus === "available" && <p className="mt-1 text-xs text-green-600">Email tersedia</p>}
                    {parentEmailStatus === "taken" && <p className="mt-1 text-xs text-red-600">Email sudah digunakan</p>}
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">No. HP</label>
                    <input value={parentPhone} onChange={(e) => setParentPhone(e.target.value)} required
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-600">Password</label>
                    <input type="password" value={parentPassword} onChange={(e) => setParentPassword(e.target.value)} required minLength={8}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama Lengkap <span className="text-red-500">*</span></label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama Panggilan <span className="text-red-500">*</span></label>
                  <input value={nickname} onChange={(e) => setNickname(e.target.value)} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tanggal Lahir <span className="text-red-500">*</span></label>
                  <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Kategori <span className="text-red-500">*</span></label>
                  <select value={categoryId} onChange={(e) => { setCategoryId(e.target.value); setSelectedCurriculumId(""); }} required
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={suggestedEmail || "email@contoh.com"}
                  className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none focus:ring-2 ${
                    studentEmailStatus === "taken" ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                      : studentEmailStatus === "available" ? "border-green-400 focus:border-green-400 focus:ring-green-100"
                        : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
                  }`} />
                {!email && suggestedEmail && <p className="mt-1 text-xs text-slate-400">Kosongkan untuk pakai {suggestedEmail}</p>}
                {studentEmailStatus === "available" && <p className="mt-1 text-xs text-green-600">Email tersedia</p>}
                {studentEmailStatus === "taken" && <p className="mt-1 text-xs text-red-600">Email sudah digunakan</p>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Password <span className="text-red-500">*</span></label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Sekolah (opsional)</label>
                  <input value={school} onChange={(e) => setSchool(e.target.value)} placeholder="Nama sekolah"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs text-blue-700">
                Kurikulum trial yang tersedia untuk <strong>{categoryLabel || "kategori terpilih"}</strong>. Siswa akan mendapat
                <strong> 1 pertemuan gratis</strong> (totalMeetPurchased = 1).
              </div>
              {trialCurriculums.length === 0 ? (
                <div className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700">
                  Tidak ada kurikulum trial untuk kategori ini.
                </div>
              ) : (
                trialCurriculums.map((c) => (
                  <button key={c.id} onClick={() => setSelectedCurriculumId(c.id)}
                    className={`flex w-full items-center gap-3 rounded-2xl border-2 px-4 py-3.5 text-left transition-colors ${
                      selectedCurriculumId === c.id ? "border-blue-500 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-slate-300"
                    }`}>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100">
                      <BookOpen size={18} className="text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-slate-900">{c.name}</p>
                      <p className="text-[11px] text-slate-500">{c.topics?.length ?? 0} topik · 1 pertemuan trial</p>
                    </div>
                    {selectedCurriculumId === c.id && <CheckCircle2 size={20} className="shrink-0 text-blue-600" />}
                  </button>
                ))
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Nama Kelas</label>
                <input value={selectedCurriculum ? `${selectedCurriculum.name} - Trial` : ""} readOnly
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-600" />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tutor <span className="text-red-500">*</span></label>
                <select value={selectedTutorId} onChange={(e) => {
                  setSelectedTutorId(e.target.value);
                  setSelectedSlot(null);
                  if (e.target.value) setSlotsLoading(true);
                  else setTutorSlots([]);
                }}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100">
                  <option value="">-- Pilih tutor --</option>
                  {tutors.map((t) => (
                    <option key={t.id} value={t.id}>{t.fullName}</option>
                  ))}
                </select>
              </div>

              {selectedTutorId && (
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-slate-700">Jam Kelas <span className="text-red-500">*</span></label>
                  {slotsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <span className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    </div>
                  ) : (
                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-xl border border-slate-200 p-3">
                      {SLOT_DAYS.map((day) => {
                        const daySlots = tutorSlots.filter((s) => s.dayOfWeek === day && !s.isDayoff && !s.isFilled);
                        if (daySlots.length === 0) return null;
                        return (
                          <div key={day} className="flex items-start gap-3">
                            <span className="w-14 shrink-0 pt-1.5 text-[11px] font-bold text-slate-600">{SLOT_DAY_LABELS[day]}</span>
                            <div className="flex flex-1 flex-wrap gap-1.5">
                              {SLOT_HOURS.map((hour) => {
                                const start = fmt(hour);
                                const slot = daySlots.find((s) => s.startTime === start);
                                if (!slot || !isInRange(day, hour)) return null;
                                const isSel = selectedSlot?.dayOfWeek === day && selectedSlot?.startTime === start;
                                return (
                                  <button key={start} type="button"
                                    onClick={() => setSelectedSlot({ dayOfWeek: day, startTime: start, endTime: slot.endTime })}
                                    className={`rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                                      isSel ? "bg-blue-600 text-white" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                    }`}>
                                    {start}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                      {selectedTutorId && tutorSlots.filter((s) => !s.isDayoff && !s.isFilled).length === 0 && (
                        <p className="text-xs text-slate-400 text-center py-4">Tutor ini tidak punya slot tersedia.</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-700">Tanggal Mulai <span className="text-red-500">*</span></label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
              </div>

              {selectedCurriculum && (
                <div className="rounded-2xl bg-slate-50 p-4 text-xs text-slate-600">
                  <p className="mb-1 flex items-center gap-1.5 font-bold text-slate-800">
                    <Clock size={13} /> Ringkasan
                  </p>
                  <p>Kelas: <strong>{selectedCurriculum.name} - Trial</strong> (TRIAL, 1 jadwal)</p>
                  <p>Kurikulum: <strong>{selectedCurriculum.name}</strong></p>
                  {selectedSlot && <p>Jam: <strong>{SLOT_DAY_LABELS[selectedSlot.dayOfWeek]} {selectedSlot.startTime}-{selectedSlot.endTime}</strong></p>}
                  {meetingDate && <p>Pertemuan: <strong>{meetingDate}</strong></p>}
                  <p>Enrollment: <strong>1 pertemuan (totalMeetPurchased = 1)</strong></p>
                </div>
              )}
            </div>
          )}

          {submitError && (
            <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{submitError}</div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between">
          <button type="button" onClick={step > 1 ? goBack : onClose}
            className="inline-flex items-center gap-1 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-500 hover:bg-slate-100 transition-colors">
            <ChevronLeft size={16} /> {step > 1 ? "Kembali" : "Batal"}
          </button>

          {step < 4 ? (
            <button type="button" onClick={goNext} disabled={!canNext}
              className="inline-flex items-center gap-1 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 transition-colors">
              Lanjut <ChevronRight size={16} />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit} disabled={!step4Valid || submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-40 transition-colors">
              {submitting ? (
                <>
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Membuat...
                </>
              ) : (
                <>
                  <UserPlus size={16} /> Buat Trial
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
