// src/hooks/useTheme.js
import { useEffect, useState } from "react";

export function useTheme() {
  // initial theme: saved choice if present, otherwise system preference, fallback to light
  const [dark, setDark] = useState(() => {
    try {
      const stored = localStorage.getItem("theme");
      if (stored === "dark") return true;
      if (stored === "light") return false;
      return (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      );
    } catch {
      return false;
    }
  });

  // apply theme attribute and persist choice
  useEffect(() => {
    const theme = dark ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {}
  }, [dark]);

  // expose state and setter
  return { dark, setDark };
}
