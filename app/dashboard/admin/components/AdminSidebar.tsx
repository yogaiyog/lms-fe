"use client";

type Props = {
  mainMenu: "classes" | "tutors" | "curriculums" | "students";
  segment: "classes" | "requests" | "create";
  onSegmentChange: (seg: Props["segment"]) => void;
  tutorSegment: "list" | "add";
  onTutorSegmentChange: (seg: Props["tutorSegment"]) => void;
};

export default function AdminSidebar({ mainMenu, segment, onSegmentChange, tutorSegment, onTutorSegmentChange }: Props) {
  return (
    <aside className="w-56 shrink-0">
      <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-2">
        {mainMenu === "classes" && (
          <div className="flex flex-col gap-1">
            {(["classes", "requests", "create"] as const).map((seg) => (
              <button key={seg} onClick={() => onSegmentChange(seg)}
                className={`rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                  segment === seg ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {seg === "classes" ? "Daftar Kelas" : seg === "requests" ? "Request Kelas" : "Buat Kelas"}
              </button>
            ))}
          </div>
        )}
        {mainMenu === "tutors" && (
          <div className="flex flex-col gap-1">
            {(["list", "add"] as const).map((seg) => (
              <button key={seg} onClick={() => onTutorSegmentChange(seg)}
                className={`rounded-2xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${
                  tutorSegment === seg ? "bg-blue-600 text-white shadow-sm shadow-blue-600/30" : "text-slate-500 hover:bg-blue-50 hover:text-blue-700"
                }`}
              >
                {seg === "list" ? "Daftar Tutor" : "Tambah Tutor"}
              </button>
            ))}
          </div>
        )}
        {mainMenu === "curriculums" && (
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-400">Daftar Kurikulum</div>
          </div>
        )}
        {mainMenu === "students" && (
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-sm font-semibold text-slate-400">Daftar Student</div>
          </div>
        )}
      </div>
    </aside>
  );
}
