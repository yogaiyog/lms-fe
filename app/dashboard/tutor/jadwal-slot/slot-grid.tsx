"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  api,
  clearSession,
  getStoredSession,
  type AuthUser,
  type TutorSlot,
} from "@/lib/api";

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jumat",
  SATURDAY: "Sabtu",
  SUNDAY: "Minggu",
};

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const HOURS = Array.from({ length: 13 }, (_, i) => i + 9); // 09:00 - 21:00

function fmt(h: number) {
  return `${String(h).padStart(2, "0")}:00`;
}

function isInRange(day: string, hour: number) {
  const idx = DAYS.indexOf(day);
  if (hour < 9 || hour >= 21) return false;
  if (idx < 5 && hour < 15) return false;
  return true;
}

export default function SlotGrid() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [slots, setSlots] = useState<TutorSlot[]>([]);
  const [dayoffs, setDayoffs] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const session = getStoredSession();
    if (!session) {
      router.replace("/login");
      return;
    }
    loadData();
  }, [router]);

  async function loadData() {
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
    } catch {
      clearSession();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  }

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
      <div className="flex min-h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)" }}>
        <span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(135deg, #32095d 0%, #4a0e8b 50%, #6312ba 100%)" }}>
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Atur Jadwal Slot</h1>
            <p className="text-sm text-white/80">Klik cell untuk mengaktifkan / menonaktifkan slot</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/tutor" className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20">
              Kembali
            </Link>
            <button onClick={logout} className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>

        {/* Dayoff info */}
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-md">
          <p className="text-sm text-gray-600">
            Day Off:{" "}
            <span className="font-semibold text-gray-800">
              {dayoffs.length > 0
                ? dayoffs.map((d) => DAY_LABELS[DAYS[d]]).join(" & ")
                : "-"}
            </span>
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-berry-lipstick-50 p-3 text-sm text-berry-lipstick-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto rounded-2xl bg-white shadow-md">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 border-r border-b border-gray-200 bg-gray-50 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                  Jam
                </th>
                {DAYS.map((day) => (
                  <th key={day} className="border-b border-gray-200 bg-gray-50 px-2 py-3 text-center text-xs font-semibold text-gray-500">
                    {DAY_LABELS[day]}
                    {isDayoff(day) && <span className="ml-1 text-berry-lipstick-500">(off)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HOURS.map((hour) => (
                <tr key={hour}>
                  <td className="sticky left-0 z-10 border-r border-b border-gray-200 bg-white px-3 py-3 text-xs font-medium text-gray-600">
                    {fmt(hour)}-{fmt(hour + 1)}
                  </td>
                  {DAYS.map((day) => {
                    const slot = getSlot(day, hour);
                    const inRange = isInRange(day, hour);
                    const dayOff = isDayoff(day);
                    const key = `${day}-${hour}`;
                    const isToggling = toggling === key;

                    let bg = "bg-gray-50";
                    let text = "text-gray-300";
                    let label = "\u2014";
                    let cursor = "cursor-default";

                    if (!inRange) {
                      bg = "bg-gray-100";
                      text = "text-gray-300";
                      label = "\u2014";
                    } else if (dayOff) {
                      bg = "bg-berry-lipstick-50";
                      text = "text-berry-lipstick-400";
                      label = "Day Off";
                    } else if (slot) {
                      if (slot.isFilled) {
                        bg = "bg-dark-amethyst-100";
                        text = "text-dark-amethyst-700 font-semibold";
                        label = "Terisi";
                        cursor = "cursor-not-allowed";
                      } else {
                        bg = "bg-tea-green-100";
                        text = "text-tea-green-700";
                        label = "Aktif";
                        cursor = "cursor-pointer hover:bg-tea-green-200";
                      }
                    } else {
                      bg = "bg-white border border-dashed border-gray-200";
                      text = "text-gray-400";
                      label = "+";
                      cursor = "cursor-pointer hover:bg-gray-100";
                    }

                    return (
                      <td
                        key={day}
                        className={`border-b border-gray-200 px-2 py-3 text-center text-xs transition ${bg} ${cursor}`}
                        onClick={() => {
                          if (!inRange || dayOff || slot?.isFilled || isToggling) return;
                          toggle(day, hour);
                        }}
                      >
                        {isToggling ? (
                          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
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

        <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-white/80">
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-tea-green-100" />
            <span>Aktif</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-dark-amethyst-100" />
            <span>Terisi Kelas</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded border border-dashed border-gray-300 bg-white" />
            <span>Nonaktif (klik untuk aktifkan)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-berry-lipstick-50" />
            <span>Day Off</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-3 w-3 rounded bg-gray-100" />
            <span>Di luar jam kerja</span>
          </div>
          <div className={`ml-auto font-medium ${activeCount < 21 ? "text-berry-lipstick-300" : "text-white"}`}>
            {activeCount} slot aktif {activeCount < 21 ? "(minimal 21!)" : `(${filledCount} terisi)`}
          </div>
        </div>
      </div>
    </div>
  );
}
