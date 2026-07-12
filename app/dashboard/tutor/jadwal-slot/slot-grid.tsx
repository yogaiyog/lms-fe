"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";
import {
  api,
  clearSession,
  getStoredSession,
  type AuthUser,
  type TutorSlot,
} from "@/lib/api";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin", TUESDAY: "Selasa", WEDNESDAY: "Rabu",
  THURSDAY: "Kamis", FRIDAY: "Jumat", SATURDAY: "Sabtu", SUNDAY: "Minggu",
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9);

function fmt(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function isInRange(day: string, hour: number, restrictWeekdayMorning: boolean) {
  const idx = DAYS.indexOf(day);
  if (hour < 9 || hour >= 21) return false;
  if (restrictWeekdayMorning && idx < 5 && hour < 15) return false;
  return true;
}

export default function SlotGrid() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [slots, setSlots] = useState<TutorSlot[]>([]);
  const [dayoffs, setDayoffs] = useState<number[]>([]);
  const [restrictWeekdayMorning, setRestrictWeekdayMorning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    (async () => {
      try {
        const me = await api.auth.me();
        setUser(me);

        if (me.role !== "TUTOR" || !me.tutorProfile) {
          router.replace("/dashboard");
          return;
        }

        const res = await api.tutorSlots.list(me.tutorProfile.id);
        setSlots(res.slots);
        setDayoffs(res.dayoffs);
        setRestrictWeekdayMorning(res.restrictWeekdayMorning ?? false);
      } catch {
        clearSession();
        router.replace("/login");
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  function isDayoff(day: string) {
    return dayoffs.includes(DAYS.indexOf(day));
  }

  function getSlot(day: string, hour: number): TutorSlot | undefined {
    return slots.find((s) => s.dayOfWeek === day && s.startTime === fmt(hour));
  }

  async function toggle(day: string, hour: number) {
    if (!user?.tutorProfile) return;
    const key = `${day}-${hour}`;
    setToggling(key);
    setError("");
    try {
      await api.tutorSlots.toggle(user.tutorProfile.id, day, fmt(hour));
      const res = await api.tutorSlots.list(user.tutorProfile.id);
      setSlots(res.slots);
      setDayoffs(res.dayoffs);
      setRestrictWeekdayMorning(res.restrictWeekdayMorning ?? false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal toggle slot");
    } finally {
      setToggling(null);
    }
  }

  async function logout() {
    await api.auth.logout();
    router.push("/login");
  }

  const dayoffSet = new Set(dayoffs);
  const activeSlots = slots.filter((s) => !dayoffSet.has(DAYS.indexOf(s.dayOfWeek)));
  const activeCount = activeSlots.length;
  const filledCount = activeSlots.filter((s) => s.isFilled).length;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard/tutor"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
              <ArrowLeft size={18} />
            </Link>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Atur Jadwal Slot</h1>
              <p className="mt-1 text-sm text-slate-500">Klik cell untuk mengaktifkan/menonaktifkan slot</p>
            </div>
          </div>
          <button onClick={logout}
            className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
            <LogOut size={18} />
          </button>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-4 mb-4">
          <p className="text-sm text-slate-600">
            Day Off:{" "}
            <span className="font-bold text-slate-900">
              {dayoffs.length > 0
                ? dayoffs.map((d) => DAY_LABELS[DAYS[d]]).join(" & ")
                : "-"}
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 border-r border-b border-slate-200 bg-slate-50 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Jam
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="border-b border-slate-200 bg-slate-50 px-2 py-3 text-center text-xs font-semibold text-slate-500">
                    {DAY_LABELS[day]}
                    {isDayoff(day) && <span className="ml-1 text-red-500">(off)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour}>
                  <td className="sticky left-0 z-10 border-r border-b border-slate-200 bg-white px-3 py-3 text-xs font-medium text-slate-600">
                    {fmt(hour)}-{fmt(hour + 1)}
                  </td>
                  {DAYS.map((day) => {
                    const slot = getSlot(day, hour);
                    const inRange = isInRange(day, hour, restrictWeekdayMorning);
                    const dayOff = isDayoff(day);
                    const key = `${day}-${hour}`;
                    const isToggling = toggling === key;

                    let bg = "bg-slate-50";
                    let text = "text-slate-300";
                    let label = "\u2014";
                    let cursor = "cursor-default";

                    if (!inRange) {
                      bg = "bg-slate-100";
                      text = "text-slate-300";
                      label = "\u2014";
                    } else if (dayOff) {
                      bg = "bg-red-50";
                      text = "text-red-400";
                      label = "Day Off";
                    } else if (slot) {
                      if (slot.isFilled) {
                        bg = "bg-blue-100";
                        text = "text-blue-700 font-semibold";
                        label = "Terisi";
                        cursor = "cursor-not-allowed";
                      } else {
                        bg = "bg-emerald-100";
                        text = "text-emerald-700";
                        label = "Aktif";
                        cursor = "cursor-pointer hover:bg-emerald-200";
                      }
                    } else {
                      bg = "bg-white border border-dashed border-slate-200";
                      text = "text-slate-400";
                      label = "+";
                      cursor = "cursor-pointer hover:bg-slate-100";
                    }

                    return (
                      <td key={day}
                        className={`border-b border-slate-200 px-2 py-3 text-center text-xs transition ${bg} ${cursor}`}
                        onClick={() => {
                          if (!inRange || dayOff || slot?.isFilled || isToggling) return;
                          toggle(day, hour);
                        }}
                      >
                        {isToggling ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                        ) : (
                          <span className={`inline-block rounded-md px-2 py-1 ${text}`}>{label}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-emerald-100" />
            <span className="font-semibold">Aktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-blue-100" />
            <span className="font-semibold">Terisi Kelas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded border border-dashed border-slate-300 bg-white" />
            <span className="font-semibold">Nonaktif</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-red-50" />
            <span className="font-semibold">Day Off</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="inline-block h-3 w-3 rounded bg-slate-100" />
            <span className="font-semibold">Luar jam kerja</span>
          </div>
          <div className={`ml-auto font-bold ${activeCount < 21 ? "text-red-500" : "text-emerald-600"}`}>
            {activeCount} slot aktif {activeCount < 21 ? "(minimal 21!)" : `(${filledCount} terisi)`}
          </div>
        </div>
      </div>
    </div>
  );
}
