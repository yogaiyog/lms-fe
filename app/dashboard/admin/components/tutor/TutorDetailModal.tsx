"use client";

import { useEffect, useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { api, type TutorSlot } from "@/lib/api";

type TutorItem = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  bio?: string | null;
};

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin", TUESDAY: "Selasa", WEDNESDAY: "Rabu",
  THURSDAY: "Kamis", FRIDAY: "Jumat", SATURDAY: "Sabtu", SUNDAY: "Minggu",
};
const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 9);
function fmt(h: number) { return `${String(h).padStart(2, "0")}:00`; }
function isInRange(day: string, hour: number, restrictWeekdayMorning: boolean) {
  const idx = DAYS.indexOf(day);
  if (hour < 9 || hour >= 21) return false;
  if (restrictWeekdayMorning && idx < 5 && hour < 15) return false;
  return true;
}

type Props = {
  tutor: TutorItem;
  onClose: () => void;
  onSaved: () => void;
};

export default function TutorDetailModal({ tutor, onClose, onSaved }: Props) {
  const [fullName, setFullName] = useState(tutor.fullName);
  const [phone, setPhone] = useState(tutor.phone);
  const [email, setEmail] = useState(tutor.email ?? "");
  const [bio, setBio] = useState(tutor.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [slots, setSlots] = useState<TutorSlot[]>([]);
  const [dayoffs, setDayoffs] = useState<number[]>([]);
  const [restrictWeekdayMorning, setRestrictWeekdayMorning] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    api.tutorSlots.list(tutor.id).then((res) => {
      setSlots(res.slots);
      setDayoffs(res.dayoffs);
      setRestrictWeekdayMorning(res.restrictWeekdayMorning ?? false);
    }).catch(() => {}).finally(() => setSlotsLoading(false));
  }, [tutor.id]);

  function isDayoff(day: string) {
    return dayoffs.includes(DAYS.indexOf(day));
  }

  function getSlot(day: string, hour: number): TutorSlot | undefined {
    return slots.find((s) => s.dayOfWeek === day && s.startTime === fmt(hour));
  }

  async function toggle(day: string, hour: number) {
    const key = `${day}-${hour}`;
    setToggling(key);
    try {
      await api.tutorSlots.toggle(tutor.id, day, fmt(hour));
      const res = await api.tutorSlots.list(tutor.id);
      setSlots(res.slots);
      setDayoffs(res.dayoffs);
      setRestrictWeekdayMorning(res.restrictWeekdayMorning ?? false);
    } catch {} finally {
      setToggling(null);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.tutorProfiles.update(tutor.id, { fullName, phone, bio: bio || null });
      if (email !== (tutor.email ?? "")) {
        await api.users.update((await api.tutorProfiles.list()).find((t) => t.id === tutor.id)?.userId ?? "", { email });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-6 overflow-y-auto">
      <div className="relative w-full max-w-4xl rounded-3xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-extrabold tracking-tight text-slate-900">Detail Tutor</h2>
          <button onClick={onClose} className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Left: Edit Form */}
          <form onSubmit={handleSave} className="space-y-4">
            <h3 className="text-sm font-bold text-slate-700">Informasi Tutor</h3>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Nama Lengkap</label>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">No. HP</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">Bio</label>
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 resize-none" />
            </div>
            {error && <div className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
            <button type="submit" disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50 transition">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              Simpan
            </button>
          </form>

          {/* Right: Slot Grid */}
          <div>
            <h3 className="mb-3 text-sm font-bold text-slate-700">Atur Slot Jadwal</h3>
            {slotsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 size={24} className="animate-spin text-slate-400" />
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr>
                      <th className="sticky left-0 z-10 border-r border-b border-slate-200 bg-slate-50 px-1 py-2 text-left text-[9px] font-semibold uppercase text-slate-500">Jam</th>
                      {DAYS.map((day) => (
                        <th key={day} className="border-b border-slate-200 bg-slate-50 px-1 py-2 text-center text-[9px] font-semibold text-slate-500">
                          {DAY_LABELS[day]}
                          {isDayoff(day) && <span className="ml-0.5 text-red-500">(off)</span>}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {HOURS.map((hour) => (
                      <tr key={hour}>
                        <td className="sticky left-0 z-10 border-r border-b border-slate-200 bg-white px-1 py-2 text-[9px] font-medium text-slate-600">
                          {fmt(hour)}
                        </td>
                        {DAYS.map((day) => {
                          const slot = getSlot(day, hour);
                          const inRange = isInRange(day, hour, restrictWeekdayMorning);
                          const dayOff = isDayoff(day);
                          const key = `${day}-${hour}`;
                          const isToggling = toggling === key;

                          let bg = "bg-slate-50", text = "text-slate-300", label = "\u2014", cursor = "cursor-default";
                          if (!inRange) { bg = "bg-slate-100"; text = "text-slate-300"; label = "\u2014"; }
                          else if (dayOff) { bg = "bg-red-50"; text = "text-red-400"; label = "Off"; }
                          else if (slot) {
                            if (slot.isFilled) { bg = "bg-blue-100"; text = "text-blue-700 font-semibold"; label = "Terisi"; cursor = "cursor-not-allowed"; }
                            else { bg = "bg-emerald-100"; text = "text-emerald-700"; label = "Aktif"; cursor = "cursor-pointer hover:bg-emerald-200"; }
                          } else { bg = "bg-white border border-dashed border-slate-200"; text = "text-slate-400"; label = "+"; cursor = "cursor-pointer hover:bg-slate-100"; }

                          return (
                            <td key={day}
                              className={`border-b border-slate-200 px-1 py-2 text-center transition ${bg} ${cursor}`}
                              onClick={() => { if (!inRange || dayOff || slot?.isFilled || isToggling) return; toggle(day, hour); }}>
                              {isToggling ? <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" /> : <span className={`inline-block rounded px-1 py-0.5 ${text}`}>{label}</span>}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
