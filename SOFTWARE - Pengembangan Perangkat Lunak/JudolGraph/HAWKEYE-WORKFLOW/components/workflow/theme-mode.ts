"use client";

import { useSyncExternalStore } from "react";

export type ThemeMode = "dark" | "light";

const STORAGE_KEY = "hawkeye-workflow-theme";
const THEME_CHANGE_EVENT = "hawkeye-workflow-theme-change";

function getThemeSnapshot(): ThemeMode {
  if (typeof window === "undefined") return "dark";

  const storedTheme = window.localStorage.getItem(STORAGE_KEY);

  if (storedTheme === "light") return "light";
  if (storedTheme === "dark") return "dark";

  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

function subscribeToTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const observer = new MutationObserver(callback);

  observer.observe(document.documentElement, {
    attributeFilter: ["class"],
    attributes: true,
  });
  window.addEventListener("storage", callback);
  window.addEventListener(THEME_CHANGE_EVENT, callback);

  return () => {
    observer.disconnect();
    window.removeEventListener("storage", callback);
    window.removeEventListener(THEME_CHANGE_EVENT, callback);
  };
}

export function useThemeMode(): ThemeMode {
  return useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "dark");
}

export function setThemeMode(theme: ThemeMode) {
  window.localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
  window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
}
