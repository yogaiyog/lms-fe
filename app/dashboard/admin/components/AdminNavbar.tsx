"use client";

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
    <nav className="flex items-center justify-between border-b border-white/10 bg-white/5 px-6 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-8">
        <span className="text-lg font-bold text-white">JTCourse Admin</span>
        <div className="flex gap-1">
          {items.map((item) => (
            <button key={item.key} onClick={() => onChange(item.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                mainMenu === item.key ? "bg-white text-dark-amethyst-700 shadow-sm" : "text-white/70 hover:text-white"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm text-white/60">{email}</span>
        <button onClick={onLogout} className="rounded-lg p-2 text-white/60 transition hover:bg-white/10 hover:text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
          </svg>
        </button>
      </div>
    </nav>
  );
}
