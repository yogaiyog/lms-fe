"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "lms.darkMode";

/** Preferensi mode gelap per perangkat (disimpan di localStorage, aman bila storage diblokir). */
export function useDarkMode() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- baca preferensi sekali setelah mount (localStorage tidak ada di SSR)
      setDark(window.localStorage.getItem(KEY) === "1");
    } catch {
      // storage tidak tersedia — pakai mode terang
    }
  }, []);

  const toggle = useCallback(() => {
    setDark((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(KEY, next ? "1" : "0");
      } catch {
        // abaikan
      }
      return next;
    });
  }, []);

  return { dark, toggle };
}
