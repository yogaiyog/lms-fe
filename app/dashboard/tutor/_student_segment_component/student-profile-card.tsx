"use client";

import { User, CheckCircle } from "lucide-react";
import type { Theme } from "./types";
import { Card } from "./components";

export default function StudentProfileCard({
  theme, student, totalPresent,
}: {
  theme: Theme;
  student: { nickname?: string; fullName: string };
  totalPresent: number;
}) {
  return (
    <Card theme={theme} className="p-6">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${theme.dark ? "bg-slate-800" : "bg-blue-50"}`}>
            <User size={32} className="text-blue-600" />
          </div>
          <div>
            <h2 className={`text-xl font-extrabold ${theme.text}`}>{student.nickname || student.fullName}</h2>
            <p className={`text-sm ${theme.textMuted}`}>{student.fullName}</p>
          </div>
        </div>
        {/* <div className="flex justify-center"> */}
          {/* <div className={`inline-flex items-center gap-3 px-5 py-3 rounded-xl ${theme.dark ? "bg-slate-800" : "bg-slate-50"}`}>
            <CheckCircle size={20} className="text-blue-500" />
            <div>
              <p className={`text-lg font-extrabold ${theme.text}`}>{totalPresent}</p>
              <p className={`text-[10px] font-semibold ${theme.textMuted}`}>Hadir</p>
            </div>
          </div> */}
        {/* </div> */}
      </div>
    </Card>
  );
}
