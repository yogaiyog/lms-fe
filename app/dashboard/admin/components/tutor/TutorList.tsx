"use client";

type TutorItem = {
  id: string;
  fullName: string;
  phone: string;
  email?: string;
  bio?: string | null;
};

type Props = {
  tutors: TutorItem[];
  onSelect: (tutor: TutorItem) => void;
};

export default function TutorList({ tutors, onSelect }: Props) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      {tutors.length === 0 ? (
        <div className="p-6 text-center"><p className="text-slate-500">Belum ada tutor</p></div>
      ) : (
        <div className="overflow-x-auto p-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Nama</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Email</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">No. HP</th>
                <th className="border-b border-slate-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Bio</th>
              </tr>
            </thead>
            <tbody>
              {tutors.map((t) => (
                <tr key={t.id} onClick={() => onSelect(t)}
                  className="border-b border-slate-100 last:border-0 cursor-pointer hover:bg-blue-50">
                  <td className="px-3 py-3 font-semibold text-slate-900">{t.fullName}</td>
                  <td className="px-3 py-3 text-slate-600">{t.email ?? "—"}</td>
                  <td className="px-3 py-3 text-slate-600">{t.phone}</td>
                  <td className="px-3 py-3 text-xs text-slate-400">{t.bio ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
