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
      <div className="rounded-2xl bg-white p-2 shadow-md">
        {mainMenu === "classes" && (
          <div className="flex flex-col gap-1 rounded-xl bg-gray-100 p-1">
            {(["classes", "requests", "create"] as const).map((seg) => (
              <button key={seg} onClick={() => onSegmentChange(seg)}
                className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                  segment === seg ? "bg-white text-dark-amethyst-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {seg === "classes" ? "Daftar Kelas" : seg === "requests" ? "Request Kelas" : "Buat Kelas"}
              </button>
            ))}
          </div>
        )}
        {mainMenu === "tutors" && (
          <div className="flex flex-col gap-1 rounded-xl bg-gray-100 p-1">
            {(["list", "add"] as const).map((seg) => (
              <button key={seg} onClick={() => onTutorSegmentChange(seg)}
                className={`rounded-lg px-4 py-2.5 text-left text-sm font-medium transition ${
                  tutorSegment === seg ? "bg-white text-dark-amethyst-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {seg === "list" ? "Daftar Tutor" : "Tambah Tutor"}
              </button>
            ))}
          </div>
        )}
        {mainMenu === "curriculums" && (
          <div className="rounded-xl bg-gray-100 p-1">
            <div className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400">Daftar Kurikulum</div>
          </div>
        )}
        {mainMenu === "students" && (
          <div className="rounded-xl bg-gray-100 p-1">
            <div className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-400">Daftar Student</div>
          </div>
        )}
      </div>
    </aside>
  );
}
