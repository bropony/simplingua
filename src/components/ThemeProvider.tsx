"use client";

import { useEffect, useState } from "react";

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      const stored = localStorage.getItem("theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const theme = stored || (prefersDark ? "dark" : "light");

      if (theme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.classList.remove("simplingua");
      } else if (theme === "simplingua") {
        document.documentElement.classList.remove("dark");
        document.documentElement.classList.add("simplingua");
      } else {
        document.documentElement.classList.remove("dark", "simplingua");
      }
    };

    applyTheme();
    setMounted(true);

    // Listen for storage changes (theme toggle from settings page)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "theme") applyTheme();
    };
    window.addEventListener("storage", handleStorage);

    // Poll for same-tab theme changes (localStorage events don't fire in same tab)
    const interval = setInterval(applyTheme, 1000);

    return () => {
      window.removeEventListener("storage", handleStorage);
      clearInterval(interval);
    };
  }, []);

  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
