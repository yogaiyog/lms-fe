"use client";

import { useState, useRef, type FormEvent } from "react";
import { checkEmail } from "@/lib/api";
import type { Category, ParentProfile } from "@/lib/api";

type Props = {
  categories: Category[];
  parents: ParentProfile[];
  registering: boolean;
  registerError: string;
  onCreateParent: (payload: {
    email: string;
    password: string;
    fullName: string;
    phone: string;
  }) => Promise<string>;
  onSubmit: (payload: {
    parentId: string;
    email: string;
    password: string;
    fullName: string;
    nickname: string;
    birthDate: string;
    categoryId?: string | null;
    school?: string | null;
  }) => void;
};

export default function AddStudentForm({
  categories,
  parents,
  registering,
  registerError,
  onCreateParent,
  onSubmit,
}: Props) {
  const [parentMode, setParentMode] = useState<"select" | "create">("select");
  const [parentSearch, setParentSearch] = useState("");
  const [selectedParentId, setSelectedParentId] = useState("");

  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [parentPassword, setParentPassword] = useState("");
  const [parentCreating, setParentCreating] = useState(false);
  const [parentCreateError, setParentCreateError] = useState("");

  const [fullName, setFullName] = useState("");
  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [school, setSchool] = useState("");

  const [emailStatus, setEmailStatus] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const emailTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const filteredParents = parents.filter((p) =>
    p.fullName.toLowerCase().includes(parentSearch.toLowerCase()),
  );

  const selectedParent = parents.find((p) => p.id === selectedParentId);

  function handleEmailChange(val: string) {
    setEmail(val);
    if (emailTimer.current) clearTimeout(emailTimer.current);
    if (!val) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    emailTimer.current = setTimeout(async () => {
      const available = await checkEmail(val);
      setEmailStatus(available ? "available" : "taken");
    }, 500);
  }

  async function handleCreateParent(e: FormEvent) {
    e.preventDefault();
    setParentCreating(true);
    setParentCreateError("");
    try {
      const parentId = await onCreateParent({
        email: parentEmail,
        password: parentPassword,
        fullName: parentName,
        phone: parentPhone,
      });
      setSelectedParentId(parentId);
      setParentMode("select");
      setParentName("");
      setParentEmail("");
      setParentPhone("");
      setParentPassword("");
    } catch (err) {
      setParentCreateError(
        err instanceof Error ? err.message : "Gagal membuat orang tua",
      );
    } finally {
      setParentCreating(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selectedParentId) return;
    onSubmit({
      parentId: selectedParentId,
      email,
      password,
      fullName,
      nickname,
      birthDate,
      categoryId: categoryId || null,
      school: school || null,
    });
  }

  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6 sm:p-7">
      <h2 className="mb-6 text-lg font-extrabold tracking-tight text-slate-900">
        Tambah Siswa Baru
      </h2>

      <div className="mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <h3 className="mb-3 text-sm font-bold text-slate-700">
          Data Orang Tua <span className="text-red-500">*</span>
        </h3>

        {parentMode === "select" ? (
          <>
            {selectedParent ? (
              <div className="mb-3 flex items-center justify-between rounded-xl bg-white p-3 shadow-sm">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedParent.fullName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedParent.user?.email ?? "—"} ·{" "}
                    {selectedParent.phone}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedParentId("");
                    setParentSearch("");
                  }}
                  className="rounded-lg p-1.5 text-xs font-semibold text-red-500 hover:bg-red-50"
                >
                  Ganti
                </button>
              </div>
            ) : (
              <>
                <input
                  value={parentSearch}
                  onChange={(e) => setParentSearch(e.target.value)}
                  placeholder="Cari nama orang tua..."
                  className="mb-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                />
                {parentSearch && (
                  <div className="mb-2 max-h-40 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-sm">
                    {filteredParents.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        Tidak ditemukan
                      </div>
                    ) : (
                      filteredParents.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => setSelectedParentId(p.id)}
                          className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-blue-50"
                        >
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-700">
                            {p.fullName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900">
                              {p.fullName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {p.user?.email ?? "—"}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
            <button
              onClick={() => {
                setParentMode("create");
                setParentCreateError("");
              }}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              + Buat Orang Tua Baru
            </button>
          </>
        ) : (
          <form onSubmit={handleCreateParent} className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Nama Lengkap
              </label>
              <input
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Email
              </label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                No. HP
              </label>
              <input
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-slate-600">
                Password
              </label>
              <input
                type="password"
                value={parentPassword}
                onChange={(e) => setParentPassword(e.target.value)}
                required
                minLength={8}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              />
            </div>
            {parentCreateError && (
              <div className="rounded-xl bg-red-50 p-2.5 text-xs font-semibold text-red-700">
                {parentCreateError}
              </div>
            )}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setParentMode("select")}
                className="rounded-xl px-3 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={parentCreating}
                className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
              >
                {parentCreating ? "Menyimpan..." : "Simpan Orang Tua"}
              </button>
            </div>
          </form>
        )}
      </div>

      {selectedParentId && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border-t border-slate-200 pt-6">
            <h3 className="mb-4 text-sm font-bold text-slate-700">
              Data Siswa
            </h3>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Nama Panggilan <span className="text-red-500">*</span>
            </label>
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              required
              placeholder="email@contoh.com"
              className={`w-full rounded-xl border bg-slate-50 px-4 py-3 text-sm outline-none transition focus:ring-2 ${
                emailStatus === "taken"
                  ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                  : emailStatus === "available"
                    ? "border-green-400 focus:border-green-400 focus:ring-green-100"
                    : "border-slate-200 focus:border-blue-400 focus:ring-blue-100"
              }`}
            />
            {emailStatus === "checking" && (
              <p className="mt-1 text-xs text-slate-400">
                Memeriksa email...
              </p>
            )}
            {emailStatus === "available" && (
              <p className="mt-1 text-xs text-green-600">Email tersedia</p>
            )}
            {emailStatus === "taken" && (
              <p className="mt-1 text-xs text-red-600">
                Email sudah digunakan
              </p>
            )}
            {emailStatus === "idle" && nickname && (
              <p className="mt-1 text-xs text-slate-400">
                Jika belum punya email, gunakan{" "}
                {nickname.toLowerCase()}@email.com
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Tanggal Lahir <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Kategori <span className="text-red-500">*</span>
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            >
              <option value="">-- Pilih Kategori --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">
              Sekolah (opsional)
            </label>
            <input
              value={school}
              onChange={(e) => setSchool(e.target.value)}
              placeholder="Nama sekolah"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {registerError && (
            <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
              {registerError}
            </div>
          )}

          <button
            type="submit"
            disabled={
              registering ||
              emailStatus === "taken" ||
              emailStatus === "checking"
            }
            className="w-full rounded-2xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm shadow-blue-600/30 hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {registering ? (
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Mendaftarkan...
              </span>
            ) : (
              "Tambah Siswa"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
