"use client";

import { useEffect } from "react";
import { useApp } from "@/components/providers/AppProvider";

export function ThemeSync() {
  const { data, ready } = useApp();

  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    const pref = data.preferences.theme;
    const apply = (dark: boolean) => root.classList.toggle("dark", dark);

    if (pref === "dark") apply(true);
    else if (pref === "light") apply(false);
    else apply(window.matchMedia("(prefers-color-scheme: dark)").matches);

    if (pref !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => apply(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [data.preferences.theme, ready]);

  return null;
}
