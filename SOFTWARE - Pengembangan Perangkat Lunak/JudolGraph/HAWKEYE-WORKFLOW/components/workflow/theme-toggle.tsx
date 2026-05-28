"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

const STORAGE_KEY = "hawkeye-workflow-theme";

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(STORAGE_KEY);
    const nextTheme = storedTheme === "light" ? "light" : "dark";

    setTheme(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }, []);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";

    setTheme(nextTheme);
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
  }

  const darkMode = theme === "dark";

  return (
    <Button
      aria-label={darkMode ? "Gunakan mode terang" : "Gunakan mode gelap"}
      className={cn(compact ? "size-11" : "h-11 w-full justify-start gap-3 text-base")}
      onClick={toggleTheme}
      size={compact ? "icon" : "default"}
      type="button"
      variant="outline"
    >
      {darkMode ? <Sun aria-hidden size={22} /> : <Moon aria-hidden size={22} />}
      {compact ? null : darkMode ? "Mode terang" : "Mode gelap"}
    </Button>
  );
}
