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
};

export default function TutorList({ tutors }: Props) {
  return (
    <div className="rounded-2xl bg-white shadow-md">
      {tutors.length === 0 ? (
        <div className="p-6 text-center"><p className="text-gray-500">Belum ada tutor</p></div>
      ) : (
        <div className="overflow-x-auto p-2">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-gray-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Nama</th>
                <th className="border-b border-gray-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Email</th>
                <th className="border-b border-gray-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">No. HP</th>
                <th className="border-b border-gray-200 px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Bio</th>
              </tr>
            </thead>
            <tbody>
              {tutors.map((t) => (
                <tr key={t.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50">
                  <td className="px-3 py-3 font-medium text-gray-800">{t.fullName}</td>
                  <td className="px-3 py-3 text-gray-600">{t.email ?? "—"}</td>
                  <td className="px-3 py-3 text-gray-600">{t.phone}</td>
                  <td className="px-3 py-3 text-xs text-gray-400">{t.bio ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
