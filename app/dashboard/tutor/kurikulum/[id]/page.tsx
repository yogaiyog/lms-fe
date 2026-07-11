import CurriculumDetail from "./curriculum-detail";

export default function Page() {
  return <CurriculumDetail />;
}

export async function generateStaticParams() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
  try {
    const res = await fetch(`${baseUrl}/api/v1/academic/curriculums`);
    const json = await res.json();
    if (!json.success) return [];
    return json.data.map((c: { id: string }) => ({ id: c.id }));
  } catch {
    return [];
  }
}
