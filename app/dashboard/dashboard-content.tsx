"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getStoredSession } from "@/lib/api";
import { PageLoader } from "@/components/ui";

const ROLE_HOME: Record<string, string> = {
  ADMIN: "/dashboard/admin",
  TUTOR: "/dashboard/tutor",
  PARENT: "/dashboard/parent",
  STUDENT: "/dashboard/student",
};

/**
 * /dashboard hanya mengarahkan ke dashboard sesuai peran.
 * (Dulu file ini berisi ±850 baris UI parent lama yang tidak pernah tampil,
 * karena semua peran sudah di-redirect sebelum UI tersebut dirender.)
 */
export default function DashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    const session = getStoredSession();
    const target = session ? ROLE_HOME[session.user.role] : undefined;
    if (!target) {
      clearSession();
      router.replace("/login");
      return;
    }
    router.replace(target);
  }, [router]);

  return <PageLoader label="Mengarahkan ke dashboard…" />;
}
