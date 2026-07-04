"use client";

import { LogOut } from "lucide-react";

type Props = {
  mainMenu: "classes" | "tutors" | "curriculums" | "students";
  onChange: (m: Props["mainMenu"]) => void;
  email?: string;
  onLogout: () => void;
};

const items: { key: Props["mainMenu"]; label: string }[] = [
  { key: "classes", label: "Kelas" },
  { key: "tutors", label: "Tutor" },
  { key: "curriculums", label: "Kurikulum" },
  { key: "students", label: "Student" },
];

export default function AdminNavbar({ mainMenu, onChange, email, onLogout }: Props) {
  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 backdrop-blur px-6 py-3">
      <div className="flex items-center gap-8">
        <span className="text-lg font-extrabold tracking-tight text-slate-900">JTCourse Admin</span>
        <div className="flex gap-1">
          {items.map((item) => (
            <button key={item.key} onClick={() => onChange(item.key)}
              className={`rounded-2xl px-4 py-2 text-sm font-semibold transition-colors ${
                mainMenu === item.key ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-slate-500">{email}</span>
        <button onClick={onLogout}
          className="flex h-9 w-9 items-center justify-center rounded-full text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut size={18} />
        </button>
      </div>
    </nav>
  );
}
