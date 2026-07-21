"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

type NavProps = {
  userEmail?: string | null;
  onLogout?: () => Promise<void>;
};

export function Nav({ userEmail, onLogout }: NavProps) {
  return (
    <header className="flex items-center justify-between rounded-3xl border border-white/20 bg-white/80 px-6 py-4 shadow-lg backdrop-blur-xl">
      <Link href="/">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">
            LMS Coding
          </span>
          <p className="text-sm text-gray-600">Belajar Coding Bareng</p>
        </div>
      </Link>
      <div className="flex items-center gap-3">
        {userEmail ? (
          <>
            <span className="hidden rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-xs font-medium text-indigo-700 sm:inline-flex">
              {userEmail}
            </span>
            <Button variant="danger" onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : (
          <>
            <Link href="/login">
              <Button variant="secondary" type="button">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button type="button">Register</Button>
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
