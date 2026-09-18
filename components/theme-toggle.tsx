"use client";

import { useLayoutEffect } from "react";

const THEME_KEY = "theme";

function applyTheme(root: HTMLElement, theme: "light" | "dark") {
  root.classList.toggle("dark", theme === "dark");
}

function readStoredTheme(): "light" | "dark" | null {
  try {
    const value = localStorage.getItem(THEME_KEY);
    return value === "dark" || value === "light" ? value : null;
  } catch {
    return null; // storage unavailable — fall back to system preference
  }
}

export function ThemeToggleShortcut() {
  useLayoutEffect(() => {
    const root = document.documentElement;

    // Re-sync after hydration: React may reset the class the pre-hydration
    // script added, so re-apply before first paint (Phase 2 hydration guard).
    const stored = readStoredTheme();
    const dark =
      stored !== null
        ? stored === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(root, dark ? "dark" : "light");

    const onKeyDown = (e: KeyboardEvent) => {
      // Phase 3 input-target guard: never toggle while typing in a form
      // field — 'd' is a common letter in emails/passwords.
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }
      // Phase 3 modifier guard: leave Cmd/Ctrl/Alt shortcuts (bookmark,
      // devtools, etc.) alone.
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.toLowerCase() !== "d") return;

      const next: "light" | "dark" = root.classList.contains("dark")
        ? "light"
        : "dark";
      applyTheme(root, next);
      try {
        localStorage.setItem(THEME_KEY, next);
      } catch {
        // Phase 2 degraded mode: storage write failed — theme still applies
        // for this session.
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return null;
}