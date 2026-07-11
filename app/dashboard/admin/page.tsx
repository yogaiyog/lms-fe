import { Suspense } from "react";
import AdminDashboard from "./admin-dashboard";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <AdminDashboard />
    </Suspense>
  );
}
